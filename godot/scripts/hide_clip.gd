## WHAT STANDS BEHIND RAISED GROUND, CUT OFF BY IT (render.ts hide, blockPath; on a floor with ledges, L.step: floors 1, 3, 4, 5).
## The ground is drawn before anything stands, the raised ground with it; so a thing on low ground BEHIND raised ground (further up
## the screen, under its block) would be drawn over the block. The game shuts the screen to it there: for what stands at (x, y),
## lifted `lift`, each of the eight tiles before it (one or two along +x and +y) whose top stands more than a game pixel over that
## lift is a block (from its top down to the ground the thing stands on, a flight of stairs a wedge; not the same flight it stands
## on), and what of the thing falls inside a block is not drawn. Here: the blocks' outlines on the screen, picture pixels, six
## corners each, and a shader on what stands that leaves out what falls inside them.
extends RefCounted

const FloorMap := preload("res://scripts/floor_map.gd")
const MOST := 8

static var _shader: Shader = null


static func shader() -> Shader:
	if _shader == null:
		_shader = Shader.new()
		_shader.code = """
shader_type canvas_item;
uniform int n = 0;
uniform vec2 pts[48];
varying vec2 world;
void vertex() {
	world = (MODEL_MATRIX * vec4(VERTEX, 0.0, 1.0)).xy;
}
bool inside(vec2 p, int b) {
	for (int k = 0; k < 6; k++) {
		vec2 a = pts[b * 6 + k];
		vec2 c = pts[b * 6 + (k + 1) % 6];
		vec2 e = c - a;
		vec2 q = p - a;
		if (e.x * q.y - e.y * q.x < 0.0) {
			return false;
		}
	}
	return true;
}
void fragment() {
	for (int b = 0; b < 8; b++) {
		if (b >= n) {
			break;
		}
		if (inside(world, b)) {
			discard;
		}
	}
}
"""
	return _shader


## (render.ts reliefOf) How high the top of a floor tile stands, picture pixels: its height, and a flight of stairs a level more.
static func top_of(map: FloorMap, i: int) -> float:
	if map.tiles[i] != FloorMap.FLOOR:
		return 0.0
	var base := float(map.height[i]) if i < map.height.size() else 0.0
	var st := int(map.stair[i]) if i < map.stair.size() else 0
	return (base + (1.0 if st != 0 else 0.0)) * FloorMap.LEDGE_H


## Whether the floor has ledges at all (render.ts: `L.step`).
static func has_relief(map: FloorMap) -> bool:
	if map == null:
		return false
	var id := map.get_instance_id()
	if _relief.has(id):
		return _relief[id]
	var yes := false
	for v in map.height:
		if v != 0:
			yes = true
			break
	if not yes:
		for v in map.stair:
			if v != 0:
				yes = true
				break
	_relief[id] = yes
	return yes


static var _relief := {}


## (render.ts hide) The blocks that hide what stands at (x, y), lifted `lift` picture pixels: their outlines, six corners each.
static func blocks(map: FloorMap, x: float, y: float, lift: float) -> PackedVector2Array:
	var out := PackedVector2Array()
	var tx := floori(x)
	var ty := floori(y)
	if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h:
		return out
	var own := int(map.stair[ty * map.w + tx]) if ty * map.w + tx < map.stair.size() else 0
	var floor_at := minf(0.0, lift)
	for b in 3:
		for a in 3:
			if a + b == 0 or tx + a >= map.w or ty + b >= map.h:
				continue
			var i := (ty + b) * map.w + tx + a
			# (a game pixel over the lift: two picture pixels)
			if top_of(map, i) <= lift + 2.0:
				continue
			# (the same flight of stairs, beside the tile it stands on, hides nothing of it)
			if own != 0 and i < map.stair.size() and int(map.stair[i]) == own:
				continue
			if out.size() >= MOST * 6:
				return out
			out.append_array(outline(map, i, floor_at))
	return out


## (render.ts blockPath) The outline of a tile of higher ground as a solid block, from its top down to `floor_at` (picture pixels):
## a flight of stairs a wedge, its low end the floor at its foot.
static func outline(map: FloorMap, i: int, floor_at: float) -> PackedVector2Array:
	var tx := i % map.w
	var ty := i / map.w
	var px := float(tx - ty) * 32.0
	var py := float(tx + ty) * 16.0
	var up := top_of(map, i)
	var st := int(map.stair[i]) if i < map.stair.size() else 0
	var foot := maxf(floor_at, (float(map.height[i]) if i < map.height.size() else 0.0) * FloorMap.LEDGE_H) if st != 0 else up
	return PackedVector2Array([
		Vector2(px, py - up),
		Vector2(px + 32.0, py + 16.0 - (foot if st == 2 else up)),
		Vector2(px + 32.0, py + 16.0 - floor_at),
		Vector2(px, py + 32.0 - floor_at),
		Vector2(px - 32.0, py + 16.0 - floor_at),
		Vector2(px - 32.0, py + 16.0 - (foot if st == 1 else up)),
	])


## What of `node` falls inside the blocks `pts` is not drawn (none: drawn whole). Its material made once and kept.
static func apply(node: CanvasItem, pts: PackedVector2Array) -> void:
	if pts.is_empty():
		if node.material is ShaderMaterial and node.material.shader == shader():
			node.material.set_shader_parameter("n", 0)
		return
	if not (node.material is ShaderMaterial and node.material.shader == shader()):
		var m := ShaderMaterial.new()
		m.shader = shader()
		node.material = m
	var full := pts.duplicate()
	full.resize(48)
	node.material.set_shader_parameter("pts", full)
	node.material.set_shader_parameter("n", pts.size() / 6)
