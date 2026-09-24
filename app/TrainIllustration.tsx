"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { TRAIN_JOURNEY_SECONDS, trainJourneyX } from "./trainJourney";

gsap.registerPlugin(useGSAP);

function TrainArtwork({ fallbackSrc }: { fallbackSrc: string }) {
  return (
    <span className="train-consist" aria-hidden="true">
      <span className="train-engine">
        {/* Movement belongs to train-consist; an independent engine clip breaks the coupling. */}
        <img className="flat-illustration" src={fallbackSrc} alt="" draggable={false} />
        <span className="smoke-puffs"><i /><i /><i /></span>
      </span>
      {[0, 1].map((carriage) => (
        <span className="train-carriage" key={carriage}>
          <img className="flat-illustration" src="/illustrations/railway-car.svg" alt="" draggable={false} />
        </span>
      ))}
    </span>
  );
}

export default function TrainIllustration({ fallbackSrc, isActive, playKey }: {
  fallbackSrc: string;
  isActive: boolean;
  playKey: number;
}) {
  const homeRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const trainRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  useGSAP(() => {
    const home = homeRef.current;
    const layer = layerRef.current;
    const train = trainRef.current;
    const track = trackRef.current;
    if (!host || !home || !layer || !train || !track || !isActive) return;
    const scene = home.closest(".flat-scene");
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const viewport = window.visualViewport;
      const clock = { progress: 0 };
      const measure = () => ({
        rect: home.getBoundingClientRect(),
        viewportX: viewport?.offsetLeft ?? 0,
        viewportWidth: viewport?.width ?? window.innerWidth,
      });
      let geometry = measure();
      const reset = () => {
        home.style.removeProperty("visibility");
        layer.style.removeProperty("visibility");
        scene?.classList.remove("train-on-journey");
      };
      const draw = () => {
        // Follow the card during the final approach, including release of its pressed scale.
        if (clock.progress > .9) geometry = measure();
        const { rect, viewportX, viewportWidth } = geometry;
        const x = trainJourneyX(clock.progress, { homeX: rect.left, width: rect.width, viewportX, viewportWidth });
        train.style.width = `${rect.width}px`;
        train.style.height = `${rect.height}px`;
        train.style.transform = `translate3d(${x}px, ${rect.top}px, 0)`;
        track.style.left = `${viewportX}px`;
        track.style.width = `${viewportWidth}px`;
        track.style.top = `${rect.bottom - 38}px`;
      };
      const resize = () => { geometry = measure(); draw(); };
      home.style.visibility = "hidden";
      layer.style.visibility = "visible";
      scene?.classList.add("train-on-journey");
      draw();
      const animation = gsap.to(clock, {
        progress: 1, duration: TRAIN_JOURNEY_SECONDS, ease: "none",
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
  }, { scope: homeRef, dependencies: [host, isActive, playKey, fallbackSrc], revertOnUpdate: true });

  return <>
    <span ref={homeRef} className="train-home"><TrainArtwork fallbackSrc={fallbackSrc} /></span>
    {host && createPortal(
      <span ref={layerRef} className="train-journey-layer" aria-hidden="true">
        <i ref={trackRef} className="train-track" />
        <span ref={trainRef} className="train-journey-actor"><TrainArtwork fallbackSrc={fallbackSrc} /></span>
      </span>, host,
    )}
  </>;
}
