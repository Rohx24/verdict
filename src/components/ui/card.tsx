import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_25px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-white/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(146,255,111,0.12),transparent_35%)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 border-b border-white/5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold tracking-tight text-white",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 text-sm text-white/75", className)} {...props} />;
}
