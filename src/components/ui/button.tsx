"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md text-[15px] font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 min-h-[44px] px-6 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-700 text-neutral-0 shadow-sm hover:bg-primary-600 hover:shadow-md",
        secondary:
          "border border-primary-200 bg-primary-50 text-primary-800 hover:bg-primary-100 hover:border-primary-300",
        ghost:
          "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
        danger:
          "bg-error-600 text-neutral-0 hover:bg-red-700 shadow-sm",
        outline:
          "border border-neutral-200 bg-neutral-0 text-neutral-900 hover:bg-neutral-50 shadow-sm",
        link: "text-primary-700 underline-offset-4 hover:underline min-h-0 px-0 h-auto",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm min-h-[36px]",
        lg: "h-12 px-8 text-base",
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
      // Filter out motion props manually to avoid passing them to the Slot
      const filteredProps = Object.entries(props).reduce((acc, [key, value]) => {
        const motionProps = [
          "whileHover", "whileTap", "transition", "onAnimationStart", 
          "onDragStart", "onDragEnd", "onDrag", "onDirectionLock", 
          "onDragTransitionEnd", "onUpdate", "onAnimationComplete"
        ];
        if (!motionProps.includes(key)) {
          (acc as Record<string, unknown>)[key] = value;
        }
        return acc;
      }, {});

      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...filteredProps}
        >
          {children as React.ReactNode}
        </Slot>
      );
    }

    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
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

