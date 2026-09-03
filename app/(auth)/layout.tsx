import Image from "next/image";
import type { ReactNode } from "react";

import { GuestGate } from "@/components/auth/guest-gate";
import { HeroGrainientBackground } from "@/components/hero-grainient-background";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGate>
      <div className="relative flex min-h-dvh items-center justify-center bg-shell p-4">
        <HeroGrainientBackground />
        <div className="relative z-10 flex w-full flex-col items-center gap-8">
          <Image
            src="/images/logo.png"
            alt="Mindnow"
            width={48}
            height={48}
            className="size-12 object-contain"
            priority
          />
          {children}
        </div>
      </div>
    </GuestGate>
  );
}
