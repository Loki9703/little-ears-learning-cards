"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animalMouths, animalPose, animalProfiles, animalRigs } from "./animalMotion";
import { createDinosaurRenderer } from "./dinosaurRenderer";

type Props = {
  name: string;
  isActive: boolean;
  playKey: number;
  variant: number;
  children: ReactNode;
};

export default function AnimalIllustration({ name, isActive, playKey, variant, children }: Props) {
  const actorRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef({ isActive, playKey, variant });
  const [ready, setReady] = useState(false);
  const profile = animalProfiles[name];
  const rig = profile && animalRigs[profile.slug];

  useEffect(() => {
    playbackRef.current = { isActive, playKey, variant };
  }, [isActive, playKey, variant]);

  useEffect(() => {
    const actor = actorRef.current;
    if (!actor || !profile) return;
    const canvas = canvasRef.current;
    const scene = actor.closest(".flat-scene");
    const shadow = scene?.querySelector<HTMLElement>(".flat-shadow");
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
    const pose = animalPose(profile, 0, 0, playbackRef.current.variant, 0);
    setReady(false);

    const resetPosition = () => {
      actor.style.removeProperty("transform");
      shadow?.style.removeProperty("transform");
      shadow?.style.removeProperty("opacity");
      scene?.classList.remove("has-animal-motion");
    };
    const draw = () => {
      renderer?.draw(pose);
      const size = actor.clientWidth;
      actor.style.transform = `translate3d(${pose.travelX * size}px, ${pose.travelY * size}px, 0) rotateY(${pose.turn * 180}deg) rotate(${pose.lean * 180 / Math.PI}deg) scale(${pose.scaleX}, ${pose.scaleY})`;
      if (shadow) {
        const height = Math.max(0, -pose.travelY);
        shadow.style.transform = `translateX(${pose.travelX * size}px) scaleX(${Math.max(.5, 1 - height * 2.5)})`;
        shadow.style.opacity = String(Math.max(.25, .65 - height * 2));
      }
    };
    const resize = () => {
      if (!canvas) return;
      const size = Math.max(1, Math.round(actor.clientWidth * Math.min(window.devicePixelRatio || 1, 2)));
      if (canvas.width !== size) canvas.width = canvas.height = size;
    };
    const animate = (now: number) => {
      frame = 0;
      if (disposed || document.hidden || !visible || reducedMotion.matches) return;
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
      activity += ((playback.isActive ? 1 : 0) - activity) * Math.min(1, delta * 7);
      const target = animalPose(profile, time, activity, playback.variant, actionAge);
      const blend = Math.min(1, delta * 18);
      for (const key of Object.keys(target) as (keyof typeof target)[]) {
        pose[key] += (target[key] - pose[key]) * blend;
      }
      draw();
      frame = requestAnimationFrame(animate);
    };
    const syncPlayback = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      lastFrame = 0;
      if (reducedMotion.matches) {
        setReady(false);
        resetPosition();
      } else if (visible && !document.hidden) {
        scene?.classList.add("has-animal-motion");
        setReady(Boolean(renderer));
        draw();
        frame = requestAnimationFrame(animate);
      }
    };
    const initialize = () => {
      if (disposed || !canvas || !rig || !artwork.naturalWidth) return;
      renderer?.destroy();
      resize();
      renderer = createDinosaurRenderer(canvas, artwork, rig, animalMouths[profile.slug]);
      syncPlayback();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      renderer?.destroy();
      renderer = null;
      setReady(false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(actor);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    intersectionObserver.observe(actor);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    canvas?.addEventListener("webglcontextlost", contextLost);
    canvas?.addEventListener("webglcontextrestored", initialize);
    if (rig) {
      artwork.onload = initialize;
      artwork.src = `/illustrations/${profile.slug}.svg`;
    }
    syncPlayback();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      canvas?.removeEventListener("webglcontextlost", contextLost);
      canvas?.removeEventListener("webglcontextrestored", initialize);
      artwork.onload = null;
      renderer?.destroy();
      resetPosition();
    };
  }, [profile, rig]);

  return (
    <span ref={actorRef} className={`animal-actor${rig ? " animal-puppet" : ""}${ready ? " is-ready" : ""}`} aria-hidden="true">
      <span className="animal-artwork">{children}</span>
      {rig && <canvas className="animal-puppet-canvas" ref={canvasRef} />}
    </span>
  );
}
