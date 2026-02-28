/**
 * Returns focusable elements within a container.
 */
export function getFocusables(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Creates a focus trap: Tab cycles within container, Shift+Tab cycles backwards.
 * Call the returned cleanup function to remove listeners.
 */
export function createFocusTrap(
  container: HTMLElement,
  options?: { initialFocus?: HTMLElement; onEscape?: () => void }
): () => void {
  const focusables = getFocusables(container);
  const first = options?.initialFocus ?? focusables[0];
  const last = focusables[focusables.length - 1];

  if (first) {
    first.focus();
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      options?.onEscape?.();
      return;
    }
    if (e.key !== "Tab") return;

    const current = document.activeElement as HTMLElement | null;
    if (!container.contains(current)) return;

    if (e.shiftKey) {
      if (current === first && last) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (current === last && first) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}
