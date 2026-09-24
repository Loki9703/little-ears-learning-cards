"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP);

const GSAP_ANIMALS = new Set(["小狗", "小猫"]);

type Options = {
  name: string;
  isActive: boolean;
  motionCycle: number;
  motionVariant: number;
};

export function hasGsapAnimalTimeline(name: string) {
  return GSAP_ANIMALS.has(name);
}

// Props share the animal's action beats. The actor and its shadow are driven by
// AnimalIllustration's single clock, so two timelines never move the same body.
export function useGsapAnimalTimeline(sceneRef: RefObject<HTMLDivElement | null>, options: Options) {
  const { isActive, motionCycle, motionVariant, name } = options;

  useGSAP(() => {
    const root = sceneRef.current;
    if (!root || !isActive || !GSAP_ANIMALS.has(name)) return;
    const ball = root.querySelector<HTMLElement>(".dog-ball");
    const yarn = root.querySelector<HTMLElement>(".yarn-ball");
    const cushion = root.querySelector<HTMLElement>(".cat-cushion");
    const butterfly = root.querySelector<HTMLElement>(".cat-butterfly");
    const wings = Array.from(root.querySelectorAll<HTMLElement>(".cat-butterfly b"));
    const sparkles = Array.from(root.querySelectorAll<HTMLElement>(".motion-sparkles i"));
    const prints = Array.from(root.querySelectorAll<HTMLElement>(".paw-trail i"));
    const targets = [ball, yarn, cushion, butterfly, ...wings, ...sparkles, ...prints].filter(Boolean);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => gsap.set(targets, { clearProps: "transform,transformOrigin,opacity,visibility" }),
      });
      if (ball) {
        timeline.fromTo(ball, { x: 0, y: 0, rotation: 0 },
          { x: -42, rotation: -180, duration: 1.25, ease: "sine.inOut" }, 1.05)
          .to(ball, { x: 0, rotation: 0, duration: 1.25, ease: "sine.inOut" }, 2.85)
          .to(ball, { y: -22, rotation: 80, duration: .35, ease: "power2.out" }, 4.95)
          .to(ball, { y: 0, rotation: 170, duration: .45, ease: "bounce.out" }, 5.3);
      }
      if (yarn && motionVariant === 0) {
        timeline.fromTo(yarn, { x: 0, rotation: 0 },
          { x: -25, rotation: -120, duration: .4, ease: "power2.out" }, 5.1)
          .to(yarn, { x: 0, rotation: 0, duration: .7, ease: "sine.inOut" }, 5.5);
      }
      if (cushion && motionVariant === 1) {
        timeline.fromTo(cushion, { scaleX: 1, scaleY: 1 },
          { scaleX: 1.05, scaleY: .92, duration: .4, ease: "sine.inOut" }, 4.8)
          .to(cushion, { scaleX: 1, scaleY: 1, duration: .75, ease: "sine.out" }, 5.65);
      }
      if (butterfly && motionVariant === 2) {
        timeline.fromTo(butterfly, { autoAlpha: 0, x: -22, y: 25, rotation: -8 },
          { autoAlpha: 1, x: 0, y: -8, rotation: 5, duration: .6, ease: "sine.out" }, 4.55)
          .to(butterfly, { x: 20, y: -22, rotation: -4, duration: .55, ease: "sine.inOut" }, 5.15)
          .to(butterfly, { autoAlpha: 0, x: 30, y: -32, duration: .65 }, 5.7);
        timeline.fromTo(wings, { scaleX: .3 },
          { scaleX: 1, duration: .12, repeat: 13, yoyo: true, ease: "sine.inOut" }, 4.55);
      }
      if (prints.length) {
        timeline.fromTo(prints, { autoAlpha: 0, scale: .4 },
          { autoAlpha: .62, scale: 1, duration: .28, stagger: .2, ease: "back.out(2)" }, 1.12)
          .to(prints, { autoAlpha: 0, duration: .45, stagger: .12 }, 2.2);
      }
      if (sparkles.length) {
        timeline.fromTo(sparkles, { autoAlpha: 0, scale: 0, y: 8 },
          { autoAlpha: 1, scale: 1, y: 0, duration: .24, stagger: .08, ease: "back.out(2)" }, 5.15)
          .to(sparkles, { autoAlpha: 0, scale: .35, y: -14, duration: .4, stagger: .07 }, 5.85);
      }
      return () => timeline.kill();
    });

    return () => media.revert();
  }, { scope: sceneRef, dependencies: [name, isActive, motionCycle, motionVariant], revertOnUpdate: true });
}
