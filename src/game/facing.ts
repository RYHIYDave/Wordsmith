// HOW A FIGURE THAT FACES A WAY ON THE FLOOR IS DRAWN, as the rules need to know it.
//
// A monster has two pictures, from in front and from behind, each painted facing screen-right and
// turned over for one that faces screen-left (render.ts, monsterSprite). So what is at its left hand
// in the picture is on the world's left of the way it faces for half the ways it can face, and on the
// world's right for the other half. The bosses of floors 2 to 5 do things to one side of themselves
// (an axe swept round to his left, a bone beast flung out behind his right, a stream of fire turning
// to his left): the rules put them on the side the picture shows them, by `handOf`.

/** Is it drawn from behind? (It faces well up the screen.) */
export function backView(fx: number, fy: number): boolean {
  return fx + fy < -0.2;
}

/** Is its picture turned over? (It faces screen-left.) */
export function flipped(fx: number, fy: number): boolean {
  return fx - fy < 0;
}

/**
 * 1 if the figure's left in its picture is the world's left of the way it faces, -1 if its right is.
 * `trueBack`: its pictures from behind are painted as the camera truly sees it (over its right
 * shoulder: the Headsman, the Chained One, the Fleshmancer, the cult's two); the others' are painted
 * turned over (the heroes, every older monster, the amalgamation and its beast).
 */
export function handOf(trueBack: boolean, fx: number, fy: number): 1 | -1 {
  const mirrored = flipped(fx, fy) !== (backView(fx, fy) && !trueBack);
  return mirrored ? -1 : 1;
}

/** A point `fwd` tiles before a figure at (x, y) facing (fx, fy) and `left` tiles to the left it is drawn with (`hand`), on the floor. */
export function beside(x: number, y: number, fx: number, fy: number, hand: number, fwd: number, left: number): { x: number; y: number } {
  return { x: x + fx * fwd + fy * hand * left, y: y + fy * fwd - fx * hand * left };
}

/** Where a point of the floor is from a figure at (x, y) facing (fx, fy): tiles before it, and to the left it is drawn with. */
export function fromFigure(x: number, y: number, fx: number, fy: number, hand: number, px: number, py: number): { fwd: number; left: number } {
  const dx = px - x;
  const dy = py - y;
  return { fwd: dx * fx + dy * fy, left: (dx * fy - dy * fx) * hand };
}
