import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/excavatorMotion.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { excavatorPose, BOOM_LENGTH, STICK_LENGTH, SHOULDER, EXCAVATOR_ACTION_SECONDS } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("excavator reaches the soil before curling, carries it up, and dumps it before returning", () => {
  const rest = excavatorPose(0);
  const dig = excavatorPose(1.35);
  assert.ok(dig.wrist.y > rest.wrist.y + 20);
  assert.ok(dig.wrist.y + 30 > 140 && dig.wrist.y + 30 < 148);
  assert.equal(dig.load, 0);
  const scoop = excavatorPose(2.05);
  assert.equal(scoop.load, 1);
  assert.equal(scoop.boom + scoop.stick + scoop.bucket, -65);
  const lift = excavatorPose(3.15);
  assert.equal(lift.load, 1);
  assert.ok(lift.wrist.y < scoop.wrist.y - 20);
  const dump = excavatorPose(3.9);
  assert.ok(dump.load < 1 && dump.load > 0);
  assert.ok(dump.soil.some((particle) => particle.opacity > 0));
  assert.ok(excavatorPose(4).soil[0].y > excavatorPose(3.8).soil[0].y);
  const { soil: restingSoil, ...restingArm } = rest;
  assert.ok(restingSoil.every((particle) => particle.opacity === 0));
  for (const time of [EXCAVATOR_ACTION_SECONDS, 20]) {
    const { soil, ...arm } = excavatorPose(time);
    assert.deepEqual(arm, restingArm);
    assert.ok(soil.every((particle) => particle.opacity === 0));
  }
});

test("the arm links stay joined at constant lengths and the bucket teeth clear the tracks", () => {
  for (let time = 0; time <= EXCAVATOR_ACTION_SECONDS; time += .01) {
    const pose = excavatorPose(time);
    assert.ok(Math.abs(Math.hypot(pose.elbow.x - SHOULDER.x, pose.elbow.y - SHOULDER.y) - BOOM_LENGTH) < 1e-8);
    assert.ok(Math.abs(Math.hypot(pose.wrist.x - pose.elbow.x, pose.wrist.y - pose.elbow.y) - STICK_LENGTH) < 1e-8);
    const angle = (pose.boom + pose.stick + pose.bucket) * Math.PI / 180;
    for (const [x, y] of [[-14, 26], [-6, 30], [2, 28]]) {
      const toothX = pose.wrist.x + x * Math.cos(angle) - y * Math.sin(angle);
      const toothY = pose.wrist.y + x * Math.sin(angle) + y * Math.cos(angle);
      assert.ok(toothX > 0 && toothY < 150);
      assert.ok(toothX < 35 || toothY < 118, `track collision at ${time}`);
    }
    assert.ok(pose.pistonLength > 28 && Number.isFinite(pose.pistonAngle));
  }
});

test("soil stays hidden until tipping and joint motion is continuous at each beat", () => {
  for (let time = 0; time < 3.63; time += .03) assert.ok(excavatorPose(time).soil.every((particle) => particle.opacity === 0));
  for (const time of [0, .4, 1.35, 2.05, 2.55, 3.15, 3.65, 4.25, 5.2, 5.6]) {
    const before = excavatorPose(time - .001);
    const after = excavatorPose(time + .001);
    for (const key of ["boom", "stick", "bucket", "load", "pistonLength", "pistonAngle"]) {
      assert.ok(Math.abs(before[key] - after[key]) < .01, key);
    }
  }
});
