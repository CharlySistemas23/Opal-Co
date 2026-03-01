import { cn } from "@/utils/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: "ivory" | "stone" | "charcoal" | "transparent";
  spacing?: "tight" | "default" | "loose";
}

const spacingMap = {
  tight: "py-12 md:py-20",
  default: "py-20 md:py-30",
  loose: "py-30 md:py-40",
};

const backgroundMap = {
  ivory: "bg-ivory",
  stone: "bg-stone",
  charcoal: "bg-charcoal text-ivory",
  transparent: "bg-transparent",
};

export function Section({
  className,
  background = "ivory",
  spacing = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        spacingMap[spacing],
        backgroundMap[background],
        className
      )}
      {...props}
    />
  );
}
