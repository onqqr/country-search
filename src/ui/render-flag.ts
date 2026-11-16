import { el } from './dom';

export function renderFlag(flag: string, name: string, className = 'flag'): HTMLElement {
  if (flag.startsWith('http')) {
    return el('img', {
      className,
      src: flag,
      alt: `${name} flag`,
    });
  }

  return el('span', { className: `${className} flag-emoji` }, [flag || '🏳️']);
}
