/**
 * Converts a camelCase signal key like "hasAuthFiles" or "readmeWordCount"
 * into a readable label like "Auth Files" or "Readme Word Count".
 */
export function formatSignalKey(key: string): string {
  return key
    .replace(/^has/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}
