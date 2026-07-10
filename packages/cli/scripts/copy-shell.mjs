import { cpSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src', 'shell')
const dest = join(root, 'dist', 'shell')

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
