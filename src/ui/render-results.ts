import type { CountryCard } from '../map-country-response.js';
import { clear, el } from './dom.js';
import { renderFlag } from './render-flag.js';

export function renderResults(
  container: HTMLElement,
  items: CountryCard[],
  onSelect: (country: CountryCard) => void,
): void {
  clear(container);

  if (items.length === 0) {
    container.classList.add('is-empty');
    container.append(
      el('p', { className: 'results-placeholder' }, [
        'Results will appear here after you start typing.',
      ]),
    );
    return;
  }

  container.classList.remove('is-empty');

  for (const country of items) {
    const card = el('button', { className: 'card', type: 'button' }, [
      renderFlag(country.flag, country.name),
      el('div', { className: 'card-body' }, [
        el('h2', { className: 'card-title' }, [country.name]),
        el('p', {}, [`Capital: ${country.capital || '-'}`]),
        el('p', {}, [`Region: ${country.region || '-'}`]),
        el('p', {}, [`Population: ${country.population.toLocaleString('en-US')}`]),
      ]),
    ]);

    card.addEventListener('click', () => onSelect(country));
    container.append(card);
  }
}
