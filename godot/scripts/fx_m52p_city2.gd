## THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES AS THE FIGHT SHOWS THEM (his “Then finish the melds”, 24 Nov 2026; behind melds52.gd
## CITY2_ON until his yes to their page), painted beat by beat as the city's 45 are (fx_m52p_city.gd, whose shapes these share), with
## the same brushes (fx_m52kit.gd). The rules tell the moments (meldscity2_rules.gd, foe_meldscity2.gd); what each of a meld's two
## runes shows already stays as it is (the vortex, the copies, the curse, the bubble, the snare; twice, the drink, the blast, the
## sight, the frenzy, the shield, the ward), and a monster carrying one smoulders in its colour (fx_melds52.gd). Each one's colour is
## its stone's (melds52.json `color`).
## BY HIS ART RULEBOOK: as big and wild as it will go (the blasts flash and throw their sparks wide, and kick and hold); every shape
## the thing it is (a stagger's stars, a drink's drops of blood running to him, a sight on the marked, the frenzy's flames over him, a
## shield's face, the curse's thorns, a clock's hand on the slowed, a cuff and its chain, a net), never a plain ball, box or ring;
## nothing on a monster in a friend's cyan; a curse or a slow a monster lays on him in the enemy's pink and gold; nothing over him
## longer than a blink.
## What goes on while it holds is painted every frame (paint_*_more): the grounds these leave, each in its meld's colour and shape.
extends "res://scripts/fx_m52p_city.gd"

const IDS2 := ["backwash", "gullet", "harpoon", "whirlpool", "haven", "eddy", "whiplash", "maelstrom",
	"hydra", "swarm", "shellburst", "pinpoint", "riot", "phalanx", "rebound", "flechette", "starburst",
	"refrain", "bloodcurse", "hexblast", "evileye", "delirium", "talisman", "grudge", "omen", "pall",
	"rewind", "sap", "slowfuse", "stillpoint", "quickening", "respite", "eternity", "stutter", "doldrums",
	"fetters", "thrall", "tripwire", "pin", "mauler", "stockade", "manacle", "snag", "dragnet"]
## (how long each kind of moment shows, seconds)
const LONG2 := {"stagger": 0.6, "again": 0.7, "drink": 0.7, "orb": 0.6, "mark": 0.7, "spin": 0.5, "step": 0.5, "shield": 0.6,
	"eddy": 0.8, "yank": 0.5, "snap": 0.6, "maw": 0.6, "heads": 0.5, "pop": 0.5, "aim": 0.6, "plate": 0.6, "bounce": 0.4,
	"deeper": 0.7, "burst": 0.6, "rune": 0.6, "glare": 0.5, "eye": 0.7, "fever": 0.5, "ward": 0.6, "brand": 0.8, "fall": 0.7,
	"went": 0.7, "veil": 0.7, "turn": 0.7, "fuse": 0.8, "boom": 0.6, "true": 0.5, "still": 0.7, "deep": 0.6, "loop": 0.8,
	"catch": 0.7, "stun": 0.7, "spread": 0.7, "cuff": 0.6, "drain": 0.8, "pierce": 0.5, "lock": 0.8, "hook": 0.5, "net": 0.8,
	"snare": 0.6, "leave": 0.5, "shards": 0.55}
## (the big moments: a flash in its colour, its sparks thrown wide; tiles)
const BIG2 := {"boom": 1.6, "burst": 1.2, "pop": 0.9, "snap": 1.4, "went": 1.2, "rune": 1.0, "again": 0.9, "spread": 1.0,
	"net": 1.0, "maw": 1.0}
## (the lesser: a flash on what it struck)
const MID2 := ["stagger", "mark", "aim", "pierce", "true", "deeper", "brand", "fall", "glare", "eye", "turn", "loop", "catch",
	"deep", "still", "cuff", "lock", "hook", "stun", "yank", "veil"]
