export function requireFields(payload: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '')
}
