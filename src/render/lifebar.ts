// The hero's life as a bar over their head (Version 11.2).
//
// The owner, playing on a phone: "the health pool is hidden under my left thumb and is hard to see
// most of the time so I'll need a fix for that". The life globe has moved out from under the thumb
// (ui/hud.ts), and the life is also shown here, where the eyes already are in a fight.
//
// This file holds the rules (when the bar is there, what it shows) and no drawing, so that they can
// be tested without a screen; render.ts draws what it says.

export const LIFE_BAR = {
  /** The bar's inside, in game pixels. */
  w: 24,
  h: 3,
  /** How far its top edge stands above the top of the hero's head. */
  lift: 7,
  /** Seconds to come in, and to go. */
  show: 0.15,
  hide: 0.45,
  /** After life changes (a blow, a flask) the bar stays this long whatever else is so. */
  linger: 2.5,
  /** The part just lost stays lit this long, then runs down at `trailRate` (in bars per second). */
  trailWait: 0.3,
  trailRate: 1.4,
  /** Under this share of life the bar flashes. */
  low: 0.3,
  /** Flashes per second when low. */
  lowRate: 3,
};

export class LifeBar {
  /** 0 = not there, 1 = fully there. */
  alpha = 0;
  /** The share of life the bar shows (0 to 1). */
  shown = 1;
  /** The share it showed before the last blow: the part between is drawn lit, then runs down to `shown`. */
  trail = 1;
  /** Seconds since life last changed. */
  private since = 99;
  /** Seconds the trail still waits before it runs down. */
  private wait = 0;
  private started = false;

  /** A new character, or a new place: nothing is remembered. */
  reset(): void {
    this.alpha = 0;
    this.shown = 1;
    this.trail = 1;
    this.since = 99;
    this.wait = 0;
    this.started = false;
  }

  /**
   * One frame.
   *   frac   the share of life left, 0 to 1
   *   fight  an enemy is awake nearby
   *   gone   the hero is dead: there is nothing to show
   *   dt     seconds of game time (0 while the game is paused: nothing moves)
   */
  update(frac: number, fight: boolean, gone: boolean, dt: number): void {
    const f = Math.max(0, Math.min(1, frac));
    if (!this.started) {
      // (the first frame of a character is not a change in life)
      this.started = true;
      this.shown = f;
      this.trail = f;
    }
    if (Math.abs(f - this.shown) > 1e-6) {
      if (f < this.shown) {
        // a blow: what was lost stays lit for a moment (a second blow meanwhile adds to it)
        if (this.trail < this.shown) this.trail = this.shown;
        this.wait = LIFE_BAR.trailWait;
      } else if (f > this.trail) this.trail = f;
      this.shown = f;
      this.since = 0;
    } else this.since += dt;
    if (this.trail > this.shown) {
      if (this.wait > 0) this.wait = Math.max(0, this.wait - dt);
      else this.trail = Math.max(this.shown, this.trail - LIFE_BAR.trailRate * dt);
    } else this.trail = this.shown;
    const wanted = !gone && (fight || f < 1 || this.since < LIFE_BAR.linger);
    if (wanted) this.alpha = Math.min(1, this.alpha + dt / LIFE_BAR.show);
    else this.alpha = Math.max(0, this.alpha - dt / LIFE_BAR.hide);
  }

  /** Low enough to flash. */
  get low(): boolean {
    return this.shown > 0 && this.shown < LIFE_BAR.low;
  }
}

/** How many of the bar's `w` pixels a share of life fills: never none while there is any life left. */
export function barPixels(frac: number, w: number): number {
  if (frac <= 0) return 0;
  return Math.max(1, Math.min(w, Math.round(w * frac)));
}
