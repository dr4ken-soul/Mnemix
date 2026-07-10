import { createSupermemoryClient, getContainerTag } from '../lib/supermemory.js'
import { formatTimeAgo } from '../lib/format.js'
import type { ListedFix } from '../types/index.js'

/**
 * Lists all stored Mnemix fixes as a numbered table.
 */
export async function runList(): Promise<void> {
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

    if (!memories.length) {
      process.stdout.write(
        'No fixes stored yet. Run a few commands and Mnemix will start learning\n',
      )
      return
    }

    const rows: ListedFix[] = memories.map((item, index) => {
      const metadata = (item.metadata ?? {}) as Record<string, unknown>
      return {
        id: String(item.id ?? item.docId ?? index + 1),
        failingCommand: String(metadata.failingCommand ?? ''),
        fixCommand: String(metadata.fixCommand ?? ''),
        directory: String(metadata.directory ?? ''),
        gitBranch: metadata.gitBranch
          ? String(metadata.gitBranch)
          : undefined,
        resolvedAt: Number(metadata.resolvedAt ?? Date.now()),
      }
    })

    rows.forEach((row, i) => {
      const n = String(i + 1).padStart(2, ' ')
      const ago = formatTimeAgo(row.resolvedAt)
      process.stdout.write(
        `${n}. [${row.id}] ${row.failingCommand} → ${row.fixCommand}\n`,
      )
      process.stdout.write(
        `    ${row.directory}${row.gitBranch ? ` · ${row.gitBranch}` : ''} · ${ago}\n`,
      )
    })
  } catch {
    process.stderr.write('failed to list fixes\n')
    process.exitCode = 1
  }
}
