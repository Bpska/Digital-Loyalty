const _jsxFileName = "src\\components\\ui\\dialog.tsx";import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(DialogPrimitive.Overlay, {
    ref: ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}
  )
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef


(({ className, children, ...props }, ref) => (
  React.createElement(DialogPortal, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 30}}
    , React.createElement(DialogOverlay, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 31}} )
    , React.createElement(DialogPrimitive.Content, {
      ref: ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out rounded-xl max-h-[90vh] overflow-y-auto",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}}

      , children
      , React.createElement(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 41}}
        , React.createElement(X, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}} )
        , React.createElement('span', { className: "sr-only", __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}}, "Close")
      )
    )
  )
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}) => (
  React.createElement('div', {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
  )
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}) => (
  React.createElement('div', {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}}
  )
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(DialogPrimitive.Title, {
    ref: ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
  )
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(DialogPrimitive.Description, {
    ref: ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}
  )
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
