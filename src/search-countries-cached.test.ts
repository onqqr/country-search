import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSearchCache, searchCountriesCached } from './search-countries-cached';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('searchCountriesCached', () => {
  afterEach(() => {
    clearSearchCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('caches successful responses by query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ name: 'Spain' }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await searchCountriesCached('Spain', new AbortController().signal);
    const second = await searchCountriesCached('spain', new AbortController().signal);

    expect(first).toEqual([{ name: 'Spain' }]);
    expect(second).toEqual([{ name: 'Spain' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reuses one in-flight promise for the same query', async () => {
    const pending = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstPromise = searchCountriesCached('bel', new AbortController().signal);
    const secondPromise = searchCountriesCached('BEL', new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    pending.resolve({
      ok: true,
      status: 200,
      json: async () => [{ name: 'Belarus' }],
    } as Response);

    await expect(firstPromise).resolves.toEqual([{ name: 'Belarus' }]);
    await expect(secondPromise).resolves.toEqual([{ name: 'Belarus' }]);
  });

  it('does not abort a shared in-flight request when one caller cancels', async () => {
    const pending = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstController = new AbortController();
    const secondController = new AbortController();

    const firstPromise = searchCountriesCached('pol', firstController.signal);
    const secondPromise = searchCountriesCached('pol', secondController.signal);

    firstController.abort();

    await expect(firstPromise).rejects.toMatchObject({ name: 'AbortError' });

    pending.resolve({
      ok: true,
      status: 200,
      json: async () => [{ name: 'Poland' }],
    } as Response);

    await expect(secondPromise).resolves.toEqual([{ name: 'Poland' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
