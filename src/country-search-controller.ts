import { classifySearchError, resolveSearchResult } from './classify-search-error';
import { debounce } from './debounce';
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
  options: CountrySearchControllerOptions,
): CountrySearchController {
  const { searchFn, mapCountry, debounceMs, timeoutMs, onStateChange } = options;

  let requestController: AbortController | null = null;
  let lastQuery = '';
  let destroyed = false;

  const emit = (state: SearchViewState): void => {
    if (!destroyed) {
      onStateChange(state);
    }
  };

  const abortInFlight = (): void => {
    if (requestController !== null) {
      requestController.abort();
      requestController = null;
    }
  };

  const executeSearch = async (query: string): Promise<void> => {
    if (destroyed || query !== lastQuery.trim()) {
      return;
    }

    abortInFlight();

    const controller = new AbortController();
    requestController = controller;

    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(timeoutMs)]);

    emit({ kind: 'loading' });

    try {
      const rawItems = await searchFn(query, signal);

      if (controller.signal.aborted || query !== lastQuery.trim()) {
        return;
      }

      const items = rawItems.map(mapCountry);
      const resolved = resolveSearchResult(items);

      if (resolved.kind === 'empty') {
        emit({ kind: 'empty' });
        return;
      }

      emit({ kind: 'results', items: resolved.items as CountryCard[] });
    } catch (error: unknown) {
      const classified = classifySearchError(error);

      if (!classified.showToUser) {
        return;
      }

      emit({ kind: 'error', message: classified.message });
    }
  };

  const debouncedSearch = debounce((query: string) => {
    void executeSearch(query);
  }, debounceMs);

  const setQuery = (query: string): void => {
    lastQuery = query;
    abortInFlight();

    const trimmed = query.trim();

    if (trimmed === '') {
      emit({ kind: 'idle' });
      return;
    }

    debouncedSearch(trimmed);
  };

  const retry = (): void => {
    const trimmed = lastQuery.trim();

    if (trimmed === '') {
      return;
    }

    void executeSearch(trimmed);
  };

  const destroy = (): void => {
    destroyed = true;
    abortInFlight();
  };

  return { setQuery, retry, destroy };
}
