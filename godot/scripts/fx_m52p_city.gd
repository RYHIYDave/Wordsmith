## THE CITY'S MELDS AS THE FIGHT SHOWS THEM (his doc Floor 11–15 Meld Animations, “Good to go”, 24 Nov 2026, after his “Remember to
## follow the rules for art and animations”), painted beat by beat as the 98 before them are (fx_m52p_*.gd), with the same brushes
## (fx_m52kit.gd). The rules tell the moments (meldscity_rules.gd, foe_meldscity.gd); what each of a meld's two runes shows already
## stays as it is (the vortex, the copies, the curse, the bubble, the snare: fx_city3.gd), and a monster carrying one smoulders in
## its colour (fx_melds52.gd). Each one's colour is its stone's (melds52.json `color`).
## BY HIS ART RULEBOOK: as big and wild as it will go; the heavy ones kick the screen and hold a tenth of a second (fx_melds52.gd
## HOLDS); every shape the thing it is, never a plain ball, box or ring (thorns, chains, spikes, tongues of flame, swirling arms,
## a lump of amber, a web, an anchor); nothing on a monster in a friend's cyan (Frostlock and Constellation in Frost's deep blue
## there: fx_m52kit.gd ICY); a curse a monster lays on him in the enemy's pink and gold; nothing over him or a warning for longer
## than a blink.
## What goes on while it holds is painted every frame (paint_*_more): the grounds these leave (each vortex, circle, bubble and
## snare in its meld's own), Constellation's hanging stars, Doom's thorns on the cursed, Stasis's held glow, Stormglass's hanging arcs.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["maw", "sump", "drift", "firewhirl", "lodestone", "riptide", "gravity",
	"splinter", "spore", "sleet", "embers", "fractal", "scatter", "rubble",
	"doom", "plague", "hoarfrost", "brimstone", "jinx", "whisper", "burden",
	"stasis", "stagnation", "frostlock", "slowburn", "stormglass", "timeslip", "standstill",
	"shackle", "strangler", "icebound", "firetrap", "tether", "lasso", "anchor",
	"confluence", "beckon", "horizon", "reel", "coven", "constellation", "web", "torpor", "witchknot", "amber",
	"pulling2", "splitting2", "hexing2", "stilling2", "binding2"]
