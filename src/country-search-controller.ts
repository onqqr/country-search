import type { CountryCard } from './map-country-response';

export type SearchViewState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'results'; items: CountryCard[] }
  | { kind: 'error'; message: string };

export type CountrySearchControllerOptions = {
  searchFn: (query: string, signal: AbortSignal) => Promise<unknown[]>;
  mapCountry: (raw: unknown) => CountryCard;
  debounceMs: number;
  timeoutMs: number;
  onStateChange: (state: SearchViewState) => void;
};

export type CountrySearchController = {
  setQuery: (query: string) => void;
  retry: () => void;
  destroy: () => void;
};

export function createCountrySearchController(
  _options: CountrySearchControllerOptions,
): CountrySearchController {
  return {
    setQuery: () => {
      throw new Error('Not implemented');
    },
    retry: () => {
      throw new Error('Not implemented');
    },
    destroy: () => {
      throw new Error('Not implemented');
    },
  };
}
