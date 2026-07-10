/**
 * Converts a unix timestamp to a human-readable relative time string.
 * Uses plain arithmetic. No external date library.
 * @param timestamp - unix timestamp in milliseconds
 * @returns relative time such as "3 weeks ago" or "2 days ago"
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`
  const years = Math.floor(days / 365)
  return years === 1 ? '1 year ago' : `${years} years ago`
}

/**
 * Formats a fix suggestion for terminal output.
 * Exact layout required by the product spec.
 * @param fixCommand - command that resolved the failure
 * @param directory - working directory of the stored fix
 * @param resolvedAt - unix timestamp of the fix
 * @param gitBranch - optional git branch context
 * @returns multi-line suggestion string
 */
export function formatFixSuggestion(
  fixCommand: string,
  directory: string,
  resolvedAt: number,
  gitBranch?: string,
): string {
  const timeAgo = formatTimeAgo(resolvedAt)
  const branch = gitBranch ? ` · branch: ${gitBranch}` : ''
  return [
    `mnemix › found 1 match from ${timeAgo}`,
    `fix: ${fixCommand}`,
    `context: ${directory}${branch}`,
  ].join('\n')
}

/**
 * Truncates an error snippet to the configured maximum length.
 * @param snippet - raw error text
 * @param maxChars - maximum characters to keep
 * @returns truncated snippet
 */
export function truncateErrorSnippet(snippet: string, maxChars: number): string {
  if (snippet.length <= maxChars) return snippet
  return snippet.slice(0, maxChars)
}
