// Keyboard, mouse and touch, gathered into one state the game reads once per frame.
//
// Touch has no ability buttons. The left thumb is a movement stick that appears wherever it lands.
// The right thumb touches the world: TAP = the quick ability (the one with the shorter base
// cooldown), HOLD = the slow one, FLICK = evasive move in that direction.

export interface Press {
  x: number;
  y: number;
  /** 0 = left / touch, 2 = right. */
  button: number;
}

const STICK_RADIUS = 26; // game pixels for full tilt
const TAP_MOVE = 10; // a tap may wander this far
const FLICK_MOVE = 18; // a flick must travel at least this far...
const FLICK_MS = 300; // ...within this time
export const HOLD_MS = 250; // a still finger counts as a hold after this long

export class Input {
  /** Keys currently down, by KeyboardEvent.code. */
  keys = new Set<string>();
  private fresh = new Set<string>();
  /** Pointer position in game pixels (the mouse, or the latest touch). */
  mx = 0;
  my = 0;
  /** Mouse buttons held on the game world (not on the interface). */
  lmb = false;
  rmb = false;
  /** Left / right button went down on the world this frame. */
  lpress: Press | null = null;
  rpress: Press | null = null;
  /** A press that landed on the interface this frame. */
  uiPress: Press | null = null;
  /** A press that began on the interface and is still down: where it is now (for dragging things about). */
  hold = { active: false, id: -1, x: 0, y: 0 };
  /** That press was let go this frame, here. */
  uiRelease: { x: number; y: number } | null = null;
  /** True once the player has touched the screen; false again when they use a mouse. */
  touchMode = false;
  stick = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0, t0: 0, moved: 0 };
  /** The right thumb while it is down. `held` turns true once it has stayed put long enough to be a hold. */
  aim = { active: false, id: -1, x: 0, y: 0, sx: 0, sy: 0, t0: 0, moved: 0, held: false };
  /** Where the game's aim help has locked on (game pixels), for the reticle. Set by the game each frame. */
  mark: { x: number; y: number } | null = null;
  /** A tap on the world this frame (the right thumb: it means "attack"). */
  tap: Press | null = null;
  /** A quick touch on the world this frame by EITHER thumb: for things that are used by touching them. */
  poke: Press | null = null;
  /** A flick on the world this frame, as a direction in game pixels. */
  flick: { dx: number; dy: number } | null = null;
  /** True after any press or key: browsers only allow sound after that. */
  gesture = false;
  /** Called inside every press, release and key event. Sound must be switched on from there: phones refuse it anywhere else. */
  onGesture: (() => void) | null = null;
  /** Called the first time a finger (not a mouse) touches the game. */
  onTouch: (() => void) | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    private toGame: (cx: number, cy: number) => { x: number; y: number },
    /** Does this game-pixel position belong to the interface? */
    private isUi: (x: number, y: number) => boolean,
    /** Width of the view in game pixels (the left part is the stick area). */
    private viewW: () => number,
  ) {
    canvas.addEventListener('pointerdown', (e) => this.down(e, canvas));
    canvas.addEventListener('pointermove', (e) => this.move(e));
    const up = (e: PointerEvent): void => this.up(e);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // Fingers on the game must never scroll, zoom or select the page around it.
    const stop = (e: Event): void => {
      if (e.cancelable) e.preventDefault();
    };
    for (const name of ['touchstart', 'touchmove', 'touchend', 'gesturestart', 'dblclick']) canvas.addEventListener(name, stop, { passive: false });
    window.addEventListener('keydown', (e) => {
      this.gesture = true;
      if (this.onGesture) this.onGesture();
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.fresh.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.lmb = false;
      this.rmb = false;
      this.stick.active = false;
      this.aim.active = false;
      this.hold.active = false;
    });
  }

  private down(e: PointerEvent, canvas: HTMLCanvasElement): void {
    e.preventDefault();
    this.gesture = true;
    if (this.onGesture) this.onGesture();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* not fatal */
    }
    canvas.focus();
    const p = this.toGame(e.clientX, e.clientY);
    this.mx = p.x;
    this.my = p.y;
    if (e.pointerType === 'mouse') {
      this.touchMode = false;
      if (this.isUi(p.x, p.y)) {
        this.uiPress = { x: p.x, y: p.y, button: e.button };
        if (e.button === 0) this.hold = { active: true, id: e.pointerId, x: p.x, y: p.y };
        return;
      }
      if (e.button === 0) {
        this.lmb = true;
        this.lpress = { x: p.x, y: p.y, button: 0 };
      }
      if (e.button === 2) {
        this.rmb = true;
        this.rpress = { x: p.x, y: p.y, button: 2 };
      }
      return;
    }
    if (!this.touchMode && this.onTouch) this.onTouch();
    this.touchMode = true;
    if (this.isUi(p.x, p.y)) {
      this.uiPress = { x: p.x, y: p.y, button: 0 };
      if (!this.hold.active) this.hold = { active: true, id: e.pointerId, x: p.x, y: p.y };
      return;
    }
    if (p.x < this.viewW() * 0.4 && !this.stick.active) {
      this.stick = { active: true, id: e.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0, t0: performance.now(), moved: 0 };
    } else if (!this.aim.active) {
      this.aim = { active: true, id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, t0: performance.now(), moved: 0, held: false };
    }
  }

  private move(e: PointerEvent): void {
    const p = this.toGame(e.clientX, e.clientY);
    if (this.hold.active && e.pointerId === this.hold.id) {
      this.hold.x = p.x;
      this.hold.y = p.y;
    }
    if (e.pointerType === 'mouse') {
      this.mx = p.x;
      this.my = p.y;
      return;
    }
    if (this.stick.active && e.pointerId === this.stick.id) {
      let dx = (p.x - this.stick.ox) / STICK_RADIUS;
      let dy = (p.y - this.stick.oy) / STICK_RADIUS;
      this.stick.moved = Math.max(this.stick.moved, Math.hypot(p.x - this.stick.ox, p.y - this.stick.oy));
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      this.stick.dx = dx;
      this.stick.dy = dy;
    } else if (this.aim.active && e.pointerId === this.aim.id) {
      this.aim.x = p.x;
      this.aim.y = p.y;
      this.mx = p.x;
      this.my = p.y;
      this.aim.moved = Math.max(this.aim.moved, Math.hypot(p.x - this.aim.sx, p.y - this.aim.sy));
    }
  }

  private up(e: PointerEvent): void {
    if (this.onGesture) this.onGesture();
    if (this.hold.active && e.pointerId === this.hold.id && (e.pointerType !== 'mouse' || e.button === 0)) {
      const p = this.toGame(e.clientX, e.clientY);
      this.uiRelease = { x: p.x, y: p.y };
      this.hold.active = false;
    }
    if (e.pointerType === 'mouse') {
      if (e.button === 0) this.lmb = false;
      if (e.button === 2) this.rmb = false;
      return;
    }
    if (this.stick.active && e.pointerId === this.stick.id) {
      const st = this.stick;
      // the stick thumb, put down and lifted again without steering, was a touch on the world
      if (st.moved < TAP_MOVE && performance.now() - st.t0 < FLICK_MS) this.poke = { x: st.ox, y: st.oy, button: 0 };
      st.active = false;
      st.dx = 0;
      st.dy = 0;
    } else if (this.aim.active && e.pointerId === this.aim.id) {
      const a = this.aim;
      const ms = performance.now() - a.t0;
      if (!a.held) {
        if (a.moved < TAP_MOVE && ms < FLICK_MS) {
          this.tap = { x: a.sx, y: a.sy, button: 0 };
          this.poke = this.tap;
        } else if (a.moved >= FLICK_MOVE && ms < FLICK_MS) this.flick = { dx: a.x - a.sx, dy: a.y - a.sy };
      }
      a.active = false;
      a.held = false;
    }
  }

  /** Call once per frame before reading: decides when a resting finger becomes a hold. */
  beginFrame(): void {
    const a = this.aim;
    if (a.active && !a.held) {
      const ms = performance.now() - a.t0;
      if ((ms > HOLD_MS && a.moved < FLICK_MOVE) || ms > FLICK_MS) a.held = true;
    }
  }

  /** How far the right thumb is toward counting as a hold, 0 to 1 (0 when it is not down). */
  holdProgress(): number {
    const a = this.aim;
    if (!a.active) return 0;
    return a.held ? 1 : Math.min(1, (performance.now() - a.t0) / HOLD_MS);
  }

  /** True on the frame a key went down. */
  pressed(code: string): boolean {
    return this.fresh.has(code);
  }

  /** Use up a key press so nothing later in the frame also acts on it. */
  eat(...codes: string[]): void {
    for (const c of codes) this.fresh.delete(c);
  }

  /** Call once per frame after everything has read the input. */
  endFrame(): void {
    this.fresh.clear();
    this.lpress = null;
    this.rpress = null;
    this.poke = null;
    this.uiPress = null;
    this.uiRelease = null;
    this.tap = null;
    this.flick = null;
  }
}
