import React from 'react';
const _jsxFileName = "src\\pages\\providers.tsx";"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function ClientProviders({
  children,
}) {
  const checkSession = useAuthStore((state) => state.checkSession);
  const initialized = useAuthStore((state) => state.initialized);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSession();

    // Global Theme Application
    const applyTheme = () => {
      const theme = localStorage.getItem("theme") || "system";
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    // Listen for storage changes to sync tabs and logout states
    const handleAuthChanged = () => {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const accessToken = localStorage.getItem("accessToken");
      
      // Update the Zustand store directly to avoid hitting the backend in an infinite loop
      useAuthStore.setState({ user, accessToken });
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);
    window.addEventListener("theme-changed", applyTheme);
    
    // Listen for matchMedia changes for system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
      window.removeEventListener("theme-changed", applyTheme);
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [checkSession]);

  if (!mounted || !initialized) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
        , React.createElement('div', { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}} )
      )
    );
  }

  return (
    React.createElement(QueryClientProvider, { client: queryClient, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      , children
    )
  );
}
