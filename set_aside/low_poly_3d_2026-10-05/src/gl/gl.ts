// The 3D painter: WebGL2, written for this game, with nothing fetched from anywhere.
//
// The owner, 5 Oct 2026: "I think when I said 2D I really meant low-poly 3D for the look"; "I
// like the sort of cartoonish look, but I think I want the 3D." So: flat-coloured triangles, each
// lit by its own face (no smoothing: the facets are the look), light that comes in a few flat
// steps as a cartoon's does, and real shadows.
//
// What lights a place:
//   - the air: a little light from above and less from below, so that nothing is ever black;
//   - one far light (the "moon": it gives every room a lit side and a shaded one), with shadows;
//   - one fire that throws shadows (the nearest brazier, or the light the hero carries);
//   - any number of small lights without shadows (the other fires, a glowing blade, a gate).
// A triangle can also shine by itself (`glow`): a flame, an eye, a rune.
//
// A Painter keeps its shapes: a mesh is handed over once (`keep`) and after that is a Part, a run
// of triangles that can be drawn anywhere, any number of times a frame, each time moved by a
// matrix. A room is one part drawn where it was built; a figure is a dozen parts, each moved by
// its joint.

import { STRIDE } from './mesh';
import type { Mesh, RGB } from './mesh';
import { cross, ident, lookAt, mmul, norm, ortho, perspective, sub } from './vec';
import type { M4, V3 } from './vec';

export interface Camera {
  /** The point looked at, and where the camera is. */
  at: V3;
  eye: V3;
  /** Without perspective: half the height of what is seen, in tiles. With: the angle from top to bottom, in degrees. */
  half?: number;
  fov?: number;
}

export interface PointLight {
  at: V3;
  color: RGB;
  /** How many tiles its light carries. */
  reach: number;
}

/** What lights a scene, and how it is looked at. */
export interface Look {
  cam: Camera;
  /** The air: light from above, and from below. */
  sky: RGB;
  ground: RGB;
  /** The far light: the direction it shines FROM, and its colour. */
  moonFrom: V3;
  moon: RGB;
  /**
   * The fire that throws shadows: where it is, what it looks toward (its shadows are right within
   * about a quarter turn of that; `spread`, in degrees, says how wide: 118 if not given), and how
   * much of its shadows is drawn (`shade`, 0..1: 1 if not given. Two fires hand the shadows over
   * to one another by letting them fade out and in again, so that nothing jumps).
   */
  fire?: PointLight & { toward: V3; spread?: number; shade?: number };
  lights: PointLight[];
  /** The middle and half size of everything that must be able to throw a shadow from the far light. */
  bounds: { at: V3; half: number };
  /** How dark the corners of the picture are drawn (0 = not at all). */
  vignette?: number;
  /** The colour things fade to with distance from `at`, from `near` tiles to `far` (all the way, or as far as `most`: 0..1). */
  mist?: { color: RGB; at: V3; near: number; far: number; most?: number };
  /**
   * Only what has been seen is drawn: a picture of the place from above, one number for each
   * tile (`Painter.seen` takes it), in the GAME's axes: its column is the painter's Y and its
   * row the painter's X. What has never been seen is not drawn at all, and at the edge of what
   * has, the picture falls away into the dark.
   */
  seen?: { w: number; h: number };
}

/** A still: everything in one mesh. */
export interface Scene extends Look {
  mesh: Mesh;
}

/** A run of triangles the painter has kept. */
export interface Part {
  first: number;
  count: number;
  /** Kept by itself (`Painter.own`), not with the rest: it can be given up again (`Painter.drop`). */
  own?: { vao: WebGLVertexArrayObject; buf: WebGLBuffer };
}

/** One part, drawn once: where its own origin and axes are put. */
export interface Draw {
  part: Part;
  m: M4;
  /** A colour laid over it, and how strongly (0..1): white for the instant it is struck, pale blue for ice. */
  tint?: readonly [number, number, number, number];
  /** It throws no shadow (a flame, a thing of light). */
  bright?: boolean;
}

const MAX_LIGHTS = 16;

const f32 = (a: readonly number[]): Float32Array => new Float32Array(a);

const VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aCol;
layout(location=2) in float aGlow;
uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat4 uMoonMat;
uniform mat4 uFireMat;
out vec3 vWorld;
out vec3 vCol;
out float vGlow;
out vec4 vMoon;
out vec4 vFire;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vWorld = w.xyz;
  vCol = aCol;
  vGlow = aGlow;
  vMoon = uMoonMat * w;
  vFire = uFireMat * w;
  gl_Position = uViewProj * w;
}`;

const FS = `#version 300 es
precision highp float;
precision highp sampler2DShadow;
in vec3 vWorld;
in vec3 vCol;
in float vGlow;
in vec4 vMoon;
in vec4 vFire;
uniform vec3 uCamPos;
uniform vec3 uCamDir;
uniform float uOrtho;
uniform vec3 uSky;
uniform vec3 uGround;
uniform vec3 uMoonDir;
uniform vec3 uMoonCol;
uniform sampler2DShadow uMoonMap;
uniform float uMoonTexel;
uniform float uFireOn;
uniform vec3 uFirePos;
uniform vec3 uFireCol;
uniform float uFireReach;
uniform float uFireShade;
uniform sampler2DShadow uFireMap;
uniform float uFireTexel;
uniform int uCount;
uniform vec4 uLightPos[${MAX_LIGHTS}];
uniform vec3 uLightCol[${MAX_LIGHTS}];
uniform vec2 uView;
uniform float uVignette;
uniform vec3 uMistCol;
uniform vec3 uMistAt;
uniform vec3 uMistRange;
uniform vec4 uTint;
uniform sampler2D uSeen;
uniform vec3 uSeenSize;
out vec4 outColor;

// Light in flat steps, as a cartoon has it: dark, half, full. (The edges of the steps are a
// little soft, so that a facet turning through one does not flicker.)
float steps(float d) {
  return smoothstep(0.02, 0.10, d) * 0.5 + smoothstep(0.42, 0.52, d) * 0.5;
}

float shadowOf(sampler2DShadow map, vec4 s, float spread) {
  vec3 p = s.xyz / s.w * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0 || s.w <= 0.0) return 1.0;
  float sum = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) sum += texture(map, vec3(p.xy + vec2(float(x), float(y)) * spread, p.z));
  return sum / 9.0;
}

