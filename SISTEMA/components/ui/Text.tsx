import { cn } from "@/utils/cn";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "body" | "small" | "large";
  muted?: boolean;
}

const variantStyles = {
  body: "text-base md:text-lg leading-relaxed",
  small: "text-sm md:text-base leading-relaxed",
  large: "text-lg md:text-xl leading-relaxed",
};

export function Text({
  variant = "body",
  muted = false,
  className,
  ...props
}: TextProps) {
  return (
    <p
      className={cn(
        "font-sans",
        variantStyles[variant],
        muted && "text-charcoal/70",
        className
      )}
      {...props}
    />
  );
}
