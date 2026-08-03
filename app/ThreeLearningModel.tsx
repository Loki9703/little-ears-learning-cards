"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type ModelCategory = "animals" | "vehicles" | "fruits";

type Rig = {
  root: THREE.Group;
  parts: Record<string, THREE.Object3D[]>;
  materials: Record<string, THREE.MeshStandardMaterial[]>;
  nodes: THREE.Object3D[];
  allMaterials: THREE.MeshStandardMaterial[];
};

type Props = {
  category: ModelCategory;
  name: string;
  fallbackEmoji: string;
  motion: string;
  isActive: boolean;
  motionCycle: number;
};

const palette = {
  cream: 0xfff4da,
  dark: 0x29382f,
  white: 0xffffff,
  black: 0x24262b,
  brown: 0x9a6037,
  tan: 0xd99a56,
  pink: 0xf4a9b8,
  red: 0xe9574f,
  orange: 0xef913f,
  yellow: 0xf4c83d,
  green: 0x5aa357,
  blue: 0x55a9d8,
  purple: 0x8866bb,
  gray: 0x9aa8b4,
};

function material(color: number, roughness = 0.72, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function mesh(
  geometry: THREE.BufferGeometry,
  modelMaterial: THREE.MeshStandardMaterial,
  position: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  rotation: [number, number, number] = [0, 0, 0],
) {
  const result = new THREE.Mesh(geometry, modelMaterial);
  result.position.set(...position);
  result.scale.set(...scale);
  result.rotation.set(...rotation);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function sphere(color: number, position: [number, number, number], scale: [number, number, number], segments = 20) {
  return mesh(new THREE.SphereGeometry(0.5, segments, Math.max(10, Math.floor(segments * .7))), material(color), position, scale);
}

function cube(color: number, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number] = [0, 0, 0], metalness = .02) {
  return mesh(new THREE.BoxGeometry(1, 1, 1), material(color, .68, metalness), position, scale, rotation);
}

function cylinder(color: number, position: [number, number, number], radius: number, length: number, rotation: [number, number, number] = [0, 0, 0], segments = 16) {
  return mesh(new THREE.CylinderGeometry(radius, radius, length, segments), material(color), position, [1, 1, 1], rotation);
}

function cone(color: number, position: [number, number, number], radius: number, length: number, rotation: [number, number, number] = [0, 0, 0]) {
  return mesh(new THREE.ConeGeometry(radius, length, 14), material(color), position, [1, 1, 1], rotation);
}

function torus(color: number, position: [number, number, number], radius: number, tube: number, rotation: [number, number, number] = [0, 0, 0]) {
  return mesh(new THREE.TorusGeometry(radius, tube, 10, 24), material(color, .62, .04), position, [1, 1, 1], rotation);
}

function rodBetween(color: number, start: THREE.Vector3, end: THREE.Vector3, radius = .04) {
  const direction = end.clone().sub(start);
  const result = cylinder(color, [0, 0, 0], radius, direction.length(), [0, 0, 0], 12);
  result.position.copy(start.clone().add(end).multiplyScalar(.5));
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return result;
}

function emptyRig() : Rig {
  return { root: new THREE.Group(), parts: {}, materials: {}, nodes: [], allMaterials: [] };
}

function track(rig: Rig, key: string, object: THREE.Object3D) {
  (rig.parts[key] ??= []).push(object);
  return object;
}

function trackMaterial(rig: Rig, key: string, modelMaterial: THREE.MeshStandardMaterial) {
  (rig.materials[key] ??= []).push(modelMaterial);
  return modelMaterial;
}

function addEyes(root: THREE.Group, x = .6, y = 1.34, z = .62, spacing = .18) {
  const eyeMaterial = material(palette.black, .5);
  const shineMaterial = material(palette.white, .42);
  for (const side of [-1, 1]) {
    root.add(mesh(new THREE.SphereGeometry(.075, 14, 10), eyeMaterial, [x + side * spacing, y, z]));
    root.add(mesh(new THREE.SphereGeometry(.022, 10, 8), shineMaterial, [x + side * spacing - .018, y + .025, z + .065]));
  }
}

function finalizeRig(rig: Rig) {
  const materials = new Set<THREE.MeshStandardMaterial>();
  rig.nodes = [];
  rig.root.traverse((node) => {
    rig.nodes.push(node);
    node.userData.basePosition = node.position.clone();
    node.userData.baseQuaternion = node.quaternion.clone();
    node.userData.baseScale = node.scale.clone();
    node.userData.baseVisible = node.visible;
    if (node instanceof THREE.Mesh) {
      const nodeMaterials = Array.isArray(node.material) ? node.material : [node.material];
      for (const nodeMaterial of nodeMaterials) {
        if (nodeMaterial instanceof THREE.MeshStandardMaterial) materials.add(nodeMaterial);
      }
    }
  });
  rig.allMaterials = [...materials];
  for (const modelMaterial of rig.allMaterials) {
    modelMaterial.userData.baseOpacity = modelMaterial.opacity;
    modelMaterial.userData.baseEmissiveIntensity = modelMaterial.emissiveIntensity;
  }
  return rig;
}

function createQuadruped(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const colorMap: Record<string, number> = {
    小狗: 0xd88c45,
    小猫: 0xa98bd5,
    小牛: 0xf5f1e8,
    小羊: 0xf7f3e8,
    小猪: 0xf3a5b5,
    小马: 0xa96b3d,
    狮子: 0xe9a43e,
  };
  const bodyColor = colorMap[name] ?? palette.tan;
  const body = track(rig, "body", sphere(bodyColor, [0, .83, 0], [2.1, 1.15, 1.05], 22));
  const head = track(rig, "head", sphere(bodyColor, [.66, 1.34, .22], [1.08, 1.08, 1.04], 22));
  root.add(body, head);

  const legs: THREE.Object3D[] = [];
  for (const x of [-.58, .48]) {
    for (const z of [-.28, .28]) {
      const leg = mesh(new THREE.CapsuleGeometry(.105, .42, 5, 10), material(bodyColor), [x, .38, z]);
      legs.push(leg);
      root.add(leg);
    }
  }
  rig.parts.legs = legs;

  const snoutColor = name === "小猪" ? 0xed829c : name === "小牛" ? 0xe9a8a3 : 0xc7773a;
  const snout = track(rig, "snout", mesh(new THREE.CylinderGeometry(.22, .25, .2, 16), material(snoutColor), [.66, 1.18, .7], [1, 1, 1], [Math.PI / 2, 0, 0]));
  root.add(snout);
  addEyes(root);

  const tail = track(rig, "tail", cylinder(bodyColor, [-1.0, 1.02, -.02], .07, .62, [0, 0, -1.05], 12));
  root.add(tail);

  if (name === "小狗") {
    const earMaterial = material(0x9b5b31);
    const leftEar = track(rig, "ears", mesh(new THREE.CapsuleGeometry(.12, .34, 5, 10), earMaterial, [.32, 1.53, .2], [1, 1, 1], [0, 0, .52]));
    const rightEar = track(rig, "ears", mesh(new THREE.CapsuleGeometry(.12, .34, 5, 10), earMaterial, [1.0, 1.5, .2], [1, 1, 1], [0, 0, -.52]));
    root.add(leftEar, rightEar);
  } else if (name === "小猫") {
    root.add(cone(bodyColor, [.38, 1.78, .22], .2, .42, [0, 0, -.1]), cone(bodyColor, [.92, 1.78, .22], .2, .42, [0, 0, .1]));
    const whiskerMaterial = material(0xf8f5ee);
    for (const side of [-1, 1]) {
      root.add(mesh(new THREE.CylinderGeometry(.012, .012, .46, 8), whiskerMaterial, [.66 + side * .3, 1.13, .73], [1, 1, 1], [0, 0, Math.PI / 2 + side * .15]));
    }
  } else if (name === "小牛") {
    const spotMaterial = material(palette.black);
    root.add(mesh(new THREE.SphereGeometry(.3, 14, 10), spotMaterial, [-.38, .92, .48], [1.3, .8, .2]));
    root.add(cone(0xf4d6a1, [.32, 1.73, .15], .09, .38, [0, 0, .8]), cone(0xf4d6a1, [1.0, 1.73, .15], .09, .38, [0, 0, -.8]));
    root.add(mesh(new THREE.CapsuleGeometry(.12, .25, 4, 8), material(palette.black), [.34, 1.55, .2], [1, 1, 1], [0, 0, .8]));
    root.add(mesh(new THREE.CapsuleGeometry(.12, .25, 4, 8), material(palette.black), [.98, 1.55, .2], [1, 1, 1], [0, 0, -.8]));
  } else if (name === "小羊") {
    const woolMaterial = material(0xfffbef);
    for (const x of [-.72, -.36, 0, .36, .7]) {
      for (const y of [.75, 1.02]) root.add(mesh(new THREE.DodecahedronGeometry(.35, 1), woolMaterial, [x, y, 0], [1.05, .9, .9]));
    }
  } else if (name === "小猪") {
    root.add(cone(bodyColor, [.4, 1.78, .2], .19, .36, [0, 0, -.12]), cone(bodyColor, [.92, 1.78, .2], .19, .36, [0, 0, .12]));
    root.add(mesh(new THREE.SphereGeometry(.025, 10, 8), material(0x8f4d5d), [.58, 1.18, .81]), mesh(new THREE.SphereGeometry(.025, 10, 8), material(0x8f4d5d), [.74, 1.18, .81]));
  } else if (name === "小马") {
    const maneMaterial = material(0x55372b);
    for (let i = 0; i < 5; i += 1) root.add(cone(0x55372b, [.18, 1.62 - i * .1, .05], .13, .34, [0, 0, -.8]));
    root.add(cube(0xf3e7d1, [.66, 1.12, .78], [.24, .12, .08]));
    trackMaterial(rig, "mane", maneMaterial);
  } else if (name === "狮子") {
    const mane = track(rig, "mane", torus(0xb9692d, [.66, 1.34, .2], .63, .24));
    root.add(mane);
    head.position.z = .34;
  }

  root.scale.setScalar(name === "狮子" ? .92 : 1);
  return finalizeRig(rig);
}

function createBird(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const colors: Record<string, number> = { 小鸭: 0xf3cf45, 小鸟: 0x67a9dc, 大公鸡: 0xf2a33c };
  const bodyColor = colors[name] ?? palette.yellow;
  const body = track(rig, "body", sphere(bodyColor, [0, .85, 0], [1.45, 1.2, 1.05]));
  const head = track(rig, "head", sphere(bodyColor, [.38, 1.48, .22], [.9, .9, .9]));
  const beak = track(rig, "beak", cone(0xed7f2d, [.38, 1.38, .72], .17, .45, [Math.PI / 2, 0, 0]));
  const wingLeft = track(rig, "wings", sphere(bodyColor === palette.yellow ? 0xe4b82f : 0x4d8dc1, [-.48, .94, .25], [1.15, .55, .28]));
  const wingRight = track(rig, "wings", sphere(bodyColor === palette.yellow ? 0xe4b82f : 0x4d8dc1, [.3, .92, -.38], [1.0, .48, .25]));
  root.add(body, head, beak, wingLeft, wingRight);
  addEyes(root, .38, 1.57, .63, .15);

  const feet = [
    cylinder(0xe8822d, [-.32, .28, .18], .055, .38),
    cylinder(0xe8822d, [.28, .28, .18], .055, .38),
  ];
  rig.parts.legs = feet;
  root.add(...feet);

  if (name === "大公鸡") {
    for (let i = 0; i < 3; i += 1) root.add(sphere(0xe34f45, [.22 + i * .16, 1.93 + (i === 1 ? .08 : 0), .18], [.3, .42, .2]));
    const tailColors = [0x3c875d, 0x4e71a9, 0x9b4d9f];
    tailColors.forEach((color, i) => {
      const feather = track(rig, "tail", mesh(new THREE.CapsuleGeometry(.1, .6, 5, 9), material(color), [-.82 - i * .06, 1.18 + i * .12, -.05], [1, 1, 1], [0, 0, -.7 - i * .14]));
      root.add(feather);
    });
  }
  return finalizeRig(rig);
}

function createFrog() {
  const rig = emptyRig();
  const root = rig.root;
  const body = track(rig, "body", sphere(0x63aa57, [0, .65, 0], [1.55, .85, 1.1]));
  const head = track(rig, "head", sphere(0x72b962, [0, 1.15, .18], [1.5, .85, 1.02]));
  root.add(body, head);
  for (const x of [-.42, .42]) {
    root.add(sphere(0x72b962, [x, 1.55, .34], [.45, .45, .45]));
    root.add(sphere(palette.black, [x, 1.58, .55], [.16, .16, .12]));
  }
  const legs = [
    sphere(0x4e9448, [-.78, .35, 0], [1.0, .34, .62]),
    sphere(0x4e9448, [.78, .35, 0], [1.0, .34, .62]),
  ];
  rig.parts.legs = legs;
  root.add(...legs);
  return finalizeRig(rig);
}

function createElephant() {
  const rig = emptyRig();
  const root = rig.root;
  const gray = 0x98a9b5;
  const body = track(rig, "body", sphere(gray, [-.22, .9, 0], [2.25, 1.35, 1.25]));
  const head = track(rig, "head", sphere(gray, [.78, 1.28, .25], [1.15, 1.2, 1.08]));
  root.add(body, head);
  const ears = [sphere(0xaab7c1, [.34, 1.35, .08], [.85, 1.1, .25]), sphere(0xaab7c1, [1.14, 1.35, .02], [.85, 1.1, .25])];
  rig.parts.ears = ears;
  root.add(...ears);
  addEyes(root, .78, 1.43, .76, .18);
  const legs: THREE.Object3D[] = [];
  for (const x of [-.72, .25]) for (const z of [-.3, .3]) legs.push(mesh(new THREE.CapsuleGeometry(.14, .48, 5, 10), material(gray), [x, .38, z]));
  rig.parts.legs = legs;
  root.add(...legs);
  const trunkParts: THREE.Object3D[] = [];
  for (let i = 0; i < 4; i += 1) {
    const part = mesh(new THREE.CapsuleGeometry(.12 - i * .012, .28, 5, 10), material(gray), [1.03 + i * .08, .98 - i * .24, .67], [1, 1, 1], [0, 0, -.28]);
    trunkParts.push(part);
    root.add(part);
  }
  rig.parts.trunk = trunkParts;
  root.add(cone(0xf4e6c7, [.48, 1.02, .73], .06, .34, [Math.PI / 2, 0, .15]), cone(0xf4e6c7, [1.08, 1.02, .73], .06, .34, [Math.PI / 2, 0, -.15]));
  const waterMaterial = material(0x5fc6ef, .25);
  waterMaterial.transparent = true;
  const drops: THREE.Object3D[] = [];
  for (let i = 0; i < 14; i += 1) {
    const drop = mesh(new THREE.SphereGeometry(.055, 10, 8), waterMaterial, [1.15, .35, .72]);
    drop.visible = false;
    drops.push(drop);
    root.add(drop);
  }
  rig.parts.water = drops;
  return finalizeRig(rig);
}

function createAnimal(name: string) {
  if (["小狗", "小猫", "小牛", "小羊", "小猪", "小马", "狮子"].includes(name)) return createQuadruped(name);
  if (["小鸭", "小鸟", "大公鸡"].includes(name)) return createBird(name);
  if (name === "小青蛙") return createFrog();
  if (name === "大象") return createElephant();
  return createQuadruped("小狗");
}

function addVehicleWheels(rig: Rig, positions: Array<[number, number, number]>, radius = .28) {
  const wheels = positions.map((position) => mesh(new THREE.CylinderGeometry(radius, radius, .18, 18), material(0x30343a, .82, .04), position, [1, 1, 1], [Math.PI / 2, 0, 0]));
  rig.parts.wheels = wheels;
  rig.root.add(...wheels);
  for (const wheel of wheels) rig.root.add(mesh(new THREE.CylinderGeometry(radius * .42, radius * .42, .19, 16), material(0xe8e7df, .45, .28), [wheel.position.x, wheel.position.y, wheel.position.z], [1, 1, 1], [Math.PI / 2, 0, 0]));
}

function createRoadVehicle(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const configs: Record<string, { body: number; long?: boolean; tall?: boolean }> = {
    小汽车: { body: 0xe9584e },
    公交车: { body: 0xe7b93d, long: true, tall: true },
    消防车: { body: 0xdd4b45, long: true, tall: true },
    救护车: { body: 0xf5f5f0, long: true, tall: true },
    警车: { body: 0x477eaf },
  };
  const config = configs[name] ?? configs.小汽车;
  const length = config.long ? 2.55 : 2.0;
  const body = track(rig, "body", cube(config.body, [0, .62, 0], [length, .58, .92], [0, 0, 0], .08));
  const cabinColor = name === "救护车" ? 0xf5f5f0 : config.body;
  const cabin = track(rig, "body", cube(cabinColor, [config.long ? -.15 : -.05, 1.08, 0], [config.long ? 1.8 : 1.2, config.tall ? .72 : .58, .82], [0, 0, 0], .06));
  root.add(body, cabin);
  const glass = material(0x91cde2, .28, .18);
  root.add(cube(0x91cde2, [.48, 1.14, .43], [.48, .38, .035]), cube(0x91cde2, [-.25, 1.14, .43], [.48, .38, .035]));
  const wheelX = config.long ? .86 : .68;
  addVehicleWheels(rig, [[-wheelX, .31, .5], [wheelX, .31, .5], [-wheelX, .31, -.5], [wheelX, .31, -.5]], .27);
  root.add(cube(0xffe36b, [length / 2 + .02, .67, .33], [.08, .17, .2]), cube(0xffe36b, [length / 2 + .02, .67, -.33], [.08, .17, .2]));

  if (name === "消防车") {
    const ladder = track(rig, "ladder", new THREE.Group());
    ladder.position.set(-.25, 1.58, 0);
    ladder.add(cube(0xe6e7e5, [0, 0, .18], [1.7, .06, .06]), cube(0xe6e7e5, [0, 0, -.18], [1.7, .06, .06]));
    for (let x = -.72; x <= .72; x += .24) ladder.add(cube(0xe6e7e5, [x, 0, 0], [.04, .06, .38]));
    root.add(ladder);
    const nozzle = track(rig, "nozzle", cylinder(0xcfd4d4, [1.12, 1.34, 0], .085, .6, [0, 0, Math.PI / 2]));
    root.add(nozzle);
    const waterMaterial = material(0x61c8ef, .22);
    waterMaterial.transparent = true;
    const drops: THREE.Object3D[] = [];
    for (let i = 0; i < 18; i += 1) {
      const drop = mesh(new THREE.SphereGeometry(.052, 9, 7), waterMaterial, [1.42, 1.34, 0]);
      drop.visible = false;
      drops.push(drop);
      root.add(drop);
    }
    rig.parts.water = drops;
  }

  if (["救护车", "警车"].includes(name)) {
    const lightColors = name === "救护车" ? [0xe94f4f, 0x4d93d5] : [0xe94f4f, 0x4d93d5];
    const lights: THREE.Object3D[] = [];
    lightColors.forEach((color, index) => {
      const lightMaterial = material(color, .32, .12);
      lightMaterial.emissive.setHex(color);
      lightMaterial.emissiveIntensity = .12;
      trackMaterial(rig, "siren", lightMaterial);
      const light = mesh(new THREE.CylinderGeometry(.14, .16, .18, 14), lightMaterial, [-.15 + index * .3, 1.57, 0]);
      lights.push(light);
      root.add(light);
    });
    rig.parts.siren = lights;
  }

  if (name === "救护车") {
    root.add(cube(0xe75555, [-.55, 1.12, .455], [.13, .46, .04]), cube(0xe75555, [-.55, 1.12, .455], [.5, .13, .04]));
  }
  if (name === "警车") root.add(cube(0xf3f3ef, [-.45, .63, .465], [.85, .34, .04]));
  void glass;
  return finalizeRig(rig);
}

function createTrain() {
  const rig = emptyRig();
  const root = rig.root;
  root.add(cube(0x4e91bb, [0, .7, 0], [2.15, .72, .9]), cube(0xe2584d, [-.45, 1.18, 0], [1.0, .72, .8]));
  root.add(cylinder(0x30383b, [.7, 1.35, 0], .16, .62));
  addVehicleWheels(rig, [[-.72, .3, .49], [0, .3, .49], [.72, .3, .49], [-.72, .3, -.49], [0, .3, -.49], [.72, .3, -.49]], .25);
  const smokeMaterial = material(0xffffff, .9);
  smokeMaterial.transparent = true;
  const puffs: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i += 1) {
    const puff = sphere(0xffffff, [.7, 1.65, 0], [.38, .38, .38]);
    puff.visible = false;
    puffs.push(puff);
    root.add(puff);
  }
  rig.parts.smoke = puffs;
  return finalizeRig(rig);
}

