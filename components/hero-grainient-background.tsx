"use client";

import dynamic from "next/dynamic";

const Grainient = dynamic(() => import("@/components/grainient"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-900" aria-hidden />,
});

/** Animated hero header — React Bits Grainient preset. */
export function HeroGrainientBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Grainient
        color1="#D94716"
        color2="#111113"
        color3="#FED7AA"
        timeSpeed={0.1}
        colorBalance={-0.45}
        warpStrength={2.8}
        warpFrequency={3.7}
        warpSpeed={1.3}
        warpAmplitude={16}
        noiseScale={3.15}
        grainAmount={0.12}
        grainScale={3.5}
        grainAnimated
        gamma={1.35}
        zoom={1.9}
      />
    </div>
  );
}
