import {
  createSupermemoryClient,
  getContainerTag,
} from '../lib/supermemory.js'
import { formatTimeAgo } from '../lib/format.js'

/**
 * Prints a short summary of stored fix memories.
 */
export async function runStats(): Promise<void> {
  const client = await createSupermemoryClient()
  if (!client) {
    process.exitCode = 1
    return
  }

  try {
    const response = await client.documents.list({
      containerTags: [getContainerTag()],
      limit: 500,
    })

    const raw = response as unknown as {
      memories?: Array<Record<string, unknown>>
      results?: Array<Record<string, unknown>>
      documents?: Array<Record<string, unknown>>
    }
    const memories =
      raw.memories ??
      raw.results ??
      raw.documents ??
      (Array.isArray(response) ? (response as Array<Record<string, unknown>>) : [])

    const total = memories.length
    let oldest: number | null = null
    let mostMatched: string | null = null
    let mostMatchedCount = -1

    for (const item of memories) {
      const metadata = (item.metadata ?? {}) as Record<string, unknown>
      const resolvedAt = Number(metadata.resolvedAt ?? 0)
      if (resolvedAt && (oldest === null || resolvedAt < oldest)) {
        oldest = resolvedAt
      }
      const fix = String(metadata.fixCommand ?? '')
      if (fix) {
        const count = Number(metadata.matchCount ?? 0)
        if (count > mostMatchedCount) {
          mostMatchedCount = count
          mostMatched = fix
        }
      }
    }

    if (mostMatched === null && memories.length > 0) {
      const first = (memories[0].metadata ?? {}) as Record<string, unknown>
      mostMatched = String(first.fixCommand ?? 'none')
    }

    process.stdout.write(`total fixes: ${total}\n`)
    process.stdout.write(
      `oldest fix: ${oldest ? formatTimeAgo(oldest) : 'none'}\n`,
    )
    process.stdout.write(`most matched: ${mostMatched ?? 'none'}\n`)
  } catch {
    process.stderr.write('failed to load stats\n')
    process.exitCode = 1
  }
}
