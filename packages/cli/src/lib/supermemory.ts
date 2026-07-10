import Supermemory from 'supermemory'

/**
 * Default Supermemory Local base URL.
 * Matches the localhost:6767 hackathon endpoint.
 */
export const DEFAULT_SUPERMEMORY_URL = 'http://localhost:6767'

/**
 * Resolves the Supermemory Local base URL from the environment.
 * @returns base URL string
 */
export function getBaseUrl(): string {
  return process.env.SUPERMEMORY_URL ?? DEFAULT_SUPERMEMORY_URL
}

/**
 * Initialises and returns the Supermemory Local client.
 * Reads the base URL from environment or defaults to localhost:6767.
 * Returns null and logs a warning if the server is unreachable.
 * @returns Supermemory client instance or null on connection failure
 */
export async function createSupermemoryClient(): Promise<Supermemory | null> {
  const baseURL = getBaseUrl()
  try {
    const ok = await isSupermemoryRunning()
    if (!ok) {
      process.stderr.write(
        'Supermemory Local is not running. Start it with: npx supermemory setup\n',
      )
      return null
    }
    return new Supermemory({
      baseURL,
      apiKey: process.env.SUPERMEMORY_API_KEY ?? 'local',
    })
  } catch {
    process.stderr.write(
      'Supermemory Local is not running. Start it with: npx supermemory setup\n',
    )
    return null
  }
}

/**
 * Checks whether Supermemory Local is reachable without printing errors.
 * @returns true when the health endpoint responds
 */
export async function isSupermemoryRunning(): Promise<boolean> {
  const baseUrl = getBaseUrl()
  const candidates = [`${baseUrl}/health`, `${baseUrl}/v3/health`, baseUrl]
  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok || response.status === 401 || response.status === 404) {
        // 401/404 still means a server is listening on that host
        if (response.ok) return true
        if (url !== baseUrl) continue
        return true
      }
    } catch {
      // try next candidate
    }
  }
  return false
}

/**
 * Creates a Supermemory client without printing on failure.
 * @returns client or null
 */
export async function createSilentClient(): Promise<Supermemory | null> {
  const baseURL = getBaseUrl()
  try {
    const ok = await isSupermemoryRunning()
    if (!ok) return null
    return new Supermemory({
      baseURL,
      apiKey: process.env.SUPERMEMORY_API_KEY ?? 'local',
    })
  } catch {
    return null
  }
}

/**
 * Container tag isolating Mnemix memories from other Supermemory usage.
 */
export function getContainerTag(): string {
  return process.env.MNEMIX_CONTAINER_TAG ?? 'mnemix-fixes'
}

/**
 * Relevance threshold for surfacing a past fix.
 */
export function getRelevanceThreshold(): number {
  const raw = process.env.MNEMIX_RELEVANCE_THRESHOLD
  if (!raw) return 0.72
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0.72
}

/**
 * Maximum characters of stderr stored per fix.
 */
export function getMaxErrorChars(): number {
  const raw = process.env.MNEMIX_MAX_ERROR_CHARS
  if (!raw) return 300
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300
}
