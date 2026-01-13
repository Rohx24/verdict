import * as React from "react";
import Link from "next/link";
import type { UrlObject } from "url";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "lg" | "sm";
type LinkHref = string | UrlObject;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: LinkHref;
  target?: string;
  rel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-gradient-to-r from-[#6ef3b8] via-[#92ff6f] to-[#4be1ff] text-[#03120b] shadow-[0_20px_60px_-25px_rgba(146,255,111,0.6)] hover:shadow-[0_30px_80px_-35px_rgba(146,255,111,0.75)] hover:-translate-y-[2px] hover:brightness-110",
  outline:
    "border border-white/20 text-white hover:border-[#92ff6f] hover:text-[#92ff6f] bg-white/5 hover:bg-white/10",
  ghost: "text-white hover:text-[#92ff6f] hover:bg-white/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  default: "h-12 px-6 text-sm md:text-base",
  lg: "h-14 px-8 text-base md:text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", type = "button", href, children, ...props },
    ref,
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.06em] transition-transform transition-shadow duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#92ff6f] disabled:pointer-events-none disabled:opacity-60",
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    if (href) {
      const { target, rel, ...rest } = props;
      return (
        <Link
          href={href}
          className={classes}
          ref={ref as React.Ref<HTMLAnchorElement>}
          target={target}
          rel={rel}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        type={type}
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
