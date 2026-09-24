type Point = readonly [number, number];
type Region = readonly [number, number, number, number];

export const DINOSAUR_ACTION_SECONDS = 5.8;

export type MouthRig = {
  line: Region; // tip x/y, hinge x/y; measured along the lower edge of the upper lip
  curve: number;
  depth: number;
  opening: number;
};

export type DinosaurRig = {
  kind: "heavy" | "longneck" | "nimble" | "armored" | "winged";
  head: Region;
  neck: Point;
  tail: Region;
  feet: readonly [number, number, number, number];
  eye: Region;
  farFeet?: Region;
  facing?: -1 | 1;
};

// Coordinates follow each original illustration (top left = 0,0). Soft regions
// bend a single continuous texture, so moving joints never reveal cut edges.
const biped: DinosaurRig = {
  kind: "heavy", head: [.23, .23, .27, .25], neck: [.35, .4],
  tail: [.88, .58, .28, .22], feet: [.36, .79, .58, .8],
  eye: [.26, .185, .029, .037],
};
const longneck: DinosaurRig = {
  kind: "longneck", head: [.18, .23, .27, .46], neck: [.35, .57],
  tail: [.87, .64, .25, .27], feet: [.4, .83, .62, .83],
  eye: [.155, .092, .016, .022],
};
const armored: DinosaurRig = {
  kind: "armored", head: [.17, .48, .27, .23], neck: [.34, .56],
  tail: [.87, .57, .23, .18], feet: [.39, .67, .65, .67],
  eye: [.168, .46, .023, .027],
};

export const dinosaurRigs: Record<string, DinosaurRig> = {
  tyrannosaurus: biped,
  triceratops: { ...armored, head: [.28, .39, .35, .35], neck: [.48, .57], eye: [.321, .478, .029, .04], feet: [.52, .77, .77, .75], farFeet: [.32, .75, .63, .73], tail: [.92, .63, .19, .15] },
  brachiosaurus: { ...longneck, farFeet: [.29, .82, .52, .82] },
  stegosaurus: { ...armored, head: [.14, .54, .25, .19], eye: [.128, .518, .023, .027], feet: [.37, .72, .59, .71], farFeet: [.23, .69, .49, .69], tail: [.9, .59, .27, .17] },
  velociraptor: { ...biped, kind: "nimble", eye: [.215, .202, .028, .03], tail: [.84, .4, .32, .2], feet: [.34, .74, .57, .8] },
  ankylosaurus: { ...armored, farFeet: [.23, .65, .53, .64] },
  parasaurolophus: { ...biped, head: [.23, .2, .28, .32], eye: [.213, .215, .025, .03], feet: [.38, .84, .58, .86] },
  spinosaurus: { ...biped, head: [.22, .3, .29, .24], eye: [.241, .266, .026, .029], feet: [.45, .77, .63, .79], tail: [.91, .62, .23, .2] },
  pteranodon: { ...biped, kind: "winged", head: [.29, .37, .26, .23], neck: [.39, .49], eye: [.318, .37, .024, .028] },
  brontosaurus: { ...longneck, eye: [.117, .082, .016, .02], tail: [.89, .5, .26, .34], feet: [.41, .84, .67, .84], farFeet: [.25, .82, .54, .82] },
  diplodocus: { ...longneck, head: [.17, .3, .3, .33], eye: [.07, .19, .012, .015], tail: [.9, .47, .28, .23], feet: [.46, .71, .65, .71], farFeet: [.35, .71, .55, .69] },
  allosaurus: { ...biped, kind: "nimble", facing: 1, head: [.2, .2, .28, .26], eye: [.181, .125, .021, .024], tail: [.84, .4, .31, .19], feet: [.29, .83, .59, .85] },
  dilophosaurus: { ...biped, kind: "nimble", head: [.2, .2, .26, .32], eye: [.184, .184, .023, .026], tail: [.87, .44, .25, .24], feet: [.39, .86, .65, .87] },
  carnotaurus: { ...biped, head: [.2, .2, .28, .28], eye: [.169, .152, .022, .025], tail: [.84, .43, .29, .18], feet: [.37, .84, .72, .87] },
  iguanodon: { ...biped, head: [.16, .25, .23, .28], eye: [.166, .175, .023, .026], tail: [.87, .41, .27, .18], feet: [.45, .8, .73, .8] },
  pachycephalosaurus: { ...biped, head: [.19, .22, .26, .31], eye: [.179, .22, .029, .035], tail: [.85, .46, .28, .18], feet: [.36, .83, .6, .87] },
  therizinosaurus: { ...biped, head: [.25, .19, .24, .34], eye: [.224, .074, .023, .02], tail: [.87, .6, .25, .2], feet: [.37, .85, .61, .88] },
  hadrosaurus: { ...biped, head: [.17, .29, .23, .25], eye: [.162, .249, .022, .027], tail: [.84, .43, .29, .16], feet: [.37, .72, .61, .74] },
  deinonychus: { ...biped, kind: "nimble", head: [.16, .29, .25, .23], eye: [.135, .26, .022, .019], tail: [.84, .29, .32, .22], feet: [.33, .68, .57, .75] },
  argentinosaurus: { ...longneck, head: [.17, .3, .27, .33], eye: [.084, .196, .011, .013], tail: [.87, .57, .27, .19], feet: [.38, .76, .61, .76], farFeet: [.24, .74, .47, .74] },
};

