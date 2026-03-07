export type TodoItem = { content: string; status?: string; priority?: string };

export function parseTodos(raw: unknown): TodoItem[] | null {
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const arr = Array.isArray(data) ? data : (data?.todos ?? data?.items ?? null);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    if (!arr.every((item: unknown) => typeof item === "object" && item !== null && "content" in item)) return null;
    return arr as TodoItem[];
  } catch {
    return null;
  }
}
