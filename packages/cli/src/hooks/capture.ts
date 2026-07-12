import type { CapturePayload } from '../types/index.js'
import { formatFixSuggestion, truncateErrorSnippet } from '../lib/format.js'
import {
  createSilentClient,
  getMaxErrorChars,
} from '../lib/supermemory.js'
import { writePending } from '../lib/pending.js'
import { enqueueCapture } from '../lib/queue.js'
import { flushQueue } from './flush.js'
import { searchForFix } from './search.js'
import { searchLocalMemory } from '../lib/localMemory.js'

/**
 * Handles a non-zero exit from shell hooks.
 * Searches Supermemory Local for a past fix when available, or falls back
 * to the local ~/.mnemix/memory.json file when the server is offline.
 * Prints a suggestion when a relevant match is found.
 * Stores the failure as pending for a later resolve.
 * @param payload - capture data from the shell hook
 */
export async function handleCapture(payload: CapturePayload): Promise<void> {
  const errorSnippet = truncateErrorSnippet(
    payload.stderrSnippet ?? '',
    getMaxErrorChars(),
  )
  const errorLine = errorSnippet.split('\n')[0] ?? ''

  const client = await createSilentClient()

  if (!client) {
    // Supermemory offline — queue for later and try local memory
    enqueueCapture(payload)
    writePending({
      command: payload.command,
      errorSnippet,
      directory: payload.directory,
      gitBranch: payload.gitBranch,
      failedAt: Date.now(),
    })

    // Search local memory file as offline fallback
    const localMatch = searchLocalMemory(payload.command, errorLine)
    if (localMatch) {
      process.stdout.write(
        `${formatFixSuggestion(
          localMatch.fixCommand,
          localMatch.directory,
          localMatch.resolvedAt,
          localMatch.gitBranch,
        )}\n`,
      )
    }
    return
  }

  // Supermemory is online — flush any offline work first then search
  await flushQueue(client)

  const match = await searchForFix(client, payload.command, errorLine)
  if (match) {
    process.stdout.write(
      `${formatFixSuggestion(
        match.fixCommand,
        match.directory,
        match.resolvedAt,
        match.gitBranch,
      )}\n`,
    )
  }

  writePending({
    command: payload.command,
    errorSnippet,
    directory: payload.directory,
    gitBranch: payload.gitBranch,
    failedAt: Date.now(),
  })
}
