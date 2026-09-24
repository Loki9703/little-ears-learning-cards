"use client";

import { useEffect, useRef, useState } from "react";
import { dinosaurMouths, dinosaurPose, dinosaurRigs } from "./dinosaurMotion";
import { createDinosaurRenderer } from "./dinosaurRenderer";

export type DinosaurIllustrationProps = {
  slug: string;
  isActive: boolean;
  playKey: number;
  variant: number;
  playStage: "name" | "sound" | "lesson" | null;
};

export default function DinosaurIllustration({ slug, isActive, playKey, variant, playStage }: DinosaurIllustrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playbackRef = useRef({ isActive, playKey, variant, playStage });
  const [ready, setReady] = useState(false);
  const src = `/illustrations/dinosaurs/${slug}.webp`;

  useEffect(() => {
    playbackRef.current = { isActive, playKey, variant, playStage };
  }, [isActive, playKey, variant, playStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rig = dinosaurRigs[slug];
    if (!canvas || !rig) return;
    const actor = canvas.parentElement;
    const scene = canvas.closest(".flat-scene");
    const shadow = scene?.querySelector<HTMLElement>(".flat-shadow");
    setReady(false);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const artwork = new Image();
    let renderer: ReturnType<typeof createDinosaurRenderer> = null;
    let disposed = false;
    let visible = true;
    let frame = 0;
    let lastFrame = 0;
    let time = 0;
    let activity = 0;
    let actionAge = 0;
    let lastPlayKey = playbackRef.current.playKey;
    const currentPose = dinosaurPose(rig, 0, 0, playbackRef.current.variant, false, 0);

    const resetPosition = () => {
      actor?.style.removeProperty("transform");
      shadow?.style.removeProperty("transform");
      shadow?.style.removeProperty("opacity");
    };
    const draw = () => {
      renderer?.draw(currentPose);
      const size = canvas.clientWidth;
      if (actor) {
        actor.style.transform = `translate3d(${currentPose.travelX * size}px, ${currentPose.travelY * size}px, 0) rotateY(${currentPose.turn * 180}deg) rotate(${currentPose.lean * 180 / Math.PI}deg)`;
      }
      if (shadow) {
        shadow.style.transform = `translateX(${currentPose.travelX * size}px) scaleX(${1 + currentPose.travelY * 4})`;
        shadow.style.opacity = String(.65 + currentPose.travelY * 4);
      }
    };

    const resize = () => {
      const size = Math.max(1, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)));
      if (canvas.width !== size) canvas.width = canvas.height = size;
    };
    const animate = (now: number) => {
      frame = 0;
      if (disposed || !renderer || document.hidden || !visible || reducedMotion.matches) return;
      if (lastFrame && now - lastFrame < 1000 / 30) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, .08) : 0;
      lastFrame = now;
      time += delta;
      const playback = playbackRef.current;
      if (lastPlayKey !== playback.playKey) {
        lastPlayKey = playback.playKey;
        actionAge = 0;
      }
      actionAge += delta;
      const target = playback.isActive ? 1 : 0;
      activity += (target - activity) * Math.min(1, delta * 7);
      const targetPose = dinosaurPose(rig, time, activity, playback.variant, playback.playStage === "sound", actionAge);
      const blend = Math.min(1, delta * 18);
      for (const key of Object.keys(targetPose) as (keyof typeof targetPose)[]) {
        currentPose[key] += (targetPose[key] - currentPose[key]) * blend;
      }
      draw();
      frame = requestAnimationFrame(animate);
    };
    const syncPlayback = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      if (reducedMotion.matches) {
        setReady(false);
        scene?.classList.remove("has-dinosaur-motion");
        resetPosition();
      } else if (renderer && !document.hidden && visible) {
        draw();
        scene?.classList.add("has-dinosaur-motion");
        setReady(true);
        frame = requestAnimationFrame(animate);
      }
    };
    const initialize = () => {
      if (disposed || !artwork.complete || !artwork.naturalWidth) return;
      renderer?.destroy();
      resize();
      renderer = createDinosaurRenderer(canvas, artwork, rig, dinosaurMouths[slug]);
      syncPlayback();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      renderer?.destroy();
      renderer = null;
      setReady(false);
      scene?.classList.remove("has-dinosaur-motion");
      resetPosition();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", initialize);
    artwork.onload = initialize;
    artwork.src = src;

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", initialize);
      artwork.onload = null;
      renderer?.destroy();
      scene?.classList.remove("has-dinosaur-motion");
      resetPosition();
    };
  }, [slug, src]);

  return (
    <span className={`dinosaur-puppet${ready ? " is-ready" : ""}`} aria-hidden="true">
      <img className="flat-illustration dinosaur-puppet-fallback" src={src} alt="" draggable={false} />
      <canvas className="dinosaur-puppet-canvas" ref={canvasRef} />
    </span>
  );
}
