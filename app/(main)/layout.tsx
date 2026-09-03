import type { ReactNode } from "react";

import { MainLayoutClient } from "@/components/main-layout-client";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <MainLayoutClient>{children}</MainLayoutClient>;
}
