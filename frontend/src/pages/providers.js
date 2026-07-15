import React from 'react';
const _jsxFileName = "src\\pages\\providers.tsx";"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/components/Loader";

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
  }, [checkSession]);

  useEffect(() => {
    if (!mounted) return;
    
    const applyTheme = () => {
      const currentTheme = localStorage.getItem("theme");
      const isDark = currentTheme === "dark" || 
        ((!currentTheme || currentTheme === "system") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    const handleAuthChanged = () => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
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
  }, [checkSession, mounted]);

  if (!mounted || !initialized) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
        , React.createElement(Loader)
      )
    );
  }

  return (
    React.createElement(QueryClientProvider, { client: queryClient, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      , children
    )
  );
}
