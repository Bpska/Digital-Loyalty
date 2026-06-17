const _jsxFileName = "src\\components\\ui\\label.tsx";import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200"
);

const Label = React.forwardRef



(({ className, ...props }, ref) => (
  React.createElement(LabelPrimitive.Root, {
    ref: ref,
    className: cn(labelVariants(), className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}
  )
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
