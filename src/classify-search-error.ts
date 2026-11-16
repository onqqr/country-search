export type SearchResultState = { kind: 'empty' } | { kind: 'results'; items: unknown[] };

export type SearchErrorState =
  | { kind: 'aborted'; showToUser: false }
  | { kind: 'timeout'; showToUser: true; message: string }
  | { kind: 'http'; showToUser: true; status: number; message: string }
  | { kind: 'unknown'; showToUser: true; message: string };

export function resolveSearchResult(_items: unknown[]): SearchResultState {
  throw new Error('Not implemented');
}

export function classifySearchError(_error: unknown): SearchErrorState {
  throw new Error('Not implemented');
}
