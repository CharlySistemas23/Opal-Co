import { cn } from "@/utils/cn";

interface SpacerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-12 md:h-20",
  md: "h-20 md:h-30",
  lg: "h-30 md:h-40",
};

export function Spacer({ size = "md", className }: SpacerProps) {
  return <div className={cn(sizeMap[size], className)} aria-hidden />;
}