function createExcavator() {
  const rig = emptyRig();
  const root = rig.root;
  root.add(cube(0x3c4145, [-.25, .35, .35], [1.7, .34, .38]), cube(0x3c4145, [-.25, .35, -.35], [1.7, .34, .38]));
  root.add(cube(0xe9b536, [-.2, .68, 0], [1.35, .35, .82]), cube(0xe9b536, [-.48, 1.12, 0], [.72, .78, .72]));
  root.add(cube(0x89c9dc, [-.42, 1.18, .375], [.46, .46, .035]));
  const arm = track(rig, "arm", new THREE.Group());
  arm.position.set(.34, .98, 0);
  const upper = cube(0xe9b536, [.55, .35, 0], [1.15, .18, .24], [0, 0, .55]);
  const forearm = track(rig, "forearm", new THREE.Group());
  forearm.position.set(1.05, .67, 0);
  forearm.add(cube(0xe9b536, [.42, -.3, 0], [.9, .16, .22], [0, 0, -.75]));
  forearm.add(mesh(new THREE.BoxGeometry(.48, .38, .48), material(0xb77f2f), [.78, -.67, 0], [1, 1, 1], [0, 0, -.25]));
  arm.add(upper, forearm);
  root.add(arm);
  return finalizeRig(rig);
}

