import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'
import { ensureMnemixDir, getMnemixDir } from '../lib/pending.js'

/**
 * Resolves the path to a shell hook template next to the compiled code or sources.
 * @param hookFileName - e.g. mnemix.zsh
 * @returns absolute path to the template file or null
 */
function resolveTemplate(hookFileName: string): string | null {
  const here = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    join(here, '..', 'shell', hookFileName),
    join(here, 'shell', hookFileName),
    join(process.cwd(), 'src', 'shell', hookFileName),
    join(process.cwd(), 'dist', 'shell', hookFileName),
  ]
  for (const path of candidates) {
    if (existsSync(path)) return path
  }
  return null
}

/**
 * Detects the user's shell from $SHELL and installs hook templates.
 * Appends a source line to the rc file only if it is not already present.
 */
export async function runInstall(): Promise<void> {
  const shellPath = process.env.SHELL ?? ''
  const isZsh = shellPath.includes('zsh')
  const isBash = shellPath.includes('bash')

  if (!isZsh && !isBash) {
    // On Windows without SHELL, prefer bash if Git Bash is common, else report clearly
    process.stderr.write(
      'unsupported shell. mnemix supports zsh and bash\n',
    )
    process.stderr.write(
      'set SHELL to your shell path, for example /bin/zsh or /bin/bash\n',
    )
    process.exitCode = 1
    return
  }

  const shellName = isZsh ? 'zsh' : 'bash'
  const rcName = isZsh ? '.zshrc' : '.bashrc'
  const hookFileName = `mnemix.${shellName}`
  const rcPath = join(homedir(), rcName)
  const mnemixDir = getMnemixDir()
  const destHook = join(mnemixDir, hookFileName)

  ensureMnemixDir()

  const templatePath = resolveTemplate(hookFileName)
  if (!templatePath) {
    process.stderr.write(`hook template not found: ${hookFileName}\n`)
    process.exitCode = 1
    return
  }

  copyFileSync(templatePath, destHook)

  const sourceLine = `source ~/.mnemix/${hookFileName}`
  let rcContent = ''
  if (existsSync(rcPath)) {
    rcContent = readFileSync(rcPath, 'utf8')
  }

  if (
    !rcContent.includes(sourceLine) &&
    !rcContent.includes(`~/.mnemix/${hookFileName}`)
  ) {
    const separator =
      rcContent.length > 0 && !rcContent.endsWith('\n') ? '\n' : ''
    writeFileSync(
      rcPath,
      `${rcContent}${separator}\n# mnemix shell memory daemon\n${sourceLine}\n`,
      'utf8',
    )
  }

  process.stdout.write(`mnemix installed to ~/${rcName}\n`)
  process.stdout.write('restart your terminal to activate\n')
}
