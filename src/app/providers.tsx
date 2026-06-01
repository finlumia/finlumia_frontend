"use client";

import type { PropsWithChildren } from "react";
import { ThemeProvider } from "@/shared/styles/theme.context";

export function AppProviders({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
