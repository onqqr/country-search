import { describe, expect, it } from 'vitest';
import { HttpError } from './http-error';
import { classifySearchError, resolveSearchResult } from './classify-search-error';

describe('resolveSearchResult', () => {
  it('treats empty array as not-found (404 semantics)', () => {
    expect(resolveSearchResult([])).toEqual({ kind: 'empty' });
  });

  it('treats non-empty array as results', () => {
    expect(resolveSearchResult([{ name: 'Spain' }])).toEqual({
      kind: 'results',
      items: [{ name: 'Spain' }],
    });
  });
});

describe('classifySearchError', () => {
  it('marks AbortError as aborted and not shown to the user', () => {
    const error = new DOMException('Aborted', 'AbortError');

    expect(classifySearchError(error)).toEqual({
      kind: 'aborted',
      showToUser: false,
    });
  });

  it('marks TimeoutError as timeout and shown to the user', () => {
    const error = new DOMException('Timed out', 'TimeoutError');

    expect(classifySearchError(error)).toEqual({
      kind: 'timeout',
      showToUser: true,
      message: 'Request timed out. Please try again.',
    });
  });

  it('marks HttpError as http and shown to the user', () => {
    const error = new HttpError('Server failed', 500);

    expect(classifySearchError(error)).toEqual({
      kind: 'http',
      showToUser: true,
      status: 500,
      message: 'Server failed',
    });
  });

  it('marks unknown errors as unknown and shown to the user', () => {
    expect(classifySearchError(new Error('Network down'))).toEqual({
      kind: 'unknown',
      showToUser: true,
      message: 'Network down',
    });
  });
});
