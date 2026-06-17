const _jsxFileName = "src\\components\\ui\\input.tsx";import * as React from "react";
import { cn } from "@/lib/utils";




const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      React.createElement('input', {
        type: type,
        className: cn(
          "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:border-primary",
          className
        ),
        ref: ref,
        ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 10}}
      )
    );
  }
);
Input.displayName = "Input";

export { Input };
