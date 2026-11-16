import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the function immediately', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('a');

    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the function once after the delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('spain');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('spain');
  });

  it('resets the timer on repeated calls and keeps only the last args', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('s');
    vi.advanceTimersByTime(100);
    debounced('sp');
    vi.advanceTimersByTime(100);
    debounced('spa');
    vi.advanceTimersByTime(100);
    debounced('spain');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('spain');
  });

  it('uses the delay from the second argument', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced('ok');
    vi.advanceTimersByTime(499);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
