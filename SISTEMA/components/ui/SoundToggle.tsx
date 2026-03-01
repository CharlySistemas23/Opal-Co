"use client";

import { useSound } from "@/hooks/useSound";
import { usePathname } from "next/navigation";

const SOUND_ENABLED_PATHS = ["/", "/high-jewelry", "/the-house"];

export function SoundToggle() {
  const { isEnabled, toggle } = useSound();
  const pathname = usePathname();
  const isActivePath = SOUND_ENABLED_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );

  if (!isActivePath) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full border border-charcoal/20 bg-ivory/90 backdrop-blur-sm font-sans text-xs uppercase tracking-wider text-charcoal hover:border-charcoal/40 transition-colors duration-fast"
      aria-label={isEnabled ? "Disable sound" : "Enable sound"}
    >
      {isEnabled ? "Sound on" : "Sound off"}
    </button>
  );
}
