const _jsxFileName = "src\\components\\ui\\avatar.tsx";import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(AvatarPrimitive.Root, {
    ref: ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-muted",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}}
  )
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(AvatarPrimitive.Image, {
    ref: ref,
    className: cn("aspect-square h-full w-full object-cover", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}}
  )
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(AvatarPrimitive.Fallback, {
    ref: ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-sm",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
  )
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