function createAircraft(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  if (name === "飞机") {
    const fuselage = track(rig, "body", sphere(0xe9edf0, [0, .95, 0], [3.0, .7, .7], 24));
    root.add(fuselage, cube(0x63a4d3, [-.15, .94, 0], [1.2, .12, 2.7], [0, 0, -.05], .06), cube(0x63a4d3, [-1.1, 1.22, 0], [.55, .1, 1.25], [0, 0, .45], .06));
    root.add(cone(0xe9edf0, [1.58, .95, 0], .35, .7, [0, 0, -Math.PI / 2]));
    const windows = material(0x5d9fca, .25, .18);
    for (let i = -2; i <= 2; i += 1) root.add(mesh(new THREE.SphereGeometry(.08, 10, 8), windows, [-.45 + i * .3, 1.08, .34]));
  } else {
    const cabin = track(rig, "body", sphere(0xe29b45, [0, .9, 0], [1.65, 1.05, 1.0], 22));
    root.add(cabin, sphere(0x81bfd8, [.45, 1.04, .42], [.75, .6, .12]));
    const tail = track(rig, "tail", cube(0xe29b45, [-1.2, 1.0, 0], [1.5, .16, .16], [0, 0, .12], .05));
    root.add(tail, cube(0xe29b45, [-1.82, 1.05, 0], [.1, .7, .65], [0, 0, -.1]));
    const rotor = track(rig, "rotor", new THREE.Group());
    rotor.position.set(0, 1.65, 0);
    rotor.add(cube(0x43484b, [0, 0, 0], [2.9, .06, .13], [0, 0, 0], .2), cube(0x43484b, [0, 0, 0], [.13, .06, 2.9], [0, 0, 0], .2));
    root.add(rotor);
    const tailRotor = track(rig, "tailRotor", torus(0x43484b, [-1.82, 1.05, .38], .3, .035));
    root.add(tailRotor);
    root.add(rodBetween(0x43484b, new THREE.Vector3(-.45, .38, .28), new THREE.Vector3(-.7, .12, .38), .035));
    root.add(rodBetween(0x43484b, new THREE.Vector3(.45, .38, .28), new THREE.Vector3(.7, .12, .38), .035));
    root.add(cube(0x43484b, [0, .1, .39], [1.6, .055, .06], [0, 0, 0], .16));
  }
  return finalizeRig(rig);
}