## (A CURSE, A SLOW OR A HOLD LAID IS A MOMENT OF ITS OWN, as the city's 45: fx_m52p_city.gd STATUS; by its kind: how big, tiles, and its front)
const STATUS2 := {"deeper": [1.0, "shock"], "brand": [1.0, "shock"], "fall": [1.1, "shock"], "veil": [1.2, "shock"], "glare": [0.9, "shock"],
	"eye": [1.0, "shock"], "turn": [1.0, "water"], "loop": [1.0, "water"], "catch": [1.1, "water"], "still": [1.0, "water"], "deep": [1.0, "water"],
	"cuff": [1.0, "shock"], "lock": [1.0, "shock"], "hook": [0.9, "sound"], "snare": [1.1, "sound"], "drink": [0.9, "water"], "drain": [0.9, "water"],
	"stagger": [1.0, "shock"], "stun": [1.0, "shock"], "mark": [0.9, "sound"], "aim": [0.9, "sound"], "true": [1.0, "sound"], "pierce": [0.9, "shock"],
	"ward": [1.0, "sound"], "shield": [0.9, "sound"], "plate": [0.9, "sound"], "orb": [0.9, "water"], "step": [0.8, "sound"], "fever": [0.8, "shock"]}
## (on him: no flash over him)
const STATUS2_ON_HIM := ["shield", "step", "fever", "plate"]
## (the heavy landings, which kick the screen; and the holds a tenth of a second: fx_melds52.gd HOLDS)
const KICKS2 := {"boom": 2.5, "snap": 2.0, "burst": 1.5, "went": 1.5, "pop": 1.0, "net": 1.0}
## (the moments that are a curse on what it struck, in the curse's thorns)
const CURSE := ["deeper", "brand", "fall", "veil", "glare", "eye"]


func ids() -> Array:
	return IDS2


