import type { SearchViewState } from '../country-search-controller';
import { clear, el } from './dom';

type StatusState = Exclude<SearchViewState, { kind: 'results' }>;

export function renderStatus(
  container: HTMLElement,
  state: StatusState,
  onRetry: () => void,
): void {
  clear(container);

  if (state.kind === 'idle') return;

  if (state.kind === 'loading') {
    container.append(el('p', { className: 'loading' }, ['Loading…']));
    return;
  }

  if (state.kind === 'empty') {
    container.append(el('p', { className: 'empty' }, ['Nothing found. Try another country name.']));
    return;
  }

  const retryButton = el('button', { className: 'retry', type: 'button' }, ['Retry']);
  retryButton.addEventListener('click', onRetry);

  container.append(el('div', { className: 'error' }, [el('p', {}, [state.message]), retryButton]));
}
