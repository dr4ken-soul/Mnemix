/**
 * Stored fix memory document shape.
 */
export interface FixMemory {
  failingCommand: string
  errorSnippet: string
  fixCommand: string
  directory: string
  gitBranch?: string
  resolvedAt: number
}

/**
 * Search result returned when a relevant past fix is found.
 */
export interface FixResult {
  fixCommand: string
  directory: string
  gitBranch?: string
  resolvedAt: number
}

/**
 * Payload sent by shell hooks on non-zero exit.
 */
export interface CapturePayload {
  command: string
  exitCode: number
  directory: string
  gitBranch?: string
  stderrSnippet?: string
}

/**
 * Aggregate stats for stored fixes.
 */
export interface MnemixStats {
  totalFixes: number
  oldestFixDate: number | null
  mostMatchedFix: string | null
}

/**
 * Pending failure waiting to be paired with a resolving command.
 */
export interface PendingFailure {
  command: string
  errorSnippet: string
  directory: string
  gitBranch?: string
  failedAt: number
}

/**
 * Listed fix row for mnemix list output.
 */
export interface ListedFix {
  id: string
  failingCommand: string
  fixCommand: string
  directory: string
  gitBranch?: string
  resolvedAt: number
}
