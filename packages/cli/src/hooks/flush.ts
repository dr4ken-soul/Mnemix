import type Supermemory from 'supermemory'
import {
  clearQueue,
  readQueue,
  replaceQueue,
  type QueuedResolve,
} from '../lib/queue.js'
import { storeFix } from './store.js'

/**
 * Flushes the offline resolve queue to Supermemory Local.
 * Capture-only items stay local until a resolve pairs them via pending.json.
 * @param client - reachable Supermemory client
 */
export async function flushQueue(client: Supermemory): Promise<void> {
  const items = readQueue()
  if (!items.length) return

  const remaining: typeof items = []

  for (const item of items) {
    if (item.kind !== 'resolve') {
      // Capture entries are informational; resolve carries the store payload
      continue
    }

    try {
      const payload = item.payload as QueuedResolve
      if (!payload.fixCommand) {
        remaining.push(item)
        continue
      }
      await storeFix(
        client,
        payload.command,
        payload.errorSnippet,
        payload.fixCommand,
        payload.directory,
        payload.gitBranch,
      )
    } catch {
      remaining.push(item)
    }
  }

  if (remaining.length === 0) {
    clearQueue()
  } else {
    replaceQueue(remaining)
  }
}
