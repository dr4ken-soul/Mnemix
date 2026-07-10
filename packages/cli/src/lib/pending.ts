import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import type { PendingFailure } from '../types/index.js'
import { getMnemixDir, getPendingPath } from './paths.js'

export { getMnemixDir, getPendingPath } from './paths.js'

/**
 * Ensures the ~/.mnemix directory exists.
 */
export function ensureMnemixDir(): void {
  const dir = getMnemixDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * Writes a pending failure so a later resolve can pair the fix.
 * @param pending - failure context to store
 */
export function writePending(pending: PendingFailure): void {
  ensureMnemixDir()
  writeFileSync(getPendingPath(), JSON.stringify(pending, null, 2), 'utf8')
}

/**
 * Reads the pending failure if present.
 * @returns pending failure or null
 */
export function readPending(): PendingFailure | null {
  const path = getPendingPath()
  if (!existsSync(path)) return null
  try {
    const raw = readFileSync(path, 'utf8')
    return JSON.parse(raw) as PendingFailure
  } catch {
    return null
  }
}

/**
 * Clears the pending failure state file.
 */
export function clearPending(): void {
  const path = getPendingPath()
  if (existsSync(path)) {
    unlinkSync(path)
  }
}
