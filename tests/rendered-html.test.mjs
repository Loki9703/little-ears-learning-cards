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
  assert.match(html, /aria-label="打开小知识讲解"/);
  assert.match(html, /点一点，听名字和声音/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the banana peel curved, independently hinged, and non-crossing", async () => {
  const [scene, banana, css] = await Promise.all([
    readFile(new URL("../app/AnimatedLearningScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BananaIllustration.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(scene, /BananaIllustration/);
  assert.doesNotMatch(scene, /banana-reveal|banana-peel-one|banana-peel-two|banana-peel-three/);
  for (const lobe of ["back", "left", "right"]) {
    assert.match(banana, new RegExp(`banana-svg-peel-${lobe}`));
    assert.match(css, new RegExp(`banana-peel-${lobe}-natural`));
  }
  assert.match(banana, /banana-svg-fruit/);
  assert.match(css, /banana-fruit-natural-lift/);
  assert.match(css, /\.banana-svg-peel-back \{ transform-origin: 8% 38%; \}/);
  assert.match(css, /\.banana-svg-peel-left \{ transform-origin: 72% 10%; \}/);
  assert.match(css, /\.banana-svg-peel-right \{ transform-origin: 12% 10%; \}/);
  assert.doesNotMatch(css, /peel-open-middle|peel-open-left|peel-open-right/);
});

test("keeps the dinosaur collection complete, animated, and story-ready", async () => {
  const [page, scene, css, layout, assets, storyAudio, nameAudio] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/AnimatedLearningScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readdir(new URL("../public/illustrations/dinosaurs/", import.meta.url)),
    readdir(new URL("../public/audio/dinosaurs/", import.meta.url)),
    readdir(new URL("../public/audio/dinosaurs/names/", import.meta.url)),
  ]);

  assert.deepEqual(assets.sort(), [
    "allosaurus.webp",
    "ankylosaurus.webp",
    "argentinosaurus.webp",
    "brachiosaurus.webp",
    "brontosaurus.webp",
    "carnotaurus.webp",
    "deinonychus.webp",
    "dilophosaurus.webp",
    "diplodocus.webp",
    "hadrosaurus.webp",
    "iguanodon.webp",
    "pachycephalosaurus.webp",
    "parasaurolophus.webp",
    "pteranodon.webp",
    "spinosaurus.webp",
    "stegosaurus.webp",
    "therizinosaurus.webp",
    "triceratops.webp",
    "tyrannosaurus.webp",
    "velociraptor.webp",
  ]);
  const normalizedPage = page.replaceAll("\r\n", "\n");
  const dinosaurSection = normalizedPage.match(/  dinosaurs: \{[\s\S]*?\n  \},\n\};/)?.[0] ?? "";
  assert.equal((dinosaurSection.match(/\n      \{ name: "/g) ?? []).length, 20);
  assert.equal((dinosaurSection.match(/, audio: "/g) ?? []).length, 20);
  assert.equal((dinosaurSection.match(/, storyAudio: "/g) ?? []).length, 20);
  for (const name of ["霸王龙", "三角龙", "腕龙", "剑龙", "迅猛龙", "甲龙", "副栉龙", "棘龙", "无齿翼龙", "雷龙", "梁龙", "异特龙", "双冠龙", "食肉牛龙", "禽龙", "肿头龙", "镰刀龙", "鸭嘴龙", "恐爪龙", "阿根廷龙"]) {
    assert.match(page, new RegExp(`name: "${name}"`));
  }
  assert.deepEqual(storyAudio.filter((asset) => asset.endsWith(".mp3")).sort(), [
    "allosaurus-story.mp3",
    "ankylosaurus-story.mp3",
    "argentinosaurus-story.mp3",
    "brachiosaurus-story.mp3",
    "brontosaurus-story.mp3",
    "carnotaurus-story.mp3",
    "deinonychus-story.mp3",
    "dilophosaurus-story.mp3",
    "diplodocus-story.mp3",
    "hadrosaurus-story.mp3",
    "iguanodon-story.mp3",
    "pachycephalosaurus-story.mp3",
    "parasaurolophus-story.mp3",
    "pteranodon-story.mp3",
    "spinosaurus-story.mp3",
    "stegosaurus-story.mp3",
    "therizinosaurus-story.mp3",
    "triceratops-story.mp3",
    "tyrannosaurus-story.mp3",
    "velociraptor-story.mp3",
  ]);
  for (const audio of storyAudio.filter((asset) => asset.endsWith(".mp3"))) {
    assert.match(page, new RegExp(`/audio/dinosaurs/${audio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
  assert.ok(!storyAudio.includes("calls"));
  assert.deepEqual(nameAudio.sort(), [
    "allosaurus-name.wav",
    "ankylosaurus-name.wav",
    "argentinosaurus-name.wav",
    "brachiosaurus-name.wav",
    "brontosaurus-name.wav",
    "carnotaurus-name.wav",
    "deinonychus-name.wav",
    "dilophosaurus-name.wav",
    "diplodocus-name.wav",
    "hadrosaurus-name.wav",
    "iguanodon-name.wav",
    "pachycephalosaurus-name.wav",
    "parasaurolophus-name.wav",
    "pteranodon-name.wav",
    "spinosaurus-name.wav",
    "stegosaurus-name.wav",
    "therizinosaurus-name.wav",
    "triceratops-name.wav",
    "tyrannosaurus-name.wav",
    "velociraptor-name.wav",
  ]);
  for (const audio of nameAudio) {
    assert.match(page, new RegExp(`/audio/dinosaurs/names/${audio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
  assert.match(page, /little-ears-lesson-audio/);
  assert.match(page, /const \[lessonOn, setLessonOn\] = useState\(false\)/);
  assert.match(page, /getItem\(LESSON_PREFERENCE_KEY\) === "on"/);
  assert.match(page, /打开小知识讲解/);
  assert.match(page, /if \(lessonOn\)/);
  assert.match(page, /if \(!lessonOn && category === "dinosaurs"\)/);
  assert.match(page, /await playClip\(item\.audio \?\? "", 0\.94, session\)/);
  assert.doesNotMatch(page, /speechSynthesis|SpeechSynthesisUtterance|speakText|narration/);
  assert.doesNotMatch(page, /lessonOn \? item\.storyAudio : item\.shortAudio/);
  assert.doesNotMatch(page, /shortAudio|shortDuration|\/audio\/dinosaurs\/short\//);
  assert.doesNotMatch(page, /scientificCall|callDuration|科学拟声|\/audio\/dinosaurs\/calls\//);
  assert.match(scene, /dinosaurIllustrationByName/);
  assert.match(scene, /dinosaur-world/);
  for (const motion of ["stomp", "charge", "graze", "tail-swing", "prowl", "club", "crest-call", "sail-stride", "glide"]) {
    assert.match(css, new RegExp(`motion-${motion}`));
  }
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(layout, /常见水果和恐龙/);
});

test("keeps animal props scoped and replayable without competing with the body clock", async () => {
  const [packageJson, scene, timeline, cat, tyrannosaurus, lottie, css] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/AnimatedLearningScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/useGsapAnimalTimeline.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/CatIllustration.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TyrannosaurusIllustration.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/NotoLottieAnimation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"@gsap\/react"/);
  assert.match(packageJson, /"gsap"/);
  assert.match(scene, /useGsapAnimalTimeline/);
  assert.match(scene, /has-gsap-motion/);
  assert.match(scene, /CatIllustration/);
  assert.match(scene, /TyrannosaurusIllustration/);
  assert.match(scene, /animationSetKey = hasGsapMotion/);
  assert.match(timeline, /new Set\(\["小狗", "小猫"\]\)/);
  assert.doesNotMatch(timeline, /querySelector[^\n]*"\.main-emoji"|querySelector[^\n]*"\.flat-shadow"/);
  assert.match(scene, /<AnimalIllustration name=\{name\}/);
  assert.doesNotMatch(timeline, /buildTyrannosaurusTimeline/);
  assert.match(timeline, /motionCycle/);
  assert.match(timeline, /gsap\.matchMedia\(\)/);
  assert.match(timeline, /prefers-reduced-motion: no-preference/);
  assert.match(timeline, /revertOnUpdate: true/);
  assert.equal((cat.match(/className="cat-leg /g) ?? []).length, 3);
  assert.match(tyrannosaurus, /DinosaurIllustration slug="tyrannosaurus"/);
  assert.match(lottie, /goToAndPlay\(0, true\)/);
  assert.doesNotMatch(lottie, /\[animationSrc, isPlaying, playKey\]/);
  assert.match(css, /has-gsap-motion\.is-active/);
  assert.doesNotMatch(css, /@keyframes (dog-play|cat-pounce|ball-hop)/);
});
