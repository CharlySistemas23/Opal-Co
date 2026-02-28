"use client";

import { useScroll, useTransform, type MotionValue } from "framer-motion";

export function useParallax(ratio: number = 0.9): MotionValue<number> {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 1000], [0, (1 - ratio) * 1000]);
}
