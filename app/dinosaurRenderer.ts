import type { DinosaurRig, MouthRig } from "./dinosaurMotion";
import type { dinosaurPose } from "./dinosaurMotion";

export type ArtworkRig = Omit<DinosaurRig, "kind" | "facing"> & {
  tailPivot?: readonly [number, number];
  secondEye?: readonly [number, number, number, number];
  wing?: { region: readonly [number, number, number, number]; pivot: readonly [number, number] };
  accent?: { region: readonly [number, number, number, number]; pivot: readonly [number, number] };
};

const vertexSource = `
  attribute vec2 position;
  varying mediump vec2 uv;
  void main() {
    uv = position;
    gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  varying mediump vec2 uv;
  uniform sampler2D artwork;
  uniform vec4 head;
  uniform vec2 neck;
  uniform vec4 tail;
  uniform vec2 tailPivot;
  uniform vec4 feet;
  uniform vec4 farFeet;
  uniform vec4 gait;
  uniform float hasFarFeet;
  uniform vec4 eye;
  uniform vec4 secondEye;
  uniform float hasSecondEye;
  uniform vec4 wingRegion;
  uniform vec2 wingPivot;
  uniform float customWing;
  uniform vec4 accentRegion;
  uniform vec2 accentPivot;
  uniform float accentAngle;
  uniform vec4 mouth;
  uniform vec3 mouthShape;
  uniform vec4 pose;
  uniform vec4 expression;

  float weight(vec2 p, vec4 region) {
    vec2 d = (p - region.xy) / region.zw;
    return exp(-dot(d, d) * 2.0);
  }
  vec2 turn(vec2 p, vec2 pivot, float angle) {
    float c = cos(angle), s = sin(angle);
    return pivot + mat2(c, s, -s, c) * (p - pivot);
  }
  vec2 stepFoot(vec2 p, vec2 foot, vec2 offset, float width) {
    float side = (p.x - foot.x) / width;
    float planted = smoothstep(foot.y - 0.26, foot.y - 0.055, p.y);
    return p - offset * planted * exp(-side * side * 2.0);
  }
  vec4 sampleArtwork(vec2 p) {
    if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return vec4(0.0);
    return texture2D(artwork, p);
  }
  vec4 openJaw(vec2 p) {
    // Keep the upper lip and teeth in place, move the chin below the lip,
    // and shade the revealed gap. The mouth follows the head's own coordinates.
    float along = (p.x - mouth.x) / (mouth.z - mouth.x);
    if (expression.w < 0.001 || along < -0.08 || along > 1.06) return sampleArtwork(p);
    float u = clamp(along, 0.0, 1.0);
    float lip = mix(mouth.y, mouth.w, u) + mouthShape.x * sin(u * 3.141593);
    float edge = smoothstep(-0.08, 0.035, along) * (1.0 - smoothstep(0.87, 1.06, along));
    float gap = expression.w * mouthShape.z * (1.0 - u) * edge;
    float below = p.y - lip;
    if (below <= 0.0 || gap < 0.0001) return sampleArtwork(p);
    if (below < gap) {
      vec4 rim = sampleArtwork(vec2(p.x, lip));
      vec3 shade = mix(vec3(0.16, 0.035, 0.045), vec3(0.38, 0.10, 0.13), below / gap);
      vec4 inside = vec4(shade * rim.a, rim.a);
      return mix(rim, inside, smoothstep(0.0, 0.003, below));
    }
    float chin = 1.0 - smoothstep(mouthShape.y + gap * 0.3, mouthShape.y + gap, below);
    return sampleArtwork(p - vec2(0.0, gap * chin));
  }
  void main() {
    // Leave room around the original artwork for tails, crests and wing tips.
    vec2 p = (uv - 0.5) / 0.92 + 0.5;
    p.y -= (p.y - 0.85) * pose.w * weight(p, vec4(0.5, 0.58, 0.4, 0.38));
    p = mix(p, turn(p, neck, -pose.x) + vec2(0.0, expression.z), weight(p, head));
    p = mix(p, turn(p, tailPivot, -pose.y), weight(p, tail));
    if (hasFarFeet > 0.5) {
      p = stepFoot(p, farFeet.xy, gait.zw, 0.065);
      p = stepFoot(p, farFeet.zw, gait.xy, 0.065);
    }
    p = stepFoot(p, feet.xy, gait.xy, 0.1);
    p = stepFoot(p, feet.zw, gait.zw, 0.1);
    if (customWing > 0.5) {
      p = mix(p, turn(p, wingPivot, expression.y), weight(p, wingRegion));
    } else {
      p = mix(p, turn(p, vec2(0.49, 0.55), expression.y), weight(p, vec4(0.79, 0.4, 0.32, 0.37)));
      p = mix(p, turn(p, vec2(0.4, 0.6), -expression.y), weight(p, vec4(0.17, 0.72, 0.27, 0.25)));
    }
    p = mix(p, turn(p, accentPivot, accentAngle), weight(p, accentRegion));
    float blinkWeight = weight(p, eye);
    p.y = eye.y + (p.y - eye.y) / (1.0 - expression.x * blinkWeight * 0.88);
    if (hasSecondEye > 0.5) {
      p.y = secondEye.y + (p.y - secondEye.y) / (1.0 - expression.x * weight(p, secondEye) * 0.88);
    }
    gl_FragColor = openJaw(p);
  }
`;

