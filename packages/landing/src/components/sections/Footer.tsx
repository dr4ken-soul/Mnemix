/**
 * Minimal footer with wordmark, links and tagline.
 * Logo remains a comment slot until the asset is provided.
 */
export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        {/* Logo slot: replace with public/logo.svg once provided */}
        <span className="font-serif text-xl text-[var(--text-primary)]">
          Mnemix
        </span>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link font-sans text-sm font-light text-[var(--text-secondary)]"
          >
            View on GitHub
          </a>
          <span className="text-[var(--text-muted)]">·</span>
          <a
            href="https://supermemory.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link font-sans text-sm font-light text-[var(--text-secondary)]"
          >
            Built on Supermemory Local
          </a>
        </div>

        <span className="font-mono text-xs tracking-[0.1em] text-[var(--text-muted)]">
          your terminal remembers
        </span>
      </div>
    </footer>
  )
}