## (the enemy's own: what a monster lays on him, his Art Rulebook's numbers: FLAME, pink burning to gold)
const ENEMY := [Color("#3a0820"), Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (how long each moment shows, seconds; what is not here, 0.5)
const LONG := {
	"maw:crash": 0.5, "maw:collapse": 0.7, "sump:drip": 0.8, "sump:drain": 0.7, "drift:crust": 0.7, "drift:slide": 0.45, "drift:pack": 0.7,
	"firewhirl:whirl": 0.8, "lodestone:tug": 0.45, "riptide:wave": 0.6, "riptide:wake": 0.4, "riptide:quick": 0.4, "gravity:crater": 0.8,
	"gravity:pulse": 0.5, "gravity:stun": 0.6, "splinter:jolt": 0.4, "splinter:might": 0.4, "spore:puff": 0.7, "sleet:sliver": 0.5,
	"sleet:again": 0.4, "embers:burst": 0.6, "fractal:fork": 0.4, "fractal:bolt": 0.45, "scatter:flick": 0.35, "scatter:quick": 0.4,
	"rubble:thud": 0.6, "rubble:chunk": 0.5, "doom:thorn": 0.7, "doom:might": 0.4, "plague:pass": 0.7, "hoarfrost:frozen": 0.6,
	"brimstone:flare": 0.7, "jinx:mark": 0.5, "whisper:wisp": 0.5, "whisper:pass": 0.5, "burden:weight": 0.8, "stasis:hold": 0.5,
	"stasis:snap": 0.6, "frostlock:lock": 0.8, "frostlock:ice": 0.7, "slowburn:slow": 0.9, "stormglass:hang": 0.7, "stormglass:crack": 0.5,
	"timeslip:hand": 0.6, "standstill:pulse": 0.6, "standstill:stun": 0.7, "shackle:clank": 0.4, "shackle:bite": 0.6,
	"strangler:thorns": 0.9, "strangler:vines": 0.9, "icebound:climb": 0.7, "icebound:jaw": 0.6, "icebound:seal": 0.8,
	"firetrap:tongues": 0.8, "firetrap:blaze": 0.8, "tether:burst": 0.5, "tether:chain": 0.5, "lasso:loop": 0.6, "lasso:quick": 0.4,
	"lasso:snare": 0.6, "anchor:sink": 0.8, "anchor:stun": 0.7, "confluence:drag": 0.5, "confluence:return": 0.5,
	"beckon:wisp": 0.6, "horizon:rim": 0.8, "reel:hook": 0.6, "reel:snare": 0.6, "coven:mark": 0.6, "coven:twice": 0.8,
	"constellation:star": 0.6, "constellation:hang": 0.4, "constellation:touch": 0.5, "web:thread": 0.5, "web:wrap": 0.8, "web:snare": 0.6,
	"torpor:drowse": 0.8, "witchknot:knot": 0.5, "witchknot:tie": 0.8, "amber:set": 0.9, "binding2:caught": 0.5, "timeslip:quick": 0.4,
	"burden:stun": 0.6, "stagnation:hold": 0.9, "amber:hold": 0.9,
}
## (the big moments: a flash and its sparks thrown wide, how big, tiles; the lesser: a flash on what it struck)
const BIG := {"maw:crash": 1.4, "maw:collapse": 2.0, "gravity:crater": 2.0, "embers:burst": 1.2, "firetrap:blaze": 1.6, "stasis:snap": 1.2,
	"anchor:sink": 1.6, "burden:weight": 1.2, "shackle:bite": 1.0, "firewhirl:whirl": 1.6, "drift:crust": 1.0, "tether:burst": 1.4,
	"fractal:bolt": 0.9, "rubble:thud": 1.0, "icebound:seal": 1.0, "stormglass:crack": 0.9, "horizon:rim": 1.2, "sump:drain": 1.0,
	"riptide:wave": 1.2, "plague:pass": 0.8, "standstill:pulse": 1.2, "gravity:pulse": 1.0}
const MID := ["doom:thorn", "hoarfrost:frozen", "brimstone:flare", "jinx:mark", "coven:mark", "coven:twice", "witchknot:knot", "witchknot:tie",
	"frostlock:lock", "frostlock:ice", "slowburn:slow", "icebound:climb", "icebound:jaw", "firetrap:tongues", "splinter:jolt", "spore:puff",
	"sleet:sliver", "constellation:star", "web:wrap", "lasso:loop", "reel:hook", "amber:set", "strangler:thorns", "strangler:vines",
	"shackle:clank", "torpor:drowse", "lodestone:tug", "beckon:wisp", "drift:pack", "stasis:hold", "anchor:stun", "standstill:stun",
	"gravity:stun", "burden:stun", "binding2:caught"]
## (A CURSE, A SLOW OR A HOLD LAID IS A MOMENT OF ITS OWN, his Art Rulebook's Animations 1, as big and wild as it will go: the check of 26 Nov
## 2026 found these the weakest of all the melds, only a small mark showing what they did. Each now flashes in its colour where it
## lands, throws its sparks wide and rolls out a front of its kind (the curse's jagged, slowed time's rippling, a hold's ringing),
## under its mark; how big, tiles, and which front. Those laid on him are drawn without the flash, so he stays in sight.)
const STATUS := {"jinx:mark": [1.0, "shock"], "coven:mark": [1.0, "shock"], "coven:twice": [1.3, "shock"], "witchknot:knot": [1.1, "sound"],
	"witchknot:tie": [1.1, "shock"], "torpor:drowse": [1.2, "water"], "stasis:hold": [1.1, "water"], "stagnation:hold": [1.1, "water"],
	"slowburn:slow": [1.0, "water"], "timeslip:hand": [0.9, "water"], "frostlock:lock": [1.0, "water"], "hoarfrost:frozen": [1.0, "water"],
	"lasso:loop": [1.0, "sound"], "lasso:snare": [1.2, "sound"], "web:wrap": [1.0, "sound"], "reel:hook": [0.9, "sound"], "reel:snare": [1.0, "sound"],
	"web:snare": [1.0, "sound"], "binding2:caught": [1.0, "sound"], "shackle:clank": [1.0, "shock"], "anchor:stun": [1.1, "shock"],
	"standstill:stun": [1.2, "shock"], "gravity:stun": [1.0, "shock"], "burden:stun": [1.0, "shock"], "whisper:wisp": [0.9, "shock"],
	"whisper:pass": [1.0, "shock"], "plague:pass": [1.0, "shock"], "doom:thorn": [1.0, "shock"], "brimstone:flare": [1.0, "shock"],
	"scatter:flick": [0.9, "shock"], "beckon:wisp": [0.9, "sound"], "strangler:vines": [1.0, "shock"], "strangler:thorns": [1.0, "shock"],
	"icebound:climb": [1.0, "water"], "amber:set": [1.2, "water"], "constellation:star": [0.9, "sound"], "sleet:sliver": [0.9, "shock"],
	"splinter:jolt": [0.9, "shock"], "spore:puff": [0.9, "water"], "lodestone:tug": [0.9, "sound"], "drift:pack": [1.0, "water"],
	"scatter:quick": [0.8, "sound"], "riptide:quick": [0.8, "sound"], "lasso:quick": [0.8, "sound"], "timeslip:quick": [0.8, "sound"]}
## (on him: no flash over him)
const STATUS_ON_HIM := ["scatter:quick", "riptide:quick", "lasso:quick", "timeslip:quick"]
## (the heavy landings, which kick the screen)
const KICKS := {"maw:crash": 2.5, "maw:collapse": 3.0, "gravity:crater": 3.0, "stasis:snap": 2.0, "shackle:bite": 2.0, "anchor:sink": 3.0,
	"firetrap:blaze": 2.0, "rubble:thud": 1.5, "burden:weight": 2.5, "gravity:pulse": 1.0, "standstill:pulse": 1.0, "embers:burst": 1.5}


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var key := "%s:%s" % [b["id"], b["what"]]
	var what: String = b["what"]
	if not LONG.has(key) and not what in ["split", "shards", "leave", "quick", "foe", "foeSplit", "foeArc", "snare", "stun"]:
		return false
	b["end"] = float(LONG.get(key, 0.5))
	if what == "foe" or what == "foeSplit":
		b["end"] = 0.6
	if what == "foeArc":
		b["end"] = 0.28
	if what == "split":
		b["end"] = 0.5 + float(e.get("hang", 0.0))
	if KICKS.has(key) and fx != null and not b.get("minor", false):
		fx.kick(float(KICKS[key]))
	var R := ramp(b["id"])
	var mid := _mid(b["m"])
	# (AS BIG AND WILD AS IT WILL GO, his Art Rulebook: the big moments flash in its colour and throw its sparks wide)
	if BIG.has(key) and fx != null and not b.get("minor", false):
		var big: float = float(BIG[key])
		var flare := PackedColorArray([Color.WHITE, R[5], R[4], R[3]])
		fx.flash(b["x"], b["y"], 10.0, big, 0.22, flare)
		fx.spray(b["x"], b["y"], int(10 + big * 8.0), PackedColorArray([R[5], R[4], R[3]]), 3.0 + big * 2.0, 14.0)
		fx.glow(b["x"], b["y"], 2.0 + big, 0.5)
	elif STATUS.has(key) and fx != null and not b.get("minor", false):
		# (a notch too high rather than a notch too low, his Art Rulebook's Animations 1)
		var sz: float = float(STATUS[key][0]) * 1.5
		if not STATUS_ON_HIM.has(key):
			fx.flash(b["x"], b["y"], mid, sz, 0.2, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
			fx.glow(b["x"], b["y"], 1.5 + sz, 0.45)
		fx.spray(b["x"], b["y"], int(12 + sz * 10.0), PackedColorArray([R[5], R[4], R[3]]), 3.0 + sz * 2.0, 16.0, mid)
		if STATUS[key][1] == "shock":
			fx.kick(0.8)
	elif MID.has(key) and fx != null and not b.get("minor", false):
		fx.flash(b["x"], b["y"], mid, 0.7, 0.16, PackedColorArray([Color.WHITE, R[5], R[4]]))
		fx.spray(b["x"], b["y"], 8, PackedColorArray([R[5], R[4], R[3]]), 2.5, 10.0, mid)
	if b["what"] == "leave" and fx != null:
		var lr0 := float(e.get("r", b.get("r", 1.2)))
		fx.flash(b["x"], b["y"], 4.0, maxf(1.0, lr0), 0.2, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
		fx.spray(b["x"], b["y"], 18, PackedColorArray([R[5], R[4], R[3]]), 3.0 + lr0, 14.0)
		fx.glow(b["x"], b["y"], 2.0 + lr0, 0.5)
	# (on him from a monster: its sparks thrown off him, in the enemy's colours where it curses or slows him)
	if b["what"] == "foe" and fx != null:
		var EC := PackedColorArray([ENEMY[5], ENEMY[4], ENEMY[3]]) if b["id"] in ["doom", "plague", "hoarfrost", "brimstone", "jinx", "whisper", "burden", "beckon", "coven", "torpor", "witchknot"] else PackedColorArray([R[5], R[4], R[3]])
		fx.spray(b["x"], b["y"], 14, EC, 3.0, 16.0, 22.0)
	match key:
		"spore:puff", "sump:drip":
			for i in 7:
				_bit(b["x"], b["y"], mid, "puff" if key == "spore:puff" else "dot", PackedColorArray([R[2], R[3], R[4]]), 1.3, 0.7, 6, 4, 18)
		"embers:burst", "firetrap:blaze", "firewhirl:whirl":
			for i in 14:
				_bit(b["x"], b["y"], 6.0, "spark", PackedColorArray([R[3], R[4], R[5]]), 3.5, 0.6, 50, 20, 60)
		"rubble:thud", "rubble:chunk", "maw:crash", "gravity:crater", "anchor:sink", "burden:weight":
			for i in 10:
				_bit(b["x"], b["y"], 3.0, "stone", PackedColorArray(STONE), 2.5, 0.7, 90, 20, 50)
			for i in 6:
				_bit(b["x"], b["y"], 2.0, "puff", PackedColorArray(DUST), 1.2, 0.8, 0, 2, 8)
		"drift:crust", "frostlock:ice", "icebound:seal", "drift:pack", "sleet:sliver":
			for i in 8:
				_bit(b["x"], b["y"], mid, "spark", PackedColorArray([R[3], R[4], R[5]]), 2.5, 0.5, 40, 10, 40)
		"maw:collapse":
			for i in 18:
				_bit(b["x"], b["y"], 4.0, "spark", PackedColorArray([R[3], R[4], R[5]]), 4.5, 0.6, 30, 10, 50)
		"constellation:star", "constellation:touch":
			for i in 5:
				_bit(b["x"], b["y"], mid, "spark", PackedColorArray([R[4], R[5], Color.WHITE]), 1.0, 0.6, 0, 4, 12)
	return true


func tick(b: Dictionary, dt: float) -> void:
	pass


# --- shapes (each the thing it is) ---

## (a ramp as the kit's shape brushes take it: dark, mid, itself, light, glint)
func _A5(R: PackedColorArray) -> Array:
	return [R[1], R[2], R[3], R[4], R[5]]


## A streak from a to b on the screen, its head at b bright, a dark edge under it.
func _streak(ax: float, ay: float, bx: float, by: float, R: PackedColorArray, a: float, w := 2) -> void:
	_ga(0.6 * a)
	_fs(R[0])
	_line(ax, ay + 1.0, bx, by + 1.0, w + 1)
	_ga(a)
	_fs(R[3])
	_line(ax, ay, bx, by, w)
	_fs(R[5])
	_line(ax + (bx - ax) * 0.75, ay + (by - ay) * 0.75, bx, by, maxi(1, w - 1))
	_glow(bx, by, 6.0 + w * 2.0, R[4], 0.5 * a)


## Arms swirling in to (x, y) on the floor, `rt` tiles: `arms` tapering streaks, turning with `spin`.
func _swirl(x: float, y: float, rt: float, R: PackedColorArray, a: float, spin: float, arms := 5, w := 3) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y)
	var rx := rt * 22.6
	for k in arms:
		var a0 := spin + float(k) / arms * TAU
		var px := cx + cos(a0) * rx
		var py := cy + sin(a0) * rx * 0.5
		for i in range(1, 15):
			var v := float(i) / 14.0
			var ang := a0 + v * 2.4
			var rr := rx * (1.0 - v * 0.85)
			var qx := cx + cos(ang) * rr
			var qy := cy + sin(ang) * rr * 0.5
			var ww := maxi(1, _ri(float(w) * (1.0 - v * 0.6) + 0.5))
			_ga(a * (0.45 + 0.55 * v))
			_fs(R[1])
			_line(px, py + 1.0, qx, qy + 1.0, ww)
			_fs(R[3] if v < 0.6 else R[4])
			_line(px, py, qx, qy, ww)
			px = qx
			py = qy
	_glow(cx, cy, rx * 0.6 + 6.0, R[3], 0.55 * a)
	_glow(cx, cy, rx * 0.25 + 3.0, R[5], 0.5 * a)
	_ga(1.0)


## Spikes standing up round (x, y) on the floor, `rt` tiles, `n` of them (ice, thorns, iron jaws).
func _spikes(x: float, y: float, rt: float, n: int, R: PackedColorArray, a: float, sd: int, hgt := 8.0, inward := 0.0) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y)
	var rx := rt * 22.6
	for i in n:
		var ang := float(i) / n * TAU + _rh(sd, i) * 0.2
		var px := cx + cos(ang) * rx
		var py := cy + sin(ang) * rx * 0.5
		var hh := hgt * (0.6 + 0.4 * _rh(sd, i + 20))
		var lean := -cos(ang) * inward
		_shard(px, py, 3.0, hh, [R[0], R[1], R[2], R[3], R[4], R[5]], sd + i, a)
		if inward != 0.0:
			_ga(a)
			_fs(R[4])
			_fill(_ri(px + lean), _ri(py - hh), 1, 1)
	_ga(1.0)


## Tongues of flame standing round (x, y) on the floor, `rt` tiles.
func _flame_round(x: float, y: float, rt: float, R: PackedColorArray, a: float, sd: int, hgt := 10.0) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y)
	var rx := rt * 22.6
	var n := maxi(6, _ri(rx * 0.5))
	for i in n:
		var ang := float(i) / n * TAU
		_flames(cx + cos(ang) * rx, cy + sin(ang) * rx * 0.5, 1, 2.0, hgt * (0.7 + 0.3 * _rh(sd, i)), a, R, sd + i)


