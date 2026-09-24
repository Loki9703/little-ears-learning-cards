import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/airplaneFlight.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { airplaneFlightPose } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("flight starts and returns at the card, with continuous takeoff and landing", () => {
  for (const home of [{ x: 320, y: 300 }, { x: 80, y: 100 }]) {
    const geometry = { home, size: 184, viewport: { x: 0, y: 0, width: 673, height: 725 } };
    assert.deepEqual(airplaneFlightPose(0, geometry), { ...home, scale: 1, rotation: 0 });
    assert.deepEqual(airplaneFlightPose(1, geometry), { ...home, scale: 1, rotation: 0 });
    for (const progress of [.08, .22, .36, .5, .64, .78, .92]) {
      const before = airplaneFlightPose(progress - .00001, geometry);
      const after = airplaneFlightPose(progress + .00001, geometry);
      assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < .01);
      assert.ok(Math.abs(before.scale - after.scale) < .001);
    }
  }
});

test("the flight visits all four sides and keeps rotated wings inside the visible viewport", () => {
  for (const [width, height, x, y] of [[360, 740, 0, 0], [673, 725, 0, 0], [1440, 900, 0, 0], [740, 360, 0, 0], [320, 480, 20, 70]]) {
    const geometry = { home: { x: x + width / 2, y: y + height * .4 }, size: 184, viewport: { width, height, x, y } };
    const positions = [];
    for (let progress = .0801; progress < .92; progress += .0007) {
      const pose = airplaneFlightPose(progress, geometry);
      const radius = geometry.size * pose.scale / Math.SQRT2;
      assert.ok(pose.x - radius >= x + 11.9 && pose.x + radius <= x + width - 11.9);
      assert.ok(pose.y - radius >= y + 11.9 && pose.y + radius <= y + height - 11.9);
      assert.ok(Number.isFinite(pose.rotation));
      positions.push(pose);
    }
    assert.ok(Math.min(...positions.map((p) => p.x)) < x + width * .35);
    assert.ok(Math.max(...positions.map((p) => p.x)) > x + width * .65);
    assert.ok(Math.min(...positions.map((p) => p.y)) < y + height * .35);
    assert.ok(Math.max(...positions.map((p) => p.y)) > y + height * .65);
  }
});
