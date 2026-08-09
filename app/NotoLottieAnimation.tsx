"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

type Props = {
  animationSrc: string;
  fallbackSrc: string;
  isPlaying: boolean;
  playKey: number;
};

export default function NotoLottieAnimation({ animationSrc, fallbackSrc, isPlaying, playKey }: Props) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | null = null;
    const container = containerRef.current;
    if (!container) return;

    setIsReady(false);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    void import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (disposed || !containerRef.current) return;

      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: isPlaying && !reducedMotion,
        path: animationSrc,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
        },
      });
      animationRef.current = animation;
      animation.setSpeed(0.92);

      animation.addEventListener("DOMLoaded", () => {
        if (disposed) return;
        setIsReady(true);
        if (!isPlaying || reducedMotion) animation?.goToAndStop(0, true);
      });
      animation.addEventListener("data_failed", () => {
        if (!disposed) setIsReady(false);
      });
    });

    return () => {
      disposed = true;
      animationRef.current = null;
      animation?.destroy();
      container.replaceChildren();
    };
  }, [animationSrc, isPlaying, playKey]);

  return (
    <span className={`noto-lottie-wrap${isReady ? " is-ready" : ""}`} aria-hidden="true">
      <img className="flat-illustration noto-lottie-fallback" src={fallbackSrc} alt="" draggable={false} />
      <span className="noto-lottie-layer" ref={containerRef} />
    </span>
  );
}
