export function includesText(value: string | undefined, query: string | undefined): boolean {
  if (!query) return true;
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

export function anyIncludes(values: Array<string | undefined>, query: string | undefined): boolean {
  if (!query) return true;
  return values.some((value) => includesText(value, query));
}

export function withinRange(timestamp: string | undefined, start?: string, end?: string): boolean {
  if (!timestamp) return true;
  const time = new Date(timestamp).getTime();
  if (start && time < new Date(start).getTime()) return false;
  if (end && time > new Date(end).getTime()) return false;
  return true;
}

export function byRecency<T extends { updatedAt?: string; timestamp?: string; start?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt ?? a.timestamp ?? a.start ?? 0).getTime();
    const bTime = new Date(b.updatedAt ?? b.timestamp ?? b.start ?? 0).getTime();
    return bTime - aTime;
  });
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
