import { cn } from "@/utils/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "container" | "full";
  padding?: "default" | "none";
}

export function Container({
  className,
  maxWidth = "container",
  padding = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidth === "container" && "max-w-container",
        padding === "default" && "px-6 md:px-12 lg:pl-padding-desktop lg:pr-padding-desktop",
        className
      )}
      {...props}
    />
  );
}
