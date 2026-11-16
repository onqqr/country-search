export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args) => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
