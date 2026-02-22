/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to a URL-friendly slug.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a maximum length with an optional suffix.
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str) return str;
  if (str.length <= maxLength - suffix.length) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}
