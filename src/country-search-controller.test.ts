import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCountrySearchController } from './country-search-controller';
import type { CountryCard } from './map-country-response';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('createCountrySearchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aborts the previous in-flight request on every input change, not only after debounce', async () => {
    const signals: AbortSignal[] = [];
    const searchFn = vi.fn((_query: string, signal: AbortSignal) => {
      signals.push(signal);
      return new Promise<CountryCard[]>(() => {});
    });

    const onStateChange = vi.fn();
    const controller = createCountrySearchController({
      searchFn,
      mapCountry: (raw) => raw as CountryCard,
      debounceMs: 300,
      timeoutMs: 10_000,
      onStateChange,
    });

    controller.setQuery('s');
    await vi.advanceTimersByTimeAsync(300);
    expect(searchFn).toHaveBeenCalledTimes(1);
    expect(signals[0]?.aborted).toBe(false);

    controller.setQuery('sp');
    expect(signals[0]?.aborted).toBe(true);

    controller.destroy();
  });

  it('keeps only the latest query result when an older response would arrive later (race)', async () => {
    const first = deferred<unknown[]>();
    const second = deferred<unknown[]>();

    const searchFn = vi.fn((query: string, signal: AbortSignal) => {
      const task = query === 'sp' ? first : second;

      return new Promise<unknown[]>((resolve, reject) => {
        const onAbort = () => {
          reject(new DOMException('Aborted', 'AbortError'));
        };

        if (signal.aborted) {
          onAbort();
          return;
        }

        signal.addEventListener('abort', onAbort, { once: true });

        task.promise.then(
          (value) => {
            signal.removeEventListener('abort', onAbort);
            resolve(value);
          },
          (error: unknown) => {
            signal.removeEventListener('abort', onAbort);
            reject(error);
          },
        );
      });
    });

    const states: unknown[] = [];
    const controller = createCountrySearchController({
      searchFn,
      mapCountry: (raw) => raw as CountryCard,
      debounceMs: 300,
      timeoutMs: 10_000,
      onStateChange: (state) => {
        states.push(state);
      },
    });

    controller.setQuery('sp');
    await vi.advanceTimersByTimeAsync(300);

    controller.setQuery('spain');
    await vi.advanceTimersByTimeAsync(300);

    second.resolve([{ name: 'Spain' }]);
    await Promise.resolve();
    first.resolve([{ name: 'Saint Pierre' }, { name: 'Spain' }]);
    await Promise.resolve();

    const last = states.at(-1);
    expect(last).toEqual({
      kind: 'results',
      items: [{ name: 'Spain' }],
    });
    expect(searchFn).toHaveBeenCalledTimes(2);

    controller.destroy();
  });

  it('does not show AbortError as a user-facing error', async () => {
    const searchFn = vi.fn((_query: string, signal: AbortSignal) => {
      return new Promise<unknown[]>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
          once: true,
        });
      });
    });

    const onStateChange = vi.fn();
    const controller = createCountrySearchController({
      searchFn,
      mapCountry: (raw) => raw as CountryCard,
      debounceMs: 300,
      timeoutMs: 10_000,
      onStateChange,
    });

    controller.setQuery('sp');
    await vi.advanceTimersByTimeAsync(300);
    controller.setQuery('spain');

    await Promise.resolve();

    expect(onStateChange).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));

    controller.destroy();
  });
});
