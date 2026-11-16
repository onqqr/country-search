import { HttpError } from './http-error';

export async function searchCountries(query: string, signal: AbortSignal): Promise<unknown[]> {
  const response = await fetch(`https://countries.dev/name/${encodeURIComponent(query)}`, {
    signal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(`Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as unknown[];
}
