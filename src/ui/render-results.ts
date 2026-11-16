import type { CountryCard } from '../map-country-response';
import { clear, el } from './dom';
import { renderFlag } from '../ui/render-flag';

export function renderResults(
  container: HTMLElement,
  items: CountryCard[],
  onSelect: (country: CountryCard) => void,
): void {
  clear(container);

  for (const country of items) {
    const card = el('button', { className: 'card', type: 'button' }, [
      renderFlag(country.flag, country.name),
      el('div', { className: 'card-body' }, [
        el('h2', { className: 'card-title' }, [country.name]),
        el('p', {}, [`Capital: ${country.capital || '—'}`]),
        el('p', {}, [`Region: ${country.region || '—'}`]),
        el('p', {}, [`Population: ${country.population.toLocaleString('en-US')}`]),
      ]),
    ]);

    card.addEventListener('click', () => onSelect(country));
    container.append(card);
  }
}
