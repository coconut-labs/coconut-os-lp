/* Half-shell coconut glyph — flat, brand spec docs/04-HLD §4.20 logo row.
   Wordmark companion lives in Nav as a separate Inter ExtraBold span. */
export function CoconutGlyph({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {/* outer half-shell */}
      <path
        d="M3 16 a13 13 0 0 1 26 0 z"
        fill="currentColor"
      />
      {/* inner flesh notch */}
      <path
        d="M7.4 15.6 a8.6 8.6 0 0 1 17.2 0 z"
        fill="var(--canvas)"
      />
      {/* three dot eyes of the coconut */}
      <circle cx="12.5" cy="13.2" r="0.95" fill="currentColor" />
      <circle cx="16" cy="11.6" r="0.95" fill="currentColor" />
      <circle cx="19.5" cy="13.2" r="0.95" fill="currentColor" />
    </svg>
  );
}
