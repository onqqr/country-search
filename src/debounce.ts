export function debounce<Args extends unknown[]>(
  _fn: (...args: Args) => void,
  _delay: number,
): (...args: Args) => void {
  return (..._args: Args) => {};
}
