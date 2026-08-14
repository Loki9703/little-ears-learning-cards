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

type SceneElements = {
  animal: HTMLElement;
  shadow: HTMLElement | null;
  ball: HTMLElement | null;
  yarn: HTMLElement | null;
  cushion: HTMLElement | null;
  butterfly: HTMLElement | null;
  butterflyWings: HTMLElement[];
  sparkles: HTMLElement[];
  pawPrints: HTMLElement[];
};

type Timeline = ReturnType<typeof gsap.timeline>;

function animateSparkles(timeline: Timeline, sparkles: HTMLElement[], start = 0.5) {
  if (!sparkles.length) return;

  timeline
    .fromTo(
      sparkles,
      { autoAlpha: 0, scale: 0, y: 8 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.24, stagger: 0.08, ease: "back.out(2)" },
      start,
    )
    .to(
      sparkles,
      { autoAlpha: 0, scale: 0.35, y: -14, duration: 0.4, stagger: 0.07, ease: "power1.in" },
      start + 0.58,
    );
}

function animateShadow(timeline: Timeline, shadow: HTMLElement | null, beats: number[]) {
  if (!shadow) return;

  timeline.fromTo(
    shadow,
    { autoAlpha: 0.65, scaleX: 1 },
    { autoAlpha: 0.26, scaleX: 0.56, duration: 0.3, ease: "power2.out" },
    beats[0],
  );

  for (let index = 1; index < beats.length; index += 1) {
    timeline.to(
      shadow,
      {
        autoAlpha: index % 2 === 0 ? 0.28 : 0.7,
        scaleX: index % 2 === 0 ? 0.58 : 0.92,
        duration: 0.24,
        ease: "sine.inOut",
      },
      beats[index],
    );
  }

  timeline.to(shadow, { autoAlpha: 0.65, scaleX: 1, duration: 0.28 }, beats[beats.length - 1] + 0.3);
}

function buildDogTimeline(timeline: Timeline, elements: SceneElements, variant: number) {
  const { animal, ball, pawPrints, shadow, sparkles } = elements;

  if (variant === 1) {
    timeline
      .fromTo(
        animal,
        { autoAlpha: 0, xPercent: -105, y: 9, rotation: -5, scale: 0.75 },
        { autoAlpha: 1, xPercent: -45, y: -22, rotation: 7, scaleX: 0.91, scaleY: 1.05, duration: 0.82, ease: "power2.out" },
        0,
      )
      .to(animal, { xPercent: -16, y: 1, rotation: -4, scaleX: 1.08, scaleY: 0.91, duration: 0.4, ease: "power2.in" })
      .to(animal, { xPercent: 19, y: -34, rotation: 8, scaleX: 0.97, scaleY: 1.06, duration: 0.5, ease: "power2.out" })
      .to(animal, { xPercent: 11, y: 0, rotation: -3, scaleX: 1.07, scaleY: 0.92, duration: 0.4, ease: "power2.in" })
      .to(animal, { xPercent: -3, y: -15, rotation: -3, scaleX: 1, scaleY: 1, duration: 0.46, ease: "power2.out" })
      .to(animal, { xPercent: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.42, ease: "back.out(1.5)" });
  } else if (variant === 2) {
    timeline
      .set(animal, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1 })
      .to(animal, { y: 7, scaleX: 1.08, scaleY: 0.9, duration: 0.34, ease: "power2.in" })
      .to(animal, { x: -17, y: -49, rotation: -8, scaleX: 0.96, scaleY: 1.07, duration: 0.52, ease: "power2.out" })
      .to(animal, { x: -7, y: 1, rotation: 3, scaleX: 1.09, scaleY: 0.9, duration: 0.4, ease: "power2.in" })
      .to(animal, { x: 17, y: -34, rotation: 8, scaleX: 0.98, scaleY: 1.05, duration: 0.48, ease: "power2.out" })
      .to(animal, { x: 7, y: 0, rotation: -3, scaleX: 1.07, scaleY: 0.92, duration: 0.4, ease: "power2.in" })
      .to(animal, { x: 0, y: -13, rotation: -2, scaleX: 1, scaleY: 1, duration: 0.38, ease: "power2.out" })
      .to(animal, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.36, ease: "back.out(1.6)" });
  } else {
    timeline
      .fromTo(
        animal,
        { autoAlpha: 0, xPercent: -120, y: 12, rotation: -7, scale: 0.72 },
        { autoAlpha: 1, xPercent: -48, y: -25, rotation: 7, scaleX: 0.9, scaleY: 1.03, duration: 0.8, ease: "power2.out" },
        0,
      )
      .to(animal, { xPercent: -15, y: 3, rotation: -3, scaleX: 1.08, scaleY: 0.9, duration: 0.37, ease: "power2.in" })
      .to(animal, { xPercent: 2, y: -58, rotation: 5, scaleX: 0.96, scaleY: 1.08, duration: 0.55, ease: "power2.out" })
      .to(animal, { xPercent: 8, y: 2, rotation: -2, scaleX: 1.1, scaleY: 0.89, duration: 0.42, ease: "power2.in" })
      .to(animal, { xPercent: -3, y: -31, rotation: -5, scaleX: 0.98, scaleY: 1.04, duration: 0.45, ease: "power2.out" })
      .to(animal, { xPercent: 0, y: 1, rotation: 2, scaleX: 1.05, scaleY: 0.94, duration: 0.36, ease: "power2.in" })
      .to(animal, { xPercent: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.3, ease: "back.out(1.5)" });
  }

  if (ball) {
    timeline
      .fromTo(ball, { x: 0, y: 0, rotation: -12 }, { x: -25, y: -36, rotation: 80, duration: 0.46, ease: "power2.out" }, 0.58)
      .to(ball, { x: -47, y: 0, rotation: 170, scaleX: 1.06, scaleY: 0.92, duration: 0.38, ease: "power2.in" }, 1.04)
      .to(ball, { x: -29, y: -19, rotation: 230, scaleX: 1, scaleY: 1, duration: 0.4, ease: "power2.out" }, 1.42)
      .to(ball, { x: -10, y: 0, rotation: 310, scaleX: 1.03, scaleY: 0.95, duration: 0.32, ease: "power2.in" }, 1.82)
      .to(ball, { x: 0, y: 0, rotation: 348, scaleX: 1, scaleY: 1, duration: 0.34, ease: "power2.out" }, 2.14);
  }

  if (pawPrints.length) {
    timeline.fromTo(
      pawPrints,
      { autoAlpha: 0, scale: 0.4, x: -12 },
      { autoAlpha: 0.62, scale: 1, x: 0, duration: 0.28, stagger: 0.16, ease: "back.out(2)" },
      0.48,
    ).to(pawPrints, { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.1 }, 1.38);
  }

  animateShadow(timeline, shadow, [0.45, 1.05, 1.5, 2.02, 2.42]);
  animateSparkles(timeline, sparkles, 0.52);
}

