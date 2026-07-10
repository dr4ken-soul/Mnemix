import { createSilentClient } from '../lib/supermemory.js'
import { clearPending, readPending } from '../lib/pending.js'
import { enqueueResolve } from '../lib/queue.js'
import { flushQueue } from '../hooks/flush.js'
import { storeFix } from '../hooks/store.js'

/**
 * Pairs a successful command with the previous pending failure and stores the fix.
 * Queues the resolve when Supermemory is offline.
 * @param options - resolve options from shell hooks
 */
export async function runResolve(options: {
  command: string
  directory: string
  gitBranch?: string
}): Promise<void> {
  const pending = readPending()
  if (!pending) return

  if (pending.directory !== options.directory) {
    return
  }

  if (pending.command === options.command) {
    clearPending()
    return
  }

  const client = await createSilentClient()
  if (!client) {
    enqueueResolve(pending, options.command)
    clearPending()
    return
  }

  try {
    await flushQueue(client)
    await storeFix(
      client,
      pending.command,
      pending.errorSnippet,
      options.command,
      pending.directory,
      pending.gitBranch,
    )
  } catch {
    enqueueResolve(pending, options.command)
  } finally {
    clearPending()
  }
}
