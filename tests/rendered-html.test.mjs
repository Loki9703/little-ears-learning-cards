import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the learning-card application", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>小耳朵点点乐｜宝宝认知点读卡<\/title>/);
  assert.match(html, /aria-label="选择认知主题"/);
  assert.match(html, />动物<\/button>/);
  assert.match(html, />车辆<\/button>/);
  assert.match(html, />水果<\/button>/);
  assert.match(html, />恐龙<\/button>/);
  assert.match(html, /aria-label="关闭小知识讲解"/);
  assert.match(html, /点一点，看动画、听讲解/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the dinosaur collection complete, animated, and story-ready", async () => {
  const [page, scene, css, layout, assets, storyAudio, callAudio, shortAudio] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/AnimatedLearningScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readdir(new URL("../public/illustrations/dinosaurs/", import.meta.url)),
    readdir(new URL("../public/audio/dinosaurs/", import.meta.url)),
    readdir(new URL("../public/audio/dinosaurs/calls/", import.meta.url)),
    readdir(new URL("../public/audio/dinosaurs/short/", import.meta.url)),
  ]);

  assert.deepEqual(assets.sort(), [
    "ankylosaurus.webp",
    "brachiosaurus.webp",
    "parasaurolophus.webp",
    "pteranodon.webp",
    "spinosaurus.webp",
    "stegosaurus.webp",
    "triceratops.webp",
    "tyrannosaurus.webp",
    "velociraptor.webp",
  ]);
  for (const name of ["霸王龙", "三角龙", "腕龙", "剑龙", "迅猛龙", "甲龙", "副栉龙", "棘龙", "无齿翼龙"]) {
    assert.match(page, new RegExp(`name: "${name}"`));
  }
  assert.deepEqual(storyAudio.filter((asset) => asset.endsWith(".mp3")).sort(), [
    "ankylosaurus-story.mp3",
    "brachiosaurus-story.mp3",
    "parasaurolophus-story.mp3",
    "pteranodon-story.mp3",
    "spinosaurus-story.mp3",
    "stegosaurus-story.mp3",
    "triceratops-story.mp3",
    "tyrannosaurus-story.mp3",
    "velociraptor-story.mp3",
  ]);
  for (const audio of storyAudio.filter((asset) => asset.endsWith(".mp3"))) {
    assert.match(page, new RegExp(`/audio/dinosaurs/${audio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
  assert.deepEqual(callAudio.sort(), [
    "parasaurolophus-scientific-call.mp3",
    "tyrannosaurus-scientific-call.mp3",
    "velociraptor-scientific-call.mp3",
  ]);
  for (const audio of callAudio) {
    assert.match(page, new RegExp(`/audio/dinosaurs/calls/${audio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
  assert.deepEqual(shortAudio.sort(), [
    "ankylosaurus-intro.mp3",
    "brachiosaurus-intro.mp3",
    "parasaurolophus-intro.mp3",
    "pteranodon-intro.mp3",
    "spinosaurus-intro.mp3",
    "stegosaurus-intro.mp3",
    "triceratops-intro.mp3",
    "tyrannosaurus-intro.mp3",
    "velociraptor-intro.mp3",
  ]);
  for (const audio of shortAudio) {
    assert.match(page, new RegExp(`/audio/dinosaurs/short/${audio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
  assert.match(page, /little-ears-lesson-audio/);
  assert.match(page, /关闭小知识讲解/);
  assert.match(page, /if \(lessonOn\)/);
  assert.match(page, /科学拟声 · 依据近缘动物与发声结构模拟/);
  assert.match(scene, /dinosaurIllustrationByName/);
  assert.match(scene, /dinosaur-world/);
  for (const motion of ["stomp", "charge", "graze", "tail-swing", "prowl", "club", "crest-call", "sail-stride", "glide"]) {
    assert.match(css, new RegExp(`motion-${motion}`));
  }
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(layout, /常见水果和恐龙/);
});
