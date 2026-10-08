// The game is laid out on a small screen of "game pixels" (about 480x270) that is scaled up by a
// whole number so every pixel stays square and crisp on any screen.
//
// The canvas itself holds RES x RES picture pixels for every game pixel, and its context is scaled
// to match. So all drawing code works in game pixels as it always has (the art of the first builds
// comes out exactly as before), while art painted at the finer grain (a Sprite with density 2)
// shows every one of its pixels.
//
// Phones: the game is laid out for a phone held sideways. If the page it runs in is locked upright
// (many apps are, and many people keep rotation lock on), the picture is drawn turned a quarter
// turn so that holding the phone sideways still works. The player can switch that off.

export type TurnMode = 'auto' | 'upright';

export interface Screen {
  canvas: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  /** Canvas size in game pixels. */
  w: number;
  h: number;
  /** Device pixels per game pixel. */
  scale: number;
  /** The device's main pointer is a finger. */
  touch: boolean;
  /** The page is taller than wide (before any turning). */
  upright: boolean;
  /** The picture is being drawn turned a quarter turn. */
  turned: boolean;
  turnMode: TurnMode;
  setTurnMode(mode: TurnMode): void;
  /** Tell the screen a finger was used, in case the browser did not say this is a touch device. */
  sawTouch(): void;
  /** Convert a browser mouse/touch position to game pixels. */
  toGame(clientX: number, clientY: number): { x: number; y: number };
  /** The reverse: where a game pixel sits in the browser window. */
  toClient(x: number, y: number): { x: number; y: number };
}

/** Picture pixels per game pixel, each way. */
export const RES = 2;

/** Roughly how tall the view should be, in game pixels. */
const TARGET_H = 270;
/** Never let the view get narrower or shorter than this if a smaller scale can avoid it. */
const MIN_W = 270;
const MIN_H = 200;
const TURN_KEY = 'arpg.turn';

let fingerSeen = false;

function isTouchDevice(): boolean {
  if (fingerSeen) return true;
  if (typeof matchMedia !== 'function') return false;
  if (matchMedia('(pointer: coarse)').matches) return true;
  return matchMedia('(any-pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
}

/**
 * `clear`: the canvas can be seen through where nothing is drawn on it. (The world in low-poly 3D
 * is drawn on a canvas of its own that lies under this one: gl/world.ts. A canvas that cannot be
 * seen through is a little quicker to put on the screen, so the pixel game keeps that.)
 */
export function createScreen(clear = false): Screen {
  // The stage is the part of the window the game may use: everything inside the phone's notch,
  // rounded corners and home bar.
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:fixed;overflow:hidden;touch-action:none;' +
    'left:env(safe-area-inset-left,0px);right:env(safe-area-inset-right,0px);' +
    'top:env(safe-area-inset-top,0px);bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(stage);
  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.style.cssText =
    'display:block;position:absolute;left:0;top:0;transform-origin:0 0;outline:none;touch-action:none;' +
    'image-rendering:pixelated;image-rendering:crisp-edges';
  stage.appendChild(canvas);
  const g = canvas.getContext('2d', { alpha: clear }) as CanvasRenderingContext2D;

  let saved: TurnMode = 'auto';
  try {
    if (localStorage.getItem(TURN_KEY) === 'upright') saved = 'upright';
  } catch {
    /* storage may be unavailable; the default is fine */
  }

  let cssW = 1;
  let cssH = 1;
  let cssPerPx = 1; // CSS pixels per game pixel
  const scr: Screen = {
    canvas,
    g,
    w: 480,
    h: 270,
    scale: 1,
    touch: isTouchDevice(),
    upright: false,
    turned: false,
    turnMode: saved,
    setTurnMode(mode: TurnMode) {
      scr.turnMode = mode;
      try {
        localStorage.setItem(TURN_KEY, mode);
      } catch {
        /* not fatal */
      }
      resize();
    },
    sawTouch() {
      if (fingerSeen) return;
      fingerSeen = true;
      resize();
    },
    toGame(cx: number, cy: number) {
      const r = stage.getBoundingClientRect();
      let x = cx - r.left;
      let y = cy - r.top;
      if (scr.turned) {
        const t = x;
        x = y;
        y = cssW - t;
      }
      return { x: x / cssPerPx, y: y / cssPerPx };
    },
    toClient(x: number, y: number) {
      const r = stage.getBoundingClientRect();
      const px = x * cssPerPx;
      const py = y * cssPerPx;
      return scr.turned ? { x: r.left + cssW - py, y: r.top + px } : { x: r.left + px, y: r.top + py };
    },
  };

  const resize = (): void => {
    const r = stage.getBoundingClientRect();
    cssW = Math.max(1, r.width || window.innerWidth);
    cssH = Math.max(1, r.height || window.innerHeight);
    const dpr = window.devicePixelRatio || 1;
    scr.touch = isTouchDevice();
    scr.upright = cssH > cssW * 1.15;
    scr.turned = scr.touch && scr.upright && scr.turnMode === 'auto';
    // the view as the player sees it, in device pixels
    const dw = Math.max(1, Math.floor((scr.turned ? cssH : cssW) * dpr));
    const dh = Math.max(1, Math.floor((scr.turned ? cssW : cssH) * dpr));
    // Phones get slightly bigger pixels than desktops: the screen is small and fingers are not.
    let s = Math.max(1, scr.touch ? Math.ceil(dh / TARGET_H - 0.15) : Math.round(dh / TARGET_H));
    while (s > 1 && (dw / s < MIN_W || dh / s < MIN_H)) s--;
    scr.scale = s;
    scr.w = Math.ceil(dw / s);
    scr.h = Math.ceil(dh / s);
    cssPerPx = s / dpr;
    canvas.width = scr.w * RES;
    canvas.height = scr.h * RES;
    canvas.style.width = `${scr.w * cssPerPx}px`;
    canvas.style.height = `${scr.h * cssPerPx}px`;
    canvas.style.transform = scr.turned ? `translate(${cssW}px,0) rotate(90deg)` : 'none';
    // (sizing a canvas resets its context: set the scale and the hard edges again every time)
    g.setTransform(RES, 0, 0, RES, 0, 0);
    g.imageSmoothingEnabled = false;
  };
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(stage);
  resize();
  return scr;
}
