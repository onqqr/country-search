import { afterEach, describe, expect, it } from 'vitest';
import { clearHistory, loadHistory, pushHistory } from './search-history';

describe('search history', () => {
  afterEach(() => {
    clearHistory();
  });

  it('starts empty', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('stores unique queries with newest first', () => {
    expect(pushHistory('spain')).toEqual(['spain']);
    expect(pushHistory('poland')).toEqual(['poland', 'spain']);
    expect(pushHistory('Spain')).toEqual(['Spain', 'poland']);
  });

  it('keeps only the latest 8 queries', () => {
    for (let i = 1; i <= 10; i += 1) {
      pushHistory(`q${i}`);
    }

    expect(loadHistory()).toEqual(['q10', 'q9', 'q8', 'q7', 'q6', 'q5', 'q4', 'q3']);
  });
});
