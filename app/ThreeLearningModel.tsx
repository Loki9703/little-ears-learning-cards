"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type ModelCategory = "animals" | "vehicles" | "fruits";

type Props = {
  category: ModelCategory;
  name: string;
  fallbackEmoji: string;
  motion: string;
  isActive: boolean;
  motionCycle: number;
};

type ModelConfig = {
  file: string;
  turn?: number;
  size?: number;
  tint?: number;
};

const models: Record<string, ModelConfig> = {
  小狗: { file: "dog", turn: .65, size: 3.35 },
  小猫: { file: "cat", turn: -.35, size: 2.35 },
  小鸭: { file: "duck", turn: -.2, size: 2.3 },
  小牛: { file: "cow", turn: .4, size: 2.45 },
  小羊: { file: "sheep", turn: .35, size: 2.35 },
  小鸟: { file: "bird", turn: -.3, size: 2.2 },
  大公鸡: { file: "rooster", turn: .25, size: 2.35 },
  小猪: { file: "pig", turn: .35, size: 2.35 },
  小马: { file: "horse", turn: .55, size: 2.55 },
  小青蛙: { file: "frog", turn: -.35, size: 2.25 },
  大象: { file: "elephant", turn: .5, size: 2.5 },
  狮子: { file: "lion", turn: .55, size: 2.5 },
  小汽车: { file: "car", turn: -.5, size: 2.65 },
  公交车: { file: "bus", turn: -.45, size: 2.7 },
  消防车: { file: "firetruck", turn: -.45, size: 3.05 },
  火车: { file: "train", turn: -.5, size: 2.65 },
  挖掘机: { file: "excavator", turn: -.65, size: 3.7 },
  飞机: { file: "airplane", turn: -.55, size: 2.7 },
  救护车: { file: "ambulance", turn: -.45, size: 2.65 },
  警车: { file: "policecar", turn: -.45, size: 2.65 },
  摩托车: { file: "motorcycle", turn: -.45, size: 2.5 },
  自行车: { file: "bicycle", turn: -.4, size: 2.5 },
  轮船: { file: "ship", turn: -.5, size: 2.65 },
  直升机: { file: "helicopter", turn: -.45, size: 2.65 },
  苹果: { file: "apple", turn: -.25, size: 2.2 },
  香蕉: { file: "banana", turn: 1.28, size: 4.4 },
  橙子: { file: "orange", turn: -.25, size: 2.2 },
  西瓜: { file: "watermelon", turn: -.2, size: 2.35 },
  草莓: { file: "strawberry", turn: -.2, size: 2.25 },
  葡萄: { file: "grape", turn: -.2, size: 2.35 },
  梨: { file: "pear", turn: -.2, size: 2.25 },
  桃子: { file: "peach", turn: -.2, size: 2.2 },
  菠萝: { file: "pineapple", turn: -.2, size: 2.45 },
  芒果: { file: "mango", turn: -.2, size: 2.3, tint: 0xf2b43b },
  猕猴桃: { file: "kiwi", turn: -.2, size: 2.35 },
  樱桃: { file: "cherry", turn: -.2, size: 2.3 },
  蓝莓: { file: "blueberry", turn: -.2, size: 2.25 },
  柠檬: { file: "lemon", turn: -.2, size: 2.3 },
};

const movementClips: Record<string, string[]> = {
  run: ["run", "walk", "trot"],
  jump: ["jump", "hop"],
  waddle: ["walk", "waddle"],
  nod: ["eat", "idle", "head"],
  bounce: ["jump", "idle"],
  fly: ["fly", "flap"],
  flap: ["flap", "fly"],
  sniff: ["eat", "idle", "sniff"],
  gallop: ["gallop", "run", "trot"],
  leap: ["jump", "hop"],
  roar: ["roar", "attack", "idle"],
};

function chooseClip(clips: THREE.AnimationClip[], motion: string) {
  const preferred = movementClips[motion] ?? [];
  for (const word of preferred) {
    const match = clips.find((clip) => clip.name.toLowerCase().includes(word));
    if (match) return match;
  }
  return clips.find((clip) => !/(death|die|attack)/i.test(clip.name)) ?? clips[0];
}

function makeWaterSpray() {
  const water = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x74d9ff,
    transparent: true,
    opacity: .82,
    roughness: .22,
    transmission: .08,
  });

  for (let index = 0; index < 14; index += 1) {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(.045 + (index % 3) * .012, 10, 8), material);
    drop.userData.offset = index / 14;
    drop.castShadow = true;
    water.add(drop);
  }
  water.visible = false;
  return water;
}

function tintModel(root: THREE.Object3D, color: number) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const source = Array.isArray(child.material) ? child.material : [child.material];
    child.material = source.map((entry) => {
      const next = entry.clone();
      if (next instanceof THREE.MeshStandardMaterial) next.color.setHex(color);
      return next;
    });
  });
}

