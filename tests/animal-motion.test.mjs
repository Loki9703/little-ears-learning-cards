import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/animalMotion.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { animalProfiles, animalRigs, animalMouths, animalPose, animalFootstep, ANIMAL_ACTION_SECONDS } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("every animal card has a motion profile and its existing artwork", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const animalSection = page.slice(page.indexOf("  animals: {"), page.indexOf("  vehicles: {"));
  const names = [...animalSection.matchAll(/name: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(names.length, 20);
  assert.deepEqual(Object.keys(animalProfiles).sort(), names.sort());
  await Promise.all(Object.values(animalProfiles).map(({ slug }) => access(new URL(`../public/illustrations/${slug}.svg`, import.meta.url))));
  assert.deepEqual(Object.keys(animalRigs).sort(), ["cat", "cow", "duck", "elephant", "sheep"]);
  for (const rig of Object.values(animalRigs)) {
    for (const key of ["head", "neck", "tail", "feet", "eye"]) {
      assert.ok(rig[key].every((value) => Number.isFinite(value) && value > 0 && value < 1));
    }
  }
  for (const mouth of Object.values(animalMouths)) {
    assert.ok(mouth.line[2] - mouth.line[0] > .03);
    assert.ok(mouth.opening > 0 && mouth.opening <= .06 && mouth.opening <= mouth.depth);
  }
});

test("animals greet, move out, turn before returning, and settle without looping during a story", () => {
  for (const profile of Object.values(animalProfiles)) {
    for (const variant of [0, 1, 2]) {
      const sample = (age) => animalPose(profile, age, 1, variant, age);
      assert.ok(sample(.5).mouth > .8);
      assert.equal(sample(1.5).mouth, 0);
      assert.ok(Math.abs(sample(2.3).travelX) >= .1);
      assert.equal(sample(2.8).turn, 1);
      assert.ok(Math.abs(sample(3.5).travelX) < Math.abs(sample(2.3).travelX));
      assert.equal(sample(4.61).turn, 0);
      assert.ok(sample(5.5).mouth > .8);
      for (const age of [ANIMAL_ACTION_SECONDS, 8, 12, 18]) {
        const rest = sample(age);
        for (const key of ["travelX", "travelY", "turn", "mouth", "feet", "footAY", "footBX", "footBY", "lean"]) {
          assert.equal(Math.abs(rest[key]), 0, `${profile.slug} ${variant} ${age}: ${key}`);
        }
        assert.equal(rest.scaleX, 1);
        assert.equal(rest.scaleY, 1);
      }
    }
  }
});

test("cat and duck have independent footfalls and distinct play variations", () => {
  for (const name of ["小猫", "小鸭"]) {
    const profile = animalProfiles[name];
    const stepping = animalPose(profile, 1.4, 1, 0, 1.4);
    assert.notEqual(stepping.footAY, stepping.footBY);
    assert.ok(Math.min(stepping.footAY, stepping.footBY) < -.02);
    assert.equal(animalPose(profile, .5, 1, 0, .5).feet, 0);
  }
  const cat = animalProfiles.小猫;
  assert.ok(animalPose(cat, 5.3, 1, 2, 5.3).travelY < -.15);
  assert.ok(animalPose(cat, 5.3, 1, 1, 5.3).scaleX > 1.05);
  const duck = animalProfiles.小鸭;
  const swimming = animalPose(duck, 3.15, 1, 1, 3.15);
  assert.equal(swimming.feet, 0);
  assert.equal(swimming.footBX, 0);
  assert.notEqual(swimming.travelX, 0);
  assert.notEqual(swimming.travelY, 0);
  assert.notEqual(animalPose(duck, 5.3, 1, 0, 5.3).wings, 0);
});

test("footfalls keep stance feet grounded and remain continuous at the swing boundary", () => {
  for (let phase = 0; phase < .6; phase += .02) assert.equal(animalFootstep(phase, .07, .04).y, 0);
  assert.ok(animalFootstep(.8, .07, .04).y < -.039);
  for (const phase of [-1, -.4, 0, .6, 1]) {
    const before = animalFootstep(phase - .0001, .07, .04);
    const after = animalFootstep(phase + .0001, .07, .04);
    assert.ok(Math.abs(before.x - after.x) < .001);
    assert.ok(Math.abs(before.y - after.y) < .001);
  }
});

test("each gait stays finite and continuous through turns, action completion, and idle blinking", () => {
  for (const profile of Object.values(animalProfiles)) {
    for (const variant of [0, 1, 2]) {
      for (const activity of [0, .4, 1]) {
        for (let age = 0; age <= 12; age += .03) {
          const pose = animalPose(profile, age, activity, variant, age);
          const next = animalPose(profile, age + .001, activity, variant, age + .001);
          for (const key of Object.keys(pose)) {
            assert.ok(Number.isFinite(pose[key]) && Math.abs(pose[key]) <= 1.1, `${profile.slug}: ${key}`);
            assert.ok(Math.abs(pose[key] - next[key]) < .025, `${profile.slug}: ${key} @ ${age}`);
          }
        }
      }
      const idle = animalPose(profile, 4.6, 0, variant, 4.6);
      assert.equal(idle.blink, 1);
      assert.equal(Math.abs(idle.travelX), 0);
      assert.equal(Math.abs(idle.feet), 0);
    }
  }
});
