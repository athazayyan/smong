import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  variant?: "default" | "teal" | "yellow";
  size?: "sm" | "md";
  showLabel?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, variant = "default", size = "md", showLabel = false, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const trackColors = {
      default: "bg-lavender-200",
      teal: "bg-mint-100",
      yellow: "bg-yellow-200/40",
    };

    const fillColors = {
      default: "bg-purple-500",
      teal: "bg-teal-500",
      yellow: "bg-yellow-200",
    };

    const heights = {
      sm: "h-2",
      md: "h-3",
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <span className="text-xs font-semibold text-ink-700 mb-1 block">
            {clampedValue}%
          </span>
        )}
        <div className={cn("w-full rounded-full overflow-hidden", heights[size], trackColors[variant])}>
          <div
            className={cn("h-full rounded-full transition-all duration-500", fillColors[variant])}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
