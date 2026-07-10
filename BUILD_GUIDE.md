# Mnemix — Build Guide

## Before You Write a Single Line of Code

Read CLAUDE.md and APP_BLUEPRINT.md in full. Both files contain decisions that cannot be inferred from this guide alone. Every architectural choice, naming convention and code rule is in CLAUDE.md. Every data structure, API call pattern and CLI command definition is in APP_BLUEPRINT.md. This guide tells you the order to build things. The other two files tell you what to build and how.

---

## Prerequisites

Confirm all of the following are installed before starting:

```bash
node --version        # must be 18 or higher
npm --version         # must be 9 or higher
git --version         # any recent version
npx supermemory setup # starts Supermemory Local on localhost:3000
```

Verify Supermemory Local is running:
```bash
curl http://localhost:3000/health
# expected: {"status":"ok"}
```

If the health check fails, stop and resolve the Supermemory setup before writing any code. Nothing works without it.

---

## Repository Setup

```bash
mkdir mnemix && cd mnemix
git init
npm init -y
mkdir -p packages/cli/src/{commands,hooks,shell,lib,types}
mkdir -p packages/landing/src/{components/{ui,layout,sections},hooks,styles}
mkdir -p packages/landing/public
```

Root `package.json` workspaces config:
```json
{
  "name": "mnemix",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:landing": "npm run dev --workspace=packages/landing",
    "build:cli": "npm run build --workspace=packages/cli",
    "build:landing": "npm run build --workspace=packages/landing"
  }
}
```

---

## Phase 1 — CLI Core

### Step 1.1: CLI package setup

`packages/cli/package.json`:
```json
{
  "name": "mnemix",
  "version": "0.1.0",
  "description": "Your terminal remembers every fix. You never debug the same error twice.",
  "type": "module",
  "bin": {
    "mnemix": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@supermemory/client": "latest",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

`packages/cli/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

Install CLI dependencies:
```bash
cd packages/cli && npm install
```

---

### Step 1.2: Types

Create `packages/cli/src/types/index.ts` with all interfaces from APP_BLUEPRINT.md:
- `FixMemory`
- `FixResult`
- `CapturePayload`
- `MnemixStats`

---

### Step 1.3: Supermemory client

Create `packages/cli/src/lib/supermemory.ts`.

Implement `createSupermemoryClient()` exactly as specified in APP_BLUEPRINT.md. The function must:
- Read base URL from `SUPERMEMORY_URL` environment variable, defaulting to `http://localhost:3000`
- Call a health check before returning the client
- Return `null` and print the not-running error message if the check fails
- Never throw an unhandled error

---

### Step 1.4: Git context helper

Create `packages/cli/src/lib/git.ts`:

```typescript
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
```

---

### Step 1.5: Terminal output formatter

Create `packages/cli/src/lib/format.ts`.

All terminal output must follow these rules without exception:
- British English
- No em dashes
- Periods only when necessary
- No celebration emoji, no ASCII art
- The fix suggestion format is exactly:

```
mnemix › found 1 match from {timeAgo}
fix: {fixCommand}
context: {directory}{branch}
```

Where `{branch}` is ` · branch: {gitBranch}` when present and absent when not. `{timeAgo}` is a human-readable relative time such as "3 weeks ago" or "2 days ago".

Implement a `formatTimeAgo(timestamp: number): string` function that converts a unix timestamp to a relative time string. No external date library. Write it with plain arithmetic.

---

### Step 1.6: Core hooks

**`packages/cli/src/hooks/search.ts`**

Implement `searchForFix()` exactly as specified in APP_BLUEPRINT.md. Relevance threshold is `0.72` by default, overridable via `MNEMIX_RELEVANCE_THRESHOLD`. Return `null` silently when no match meets the threshold. Never print anything from this function.

**`packages/cli/src/hooks/store.ts`**

Implement `storeFix()` exactly as specified in APP_BLUEPRINT.md. Truncate `errorSnippet` to the value of `MNEMIX_MAX_ERROR_CHARS` (default 300) before storing. Container tag is always `mnemix-fixes`.

**`packages/cli/src/hooks/capture.ts`**

Implement `handleCapture(payload: CapturePayload)`. This function:
1. Creates the Supermemory client via `createSupermemoryClient()`
2. If client is null, exits silently with no output
3. Searches for a fix using `searchForFix()`
4. If a fix is found, prints the formatted suggestion using `format.ts`
5. Stores the failing command context in a temporary local state file at `~/.mnemix/pending.json` so the resolve command can pair it with an eventual fix

---

### Step 1.7: CLI entry point