## A chain of links from a to b on the screen.
func _chain(ax: float, ay: float, bx: float, by: float, R: PackedColorArray, a: float) -> void:
	var l := sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay))
	var n := maxi(2, _ri(l / 5.0))
	for i in n:
		var u := (float(i) + 0.5) / n
		var px := ax + (bx - ax) * u
		var py := ay + (by - ay) * u - sin(u * PI) * 3.0
		_ga(a)
		_fs(R[0])
		_fill(_ri(px) - 2, _ri(py) - 1 + 1, 4, 3)
		_fs(R[3] if i % 2 == 0 else R[2])
		if i % 2 == 0:
			_fill(_ri(px) - 2, _ri(py) - 1, 1, 3)
			_fill(_ri(px) + 1, _ri(py) - 1, 1, 3)
			_fill(_ri(px) - 1, _ri(py) - 2, 2, 1)
			_fill(_ri(px) - 1, _ri(py) + 1, 2, 1)
		else:
			_fill(_ri(px) - 2, _ri(py), 4, 1)
		_fs(R[5])
		_fill(_ri(px) - 1, _ri(py) - 2, 1, 1)
	_ga(1.0)


## A thorned curse mark at (cx, cy) on the screen, `n` thorns driven into it.
func _thorns(cx: float, cy: float, n: int, R: PackedColorArray, a: float, sd: int) -> void:
	for i in n:
		var ang := -PI * 0.5 + (float(i) - (n - 1) * 0.5) * 0.7 + (_rh(sd, i) - 0.5) * 0.2
		var l := 14.0 + 6.0 * _rh(sd, i + 5)
		var ox := cos(ang)
		var oy := sin(ang)
		_ga(a)
		_fs(R[0])
		_line(cx + ox * 2.0, cy + oy * 2.0 + 1.0, cx + ox * l, cy + oy * l + 1.0, 3)
		_fs(R[3])
		_line(cx + ox * 2.0, cy + oy * 2.0, cx + ox * l, cy + oy * l, 2)
		_fs(R[4])
		_line(cx + ox * (l * 0.5), cy + oy * (l * 0.5), cx + ox * l, cy + oy * l, 1)
		_fs(R[5])
		_fill(_ri(cx + ox * l), _ri(cy + oy * l), 1, 1)
	_glow(cx, cy, 12.0 + n * 2.0, R[3], 0.5 * a)
	_ga(1.0)


## A rope loop round (cx, cy) on the screen, its knot at the side.
func _rope(cx: float, cy: float, rx: float, ry: float, R: PackedColorArray, a: float, sd: int) -> void:
	var n := maxi(16, _ri(rx * 2.0))
	for i in n:
		var ang := float(i) / n * TAU + sin(t * 3.0) * 0.05
		var px := cx + cos(ang) * rx * (1.0 + 0.06 * sin(ang * 3.0 + float(sd)))
		var py := cy + sin(ang) * ry
		_ga(a)
		_fs(R[1] if i % 3 == 0 else R[3])
		_fill(_ri(px), _ri(py), 2, 1)
		if i % 4 == 0:
			_fs(R[4])
			_fill(_ri(px), _ri(py) - 1, 1, 1)
	_fs(R[4])
	_fill(_ri(cx + rx) - 1, _ri(cy) - 2, 3, 3)
	_fs(R[2])
	_line(cx + rx + 1.0, cy + 1.0, cx + rx + 4.0, cy + 6.0, 1)
	_ga(1.0)


