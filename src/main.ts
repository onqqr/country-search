import { createCountrySearchController } from './country-search-controller.js';
import { mapCountryResponse } from './map-country-response.js';
import { searchCountriesCached } from './search-countries-cached.js';
import { loadHistory, pushHistory } from './search-history.js';
import { createAppView } from './ui/create-app-view.js';

const view = createAppView();
document.body.append(view.root);
view.setHistory(loadHistory());

const controller = createCountrySearchController({
  searchFn: searchCountriesCached,
  mapCountry: mapCountryResponse,
  debounceMs: 300,
  timeoutMs: 10_000,
  onStateChange: (state) => {
    view.setState(state);

    if (state.kind === 'results' || state.kind === 'empty') {
      const query = view.input.value.trim();
      if (query !== '') {
        view.setHistory(pushHistory(query));
      }
    }
  },
});

view.onRetry(() => controller.retry());
view.onSelect((country) => view.showDetails(country));
view.onClear(() => controller.setQuery(''));
view.onHistorySelect((query) => {
  view.input.value = query;
  controller.searchNow(query);
});

view.input.addEventListener('input', () => {
  controller.setQuery(view.input.value);
});
