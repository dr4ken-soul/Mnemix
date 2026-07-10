import { existsSync, readFileSync, writeFileSync } from 'fs'
import type { CapturePayload, PendingFailure } from '../types/index.js'
import { ensureMnemixDir } from './pending.js'
import { getQueuePath } from './paths.js'

export interface QueuedResolve extends PendingFailure {
  fixCommand: string
}

export interface QueueItem {
  kind: 'capture' | 'resolve'
  payload: CapturePayload | QueuedResolve
  enqueuedAt: number
}

/**
 * Reads the offline queue from disk.
 * @returns array of queued items
 */
export function readQueue(): QueueItem[] {
  const path = getQueuePath()
  if (!existsSync(path)) return []
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as QueueItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Writes the offline queue to disk.
 * @param items - queue items to persist
 */
function writeQueue(items: QueueItem[]): void {
  ensureMnemixDir()
  writeFileSync(getQueuePath(), JSON.stringify(items, null, 2), 'utf8')
}

/**
 * Enqueues a failed capture for later sync when Supermemory is offline.
 * @param payload - capture payload from the shell hook
 */
export function enqueueCapture(payload: CapturePayload): void {
  const items = readQueue()
  items.push({
    kind: 'capture',
    payload,
    enqueuedAt: Date.now(),
  })
  writeQueue(items)
}

/**
 * Enqueues a resolve pairing for later sync when Supermemory is offline.
 * @param pending - pending failure
 * @param fixCommand - command that resolved it
 */
export function enqueueResolve(
  pending: PendingFailure,
  fixCommand: string,
): void {
  const items = readQueue()
  items.push({
    kind: 'resolve',
    payload: { ...pending, fixCommand },
    enqueuedAt: Date.now(),
  })
  writeQueue(items)
}

/**
 * Clears the offline queue after a successful flush.
 */
export function clearQueue(): void {
  writeQueue([])
}

/**
 * Replaces the offline queue with a residual list after a partial flush.
 * @param items - items that still need to be flushed
 */
export function replaceQueue(items: QueueItem[]): void {
  writeQueue(items)
}
