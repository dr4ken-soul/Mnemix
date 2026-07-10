import { homedir } from 'os'
import { join } from 'path'

/**
 * Returns the absolute path to the Mnemix home directory under the user profile.
 * @returns path to ~/.mnemix
 */
export function getMnemixDir(): string {
  return join(homedir(), '.mnemix')
}

/**
 * Returns the path to the pending failure state file.
 * @returns path to ~/.mnemix/pending.json
 */
export function getPendingPath(): string {
  return join(getMnemixDir(), 'pending.json')
}

/**
 * Returns the path to the local capture queue used when Supermemory is offline.
 * @returns path to ~/.mnemix/queue.json
 */
export function getQueuePath(): string {
  return join(getMnemixDir(), 'queue.json')
}
