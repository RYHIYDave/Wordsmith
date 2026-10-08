// The little linear algebra the 3D painter needs: 3-vectors and 4x4 matrices (column-major, as
// WebGL takes them). The world's axes are the game's: x and y lie on the floor, in tiles, and z
// is up.

export type V3 = readonly [number, number, number];
/** Sixteen numbers, column by column. */
export type M4 = Float32Array;

export const v3 = (x: number, y: number, z: number): V3 => [x, y, z];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function ident(): M4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** a * b: b is applied first. */
export function mmul(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

/** Several in a row: mats(a, b, c) = a * b * c (c is applied first). */
export function mats(...ms: M4[]): M4 {
  let o = ms[0];
  for (let i = 1; i < ms.length; i++) o = mmul(o, ms[i]);
  return o;
}

export function translate(x: number, y: number, z: number): M4 {
  const m = ident();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

export function scale(x: number, y = x, z = x): M4 {
  const m = ident();
  m[0] = x;
  m[5] = y;
  m[10] = z;
  return m;
}

/** A turn about the x axis, in degrees. */
export function rotX(deg: number): M4 {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = ident();
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

export function rotY(deg: number): M4 {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = ident();
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

/** A turn about the upright axis (z), in degrees: counter-clockwise seen from above. */
export function rotZ(deg: number): M4 {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = ident();
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  return m;
}

export function apply(m: M4, p: V3): V3 {
  return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
}

/** The camera's matrix: from `eye`, looking at `at`, with `up` upward on the screen. */
export function lookAt(eye: V3, at: V3, up: V3): M4 {
  const f = norm(sub(at, eye));
  const r = norm(cross(f, up));
  const u = cross(r, f);
  const m = ident();
  m[0] = r[0];
  m[4] = r[1];
  m[8] = r[2];
  m[1] = u[0];
  m[5] = u[1];
  m[9] = u[2];
  m[2] = -f[0];
  m[6] = -f[1];
  m[10] = -f[2];
  m[12] = -dot(r, eye);
  m[13] = -dot(u, eye);
  m[14] = dot(f, eye);
  return m;
}

/** A box of space seen without perspective: `hw` and `hh` to either side of the middle, from `near` to `far` ahead. */
export function ortho(hw: number, hh: number, near: number, far: number): M4 {
  const m = ident();
  m[0] = 1 / hw;
  m[5] = 1 / hh;
  m[10] = -2 / (far - near);
  m[14] = -(far + near) / (far - near);
  return m;
}

/** With perspective: `fovy` degrees from top to bottom, `aspect` = width over height. */
export function perspective(fovy: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan((fovy * Math.PI) / 360);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}
