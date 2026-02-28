"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function RevealOnScroll({ children, className, delay = 0 }: RevealOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        delay,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