function createCycle(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const wheelRadius = name === "自行车" ? .55 : .48;
  const wheelPositions: Array<[number, number, number]> = [[-.72, .55, 0], [.72, .55, 0]];
  const wheels = wheelPositions.map((position) => torus(0x33373a, position, wheelRadius, .07));
  rig.parts.wheels = wheels;
  root.add(...wheels);
  const frameColor = name === "自行车" ? 0x51a06a : 0x785fa2;
  root.add(rodBetween(frameColor, new THREE.Vector3(-.72, .55, 0), new THREE.Vector3(0, .98, 0), .055));
  root.add(rodBetween(frameColor, new THREE.Vector3(.72, .55, 0), new THREE.Vector3(0, .98, 0), .055));
  root.add(rodBetween(frameColor, new THREE.Vector3(-.72, .55, 0), new THREE.Vector3(.15, .55, 0), .055));
  root.add(rodBetween(frameColor, new THREE.Vector3(.15, .55, 0), new THREE.Vector3(0, .98, 0), .055));
  root.add(rodBetween(0x3a3d3f, new THREE.Vector3(.72, .55, 0), new THREE.Vector3(.52, 1.25, 0), .04));
  root.add(cube(0x3a3d3f, [.52, 1.28, 0], [.48, .05, .08]));
  root.add(cube(0x3a3d3f, [-.05, 1.06, 0], [.35, .08, .2]));
  if (name === "摩托车") {
    root.add(sphere(frameColor, [0, .92, 0], [1.45, .55, .7]), cube(0x3b3d40, [-.2, 1.2, 0], [.75, .12, .5]));
    root.add(sphere(0xffe167, [.75, .96, .08], [.28, .28, .18]));
  }
  return finalizeRig(rig);
}

