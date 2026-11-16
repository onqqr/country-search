import { createCountrySearchController } from './country-search-controller.js';
import { mapCountryResponse } from './map-country-response.js';
import { searchCountries } from './search-countries.js';
import { createAppView } from './ui/create-app-view.js';

const view = createAppView();
document.body.append(view.root);

const controller = createCountrySearchController({
  searchFn: searchCountries,
  mapCountry: mapCountryResponse,
  debounceMs: 300,
  timeoutMs: 10_000,
  onStateChange: view.setState,
});

view.onRetry(() => controller.retry());
view.onSelect((country) => view.showDetails(country));
view.onClear(() => controller.setQuery(''));

view.input.addEventListener('input', () => {
  controller.setQuery(view.input.value);
});
