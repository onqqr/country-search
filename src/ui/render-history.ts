import { clear, el } from './dom.js';

export function renderHistory(
  container: HTMLElement,
  items: string[],
  onSelect: (query: string) => void,
): void {
  clear(container);

  if (items.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.append(el('p', { className: 'history-label' }, ['Recent searches:']));

  const list = el('div', { className: 'history-list' });

  for (const query of items) {
    const button = el('button', { className: 'history-item', type: 'button' }, [query]);
    button.addEventListener('click', () => onSelect(query));
    list.append(button);
  }

  container.append(list);
}