// One textured quad per frame; no new image assets or animation dependency.
export function createDinosaurRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, rig: ArtworkRig, mouthRig?: MouthRig) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power", premultipliedAlpha: true });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const destroy = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
  };

  try {
    if (!program || !buffer || !texture) throw new Error("Animation resources unavailable");
    for (const [kind, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(kind);
      if (!shader) throw new Error("Animation shader unavailable");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Animation shader unsupported");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Animation program unsupported");
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, "artwork"), 0);
    gl.uniform4fv(gl.getUniformLocation(program, "head"), rig.head);
    gl.uniform2fv(gl.getUniformLocation(program, "neck"), rig.neck);
    gl.uniform4fv(gl.getUniformLocation(program, "tail"), rig.tail);
    gl.uniform2fv(gl.getUniformLocation(program, "tailPivot"), rig.tailPivot ?? [rig.tail[0] - .21, rig.tail[1]]);
    gl.uniform4fv(gl.getUniformLocation(program, "feet"), rig.feet);
    gl.uniform4fv(gl.getUniformLocation(program, "farFeet"), rig.farFeet ?? rig.feet);
    gl.uniform1f(gl.getUniformLocation(program, "hasFarFeet"), rig.farFeet ? 1 : 0);
    gl.uniform4fv(gl.getUniformLocation(program, "eye"), rig.eye);
    gl.uniform4fv(gl.getUniformLocation(program, "secondEye"), rig.secondEye ?? rig.eye);
    gl.uniform1f(gl.getUniformLocation(program, "hasSecondEye"), rig.secondEye ? 1 : 0);
    gl.uniform4fv(gl.getUniformLocation(program, "wingRegion"), rig.wing?.region ?? [0, 0, 1, 1]);
    gl.uniform2fv(gl.getUniformLocation(program, "wingPivot"), rig.wing?.pivot ?? [0, 0]);
    gl.uniform1f(gl.getUniformLocation(program, "customWing"), rig.wing ? 1 : 0);
    gl.uniform4fv(gl.getUniformLocation(program, "accentRegion"), rig.accent?.region ?? [0, 0, 1, 1]);
    gl.uniform2fv(gl.getUniformLocation(program, "accentPivot"), rig.accent?.pivot ?? [0, 0]);
    gl.uniform4fv(gl.getUniformLocation(program, "mouth"), mouthRig?.line ?? [0, 0, 1, 0]);
    gl.uniform3f(gl.getUniformLocation(program, "mouthShape"), mouthRig?.curve ?? 0, mouthRig?.depth ?? .1, mouthRig?.opening ?? 0);
    const poseUniform = gl.getUniformLocation(program, "pose");
    const gaitUniform = gl.getUniformLocation(program, "gait");
    const expressionUniform = gl.getUniformLocation(program, "expression");
    const accentUniform = gl.getUniformLocation(program, "accentAngle");
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Animation texture unsupported");

    return {
      draw(pose: ReturnType<typeof dinosaurPose> & { accent?: number }) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform4f(poseUniform, pose.head, pose.tail, pose.feet, pose.breath);
        gl.uniform4f(gaitUniform, pose.feet, pose.footAY, pose.footBX, pose.footBY);
        gl.uniform4f(expressionUniform, pose.blink, pose.wings, pose.headLift, pose.mouth);
        gl.uniform1f(accentUniform, pose.accent ?? 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      destroy,
    };
  } catch {
    destroy();
    return null;
  }
}