export const dinosaurMouths: Record<string, MouthRig> = {
  tyrannosaurus: { line: [.05, .334, .319, .27], curve: .025, depth: .09, opening: .08 },
  triceratops: { line: [.125, .625, .295, .557], curve: .014, depth: .075, opening: .045 },
  brachiosaurus: { line: [.066, .151, .147, .129], curve: .008, depth: .05, opening: .035 },
  stegosaurus: { line: [.024, .588, .141, .558], curve: .006, depth: .05, opening: .037 },
  velociraptor: { line: [.05, .294, .275, .246], curve: .012, depth: .065, opening: .065 },
  ankylosaurus: { line: [.029, .544, .164, .516], curve: .007, depth: .055, opening: .04 },
  parasaurolophus: { line: [.069, .32, .164, .285], curve: .008, depth: .06, opening: .038 },
  spinosaurus: { line: [.033, .379, .299, .323], curve: .014, depth: .07, opening: .065 },
  pteranodon: { line: [.106, .512, .31, .422], curve: .008, depth: .1, opening: .042 },
  brontosaurus: { line: [.029, .148, .113, .122], curve: .006, depth: .04, opening: .03 },
  diplodocus: { line: [.018, .228, .076, .21], curve: .004, depth: .035, opening: .022 },
  allosaurus: { line: [.309, .233, .139, .19], curve: .012, depth: .07, opening: .065 },
  dilophosaurus: { line: [.042, .267, .224, .235], curve: .012, depth: .065, opening: .065 },
  carnotaurus: { line: [.026, .247, .233, .215], curve: .01, depth: .07, opening: .07 },
  iguanodon: { line: [.036, .282, .143, .235], curve: .008, depth: .07, opening: .042 },
  pachycephalosaurus: { line: [.027, .335, .234, .285], curve: .012, depth: .07, opening: .063 },
  therizinosaurus: { line: [.14, .14, .233, .106], curve: .007, depth: .05, opening: .042 },
  hadrosaurus: { line: [.027, .338, .167, .296], curve: .01, depth: .05, opening: .044 },
  deinonychus: { line: [.022, .335, .166, .295], curve: .007, depth: .06, opening: .057 },
  argentinosaurus: { line: [.037, .225, .085, .214], curve: .003, depth: .03, opening: .02 },
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const pulse = (time: number, start: number, rise: number, hold: number, fall: number) =>
  smooth((time - start) / rise) * (1 - smooth((time - start - rise - hold) / fall));

// The foot stays on the ground during stance, then lifts to recover forward.
// Opposite phases also drive the diagonal pairs of four-legged dinosaurs.
export function dinosaurFootstep(phase: number, stride: number, lift: number) {
  const cycle = ((phase % 1) + 1) % 1;
  if (cycle < .6) return { x: stride * (cycle / .6 - .5), y: 0 };
  const swing = (cycle - .6) / .4;
  return { x: stride * (.5 - smooth(swing)), y: -lift * Math.sin(Math.PI * swing) ** 2 };
}

export function dinosaurPose(rig: DinosaurRig, time: number, activity: number, variant: number, teaching = false, actionAge = time) {
  const energy = Math.max(0, Math.min(1, activity));
  const age = Math.max(0, actionAge) % (DINOSAUR_ACTION_SECONDS + 2);
  const winged = rig.kind === "winged";
  const nimble = rig.kind === "nimble";
  const outward = smooth((age - 1) / 1.15);
  const homeward = smooth((age - 2.47) / 1.15);
  const turn = smooth((age - 2.18) / .27) - smooth((age - 3.65) / .3);
  const legTime = age < 2.3 ? age - 1 : age - 2.47;
  const walking = pulse(legTime, 0, .15, .85, .15) * energy;
  const steps = nimble ? (variant === 2 ? 4 : 3) : rig.kind === "longneck" ? 2 : variant === 2 ? 3 : 2;
  const phase = legTime / 1.15 * steps;
  const stride = nimble ? .082 : rig.kind === "longneck" ? .055 : .07;
  const lift = nimble ? .053 : .037;
  const footA = dinosaurFootstep(phase, stride, lift);
  const footB = dinosaurFootstep(phase + .5, stride, lift);
  const footDirection = -(rig.facing ?? -1);
  const greeting = pulse(age, .08, .28, variant === 1 ? .27 : .12, .3);
  const finalCall = pulse(age, 4.05, .3, .32, .38);
  const mouth = energy * Math.max(greeting, finalCall * (variant === 2 ? .8 : 1));
  const flourish = pulse(age, 4, .3, .55, .65) * energy;
  const breathe = Math.sin(time * 1.65);
  const blinkPhase = time % 5.7;
  const blink = Math.max(0, 1 - Math.abs(blinkPhase - 4.6) / .13);
  const headBeat = Math.sin(time * (teaching ? 3.2 : 2.4));
  return {
    head: .012 * headBeat + walking * .025 * Math.sin(phase * Math.PI * 2) + mouth * .07 + (variant === 0 ? flourish * .05 * Math.sin(age * 7) : 0),
    tail: winged ? 0 : Math.sin(time * 2.3 - .8) * (.018 + walking * .065 + flourish * (variant === 2 ? .2 : .09)),
    feet: winged ? 0 : footA.x * walking * footDirection,
    footAY: winged ? 0 : footA.y * walking,
    footBX: winged ? 0 : footB.x * walking * footDirection,
    footBY: winged ? 0 : footB.y * walking,
    breath: breathe * .008,
    blink,
    wings: winged ? Math.sin(time * 4.6) * (.045 + walking * .18) : 0,
    headLift: rig.kind === "longneck" ? mouth * .012 + flourish * .02 * Math.sin(age * 2) : mouth * .009,
    mouth,
    travelX: (rig.facing ?? -1) * (variant === 2 ? .22 : .18) * (outward - homeward) * energy,
    travelY: winged ? -.065 * energy * Math.sin(Math.PI * (outward - homeward)) : -.014 * walking * Math.abs(Math.sin(phase * Math.PI * 2)),
    turn: turn * energy,
    lean: walking * .018 * Math.sin(phase * Math.PI * 2),
  };
}
