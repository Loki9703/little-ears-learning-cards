import type { ArtworkRig } from "./dinosaurRenderer";
import type { MouthRig } from "./dinosaurMotion";

export const ANIMAL_ACTION_SECONDS = 6.4;

type AnimalProfile = {
  slug: string;
  gait: "walk" | "waddle" | "amble" | "hop" | "flutter" | "swim" | "crawl";
  distance: number;
  steps: number;
  facing: -1 | 1;
};

export const animalProfiles: Record<string, AnimalProfile> = {
  小狗: { slug: "dog", gait: "walk", distance: .22, steps: 3, facing: -1 },
  小猫: { slug: "cat", gait: "walk", distance: .22, steps: 3, facing: -1 },
  小鸭: { slug: "duck", gait: "waddle", distance: .21, steps: 3, facing: -1 },
  小牛: { slug: "cow", gait: "amble", distance: .15, steps: 2, facing: -1 },
  小羊: { slug: "sheep", gait: "hop", distance: .19, steps: 2, facing: -1 },
  小鸟: { slug: "bird", gait: "flutter", distance: .23, steps: 3, facing: -1 },
  大公鸡: { slug: "rooster", gait: "walk", distance: .17, steps: 3, facing: -1 },
  小猪: { slug: "pig", gait: "walk", distance: .18, steps: 3, facing: -1 },
  小马: { slug: "horse", gait: "walk", distance: .24, steps: 4, facing: -1 },
  小青蛙: { slug: "frog", gait: "hop", distance: .22, steps: 2, facing: -1 },
  大象: { slug: "elephant", gait: "amble", distance: .13, steps: 2, facing: -1 },
  狮子: { slug: "lion", gait: "walk", distance: .19, steps: 3, facing: -1 },
  小兔子: { slug: "rabbit", gait: "hop", distance: .23, steps: 2, facing: -1 },
  小乌龟: { slug: "turtle", gait: "crawl", distance: .11, steps: 2, facing: -1 },
  小鱼: { slug: "fish", gait: "swim", distance: .24, steps: 3, facing: -1 },
  小猴子: { slug: "monkey", gait: "hop", distance: .19, steps: 2, facing: -1 },
  小熊: { slug: "bear", gait: "amble", distance: .14, steps: 2, facing: -1 },
  大熊猫: { slug: "panda", gait: "amble", distance: .13, steps: 2, facing: -1 },
  蝴蝶: { slug: "butterfly", gait: "flutter", distance: .25, steps: 4, facing: -1 },
  小蜜蜂: { slug: "bee", gait: "flutter", distance: .25, steps: 4, facing: -1 },
};

// Joint coordinates are measured on the existing 128 × 128 Noto illustrations.
// The other animals keep their original multi-part Lottie expressions.
export const animalRigs: Record<string, ArtworkRig> = {
  cat: {
    head: [.35, .28, .33, .3], neck: [.43, .55],
    tail: [.85, .4, .15, .21], tailPivot: [.755, .54],
    feet: [.433, .945, .705, .93], farFeet: [.34, .922, .63, .92],
    eye: [.327, .312, .032, .04],
    accent: { region: [.31, .13, .09, .1], pivot: [.33, .205] },
  },
  duck: {
    head: [.36, .21, .28, .26], neck: [.392, .405],
    tail: [.83, .485, .15, .2], tailPivot: [.7, .65],
    feet: [.42, .9, .558, .955], eye: [.367, .155, .032, .035],
    wing: { region: [.6, .56, .24, .16], pivot: [.455, .45] },
  },
  cow: {
    head: [.215, .335, .26, .2], neck: [.38, .49],
    tail: [.913, .62, .074, .195], tailPivot: [.899, .435],
    feet: [.563, .914, .781, .875], farFeet: [.44, .894, .723, .867],
    eye: [.222, .303, .025, .025],
  },
  sheep: {
    head: [.286, .395, .31, .275], neck: [.455, .58],
    tail: [.89, .457, .11, .12], tailPivot: [.83, .36],
    feet: [.44, .954, .778, .879], farFeet: [.273, .904, .637, .855],
    eye: [.386, .371, .03, .038], secondEye: [.204, .337, .026, .033],
  },
  elephant: {
    head: [.32, .34, .37, .37], neck: [.38, .5],
    tail: [.89, .495, .13, .22], tailPivot: [.83, .37],
    feet: [.36, .824, .73, .77], farFeet: [.26, .789, .589, .801],
    eye: [.315, .392, .03, .035],
    wing: { region: [.52, .31, .17, .19], pivot: [.415, .25] },
    accent: { region: [.166, .586, .105, .24], pivot: [.245, .44] },
  },
};