function createShip() {
  const rig = emptyRig();
  const root = rig.root;
  const hull = track(rig, "body", sphere(0x4d91b5, [0, .58, 0], [2.8, .65, 1.15], 22));
  root.add(hull, cube(0xf2f1e8, [-.2, 1.05, 0], [1.65, .52, .82]), cube(0xf2f1e8, [-.3, 1.48, 0], [.95, .4, .65]));
  root.add(cylinder(0xe6a143, [-.46, 1.86, 0], .13, .52));
  const windows = material(0x6ba9c7, .35, .12);
  for (let i = -1; i <= 1; i += 1) root.add(mesh(new THREE.SphereGeometry(.1, 10, 8), windows, [-.3 + i * .3, 1.52, .36]));
  const waves: THREE.Object3D[] = [];
  for (const x of [-.8, 0, .8]) {
    const wave = torus(0x78cbe8, [x, .3, .25], .42, .055, [Math.PI / 2, 0, 0]);
    waves.push(wave);
    root.add(wave);
  }
  rig.parts.waves = waves;
  return finalizeRig(rig);
}

function createVehicle(name: string) {
  if (["小汽车", "公交车", "消防车", "救护车", "警车"].includes(name)) return createRoadVehicle(name);
  if (name === "火车") return createTrain();
  if (name === "挖掘机") return createExcavator();
  if (["飞机", "直升机"].includes(name)) return createAircraft(name);
  if (["摩托车", "自行车"].includes(name)) return createCycle(name);
  if (name === "轮船") return createShip();
  return createRoadVehicle("小汽车");
}

function addLeaf(root: THREE.Group, position: [number, number, number], rotation: [number, number, number] = [0, 0, -.5]) {
  root.add(mesh(new THREE.SphereGeometry(.25, 12, 8), material(0x4c994f), position, [1.5, .38, .18], rotation));
}

function createRoundFruit(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const configs: Record<string, { color: number; scale: [number, number, number]; cut?: number }> = {
    苹果: { color: 0xdf5148, scale: [1.55, 1.45, 1.35] },
    橙子: { color: 0xee8b31, scale: [1.45, 1.45, 1.35] },
    西瓜: { color: 0x559b4e, scale: [1.85, 1.25, 1.28], cut: 0xe85858 },
    桃子: { color: 0xef8d83, scale: [1.48, 1.4, 1.32] },
    芒果: { color: 0xeeb745, scale: [1.65, 1.25, 1.18] },
    猕猴桃: { color: 0x967044, scale: [1.4, 1.32, 1.28], cut: 0x7dad49 },
    蓝莓: { color: 0x596cac, scale: [1.32, 1.3, 1.24] },
    柠檬: { color: 0xefd94c, scale: [1.7, 1.12, 1.08] },
  };
  const config = configs[name] ?? configs.苹果;
  const whole = track(rig, "whole", sphere(config.color, [0, .98, 0], config.scale, name === "橙子" ? 18 : 22));
  root.add(whole);
  if (name === "橙子") {
    const textureMaterial = material(0xd97624);
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      root.add(mesh(new THREE.SphereGeometry(.025, 8, 6), textureMaterial, [Math.cos(angle) * .61, .98 + Math.sin(angle * 2) * .32, .62]));
    }
  }
  if (name === "西瓜") {
    for (let i = -2; i <= 2; i += 1) root.add(torus(0x377d42, [0, .98, 0], .5 + Math.abs(i) * .05, .035, [0, i * .3, 0]));
  }
  if (["苹果", "桃子", "芒果"].includes(name)) {
    root.add(cylinder(0x704b2e, [0, 1.78, 0], .055, .42, [0, 0, -.15], 10));
    addLeaf(root, [.22, 1.83, .05]);
  }
  if (name === "蓝莓") {
    for (let i = 0; i < 5; i += 1) root.add(cone(0x344778, [Math.cos(i * 1.256) * .13, 1.67, Math.sin(i * 1.256) * .13], .08, .28, [0, 0, Math.cos(i) * .5]));
  }
  if (name === "柠檬") {
    root.add(cone(0xefd94c, [-.88, .98, 0], .2, .35, [0, 0, Math.PI / 2]), cone(0xefd94c, [.88, .98, 0], .2, .35, [0, 0, -Math.PI / 2]));
  }
  if (config.cut) {
    const halves: THREE.Object3D[] = [];
    for (const side of [-1, 1]) {
      const half = new THREE.Group();
      half.visible = false;
      const halfOuter = sphere(config.color, [0, .98, 0], [config.scale[0] * .52, config.scale[1], config.scale[2]]);
      halfOuter.position.x = side * .38;
      const face = mesh(new THREE.CircleGeometry(.58, 24), material(config.cut), [side * .12, .98, .68], [1, 1, 1], [0, 0, 0]);
      face.scale.set(config.scale[0] * .72, config.scale[1] * .72, 1);
      half.add(halfOuter, face);
      if (name === "西瓜") {
        for (let i = -1; i <= 1; i += 1) half.add(sphere(0x3f3431, [side * .12 + i * .19, .98 + (i % 2) * .18, .705], [.08, .12, .04]));
      } else {
        for (let i = 0; i < 8; i += 1) {
          const angle = (i / 8) * Math.PI * 2;
          half.add(sphere(0x2e2e28, [side * .12 + Math.cos(angle) * .28, .98 + Math.sin(angle) * .28, .705], [.035, .055, .025]));
        }
      }
      halves.push(half);
      root.add(half);
    }
    rig.parts.halves = halves;
  }
  return finalizeRig(rig);
}

