import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  variant?: "default" | "glass";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl px-4 text-[15px] text-neutral-900 ring-offset-transparent transition-[border-color,box-shadow,background] duration-[220ms] ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          variant === "default" &&
            "border border-neutral-200/80 bg-white/90 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-0 focus-visible:border-primary-400/50",
          variant === "glass" &&
            "glass-input text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-0",
          error && "border-error-600/80 focus-visible:ring-error-600/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