function buildCatTimeline(timeline: Timeline, elements: SceneElements, variant: number) {
  const { animal, butterfly, butterflyWings, cushion, shadow, sparkles, yarn } = elements;

  timeline.set(animal, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1 }, 0);

  if (variant === 1) {
    timeline
      .to(animal, { y: 6, rotation: -2, scaleX: 1.13, scaleY: 0.83, duration: 0.52, ease: "power2.inOut" }, 0.15)
      .to(animal, { x: 15, y: 4, rotation: 5, scaleX: 1.2, scaleY: 0.78, duration: 0.55, ease: "sine.inOut" }, 0.67)
      .to(animal, { x: 15, y: 4, rotation: 5, scaleX: 1.2, scaleY: 0.78, duration: 0.34 }, 1.22)
      .to(animal, { x: 0, y: -38, rotation: -5, scaleX: 0.94, scaleY: 1.1, duration: 0.48, ease: "power2.out" }, 1.56)
      .to(animal, { x: 0, y: 1, rotation: 2, scaleX: 1.07, scaleY: 0.93, duration: 0.38, ease: "power2.in" }, 2.04)
      .to(animal, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.5, ease: "back.out(1.5)" }, 2.42);

    if (cushion) {
      timeline
        .fromTo(cushion, { rotation: -4, scale: 1 }, { rotation: -2, scaleX: 1.12, scaleY: 0.78, duration: 0.5, ease: "power2.inOut" }, 0.56)
        .to(cushion, { rotation: -5, scaleX: 0.97, scaleY: 1.08, duration: 0.4, ease: "power2.out" }, 1.45)
        .to(cushion, { rotation: -4, scaleX: 1, scaleY: 1, duration: 0.44, ease: "sine.out" }, 1.85);
    }

    animateShadow(timeline, shadow, [0.5, 1.15, 1.65, 2.05]);
  } else if (variant === 2) {
    timeline
      .to(animal, { y: 6, scaleX: 1.08, scaleY: 0.9, duration: 0.36, ease: "power2.in" }, 0.12)
      .to(animal, { x: 30, y: -63, rotation: 10, scaleX: 0.95, scaleY: 1.08, duration: 0.58, ease: "power2.out" }, 0.48)
      .to(animal, { x: 43, y: 0, rotation: -4, scaleX: 1.09, scaleY: 0.9, duration: 0.42, ease: "power2.in" }, 1.06)
      .to(animal, { x: 9, y: -37, rotation: -9, scaleX: 0.98, scaleY: 1.05, duration: 0.48, ease: "power2.out" }, 1.48)
      .to(animal, { x: -4, y: 0, rotation: 3, scaleX: 1.07, scaleY: 0.93, duration: 0.4, ease: "power2.in" }, 1.96)
      .to(animal, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.58, ease: "back.out(1.55)" }, 2.36);

    if (butterfly) {
      timeline.fromTo(
        butterfly,
        { autoAlpha: 0, x: -70, y: 55, rotation: -15, scale: 0.7 },
        { autoAlpha: 1, x: -30, y: 7, rotation: 9, scale: 1, duration: 0.86, ease: "power2.out" },
        0.2,
      )
        .to(butterfly, { x: 18, y: 26, rotation: -8, scale: 0.92, duration: 0.66, ease: "sine.inOut" }, 1.06)
        .to(butterfly, { autoAlpha: 1, x: -8, y: -4, rotation: 4, scale: 1, duration: 0.52, ease: "sine.inOut" }, 1.72)
        .to(butterfly, { autoAlpha: 0, x: 22, y: -25, rotation: 8, scale: 0.8, duration: 0.52, ease: "power1.in" }, 2.24);
    }

    if (butterflyWings.length) {
      timeline.fromTo(
        butterflyWings,
        { scaleX: 0.3 },
        { scaleX: 1, duration: 0.1, repeat: 12, yoyo: true, ease: "sine.inOut" },
        0.28,
      );
    }

    animateShadow(timeline, shadow, [0.48, 1.08, 1.5, 1.98]);
  } else {
    timeline
      .to(animal, { x: -15, y: 7, rotation: -4, scaleX: 1.12, scaleY: 0.86, duration: 0.46, ease: "power2.in" }, 0.26)
      .to(animal, { x: -43, y: -48, rotation: -10, scaleX: 0.94, scaleY: 1.08, duration: 0.64, ease: "power2.out" }, 0.72)
      .to(animal, { x: -57, y: 1, rotation: 4, scaleX: 1.1, scaleY: 0.9, duration: 0.46, ease: "power2.in" }, 1.36)
      .to(animal, { x: -18, y: -24, rotation: 8, scaleX: 0.98, scaleY: 1.04, duration: 0.46, ease: "power2.out" }, 1.82)
      .to(animal, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.58, ease: "back.out(1.55)" }, 2.28);

    if (yarn) {
      timeline
        .fromTo(yarn, { x: 0, y: 0, rotation: 0 }, { x: 58, y: 0, rotation: 220, duration: 0.72, ease: "power2.inOut" }, 0.45)
        .to(yarn, { x: 83, y: -17, rotation: 340, duration: 0.48, ease: "power2.out" }, 1.17)
        .to(yarn, { x: 38, y: 0, rotation: 460, duration: 0.46, ease: "power2.in" }, 1.65)
        .to(yarn, { x: 0, y: 0, rotation: 540, duration: 0.52, ease: "power2.out" }, 2.11);
    }

    animateShadow(timeline, shadow, [0.66, 1.35, 1.8, 2.24]);
  }

  animateSparkles(timeline, sparkles, 0.48);
}

