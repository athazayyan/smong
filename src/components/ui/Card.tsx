import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl bg-white p-6 shadow-[0_8px_24px_rgba(47,23,110,0.08)] border-2 border-lavender-200/50",
          variant === "interactive" && "hover:border-purple-500 transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };
