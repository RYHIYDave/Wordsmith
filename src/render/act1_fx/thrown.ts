// ACT 1, THE DESCENT: WHAT ITS KINDS THROW AND LOB, its shadow on the floor under it as it flies, drawn as the
// Ossuary Golem's skull's is (art/mob_shots.ts drawSkullShadow): a dark ellipse on the floor, growing and darkening
// as it comes down. (The quarry golem's chunk, the firepot thrower's pot, the chanter's bolt.)

import { P } from '../../art/palette';

/** A shadow on the floor at (sx, sy) on the screen: `rx` game pixels across its middle (an ellipse on the floor is half as tall), `a` how dark. */
export function thrownShadow(g: CanvasRenderingContext2D, sx: number, sy: number, rx: number, a: number): void {
  const was = g.globalAlpha;
  g.globalAlpha = was * a;
  g.fillStyle = P.black;
  g.beginPath();
  g.ellipse(Math.round(sx), Math.round(sy), rx, rx / 2, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = was;
}