func begin(b: Dictionary, e: Dictionary) -> bool:
	var what: String = b["what"]
	if not LONG2.has(what) and not what in ["foe", "foeSplit"]:
		return false
	b["end"] = float(LONG2.get(what, 0.6))
	if what == "fuse":
		b["end"] = float(e.get("secs", 0.8))
	if KICKS2.has(what) and fx != null and not b.get("minor", false):
		fx.kick(float(KICKS2[what]))
	var R := ramp(b["id"])
	var mid := _mid(b["m"])
	if BIG2.has(what) and fx != null:
		var big: float = float(BIG2[what])
		fx.flash(b["x"], b["y"], 10.0, big, 0.22, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
		fx.spray(b["x"], b["y"], int(10 + big * 8.0), PackedColorArray([R[5], R[4], R[3]]), 3.0 + big * 2.0, 14.0)
		fx.glow(b["x"], b["y"], 2.0 + big, 0.5)
	elif STATUS2.has(what) and fx != null and not b.get("minor", false):
		# (a notch too high rather than a notch too low, his Art Rulebook's Animations 1)
		var sz: float = float(STATUS2[what][0]) * 1.5
		if not STATUS2_ON_HIM.has(what):
			fx.flash(b["x"], b["y"], mid, sz, 0.2, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
			fx.glow(b["x"], b["y"], 1.5 + sz, 0.45)
		fx.spray(b["x"], b["y"], int(12 + sz * 10.0), PackedColorArray([R[5], R[4], R[3]]), 3.0 + sz * 2.0, 16.0, mid)
		if STATUS2[what][1] == "shock":
			fx.kick(0.8)
	elif what in MID2 and fx != null:
		fx.flash(b["x"], b["y"], mid, 0.7, 0.16, PackedColorArray([Color.WHITE, R[5], R[4]]))
		fx.spray(b["x"], b["y"], 8, PackedColorArray([R[5], R[4], R[3]]), 2.5, 10.0, mid)
	if what == "leave" and fx != null:
		var lr0 := float(e.get("r", 1.2))
		fx.flash(b["x"], b["y"], 4.0, maxf(1.0, lr0), 0.2, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
		fx.spray(b["x"], b["y"], 18, PackedColorArray([R[5], R[4], R[3]]), 3.0 + lr0, 14.0)
		fx.glow(b["x"], b["y"], 2.0 + lr0, 0.5)
	# (on him from a monster: its sparks thrown off him, in the enemy's colours where it curses or slows him)
	if what == "foe" and fx != null:
		var hostile: bool = b["id"] in ["refrain", "bloodcurse", "hexblast", "evileye", "delirium", "talisman", "grudge", "omen", "pall", "rewind", "sap", "slowfuse", "stillpoint", "quickening", "respite", "eternity", "stutter", "doldrums"]
		fx.spray(b["x"], b["y"], 14, PackedColorArray([ENEMY[5], ENEMY[4], ENEMY[3]]) if hostile else PackedColorArray([R[5], R[4], R[3]]), 3.0, 16.0, 22.0)
	match what:
		"boom", "burst", "pop":
			for i in 12:
				_bit(b["x"], b["y"], 4.0, "spark", PackedColorArray([R[3], R[4], R[5]]), 3.5, 0.6, 50, 20, 60)
		"orb":
			for i in 6:
				_bit(b["x"], b["y"], 6.0, "dot", PackedColorArray([R[2], R[3], R[4]]), 1.0, 0.6, 0, 6, 14)
		"stagger", "stun", "yank":
			for i in 5:
				_bit(b["x"], b["y"], mid * 2.0, "spark", PackedColorArray([R[4], R[5], Color.WHITE]), 1.5, 0.5, 0, 6, 16)
	return true


# --- shapes these add ---

## A shield's face, its boss glinting, (cx, cy) on the screen, `s` pixels tall.
func _shield_face(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	var w := s * 0.8
	for row in int(s):
		var v := float(row) / s
		var half: float = w * 0.5 * (1.0 if v < 0.55 else (1.0 - (v - 0.55) / 0.45))
		_ga(a)
		_fs(R[1] if row == 0 or row == int(s) - 1 else (R[3] if v < 0.5 else R[2]))
		_fill(_ri(cx - half), _ri(cy - s * 0.5 + row), maxi(1, _ri(half * 2.0)), 1)
	_ga(a)
	_fs(R[0])
	_fill(_ri(cx - w * 0.5), _ri(cy - s * 0.5), 1, _ri(s * 0.55))
	_fill(_ri(cx + w * 0.5) - 1, _ri(cy - s * 0.5), 1, _ri(s * 0.55))
	_fs(R[4])
	_fill(_ri(cx - w * 0.5) + 1, _ri(cy - s * 0.5) + 1, 1, _ri(s * 0.45))
	_glint(cx, cy - s * 0.15, maxf(3.0, s * 0.2), R, a)


## Stars of a stagger turning round over a head.
func _stars(cx: float, cy: float, n: int, R: PackedColorArray, a: float, spin: float) -> void:
	# (as big as they go, his Art Rulebook's Animations 1: five four-pointed stars, the near ones brighter, twinkling)
	n = maxi(n, 5)
	for k in n:
		var ang := spin + float(k) / n * TAU
		var px := _ri(cx + cos(ang) * 13.0)
		var py := _ri(cy + sin(ang) * 5.0)
		var arm := 3 + int(1.5 + 1.5 * sin(t * 12.0 + k * 1.7))
		_ga(a * (1.0 if sin(ang) > 0.0 else 0.7))
		_fs(R[4])
		_fill(px, py - arm, 1, arm * 2 + 1)
		_fill(px - arm, py, arm * 2 + 1, 1)
		_fs(R[5])
		_fill(px - 1, py, 3, 1)
		_fill(px, py - 1, 1, 3)
		_fs(Color.WHITE)
		_fill(px, py, 1, 1)
		_glow(px, py, 5.0, R[4], 0.6 * a)


## Drops running from (ax, ay) to (bx, by) on the screen, `u` of the way.
func _drops(ax: float, ay: float, bx: float, by: float, u: float, n: int, R: PackedColorArray, a: float, sd: int) -> void:
	for k in n:
		var v := _c01(u * 1.4 - float(k) * 0.12)
		if v <= 0.0 or v >= 1.0:
			continue
		var px := ax + (bx - ax) * v + (_rh(sd, k) - 0.5) * 4.0
		var py := ay + (by - ay) * v - sin(v * PI) * 12.0
		_ga(a)
		_fs(R[1])
		_fill(_ri(px) - 1, _ri(py) + 1, 4, 3)
		_fs(R[3])
		_fill(_ri(px) - 1, _ri(py) - 1, 4, 4)
		_fill(_ri(px), _ri(py) - 2, 2, 1)
		_fs(R[5])
		_fill(_ri(px) - 1, _ri(py) - 1, 1, 1)


# --- the moments ---

func paint_floor(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade: float = 1.0 - u
	var what: String = b["what"]
	var x: float = b["x"]
	var y: float = b["y"]
	var rr: float = float(b["e"].get("r", 1.2))
	# (a curse, a slow or a hold laid: its front rolling out from it)
	if STATUS2.has(what):
		_front(x, y, 0.3 + float(STATUS2[what][0]) * 1.6 * _ease(u), _A5(R), sd, fade, str(STATUS2[what][1]))
		_front(x, y, 0.2 + float(STATUS2[what][0]) * 1.0 * _ease(u), _A5(R), sd + 7, fade * 0.7, "water" if str(STATUS2[what][1]) != "water" else "sound")
	match what:
		"again", "spin", "maw", "eddy":
			if b["id"] in ["refrain", "rewind", "fetters"]:
				_front(x, y, rr * (0.4 + 0.6 * _ease(u)), _A5(R), sd, fade, "water")
			else:
				_swirl(x, y, rr * (1.0 - _ease(u) * 0.5), R, fade, -bt * (9.0 if what == "maw" else 6.0), 5 if what != "eddy" else 3, 3)
		"snap":
			_swirl(x, y, rr * (1.0 - _ease(u) * 0.85), R, fade, -bt * 12.0, 6, 3)
			if u > 0.4:
				_front(x, y, rr * _ease((u - 0.4) / 0.6), _A5(R), sd, fade, "shock")
		"boom", "burst", "pop", "rune":
			_front(x, y, 0.4 + rr * _ease(u), _A5(R), sd, fade, "shock")
		"went", "spread":
			_front(x, y, rr * (0.3 + 0.7 * _ease(u)), _A5(R), sd, fade, "sound" if b["id"] != "doldrums" else "water")
		"net":
			_web(_wx(x, y), _wy(x, y), rr * 14.0 * (0.5 + 0.5 * _ease(u)), R, fade, sd)
		"plate":
			_shield_face(_wx(x, y), _wy(x, y) - 6.0 - 4.0 * _ease(u), 10.0, R, fade)
		"yank":
			_front(x, y, 0.3 + 0.8 * _ease(u), _A5(R), sd, fade, "shock")
		"foe":
			var hostile: bool = b["id"] in ["refrain", "bloodcurse", "hexblast", "evileye", "delirium", "talisman", "grudge", "omen", "pall", "rewind", "sap", "slowfuse", "stillpoint", "quickening", "respite", "eternity", "stutter", "doldrums"]
			_front(x, y, 0.3 + 0.8 * _ease(u), _A5(PackedColorArray(ENEMY) if hostile else R), sd, fade, "shock")
		"leave":
			# (the ground it lays, laid: its edge rolling out to where it will stand, the light of it rising, sparks off it)
			var lr := float(b["e"].get("r", b.get("r", 1.2)))
			_front(x, y, lr * (0.3 + 0.8 * _ease(u)), _A5(R), sd, fade, "water")
			_front(x, y, lr * (0.15 + 0.55 * _ease(u)), _A5(R), sd + 3, fade * 0.7, "sound")
			for k in 6:
				var la := float(k) / 6.0 * TAU + 0.4
				_glint(_wx(x, y) + cos(la) * lr * 14.0 * (0.4 + 0.6 * u), _wy(x, y) - 4.0 - u * 16.0 + sin(la) * lr * 5.0, 3.0, R, fade)
			_glow(_wx(x, y), _wy(x, y), 22.0, R[3], 0.5 * fade)
		"shards":
			# (its shards flying out, each a streak in its colour)
			for q in b["e"].get("lands", []):
				var pq: Vector2 = q
				var sx := _wx(x, y)
				var sy := _wy(x, y) - 6.0
				var ex := _wx(pq.x, pq.y)
				var ey := _wy(pq.x, pq.y)
				var v := _ease(u)
				_streak(sx + (ex - sx) * maxf(0.0, v - 0.25), sy + (ey - sy) * maxf(0.0, v - 0.25) - sin(maxf(0.0, v - 0.25) * PI) * 10.0, sx + (ex - sx) * v, sy + (ey - sy) * v - sin(v * PI) * 10.0, R, fade, 2)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade: float = 1.0 - u
	var what: String = b["what"]
	var x: float = b["x"]
	var y: float = b["y"]
	var mp := _mid_px(b)
	var top := Vector2(mp.x, mp.y - _mid(b["m"]) - 6.0)
	var x1px := _wx(b["x1"], b["y1"])
	var y1px := _wy(b["x1"], b["y1"]) - 12.0
	var ax := _wx(x, y)
	var ay := _wy(x, y) - 12.0
	# (WORDSMITHING GLOWS, his Art Rulebook's Pillar 5: the meld's own symbol flares over what it struck and rises off it; and over the
	# ground it lays: fx_m52p_city.gd)
	if STATUS2.has(what) and not STATUS2_ON_HIM.has(what):
		_glow(top.x, top.y - 44.0 - u * 10.0, 14.0, R[4], 0.55 * fade)
		_glyph(b["id"], top.x, top.y - 44.0 - u * 10.0, 2, R[3], R[5], minf(1.0, fade * 2.0))
	if what == "leave":
		_glow(ax, ay - 10.0 - u * 16.0, 14.0, R[4], 0.55 * fade)
		_glyph(b["id"], ax, ay - 10.0 - u * 16.0, 2, R[3], R[5], minf(1.0, fade * 2.0))
	if what in CURSE:
		_thorns(top.x, top.y, 5 + (int(b["e"].get("n", 0)) if what == "veil" else 0), R, fade, sd)
		if what == "fall":
			# (the curse falling on it from above like a stroke of ill luck)
			var v := _ease(u)
			_streak(top.x + 22.0 - 22.0 * v + 6.0, top.y - 44.0 + 44.0 * v - 6.0, top.x + 22.0 - 22.0 * v, top.y - 44.0 + 44.0 * v, R, fade, 3)
			if u > 0.5:
				_glint(top.x, top.y, 7.0 * (1.0 - u), R, fade)
		elif what == "veil":
			# (a veil of shadow drawn over it: dark folds hanging round it)
			for k in 5:
				var vx := mp.x + (float(k) - 2.0) * 6.0
				_curl(vx, top.y + 6.0 + u * 6.0, 10.0, [R[0], R[1], R[2]], sd + k, fade * 0.8)
		elif what == "glare" or what == "eye":
			_sight(top.x, top.y - 4.0, u, R, fade)
		elif what == "brand":
			_glint(top.x, top.y - 3.0, 4.0, R, fade)
	match what:
		"stagger", "stun", "yank":
			_stars(top.x, top.y - 4.0, 3, R, fade, bt * 8.0)
		"drink", "drain":
			_drops(mp.x, mp.y - _mid(b["m"]), x1px, y1px, u, 5, R, fade, sd)
		"orb":
			_glow(ax, ay, 14.0, R[3], 0.7 * fade)
			_drops(ax - 6.0, ay + 8.0, ax, ay - 16.0, u, 4, R, fade, sd)
			_drops(ax + 6.0, ay + 8.0, ax, ay - 16.0, u, 4, R, fade, sd + 3)
		"mark", "aim", "true":
			_sight(top.x, top.y - 2.0, u, R, fade)
			if what == "true":
				_glint(top.x, top.y - 2.0, 5.0, R, fade)
		"pierce":
			_streak(top.x, top.y - 20.0, top.x, top.y + 8.0 * _ease(u), R, fade, 2)
			_sight(top.x, top.y - 2.0, u, R, fade * 0.7)
		"step", "fever", "deep":
			if what == "deep":
				_hand(top.x, top.y - 4.0, 5.0, -PI * 0.5 + u * 0.8, R, fade)
			else:
				var hx := x1px
				var hy := y1px - 22.0
				_flames(hx, hy + 10.0, 3, 8.0, 10.0 + 2.0 * float(b["e"].get("n", 1)), fade, R, sd)
		"shield", "ward":
			var sx := _wx(x, y)
			# (over his head, clear of him: his Art Rulebook's Animations 4)
			var sy := _wy(x, y) - 46.0
			_shield_face(sx, sy - 4.0 * _ease(u), 18.0, R, fade)
			if what == "ward":
				if b["id"] == "talisman":
					_thorns(sx, sy - 12.0, 4, R, fade, sd)
					_thorns(top.x, top.y, 4, R, fade, sd)
				else:
					_hand(top.x, top.y - 4.0, 4.0, -PI * 0.5 + u, R, fade)
		"heads":
			for k in 2:
				var off := (float(k) - 0.5) * 16.0
				_streak(ax, ay, ax + off * _ease(u), ay - 14.0 * _ease(u), R, fade, 2)
		"bounce":
			var v := _ease(u)
			_streak(ax + (x1px - ax) * maxf(0.0, v - 0.3), ay + (y1px - ay) * maxf(0.0, v - 0.3) - sin(v * PI) * 8.0, ax + (x1px - ax) * v, ay + (y1px - ay) * v - sin(v * PI) * 8.0, R, fade, 2)
		"turn", "loop", "catch", "still":
			_hand(top.x, top.y - 4.0, 5.0, -PI * 0.5 + (u * TAU if what != "catch" else u * 0.6) * (-1.0 if what == "turn" else 1.0), R, fade)
			if what == "loop":
				_hand(top.x, top.y - 4.0, 3.0, u * TAU * 0.25, R, fade * 0.8)
		"fuse":
			# (the fuse burning down on the slowed one, a spark at its end, slowly)
			var fl := 18.0 * (1.0 - u)
			_ga(1.0)
			_fs(R[1])
			_line(top.x, top.y + 1.0, top.x + fl, top.y - fl * 0.6 + 1.0, 2)
			_fs(R[2])
			_line(top.x, top.y, top.x + fl, top.y - fl * 0.6, 2)
			_glint(top.x + fl, top.y - fl * 0.6, 3.0 + 1.5 * sin(bt * 20.0), R, 1.0)
			_glow(top.x + fl, top.y - fl * 0.6, 7.0 + 2.0 * sin(bt * 20.0), R[5], 0.8)
		"cuff", "lock", "hook":
			_shackle(mp.x, mp.y + 2.0, R, fade)
			if what == "lock":
				_glint(mp.x, mp.y - 2.0, 4.0, R, fade)
			elif what == "hook":
				_chain(mp.x - 10.0, mp.y - 14.0, mp.x, mp.y, R, fade)
		"snare":
			_rope(ax, ay + 12.0, 14.0 * (1.0 - u * 0.4), 6.0, R, fade, sd)
			_rope(ax, ay + 9.0, 11.0 * (1.0 - u * 0.4), 5.0, R, fade * 0.8, sd + 1)
		"spread":
			_hand(ax, ay - 10.0, 6.0, -PI * 0.5 + u * PI, R, fade)
	# (on him, from a monster carrying one: its twist in its colour; a curse or a slow it lays in the enemy's pink and gold)
	if what == "foe":
		var hx := _wx(x, y)
		var hy := _wy(x, y) - 16.0
		var cursing: bool = b["id"] in ["refrain", "bloodcurse", "hexblast", "evileye", "delirium", "talisman", "grudge", "omen", "pall"]
		var slowing: bool = b["id"] in ["rewind", "sap", "slowfuse", "stillpoint", "quickening", "respite", "eternity", "stutter", "doldrums"]
		var C: PackedColorArray = PackedColorArray(ENEMY) if cursing or slowing else R
		if cursing:
			_thorns(hx, hy - 24.0, 5, C, fade, sd)
		elif slowing:
			_hand(hx, hy - 31.0, 11.0, -PI * 0.5 + u * PI, C, fade)
		match b["id"]:
			"backwash", "gullet", "harpoon", "whirlpool", "haven", "eddy", "whiplash", "maelstrom":
				_streak(x1px, y1px, hx, hy, R, fade, 2)
			"fetters", "thrall", "tripwire", "pin", "mauler", "stockade", "manacle", "snag", "dragnet":
				if b["id"] in ["manacle", "fetters"]:
					_shackle(hx, hy + 16.0, R, fade)
					_shackle(hx + 8.0, hy + 17.0, R, fade * 0.8)
				else:
					_rope(hx, hy + 14.0, 13.0, 5.0, R, fade, sd)
					_rope(hx, hy + 10.0, 11.0, 4.0, R, fade * 0.8, sd + 1)
			"hydra", "swarm", "shellburst", "pinpoint", "rebound", "flechette", "starburst":
				# (a Splitting one's: shards of it bursting off him)
				for k in 6:
					var ang := float(k) / 6.0 * TAU + 0.3
					_shard(hx + cos(ang) * (6.0 + u * 16.0), hy + 8.0 + sin(ang) * (3.0 + u * 8.0), 4.0, 8.0, [R[0], R[1], R[2], R[3], R[4], R[5]], sd + k, fade)
				_glint(hx, hy, 6.0, R, fade)
			_:
				if not cursing and not slowing:
					_glint(hx, hy - 4.0, 7.0, R, fade)
	if what == "foeSplit":
		_glint(_wx(x, y), _wy(x, y) - 14.0, 6.0 * (1.0 - u), R, fade)
		_front(x, y, 0.3 + 0.7 * _ease(u), _A5(R), sd, fade, "shock")
	_ga(1.0)


# --- what goes on ---

func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id: String = str(z.get("m52", ""))
		if not M52.is_city2(id):
			continue
		var k: String = str(z["kind"])
		var R := ramp(id)
		var x: float = z["x"]
		var y: float = z["y"]
		var rr: float = z["r"]
		var left := clampf((float(z["dur"]) - float(z["t"])) / 0.4, 0.0, 1.0) * clampf(float(z["t"]) / 0.25, 0.0, 1.0)
		var sd: int = int(x * 31.0 + y * 17.0)
		var cx := _wx(x, y)
		var cy := _wy(x, y)
		match k:
			"vortex":
				var fast: float = 1.0 + (0.15 * h.frenzy if id == "whirlpool" else 0.0) + (float(z["t"]) / maxf(1.0, float(z["dur"])) if id == "eddy" else 0.0)
				_swirl(x, y, rr, R, 0.85 * left, t * 5.0 * fast, 5 if id != "maelstrom" else 7, 3)
				if id == "haven" or id == "gullet":
					_glow(cx, cy, rr * 8.0, R[2], 0.4 * left)
			"hex":
				_spikes(x, y, rr, 12 if id != "pall" else 18, R, 0.7 * left, sd, 10.0, 2.0)
			"bubble":
				_hand(cx, cy - 18.0, 6.0, t * (0.6 if id != "quickening" else 3.0), R, 0.7 * left)
				if id == "eternity":
					_hand(cx, cy - 18.0, 4.0, t * 0.1, R, 0.6 * left)
			"snare":
				match id:
					"fetters", "manacle":
						_shackle(cx, cy - 2.0, R, 0.8 * left)
					"thrall":
						_glow(cx, cy, 8.0, R[2], 0.5 * left)
						_rope(cx, cy, 9.0, 4.0, R, 0.8 * left, sd)
					"tripwire":
						_rope(cx, cy, 9.0, 4.0, R, 0.8 * left, sd)
						if _rh(sd, int(t * 6.0)) < 0.5:
							_glint(cx + 9.0, cy - 2.0, 2.0, R, 0.8 * left)
					"pin":
						_streak(cx, cy - 12.0, cx, cy, R, 0.8 * left, 2)
					"dragnet":
						_web(cx, cy, rr * 12.0, R, 0.8 * left, sd)
					_:
						_rope(cx, cy, 9.0, 4.0, R, 0.8 * left, sd)
			"ward":
				_shield_face(cx, cy - 14.0 + sin(t * 2.0) * 1.5, 15.0, R, 0.8 * left)
			"rune":
				if id in ["hexblast", "slowfuse", "shellburst"]:
					_glint(cx, cy - 6.0, 5.0 + 1.5 * sin(t * 9.0), R, 0.9 * left)
	_ga(1.0)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null or h.monsters == null or not is_instance_valid(h.monsters):
		return
	# (on what these have written on: Grudge's brand, Eternity's slow clock, Stutter's caught hand)
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead or o.m52.is_empty():
			continue
		var cx := _wx(o.world.x, o.world.y)
		var cy := _wy(o.world.x, o.world.y) - _mid(o) * 2.0 - 10.0
		if bool(o.m52.get("grudge", false)) and o.hex_t > 0.0:
			_thorns(cx, cy, 4, ramp("grudge"), 0.8, o.id)
		if bool(o.m52.get("eternity", false)) and o.still_t > 0.0:
			_hand(cx, cy, 4.0, t * 0.3, ramp("eternity"), 0.7)
		if o.m52.has("stutter") and o.still_t > 0.0:
			_hand(cx, cy, 4.0, -PI * 0.5 + (0.3 if fmod(t, 0.5) < 0.25 else 0.0), ramp("stutter"), 0.7)
	_ga(1.0)
