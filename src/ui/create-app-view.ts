import type { SearchViewState } from '../country-search-controller.js';
import type { CountryCard } from '../map-country-response.js';
import { el } from './dom.js';
import { hideDetails, renderDetails } from './render-details.js';
import { renderHistory } from './render-history.js';
import { renderResults } from './render-results.js';
import { renderStatus } from './render-status.js';

export type AppView = {
  root: HTMLElement;
  input: HTMLInputElement;
  setState: (state: SearchViewState) => void;
  setHistory: (items: string[]) => void;
  showDetails: (country: CountryCard) => void;
  onRetry: (handler: () => void) => void;
  onSelect: (handler: (country: CountryCard) => void) => void;
  onClear: (handler: () => void) => void;
  onHistorySelect: (handler: (query: string) => void) => void;
};

function createTitleBar(title: string, options: { onClose?: () => void } = {}): HTMLElement {
  const children: Array<Node | string> = [el('span', { className: 'title-bar-text' }, [title])];

  if (options.onClose) {
    const closeButton = el(
      'button',
      { className: 'title-btn title-btn-close', type: 'button', 'aria-label': 'Close' },
      ['×'],
    );
    closeButton.addEventListener('click', options.onClose);
    children.push(el('div', { className: 'title-bar-controls' }, [closeButton]));
  }

  return el('div', { className: 'title-bar' }, children);
}

export function createAppView(): AppView {
  const input = el('input', {
    type: 'text',
    className: 'search-input',
    placeholder: 'Search countries...',
    autocomplete: 'off',
  });

  const clearButton = el('button', { className: 'clear-btn', type: 'button' }, ['Clear']);
  const status = el('div', { className: 'status', 'aria-live': 'polite' });
  const history = el('div', { className: 'history hidden' });
  const results = el('div', { className: 'results' });
  const details = el('div', { className: 'details' });

  const closeDetails = (): void => {
    hideDetails(details);
  };

  const detailsWindow = el('aside', { className: 'window details-window hidden' }, [
    createTitleBar('Country Details', { onClose: closeDetails }),
    el('div', { className: 'window-body' }, [details]),
  ]);

  const root = el('main', { className: 'app' }, [
    el('section', { className: 'window search-window' }, [
      createTitleBar('Country Search'),
      el('div', { className: 'window-body' }, [
        el('p', { className: 'subtitle' }, ['Type a name - results update as you type.']),
        el('div', { className: 'search-row' }, [input, clearButton]),
        status,
        history,
      ]),
    ]),
    el('div', { className: 'layout' }, [
      el('div', { className: 'results-column' }, [
        el('section', { className: 'window results-window' }, [
          createTitleBar('Search Results'),
          el('div', { className: 'window-body results-body' }, [results]),
        ]),
        el('footer', { className: 'window app-footer' }, [
          el(
            'a',
            {
              className: 'footer-link',
              href: 'https://rs.school/',
              target: '_blank',
              rel: 'noreferrer',
            },
            ['RS School'],
          ),
          el(
            'a',
            {
              className: 'footer-link',
              href: 'https://github.com/onqqr',
              target: '_blank',
              rel: 'noreferrer',
            },
            ['GitHub'],
          ),
        ]),
      ]),
      detailsWindow,
    ]),
  ]);

  let retryHandler = (): void => undefined;
  let selectHandler = (_country: CountryCard): void => undefined;
  let clearHandler = (): void => undefined;
  let historySelectHandler = (_query: string): void => undefined;

  clearButton.addEventListener('click', () => {
    input.value = '';
    clearHandler();
  });

  const setState = (state: SearchViewState): void => {
    if (state.kind === 'results') {
      renderStatus(status, { kind: 'idle' }, retryHandler);
      renderResults(results, state.items, selectHandler);
      return;
    }

    if (state.kind === 'idle') {
      hideDetails(details);
    }

    renderStatus(status, state, retryHandler);
    renderResults(results, [], selectHandler);
  };

  const setHistory = (items: string[]): void => {
    renderHistory(history, items, (query) => historySelectHandler(query));
  };

  renderResults(results, [], selectHandler);

  return {
    root,
    input,
    setState,
    setHistory,
    showDetails: (country) => renderDetails(details, country),
    onRetry: (handler) => {
      retryHandler = handler;
    },
    onSelect: (handler) => {
      selectHandler = handler;
    },
    onClear: (handler) => {
      clearHandler = handler;
    },
    onHistorySelect: (handler) => {
      historySelectHandler = handler;
    },
  };
}
