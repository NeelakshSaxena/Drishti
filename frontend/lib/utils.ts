export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string')
    .join(' ')
    .trim()
}
