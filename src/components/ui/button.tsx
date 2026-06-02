"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-[15px] font-semibold tracking-tight transition-[transform,box-shadow,background-color,border-color,color] duration-[220ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 disabled:pointer-events-none disabled:opacity-45 min-h-[44px] px-6",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-700 text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_4px_16px_-4px_oklch(0.35_0.08_165/0.45)] hover:bg-primary-600 border border-primary-600/20",
        secondary:
          "bg-neutral-0 text-primary-800 border border-neutral-200 shadow-sm hover:border-primary-200 hover:bg-primary-50/50",
        ghost:
          "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent",
        danger:
          "bg-error-600 text-white hover:bg-red-600 shadow-sm border border-red-500/20",
        outline:
          "border border-neutral-200 bg-neutral-0 text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300",
        link: "text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline min-h-0 px-0 h-auto",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm min-h-[36px]",
        lg: "h-12 px-8 text-base min-h-[48px]",
        icon: "h-10 w-10 min-h-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    if (asChild) {
      const filteredProps = Object.entries(props).reduce((acc, [key, value]) => {
        const motionProps = [
          "whileHover",
          "whileTap",
          "transition",
          "onAnimationStart",
          "onDragStart",
          "onDragEnd",
          "onDrag",
          "onDirectionLock",
          "onDragTransitionEnd",
          "onUpdate",
          "onAnimationComplete",
        ];
        if (!motionProps.includes(key)) {
          (acc as Record<string, unknown>)[key] = value;
        }
        return acc;
      }, {});

      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }), "active:scale-[0.98]")}
          ref={ref}
          {...filteredProps}
        >
          {children as React.ReactNode}
        </Slot>
      );
    }

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={loading || props.disabled}
        {...(props as HTMLMotionProps<"button">)}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
