"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

type Props = {
  animationSrc: string;
  fallbackSrc: string;
  isPlaying: boolean;
  playKey: number;
  idlePlayback?: boolean;
  continuousPlayback?: boolean;
};

export default function NotoLottieAnimation({ animationSrc, fallbackSrc, isPlaying, playKey, idlePlayback = false, continuousPlayback = false }: Props) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const readyRef = useRef(false);
  const playbackRef = useRef({ isPlaying, playKey, idlePlayback, continuousPlayback });
  const updatePlaybackRef = useRef<(restart: boolean) => void>(() => {});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | null = null;
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let visible = true;
    const container = containerRef.current;
    if (!container) return;

    setIsReady(false);
    readyRef.current = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canMove = () => !disposed && visible && !document.hidden && !reducedMotion.matches;
    const scheduleRest = () => {
      clearTimeout(restTimer);
      if (!canMove() || playbackRef.current.continuousPlayback || !playbackRef.current.idlePlayback) return;
      animation?.goToAndStop(0, true);
      // Leave a quiet pause between little gestures; keep longer stories alive.
      restTimer = setTimeout(() => {
        if (!canMove() || !animation) return;
        animation.setSpeed(playbackRef.current.isPlaying ? .96 : .65);
        animation.goToAndPlay(0, true);
      }, playbackRef.current.isPlaying ? 850 : 2800);
    };
    const updatePlayback = (restart = false) => {
      clearTimeout(restTimer);
      if (!animation || !readyRef.current) return;
      animation.loop = playbackRef.current.continuousPlayback;
      if (reducedMotion.matches) {
        animation.goToAndStop(0, true);
      } else if (!canMove()) {
        animation.pause();
      } else if (playbackRef.current.continuousPlayback) {
        animation.setSpeed(.8);
        if (!playbackRef.current.isPlaying) animation.pause();
        else if (restart) animation.goToAndPlay(0, true);
        else animation.play();
      } else if (playbackRef.current.isPlaying) {
        animation.setSpeed(.96);
        if (restart) animation.goToAndPlay(0, true);
        else animation.play();
      } else if (playbackRef.current.idlePlayback) {
        animation.setSpeed(.65);
        // Finish a gesture before resting instead of snapping to frame zero.
        if (animation.currentFrame > 0 && animation.currentFrame < animation.totalFrames - 1) animation.play();
        else scheduleRest();
      } else {
        animation.goToAndStop(0, true);
      }
    };
    updatePlaybackRef.current = updatePlayback;
    const syncPlayback = () => updatePlayback(false);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);

    void import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (disposed || !containerRef.current) return;

      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: playbackRef.current.continuousPlayback,
        autoplay: false,
        path: animationSrc,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
        },
      });
      animation.setSpeed(0.92);

      animation.addEventListener("DOMLoaded", () => {
        if (disposed) return;
        readyRef.current = true;
        setIsReady(true);
        updatePlayback(true);
      });
      animation.addEventListener("complete", scheduleRest);
      animation.addEventListener("data_failed", () => {
        if (!disposed) {
          readyRef.current = false;
          setIsReady(false);
        }
      });
    }).catch(() => {
      if (!disposed) setIsReady(false);
    });

    return () => {
      disposed = true;
      clearTimeout(restTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      updatePlaybackRef.current = () => {};
      readyRef.current = false;
      animation?.destroy();
      container.replaceChildren();
    };
  }, [animationSrc]);

  useEffect(() => {
    playbackRef.current = { isPlaying, playKey, idlePlayback, continuousPlayback };
    updatePlaybackRef.current(isPlaying);
  }, [isPlaying, playKey, idlePlayback, continuousPlayback]);

  return (
    <span className={`noto-lottie-wrap${isReady ? " is-ready" : ""}`} aria-hidden="true">
      <img className="flat-illustration noto-lottie-fallback" src={fallbackSrc} alt="" draggable={false} />
      <span className="noto-lottie-layer" ref={containerRef} />
    </span>
  );
}