void main() {
  // what has never been seen is not there; at the edge of what has, it falls away into the dark
  float known = 1.0;
  if (uSeenSize.z > 0.5) {
    known = smoothstep(0.0, 0.5, texture(uSeen, vWorld.yx / uSeenSize.xy).r);
    if (known < 0.004) discard;
  }
  vec3 toCam = uOrtho > 0.5 ? -uCamDir : normalize(uCamPos - vWorld);
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(n, toCam) < 0.0) n = -n;

  vec3 light = mix(uGround, uSky, n.z * 0.5 + 0.5);
  float moonLit = shadowOf(uMoonMap, vMoon, uMoonTexel);
  light += uMoonCol * steps(max(dot(n, uMoonDir), 0.0)) * moonLit;

  if (uFireOn > 0.5) {
    vec3 L = uFirePos - vWorld;
    float d = length(L);
    float att = clamp(1.0 - d / uFireReach, 0.0, 1.0);
    att *= att;
    float lit = mix(1.0, shadowOf(uFireMap, vFire, uFireTexel * 1.5), uFireShade);
    light += uFireCol * steps(max(dot(n, L / d), 0.0)) * att * lit;
  }
  for (int i = 0; i < uCount; i++) {
    vec3 L = uLightPos[i].xyz - vWorld;
    float d = length(L);
    float att = clamp(1.0 - d / uLightPos[i].w, 0.0, 1.0);
    att *= att;
    light += uLightCol[i] * steps(max(dot(n, L / d), 0.0)) * att;
  }

  vec3 c = vCol * light + vCol * vGlow;
  // distance takes the colour out of things
  float far = clamp((length(vWorld.xy - uMistAt.xy) - uMistRange.x) / max(0.001, uMistRange.y - uMistRange.x), 0.0, 1.0);
  c = mix(c, uMistCol, far * far * uMistRange.z * (1.0 - min(1.0, vGlow)));
  c = mix(c, uTint.rgb, uTint.a) * known;
  // the corners of the picture fall away into the dark
  vec2 uv = gl_FragCoord.xy / uView - 0.5;
  c *= 1.0 - uVignette * smoothstep(0.35, 0.95, length(uv * vec2(1.0, 0.9)) * 1.5);
  // bright things roll off instead of clipping, then to the screen's own curve
  c = c / (1.0 + c * 0.35);
  outColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
}`;

const SHADOW_VS = `#version 300 es
layout(location=0) in vec3 aPos;
uniform mat4 uModel;
uniform mat4 uMat;
void main() { gl_Position = uMat * (uModel * vec4(aPos, 1.0)); }`;
const SHADOW_FS = `#version 300 es
precision highp float;
void main() {}`;

function program(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const make = (type: number, src: string): WebGLShader => {
    const s = gl.createShader(type) as WebGLShader;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const p = gl.createProgram() as WebGLProgram;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`program: ${gl.getProgramInfoLog(p)}`);
  return p;
}

interface DepthTarget {
  fb: WebGLFramebuffer;
  tex: WebGLTexture;
  size: number;
}

function depthTarget(gl: WebGL2RenderingContext, size: number): DepthTarget {
  const tex = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, size, size);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  const fb = gl.createFramebuffer() as WebGLFramebuffer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, tex, 0);
  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fb, tex, size };
}

export class Painter {
  readonly gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private shadowProg: WebGLProgram;
  private uni = new Map<string, WebGLUniformLocation | null>();
  private vao: WebGLVertexArrayObject;
  private buf: WebGLBuffer;
  /** Everything kept with the rest, and how much of it has been sent to the card. */
  private kept: number[] = [];
  private sent = 0;
  private moonMap: DepthTarget;
  private fireMap: DepthTarget;
  /** The picture of what has been seen (see Look.seen), once one has been handed over. */
  private seenTex: WebGLTexture | null = null;
  private seenSize = { w: 0, h: 0 };
  /** The camera's matrix of the last frame painted: for laying flat things (names, bars) over the picture. */
  viewProj: M4 = ident();
  /** Triangles drawn in the last frame (the picture's own pass). */
  drawn = 0;

  /** `still`: the picture is kept after it is painted, so that it can be read back (a moving picture does not want that: it costs a copy every frame). */
  constructor(readonly canvas: HTMLCanvasElement, moonSize = 2048, fireSize = 1024, still = false) {
    const gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: still, alpha: false, powerPreference: 'high-performance' }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error('this browser has no WebGL2');
    this.gl = gl;
    this.prog = program(gl, VS, FS);
    this.shadowProg = program(gl, SHADOW_VS, SHADOW_FS);
    this.buf = gl.createBuffer() as WebGLBuffer;
    this.vao = this.layout(this.buf);
    this.moonMap = depthTarget(gl, moonSize);
    this.fireMap = depthTarget(gl, fireSize);
  }

  /** How a buffer of vertices is read: where, what colour, how much it shines by itself. */
  private layout(buf: WebGLBuffer): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray() as WebGLVertexArrayObject;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, STRIDE * 4, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, STRIDE * 4, 24);
    gl.bindVertexArray(null);
    return vao;
  }

  /** Other sizes for the two shadow pictures (smaller is quicker and coarser). */
  shadows(moonSize: number, fireSize: number): void {
    const gl = this.gl;
    if (this.moonMap.size === moonSize && this.fireMap.size === fireSize) return;
    for (const t of [this.moonMap, this.fireMap]) {
      gl.deleteFramebuffer(t.fb);
      gl.deleteTexture(t.tex);
    }
    this.moonMap = depthTarget(gl, moonSize);
    this.fireMap = depthTarget(gl, fireSize);
  }

  /**
   * Take a mesh in: from now on it is a part, to be drawn wherever a matrix puts it. Parts taken
   * in this way are kept together and for good (a figure's solids, a brazier, a flame).
   */
  keep(mesh: Mesh): Part {
    const first = this.kept.length / STRIDE;
    for (let i = 0; i < mesh.data.length; i++) this.kept.push(mesh.data[i]);
    return { first, count: mesh.data.length / STRIDE };
  }

  /**
   * Take a mesh in by itself: a piece of a place, which is wanted only while the hero is in that
   * place and is given up afterwards (`drop`). Sent to the card at once.
   */
  own(mesh: Mesh): Part {
    const gl = this.gl;
    const buf = gl.createBuffer() as WebGLBuffer;
    const vao = this.layout(buf);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.data), gl.STATIC_DRAW);
    return { first: 0, count: mesh.data.length / STRIDE, own: { vao, buf } };
  }

  drop(part: Part): void {
    if (!part.own) return;
    this.gl.deleteVertexArray(part.own.vao);
    this.gl.deleteBuffer(part.own.buf);
    part.own = undefined;
    part.count = 0;
  }

  /**
   * What has been seen of the place (see Look.seen): `data` holds a number for each tile, row by
   * row, 0 for what has not been seen and anything else for what has.
   */
  seen(w: number, h: number, data: Uint8Array): void {
    const gl = this.gl;
    if (!this.seenTex || this.seenSize.w !== w || this.seenSize.h !== h) {
      if (this.seenTex) gl.deleteTexture(this.seenTex);
      this.seenTex = gl.createTexture() as WebGLTexture;
      this.seenSize = { w, h };
      gl.bindTexture(gl.TEXTURE_2D, this.seenTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.seenTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, data);
  }

  private u(name: string): WebGLUniformLocation | null {
    let l = this.uni.get(name);
    if (l === undefined) {
      l = this.gl.getUniformLocation(this.prog, name);
      this.uni.set(name, l);
    }
    return l;
  }

  paint(look: Look, draws: readonly Draw[]): void {
    const gl = this.gl;
    const W = this.canvas.width;
    const H = this.canvas.height;
    if (this.sent !== this.kept.length) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.kept), gl.STATIC_DRAW);
      this.sent = this.kept.length;
    }

    // ---- the camera
    const cam = look.cam;
    const view = lookAt(cam.eye, cam.at, [0, 0, 1]);
    const dist = Math.hypot(cam.eye[0] - cam.at[0], cam.eye[1] - cam.at[1], cam.eye[2] - cam.at[2]);
    const proj = cam.fov ? perspective(cam.fov, W / H, 0.5, dist * 4) : ortho(((cam.half ?? 6) * W) / H, cam.half ?? 6, 0.1, dist * 3);
    const viewProj = mmul(proj, view);
    this.viewProj = viewProj;
    const camDir = norm(sub(cam.at, cam.eye));

    // ---- the shadows: the scene's depth as each shadow-throwing light sees it
    const moonDir = norm(look.moonFrom);
    const b = look.bounds;
    // (The far light's picture of the place is moved about in whole steps of its own grain. Moved
    // smoothly with the camera, every shadow's edge would crawl as the hero walks.)
    const texel = (b.half * 2) / this.moonMap.size;
    const mr = norm(cross(moonDir, [0, 0, 1]));
    const mu = cross(mr, moonDir);
    const snap = (axis: V3): number => {
      const d = b.at[0] * axis[0] + b.at[1] * axis[1] + b.at[2] * axis[2];
      return Math.round(d / texel) * texel - d;
    };
    const sr = snap(mr);
    const su = snap(mu);
    const mid: V3 = [b.at[0] + mr[0] * sr + mu[0] * su, b.at[1] + mr[1] * sr + mu[1] * su, b.at[2] + mr[2] * sr + mu[2] * su];
    const moonEye: V3 = [mid[0] + moonDir[0] * b.half * 2, mid[1] + moonDir[1] * b.half * 2, mid[2] + moonDir[2] * b.half * 2];
    const moonMat = mmul(ortho(b.half, b.half, 0.1, b.half * 4), lookAt(moonEye, mid, [0, 0, 1]));
    const fire = look.fire;
    let fireMat = moonMat;
    if (fire) {
      // (a fire that looks straight down has no "up" of its own: any will do)
      const fd = norm(sub(fire.toward, fire.at));
      fireMat = mmul(perspective(fire.spread ?? 118, 1, 0.12, fire.reach * 1.5), lookAt(fire.at, fire.toward, Math.abs(fd[2]) > 0.97 ? [0, 1, 0] : [0, 0, 1]));
    }
    gl.useProgram(this.shadowProg);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    const sModel = gl.getUniformLocation(this.shadowProg, 'uModel');
    const sMat = gl.getUniformLocation(this.shadowProg, 'uMat');
    const passes: [DepthTarget, M4, number][] = [[this.moonMap, moonMat, 2.5]];
    if (fire && (fire.shade ?? 1) > 0.01) passes.push([this.fireMap, fireMat, 3.5]);
    let bound: WebGLVertexArrayObject | null = null;
    const use = (part: Part): void => {
      const vao = part.own ? part.own.vao : this.vao;
      if (vao !== bound) {
        gl.bindVertexArray(vao);
        bound = vao;
      }
    };
    for (const [target, mat, slope] of passes) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.size, target.size);
      gl.clearDepth(1);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.polygonOffset(slope, 4);
      gl.uniformMatrix4fv(sMat, false, mat);
      for (const d of draws) {
        if (d.bright || d.part.count === 0) continue;
        use(d.part);
        gl.uniformMatrix4fv(sModel, false, d.m);
        gl.drawArrays(gl.TRIANGLES, d.part.first, d.part.count);
      }
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // ---- the picture
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0.004, 0.003, 0.012, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.u('uViewProj'), false, viewProj);
    gl.uniformMatrix4fv(this.u('uMoonMat'), false, moonMat);
    gl.uniformMatrix4fv(this.u('uFireMat'), false, fireMat);
    gl.uniform3fv(this.u('uCamPos'), f32(cam.eye));
    gl.uniform3fv(this.u('uCamDir'), f32(camDir));
    gl.uniform1f(this.u('uOrtho'), cam.fov ? 0 : 1);
    gl.uniform3fv(this.u('uSky'), f32(look.sky));
    gl.uniform3fv(this.u('uGround'), f32(look.ground));
    gl.uniform3fv(this.u('uMoonDir'), f32(moonDir));
    gl.uniform3fv(this.u('uMoonCol'), f32(look.moon));
    gl.uniform1f(this.u('uMoonTexel'), 1 / this.moonMap.size);
    gl.uniform1f(this.u('uFireOn'), fire ? 1 : 0);
    gl.uniform1f(this.u('uFireTexel'), 1 / this.fireMap.size);
    if (fire) {
      gl.uniform3fv(this.u('uFirePos'), f32(fire.at));
      gl.uniform3fv(this.u('uFireCol'), f32(fire.color));
      gl.uniform1f(this.u('uFireReach'), fire.reach);
      gl.uniform1f(this.u('uFireShade'), fire.shade ?? 1);
    }
    const n = Math.min(MAX_LIGHTS, look.lights.length);
    const pos = new Float32Array(MAX_LIGHTS * 4);
    const col = new Float32Array(MAX_LIGHTS * 3);
    for (let i = 0; i < n; i++) {
      const l = look.lights[i];
      pos.set([l.at[0], l.at[1], l.at[2], l.reach], i * 4);
      col.set(l.color, i * 3);
    }
    gl.uniform1i(this.u('uCount'), n);
    gl.uniform4fv(this.u('uLightPos'), pos);
    gl.uniform3fv(this.u('uLightCol'), col);
    gl.uniform2f(this.u('uView'), W, H);
    gl.uniform1f(this.u('uVignette'), look.vignette ?? 0);
    const mist = look.mist ?? { color: [0, 0, 0] as RGB, at: cam.at, near: 1e6, far: 2e6 };
    gl.uniform3fv(this.u('uMistCol'), f32(mist.color));
    gl.uniform3fv(this.u('uMistAt'), f32(mist.at));
    gl.uniform3f(this.u('uMistRange'), mist.near, mist.far, mist.most ?? 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.moonMap.tex);
    gl.uniform1i(this.u('uMoonMap'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fireMap.tex);
    gl.uniform1i(this.u('uFireMap'), 1);
    const seen = look.seen && this.seenTex ? look.seen : null;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, seen ? this.seenTex : null);
    gl.uniform1i(this.u('uSeen'), 2);
    gl.uniform3f(this.u('uSeenSize'), seen ? seen.w : 1, seen ? seen.h : 1, seen ? 1 : 0);
    const uModel = this.u('uModel');
    const uTint = this.u('uTint');
    let tinted = true;
    let tris = 0;
    for (const d of draws) {
      if (d.part.count === 0) continue;
      use(d.part);
      if (d.tint) {
        gl.uniform4f(uTint, d.tint[0], d.tint[1], d.tint[2], d.tint[3]);
        tinted = true;
      } else if (tinted) {
        gl.uniform4f(uTint, 0, 0, 0, 0);
        tinted = false;
      }
      gl.uniformMatrix4fv(uModel, false, d.m);
      gl.drawArrays(gl.TRIANGLES, d.part.first, d.part.count);
      tris += d.part.count / 3;
    }
    gl.bindVertexArray(null);
    this.drawn = tris;
  }
}

/** Paint a still on a canvas: everything in one mesh, once. */
export function paint(canvas: HTMLCanvasElement, scene: Scene): Painter {
  const p = new Painter(canvas, 2048, 1024, true);
  const part = p.keep(scene.mesh);
  p.paint(scene, [{ part, m: ident() }]);
  p.gl.finish();
  return p;
}
