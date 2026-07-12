import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

/** A single stored fix entry in the local memory file. */
interface LocalFix {
  command: string
  errorSnippet: string
  fixCommand: string
  directory: string
  gitBranch?: string
  resolvedAt: number
}

/**
 * Returns the path to the local memory file.
 * @returns absolute path to ~/.mnemix/memory.json
 */
function getMemoryPath(): string {
  return join(homedir(), '.mnemix', 'memory.json')
}

/**
 * Ensures the ~/.mnemix directory exists.
 */
function ensureDir(): void {
  const dir = join(homedir(), '.mnemix')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/**
 * Reads all stored fixes from the local memory file.
 * @returns array of stored fixes or empty array on failure
 */
export function readMemory(): LocalFix[] {
  const path = getMemoryPath()
  if (!existsSync(path)) return []
  try {
    const raw = readFileSync(path, 'utf8')
    return JSON.parse(raw) as LocalFix[]
  } catch {
    return []
  }
}

/**
 * Stores a fix into the local memory file.
 * Avoids duplicates by checking for an existing entry with the same command and fix.
 * @param entry - the fix to store
 */
export function storeLocalFix(entry: LocalFix): void {
  ensureDir()
  const existing = readMemory()
  const isDuplicate = existing.some(
    (e) => e.command === entry.command && e.fixCommand === entry.fixCommand,
  )
  if (!isDuplicate) {
    existing.push(entry)
    writeFileSync(getMemoryPath(), JSON.stringify(existing, null, 2), 'utf8')
  }
}

/**
 * Searches local memory for a fix matching the failed command.
 * Uses substring matching on the command text and error snippet.
 * Returns the most recent match or null if nothing is relevant.
 * @param command - the command that just failed
 * @param errorSnippet - the first line of stderr
 * @returns best matching fix or null
 */
export function searchLocalMemory(
  command: string,
  errorSnippet: string,
): LocalFix | null {
  const fixes = readMemory()
  if (!fixes.length) return null

  const needle = command.toLowerCase()
  const errorNeedle = errorSnippet.toLowerCase()

  const scored = fixes
    .map((fix) => {
      const storedCmd = fix.command.toLowerCase()
      const storedErr = fix.errorSnippet.toLowerCase()

      // Score by how much the stored command overlaps with the current one
      let score = 0
      const storedWords = storedCmd.split(/\s+/)
      const currentWords = needle.split(/\s+/)
      for (const word of currentWords) {
        if (word.length > 2 && storedCmd.includes(word)) score += 2
      }
      for (const word of currentWords) {
        if (word.length > 2 && storedErr.includes(word)) score += 1
      }
      if (errorNeedle && storedErr.includes(errorNeedle.slice(0, 30))) score += 3
      // Boost for exact command base match (e.g. both are "git push ...")
      if (storedWords[0] === currentWords[0]) score += 1

      return { fix, score }
    })
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.fix.resolvedAt - a.fix.resolvedAt)
    .sort((a, b) => b.score - a.score)

  return scored.length ? scored[0].fix : null
}
