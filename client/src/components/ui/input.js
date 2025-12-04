import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef(({ className, type, error, icon, iconPosition = "left", ...props }, ref) => {
    return (_jsxs("div", { className: "relative w-full", children: [icon && iconPosition === "left" && (_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: icon })), _jsx("input", { type: type, className: cn(
                // Base styles
                "flex h-11 w-full rounded-lg border bg-background px-4 py-2 text-sm", 
                // Focus styles
                "ring-offset-background transition-all duration-200", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", 
                // Placeholder
                "placeholder:text-muted-foreground", 
                // Disabled
                "disabled:cursor-not-allowed disabled:opacity-50", 
                // File input
                "file:border-0 file:bg-transparent file:text-sm file:font-medium", 
                // Error state
                error
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input hover:border-muted-foreground/50", 
                // Icon padding
                icon && iconPosition === "left" && "pl-10", icon && iconPosition === "right" && "pr-10", className), ref: ref, ...props }), icon && iconPosition === "right" && (_jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: icon }))] }));
});
Input.displayName = "Input";
export { Input };
