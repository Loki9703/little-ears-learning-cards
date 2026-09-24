import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { dinosaurPose, dinosaurRigs, dinosaurMouths, dinosaurFootstep, DINOSAUR_ACTION_SECONDS } = await loadTypeScript("../app/dinosaurMotion.ts");
const { createDinosaurRenderer } = await loadTypeScript("../app/dinosaurRenderer.ts");

test("every dinosaur illustration has an anatomically bounded motion rig", async () => {
  const assets = await readdir(new URL("../public/illustrations/dinosaurs/", import.meta.url));
  assert.deepEqual(Object.keys(dinosaurRigs).sort(), assets.filter((name) => name.endsWith(".webp")).map((name) => name.slice(0, -5)).sort());
  assert.deepEqual(Object.keys(dinosaurMouths).sort(), Object.keys(dinosaurRigs).sort());
  for (const rig of Object.values(dinosaurRigs)) {
    for (const key of ["head", "neck", "tail", "feet", "eye"]) {
      assert.ok(rig[key].every((value) => Number.isFinite(value) && value > 0 && value < 1));
    }
  }
});

test("every mouth has a valid lip line and a limited jaw opening", () => {
  for (const mouth of Object.values(dinosaurMouths)) {
    assert.ok(mouth.line.every((value) => value > 0 && value < 1));
    assert.ok(Math.abs(mouth.line[0] - mouth.line[2]) > .03);
    assert.ok(mouth.opening > 0 && mouth.opening <= .08);
    assert.ok(mouth.depth >= mouth.opening);
  }
});

test("a foot stays planted during stance and lifts only for its return step", () => {
  for (let phase = 0; phase < .6; phase += .025) {
    assert.equal(dinosaurFootstep(phase, .08, .04).y, 0);
  }
  assert.ok(dinosaurFootstep(.8, .08, .04).y < -.035);
  assert.ok(dinosaurFootstep(.1, .08, .04).x < dinosaurFootstep(.5, .08, .04).x);
  for (let phase = -2; phase < 3; phase += .005) {
    const foot = dinosaurFootstep(phase, .08, .04);
    const next = dinosaurFootstep(phase + .0001, .08, .04);
    assert.ok(Math.abs(foot.x - next.x) < .001);
    assert.ok(Math.abs(foot.y - next.y) < .001);
  }
});

test("the action opens and closes the mouth, turns before returning, and settles at home", () => {
  for (const rig of Object.values(dinosaurRigs)) {
    const sample = (age) => dinosaurPose(rig, age, 1, 1, false, age);
    assert.ok(sample(.5).mouth > .9);
    assert.equal(sample(1.3).mouth, 0);
    assert.ok(Math.abs(sample(2.16).travelX) >= .17);
    assert.equal(sample(2.46).turn, 1);
    assert.ok(Math.abs(sample(3.1).travelX) < Math.abs(sample(2.46).travelX));
    assert.equal(sample(3.96).turn, 0);
    assert.ok(sample(4.5).mouth > .9);
    const settled = sample(DINOSAUR_ACTION_SECONDS);
    for (const key of ["travelX", "travelY", "turn", "feet", "footAY", "footBX", "footBY", "mouth"]) {
      assert.equal(Math.abs(settled[key]), 0, key);
    }
  }
});

test("idle dinosaurs breathe and blink with planted feet", () => {
  for (const rig of Object.values(dinosaurRigs)) {
    assert.equal(Math.abs(dinosaurPose(rig, 1, 0, 0).feet), 0);
    assert.notEqual(dinosaurPose(rig, 1, 0, 0).breath, 0);
    assert.equal(dinosaurPose(rig, 4.6, 0, 0).blink, 1);
    assert.equal(dinosaurPose(rig, 4.9, 0, 0).blink, 0);
  }
});

test("poses stay finite and continuous across repeated gestures and blink boundaries", () => {
  for (const rig of Object.values(dinosaurRigs)) {
    for (const energy of [-1, 0, .5, 1, 2]) {
      for (const variant of [0, 1, 2]) {
        for (let time = 0; time < 18; time += .05) {
          const pose = dinosaurPose(rig, time, energy, variant);
          const next = dinosaurPose(rig, time + .001, energy, variant);
          for (const key of Object.keys(pose)) {
            assert.ok(Number.isFinite(pose[key]));
            assert.ok(Math.abs(pose[key]) <= 1);
            assert.ok(Math.abs(pose[key] - next[key]) < .01, `${rig.kind}: ${key} jumped`);
          }
        }
      }
    }
  }
});

test("wings replace walking for the flying reptile, and fast dinosaurs take quicker steps", () => {
  const winged = dinosaurRigs.pteranodon;
  assert.equal(dinosaurPose(winged, .4, 1, 0).feet, 0);
  assert.equal(dinosaurPose(winged, .4, 1, 0).tail, 0);
  assert.notEqual(dinosaurPose(winged, .4, 1, 0).wings, 0);
  const zeroCrossings = (rig) => {
    let count = 0;
    let last = 0;
    for (let time = .01; time < 5; time += .01) {
      const foot = dinosaurPose(rig, time, 1, 0).feet;
      if (foot * last < 0) count++;
      last = foot;
    }
    return count;
  };
  assert.ok(zeroCrossings(dinosaurRigs.velociraptor) > zeroCrossings(dinosaurRigs.brachiosaurus));
});

test("unsupported graphics keep the original illustration available", () => {
  assert.equal(createDinosaurRenderer({ getContext: () => null }, {}, dinosaurRigs.tyrannosaurus), null);
  const deleted = [];
  const unavailableGraphics = {
    createProgram: () => null,
    createBuffer: () => "buffer",
    createTexture: () => "texture",
    deleteShader: (value) => deleted.push(value),
    deleteBuffer: (value) => deleted.push(value),
    deleteTexture: (value) => deleted.push(value),
    deleteProgram: (value) => deleted.push(value),
  };
  assert.equal(createDinosaurRenderer({ getContext: () => unavailableGraphics }, {}, dinosaurRigs.tyrannosaurus), null);
  assert.deepEqual(deleted, ["buffer", "texture", null]);
});
