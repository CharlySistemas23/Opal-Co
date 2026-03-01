import { cn } from "@/utils/cn";

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return (
    <hr
      className={cn("border-0 border-t border-charcoal/15", className)}
      aria-hidden
    />
  );
}
