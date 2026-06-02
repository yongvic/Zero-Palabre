"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
    variant?: "default" | "muted" | "paper";
  }
>(({ className, interactive, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl p-6 transition-[transform,box-shadow,border-color] duration-[220ms] ease-out",
      variant === "default" && "glass-card text-neutral-900",
      variant === "muted" && "bg-neutral-100/80 border border-neutral-200/80 text-neutral-900",
      variant === "paper" && "glass-paper text-neutral-900",
      interactive &&
        "group hover-lift cursor-pointer hover:border-primary-200/80 active:scale-[0.99]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-5 flex flex-col gap-1.5", className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-bold tracking-tight text-neutral-950", className)}
    {...props}
  />
);

const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm leading-relaxed text-neutral-600", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription };
