import { searchCountries } from './search-countries.js';

const cache = new Map<string, unknown[]>();
const inflight = new Map<string, Promise<unknown[]>>();

function cacheKey(query: string): string {
  return query.trim().toLowerCase();
}

function whenAborted(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    const rejectFromSignal = (): void => {
      const reason = signal.reason;
      if (reason instanceof Error) {
        reject(reason);
        return;
      }
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal.aborted) {
      rejectFromSignal();
      return;
    }

    signal.addEventListener('abort', rejectFromSignal, { once: true });
  });
}

export async function searchCountriesCached(
  query: string,
  signal: AbortSignal,
): Promise<unknown[]> {
  const key = cacheKey(query);

  if (cache.has(key)) {
    if (signal.aborted) {
      return whenAborted(signal);
    }
    return cache.get(key) as unknown[];
  }

  let pending = inflight.get(key);

  if (!pending) {
    // Shared network request is not tied to any single caller signal,
    // so one abort does not cancel the same in-flight promise for others.
    pending = searchCountries(query, new AbortController().signal)
      .then((data) => {
        cache.set(key, data);
        inflight.delete(key);
        return data;
      })
      .catch((error: unknown) => {
        inflight.delete(key);
        throw error;
      });

    inflight.set(key, pending);
  }

  return Promise.race([pending, whenAborted(signal)]);
}

export function clearSearchCache(): void {
  cache.clear();
  inflight.clear();
}
