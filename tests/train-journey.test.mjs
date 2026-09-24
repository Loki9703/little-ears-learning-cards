import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/trainJourney.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { trainJourneyX } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("the complete train crosses the viewport and wraps only while fully offscreen", () => {
  for (const [viewportWidth, width, viewportX] of [[360, 320, 0], [1440, 390, 0], [740, 390, 0], [320, 290, 20]]) {
    const homeX = viewportX + (viewportWidth - width) / 2;
    const geometry = { homeX, width, viewportWidth, viewportX };
    assert.equal(trainJourneyX(0, geometry), homeX);
    assert.equal(trainJourneyX(1, geometry), homeX);
    let previous = homeX;
    let wraps = 0;
    let minimum = homeX;
    let maximum = homeX;
    for (let step = 1; step <= 10000; step++) {
      const x = trainJourneyX(step / 10000, geometry);
      if (x > previous + 1) {
        wraps++;
        assert.ok(previous + width < viewportX - 30, "tail must leave before wrapping");
        assert.ok(x > viewportX + viewportWidth + 30, "engine must reenter from outside");
      } else {
        assert.ok(x <= previous + .00001, "all visible movement is leftward");
        assert.ok(previous - x < 1, "visible movement has no jump");
      }
      minimum = Math.min(minimum, x);
      maximum = Math.max(maximum, x);
      previous = x;
    }
    assert.equal(wraps, 1);
    assert.ok(minimum + width < viewportX);
    assert.ok(maximum > viewportX + viewportWidth);
  }
});
