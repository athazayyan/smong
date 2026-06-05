"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "reward";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-purple-700 text-white hover:bg-purple-500 shadow-[0_4px_0_0_#2F176E] active:shadow-[0_0px_0_0_#2F176E] active:translate-y-1",
      secondary: "bg-mint-100 text-teal-700 hover:bg-mint-100/80 shadow-[0_4px_0_0_#22B99A] active:shadow-[0_0px_0_0_#22B99A] active:translate-y-1",
      ghost: "bg-transparent text-purple-700 hover:bg-lavender-200/50",
      reward: "bg-yellow-200 text-ink-900 shadow-[0_4px_0_0_#D9B310] active:shadow-[0_0px_0_0_#D9B310] active:translate-y-1",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-xl",
      md: "px-6 py-3 text-base rounded-2xl",
      lg: "px-8 py-4 text-lg rounded-2xl font-bold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: variant === "ghost" ? 1.02 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center transition-colors font-heading",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
