export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
