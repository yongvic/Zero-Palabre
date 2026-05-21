import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[15px] font-semibold tracking-tight transition-[background,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:shadow-focus-primary disabled:pointer-events-none disabled:opacity-45 min-h-[44px] px-6",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-800 text-neutral-0 hover:bg-primary-700 hover:shadow-md active:bg-primary-900 active:translate-y-px",
        secondary:
          "border-[1.5px] border-primary-400 bg-transparent text-primary-800 font-medium hover:bg-primary-50 hover:border-primary-600 active:bg-primary-100",
        ghost:
          "bg-transparent text-neutral-600 font-medium hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-150",
        danger:
          "bg-error-600 text-neutral-0 hover:bg-error-800 focus-visible:shadow-focus-error",
        outline:
          "border border-neutral-200 bg-neutral-0 text-neutral-900 hover:bg-neutral-75",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