Create `packages/cli/src/index.ts`. Use Commander.js to register all commands from APP_BLUEPRINT.md:

```typescript
#!/usr/bin/env node
import { Command } from 'commander'

const program = new Command()

program
  .name('mnemix')
  .description('Shell memory daemon. Your terminal remembers every fix.')
  .version('0.1.0')

// Register each command: install, capture, resolve, list, forget, stats, status
// Each command maps to its implementation file in src/commands/

program.parse()
```

Each command file in `src/commands/` handles one subcommand. Keep them small. All logic lives in `src/hooks/` and `src/lib/`.

---

### Step 1.8: Shell hook templates

**`packages/cli/src/shell/mnemix.zsh`**

Copy the full zsh hook template from CLAUDE.md verbatim. This file is written to `~/.mnemix/mnemix.zsh` during `mnemix install`.

**`packages/cli/src/shell/mnemix.bash`**

Copy the full bash hook template from CLAUDE.md verbatim. This file is written to `~/.mnemix/mnemix.bash` during `mnemix install`.

---

### Step 1.9: Install command

Create `packages/cli/src/commands/install.ts`.

Logic:
1. Detect shell by reading `$SHELL` environment variable
2. Determine the correct rc file: `.zshrc` for zsh, `.bashrc` for bash
3. Write hook template to `~/.mnemix/mnemix.{zsh|bash}`
4. Check whether the source line already exists in the rc file
5. If not, append: `source ~/.mnemix/mnemix.{zsh|bash}`
6. Print a short confirmation message and instruct the user to restart their terminal

Output example:
```
mnemix installed to ~/.zshrc
restart your terminal to activate
```

No colour, no emoji, no excess copy.

---

### Step 1.10: Remaining commands

Implement `list.ts`, `forget.ts`, `stats.ts` and `status.ts` following the specifications in APP_BLUEPRINT.md. Keep output minimal and factual.

`status.ts` output when running:
```
Supermemory Local: running (localhost:3000)
mnemix fixes stored: 47
```

`status.ts` output when not running:
```
Supermemory Local: not running
start it with: npx supermemory setup
```

---

### Step 1.11: Build and smoke test

```bash
cd packages/cli
npm run build
node dist/index.js --version     # should print 0.1.0
node dist/index.js status        # should print Supermemory status
```

Then link locally and test the full flow:
```bash
npm link
mnemix install
# open a new terminal session
# run a command that fails
# run the fix
# run the failing command again and confirm the suggestion appears
```

---

## Phase 2 — Landing Page

### Step 2.1: Landing package setup

```bash
cd packages/landing
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install motion lucide-react
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        mono: ['Azeret Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#090b11',
          secondary: '#0f1219',
          surface: '#161b26',
          elevated: '#1e2435',
        },
        accent: {
          DEFAULT: '#72f0b4',
          hover: '#9af7cc',
          dim: '#2a7a5a',
        },
        text: {
          primary: '#e4eaf5',
          secondary: '#6a7a96',
          muted: '#2e3a52',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

### Step 2.2: Global CSS

`packages/landing/src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary:     #090b11;
  --bg-secondary:   #0f1219;
  --bg-surface:     #161b26;
  --bg-elevated:    #1e2435;
  --accent:         #72f0b4;
  --accent-hover:   #9af7cc;
  --accent-glow:    rgba(114, 240, 180, 0.10);
  --accent-dim:     #2a7a5a;
  --text-primary:   #e4eaf5;
  --text-secondary: #6a7a96;
  --text-muted:     #2e3a52;
  --border-subtle:  rgba(255, 255, 255, 0.04);
  --border-default: rgba(255, 255, 255, 0.08);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Liquid glass utility classes */
.liquid-glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-default);
  position: relative;
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(114, 240, 180, 0.06) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.liquid-glass-strong {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.liquid-glass-dark {
  background: rgba(9, 11, 17, 0.80);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
}
```

---

### Step 2.3: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!-- Favicon slot: replace with public/favicon.ico once provided -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mnemix — Your terminal remembers every fix</title>
    <meta name="description" content="Shell memory daemon built on Supermemory Local. When a command fails, Mnemix surfaces the fix from your own past sessions." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300&family=Be+Vietnam+Pro:wght@300;400;500;600&family=Azeret+Mono:wght@300;400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### Step 2.4: Utility components

**`GrainOverlay.tsx`** — fixed position, full viewport, pointer-events none, z-index 50, 3.5% opacity SVG fractal noise. Do not animate it.

**`FadeIn.tsx`** — wraps any children in a Framer Motion div with blur-in entrance:
```
initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
```

**`Magnet.tsx`** — wraps the primary CTA. Uses `useMotionValue` and `useTransform` for cursor tracking. Maximum pull distance is 6px. Uses CSS class hover states only, no `onMouseEnter`/`onMouseLeave` handlers for styling.

---

### Step 2.5: Custom hooks

**`useParallax.ts`**

```typescript
import { useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'

/**
 * Returns x and y motion values that respond to mouse position.
 * Used for the hero image parallax effect.
 * @param strength - how many pixels the image shifts at maximum mouse offset
 * @returns object with x and y MotionValues
 */
export function useParallax(strength = 12) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const x = useTransform(mouseX, [-1, 1], [-strength, strength])
  const y = useTransform(mouseY, [-1, 1], [-strength, strength])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1)
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return { x, y }
}
```

---

### Step 2.6: Nav component

**`Nav.tsx`** — fixed top of viewport, liquid-glass pill floats above the hero:
- Logo slot comment on the left with "Mnemix" wordmark text as fallback
- Single "Install Mnemix" CTA on the right styled as an accent-coloured pill button
- No centre links, no login, no additional nav items
- `liquid-glass` class applied to the nav container
- Wrap nav in a `<header>` with `position: fixed`, `top: 1.5rem`, centered horizontally via `left: 50%` and `transform: translateX(-50%)`
- `z-index: 100`

---

### Step 2.7: Hero section

**`Hero.tsx`**

This is the most important component. Build it exactly to this spec without deviation.

Structure:
```
<section> (100dvh, relative, overflow hidden)
  <motion.div> (hero image layer, absolute inset-0, mouse parallax via useParallax)
    <img> (hero.webp, object-cover, fill)
  </motion.div>
  <div> (gradient overlay, absolute inset-0, from transparent to bg-primary, bottom 35%)
  <GrainOverlay />
  <div> (content layer, absolute inset-0, flex items-center justify-center, z-10)
    <div> (text stack, centered, max-w-2xl, px-6)
      <span> eyebrow label — Azeret Mono, accent colour, text-sm tracking-widest uppercase
      <h1> headline — Source Serif 4, two lines, tight leading, text-5xl md:text-7xl, text-primary
      <p> subline — Be Vietnam Pro 300, text-secondary, text-lg
      <div> install command block — Azeret Mono, bg-surface, border-subtle, copy button
      <Magnet> primary CTA button
    </div>
  </div>
