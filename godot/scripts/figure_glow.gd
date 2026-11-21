## A FIGURE'S POOL OF LIGHT (engine/px.ts glowOf, drawAura): a soft round pool, painted once (a radial gradient, full at its middle,
## 0.45 at 0.45 of its reach, nothing at its edge, 64 x 64) and laid on ADDED, stretched to the light's reach, in the light's colour
## and strength. A frame's `aura` (the bake's part: {x, y, r, color, a}, game pixels) is the pool behind a hero, laid just before
## his picture.
extends RefCounted

static var _tex: Texture2D = null
static var _add: CanvasItemMaterial = null


## The pool, in white: a Sprite2D with it takes the light's colour and strength as its modulate.
static func tex() -> Texture2D:
	if _tex == null:
		var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
		for y in 64:
			for x in 64:
				var d := Vector2(x + 0.5 - 32.0, y + 0.5 - 32.0).length() / 32.0
				var a := 1.0 - 0.55 * d / 0.45 if d < 0.45 else (0.45 * (1.0 - (d - 0.45) / 0.55) if d < 1.0 else 0.0)
				img.set_pixel(x, y, Color(1, 1, 1, a))
		_tex = ImageTexture.create_from_image(img)
	return _tex


## The blend a light is laid with ('lighter').
static func added() -> CanvasItemMaterial:
	if _add == null:
		_add = CanvasItemMaterial.new()
		_add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	return _add


## A light's colour with its strength as alpha (px.ts addLight: its `a`, 0.5 where it has none, times `strength`).
static func tint(l: Dictionary, strength := 1.0) -> Color:
	var c := Color(str(l["color"]))
	c.a = clampf(float(l.get("a", 0.5)) * strength, 0.0, 1.0)
	return c
