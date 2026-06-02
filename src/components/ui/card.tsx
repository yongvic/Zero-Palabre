"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
    variant?: "light" | "dark" | "paper";
  }
>(({ className, interactive, variant = "light", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl p-6 transition-[transform,box-shadow,border-color] duration-[220ms] ease-out",
      variant === "light" && "glass-card text-neutral-900",
      variant === "dark" && "glass-card-dark text-neutral-100",
      variant === "paper" && "glass-paper text-neutral-900",
      interactive &&
        "hover-lift cursor-pointer hover:border-primary-300/40 active:scale-[0.99]",
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
