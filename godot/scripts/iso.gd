## The game's isometric maths (src/engine/iso.ts), in PICTURE pixels: two to a game pixel, the grain the art is baked at.
## World units are tiles. World x grows toward screen right-down, world y toward screen left-down. A tile is a 32x16
## game-pixel diamond (64x32 picture pixels); tile (tx, ty) covers world [tx, tx+1) x [ty, ty+1), and its diamond's top
## vertex is at to_screen(tx, ty).

const HW := 32.0
const HH := 16.0


static func to_screen(x: float, y: float) -> Vector2:
	return Vector2((x - y) * HW, (x + y) * HH)


static func to_world(p: Vector2) -> Vector2:
	return Vector2((p.x / HW + p.y / HH) / 2.0, (p.y / HH - p.x / HW) / 2.0)


## A direction given on the screen (keys, a stick) as a unit vector on the floor, so the hero visibly goes the way the
## input points (iso.ts screenDirToWorld).
static func screen_dir_to_world(d: Vector2) -> Vector2:
	var w := to_world(d)
	return w.normalized() if w.length() > 1e-6 else Vector2.ZERO