function createBanana() {
  const rig = emptyRig();
  const root = rig.root;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.92, .95, 0),
    new THREE.Vector3(-.55, .55, 0),
    new THREE.Vector3(.05, .42, 0),
    new THREE.Vector3(.65, .62, 0),
    new THREE.Vector3(.95, 1.02, 0),
  ]);
  const outerMaterial = trackMaterial(rig, "outer", material(0xf0c938, .62));
  outerMaterial.transparent = true;
  const coreMaterial = trackMaterial(rig, "core", material(0xffefbd, .78));
  coreMaterial.transparent = true;
  coreMaterial.opacity = 0;
  const outer = track(rig, "outer", mesh(new THREE.TubeGeometry(curve, 28, .23, 10, false), outerMaterial));
  const core = track(rig, "core", mesh(new THREE.TubeGeometry(curve, 28, .17, 10, false), coreMaterial));
  root.add(outer, core);
  const peels: THREE.Object3D[] = [];
  for (const side of [-1, 0, 1]) {
    const peelCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(.82 + side * .04, .94, side * .04),
      new THREE.Vector3(.98 + side * .22, .62, side * .14),
      new THREE.Vector3(.82 + side * .38, .18, side * .28),
    ]);
    const peel = mesh(new THREE.TubeGeometry(peelCurve, 12, .065, 7, false), material(0xe7b632));
    peel.visible = false;
    peels.push(peel);
    root.add(peel);
  }
  rig.parts.peels = peels;
  return finalizeRig(rig);
}

function createStrawberry() {
  const rig = emptyRig();
  const root = rig.root;
  const fruit = track(rig, "whole", cone(0xe65155, [0, 1.02, 0], .72, 1.5, [0, 0, Math.PI]));
  root.add(fruit);
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const y = .52 + (i % 4) * .25;
    const width = .56 * (1 - Math.abs(y - 1.0) * .45);
    root.add(sphere(0xf5d36d, [Math.cos(angle) * width, y, .52 + Math.sin(angle) * .06], [.08, .12, .04], 9));
  }
  for (let i = 0; i < 6; i += 1) root.add(cone(0x4e984f, [0, 1.8, 0], .2, .58, [0, 0, i * Math.PI / 3]));
  return finalizeRig(rig);
}

function createGrapes(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const fruitColor = name === "樱桃" ? 0xc93e4d : 0x7952a6;
  const fruits: THREE.Object3D[] = [];
  if (name === "樱桃") {
    for (const side of [-1, 1]) {
      const fruit = sphere(fruitColor, [side * .42, .78, 0], [.85, .85, .82]);
      fruits.push(fruit);
      root.add(fruit, rodBetween(0x4f7f42, new THREE.Vector3(side * .42, 1.18, 0), new THREE.Vector3(0, 1.82, 0), .035));
    }
    addLeaf(root, [.18, 1.72, .02], [0, 0, .4]);
  } else {
    const rows = [2, 3, 4, 3, 2];
    rows.forEach((count, row) => {
      for (let column = 0; column < count; column += 1) {
        const fruit = sphere(fruitColor, [(column - (count - 1) / 2) * .38, 1.48 - row * .28, (row % 2) * .06], [.62, .62, .62], 14);
        fruits.push(fruit);
        root.add(fruit);
      }
    });
    root.add(cylinder(0x5d763e, [0, 1.75, 0], .045, .44, [0, 0, -.2], 9));
    addLeaf(root, [.28, 1.82, 0]);
  }
  rig.parts.fruits = fruits;
  return finalizeRig(rig);
}

function createPearOrPineapple(name: string) {
  const rig = emptyRig();
  const root = rig.root;
  const isPineapple = name === "菠萝";
  const color = isPineapple ? 0xd9a536 : 0xaeca59;
  const bottom = track(rig, "whole", sphere(color, [0, .78, 0], isPineapple ? [1.28, 1.55, 1.18] : [1.45, 1.35, 1.25], isPineapple ? 14 : 22));
  root.add(bottom);
  if (!isPineapple) {
    root.add(sphere(color, [0, 1.35, 0], [.86, 1.0, .82]), cylinder(0x735033, [0, 1.88, 0], .05, .38, [0, 0, -.15], 9));
    addLeaf(root, [.22, 1.9, .02]);
  } else {
    for (let y = .25; y <= 1.35; y += .25) for (let i = 0; i < 7; i += 1) {
      const angle = i * Math.PI * 2 / 7 + y;
      root.add(cone(0xba7d27, [Math.cos(angle) * .48, y + .35, Math.sin(angle) * .48], .045, .2, [Math.PI / 2, angle, 0]));
    }
    for (let i = 0; i < 7; i += 1) root.add(cone(0x4d954c, [0, 1.9, 0], .2, .9, [0, 0, -.65 + i * .22]));
  }
  return finalizeRig(rig);
}

function createFruit(name: string) {
  if (["苹果", "橙子", "西瓜", "桃子", "芒果", "猕猴桃", "蓝莓", "柠檬"].includes(name)) return createRoundFruit(name);
  if (name === "香蕉") return createBanana();
  if (name === "草莓") return createStrawberry();
  if (["葡萄", "樱桃"].includes(name)) return createGrapes(name);
  if (["梨", "菠萝"].includes(name)) return createPearOrPineapple(name);
  return createRoundFruit("苹果");
}

