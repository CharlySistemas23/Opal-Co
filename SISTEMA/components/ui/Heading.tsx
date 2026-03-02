import { cn } from "@/utils/cn";

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  level?: HeadingLevel;
}

const levelStyles: Record<HeadingLevel, string> = {
  1: "font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight",
  2: "font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight",
  3: "font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight",
  4: "font-serif text-xl md:text-2xl tracking-tight",
};

export function Heading({
  as,
  level = 1,
  className,
  ...props
}: HeadingProps) {
  const Tag = as ?? (`h${level}` as "h1" | "h2" | "h3" | "h4");
  return (
    <Tag
      className={cn(levelStyles[level], className)}
      {...props}
    />
  );
}
