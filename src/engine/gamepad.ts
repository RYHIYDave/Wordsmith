// A GAME CONTROLLER (not in the game: behind GAMEPAD, off, until the owner has seen the layout and
// said yes). The owner, 9 Oct 2026, 00:22: "K add the art, then work on our skill trees, then I’d
// like controller support.  Dual stick aiming."
//
// The browser's own Gamepad API, which knows the common pads (Xbox, PlayStation and others) by one
// "standard" layout. The layout as proposed to him in a picture:
//   LEFT STICK    move (at one speed, as the touch stick: past the still middle, full speed)
//   RIGHT STICK   aim: the attacks go where it points; let go, and the game aims as on a phone
//   RT            the quick attack (TAP); held, it goes on attacking
//   LT            the slow attack (HOLD); held, Whirlwind and Beam go on
//   A             the evasive move (SWIPE), the way the hero is moving
//   B             use (search, talk, pick up)       X  a flask       Y  the inventory
//   START         pause                             BACK  the map
//   D-PAD UP      the prompt over the attacks: LEVEL UP, or NEW TALENT
//   in menus      the left stick moves a pointer, A presses, B goes back
// While a pad is played with, the prompts and the inventory's ATTACKS page name its buttons
// (`PAD_USE`).
// This file only reads the pad: what a stick or a button means is main.ts's (`padFrame`,
// `padControls`).

/** THE SWITCH: off, no pad is read (the game as it was). */
export const GAMEPAD = { on: false };

/** A pad is being played with now (the switch on, and the pad moved or pressed lately): set by main.ts each frame, so that the prompts and the ATTACKS page can name its buttons. */
export const PAD_USE = { live: false };

/** The standard layout's buttons, by what they are called on an Xbox pad (on a PlayStation pad: A is the cross, B the circle, X the square, Y the triangle). */
export const BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 } as const;

/** A stick's still middle: within it, the stick counts as at rest. */
export const DEAD = 0.24;
/** How far a trigger must go down to count as pressed. */
export const TRIGGER = 0.35;
/** How fast the menus' pointer goes at full tilt, in game pixels a second. */
export const POINTER_SPEED = 230;

/** What the browser hands back for one pad (the parts of the Gamepad API that are read). */
export interface PadLike {
  connected: boolean;
  mapping?: string;
  axes: readonly number[];
  buttons: readonly { pressed: boolean; value: number }[];
}

/** A stick's reading with its still middle taken out: 0 inside it, rising to 1 at the rim, in the stick's own direction. */
export function deadZone(x: number, y: number, dead = DEAD): { x: number; y: number; m: number } {
  const m = Math.hypot(x, y);
  if (m <= dead) return { x: 0, y: 0, m: 0 };
  const k = Math.min(1, (m - dead) / (1 - dead));
  return { x: (x / m) * k, y: (y / m) * k, m: k };
}

/** The first pad the browser knows, read once a frame: its sticks, its buttons, and which went down this frame. */
export class Pad {
  connected = false;
  /** The sticks, with their still middles taken out. */
  left = { x: 0, y: 0, m: 0 };
  right = { x: 0, y: 0, m: 0 };
  private now: boolean[] = [];
  private was: boolean[] = [];
  /** Seconds since anything on the pad was last moved or pressed (large while it lies idle). */
  idle = 1e9;
  /** The menus' pointer, in game pixels. */
  px = 0;
  py = 0;

  /** Read the pad. `pads`: what navigator.getGamepads() gives (a playtest can hand in its own). */
  poll(pads: readonly (PadLike | null)[], dt: number): void {
    const p = pads.find((q): q is PadLike => !!q && q.connected) ?? null;
    this.was = this.now;
    this.connected = !!p;
    if (!p) {
      this.now = [];
      this.left = { x: 0, y: 0, m: 0 };
      this.right = { x: 0, y: 0, m: 0 };
      this.idle += dt;
      return;
    }
    this.now = p.buttons.map((b, i) => (i === BTN.LT || i === BTN.RT ? b.value > TRIGGER || b.pressed : b.pressed));
    this.left = deadZone(p.axes[0] ?? 0, p.axes[1] ?? 0);
    this.right = deadZone(p.axes[2] ?? 0, p.axes[3] ?? 0);
    const used = this.left.m > 0 || this.right.m > 0 || this.now.some((b) => b);
    this.idle = used ? 0 : this.idle + dt;
  }

  /** The button is down now. */
  down(b: number): boolean {
    return !!this.now[b];
  }

  /** The button went down this frame. */
  pressed(b: number): boolean {
    return !!this.now[b] && !this.was[b];
  }

  /** The pad is being played with (moved or pressed within the last few seconds). */
  live(): boolean {
    return this.connected && this.idle < 8;
  }

  /** Move the menus' pointer by the left stick, kept inside a screen `w` x `h`. */
  steer(dt: number, w: number, h: number): void {
    this.px = Math.max(0, Math.min(w - 1, this.px + this.left.x * POINTER_SPEED * dt));
    this.py = Math.max(0, Math.min(h - 1, this.py + this.left.y * POINTER_SPEED * dt));
  }
}