## A web spun round (cx, cy) on the screen: its spokes and its turns.
func _web(cx: float, cy: float, r: float, R: PackedColorArray, a: float, sd: int) -> void:
	var spokes := 7
	for k in spokes:
		var ang := float(k) / spokes * TAU + _rh(sd, k) * 0.2
		_ga(a * 0.9)
		_fs(R[3])
		_line(cx, cy, cx + cos(ang) * r, cy + sin(ang) * r * 0.55, 1)
	for ring_n in 3:
		var rr := r * (0.35 + ring_n * 0.3)
		for k in spokes:
			var a0 := float(k) / spokes * TAU
			var a1 := float(k + 1) / spokes * TAU
			_ga(a * 0.75)
			_fs(R[4] if ring_n == 1 else R[2])
			_line(cx + cos(a0) * rr, cy + sin(a0) * rr * 0.55, cx + cos(a1) * rr * 0.96, cy + sin(a1) * rr * 0.53 + 1.0, 1)
	_ga(1.0)


## A jagged lump of glowing amber over (cx, cy) on the screen, `r` across.
func _amber(cx: float, cy: float, r: float, R: PackedColorArray, a: float, sd: int) -> void:
	var ir := maxi(2, _ri(r))
	for dy in range(-ir, ir + 1):
		var v := float(dy) / ir
		var half := r * sqrt(maxf(0.0, 1.0 - v * v)) * (0.8 + 0.25 * _rh(sd, dy + 50))
		var hx := _ri(half)
		if hx <= 0:
			continue
		_ga(a * 0.55)
		_fs(R[2] if dy > 0 else R[3])
		_fill(_ri(cx) - hx, _ri(cy) + dy, hx * 2, 1)
		_ga(a * 0.9)
		_fs(R[1])
		_fill(_ri(cx) - hx, _ri(cy) + dy, 1, 1)
		_fill(_ri(cx) + hx - 1, _ri(cy) + dy, 1, 1)
	_ga(a)
	_fs(R[5])
	_fill(_ri(cx - r * 0.45), _ri(cy - r * 0.55), 2, 1)
	_fill(_ri(cx - r * 0.5), _ri(cy - r * 0.4), 1, 2)
	_glow(cx, cy, r + 6.0, R[4], 0.45 * a)
	_ga(1.0)