</section>
```

Hero copy (exact strings, no placeholders):
- Eyebrow: `shell memory daemon`
- Headline line 1: `Your terminal remembers.`
- Headline line 2: `You never repeat yourself.`
- Subline: `Mnemix hooks into your shell and surfaces fixes from your own history the moment a command fails.`
- Install command: `npm install -g mnemix && mnemix install`
- CTA: `Install Mnemix`

Mouse parallax: image layer moves, text layer is static. Wrap the image in a `motion.div` and apply the `x` and `y` values from `useParallax(12)` directly to it.

---

### Step 2.8: Terminal moment section

**`TerminalMoment.tsx`**

A framed terminal window mockup showing a real Mnemix interaction. This section sits directly below the hero.

Section structure:
- Full-width section, `bg-secondary`, generous vertical padding
- Centered heading above the frame: Source Serif 4, `text-3xl`, `text-primary`
- Subtext below heading: Be Vietnam Pro 300, `text-secondary`, one line
- The terminal frame: centered, max-width 720px, rounded-xl, `bg-elevated`, `border-default` border, subtle box shadow

Terminal frame structure:
```
Title bar (bg-surface, rounded-t-xl, px-4 py-3, flex items-center gap-2)
  Three dots (12px circles, muted colours: #3a3a3a, #4a4a4a, #5a5a5a — NOT the bright Apple colours)
  Title text (Azeret Mono, text-xs, text-muted): bash — mnemix
Terminal body (bg-elevated, rounded-b-xl, p-6, font-mono)
  [see exact terminal sequence below]
```

Exact terminal sequence in Azeret Mono, `text-sm`, line by line:
```
Line 1:  text-muted    $
         text-primary  git pull origin main
Line 2:  text-error    error: Your local changes would be overwritten by merge
Line 3:  text-error    Please commit your changes or stash them before you merge.
Line 4:  (empty line)
Line 5:  text-accent   mnemix › found 1 match from 3 weeks ago
Line 6:  text-primary  fix: git stash && git pull origin main
Line 7:  text-muted    context: ~/projects/api · branch: main
```

Define `text-error` as `color: #ef4444` via inline style or a custom Tailwind colour.

Section heading copy:
- Heading: `The fix is already in your history.`
- Subtext: `Mnemix searches what you have already solved. Not the internet.`

FadeIn wrapper on the terminal frame. Stagger delay 0.15s after heading.

---

### Step 2.9: Three pillars section

**`ThreePillars.tsx`**

Inspired by the SEO tool reference: left-anchored large Source Serif 4 heading, three cards flowing right and below.

Section layout: two-column at `lg` breakpoint. Left column: large heading and short paragraph. Right column and below: three feature cards in a grid.

Left column copy:
- Heading: `Silent. Semantic. Local.`
- Paragraph: `Three principles that make Mnemix different from every other shell history tool.`

Three cards (one for each pillar):

**Card 1 — Silent**
- Title: `Silent`
- Body: `Runs as a shell hook with no perceived latency. Nothing blocks your prompt. You will not notice it until you need it.`

**Card 2 — Semantic**
- Title: `Semantic`
- Body: `Searches by meaning, not keywords. A different error message for the same underlying problem still matches the fix you already know.`

**Card 3 — Local**
- Title: `Local`
- Body: `Your command history never leaves your machine. Supermemory Local runs the full memory layer on your laptop. No account, no cloud, no tracking.`

Card component:
- `bg-surface`, `border-default` border, `rounded-xl`, `p-6`
- Title: Be Vietnam Pro 500, `text-primary`, `text-lg`
- Body: Be Vietnam Pro 300, `text-secondary`, `text-sm`, `leading-relaxed`
- 3D card tilt via `useMotionValue` and `useTransform` on `rotateX` and `rotateY`
- Tilt range: plus or minus 8 degrees max
- `useSpring` with `stiffness: 300, damping: 30` on both axes for smooth return
- CSS class hover states only for border colour change on hover

---

### Step 2.10: Setup section

**`Setup.tsx`**

Two numbered steps. Nothing else.

Section layout: centered, `max-w-2xl`, generous padding.

Section heading: Source Serif 4, `text-3xl`, centered: `Up in two steps.`

Steps:

**Step 1:**
- Label: Azeret Mono, accent colour, `text-sm`: `step 01`
- Heading: Be Vietnam Pro 500, `text-primary`: `Start Supermemory Local`
- Command block: `npx supermemory setup` with copy button
- Note: Be Vietnam Pro 300, `text-muted`, `text-sm`: `Runs the full memory layer on your machine. One command, nothing else needed.`

**Step 2:**
- Label: Azeret Mono, accent colour, `text-sm`: `step 02`
- Heading: Be Vietnam Pro 500, `text-primary`: `Install Mnemix`
- Command block: `npm install -g mnemix && mnemix install` with copy button
- Note: Be Vietnam Pro 300, `text-muted`, `text-sm`: `Hooks into your shell. Restart your terminal once and it runs from that point forward.`

Command block styling: `bg-surface`, `border-default` border, `rounded-lg`, `px-4 py-3`, Azeret Mono `text-sm`, copy icon from Lucide React on the right, clicking it copies the command and changes the icon to a checkmark for 1.5 seconds then reverts.

FadeIn stagger on each step with 0.1s delay between them.

---

### Step 2.11: FAQ section

**`Faq.tsx`**

Accordion layout. Full-width rows stacked vertically. No outer card container, just the rows.

Section heading: Source Serif 4, `text-3xl`, centered: `Common questions.`

Six FAQ items in order from CLAUDE.md:

1. Does Mnemix support bash, zsh and fish?
   Answer: Mnemix supports zsh and bash at launch. Fish shell support is on the roadmap but is not in the current release.

2. Does my command history ever leave my machine?
   Answer: No. Mnemix writes everything to Supermemory Local which runs entirely on your machine. No data is sent to any remote server.

3. Do I need Supermemory Local running all the time or just when I use Mnemix?
   Answer: Supermemory Local needs to be running for Mnemix to store and search fixes. If it is not running, Mnemix degrades silently and queues captures locally until the server is back up.

4. What happens when I run a command Mnemix has never seen before?
   Answer: Nothing. Mnemix is silent when it has no relevant match. Your terminal behaves exactly as it would without Mnemix installed.

5. Can I use Mnemix without an internet connection?
   Answer: Yes. Supermemory Local and Mnemix both run entirely offline. An internet connection is only needed to install the packages initially.

6. How does Mnemix decide which past fix is relevant?
   Answer: It uses Supermemory Local's semantic search which compares the meaning of the failing command and error output against stored fixes. Only matches above a relevance threshold are shown. Low-confidence results are discarded silently.

Each row:
- Bottom border: `1px solid var(--border-subtle)`
- Layout: `flex justify-between items-center`, `py-5`, `cursor-pointer`
- Question: Be Vietnam Pro 400, `text-primary`, `text-base`
- Icon: Lucide `Plus` (closed) / `X` (open), `text-secondary`, `20px`
- Answer panel: Be Vietnam Pro 300, `text-secondary`, `text-sm`, `leading-relaxed`, `pb-5`
- Open/close animation: Framer Motion `AnimatePresence` with `initial={{ height: 0, opacity: 0 }}` and `animate={{ height: 'auto', opacity: 1 }}`, `exit={{ height: 0, opacity: 0 }}`, `transition={{ duration: 0.25, ease: 'easeInOut' }}`
- Only one item open at a time. Opening a new item closes the current one
- State managed with `useState<number | null>(null)` tracking the open index

---

### Step 2.12: Footer

**`Footer.tsx`**

Minimal. Dark background, centered layout, three rows.

Row 1: Mnemix wordmark — Source Serif 4, `text-xl`, `text-primary`
Row 2: Logo slot comment where the logo would sit once provided
Row 3: Three items in a flex row centered with gap:
- `View on GitHub` — link, Be Vietnam Pro 300, `text-secondary`, `text-sm`, opens in new tab
- `·` separator, `text-muted`
- `Built on Supermemory Local` — link to supermemory.ai, same style

Row 4 at very bottom: tagline in Azeret Mono, `text-muted`, `text-xs`:
`your terminal remembers`

Top border: `1px solid var(--border-subtle)`

---

### Step 2.13: App assembly

**`App.tsx`**:
```tsx
import Nav from './components/layout/Nav'
import Hero from './components/sections/Hero'
import TerminalMoment from './components/sections/TerminalMoment'
import ThreePillars from './components/sections/ThreePillars'
import Setup from './components/sections/Setup'
import Faq from './components/sections/Faq'
import Footer from './components/sections/Footer'
import GrainOverlay from './components/ui/GrainOverlay'
import './styles/globals.css'

export default function App() {
  return (
    <main className="relative">
      <GrainOverlay />
      <Nav />
      <Hero />
      <TerminalMoment />
      <ThreePillars />
      <Setup />
      <Faq />
      <Footer />
    </main>
  )
}
```

---

### Step 2.14: Hero image

Place the Google Flow repositioned Image 3 (liquid obsidian diamond, 16:9 landscape) at:
```
packages/landing/public/hero.webp
```

Convert the JPG to WebP before placing it. Target file size under 800KB. If conversion tooling is unavailable, place the JPG as `hero.jpg` and update the `<img>` src accordingly.

---

### Step 2.15: Landing build and preview

```bash
cd packages/landing
npm run dev       # preview locally on localhost:5173
npm run build     # production build
npm run preview   # preview production build
```

Deploy to Vercel:
```bash
npm install -g vercel
vercel --cwd packages/landing
```

---

## Phase 3 — Quality Audit

Run through this list before recording the demo video.

**CLI audit:**
- Install hooks into a clean shell config and confirm no duplicate source lines
- Run a command that fails and confirm the terminal output is exactly the correct format
- Run the fix and fail the command again — confirm the suggestion surfaces
- Run `mnemix list` and confirm the fix appears
- Run `mnemix forget <id>` and confirm it is removed
- Run `mnemix stats` and confirm the numbers are accurate
- Run `mnemix status` with Supermemory Local both running and stopped — confirm both outputs

**Landing page audit:**
- No placeholder text anywhere
- No lorem ipsum anywhere
- No hardcoded hex values in component files (CSS variables only)
- No JetBrains Mono anywhere in the codebase
- Logo and favicon are comment slots, not emoji or placeholder icons
- Every interactive element has a visible focus state
- Copy button changes to checkmark on click and reverts after 1.5 seconds
- FAQ accordion opens and closes correctly, only one item open at a time
- Mouse parallax on hero does not cause layout shift or scrollbar appearance
- 3D card tilt returns to flat when the cursor leaves the card
- Magnetic CTA does not jerk or overshoot
- All scroll-triggered animations fire once and do not repeat on scroll back
- Mobile viewport: all sections are readable, no horizontal overflow

**Final checklist:**
- GitHub repo is public
- README explains what Mnemix is, how to install it and how Supermemory Local is used
- Demo video is maximum 3 minutes
- Google Form submitted: https://forms.gle/ARXHNpFY5VNfiNDBA
- Discord #project-showcase post uses the pinned template
