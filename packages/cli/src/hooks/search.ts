import type Supermemory from 'supermemory'
import type { FixResult } from '../types/index.js'
import { getContainerTag, getRelevanceThreshold } from '../lib/supermemory.js'

/**
 * Searches Supermemory Local for a fix matching the current failure.
 * Returns the best match above the relevance threshold or null if none found.
 * Never prints anything.
 * @param client - configured Supermemory client
 * @param command - the command that just failed
 * @param errorLine - the first line of stderr output
 * @returns the best matching fix document or null
 */
export async function searchForFix(
  client: Supermemory,
  command: string,
  errorLine: string,
): Promise<FixResult | null> {
  const query = `${command} ${errorLine}`.trim()
  if (!query) return null

  try {
    const results = await client.search.documents({
      q: query,
      containerTags: [getContainerTag()],
      limit: 1,
    })

    const documents = results.results ?? []
    if (!documents.length) return null

    const top = documents[0] as {
      score?: number
      similarity?: number
      metadata?: Record<string, unknown>
    }

    const score = top.score ?? top.similarity ?? 0
    if (score < getRelevanceThreshold()) return null

    const metadata = top.metadata ?? {}
    const fixCommand = metadata.fixCommand as string | undefined
    if (!fixCommand) return null

    return {
      fixCommand,
      directory: (metadata.directory as string) ?? '',
      gitBranch: (metadata.gitBranch as string) || undefined,
      resolvedAt: (metadata.resolvedAt as number) ?? Date.now(),
    }
  } catch {
    return null
  }
}
