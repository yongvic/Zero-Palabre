import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border-[1.5px] border-neutral-200 bg-neutral-0 px-3.5 text-[15px] text-neutral-900 transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400 focus:border-primary-600 focus:shadow-focus-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-75 disabled:text-neutral-400",
          error && "border-error-600 focus:border-error-600 focus:shadow-focus-error",
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