export const animalMouths: Record<string, MouthRig> = {
  cat: { line: [.147, .403, .224, .409], curve: .014, depth: .075, opening: .037 },
  duck: { line: [.056, .198, .255, .216], curve: .018, depth: .065, opening: .06 },
  cow: { line: [.055, .443, .15, .443], curve: .012, depth: .05, opening: .028 },
  sheep: { line: [.207, .518, .303, .536], curve: .01, depth: .065, opening: .034 },
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const x = clamp(value); return x * x * (3 - 2 * x); };
const gesture = (time: number, start: number, rise: number, hold: number, fall: number) =>
  smooth((time - start) / rise) * (1 - smooth((time - start - rise - hold) / fall));

export function animalFootstep(phase: number, stride: number, lift: number) {
  const cycle = ((phase % 1) + 1) % 1;
  if (cycle < .6) return { x: stride * (cycle / .6 - .5), y: 0 };
  const swing = (cycle - .6) / .4;
  return { x: stride * (.5 - smooth(swing)), y: -lift * Math.sin(Math.PI * swing) ** 2 };
}

export function animalPose(profile: AnimalProfile, time: number, energy: number, variant: number, actionAge: number) {
  const activity = clamp(energy);
  // A click has one complete beginning and ending, even during longer audio.
  const age = Math.max(0, actionAge);
  const outward = smooth((age - 1.05) / 1.25);
  const returning = smooth((age - 2.85) / 1.25);
  const legAge = age < 2.6 ? age - 1.05 : age - 2.85;
  const moving = gesture(legAge, 0, .12, 1.01, .12) * activity;
  const phase = legAge / 1.25 * profile.steps;
  const stride = profile.gait === "amble" || profile.gait === "crawl" ? .045 : .07;
  const footA = animalFootstep(phase, stride, .042);
  const footB = animalFootstep(phase + .5, stride, .042);
  const flourish = gesture(age, 4.8, .3, .55, .75) * activity;
  const greeting = gesture(age, .14, .18, .42, .25);
  const farewell = gesture(age, 4.95, .2, .35, .4);
  const call = Math.max(greeting, farewell) * activity;
  const rhythm = .6 + .4 * Math.cos(age * Math.PI * 4) ** 2;
  const hopping = profile.gait === "hop" || (profile.slug === "horse" && variant === 2);
  const flying = profile.gait === "flutter";
  const swimming = profile.gait === "swim" || (profile.slug === "duck" && variant === 1 && age >= 2.6);
  const walking = !flying && !swimming;
  const bounce = Math.sin(phase * Math.PI) ** 2 * moving;
  const playfulCat = profile.slug === "cat" && variant !== 1;
  const jumping = playfulCat || profile.slug === "dog";
  const jump = jumping ? gesture(age, 4.9, .4, 0, .55) * activity : 0;
  const stretch = profile.slug === "cat" && variant === 1 ? flourish : 0;
  const turn = (smooth((age - 2.38) / .35) - smooth((age - 4.25) / .35)) * activity;

  return {
    head: Math.sin(time * 1.8) * .012 - call * .055 + stretch * .07,
    headLift: call * .008,
    tail: Math.sin(time * 2.4) * (.022 + moving * .05 + flourish * .04),
    feet: walking ? footA.x * moving : 0,
    footAY: walking ? footA.y * moving : 0,
    footBX: walking ? footB.x * moving : 0,
    footBY: walking ? footB.y * moving : 0,
    breath: Math.sin(time * 1.65) * .008,
    blink: gesture(time % 5.7, 4.5, .09, .03, .13),
    mouth: call * rhythm,
    wings: profile.slug === "duck" ? Math.sin(time * 13) * flourish * .19
      : profile.slug === "elephant" ? Math.sin(time * 6) * (.025 + flourish * .08) : 0,
    accent: profile.slug === "elephant" ? -.24 * call + Math.sin(time * 2.2) * .025
      : profile.slug === "cat" ? Math.sin(time * 5) * (.025 + call * .08) : 0,
    travelX: profile.facing * profile.distance * (outward - returning) * activity
      + (playfulCat ? (variant === 2 ? .1 : -.09) * jump : 0),
    travelY: flying ? -moving * .13 - bounce * .025
      : swimming ? Math.sin(phase * Math.PI) * moving * .022
      : -bounce * (hopping ? .115 : .012) - jump * (variant === 2 ? .18 : .09) + stretch * .012,
    turn,
    lean: profile.gait === "waddle" && !swimming ? Math.sin(phase * Math.PI * 2) * moving * .065
      : (flying || swimming) ? Math.sin(phase * Math.PI) * moving * .065 : jump * -.05,
    scaleX: 1 + stretch * .06 + (hopping ? bounce * .025 : 0),
    scaleY: 1 - stretch * .045 - (hopping ? bounce * .02 : 0),
  };
}