function restoreRig(rig: Rig) {
  for (const node of rig.nodes) {
    node.position.copy(node.userData.basePosition as THREE.Vector3);
    node.quaternion.copy(node.userData.baseQuaternion as THREE.Quaternion);
    node.scale.copy(node.userData.baseScale as THREE.Vector3);
    node.visible = node.userData.baseVisible as boolean;
  }
  for (const modelMaterial of rig.allMaterials) {
    modelMaterial.opacity = modelMaterial.userData.baseOpacity as number;
    modelMaterial.emissiveIntensity = modelMaterial.userData.baseEmissiveIntensity as number;
  }
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - THREE.MathUtils.clamp(value, 0, 1), 3);
}

function animateRig(rig: Rig, motion: string, now: number, startedAt: number, active: boolean, reducedMotion: boolean) {
  restoreRig(rig);
  const idle = now * .001;
  rig.root.rotation.y += Math.sin(idle * .65) * .12 - .08;
  rig.root.position.y += Math.sin(idle * 1.35) * .025;

  const rotor = rig.parts.rotor?.[0];
  if (rotor) rotor.rotation.y += idle * 4;
  const tailRotor = rig.parts.tailRotor?.[0];
  if (tailRotor) tailRotor.rotation.z += idle * 4;
  if (!active || reducedMotion) return;

  const seconds = Math.max(0, (now - startedAt) / 1000);
  const p = THREE.MathUtils.clamp(seconds / 3.15, 0, 1);
  const wave = Math.sin(seconds * 10);
  const legs = rig.parts.legs ?? [];
  const wheels = rig.parts.wheels ?? [];

  if (["run", "gallop"].includes(motion)) {
    rig.root.position.x += -2.8 * (1 - easeOut(p * 1.3));
    rig.root.position.y += Math.abs(Math.sin(seconds * 9)) * (motion === "gallop" ? .22 : .14);
    legs.forEach((leg, index) => { leg.rotation.z += Math.sin(seconds * 12 + index * Math.PI) * .65; });
    const tail = rig.parts.tail?.[0];
    if (tail) tail.rotation.z += Math.sin(seconds * 12) * .35;
  } else if (["jump", "leap"].includes(motion)) {
    const jumps = Math.max(0, Math.sin(p * Math.PI * (motion === "leap" ? 2 : 3)));
    rig.root.position.y += jumps * (motion === "leap" ? 1.05 : .72);
    rig.root.position.x += motion === "leap" ? Math.sin(p * Math.PI) * .65 : 0;
    rig.root.rotation.z += Math.sin(p * Math.PI * 2) * .1;
  } else if (motion === "waddle") {
    rig.root.rotation.z += wave * .14;
    rig.root.position.x += Math.sin(seconds * 4) * .16;
    legs.forEach((leg, index) => { leg.rotation.z += wave * (index ? -.5 : .5); });
  } else if (motion === "nod") {
    const head = rig.parts.head?.[0];
    if (head) head.rotation.x += Math.max(0, Math.sin(seconds * 6)) * .32;
  } else if (motion === "bounce") {
    rig.root.position.y += Math.max(0, Math.sin(p * Math.PI * 4)) * .6;
    rig.root.scale.y *= 1 + Math.abs(Math.sin(seconds * 8)) * .05;
  } else if (["fly", "soar"].includes(motion)) {
    rig.root.position.x += -2.6 * (1 - easeOut(p * 1.25));
    rig.root.position.y += .45 + Math.sin(seconds * 5) * .22;
    rig.root.rotation.z += Math.sin(seconds * 4) * .12;
    (rig.parts.wings ?? []).forEach((wing, index) => { wing.rotation.x += wave * (index ? -.65 : .65); });
  } else if (motion === "flap") {
    (rig.parts.wings ?? []).forEach((wing, index) => { wing.rotation.x += wave * (index ? -.85 : .85); });
    rig.root.position.y += Math.abs(Math.sin(seconds * 6)) * .22;
  } else if (motion === "sniff") {
    const head = rig.parts.head?.[0];
    const snout = rig.parts.snout?.[0];
    if (head) head.position.z += Math.sin(seconds * 7) * .12;
    if (snout) snout.scale.setScalar(1 + Math.max(0, Math.sin(seconds * 8)) * .12);
  } else if (motion === "spray") {
    rig.root.rotation.z += Math.sin(seconds * 4) * .04;
    const water = rig.parts.water ?? [];
    water.forEach((drop, index) => {
      const local = (seconds * .9 + index / water.length) % 1;
      drop.visible = true;
      if (rig.parts.trunk) {
        drop.position.set(1.1 + local * 1.6, .32 + Math.sin(local * Math.PI) * 1.35, .72 + Math.sin(index) * .1);
      } else {
        drop.position.set(1.38 + local * 1.65, 1.35 + Math.sin(local * Math.PI) * .65 - local * .65, Math.sin(index * 2.3) * .14);
      }
      drop.scale.setScalar(.65 + local * .55);
    });
  } else if (motion === "roar") {
    const pulse = 1 + Math.max(0, Math.sin(seconds * 5)) * .13;
    rig.root.scale.multiplyScalar(pulse);
    rig.root.rotation.z += Math.sin(seconds * 24) * .025;
  } else if (["drive", "siren", "zip", "pedal"].includes(motion)) {
    rig.root.position.x += -2.7 * (1 - easeOut(p * 1.3));
    rig.root.position.y += Math.abs(Math.sin(seconds * 9)) * .08;
    wheels.forEach((wheel) => { wheel.rotation.z += seconds * 8; });
    if (motion === "siren") for (const sirenMaterial of rig.materials.siren ?? []) sirenMaterial.emissiveIntensity = Math.sin(seconds * 15) > 0 ? 2.4 : .12;
  } else if (motion === "chug") {
    rig.root.position.x += -2.45 * (1 - easeOut(p * 1.2));
    rig.root.position.y += Math.abs(wave) * .07;
    wheels.forEach((wheel) => { wheel.rotation.z += seconds * 7; });
    (rig.parts.smoke ?? []).forEach((puff, index) => {
      const local = (seconds * .55 + index / 6) % 1;
      puff.visible = true;
      puff.position.set(.7 - local * .55, 1.65 + local * 1.15, 0);
      puff.scale.setScalar(.35 + local * .9);
      const puffMesh = puff as THREE.Mesh;
      if (puffMesh.material instanceof THREE.MeshStandardMaterial) {
        puffMesh.material.transparent = true;
        puffMesh.material.opacity = 1 - local;
      }
    });
  } else if (motion === "dig") {
    const arm = rig.parts.arm?.[0];
    const forearm = rig.parts.forearm?.[0];
    if (arm) arm.rotation.z += Math.sin(seconds * 3) * .5;
    if (forearm) forearm.rotation.z += Math.sin(seconds * 3 + 1) * .65;
    rig.root.position.y += Math.abs(wave) * .04;
  } else if (motion === "hover") {
    rig.root.position.y += .45 + Math.sin(seconds * 5) * .18;
    rig.root.position.x += Math.sin(seconds * 2) * .22;
    if (rotor) rotor.rotation.y += seconds * 22;
    if (tailRotor) tailRotor.rotation.z += seconds * 18;
  } else if (motion === "sail") {
    rig.root.position.y += Math.sin(seconds * 3) * .12;
    rig.root.rotation.z += Math.sin(seconds * 2.5) * .08;
    (rig.parts.waves ?? []).forEach((item, index) => { item.position.x += Math.sin(seconds * 3 + index) * .18; });
  } else if (motion === "roll") {
    rig.root.position.x += -2.3 * (1 - easeOut(p * 1.35));
    rig.root.rotation.z += (1 - p) * -Math.PI * 4;
    rig.root.position.y += Math.abs(Math.sin(seconds * 7)) * .1;
  } else if (motion === "peel") {
    const peelP = THREE.MathUtils.clamp((p - .12) / .62, 0, 1);
    const outerMaterial = rig.materials.outer?.[0];
    const coreMaterial = rig.materials.core?.[0];
    if (outerMaterial) outerMaterial.opacity = 1 - peelP;
    if (coreMaterial) coreMaterial.opacity = peelP;
    (rig.parts.peels ?? []).forEach((peel, index) => {
      peel.visible = peelP > .02;
      peel.rotation.z += (index - 1) * peelP * .75;
      peel.rotation.x += peelP * (.35 + index * .16);
      peel.position.y -= peelP * .2;
    });
    rig.root.rotation.z += Math.sin(seconds * 2.5) * .06;
  } else if (motion === "split") {
    const reveal = p > .28;
    (rig.parts.whole ?? []).forEach((whole) => { whole.visible = !reveal; });
    (rig.parts.halves ?? []).forEach((half, index) => {
      half.visible = reveal;
      const spread = easeOut((p - .28) / .72);
      half.position.x += (index ? 1 : -1) * spread * .65;
      half.rotation.y += (index ? -1 : 1) * spread * .34;
    });
  } else if (motion === "jiggle") {
    rig.root.rotation.z += Math.sin(seconds * 12) * .16 * (1 - p * .35);
    (rig.parts.fruits ?? []).forEach((fruit, index) => { fruit.position.y += Math.sin(seconds * 9 + index) * .055; });
  } else if (motion === "sway") {
    rig.root.rotation.z += Math.sin(seconds * 4.5) * .18;
    rig.root.position.y += Math.abs(Math.sin(seconds * 4.5)) * .08;
  } else if (motion === "pop") {
    const pop = easeOut(Math.min(p * 2.2, 1));
    rig.root.scale.multiplyScalar(.15 + pop * .85 + Math.sin(p * Math.PI) * .22);
    rig.root.rotation.y += (1 - pop) * -1.2;
  }
}

