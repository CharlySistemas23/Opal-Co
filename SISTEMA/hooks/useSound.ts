"use client";

import { useSoundContext } from "@/context/SoundContext";

export function useSound() {
  return useSoundContext();
}
