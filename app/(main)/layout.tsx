import type { ReactNode } from "react";

import { CatalystShell } from "@/components/catalyst-shell";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <CatalystShell>{children}</CatalystShell>;
}
