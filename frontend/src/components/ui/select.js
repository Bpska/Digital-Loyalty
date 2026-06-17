const _jsxFileName = "src\\components\\ui\\select.tsx";import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef


(({ className, children, ...props }, ref) => (
  React.createElement(SelectPrimitive.Trigger, {
    ref: ref,
    className: cn(
      "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:border-primary",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}}

    , children
    , React.createElement(SelectPrimitive.Icon, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 23}}
      , React.createElement(ChevronDown, { className: "h-4 w-4 opacity-50"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}} )
    )
  )
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef


(({ className, children, position = "popper", ...props }, ref) => (
  React.createElement(SelectPrimitive.Portal, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
    , React.createElement(SelectPrimitive.Content, {
      ref: ref,
      className: cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-popover-foreground shadow-2xl data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position: position,
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 35}}

      , React.createElement(SelectPrimitive.Viewport, {
        className: cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 46}}

        , children
      )
    )
  )
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(SelectPrimitive.Label, {
    ref: ref,
    className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
  )
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef


(({ className, children, ...props }, ref) => (
  React.createElement(SelectPrimitive.Item, {
    ref: ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground cursor-pointer",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}

    , React.createElement('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}}
      , React.createElement(SelectPrimitive.ItemIndicator, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
        , React.createElement(Check, { className: "h-4 w-4 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}} )
      )
    )

    , React.createElement(SelectPrimitive.ItemText, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, children)
  )
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(SelectPrimitive.Separator, {
    ref: ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
  )
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