## An anchor at (cx, cy) on the screen, `s` tall, its flukes at the foot.
func _anchor(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	_fs(R[1])
	_fill(_ri(cx) - 1, _ri(cy - s), 3, _ri(s))
	_fs(R[3])
	_fill(_ri(cx), _ri(cy - s), 1, _ri(s))
	_fs(R[3])
	_fill(_ri(cx - s * 0.3), _ri(cy - s * 0.75), _ri(s * 0.6) + 1, 2)
	_disc(cx, cy - s - 2.0, 2.0, [R[0], R[2], R[3], R[4], R[5]], a)
	for k in [-1, 1]:
		_fs(R[2])
		_line(cx, cy, cx + k * s * 0.4, cy - s * 0.3, 2)
		_fs(R[4])
		_fill(_ri(cx + k * s * 0.4), _ri(cy - s * 0.3) - 1, 2, 2)
	_ga(1.0)


## A shackle at (cx, cy) on the screen, shut, its pin bright.
func _shackle(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	for k in [-1, 1]:
		_fs(R[1])
		_fill(_ri(cx + k * 4) - 1, _ri(cy) - 5, 2, 6)
		_fs(R[3])
		_fill(_ri(cx + k * 4), _ri(cy) - 5, 1, 6)
	_fs(R[3])
	_fill(_ri(cx) - 4, _ri(cy) - 7, 9, 2)
	_fs(R[0])
	_fill(_ri(cx) - 5, _ri(cy) + 1, 11, 3)
	_fs(R[2])
	_fill(_ri(cx) - 5, _ri(cy), 11, 2)
	_fs(R[5])
	_fill(_ri(cx) - 1, _ri(cy), 2, 1)
	_ga(1.0)


## A vine winding up from (cx, cy) on the screen, `h` high, thorned.
func _vine(cx: float, cy: float, h: float, R: PackedColorArray, a: float, sd: int, grow := 1.0) -> void:
	var px := cx
	var py := cy
	var top := h * grow
	var y := 0.0
	while y < top:
		y += 2.0
		var qx := cx + sin(y * 0.35 + float(sd)) * 5.0
		var qy := cy - y
		_ga(a)
		_fs(R[1])
		_line(px, py + 1.0, qx, qy + 1.0, 2)
		_fs(R[3])
		_line(px, py, qx, qy, 1)
		if int(y) % 6 == 0:
			_fs(R[5])
			_fill(_ri(qx + (2.0 if int(y) % 12 == 0 else -2.0)), _ri(qy), 1, 1)
		px = qx
		py = qy
	_ga(1.0)


## A four-pointed glint at (cx, cy) on the screen.
func _glint(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	_fs(R[5])
	_fill(_ri(cx), _ri(cy - s), 1, _ri(s * 2.0) + 1)
	_fill(_ri(cx - s), _ri(cy), _ri(s * 2.0) + 1, 1)
	_fs(R[4])
	_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 3)
	_glow(cx, cy, s * 2.0 + 3.0, R[4], 0.5 * a)
	_ga(1.0)


## A weight dropping onto (cx, cy) on the screen: an iron block narrowing to its handle.
func _weight(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	for k in _ri(s):
		var v := float(k) / s
		var half := s * 0.55 * (1.0 - v * 0.35)
		_fs(R[3] if v > 0.75 else R[2])
		_fill(_ri(cx - half), _ri(cy - k), _ri(half * 2.0), 1)
		_fs(R[1])
		_fill(_ri(cx + half) - 1, _ri(cy - k), 1, 1)
	_fs(R[2])
	_fill(_ri(cx) - 2, _ri(cy - s) - 3, 5, 1)
	_fill(_ri(cx) - 2, _ri(cy - s) - 3, 1, 3)
	_fill(_ri(cx) + 2, _ri(cy - s) - 3, 1, 3)
	_ga(1.0)


## A clock hand sweeping round (cx, cy) on the screen.
func _hand(cx: float, cy: float, r: float, ang: float, R: PackedColorArray, a: float) -> void:
	# (as big as it will go, his Art Rulebook's Animations 1: never under eleven pixels across the face)
	r = maxf(r, 11.0)
	_ga(a)
	# (its rim, doubled, the quarters bold)
	var n := maxi(24, _ri(r * 2.6))
	for k in n:
		var q := float(k) / n * TAU
		_fs(R[1])
		_fill(_ri(cx + cos(q) * (r + 3.0)), _ri(cy + sin(q) * (r + 3.0)) + 1, 2, 1)
		_fs(R[3])
		_fill(_ri(cx + cos(q) * (r + 3.0)), _ri(cy + sin(q) * (r + 3.0)), 2, 1)
	for k in 12:
		var q := float(k) / 12.0 * TAU
		_fs(R[5] if k % 3 == 0 else R[4])
		_fill(_ri(cx + cos(q) * (r - 0.5)), _ri(cy + sin(q) * (r - 0.5)), 2 if k % 3 == 0 else 1, 2 if k % 3 == 0 else 1)
	_fs(R[1])
	_line(cx, cy + 1.0, cx + cos(ang) * r, cy + sin(ang) * r + 1.0, 3)
	_fs(R[4])
	_line(cx, cy, cx + cos(ang) * r, cy + sin(ang) * r, 2)
	_fs(Color.WHITE)
	_line(cx, cy, cx + cos(ang) * r * 0.7, cy + sin(ang) * r * 0.7, 1)
	_fs(R[5])
	_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 3)
	_glow(cx, cy, r + 6.0, R[4], 0.5 * a)
	_ga(1.0)


# --- the moments ---

func paint_floor(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade: float = 1.0 - u
	var key := "%s:%s" % [b["id"], b["what"]]
	var x: float = b["x"]
	var y: float = b["y"]
	match key:
		"maw:crash":
			_front(x, y, 0.4 + 1.1 * _ease(u), _A5(R), sd, fade, "shock")
		"maw:collapse":
			_swirl(x, y, float(b["r"]) * (1.0 - _ease(u) * 0.8), R, fade, -bt * 9.0, 6, 3)
			if u > 0.45:
				_front(x, y, float(b["r"]) * 1.3 * _ease((u - 0.45) / 0.55), _A5(R), sd, fade, "shock")
		"sump:drain":
			_swirl(x, y, 1.2 * (1.0 - u * 0.6), R, fade, bt * 7.0, 3, 2)
		"drift:crust", "drift:pack":
			_spikes(x, y, 0.45, 7, R, fade, sd, 9.0)
		"firewhirl:whirl":
			_swirl(x, y, float(b["r"]) * (1.0 - _ease(u) * 0.6), PackedColorArray(FIRE), fade, bt * 10.0, 5, 3)
			_flame_round(x, y, float(b["r"]) * 0.5 * (1.0 - u * 0.5), R, fade, sd, 14.0)
		"gravity:crater":
			_front(x, y, 0.5 + 1.6 * _ease(u), _A5(R), sd, fade, "shock")
			_swirl(x, y, 1.8 * (1.0 - u), R, fade * 0.8, -bt * 6.0, 5, 3)
		"gravity:pulse", "standstill:pulse":
			_front(x, y, float(b["r"]) * _ease(u), _A5(R), sd, fade * 0.8, "shock")
		"horizon:rim":
			_front(x, y, 1.2 + 0.3 * sin(bt * 8.0), _A5(R), sd, fade, "water")
		"riptide:wave":
			_front(x, y, 0.6 + 0.4 * int(b["n"]) + 0.6 * _ease(u), _A5(R), sd, fade, "water")
		"riptide:wake":
			var hx := _wx(x, y)
			var hy := _wy(x, y)
			for k in 3:
				var off := (float(k) - 1.0) * 5.0
				_streak(hx - b["dx"] * 30.0 + off, hy - b["dy"] * 15.0, hx + off * 0.3, hy, R, fade * 0.7, 1)
		"embers:burst":
			_flame_round(x, y, float(b["r"]) * _ease(u), PackedColorArray(FIRE), fade, sd, 12.0)
		"rubble:chunk":
			_stone(_wx(x, y), _wy(x, y), 6.0, 7.0 * (1.0 - u * 0.3), STONE, sd, fade)
		"firetrap:blaze":
			_flame_round(x, y, float(b["r"]) * (0.4 + 0.6 * _ease(u)), PackedColorArray(FIRE), fade, sd, 16.0)
		"icebound:jaw":
			_spikes(x, y, 0.5 * (1.0 - u * 0.5), 8, R, fade, sd, 10.0, 2.0)
		"shackle:bite":
			_spikes(x, y, 0.55 * (1.0 - _ease(u) * 0.6), 10, R, fade, sd, 7.0, 3.0)
		"tether:burst":
			_front(x, y, float(b["r"]) * _ease(u), _A5(R), sd, fade, "sound")
		"anchor:sink":
			_front(x, y, 0.4 + 1.2 * _ease(u), STONE, sd, fade, "shock")
		"web:snare", "lasso:snare", "reel:snare":
			if b["id"] == "web":
				_web(_wx(x, y), _wy(x, y), 14.0 * (0.6 + 0.4 * _ease(u)), R, fade, sd)
			else:
				_rope(_wx(x, y), _wy(x, y), 12.0 * (1.0 - u * 0.4), 6.0 * (1.0 - u * 0.4), R, fade, sd)
		"strangler:thorns":
			for k in 4:
				_vine(_wx(x, y) + (float(k) - 1.5) * 5.0, _wy(x, y), 16.0, R, fade, sd + k, _ease(u * 1.5))
		"coven:twice", "witchknot:tie":
			pass
	# (a curse, a slow or a hold laid: its front rolling out from it)
	if STATUS.has(key):
		_front(x, y, 0.3 + float(STATUS[key][0]) * 1.6 * _ease(u), _A5(R), sd, fade, str(STATUS[key][1]))
		_front(x, y, 0.2 + float(STATUS[key][0]) * 1.0 * _ease(u), _A5(R), sd + 7, fade * 0.7, "water" if str(STATUS[key][1]) != "water" else "sound")
	if b["what"] == "foe":
		_front(x, y, 0.3 + 0.8 * _ease(u), _A5(PackedColorArray(ENEMY) if b["id"] in ["doom", "plague", "hoarfrost", "brimstone", "jinx", "whisper", "burden", "beckon", "coven", "torpor", "witchknot"] else R), sd, fade, "shock")
	if b["what"] == "shards":
		var lands = b["e"].get("lands", [])
		for q in lands:
			var p: Vector2 = q
			var sx := _wx(x, y)
			var sy := _wy(x, y) - 6.0
			var ex := _wx(p.x, p.y)
			var ey := _wy(p.x, p.y)
			var v := _ease(u)
			_streak(sx + (ex - sx) * maxf(0.0, v - 0.25), sy + (ey - sy) * maxf(0.0, v - 0.25) - sin(maxf(0.0, v - 0.25) * PI) * 10.0, sx + (ex - sx) * v, sy + (ey - sy) * v - sin(v * PI) * 10.0, R, fade, 2)
	if b["what"] == "leave":
		# (the ground it lays, laid: its edge rolling out to where it will stand, the light of it rising, sparks off it)
		var lr := float(b["e"].get("r", b.get("r", 1.2)))
		_front(x, y, lr * (0.3 + 0.8 * _ease(u)), _A5(R), sd, fade, "water")
		_front(x, y, lr * (0.15 + 0.55 * _ease(u)), _A5(R), sd + 3, fade * 0.7, "sound")
		for k in 6:
			var la := float(k) / 6.0 * TAU + 0.4
			_glint(_wx(x, y) + cos(la) * lr * 14.0 * (0.4 + 0.6 * u), _wy(x, y) - 4.0 - u * 16.0 + sin(la) * lr * 5.0, 3.0, R, fade)
		_glow(_wx(x, y), _wy(x, y), 22.0, R[3], 0.5 * fade)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade: float = 1.0 - u
	var key := "%s:%s" % [b["id"], b["what"]]
	var x: float = b["x"]
	var y: float = b["y"]
	var mp := _mid_px(b)
	var top := Vector2(mp.x, mp.y - _mid(b["m"]) - 6.0)
	var x1px := _wx(b["x1"], b["y1"])
	var y1px := _wy(b["x1"], b["y1"]) - 12.0
	# (WORDSMITHING GLOWS, his Art Rulebook's Pillar 5: as a curse, a slow or a hold is laid, the meld's own symbol (its stone's) flares
	# over what it struck and rises off it; and over the ground it lays)
	if STATUS.has(key) and not STATUS_ON_HIM.has(key):
		_glow(top.x, top.y - 44.0 - u * 10.0, 14.0, R[4], 0.55 * fade)
		_glyph(b["id"], top.x, top.y - 44.0 - u * 10.0, 2, R[3], R[5], minf(1.0, fade * 2.0))
	if b["what"] == "leave":
		_glow(_wx(x, y), _wy(x, y) - 22.0 - u * 16.0, 14.0, R[4], 0.55 * fade)
		_glyph(b["id"], _wx(x, y), _wy(x, y) - 22.0 - u * 16.0, 2, R[3], R[5], minf(1.0, fade * 2.0))
	match key:
		# --- marks on what it struck ---
		"doom:thorn":
			_thorns(top.x, top.y, int(b["n"]), R, fade, sd)
		"hoarfrost:frozen":
			_thorns(top.x, top.y, 6, R, fade, sd)
			_glint(top.x, top.y, 4.0, R, fade)
		"brimstone:flare":
			_flames(mp.x, mp.y + _mid(b["m"]), 4, _half(b["m"]) * 1.6, 18.0, fade, R, sd)
			_thorns(top.x, top.y, 2, R, fade * 0.8, sd)
		"jinx:mark", "coven:mark", "witchknot:tie":
			_thorns(top.x, top.y, 5, R, fade, sd)
			_glint(top.x, top.y - 2.0, 4.0, R, fade)
		"coven:twice":
			_thorns(top.x, top.y, 6, R, fade, sd)
			_glint(top.x, top.y - 3.0, 6.0, R, fade)
		"plague:pass", "beckon:wisp", "whisper:wisp", "timeslip:hand", "confluence:drag", "confluence:return", "drift:slide", "reel:hook":
			var ax := _wx(x, y)
			var ay := _wy(x, y) - 12.0
			if key == "reel:hook":
				_ga(fade)
				_fs(R[3])
				_line(ax, ay, x1px, y1px + 10.0, 1)
				_shackle(ax, ay + 4.0, R, fade * 0.8)
			elif key == "timeslip:hand":
				_hand(ax, ay - 8.0, 6.0, -PI * 0.5 + u * TAU, R, fade)
				_wisps(x, y, b["x1"], b["y1"], u, 1, R, sd, 1)
			elif key in ["drift:slide", "confluence:drag", "confluence:return"]:
				_streak(x1px, y1px + 10.0, ax, ay + 10.0, R, fade, 2)
			else:
				_wisps(x, y, b["x1"], b["y1"], u, 2, R, sd, 1)
		"lodestone:tug", "stormglass:hang", "stormglass:crack", "fractal:fork", "tether:chain", "sleet:again", "scatter:flick":
			var ax := _wx(x, y)
			var ay := _wy(x, y) - 12.0
			if key == "tether:chain":
				_chain(ax, ay, x1px, y1px, R, fade)
				_bolt(ax, ay, x1px, y1px, R, sd, fade * 0.7, 1)
			elif key == "lodestone:tug":
				_chain(x1px, y1px, ax, ay, R, fade)
			elif key == "stormglass:hang":
				_ga(fade)
				_fs(R[4])
				_line(x1px, y1px, ax, ay, 1)
				_glint((ax + x1px) * 0.5, (ay + y1px) * 0.5, 3.0, R, fade)
			elif key in ["sleet:again", "scatter:flick"]:
				var v := _ease(u)
				_streak(ax + (x1px - ax) * maxf(0.0, v - 0.3), ay + (y1px - ay) * maxf(0.0, v - 0.3), ax + (x1px - ax) * v, ay + (y1px - ay) * v, R, fade, 2)
			else:
				_bolt(ax, ay, x1px, y1px, R, sd, fade, 2)
		"stasis:hold":
			_glow(mp.x, mp.y, 18.0, R[3], 0.7 * fade)
			_hand(mp.x, mp.y - _mid(b["m"]) - 16.0, 12.0, -PI * 0.5 + u * 0.6, R, fade)
		"stasis:snap":
			_glint(mp.x, mp.y, 9.0 * (1.0 - u * 0.5), R, fade)
			_front(x, y, 0.3 + 0.9 * _ease(u), _A5(R), sd, fade, "shock")
		"frostlock:lock", "frostlock:ice", "drift:pack", "icebound:seal":
			_spikes(x, y, 0.3, 6, R, fade, sd, _mid(b["m"]) * 1.2)
			if key == "frostlock:lock":
				_hand(top.x, top.y - 10.0, 11.0, -PI * 0.5 + u * 1.2, R, fade)
		"slowburn:slow":
			# (flames in slow motion: the same tongues, their sway a fifth as fast)
			var tw := t
			t = bt * 0.2
			_flames(mp.x, mp.y + _mid(b["m"]), 5, _half(b["m"]) * 1.8, 20.0, fade, R, sd)
			t = tw
		"icebound:climb", "icebound:jaw":
			_spikes(x, y, 0.32, 6, R, fade, sd, _mid(b["m"]) * 0.8 * _ease(u * 1.5), 2.0)
		"firetrap:tongues":
			_flame_round(x, y, 0.4, R, fade, sd, 16.0)
		"splinter:jolt":
			_streak(_wx(b["x1"], b["y1"]), _wy(b["x1"], b["y1"]) - 10.0, mp.x, mp.y, R, fade, 3)
			_glint(mp.x, mp.y, 5.0, R, fade)
		"splinter:might", "doom:might":
			_glint(mp.x, mp.y - 10.0, 4.0 * (1.0 - u), R, fade)
		"sleet:sliver":
			_shard(mp.x, mp.y + 6.0, 4.0, 10.0, [R[0], R[1], R[2], R[3], R[4], R[5]], sd, fade)
		"rubble:thud":
			_stone(mp.x, mp.y + _mid(b["m"]), 7.0, 6.0, STONE, sd, fade)
		"constellation:star", "constellation:touch":
			_glint(mp.x, mp.y - 4.0, 5.0, R, fade)
		"anchor:stun", "standstill:stun", "gravity:stun", "burden:stun":
			# (the stars spinning slow: the stun held longer)
			for k in 5:
				var ang := bt * 3.0 + float(k) / 5.0 * TAU
				_glint(top.x + cos(ang) * 14.0, top.y - 2.0 + sin(ang) * 5.0, 4.0 + (1.0 if sin(ang) > 0.0 else 0.0), R, fade)
			if key == "standstill:stun":
				_hand(top.x, top.y - 18.0, 11.0, -PI * 0.5 + u * 0.5, R, fade)
		"burden:weight":
			var drop := (1.0 - _ease(minf(1.0, u * 3.0))) * 30.0
			_weight(top.x, top.y - drop, 9.0, R, fade)
		"strangler:vines":
			for k in 3:
				_vine(mp.x + (float(k) - 1.0) * 5.0, mp.y + _mid(b["m"]), _mid(b["m"]) * 1.6, R, fade, sd + k, _ease(u * 2.0))
		"shackle:clank":
			_shackle(mp.x, mp.y + _mid(b["m"]) - 2.0, R, fade)
		"anchor:sink":
			var drop := (1.0 - _ease(minf(1.0, u * 2.5))) * 40.0
			_anchor(_wx(x, y), _wy(x, y) - drop, 16.0, R, fade)
		"amber:set", "amber:hold":
			_amber(mp.x, mp.y, _half(b["m"]) + 4.0, R, fade, sd)
		"stagnation:hold":
			# (the poison held as time stops: its bubbles hanging still round it, its fumes curling slow, a dial over it)
			for k in 6:
				_glint(mp.x + (_rh(sd, k) - 0.5) * 30.0, top.y + 6.0 - _rh(sd, k + 9) * 16.0, 3.5, R, fade)
			_curl(mp.x - 6.0, mp.y + 4.0, 14.0, [R[1], R[2], R[3]], sd, fade * 0.8)
			_curl(mp.x + 7.0, mp.y + 2.0, 12.0, [R[1], R[2], R[3]], sd + 3, fade * 0.7)
			_hand(top.x, top.y - 14.0, 11.0, -PI * 0.5 + u * 0.3, R, fade)
		"web:thread", "web:wrap":
			_ga(fade)
			_fs(R[4])
			_line(x1px, y1px, mp.x, mp.y, 1)
			if key == "web:wrap":
				_web(mp.x, mp.y, _half(b["m"]) + 6.0, R, fade, sd)
		"lasso:loop":
			# (the rope flung from him, its loop dropping over it and drawing tight)
			_ga(fade)
			_fs(R[1])
			_line(x1px, y1px + 1.0, mp.x, mp.y + 1.0, 2)
			_fs(R[3])
			_line(x1px, y1px, mp.x, mp.y, 2)
			var tight := 1.0 - 0.35 * _ease(minf(1.0, u * 2.0))
			_rope(mp.x, mp.y + _mid(b["m"]) * 0.5, (_half(b["m"]) + 9.0) * tight, 6.0 * tight, R, fade, sd)
			_rope(mp.x, mp.y + _mid(b["m"]) * 0.5 - 4.0, (_half(b["m"]) + 7.0) * tight, 5.0 * tight, R, fade * 0.8, sd + 1)
		"torpor:drowse":
			# (a heavy drowse settling on it: its haze curling off it slow, the curse's thorns and a dial over it)
			for k in 4:
				_curl(mp.x + (float(k) - 1.5) * 9.0, mp.y - 6.0 - u * 12.0, 11.0, [R[1], R[2], R[3]], sd + k, fade * 0.85)
			_thorns(top.x, top.y, 4, R, fade, sd)
			_hand(top.x, top.y - 22.0, 11.0, -PI * 0.5 + u * 0.4, R, fade)
		"witchknot:knot":
			# (a knotted cord binding it, thorns growing out of the knot)
			_rope(mp.x, mp.y + _mid(b["m"]) * 0.6, _half(b["m"]) + 8.0, 6.0, R, fade, sd)
			_rope(mp.x, mp.y + _mid(b["m"]) * 0.1, _half(b["m"]) + 6.0, 5.0, R, fade * 0.8, sd + 2)
			_thorns(mp.x + _half(b["m"]) + 8.0, mp.y + _mid(b["m"]) * 0.6, 4, R, fade, sd)
		"binding2:caught", "web:snare", "lasso:snare", "reel:snare":
			_glint(_wx(x, y), _wy(x, y) - 8.0, 6.0, R, fade)
			_rope(_wx(x, y), _wy(x, y) - 6.0, 12.0 * (1.0 - u * 0.4), 9.0 * (1.0 - u * 0.4), R, fade, sd + 4)
		"spore:puff":
			_curl(mp.x, mp.y, 10.0 * (0.6 + 0.4 * u), [R[1], R[2], R[3]], sd, fade)
		"sump:drip":
			for k in int(b["n"]):
				_shard(mp.x + (float(k) - 1.0) * 4.0, top.y + 6.0 + u * 14.0, 2.0, 3.0, [R[0], R[1], R[2], R[3], R[4], R[5]], sd + k, fade)
		"whisper:pass":
			# (a whisper as he passes: a wisp curling from him to it, the curse's thorns rising on it)
			_wisps(b["x1"], b["y1"], x, y, u, 3, R, sd, 2)
			_thorns(top.x, top.y, 4, R, fade, sd)
		"timeslip:quick", "riptide:quick", "scatter:quick", "lasso:quick":
			# (each quick use counted over him: chevrons of speed, and streaks off him)
			var hx := _wx(x, y)
			var hy := _wy(x, y) - 36.0
			for k in int(b["n"]):
				var qx: float = hx + (float(k) - (float(b["n"]) - 1.0) * 0.5) * 10.0
				_ga(fade)
				_fs(R[1])
				_line(qx - 3.0, hy - 3.0, qx + 1.0, hy + 1.0, 3)
				_line(qx + 1.0, hy + 1.0, qx - 3.0, hy + 5.0, 3)
				_fs(R[4])
				_line(qx - 3.0, hy - 4.0, qx + 1.0, hy, 2)
				_line(qx + 1.0, hy, qx - 3.0, hy + 4.0, 2)
				_glint(qx, hy, 3.0, R, fade)
			for k in 4:
				_streak(hx - 18.0 - u * 10.0, hy + 14.0 + k * 5.0, hx - 6.0, hy + 14.0 + k * 5.0, R, fade * 0.8, 1)
	# (a split of one of these: copies flying, Constellation's hanging first)
	if b["what"] == "split":
		var hang: float = float(b["e"].get("hang", 0.0))
		var ax := _wx(x, y)
		var ay := _wy(x, y) - 12.0
		for q in b["e"].get("to", []):
			var tx := _wx(float(q["x"]), float(q["y"]))
			var ty := _wy(float(q["x"]), float(q["y"])) - 12.0
			if bt < hang:
				var hx := ax + (tx - ax) * 0.25
				var hy := ay + (ty - ay) * 0.25 - 10.0
				_glint(hx, hy, 3.0, R, 1.0)
				_ga(0.4)
				_fs(R[3])
				_line(ax, ay, hx, hy, 1)
				continue
			var v := _c01((bt - hang) / maxf(0.06, float(q["secs"]) - hang))
			_streak(ax + (tx - ax) * maxf(0.0, v - 0.3), ay + (ty - ay) * maxf(0.0, v - 0.3), ax + (tx - ax) * v, ay + (ty - ay) * v, R, 1.0 - v * 0.5, 3 if b["id"] in ["splinter", "rubble", "splitting2"] else 2)
	# (on him, from a monster carrying one: the twist in its colour; a curse it lays in the enemy's pink and gold)
	if b["what"] == "foe":
		var hx := _wx(x, y)
		var hy := _wy(x, y) - 16.0
		var cursing: bool = b["id"] in ["doom", "plague", "hoarfrost", "brimstone", "jinx", "whisper", "burden", "beckon", "coven", "torpor", "witchknot"]
		var C: PackedColorArray = PackedColorArray(ENEMY) if cursing else R
		if cursing:
			_thorns(hx, hy - 24.0, 5, C, fade, sd)
		match b["id"]:
			"maw", "sump", "drift", "firewhirl", "lodestone", "riptide", "gravity", "confluence", "beckon", "reel":
				_streak(x1px, y1px, hx, hy, R, fade, 2)
			"shackle", "anchor", "strangler", "icebound", "firetrap", "tether", "web", "witchknot", "amber", "lasso":
				if b["id"] in ["shackle", "anchor"]:
					_shackle(hx, hy + 16.0, R, fade)
					_shackle(hx + 8.0, hy + 17.0, R, fade * 0.8)
				else:
					_rope(hx, hy + 14.0, 13.0, 5.0, R, fade, sd)
					_rope(hx, hy + 10.0, 11.0, 4.0, R, fade * 0.8, sd + 1)
			"stasis", "stagnation", "slowburn", "stormglass", "constellation", "standstill", "timeslip", "frostlock":
				_hand(hx, hy - 31.0, 11.0, -PI * 0.5 + u * PI, C, fade)
			"scatter", "splinter", "spore", "sleet", "embers", "fractal", "rubble":
				# (a Splitting one's: shards of it bursting off him)
				for k in 6:
					var ang := float(k) / 6.0 * TAU + 0.3
					_shard(hx + cos(ang) * (6.0 + u * 16.0), hy + 8.0 + sin(ang) * (3.0 + u * 8.0), 4.0, 8.0, [R[0], R[1], R[2], R[3], R[4], R[5]], sd + k, fade)
				_glint(hx, hy, 6.0, R, fade)
			_:
				_glint(hx, hy - 4.0, 7.0, C, fade)
	if b["what"] == "foeSplit":
		_glint(_wx(x, y), _wy(x, y) - 14.0, 6.0 * (1.0 - u), R, fade)
		_front(x, y, 0.3 + 0.7 * _ease(u), _A5(R), sd, fade, "shock")
	if b["what"] == "foeArc":
		_bolt(_wx(x, y), _wy(x, y) - 10.0, x1px, y1px + 2.0, R, sd, 0.9, 1)
	_ga(1.0)


# --- what goes on ---

func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id: String = str(z.get("m52", ""))
		if not M52.is_city(id):
			continue
		var k: String = str(z["kind"])
		var R := ramp(id)
		var x: float = z["x"]
		var y: float = z["y"]
		var rr: float = z["r"]
		var left := clampf((float(z["dur"]) - float(z["t"])) / 0.4, 0.0, 1.0) * clampf(float(z["t"]) / 0.25, 0.0, 1.0)
		var sd: int = int(x * 31.0 + y * 17.0)
		match k:
			"vortex":
				var spin := t * (5.0 if id != "maw" else 7.0)
				_swirl(x, y, rr * (1.0 - (float(z["t"]) / maxf(0.1, float(z["dur"]))) * (0.4 if id == "maw" else 0.0)), R, 0.9 * left, spin, 5, 3)
				if id == "firewhirl":
					_flame_round(x, y, rr * 0.5, PackedColorArray(FIRE), 0.8 * left, sd, 12.0)
				elif id == "drift":
					_spikes(x, y, 0.35, 5, R, 0.8 * left, sd, 7.0)
				elif id == "gravity":
					_glow(_wx(x, y), _wy(x, y), rr * 10.0, R[0], 0.5 * left)
			"hex":
				if id in ["brimstone"]:
					_flame_round(x, y, rr, R, 0.75 * left, sd, 10.0)
				elif id in ["hoarfrost"]:
					_spikes(x, y, rr, 10, R, 0.6 * left, sd, 5.0)
				elif id in ["doom", "coven", "burden", "witchknot", "plague", "torpor", "beckon", "jinx"]:
					_spikes(x, y, rr, 12, R, 0.7 * left, sd, 10.0, 2.0)
			"bubble":
				_hand(_wx(x, y), _wy(x, y) - 22.0, 12.0, t * (0.6 if id != "timeslip" else 3.0), R, 0.8 * left)
				if id == "stormglass":
					var ang := t * 9.0
					_bolt(_wx(x, y), _wy(x, y) - 22.0, _wx(x, y) + cos(ang) * rr * 14.0, _wy(x, y) - 4.0 + sin(ang) * rr * 5.0, R, int(t * 15.0), 0.6 * left, 1)
				elif id == "frostlock":
					_spikes(x, y, rr * 0.8, 8, R, 0.5 * left, sd, 5.0)
				elif id == "stagnation":
					for q in 4:
						_glint(_wx(x, y) + (_rh(sd, q) - 0.5) * rr * 30.0, _wy(x, y) - 6.0 - _rh(sd, q + 9) * 12.0, 3.0, R, 0.7 * left)
			"snare":
				var cx := _wx(x, y)
				var cy := _wy(x, y)
				match id:
					"shackle":
						_spikes(x, y, rr * 0.6, 8, R, 0.8 * left, sd, 5.0, 2.0)
					"strangler":
						for q in 3:
							_vine(cx + (float(q) - 1.0) * 4.0, cy, 8.0, R, 0.8 * left, sd + q)
					"icebound":
						_spikes(x, y, rr * 0.6, 8, R, 0.8 * left, sd, 8.0, 2.0)
					"firetrap":
						_flames(cx, cy, 3, 8.0, 6.0, 0.7 * left, R, sd)
					"anchor":
						_anchor(cx, cy, 16.0, R, 0.85 * left)
					"witchknot", "lasso", "reel", "amber":
						_rope(cx, cy, 13.0, 6.0, R, 0.85 * left, sd)
						_rope(cx, cy - 3.0, 10.0, 4.0, R, 0.6 * left, sd + 1)
					"web":
						_web(cx, cy, 11.0, R, 0.8 * left, sd)
					"tether":
						if _rh(sd, int(t * 12.0)) < 0.4:
							_bolt(cx - 6.0, cy, cx + 6.0, cy - 3.0, R, int(t * 15.0), 0.6 * left, 1)
	_ga(1.0)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	# (Constellation's shards hanging still in the air)
	var Y = h.m52.y if h.m52 != null else null
	if Y != null:
		var R := ramp("constellation")
		for s in Y._stars:
			var p: Vector2 = s["at"]
			var a := clampf(float(s["t"]) / 0.4, 0.0, 1.0)
			_glint(_wx(p.x, p.y), _wy(p.x, p.y) - 14.0 + sin(t * 3.0 + p.x) * 1.5, 3.0, R, a)
	# (on what these have written on: Doom's thorns, Stasis's held glow, Stormglass's hanging arc)
	if h.monsters != null and is_instance_valid(h.monsters):
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead or o.m52.is_empty():
				continue
			var cx := _wx(o.world.x, o.world.y)
			var cy := _wy(o.world.x, o.world.y) - _mid(o)
			if int(o.m52.get("doom_n", 0)) > 0 and o.hex_t > 0.0:
				_thorns(cx, cy - _mid(o) - 8.0, int(o.m52["doom_n"]), ramp("doom"), 0.8, o.id)
			if o.m52.has("stasis") and o.still_t > 0.0:
				_glow(cx, cy, _half(o) + 6.0, ramp("stasis")[3], 0.35)
			if o.m52.has("glass") and o.still_t > 0.0:
				var g: Dictionary = o.m52["glass"]
				var RG := ramp("stormglass")
				_ga(0.7)
				_fs(RG[4])
				_line(_wx(float(g["x"]), float(g["y"])), _wy(float(g["x"]), float(g["y"])) - 12.0, cx, cy, 1)
	_ga(1.0)