export default function ThreeLearningModel({ name, fallbackEmoji, motion, isActive, motionCycle }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(isActive);
  const cycleRef = useRef(motionCycle);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const config = models[name];

  useEffect(() => {
    activeRef.current = isActive;
    cycleRef.current = motionCycle;
  }, [isActive, motionCycle]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !config) {
      setStatus("failed");
      return;
    }

    setStatus("loading");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 40);
    camera.position.set(0, 1.25, 5.8);
    camera.lookAt(0, .45, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setStatus("failed");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.className = "three-canvas gltf-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff8e8, 0x73858b, 2.15));
    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(-3.6, 6.2, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -.0006;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd894, 1.25);
    rim.position.set(4, 2.8, -3);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 64),
      new THREE.ShadowMaterial({ color: 0x604c2f, opacity: .17, transparent: true }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -.76;
    ground.receiveShadow = true;
    scene.add(ground);

    const stage = new THREE.Group();
    stage.position.y = -.76;
    stage.rotation.y = config.turn ?? 0;
    scene.add(stage);

    const water = makeWaterSpray();
    water.position.set(.7, .35, .2);
    stage.add(water);

    let disposed = false;
    let mixer: THREE.AnimationMixer | null = null;
    let action: THREE.AnimationAction | null = null;
    let model: THREE.Object3D | null = null;
    let selectedClip: THREE.AnimationClip | undefined;
    let seenCycle = cycleRef.current;
    let motionStarted = performance.now();

    new GLTFLoader().load(
      `/models/${config.file}.glb`,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
          if (Array.isArray(child.material)) child.material = child.material.map((entry) => entry.clone());
          else child.material = child.material.clone();
        });
        if (config.tint) tintModel(model, config.tint);

        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const scale = (config.size ?? 2.45) / Math.max(size.x, size.y, size.z, .001);
        model.scale.setScalar(scale);
        const fitted = new THREE.Box3().setFromObject(model);
        const center = fitted.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -fitted.min.y, -center.z);
        stage.add(model);

        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          selectedClip = chooseClip(gltf.animations, motion);
          if (selectedClip) {
            action = mixer.clipAction(selectedClip);
            action.setLoop(THREE.LoopRepeat, Infinity).play();
          }
        }
        setStatus("ready");
      },
      undefined,
      () => {
        if (!disposed) setStatus("failed");
      },
    );

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let previousTime = performance.now();
    let frame = 0;
    const render = (time: number) => {
      if (disposed) return;
      const dt = Math.min(Math.max((time - previousTime) / 1000, 0), .05);
      previousTime = time;
      mixer?.update(dt);
      if (cycleRef.current !== seenCycle) {
        seenCycle = cycleRef.current;
        motionStarted = time;
        action?.reset().fadeIn(.12).play();
      }

      const elapsed = time / 1000;
      const moving = activeRef.current;
      const motionTime = Math.max(0, (time - motionStarted) / 1000);
      const wave = Math.sin(motionTime * Math.PI * 2);
      stage.position.set(0, -.76, 0);
      stage.rotation.set(0, (config.turn ?? 0) + Math.sin(elapsed * .75) * .055, 0);
      stage.scale.setScalar(1);
      water.visible = false;

      if (moving) {
        if (["run", "drive", "gallop", "chug", "zip", "pedal"].includes(motion)) {
          stage.position.x = Math.sin(motionTime * 2.15) * 1.05;
          stage.position.y += Math.abs(wave) * .06;
          stage.rotation.z = wave * .025;
        } else if (["jump", "leap", "bounce", "pop"].includes(motion)) {
          stage.position.y += Math.abs(Math.sin(motionTime * 2.9)) * .62;
          stage.rotation.z = wave * .065;
        } else if (["fly", "soar", "hover"].includes(motion)) {
          stage.position.y += .42 + Math.sin(motionTime * 3.2) * .18;
          stage.rotation.z = Math.sin(motionTime * 2.1) * .12;
        } else if (["waddle", "sway", "jiggle", "flap"].includes(motion)) {
          stage.rotation.z = wave * .12;
          stage.position.y += Math.abs(wave) * .06;
        } else if (["roll", "peel", "split"].includes(motion)) {
          stage.rotation.z = motionTime * 1.7;
          stage.position.y += Math.abs(wave) * .12;
        } else if (motion === "dig") {
          stage.rotation.z = -.07 + Math.sin(motionTime * 3.5) * .055;
        } else if (["spray", "siren"].includes(motion)) {
          if (motion === "spray") {
            water.visible = true;
            water.children.forEach((drop, index) => {
              const phase = (motionTime * .85 + Number(drop.userData.offset)) % 1;
              drop.position.set(phase * 2.15 - .15, 1.15 - phase * .9 + Math.sin(phase * Math.PI) * .72, Math.sin(index * 2.4) * .11);
              drop.scale.setScalar(.7 + (1 - phase) * .5);
            });
          }
          stage.position.x = Math.sin(motionTime * 9) * .045;
          stage.rotation.z = Math.sin(motionTime * 8) * .018;
        } else {
          stage.rotation.y += wave * .1;
          stage.position.y += Math.abs(wave) * .05;
        }
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mixer?.stopAllAction();
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((entry) => entry.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [config, motion]);

  return (
    <div ref={hostRef} className={`three-model gltf-model${status === "ready" ? " is-ready" : ""}`} aria-label={`${name}的仿真卡通三维模型`}>
      {status === "loading" && <span className="three-loading" aria-hidden="true"><i /><i /><i /></span>}
      {status === "failed" && <span className="model-fallback" aria-hidden="true">{fallbackEmoji}</span>}
      <span className="model-3d-badge" aria-hidden="true">3D</span>
    </div>
  );
}
