const STORAGE_KEY = 'country-search-history';
const MAX_ITEMS = 8;

export function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
  } catch {
    return [];
  }
}

export function pushHistory(query: string): string[] {
  const normalized = query.trim();
  if (normalized === '') {
    return loadHistory();
  }

  const next = [
    normalized,
    ...loadHistory().filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
