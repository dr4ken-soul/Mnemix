import { execSync } from 'child_process'

/**
 * Returns the current git branch name if inside a git repository.
 * Returns undefined if not inside a repo or if git is unavailable.
 * @returns branch name string or undefined
 */
export function getCurrentBranch(): string | undefined {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim()
  } catch {
    return undefined
  }
}
