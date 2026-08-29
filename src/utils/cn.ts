/** Joins conditional class names, skipping falsy values. Avoids a clsx dependency for this small a need. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
