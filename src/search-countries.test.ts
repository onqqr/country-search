import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from './http-error';
import { searchCountries } from './search-countries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('calls countries.dev name endpoint with the encoded query and signal', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ name: 'Spain' }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const signal = new AbortController().signal;
    await searchCountries('spa in', signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/spa%20in',
      expect.objectContaining({ signal }),
    );
  });

  it('returns parsed json when response is ok', async () => {
    const countries = [{ name: 'Spain' }, { name: 'Spainish Guiana' }];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => countries,
      }),
    );

    const result = await searchCountries('spa', new AbortController().signal);

    expect(result).toEqual(countries);
  });

  it('returns an empty array on 404 (no matches)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      }),
    );

    const result = await searchCountries('zzzz', new AbortController().signal);

    expect(result).toEqual([]);
  });

  it('throws HttpError with status when response is not ok and not 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      }),
    );

    const error = await searchCountries('spain', new AbortController().signal).catch(
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 500 });
  });

  it('propagates abort errors from fetch', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    await expect(searchCountries('spain', new AbortController().signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});

describe('HttpError', () => {
  it('stores status and is an Error', () => {
    const error = new HttpError('Server failed', 503);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toBe('Server failed');
    expect(error.status).toBe(503);
    expect(error.name).toBe('HttpError');
  });
});