export function hasGsapAnimalTimeline(name: string) {
  return GSAP_ANIMALS.has(name);
}

export function useGsapAnimalTimeline(sceneRef: RefObject<HTMLDivElement | null>, options: Options) {
  const { isActive, motionCycle, motionVariant, name } = options;

  useGSAP(
    () => {
      const root = sceneRef.current;
      if (!root || !isActive || !GSAP_ANIMALS.has(name)) return;

      const animal = root.querySelector<HTMLElement>(".main-emoji");
      if (!animal) return;

      const elements: SceneElements = {
        animal,
        shadow: root.querySelector<HTMLElement>(".flat-shadow"),
        ball: root.querySelector<HTMLElement>(".dog-ball"),
        yarn: root.querySelector<HTMLElement>(".yarn-ball"),
        cushion: root.querySelector<HTMLElement>(".cat-cushion"),
        butterfly: root.querySelector<HTMLElement>(".cat-butterfly"),
        butterflyWings: Array.from(root.querySelectorAll<HTMLElement>(".cat-butterfly b")),
        sparkles: Array.from(root.querySelectorAll<HTMLElement>(".motion-sparkles i")),
        pawPrints: Array.from(root.querySelectorAll<HTMLElement>(".paw-trail i")),
      };
      const animatedTargets = [
        elements.animal,
        elements.shadow,
        elements.ball,
        elements.yarn,
        elements.cushion,
        elements.butterfly,
        ...elements.butterflyWings,
        ...elements.sparkles,
        ...elements.pawPrints,
      ].filter((target): target is HTMLElement => Boolean(target));
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          defaults: { overwrite: "auto" },
          onComplete: () => gsap.set(animatedTargets, { clearProps: "transform,transformOrigin,opacity,visibility" }),
        });

        if (name === "小狗") buildDogTimeline(timeline, elements, motionVariant);
        if (name === "小猫") buildCatTimeline(timeline, elements, motionVariant);

        return () => timeline.kill();
      });

      return () => media.revert();
    },
    { scope: sceneRef, dependencies: [name, isActive, motionCycle, motionVariant], revertOnUpdate: true },
  );
}
