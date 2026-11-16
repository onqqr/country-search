import type { CountryCard } from '../map-country-response';
import { clear, el } from './dom';
import { renderFlag } from '../ui/render-flag';

export function renderDetails(container: HTMLElement, country: CountryCard): void {
  clear(container);
  container.classList.remove('hidden');

  const areaText = country.area !== null ? `${country.area.toLocaleString('en-US')} km²` : '—';

  container.append(
    renderFlag(country.flag, country.name, 'flag flag-large'),
    el('h2', {}, [country.name]),
    el('p', {}, [country.subregion ? `${country.region} · ${country.subregion}` : country.region]),
    el('p', {}, [`Capital: ${country.capital || '—'}`]),
    el('p', {}, [`Population: ${country.population.toLocaleString('en-US')}`]),
    el('p', {}, [`Area: ${areaText}`]),
    el('p', {}, [`Languages: ${country.languages.join(', ') || '—'}`]),
    el('p', {}, [`Currencies: ${country.currencies.join(', ') || '—'}`]),
    el('p', {}, [`Borders: ${country.borders.join(', ') || '—'}`]),
  );
}

export function hideDetails(container: HTMLElement): void {
  clear(container);
  container.classList.add('hidden');
}
