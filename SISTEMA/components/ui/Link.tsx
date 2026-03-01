import NextLink from "next/link";
import { cn } from "@/utils/cn";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  underline?: boolean;
  external?: boolean;
  children: React.ReactNode;
}

export function Link({
  href,
  underline = false,
  external = false,
  className,
  children,
  ...props
}: LinkProps) {
  const baseStyles =
    "font-sans text-sm uppercase tracking-[0.2em] transition-colors duration-fast ease-luxury hover:text-champagne";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseStyles, underline && "underline underline-offset-4", className)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      className={cn(baseStyles, underline && "underline underline-offset-4", className)}
      {...props}
    >
      {children}
    </NextLink>
  );
}
