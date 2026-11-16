import type { CountryCard } from '../map-country-response.js';
import { clear, el } from './dom.js';
import { renderFlag } from './render-flag.js';

export function renderDetails(container: HTMLElement, country: CountryCard): void {
  clear(container);
  container.closest('.details-window')?.classList.remove('hidden');

  const areaText = country.area !== null ? `${country.area.toLocaleString('en-US')} km2` : '-';

  container.append(
    renderFlag(country.flag, country.name, 'flag flag-large'),
    el('h2', {}, [country.name]),
    el('p', {}, [country.subregion ? `${country.region} / ${country.subregion}` : country.region]),
    el('p', {}, [`Capital: ${country.capital || '-'}`]),
    el('p', {}, [`Population: ${country.population.toLocaleString('en-US')}`]),
    el('p', {}, [`Area: ${areaText}`]),
    el('p', {}, [`Languages: ${country.languages.join(', ') || '-'}`]),
    el('p', {}, [`Currencies: ${country.currencies.join(', ') || '-'}`]),
    el('p', {}, [`Borders: ${country.borders.join(', ') || '-'}`]),
  );
}

export function hideDetails(container: HTMLElement): void {
  clear(container);
  container.closest('.details-window')?.classList.add('hidden');
}