function createModel(category: ModelCategory, name: string) {
  if (category === "animals") return createAnimal(name);
  if (category === "vehicles") return createVehicle(name);
  return createFruit(name);
}

function disposeRig(rig: Rig) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  rig.root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      geometries.add(node.geometry);
      const nodeMaterials = Array.isArray(node.material) ? node.material : [node.material];
      nodeMaterials.forEach((nodeMaterial) => materials.add(nodeMaterial));
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((nodeMaterial) => nodeMaterial.dispose());
}

export default function ThreeLearningModel({ category, name, fallbackEmoji, motion, isActive, motionCycle }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(isActive);
  const motionStart = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = isActive;
    if (isActive) motionStart.current = performance.now();
  }, [isActive, motionCycle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setReady(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(0, 1.35, 5.2);
    camera.lookAt(0, .95, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "three-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight(0xfff7dc, 0x8cb68f, 2.3);
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3.5, 6, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -1;
    const fill = new THREE.PointLight(0xffd38c, 1.8, 9);
    fill.position.set(-3, 2.5, 3);
    scene.add(hemisphere, keyLight, fill);

    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .22, roughness: 1 });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(2.25, 40), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = .04;
    floor.receiveShadow = true;
    scene.add(floor);

    const rig = createModel(category, name);
    const modelBox = new THREE.Box3().setFromObject(rig.root);
    const modelSize = modelBox.getSize(new THREE.Vector3());
    const modelCenter = modelBox.getCenter(new THREE.Vector3());
    const largest = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const fitScale = 2.5 / Math.max(largest, 1);
    rig.root.scale.multiplyScalar(fitScale);
    rig.root.position.x -= modelCenter.x * fitScale;
    rig.root.position.y -= modelBox.min.y * fitScale - .06;
    rig.root.rotation.y = -.12;
    finalizeRig(rig);
    scene.add(rig.root);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    setReady(true);

    let frame = 0;
    const renderFrame = (now: number) => {
      animateRig(rig, motion, now, motionStart.current, activeRef.current, reducedMotion);
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(renderFrame);
    };
    frame = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.dispose();
      floor.geometry.dispose();
      floorMaterial.dispose();
      disposeRig(rig);
      renderer.domElement.remove();
    };
  }, [category, motion, name]);

  return (
    <span ref={containerRef} className={ready ? "three-model is-ready" : "three-model"} role="img" aria-label={`${name}的立体动画模型`}>
      <span className="model-fallback" aria-hidden="true">{fallbackEmoji}</span>
      <span className="model-3d-badge" aria-hidden="true">3D</span>
    </span>
  );
}
