const _jsxFileName = "src\\components\\ui\\card.tsx";import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef


(({ className, glass = false, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
      glass ? "glass border-border" : "border-border",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}}
  )
));
Card.displayName = "Card";

const CardHeader = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}}
  )
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('h3', {
    ref: ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
  )
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('p', {
    ref: ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
  )
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', { ref: ref, className: cn("p-6 pt-0", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}} )
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
  )
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
