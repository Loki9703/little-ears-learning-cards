"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import NotoLottieAnimation from "./NotoLottieAnimation";
import { AIRPLANE_FLIGHT_SECONDS, airplaneFlightPose, type FlightGeometry } from "./airplaneFlight";

gsap.registerPlugin(useGSAP);

export default function AirplaneIllustration({ isActive, playKey }: { isActive: boolean; playKey: number }) {
  const homeRef = useRef<HTMLSpanElement>(null);
  const planeRef = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  useGSAP(() => {
    const home = homeRef.current;
    const plane = planeRef.current;
    if (!host || !home || !plane || !isActive) return;
    const scene = home.closest(".flat-scene");
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const viewport = window.visualViewport;
      const measure = (): FlightGeometry => {
        const rect = home.getBoundingClientRect();
        return {
          home: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
          size: Math.max(1, Math.min(rect.width, rect.height)),
          viewport: {
            x: viewport?.offsetLeft ?? 0, y: viewport?.offsetTop ?? 0,
            width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight,
          },
        };
      };
      let geometry = measure();
      let angle = 0;
      const clock = { progress: 0 };
      const reset = () => {
        home.style.removeProperty("visibility");
        plane.style.removeProperty("visibility");
        plane.style.removeProperty("transform");
        scene?.classList.remove("airplane-in-flight");
      };
      const draw = () => {
        if (clock.progress >= .92) geometry = measure();
        const pose = airplaneFlightPose(clock.progress, geometry);
        angle += ((pose.rotation - angle + 180) % 360 + 360) % 360 - 180;
        plane.style.width = plane.style.height = `${geometry.size}px`;
        plane.style.transform = `translate3d(${pose.x - geometry.size / 2}px, ${pose.y - geometry.size / 2}px, 0) rotate(${angle}deg) scale(${pose.scale})`;
      };
      const resize = () => { geometry = measure(); draw(); };
      home.style.visibility = "hidden";
      plane.style.visibility = "visible";
      scene?.classList.add("airplane-in-flight");
      draw();
      const animation = gsap.to(clock, {
        progress: 1, duration: AIRPLANE_FLIGHT_SECONDS, ease: "none",
        onUpdate: draw, onComplete: reset,
      });
      window.addEventListener("resize", resize);
      window.addEventListener("scroll", resize, true);
      viewport?.addEventListener("resize", resize);
      viewport?.addEventListener("scroll", resize);
      return () => {
        animation.kill();
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", resize, true);
        viewport?.removeEventListener("resize", resize);
        viewport?.removeEventListener("scroll", resize);
        reset();
      };
    });
    return () => media.revert();
  }, { scope: homeRef, dependencies: [host, isActive, playKey], revertOnUpdate: true });

  return (
    <>
      <span ref={homeRef} className="airplane-home">
        <NotoLottieAnimation animationSrc="/animations/noto/airplane.json" fallbackSrc="/illustrations/airplane.svg" isPlaying={false} playKey={playKey} />
      </span>
      {host && createPortal(
        <span className="airplane-flight-layer" aria-hidden="true">
          <span ref={planeRef} className="airplane-flight-actor">
            <NotoLottieAnimation animationSrc="/animations/noto/airplane.json" fallbackSrc="/illustrations/airplane.svg" isPlaying={false} playKey={playKey} />
          </span>
        </span>, host,
      )}
    </>
  );
}
