import { HttpError } from './http-error';

export type SearchResultState = { kind: 'empty' } | { kind: 'results'; items: unknown[] };

export type SearchErrorState =
  | { kind: 'aborted'; showToUser: false }
  | { kind: 'timeout'; showToUser: true; message: string }
  | { kind: 'http'; showToUser: true; status: number; message: string }
  | { kind: 'unknown'; showToUser: true; message: string };

export function resolveSearchResult(items: unknown[]): SearchResultState {
  if (items.length === 0) {
    return { kind: 'empty' };
  }

  return { kind: 'results', items };
}

function isDomException(error: unknown): error is DOMException {
  return error instanceof DOMException;
}

export function classifySearchError(error: unknown): SearchErrorState {
  if (isDomException(error) && error.name === 'AbortError') {
    return { kind: 'aborted', showToUser: false };
  }

  if (isDomException(error) && error.name === 'TimeoutError') {
    return {
      kind: 'timeout',
      showToUser: true,
      message: 'Request timed out. Please try again.',
    };
  }

  if (error instanceof HttpError) {
    return {
      kind: 'http',
      showToUser: true,
      status: error.status,
      message: error.message,
    };
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  return {
    kind: 'unknown',
    showToUser: true,
    message,
  };
}
