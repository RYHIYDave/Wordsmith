## THE TEN MELDED WORDS AT WORK (render/melds3.ts: the art chat's looks of Eruption, Avalanche, Thunder, Blight, Scald, Wildfire,
## Fumes, Hailstorm, Frostbite and Contagion, on in the game as it starts, MELD3, his yes of 16 Oct 2026 by 16:29, “Yes, send to
## main (Recommended)”, and of 21 Oct 2026, “Yes, turn them on (Recommended)”). fx.gd hands on to this, where the game's renderer,
## its effects and main.ts call melds3.ts. EVERY LOOK IS THE GAME'S OWN PAINTER PORTED LINE FOR LINE: the moments the rules tell
## of (eventsM3: a hit, an arc, a burst, a patch laid, a stun, a shove, a crush, a swing, a cast, HEAT) make what the game's make,
## each particle, ring, flash, light and freeze through fx.gd's own makers with the game's numbers, and its own bolts, bombs,
## scars, columns, jaws and slides here, by the same calls on chance in the same order; what goes on all the time (tickM3) and
## what is drawn (floorM3, airM3, overM3, lightsM3; tintM3, shiftM3, heroAlphaM3, rotting) the same, dot for dot. Held against the
## game's own painter (checks/melds3_check.gd, from tools/godot_melds3.ts): every dot each painter lays, every call each telling
## makes, given the same chances. Colours and numbers the game's, taken out of it into assets/words/melds3.json.
##   IN FRONT, ON WHAT IT HITS (hitLook): ERUPTION a volcano's (the game holds, white-hot light, molten rock flung up cooling to
##     black, stone, a ring of lava, smoke; a slam's jets of lava round its ring); AVALANCHE a slab of snow smashing down, a cone of
##     it blown on along the blow, blocks of ice tumbling; THUNDER violet crackle (a slam: the great bolt too); BLIGHT rot, a dark
##     spatter, a closing ring, ash rising, and what it struck marked to rot; SCALD fire and ice spiralling round each other and
##     boiling; WILDFIRE flames and short forks of burning lightning; FUMES a dark sour smoke; HAILSTORM hail hammering down;
##     FROSTBITE jaws of ice closing; CONTAGION sick green lightning and spores. As a move leaves him, a little of what it will be
##     (carryLook).
##   THE TWISTS (from the rules' own tellings): Thunder's ONE GREAT BOLT from the sky, twice, a burnt star (arcLook); Wildfire's,
##     Hailstorm's and Contagion's arcs; Scald's CRACK; Eruption's ERUPTION at full heat (fissures, a column of lava, bombs);
##     Thunder's THUNDERCLAP round him; Fumes' cloud EXPLODING; Avalanche's SHOVE (the picture slides where the rules put it, a
##     furrow of snow, a crash where one stopped short froze) and CRUSH; Thunder's STUN crackling over the head.
##   BEHIND, WHAT IT LEAVES (floor and air): molten rock, packed snow, a thunderhead, rot, boiling steam (Scald's steam: drawn here
##     at last), wildfire, smouldering ground and fumes, hail, toxic ice and cold mist, a green storm and crackling cloud; Blight's
##     brand under what it rots, its veins and drips; Frostbite's bite each half second; Eruption's heat at his feet and embers
##     circling him; Thunder's charge circling his chest; the steam hiding him (he is drawn fainter).
## WHAT IT READS (`read`, the game's names): him (where he is; his moves' melded words in front and behind, loadout.gd r(i)
## `meld`, `meld_behind`; melds.gd `heat`, `hits`); the patches his moves leave (wakes.gd list, each patch's `meld` and `look`);
## the monsters near him (monster.gd stun_t, poison_t, chill_t, frozen_t, bite_dps, blight_t, life, max_life, id).
## LEFT OUT: a melded shot's trail (trailLook): the Warrior throws no shots. RANKED WORDS (Power II and the other four) have no look
## of their own in the fight: the game's rules tell them as their words (game/melds.ts withParts, words.gd with_parts), and they
## look as their words do; their stone (its rank along its foot) and its II are the stones' and the HUD's.
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const FILE := "res://assets/words/melds3.json"

## Each melded word's colours, darkest to brightest (MELD_RAMP: the ten's own, Volatile's five's and the eight's stand-ins);
## what each is made of (MELD_OF); the ten (MELD_IDS) and Volatile's five (VOLT_MELD_IDS); Eruption's full heat and how many hits
## make Thunder's clap (MELD_TUNE).
static var RAMP := {}
static var PARTS := {}
static var TEN: Array = []
static var VOLT: Array = []
static var HEAT_FULL := 5
static var CLAP_EVERY := 4
## (MAX_PARTICLES of melds3.ts: fx.gd's own, the same)
## (a look of a patch, by the melded word and the patch's kind: lookOfKind's table)
const TABLE := {
	"eruption": {"burn": "molten"}, "avalanche": {"ice": "snow"}, "thunder": {"storm": "thunderhead"}, "blight": {"venom": "rot"},
	"scald": {"steam": "boil"}, "wildfire": {"burn": "wildfire"}, "fumes": {"burn": "smoulder", "venom": "fumes"},
	"hailstorm": {"storm": "hail"}, "frostbite": {"ice": "toxicice", "venom": "coldmist"}, "contagion": {"storm": "greenstorm", "venom": "crackle"},
}
const CLOUDED := ["thunderhead", "hail", "greenstorm", "fumes", "rot", "coldmist", "crackle", "boil"]

var fx
## THE RULES' STATE AS LAST READ (`read`), in the game's names:
##   hero: {x, y, meld: [3], meldBehind: [3], heat: [3], hits: [3]}
##   zones: the patches themselves (wakes.gd list), each {x, y, r, t, dur, kind, meld, look, hostile}; its shape kept in it, `m3`
##   monsters: {key (what its marks are kept by), id (the game's number, for its noise), x, y, dead, seen, kind, top, half,
##     stunT, poisonT, chillT, frozenT, biteDps, blightT, life, maxLife}
##   time: the fight's clock (game.time: Frostbite's bites go by its half seconds)
var view := {}
var _read_frame := -1
var _live := true
## M3 (melds3.ts): its own clock and what is going on.
var clock := 0.0
var later: Array = []
## Bolts along the ground {pts, t, dur, C, w, kind, z}; from the sky {x, y, top, offs, forks: [{at, offs}], t, dur, C, w};
## bombs and hail {x0, y0, x1, y1, t, dur, h, word}; scars {x, y, r, t, dur, kind, seed, lines, word}; columns {x, y, t, dur, h, w,
## word}; jaws {id (a monster's key), t, dur, big, at}; slides {id, x0, y0, x1, y1, t, dur, frozen}.
var bolts: Array = []
var skies: Array = []
var bombs: Array = []
var scars: Array = []
var columns: Array = []
var clamps: Array = []
var slides: Array = []
## What a melded word has done to one monster, by its key: {thunder, thunder0, blight, crush, bite}.
var marks := {}
var flash := {"t": 9.0, "dur": 0.1, "color": Color.WHITE, "a": 0.0}
var heat := 0
var claps := -1
var hidden := false
## (the check's: every dot laid and every oval, and the chances it is to take; null when drawing and playing)
var _rec = null
var _ovals = null
var _seq := -1
## (the painter's pen, as the game's canvas keeps it: its fill and its strength)
var _fs := Color.WHITE
var _ga := 1.0


static func ready_up() -> void:
	if not RAMP.is_empty():
		return
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	for w in d["ramp"]:
		var out := PackedColorArray()
		for h in d["ramp"][w]:
			out.append(Color(h))
		RAMP[w] = out
	PARTS = d["of"]
	TEN = d["ten"]
	VOLT = d["volt"]
	HEAT_FULL = int(d["heatFull"])
	CLAP_EVERY = int(d["clapEvery"])


func _init() -> void:
	ready_up()


## Forget everything (clearM3: a new place).
func clear() -> void:
	later = []
	bolts = []
	skies = []
	bombs = []
	scars = []
	columns = []
	clamps = []
	slides = []
	marks = {}
	flash["t"] = 9.0
	heat = 0
	claps = -1
	hidden = false


func alive() -> bool:
	return not (later.is_empty() and bolts.is_empty() and skies.is_empty() and bombs.is_empty() and scars.is_empty() and columns.is_empty()
		and clamps.is_empty() and slides.is_empty() and marks.is_empty()) or flash["t"] < flash["dur"] or heat > 0 or claps > 0 or hidden or _patched


var _patched := false


# =====================================================================================================================
# The game's arithmetic: Math.random (or, for the check, the chances it is given), rnd, pick, Math.round, smooth.

func _r() -> float:
	if _seq < 0:
		return randf()
	_seq = (_seq * 1664525 + 1013904223) % 4294967296
	return float(_seq) / 4294967296.0


func _rnd(a: float, b: float) -> float:
	return a + _r() * (b - a)


func _pick(list: PackedColorArray) -> Color:
	return list[int(floorf(_r() * list.size()))]


static func R(v: float) -> float:
	return floorf(v + 0.5)


## (a place as the check writes it: a whole number plainly, else to three places)
static func _k(v: float) -> String:
	return str(int(v)) if v == floorf(v) else "%.3f" % v


static func _smooth(q: float) -> float:
	return q * q * (3.0 - 2.0 * q)


static func _cs(list: Array) -> PackedColorArray:
	var out := PackedColorArray()
	for h in list:
		out.append(h if h is Color else Color(h))
	return out


static func _h(x: int, y: int, s := 0) -> float:
	return L.hash2(x, y, s)


func _wx(x: float, y: float) -> float:
	return fx.gx(x, y)


func _wy(x: float, y: float) -> float:
	return fx.gy(x, y)


# =====================================================================================================================
# What the words are (meldsIn, meldLookWords, meldOwnsEvent, lookOfKind)

static func is_ten(w) -> bool:
	return w is String and TEN.has(w)


## The melded words among `w` (meldsIn: the ten).
static func melds_in(w) -> Array:
	var out: Array = []
	if w is Array:
		for x in w:
			if is_ten(x):
				out.append(x)
	return out


## The words whose own marks the effects draw on what an attack hits (meldLookWords): a melded word's two words left out, its
## own look in their place (and Volatile's five's, theirs: render/volatile3.ts). The very list when there is none in it.
static func look_words(w):
	if not (w is Array):
		return w
	var m: Array = melds_in(w)
	for x in w:
		if x is String and VOLT.has(x):
			m.append(x)
	if m.is_empty():
		return w
	var parts := {}
	for x in m:
		for p in PARTS[x]:
			parts[p] = true
	var out: Array = []
	for x in w:
		if not parts.has(x):
			out.append(x)
	return out


## The look a melded word gives a patch of this kind (lookOfKind): "" none; for an arc or a burst, "own".
static func look_of_kind(word: String, kind, t: String) -> String:
	if t != "zone":
		return "own"
	if kind == null or not TABLE.has(word):
		return ""
	return TABLE[word].get(kind, "")


## Whether the effects leave this telling to the melded words' looks (meldOwnsEvent): a bolt, a blast or a patch of a twist.
static func owns_event(e: Dictionary) -> bool:
	var t: String = e.get("t", "")
	var m = e.get("meld")
	if not (t == "arc" or t == "burst" or t == "zone") or not (m is String):
		return false
	return look_of_kind(m, e.get("kind") if t == "zone" else null, t) != ""


## A patch's look, or "" (lookOf).
static func look_of(z: Dictionary) -> String:
	var w = z.get("look")
	if w == null:
		w = z.get("meld")
	if not (w is String):
		return ""
	return look_of_kind(w, z.get("kind"), "zone")


## Whether this patch is drawn here, not as its words' are (ownsZone).
static func owns_zone(z: Dictionary) -> bool:
	return look_of(z) != ""


# =====================================================================================================================
# Bits the looks are made of (melds3.ts: add, fling, puffs, ring, flash, glow, later, screenFlash, jagged, bolt, skyBolt, scar)

func _add(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, color: Color, size: float, grav: float, ramp = null, streak := 0.0) -> void:
	fx.add(x, y, z, vx, vy, vz, life, color, size, grav, ramp, streak)


## Things flung out from (x, y): along (dx, dy) if given, otherwise all round (fling). `o`: speed, up, grav, life, z, size, r,
## dx, dy, spread, streak, ramp.
func _fling(x: float, y: float, n: int, colors: PackedColorArray, o: Dictionary) -> void:
	var has_base: bool = o.has("dx") and o.has("dy")
	var base := atan2(float(o.get("dy", 0.0)), float(o.get("dx", 0.0))) if has_base else 0.0
	var speed: float = o["speed"]
	var spread: float = o.get("spread", 0.5)
	var rr: float = o.get("r", 0.15)
	var life_k: float = o.get("life", 0.5)
	var z0: float = o.get("z", 8.0)
	var up: float = o.get("up", 0.0)
	var grav: float = o.get("grav", 0.0)
	var ramp = o.get("ramp")
	var streak: float = o.get("streak", 0.0)
	for i in n:
		var a := _r() * TAU if not has_base else base + _rnd(-1, 1) * spread
		var s := _rnd(0.45, 1) * speed
		var d := _rnd(0, rr)
		var life := _rnd(0.6, 1) * life_k
		var z := z0 + _rnd(-2, 2)
		var vz := _rnd(0.5, 1) * up
		var col := _pick(colors)
		var size: float = o["size"] if o.has("size") else (2.0 if _r() < 0.35 else 1.0)
		_add(x + cos(a) * d, y + sin(a) * d, z, cos(a) * s, sin(a) * s, vz, life, col, size, grav, ramp, streak)


## Soft puffs that rise and darken, from (x, y) within `r` (puffs). `o`: up, z, life, drift, dx, dy.
func _puffs(x: float, y: float, r: float, n: int, ramp: PackedColorArray, o := {}) -> void:
	var z0: float = o.get("z", 4.0)
	var dx: float = o.get("dx", 0.0)
	var dy: float = o.get("dy", 0.0)
	var drift: float = o.get("drift", 0.3)
	var up: float = o.get("up", 26.0)
	var life_k: float = o.get("life", 0.9)
	for i in n:
		var a := _r() * TAU
		var d := sqrt(_r()) * r
		var life := _rnd(0.7, 1.2) * life_k
		var z := z0 + _rnd(0, 6)
		var vx := dx + _rnd(-1, 1) * drift
		var vy := dy + _rnd(-1, 1) * drift
		var vz := _rnd(0.5, 1) * up
		_add(x + cos(a) * d, y + sin(a) * d, z, vx, vy, vz, life, ramp[0], 3.0, -4.0, ramp)


func _ring(x: float, y: float, r: float, dur: float, colors: PackedColorArray, o := {}) -> void:
	fx.ring(x, y, r, dur, colors, o.get("fill", false), o)


func _flash(x: float, y: float, z: float, r: float, dur: float, colors: PackedColorArray) -> void:
	fx.flash(x, y, z, r, dur, colors)


func _glow(x: float, y: float, r: float, dur: float) -> void:
	fx.glow(x, y, r, dur)


func _later(t: float, fn: Callable) -> void:
	later.append({"t": t, "fn": fn})


func _kick(v: float) -> void:
	fx.kick(v)


func _spike(x0: float, y0: float, x1: float, y1: float, tall: float, dur: float) -> void:
	fx.spikes.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "tall": tall, "t": 0.0, "dur": dur})


## The whole screen lit for an instant (screenFlash).
func _screen_flash(color: Color, a: float, dur := 0.09) -> void:
	if flash["t"] < flash["dur"] and flash["a"] > a:
		return
	flash = {"t": 0.0, "dur": dur, "color": color, "a": a}


## A jagged way from (x0, y0) to (x1, y1), world points (jagged).
func _jagged(x0: float, y0: float, x1: float, y1: float, wob := 0.3) -> PackedFloat64Array:
	var pts := PackedFloat64Array([x0, y0])
	var segs := maxi(3, mini(9, int(R(sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) * 2.0))))
	for i in range(1, segs):
		var k := float(i) / segs
		var px := x0 + (x1 - x0) * k + _rnd(-wob, wob)
		var py := y0 + (y1 - y0) * k + _rnd(-wob, wob)
		pts.append(px)
		pts.append(py)
	pts.append(x1)
	pts.append(y1)
	return pts


## A bolt along the ground (bolt). `o`: w, dur, kind, wob, z.
func _bolt(x0: float, y0: float, x1: float, y1: float, C: PackedColorArray, o := {}) -> void:
	bolts.append({"pts": _jagged(x0, y0, x1, y1, o.get("wob", 0.3)), "t": 0.0, "dur": o.get("dur", 0.18), "C": C, "w": int(o.get("w", 1)),
		"kind": o.get("kind", "plain"), "z": float(o.get("z", 10.0))})
	if bolts.size() > 60:
		bolts.pop_front()


## A bolt from the sky onto (x, y) (skyBolt). `o`: top, w, dur, forks, wild.
func _sky_bolt(x: float, y: float, C: PackedColorArray, o := {}) -> void:
	var top: float = o.get("top", 150.0)
	var joints := maxi(6, int(R(top / 18.0)))
	var offs := PackedFloat64Array()
	var drift := 0.0
	var wild: float = o.get("wild", 9.0)
	for i in joints:
		drift += _rnd(-wild, wild)
		drift *= 0.75
		offs.append(drift)
	# (it comes down onto the point: the last joint is over it)
	offs[0] = 0.0
	var forks: Array = []
	for f in int(o.get("forks", 2)):
		var at := 1 + int(floorf(_r() * (joints - 2)))
		var side := -1.0 if _r() < 0.5 else 1.0
		var fo := PackedFloat64Array()
		var fx0 := offs[at]
		# (the game asks again how many each time round: `i < 3 + Math.floor(Math.random() * 3)`)
		var i := 0
		while i < 3 + int(floorf(_r() * 3)):
			fx0 += side * _rnd(3, 10)
			fo.append(fx0)
			i += 1
		forks.append({"at": at, "offs": fo})
	skies.append({"x": x, "y": y, "top": top, "offs": offs, "forks": forks, "t": 0.0, "dur": o.get("dur", 0.22), "C": C, "w": int(o.get("w", 2))})
	if skies.size() > 16:
		skies.pop_front()


## A scar on the floor: a burnt star of `n` rays, or a fissure's web (scar).
func _scar(word: String, kind: String, x: float, y: float, r: float, dur: float, n := 7) -> Dictionary:
	var seed := int(floorf(_r() * 1e6))
	var lines: Array = []
	var a0 := _r() * TAU
	for k in n:
		var a := a0 + float(k) / n * TAU + (_h(seed, k, 1) - 0.5) * 0.6
		var length := r * (0.55 + _h(seed, k, 2) * 0.5)
		var segs := 3
		var pts := PackedFloat64Array([cos(a) * r * 0.08, sin(a) * r * 0.08])
		for i in range(1, segs + 1):
			var d := length * i / segs
			var j := (_h(seed, k * 4 + i, 3) - 0.5) * r * 0.25
			pts.append(cos(a) * d - sin(a) * j)
			pts.append(sin(a) * d + cos(a) * j)
		lines.append(pts)
	var s := {"x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "kind": kind, "seed": seed, "lines": lines, "word": word}
	scars.append(s)
	if scars.size() > 40:
		scars.pop_front()
	return s


func _mark(key) -> Dictionary:
	if not marks.has(key):
		marks[key] = {"thunder": 0.0, "thunder0": 0.0, "blight": false, "crush": 9.0, "bite": -1}
	return marks[key]


## A monster near (x, y), the nearest within `r` (struckAt): in the fight, of all those near him.
func _struck_at(x: float, y: float, r := 0.35):
	if _live:
		var near = null
		var nd := r
		for o in fx._near:
			if not is_instance_valid(o) or o.dead:
				continue
			var d := sqrt((o.world.x - x) * (o.world.x - x) + (o.world.y - y) * (o.world.y - y))
			if d <= nd:
				nd = d
				near = o
		return _mon(near) if near != null else null
	var best = null
	var bd := r
	for m: Dictionary in view.get("monsters", []):
		if m["dead"]:
			continue
		var d := sqrt((m["x"] - x) * (m["x"] - x) + (m["y"] - y) * (m["y"] - y))
		if d <= bd:
			bd = d
			best = m
	return best


# =====================================================================================================================
# IN FRONT: each word on what it hits. `big`: an area ability's blast, out to `r`; otherwise one hit.

## ERUPTION (Power and Flame): the hit is a volcano's (eruptionHit).
func eruption_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["eruption"]
	fx.hold(0.09 if big else 0.06)
	_kick(6.5 if big else 4.2)
	_flash(x, y, 4.0 if big else 10.0, minf(1.6, r * 0.55) if big else 0.6, 0.12, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 1.0, 0.3, _cs([C[5], C[4], C[3], C[2]]), {"heavy": true, "fill": big})
	_ring(x, y, (r if big else 1.0) * 1.3, 0.42, _cs(["#5a4a44", "#3e322e", "#2a2220"]), {"delay": 0.05})
	# molten rock flung high, cooling from white to black as it flies
	var lava := _cs([C[5], C[4], C[4], C[3], C[2], C[1]])
	for i in (22 if big else 12):
		var a := _r() * TAU
		var s := _rnd(0.8, 4.2 if big else 2.8)
		var life := _rnd(0.55, 0.95)
		var z := _rnd(4, 10)
		var vz := _rnd(110, 230 if big else 190)
		var size := 3.0 if _r() < 0.55 else 2.0
		_add(x + cos(a) * 0.1, y + sin(a) * 0.1, z, cos(a) * s, sin(a) * s, vz, life, C[4], size, 430.0, lava)
	# black stone
	_fling(x, y, 12 if big else 6, _cs([C[0], C[1], "#2c2420"]), {"speed": 3.6 if big else 2.6, "up": 140.0, "grav": 520.0, "life": 0.7, "z": 4.0, "size": 2.0})
	# sparks streaking out
	_fling(x, y, 14 if big else 8, _cs([C[5], C[4], "#ffffff"]), {"speed": 6.0, "up": 60.0, "grav": 200.0, "life": 0.3, "z": 10.0, "streak": 3.0, "size": 1.0})
	# a column of smoke stands up off it
	_puffs(x, y, 0.3, 9 if big else 5, _cs(["#6a5048", "#4a3a36", "#33282a", "#221c1e"]), {"up": 46.0, "z": 10.0, "life": 1.2, "drift": 0.2})
	_glow(x, y, 60.0 + r * 20.0 if big else 50.0, 0.35)
	# an area blow: the ground bursts in jets all round the ring, never on the hero himself
	if big:
		var n := 4 + int(R(r))
		var a0 := _r() * TAU
		for i in n:
			var a := a0 + float(i) / n * TAU + _rnd(-0.2, 0.2)
			var d := r * _rnd(0.7, 0.95)
			var h := _rnd(30, 46)
			columns.append({"x": x + cos(a) * d, "y": y + sin(a) * d, "t": -i * 0.03, "dur": 0.4, "h": h, "w": 2.0, "word": "eruption"})


## AVALANCHE (Power and Frost): a slab of snow and ice smashing down (avalancheHit).
func avalanche_hit(x: float, y: float, dx: float, dy: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["avalanche"]
	fx.hold(0.08 if big else 0.05)
	_kick(6.0 if big else 4.0)
	var length := sqrt(dx * dx + dy * dy)
	if length == 0.0:
		length = 1.0
	var ux := dx / length
	var uy := dy / length
	_flash(x, y, 10.0, minf(1.4, r * 0.5) if big else 0.55, 0.12, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 1.0, 0.28, _cs([C[5], C[4], C[3]]), {"heavy": true})
	# a cone of snow blown out along the blow (all round, for a blast)
	var snow := _cs([C[5], C[5], C[4], C[3]])
	if big:
		_fling(x, y, 34, snow, {"speed": 5.0, "up": 40.0, "grav": 90.0, "life": 0.6, "z": 3.0, "r": r * 0.3})
	else:
		_fling(x, y, 26, snow, {"speed": 5.5, "up": 40.0, "grav": 90.0, "life": 0.55, "z": 6.0, "dx": ux, "dy": uy, "spread": 0.7})
	# blocks of ice tumbling after it, falling hard
	for i in (14 if big else 8):
		var a := _r() * TAU if big else atan2(uy, ux) + _rnd(-0.6, 0.6)
		var s := _rnd(1.5, 3.8)
		var z := _rnd(6, 14)
		var vz := _rnd(60, 130)
		var life := _rnd(0.5, 0.8)
		var col := _pick(_cs([C[4], C[3], C[2]]))
		_add(x, y, z, cos(a) * s, sin(a) * s, vz, life, col, 3.0, 520.0)
	# a cloud of powder hangs where it struck, drifting on
	_puffs(x, y, r * 0.6 if big else 0.4, 12 if big else 7, _cs([C[5], C[4], C[4], C[3]]), {"up": 14.0, "z": 2.0, "life": 1.1, "dx": 0.0 if big else ux * 0.8, "dy": 0.0 if big else uy * 0.8, "drift": 0.4})
	_glow(x, y, 44.0, 0.25)


## THUNDER (Power and Lightning), on each hit: what it strikes crackles violet (thunderHit).
func thunder_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["thunder"]
	_flash(x, y, 12.0, 0.9 if big else 0.45, 0.1, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.8, 0.2, _cs([C[5], C[4], C[3]]), {"jag": true, "heavy": true})
	_fling(x, y, 16 if big else 10, _cs([C[5], C[4], C[3]]), {"speed": 5.5, "up": 40.0, "grav": 120.0, "life": 0.25, "z": 12.0, "streak": 3.0, "size": 1.0})
	for i in (6 if big else 3):
		var a := _r() * TAU
		var d := r * _rnd(0.5, 1) if big else _rnd(0.5, 0.9)
		_bolt(x, y, x + cos(a) * d, y + sin(a) * d, C, {"w": 1, "dur": 0.14, "wob": 0.15})
	if big:
		thunder_bolt(x, y, true)


## THUNDER in front: ONE GREAT BOLT out of the sky in place of the arcs (thunderBolt).
func thunder_bolt(x: float, y: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["thunder"]
	_sky_bolt(x, y, C, {"top": 230.0 if big else 200.0, "w": 3, "dur": 0.3, "forks": 3, "wild": 11.0})
	# (a second, thinner, a breath after: the bolt strikes twice)
	_later(0.07, func(): _sky_bolt(x + _rnd(-0.15, 0.15), y + _rnd(-0.15, 0.15), C, {"top": 180.0, "w": 1, "dur": 0.16, "forks": 1}))
	fx.hold(0.1)
	_kick(7.0 if big else 5.5)
	_screen_flash(C[4], 0.24, 0.07)
	_flash(x, y, 6.0, 0.9, 0.14, _cs([C[5], C[5], C[4], C[3]]))
	_ring(x, y, 1.5, 0.32, _cs([C[5], C[4], C[3], C[2]]), {"jag": true, "heavy": true})
	_ring(x, y, 2.1, 0.45, _cs(["#6a6070", "#4a4250", "#2e2a36"]), {"delay": 0.04})
	_fling(x, y, 14, _cs(["#8a7c90", "#5a5060", C[2]]), {"speed": 3.4, "up": 150.0, "grav": 480.0, "life": 0.6, "z": 2.0, "size": 2.0})
	_fling(x, y, 18, _cs([C[5], C[4]]), {"speed": 7.0, "up": 30.0, "grav": 100.0, "life": 0.22, "z": 4.0, "streak": 4.0, "size": 1.0})
	for i in 5:
		var a := float(i) / 5 * TAU + _rnd(-0.3, 0.3)
		var dx := cos(a) * _rnd(1.2, 2.0)
		var dy := sin(a) * _rnd(1.2, 2.0)
		_bolt(x, y, x + dx, y + dy, C, {"w": 2, "dur": 0.2, "wob": 0.25, "z": 2.0})
	_scar("thunder", "star", x, y, 1.3, 2.4, 8)
	_glow(x, y, 110.0, 0.25)


## BLIGHT (Power and Poison): the hit is rot; what it strikes is marked to rot (blightHit).
func blight_hit(x: float, y: float, r: float, big: bool, m = null) -> void:
	var C: PackedColorArray = RAMP["blight"]
	fx.hold(0.06 if big else 0.04)
	_kick(4.5 if big else 3.0)
	_flash(x, y, 10.0, 0.9 if big else 0.55, 0.14, _cs([C[3], C[2], C[1], C[0]]))
	_ring(x, y, r if big else 0.9, 0.3, _cs([C[4], C[3], C[2], C[1]]), {"closing": true, "heavy": true})
	# a wave of dark rot running out low over the floor
	_ring(x, y, r * 1.3 if big else 1.4, 0.4, _cs([C[1], C[0], "#0a0c06"]), {"heavy": true, "delay": 0.04})
	_ring(x, y, r * 1.1 if big else 1.1, 0.26, _cs([C[2], C[1], C[0]]), {"fill": true})
	# a spatter of rot, heavy, falling and sticking
	_fling(x, y, 26 if big else 14, _cs([C[1], C[2], C[3], "#1a1408"]), {"speed": 4.0 if big else 2.8, "up": 80.0, "grav": 380.0, "life": 0.6, "z": 10.0, "size": 2.0})
	# ash and spores rising off it, slow
	var ash := _cs([C[4], C[3], C[2], C[1]])
	for i in (16 if big else 9):
		var life := _rnd(0.7, 1.3)
		var px := x + _rnd(-0.3, 0.3)
		var py := y + _rnd(-0.3, 0.3)
		var z := _rnd(6, 18)
		var vx := _rnd(-0.25, 0.25)
		var vy := _rnd(-0.25, 0.25)
		var vz := _rnd(8, 22)
		_add(px, py, z, vx, vy, vz, life, C[3], 1.0, -2.0, ash)
	if m != null:
		_mark(m["key"])["blight"] = true
	_glow(x, y, 30.0, 0.2)


## SCALD (Flame and Frost), on each hit: fire and ice twist round each other and boil (scaldHit).
func scald_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["scald"]
	var RR := r * 0.7 if big else 0.45
	_flash(x, y, 12.0, 0.8 if big else 0.42, 0.1, _cs([C[5], C[4], "#ffc24a"]))
	_ring(x, y, r if big else 0.75, 0.22, _cs(["#ffffff", "#ffc24a", "#58a8f0"]), {"swirl": true, "heavy": true})
	var n := 14 if big else 8
	var fire := _cs(["#fff0a0", "#ffc24a", "#ff8a2a"])
	var ice := _cs(["#ffffff", "#b0e0ff", "#58a8f0"])
	for i in n:
		for side in [1.0, -1.0]:
			var a := float(i) / n * TAU
			var sp := _rnd(1.4, 2.4)
			# (each goes round as it climbs: across the way out, one way for the fire, the other for the ice)
			var z := _rnd(4, 10)
			var vz := _rnd(40, 80)
			var life := _rnd(0.35, 0.55)
			var col := _pick(fire) if side > 0 else _pick(ice)
			_add(x + cos(a) * RR * 0.3, y + sin(a) * RR * 0.3, z, cos(a) * sp * 0.5 - sin(a) * sp * side, sin(a) * sp * 0.5 + cos(a) * sp * side, vz, life, col, 2.0, 60.0)
	_puffs(x, y, r * 0.5 if big else 0.25, 12 if big else 6, _cs([C[5], C[4], C[3], C[2]]), {"up": 50.0, "z": 8.0, "life": 0.9, "drift": 0.5})
	_fling(x, y, 10 if big else 6, _cs([C[5], "#ffffff"]), {"speed": 4.5, "up": 70.0, "grav": -20.0, "life": 0.3, "z": 10.0, "streak": 4.0, "size": 1.0})


## SCALD's twist in front: a burning enemy chilled, or a chilled one set burning, CRACKS (scaldCrack).
func scald_crack(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["scald"]
	fx.hold(0.08)
	_kick(4.5)
	_flash(x, y, 12.0, 0.9, 0.14, _cs(["#ffffff", C[4], "#ffc24a", "#ff8a2a"]))
	_ring(x, y, r * 1.4, 0.3, _cs(["#ffffff", C[4], C[3]]), {"heavy": true, "fill": true})
	_ring(x, y, r * 1.9, 0.38, _cs(["#b0e0ff", "#58a8f0", "#2e6cc8"]), {"jag": true, "delay": 0.04})
	# the shell of ice bursts
	_fling(x, y, 22, _cs(["#ffffff", "#b0e0ff", "#58a8f0"]), {"speed": 6.0, "up": 120.0, "grav": 420.0, "life": 0.6, "z": 12.0, "streak": 3.0, "size": 1.0})
	# jets of steam blasting out all round
	var steam := _cs([C[5], C[5], C[4], C[3]])
	for k in 7:
		var a := float(k) / 7 * TAU + _rnd(-0.2, 0.2)
		for i in 4:
			var life := _rnd(0.4, 0.7)
			var z := _rnd(8, 14)
			var vx := cos(a) * _rnd(3, 5.5)
			var vy := sin(a) * _rnd(3, 5.5)
			var vz := _rnd(20, 50)
			_add(x, y, z, vx, vy, vz, life, C[5], 3.0, -30.0, steam)
	# scalding drops raining down
	_fling(x, y, 14, _cs(["#ffc24a", "#ff8a2a", C[4]]), {"speed": 2.6, "up": 160.0, "grav": 460.0, "life": 0.75, "z": 14.0, "size": 1.0})
	_puffs(x, y, 0.6, 12, _cs([C[5], C[4], C[3], C[2]]), {"up": 60.0, "z": 10.0, "life": 1.2, "drift": 0.6})
	_glow(x, y, 60.0, 0.3)


## WILDFIRE (Flame and Lightning), on each hit: fire that crackles like lightning (wildfireHit).
func wildfire_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["wildfire"]
	_flash(x, y, 10.0, 0.9 if big else 0.5, 0.1, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.85, 0.22, _cs([C[5], C[4], C[3], C[2]]), {"jag": true, "heavy": big})
	fx.flames(x, y, r * 0.7 if big else 0.3, 18 if big else 8, 1.3)
	for i in (7 if big else 4):
		var a := _r() * TAU
		var d := r * _rnd(0.6, 1.1) if big else _rnd(0.7, 1.2)
		_bolt(x, y, x + cos(a) * d, y + sin(a) * d, C, {"w": 2, "dur": 0.2, "kind": "fire", "wob": 0.2})
	_fling(x, y, 16 if big else 9, _cs([C[5], C[4], C[3]]), {"speed": 5.0, "up": 100.0, "grav": 180.0, "life": 0.45, "z": 10.0, "streak": 2.0, "size": 1.0})
	_glow(x, y, 70.0 if big else 40.0, 0.25)


## FUMES (Flame and Poison), on each hit: it smokes (fumesHit).
func fumes_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["fumes"]
	_flash(x, y, 10.0, 0.7 if big else 0.4, 0.1, _cs([C[5], C[4], "#ff8a2a"]))
	_ring(x, y, r if big else 0.8, 0.28, _cs([C[4], C[3], C[2]]), {"fill": true})
	_puffs(x, y, r * 0.6 if big else 0.3, 16 if big else 8, _cs([C[3], C[2], C[1], "#2a2418"]), {"up": 36.0, "z": 8.0, "life": 1.1, "drift": 0.5})
	_fling(x, y, 10 if big else 6, _cs(["#ffc24a", "#ff8a2a", C[4]]), {"speed": 3.0, "up": 70.0, "grav": 100.0, "life": 0.5, "z": 10.0, "size": 1.0})
	_fling(x, y, 12 if big else 6, _cs([C[4], C[3]]), {"speed": 2.2, "up": 60.0, "grav": 300.0, "life": 0.5, "z": 10.0, "size": 2.0})


## FUMES' twist in front: a burning, poisoned enemy gives off a toxic cloud (fumesCloud).
func fumes_cloud(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["fumes"]
	_ring(x, y, r, 0.45, _cs([C[4], C[3], C[2], C[1]]), {"fill": true, "heavy": true})
	_puffs(x, y, 0.3, 14, _cs([C[4], C[3], C[2], C[1]]), {"up": 70.0, "z": 10.0, "life": 1.3, "drift": 0.3})
	_puffs(x, y, r * 0.8, 10, _cs([C[3], C[2], C[1], "#221c10"]), {"up": 20.0, "z": 2.0, "life": 1.4, "drift": 0.6})
	_fling(x, y, 8, _cs(["#ffc24a", "#ff8a2a"]), {"speed": 1.5, "up": 90.0, "grav": 40.0, "life": 0.8, "z": 8.0, "size": 1.0})


## HAILSTORM (Frost and Lightning), on each hit: ice-white lightning and hail (hailHit).
func hail_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["hailstorm"]
	_flash(x, y, 12.0, 0.8 if big else 0.45, 0.1, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.8, 0.22, _cs([C[5], C[4], C[3]]), {"jag": true, "heavy": true})
	hail_down(x, y, r * 0.8 if big else 0.5, 12 if big else 6)
	_fling(x, y, 14 if big else 8, _cs(["#ffffff", C[4], "#b0e0ff"]), {"speed": 4.5, "up": 110.0, "grav": 400.0, "life": 0.5, "z": 12.0, "streak": 3.0, "size": 1.0})
	for i in (4 if big else 2):
		var a := _r() * TAU
		var dx := cos(a) * _rnd(0.6, 1.1)
		var dy := sin(a) * _rnd(0.6, 1.1)
		_bolt(x, y, x + dx, y + dy, C, {"w": 1, "dur": 0.15, "kind": "ice"})


## Hailstones coming down round (x, y) within `r` (hailDown).
func hail_down(x: float, y: float, r: float, n: int) -> void:
	for i in n:
		var a := _r() * TAU
		var d := sqrt(_r()) * r
		var x1 := x + cos(a) * d
		var y1 := y + sin(a) * d
		var x0 := x1 + _rnd(-0.1, 0.1)
		var y0 := y1 + _rnd(-0.1, 0.1)
		var t := -_rnd(0, 0.15)
		var dur := _rnd(0.16, 0.24)
		var h := _rnd(50, 80)
		bombs.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "t": t, "dur": dur, "h": h, "word": "hailstorm"})
	if bombs.size() > 120:
		bombs = bombs.slice(bombs.size() - 120)


## FROSTBITE (Frost and Poison), on each hit: jaws of ice close on what it strikes and bite (frostbiteHit).
func frostbite_hit(x: float, y: float, r: float, big: bool, m = null) -> void:
	var C: PackedColorArray = RAMP["frostbite"]
	_flash(x, y, 12.0, 0.7 if big else 0.4, 0.1, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.7, 0.24, _cs([C[5], C[4], C[3]]), {"closing": true, "heavy": true})
	if m != null:
		clamps.append({"id": m["key"], "t": 0.0, "dur": 0.42, "big": true, "at": null})
	_fling(x, y, 12 if big else 7, _cs(["#ffffff", C[4], C[3]]), {"speed": 3.5, "up": 90.0, "grav": 380.0, "life": 0.45, "z": 12.0, "streak": 2.0, "size": 1.0})
	_puffs(x, y, r * 0.5 if big else 0.3, 8 if big else 3, _cs([C[4], "#9ad0c0", "#6aa890", C[2]]), {"up": 12.0, "z": 6.0, "life": 1.0, "drift": 0.4})
	_fling(x, y, 8 if big else 4, _cs(["#b4cc24", "#7c9416"]), {"speed": 1.2, "up": 20.0, "grav": 300.0, "life": 0.5, "z": 12.0, "size": 1.0})


## CONTAGION (Lightning and Poison), on each hit: sick green lightning (contagionHit).
func contagion_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["contagion"]
	_flash(x, y, 12.0, 0.8 if big else 0.45, 0.1, _cs([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.8, 0.22, _cs([C[4], C[3], C[2]]), {"jag": true, "heavy": true})
	spores(x, y, r * 0.6 if big else 0.3, 14 if big else 8)
	_fling(x, y, 12 if big else 8, _cs([C[5], C[4], C[3]]), {"speed": 5.0, "up": 40.0, "grav": 120.0, "life": 0.25, "z": 12.0, "streak": 3.0, "size": 1.0})
	for i in (5 if big else 2):
		var a := _r() * TAU
		var dx := cos(a) * _rnd(0.6, 1.0)
		var dy := sin(a) * _rnd(0.6, 1.0)
		_bolt(x, y, x + dx, y + dy, C, {"w": 1, "dur": 0.14})


## Contagion's spores: green bubbles that swell as they rise and pop (spores).
func spores(x: float, y: float, r: float, n: int) -> void:
	var C: PackedColorArray = RAMP["contagion"]
	var ramp := _cs([C[4], C[3], C[3], C[2]])
	for i in n:
		var a := _r() * TAU
		var d := sqrt(_r()) * r
		var life := _rnd(0.5, 1.0)
		var z := _rnd(4, 14)
		var vx := _rnd(-0.4, 0.4)
		var vy := _rnd(-0.4, 0.4)
		var vz := _rnd(10, 30)
		var size := 3.0 if _r() < 0.4 else 2.0
		_add(x + cos(a) * d, y + sin(a) * d, z, vx, vy, vz, life, C[3], size, -6.0, ramp)


## Each word's hit (hitLook).
func hit_look(word: String, x: float, y: float, r: float, big: bool) -> void:
	var h: Dictionary = view.get("hero", {"x": x, "y": y})
	var m = null if big else _struck_at(x, y)
	match word:
		"eruption":
			eruption_hit(x, y, r, big)
		"avalanche":
			avalanche_hit(x, y, x - h["x"], y - h["y"], r, big)
		"thunder":
			thunder_hit(x, y, r, big)
		"blight":
			blight_hit(x, y, r, big, m)
		"scald":
			scald_hit(x, y, r, big)
		"wildfire":
			wildfire_hit(x, y, r, big)
		"fumes":
			fumes_hit(x, y, r, big)
		"hailstorm":
			hail_hit(x, y, r, big)
		"frostbite":
			frostbite_hit(x, y, r, big, m)
		_:
			contagion_hit(x, y, r, big)


# =====================================================================================================================
# THE TWISTS: the bolts and blasts the rules call up.

## A melded word's arc (arcLook): Thunder's bolt from the sky; Wildfire's, Hailstorm's and Contagion's arcs; any other's plain.
func arc_look(word: String, e: Dictionary, from_zone: bool) -> void:
	var C: PackedColorArray = RAMP.get(word, RAMP["thunder"])
	var x0: float = e["x0"]
	var y0: float = e["y0"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	if word == "thunder":
		if from_zone:
			# the thunderhead strikes: a heavy violet bolt, a burnt star
			_sky_bolt(x1, y1, C, {"top": 70.0, "w": 2, "dur": 0.2, "forks": 2})
			_flash(x1, y1, 6.0, 0.55, 0.1, _cs([C[5], C[4], C[3]]))
			_ring(x1, y1, 0.8, 0.2, _cs([C[5], C[4], C[3]]), {"jag": true})
			_fling(x1, y1, 8, _cs([C[5], C[4]]), {"speed": 4.0, "up": 40.0, "grav": 140.0, "life": 0.25, "z": 4.0, "streak": 3.0, "size": 1.0})
			_scar("thunder", "star", x1, y1, 0.6, 1.4, 6)
			_kick(2.5)
			_glow(x1, y1, 60.0, 0.18)
		else:
			thunder_bolt(x1, y1, false)
		return
	if e.get("sky", false):
		# (an arcing word's first bolt comes down on the one it hits, in its own colours)
		_sky_bolt(x1, y1, C, {"top": 130.0, "w": 2, "dur": 0.2, "forks": 2})
		_flash(x1, y1, 6.0, 0.5, 0.1, _cs([C[5], C[4], C[3]]))
		if word == "hailstorm":
			hail_down(x1, y1, 0.6, 7)
			if from_zone:
				_ring(x1, y1, 0.7, 0.2, _cs([C[5], C[4]]), {"jag": true})
		if word == "wildfire":
			fx.flames(x1, y1, 0.3, 6, 1.2)
		if word == "contagion":
			spores(x1, y1, 0.3, 6)
		_glow(x1, y1, 50.0, 0.18)
		return
	if word == "wildfire":
		# burning lightning: thick, and fire left along its way
		_bolt(x0, y0, x1, y1, C, {"w": 2, "dur": 0.26, "kind": "fire", "wob": 0.35})
		var n := maxi(3, int(R(sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) * 2.5)))
		for i in range(1, n + 1):
			var k := float(i) / (n + 1)
			_later(k * 0.12, func(): fx.flames(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, 0.12, 2, 1.1))
		_flash(x1, y1, 10.0, 0.4, 0.1, _cs([C[5], C[4], C[3]]))
		fx.flames(x1, y1, 0.3, 6, 1.3)
		_fling(x1, y1, 8, _cs([C[5], C[4]]), {"speed": 4.0, "up": 80.0, "grav": 180.0, "life": 0.35, "z": 10.0, "streak": 2.0, "size": 1.0})
		_glow(x1, y1, 44.0, 0.2)
	elif word == "hailstorm":
		# ice-white lightning, crystals along it, hail where it lands
		_bolt(x0, y0, x1, y1, C, {"w": 2, "dur": 0.24, "kind": "ice", "wob": 0.3})
		_flash(x1, y1, 10.0, 0.45, 0.1, _cs([C[5], C[4], C[3]]))
		hail_down(x1, y1, 0.45, 5)
		_fling(x1, y1, 8, _cs(["#ffffff", C[4]]), {"speed": 3.5, "up": 90.0, "grav": 380.0, "life": 0.4, "z": 10.0, "streak": 2.0, "size": 1.0})
	elif word == "contagion":
		# sick green lightning; spores burst where it lands, and a ring closes on it: it has caught it
		_bolt(x0, y0, x1, y1, C, {"w": 2, "dur": 0.24, "wob": 0.35})
		_flash(x1, y1, 10.0, 0.45, 0.1, _cs([C[5], C[4], C[3]]))
		_ring(x1, y1, 0.7, 0.3, _cs([C[4], C[3], C[2]]), {"closing": true})
		spores(x1, y1, 0.3, 8)
	else:
		_bolt(x0, y0, x1, y1, C, {"w": 1, "dur": 0.18})


## ERUPTION behind, at full heat: the next hit ERUPTS (eruptionBlast).
func eruption_blast(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["eruption"]
	fx.hold(0.12)
	_kick(8.0)
	_screen_flash(C[4], 0.16, 0.07)
	_flash(x, y, 4.0, 1.6, 0.16, _cs([C[5], C[5], C[4], C[3]]))
	_ring(x, y, r, 0.36, _cs([C[5], C[4], C[3], C[2]]), {"heavy": true, "fill": true})
	_ring(x, y, r * 1.35, 0.5, _cs(["#6a5048", "#4a3a36", "#2a2220"]), {"heavy": true, "delay": 0.06})
	_scar("eruption", "fissure", x, y, r * 0.95, 3.2, 9)
	columns.append({"x": x, "y": y, "t": 0.0, "dur": 0.6, "h": 110.0, "w": 6.0, "word": "eruption"})
	for i in 12:
		var a := float(i) / 12 * TAU + _rnd(-0.25, 0.25)
		var d := r * _rnd(0.5, 1.15)
		var t := -_rnd(0, 0.12)
		var dur := _rnd(0.55, 0.85)
		var h := _rnd(60, 110)
		bombs.append({"x0": x, "y0": y, "x1": x + cos(a) * d, "y1": y + sin(a) * d, "t": t, "dur": dur, "h": h, "word": "eruption"})
	var lava := _cs([C[5], C[4], C[4], C[3], C[2], C[1]])
	for i in 26:
		var a := _r() * TAU
		var s := _rnd(1, 5)
		var life := _rnd(0.6, 1.0)
		var z := _rnd(4, 14)
		var vz := _rnd(150, 280)
		var size := 3.0 if _r() < 0.5 else 2.0
		_add(x, y, z, cos(a) * s, sin(a) * s, vz, life, C[4], size, 420.0, lava)
	_fling(x, y, 16, _cs([C[0], C[1], "#2c2420"]), {"speed": 4.5, "up": 160.0, "grav": 520.0, "life": 0.8, "z": 4.0, "size": 3.0})
	_puffs(x, y, r * 0.4, 16, _cs(["#7a5a50", "#55403a", "#3a2c2a", "#241c1e"]), {"up": 60.0, "z": 14.0, "life": 1.6, "drift": 0.4})
	_glow(x, y, 140.0, 0.5)


## THUNDER behind: every few hits a THUNDERCLAP round the hero (thunderClap).
func thunder_clap(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["thunder"]
	fx.hold(0.1)
	_kick(7.0)
	_screen_flash(C[5], 0.24, 0.08)
	_flash(x, y, 16.0, 1.3, 0.14, _cs([C[5], C[5], C[4], C[3]]))
	_ring(x, y, r, 0.3, _cs([C[5], C[4], C[3], C[2]]), {"jag": true, "heavy": true})
	_ring(x, y, r * 0.7, 0.26, _cs([C[5], C[4], C[3]]), {"jag": true, "delay": 0.05})
	_ring(x, y, r * 1.2, 0.42, _cs(["#8a7c90", "#5a5060", "#3a3444"]), {"delay": 0.08})
	var n := 7
	for i in n:
		var a := float(i) / n * TAU + _rnd(-0.2, 0.2)
		var bx := x + cos(a) * r * _rnd(0.65, 0.95)
		var by := y + sin(a) * r * _rnd(0.65, 0.95)
		_later(i * 0.025, func():
			_sky_bolt(bx, by, C, {"top": 140.0, "w": 2, "dur": 0.2, "forks": 1})
			_flash(bx, by, 4.0, 0.4, 0.1, _cs([C[5], C[4]]))
			_fling(bx, by, 5, _cs(["#8a7c90", "#5a5060", C[3]]), {"speed": 2.5, "up": 110.0, "grav": 460.0, "life": 0.5, "z": 2.0, "size": 2.0})
			_scar("thunder", "star", bx, by, 0.55, 1.6, 5))
		_bolt(x, y, x + cos(a) * r, y + sin(a) * r, C, {"w": 2, "dur": 0.22, "wob": 0.3, "z": 6.0})
	_glow(x, y, 130.0, 0.35)


## FUMES behind: the cloud EXPLODES when anything burning comes into it (fumesBlast).
func fumes_blast(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["fumes"]
	fx.hold(0.1)
	_kick(6.5)
	_screen_flash(Color("#ffc24a"), 0.16, 0.08)
	_flash(x, y, 8.0, minf(1.8, r * 0.7), 0.16, _cs(["#ffffff", "#fff0a0", "#ffc24a", "#ff8a2a"]))
	_ring(x, y, r, 0.34, _cs(["#fff0a0", "#ffc24a", "#ff8a2a", "#a82810"]), {"heavy": true, "fill": true})
	_ring(x, y, r * 1.4, 0.45, _cs([C[3], C[2], C[1]]), {"heavy": true, "delay": 0.05})
	fx.flames(x, y, r * 0.8, 30, 1.6)
	# the fireball rolls up into a mushroom of smoke: a column, then a cap spreading at the top
	_puffs(x, y, 0.4, 14, _cs(["#ffc24a", "#ff8a2a", C[2], C[1], "#221c10"]), {"up": 90.0, "z": 12.0, "life": 1.2, "drift": 0.2})
	_later(0.35, func():
		var cap := _cs([C[3], C[2], C[1], "#221c10"])
		for i in 14:
			var a := float(i) / 14 * TAU
			var life := _rnd(1.0, 1.5)
			var z := _rnd(50, 62)
			var vx := cos(a) * _rnd(0.8, 1.4)
			var vy := sin(a) * _rnd(0.8, 1.4)
			var vz := _rnd(4, 12)
			_add(x + cos(a) * 0.3, y + sin(a) * 0.3, z, vx, vy, vz, life, C[2], 3.0, -2.0, cap))
	_fling(x, y, 24, _cs(["#fff0a0", "#ffc24a", "#ff8a2a"]), {"speed": 5.5, "up": 130.0, "grav": 260.0, "life": 0.8, "z": 10.0, "size": 1.0})
	_glow(x, y, 120.0, 0.4)


## What a melded word behind (or a twist in front) lays on the ground, the moment it is laid (laidLook).
func laid_look(look: String, x: float, y: float, r: float) -> void:
	var small := r < 1.2
	var k := 0.5 if small else 1.0
	var n := func(v: float) -> int: return maxi(1, int(R(v * k * (fx.room() if small else 1.0))))
	if look == "molten":
		var C: PackedColorArray = RAMP["eruption"]
		_ring(x, y, r, 0.35, _cs([C[5], C[4], C[3]]), {"fill": true})
		_fling(x, y, n.call(10), _cs([C[5], C[4], C[3]]), {"speed": 1.6, "up": 90.0, "grav": 380.0, "life": 0.5, "z": 2.0, "size": 2.0})
		_puffs(x, y, r * 0.6, n.call(5), _cs(["#6a5048", "#4a3a36", "#33282a"]), {"up": 30.0, "z": 4.0, "life": 1.0})
	elif look == "snow":
		var C: PackedColorArray = RAMP["avalanche"]
		_ring(x, y, r, 0.3, _cs([C[5], C[4], C[3]]), {"fill": true})
		_puffs(x, y, r * 0.8, n.call(10), _cs([C[5], C[4], C[4], C[3]]), {"up": 12.0, "z": 2.0, "life": 1.0, "drift": 0.5})
		for i in n.call(6):
			var a := _r() * TAU
			var x1 := x + cos(a) * r * _rnd(0.8, 1)
			var y1 := y + sin(a) * r * _rnd(0.8, 1)
			var tall := _rnd(3, 7)
			var dur := _rnd(0.5, 0.8)
			_spike(x + cos(a) * r * 0.3, y + sin(a) * r * 0.3, x1, y1, tall, dur)
	elif look == "thunderhead" or look == "hail" or look == "greenstorm":
		var word := "thunder" if look == "thunderhead" else ("hailstorm" if look == "hail" else "contagion")
		var C: PackedColorArray = RAMP[word]
		_flash(x, y, 36.0 if small else 50.0, 0.4 if small else 0.7, 0.1, _cs([C[5], C[4], C[3]]))
		_ring(x, y, r, 0.3, _cs([C[4], C[3], C[2]]), {"jag": true})
		if look == "hail":
			hail_down(x, y, r * 0.8, n.call(8))
	elif look == "rot":
		var C: PackedColorArray = RAMP["blight"]
		_ring(x, y, r, 0.45, _cs([C[3], C[2], C[1]]), {"fill": true})
		_ring(x, y, r * 0.8, 0.4, _cs([C[4], C[3]]), {"closing": true, "delay": 0.05})
		_puffs(x, y, r * 0.7, n.call(8), _cs([C[3], C[2], C[1], C[0]]), {"up": 10.0, "z": 2.0, "life": 1.2})
	elif look == "boil":
		var C: PackedColorArray = RAMP["scald"]
		_ring(x, y, r, 0.35, _cs([C[5], C[4], C[3]]), {"fill": true, "heavy": not small})
		_puffs(x, y, r * 0.7, n.call(14), _cs([C[5], C[4], C[3], C[2]]), {"up": 70.0, "z": 2.0, "life": 1.0, "drift": 0.5})
		_fling(x, y, n.call(10), _cs(["#ffffff", C[4]]), {"speed": 3.0, "up": 100.0, "grav": -30.0, "life": 0.4, "z": 2.0, "streak": 4.0, "size": 1.0})
	elif look == "wildfire":
		var C: PackedColorArray = RAMP["wildfire"]
		fx.flames(x, y, r * 0.8, n.call(12), 1.3)
		for i in n.call(4):
			var a := _r() * TAU
			var b := a + _rnd(1.5, 3)
			_bolt(x + cos(a) * r * 0.8, y + sin(a) * r * 0.8, x + cos(b) * r * 0.8, y + sin(b) * r * 0.8, C, {"w": 1, "dur": 0.18, "kind": "fire", "z": 4.0})
	elif look == "smoulder":
		var C: PackedColorArray = RAMP["fumes"]
		fx.flames(x, y, r * 0.7, n.call(6), 0.8)
		_puffs(x, y, r * 0.7, n.call(8), _cs([C[2], C[1], "#2a2418", "#1a160e"]), {"up": 30.0, "z": 4.0, "life": 1.2})
	elif look == "fumes":
		fumes_cloud(x, y, r)
	elif look == "toxicice":
		var C: PackedColorArray = RAMP["frostbite"]
		_ring(x, y, r, 0.3, _cs([C[5], C[4], "#9ad23a"]), {"fill": true})
		for i in n.call(7):
			var a := _r() * TAU
			var x1 := x + cos(a) * r * _rnd(0.85, 1.05)
			var y1 := y + sin(a) * r * _rnd(0.85, 1.05)
			var tall := _rnd(4, 8)
			var dur := _rnd(0.5, 0.8)
			_spike(x + cos(a) * r * 0.4, y + sin(a) * r * 0.4, x1, y1, tall, dur)
		_puffs(x, y, r * 0.6, n.call(6), _cs(["#9ad0c0", "#6aa890", C[2]]), {"up": 8.0, "z": 2.0, "life": 1.0})
	elif look == "coldmist":
		var C: PackedColorArray = RAMP["frostbite"]
		_ring(x, y, r, 0.4, _cs([C[4], "#9ad0c0", C[3]]), {"fill": true})
		_puffs(x, y, r * 0.8, n.call(10), _cs(["#cfe8e8", "#9ad0c0", "#6aa890", C[2]]), {"up": 6.0, "z": 2.0, "life": 1.3, "drift": 0.6})
	elif look == "crackle":
		var C: PackedColorArray = RAMP["contagion"]
		_ring(x, y, r, 0.35, _cs([C[4], C[3], C[2]]), {"fill": true, "jag": true})
		spores(x, y, r * 0.8, n.call(10))
		for i in n.call(4):
			var a := _r() * TAU
			var b := a + _rnd(1.5, 3)
			_bolt(x + cos(a) * r * 0.7, y + sin(a) * r * 0.7, x + cos(b) * r * 0.7, y + sin(b) * r * 0.7, C, {"w": 1, "dur": 0.16, "z": 8.0})


## Avalanche in front: the picture of what it shoved slides to where the rules put it, leaving a furrow of snow; one stopped
## short freezes with a crash (shoved). `key`: the monster's.
func shoved(e: Dictionary, key) -> void:
	var C: PackedColorArray = RAMP["avalanche"]
	var x: float = e["x"]
	var y: float = e["y"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	var d := sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y))
	var dur := 0.2 + d * 0.06
	slides.append({"id": key, "x0": x, "y0": y, "x1": x1, "y1": y1, "t": 0.0, "dur": dur, "frozen": bool(e.get("frozen", false))})
	if d > 0.15:
		var s := _scar("avalanche", "furrow", x, y, d, 2.4, 0)
		s["lines"] = [PackedFloat64Array([x1 - x, y1 - y])]
	if e.get("frozen", false):
		_later(dur, func():
			# it comes up against something and freezes where it stands, with a crash
			_kick(4.0)
			_flash(x1, y1, 12.0, 0.7, 0.12, _cs([C[5], C[4], "#b0e0ff"]))
			_ring(x1, y1, 1.0, 0.26, _cs([C[5], C[4], C[3]]), {"heavy": true})
			for i in 8:
				var a := float(i) / 8 * TAU + _rnd(-0.2, 0.2)
				var sx1 := x1 + cos(a) * _rnd(0.7, 1.0)
				var sy1 := y1 + sin(a) * _rnd(0.7, 1.0)
				var tall := _rnd(5, 10)
				var sdur := _rnd(0.6, 0.9)
				_spike(x1 + cos(a) * 0.2, y1 + sin(a) * 0.2, sx1, sy1, tall, sdur)
			_fling(x1, y1, 14, _cs(["#ffffff", C[4], C[3]]), {"speed": 4.0, "up": 110.0, "grav": 420.0, "life": 0.5, "z": 10.0, "streak": 3.0, "size": 1.0})
			_puffs(x1, y1, 0.4, 8, _cs([C[5], C[4], C[3]]), {"up": 16.0, "z": 4.0, "life": 0.9}))


## Avalanche behind: a hit on a chilled enemy crushes it, harder: ice cracks in on it (crushed).
func crushed(e: Dictionary, key) -> void:
	var C: PackedColorArray = RAMP["avalanche"]
	var k := _mark(key)
	if k["crush"] < 0.12:
		return
	k["crush"] = 0.0
	var x: float = e["x"]
	var y: float = e["y"]
	fx.hold(0.05)
	_kick(3.0)
	_flash(x, y, 12.0, 0.55, 0.1, _cs([C[5], C[4], C[3]]))
	_ring(x, y, 0.9, 0.22, _cs([C[5], C[4], C[3]]), {"closing": true, "heavy": true})
	for i in 6:
		var a := float(i) / 6 * TAU + _rnd(-0.3, 0.3)
		var tall := _rnd(4, 8)
		var dur := _rnd(0.4, 0.6)
		_spike(x + cos(a) * 0.9, y + sin(a) * 0.9, x + cos(a) * 0.3, y + sin(a) * 0.3, tall, dur)
	_fling(x, y, 10, _cs(["#ffffff", C[4]]), {"speed": 3.5, "up": 90.0, "grav": 420.0, "life": 0.45, "z": 12.0, "streak": 2.0, "size": 1.0})


## Each word on the blade or the hand as a move leaves him: a little of what it will be (carryLook).
func carry_look(word: String, x: float, y: float, dx: float, dy: float) -> void:
	var C: PackedColorArray = RAMP[word]
	var o := {"speed": 2.4, "up": 50.0, "grav": 160.0, "life": 0.4, "z": 12.0, "dx": dx, "dy": dy, "spread": 1.0, "r": 0.2}
	match word:
		"eruption":
			_fling(x, y, 7, _cs([C[5], C[4], C[3]]), o.merged({"grav": 380.0, "up": 80.0, "size": 2.0}, true))
		"avalanche":
			_fling(x, y, 8, _cs([C[5], C[4]]), o.merged({"grav": 60.0, "up": 20.0}, true))
		"thunder":
			_fling(x, y, 7, _cs([C[5], C[4], C[3]]), o.merged({"speed": 5.0, "streak": 3.0, "grav": 0.0, "life": 0.2}, true))
		"blight":
			_fling(x, y, 6, _cs([C[3], C[2], C[1]]), o.merged({"grav": 300.0}, true))
		"scald":
			_puffs(x, y, 0.2, 4, _cs([C[5], C[4], C[3]]), {"up": 40.0, "z": 12.0, "life": 0.6})
		"wildfire":
			fx.flames(x, y, 0.15, 3, 1.2)
			_fling(x, y, 5, _cs([C[5], C[4]]), o.merged({"speed": 4.0, "streak": 2.0, "grav": 60.0, "life": 0.25}, true))
		"fumes":
			_puffs(x, y, 0.2, 4, _cs([C[3], C[2], C[1]]), {"up": 30.0, "z": 12.0, "life": 0.7})
		"hailstorm":
			_fling(x, y, 7, _cs(["#ffffff", C[4], C[3]]), o.merged({"grav": 420.0, "up": 60.0, "streak": 2.0}, true))
		"frostbite":
			_puffs(x, y, 0.2, 4, _cs([C[4], "#9ad0c0", C[2]]), {"up": 10.0, "z": 12.0, "life": 0.6})
		_:
			spores(x, y, 0.2, 5)


# =====================================================================================================================
# THE PAINTER'S PEN (the game's canvas: fillStyle, globalAlpha, fillRect, an ellipse filled, pline): each dot where the game
# lays it; recorded instead, for the check.

func _style(col: Color) -> void:
	_fs = col


## (the canvas leaves a strength out of 0 to 1 unset, keeping the last)
func _alpha(a: float) -> void:
	if a >= 0.0 and a <= 1.0:
		_ga = a


func _fr(c, x: float, y: float, w: float, h: float) -> void:
	if w < 0.0:
		x += w
		w = -w
	if h < 0.0:
		y += h
		h = -h
	if _rec != null:
		var v := "%s@%d" % [_fs.to_html(false), int(R(_ga * 1000.0))]
		var j := 0.0
		while j < h:
			var i := 0.0
			while i < w:
				_rec["%s,%s" % [_k(x + i), _k(y + j)]] = v
				i += 1.0
			j += 1.0
		return
	if _ga <= 0.0:
		return
	c.draw_rect(Rect2(x * 2.0, y * 2.0, w * 2.0, h * 2.0), Color(_fs, _ga))


## An ellipse round (cx, cy), filled in the pen's colour (g.ellipse and fill).
func _el(c, cx: float, cy: float, rx: float, ry: float) -> void:
	if _ovals != null:
		_ovals.append("%d,%d,%d,%d,%s@%d" % [int(R(cx * 1000.0)), int(R(cy * 1000.0)), int(R(rx * 1000.0)), int(R(ry * 1000.0)), _fs.to_html(false), int(R(_ga * 1000.0))])
		return
	if _ga <= 0.0:
		return
	fx.oval(c, cx, cy, rx, ry, Color(_fs, _ga))


## A one-pixel line (pline): its colour is the pen's from then on.
func _pl(c, x0f: float, y0f: float, x1f: float, y1f: float, col: Color) -> void:
	_fs = col
	if _rec == null:
		if _ga > 0.0:
			fx.pline(c, x0f, y0f, x1f, y1f, Color(col, _ga))
		return
	var x0 := int(R(x0f))
	var y0 := int(R(y0f))
	var x1 := int(R(x1f))
	var y1 := int(R(y1f))
	var dx := absi(x1 - x0)
	var dy := -absi(y1 - y0)
	var sx := 1 if x0 < x1 else -1
	var sy := 1 if y0 < y1 else -1
	var err := dx + dy
	var v := "%s@%d" % [col.to_html(false), int(R(_ga * 1000.0))]
	for n in 500:
		_rec["%d,%d" % [x0, y0]] = v
		if x0 == x1 and y0 == y1:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			x0 += sx
		if e2 <= dx:
			err += dx
			y0 += sy


## A line `w` pixels thick (thick).
func _thick(c, x0: float, y0: float, x1: float, y1: float, col: Color, w: int) -> void:
	for i in w:
		var o := i - floori((w - 1) / 2.0)
		_pl(c, x0 + o, y0, x1 + o, y1, col)


## A patch's floor oval (ellipse).
func _ellipse(c, cx: float, cy: float, r: float, col: Color, alpha: float, squash := 1.0) -> void:
	if alpha <= 0.0:
		return
	_alpha(minf(1.0, alpha))
	_style(col)
	_el(c, cx, cy, maxf(0.5, r * 22.6), maxf(0.5, r * 11.3 * squash))
	_alpha(1.0)


## Dots round a ring of radius r tiles (rim).
func _rim(c, cx: float, cy: float, r: float, col: Color, gap := 2, from := 0.0, sweep := TAU) -> void:
	var n := maxi(8, int(R(r * 46.0)))
	_style(col)
	var i := 0
	while i < n:
		var a := from + float(i) / n * sweep
		_fr(c, R(cx + cos(a) * r * 22.6), R(cy + sin(a) * r * 11.3), 1, 1)
		i += gap


## A web of lines on the floor (web).
func _web(c, x: float, y: float, lines: Array, dark: Color, hot: Color, lit: float, alpha: float) -> void:
	_alpha(alpha)
	for pts: PackedFloat64Array in lines:
		var i := 0
		while i + 3 < pts.size():
			var x0 := _wx(x + pts[i], y + pts[i + 1])
			var y0 := _wy(x + pts[i], y + pts[i + 1])
			var x1 := _wx(x + pts[i + 2], y + pts[i + 3])
			var y1 := _wy(x + pts[i + 2], y + pts[i + 3])
			_pl(c, x0, y0 + 1, x1, y1 + 1, dark)
			if lit > 0.0 and i / 2.0 < (pts.size() / 2.0 - 1.0) * lit + 0.5:
				_pl(c, x0, y0, x1, y1, hot)
			i += 2
	_alpha(1.0)


static func _fade_of(z: Dictionary) -> float:
	return minf(1.0, minf(float(z["t"]) / 0.2, (float(z["dur"]) - float(z["t"])) * 2.0))


## Things worked out once for a patch (shapeOf): where its cracks run, where its drifts lie; kept in the patch itself.
func shape_of(z: Dictionary) -> Dictionary:
	var s = z.get("m3")
	if s != null:
		return s
	var seed: int = int(z["m3seed"]) if z.has("m3seed") else int(floorf(_r() * 1e6))
	var zr: float = z["r"]
	var lines: Array = []
	var n := 4 if zr < 1.2 else 7
	var a0 := _h(seed, 1) * TAU
	for k in n:
		var a := a0 + float(k) / n * TAU + (_h(seed, k, 2) - 0.5) * 0.6
		var pts := PackedFloat64Array([cos(a) * zr * 0.15, sin(a) * zr * 0.15])
		for i in range(1, 4):
			var d := zr * (0.15 + 0.27 * i) * (0.85 + _h(seed, k, i + 3) * 0.2)
			var j := (_h(seed, k * 5 + i, 4) - 0.5) * zr * 0.25
			pts.append(cos(a) * d - sin(a) * j)
			pts.append(sin(a) * d + cos(a) * j)
		lines.append(pts)
	var spots := PackedFloat64Array()
	var m := 4 if zr < 1.2 else 9
	for i in m:
		var a := _h(seed, i, 7) * TAU
		var d := sqrt(_h(seed, i, 8)) * zr * 0.82
		spots.append(cos(a) * d)
		spots.append(sin(a) * d)
	s = {"seed": seed, "lines": lines, "spots": spots}
	z["m3"] = s
	return s


# =====================================================================================================================
# ON THE FLOOR (floorM3): each melded patch, the scars, Blight's brand under what it marked, Eruption's heat at his feet.

func draw_floor(c) -> void:
	if view.is_empty():
		return
	var t := clock
	for z: Dictionary in view["zones"]:
		var look := look_of(z)
		if look == "" or not _here(z["x"], z["y"]):
			continue
		var zx: float = z["x"]
		var zy: float = z["y"]
		var zr: float = z["r"]
		var zt: float = z["t"]
		var cx := _wx(zx, zy)
		var cy := _wy(zx, zy)
		var fade := _fade_of(z)
		var s := shape_of(z)
		var seed: int = s["seed"]
		var spots: PackedFloat64Array = s["spots"]
		var small := zr < 1.2
		var RR := zr * (0.7 + 0.3 * minf(1.0, zt / 0.25))
		if look == "molten":
			# a pool of lava: bright and moving at its heart, a black crust broken into plates floating on it, glowing seams
			# between them, a cooled rim; bubbles that swell and burst
			var C: PackedColorArray = RAMP["eruption"]
			var beat := 0.5 + 0.5 * sin(t * 5.0 + seed)
			_ellipse(c, cx, cy, RR, C[1], 0.9 * fade)
			_ellipse(c, cx, cy, RR * 0.9, C[2], 0.95 * fade)
			_ellipse(c, cx, cy, RR * 0.74, C[3], 0.95 * fade)
			_ellipse(c, cx, cy, RR * 0.48, C[4], (0.75 + 0.25 * beat) * fade)
			_ellipse(c, cx, cy, RR * 0.2, C[5], (0.5 + 0.4 * beat) * fade)
			# the crust: plates drifting slowly round the heart, each lit along its upper left edge
			var i := 0
			while i + 1 < spots.size():
				var drift := t * 0.12 * (1.0 if i % 4 == 0 else -1.0)
				var ox := spots[i] * cos(drift) - spots[i + 1] * sin(drift)
				var oy := spots[i] * sin(drift) + spots[i + 1] * cos(drift)
				if sqrt(ox * ox + oy * oy) < zr * 0.3:
					i += 2
					continue
				var px := R(_wx(zx + ox, zy + oy))
				var py := R(_wy(zx + ox, zy + oy))
				var w := 2.0 + R(_h(seed, i, 9) * 3.0)
				_alpha(fade)
				_style(C[0])
				_fr(c, px - w, py - 1, w * 2, 2)
				_fr(c, px - w + 1, py + 1, w * 2 - 2, 1)
				_style(C[1])
				_fr(c, px - w, py - 1, w * 2 - 1, 1)
				_style(C[2])
				_fr(c, px - w, py - 1, 1, 1)
				i += 2
			# the seams glow white-hot, flickering
			_web(c, zx, zy, s["lines"], C[2], C[5] if sin(t * 9.0 + seed) > -0.2 else C[4], 1.0, 0.9 * fade)
			# the cooled rim
			_alpha(fade)
			_rim(c, cx, cy, RR * 0.98, C[1], 1)
			_rim(c, cx, cy, RR * 0.98, C[3], 4, PI * 1.05, PI * 0.5)
			# bubbles: each swells, then bursts in a spatter
			for b in (2 if small else 4):
				var q := fmod(t * 0.9 + _h(seed, b, 11), 1.0)
				var a := _h(seed, b, 12) * TAU
				var d := sqrt(_h(seed, b, 13)) * zr * 0.6
				var px := R(_wx(zx + cos(a) * d, zy + sin(a) * d))
				var py := R(_wy(zx + cos(a) * d, zy + sin(a) * d))
				_alpha(fade)
				if q < 0.85:
					var bb := 1.0 + R(q * 3.0)
					_style(C[3])
					_fr(c, px - bb, py - bb, bb * 2 + 1, bb + 1)
					_style(C[4])
					_fr(c, px - bb + 1, py - bb, bb * 2 - 1, bb)
					_style(C[5])
					_fr(c, px - bb + 1, py - bb, 1, 1)
				else:
					_style(C[5])
					_fr(c, px - 3, py - 2, 1, 1)
					_fr(c, px + 3, py - 3, 1, 1)
					_fr(c, px, py - 5, 1, 1)
					_style(C[4])
					_fr(c, px - 1, py - 1, 3, 1)
			_alpha(1.0)
		elif look == "snow":
			# packed snow fallen off the mountain: a crust of it with blue in its shadow, drifts heaped up and lit at their
			# upper left, blocks of ice standing in it, powder, a frosted rim, glints
			var C: PackedColorArray = RAMP["avalanche"]
			_ellipse(c, cx, cy, RR, C[1], 0.45 * fade)
			_ellipse(c, cx, cy, RR * 0.92, C[3], 0.7 * fade)
			_ellipse(c, cx - 2, cy - 1, RR * 0.7, C[4], 0.55 * fade)
			_alpha(fade)
			_rim(c, cx, cy, RR * 0.97, C[5], 2, PI * 0.95, PI * 0.75)
			_rim(c, cx, cy, RR * 0.97, C[2], 2, PI * 1.7, PI * 1.2)
			# powder: single grains
			for i in (10 if small else 24):
				var a := _h(seed, i, 16) * TAU
				var d := sqrt(_h(seed, i, 17)) * zr * 0.9
				_style(C[2] if i % 3 == 0 else C[5])
				_fr(c, R(_wx(zx + cos(a) * d, zy + sin(a) * d)), R(_wy(zx + cos(a) * d, zy + sin(a) * d)), 1, 1)
			var i := 0
			while i + 1 < spots.size():
				var px := R(_wx(zx + spots[i], zy + spots[i + 1]))
				var py := R(_wy(zx + spots[i], zy + spots[i + 1]))
				var block := _h(seed, i, 14) < 0.3 and not small
				if block:
					# a block of ice: lit top and left face, dark right face, its shadow on the snow
					var bw := 3.0 + R(_h(seed, i, 18) * 2.0)
					var bh := 4.0 + R(_h(seed, i, 19) * 4.0)
					_style(C[2])
					_fr(c, px - bw + 2, py, bw * 2, 1)
					_style(C[2])
					_fr(c, px, py - bh, bw, bh)
					_style(C[4])
					_fr(c, px - bw, py - bh, bw, bh)
					_style(C[5])
					_fr(c, px - bw, py - bh - 1, bw * 2 - 1, 1)
					_fr(c, px - bw, py - bh, 1, bh - 1)
				else:
					# a drift: a mound, widest at its foot, its shadow to the lower right
					var w := 3.0 + R(_h(seed, i, 15) * 4.0)
					_style(C[2])
					_fr(c, px - w + 2, py + 1, w * 2, 1)
					_style(C[3])
					_fr(c, px - w, py, w * 2 + 1, 1)
					_style(C[4])
					_fr(c, px - w + 1, py - 1, w * 2 - 1, 1)
					_style(C[5])
					_fr(c, px - w + 2, py - 2, w * 2 - 4, 1)
					_fr(c, px - w + 1, py - 1, 2, 1)
				i += 2
			_style(Color.WHITE)
			for g in (2 if small else 4):
				if _h(g, seed, floori(t * 5.0)) > 0.35:
					continue
				var a := _h(g, seed, 6) * TAU
				var d := _h(g, seed, 7) * zr * 0.8
				var gxp := R(_wx(zx + cos(a) * d, zy + sin(a) * d))
				var gyp := R(_wy(zx + cos(a) * d, zy + sin(a) * d)) - 1
				_fr(c, gxp - 1, gyp, 3, 1)
				_fr(c, gxp, gyp - 1, 1, 3)
			_alpha(1.0)
		elif look == "thunderhead" or look == "hail" or look == "greenstorm":
			# the ground under the cloud: its shadow, scorched; a rim that flickers in the word's colour
			var C: PackedColorArray = RAMP["thunder" if look == "thunderhead" else ("hailstorm" if look == "hail" else "contagion")]
			var lit := floori(t * 14.0 + seed) % 3 == 0
			_ellipse(c, cx, cy, RR, Color("#06040c"), 0.45 * fade)
			_ellipse(c, cx, cy, RR * 0.7, C[0], 0.35 * fade)
			_alpha(fade)
			_rim(c, cx, cy, RR, C[4] if lit else C[2], 2)
			if look == "hail":
				# hail lying about, frost round it
				var i := 0
				while i + 1 < spots.size():
					var px := R(_wx(zx + spots[i], zy + spots[i + 1]))
					var py := R(_wy(zx + spots[i], zy + spots[i + 1]))
					_style(C[2])
					_fr(c, px - 1, py + 1, 3, 1)
					_style(C[4])
					_fr(c, px - 1, py, 2, 1)
					_style(Color.WHITE)
					_fr(c, px - 1, py - 1, 1, 1)
					i += 2
			else:
				_web(c, zx, zy, s["lines"], Color("#05030a"), C[4] if lit else C[2], 0.7, 0.8 * fade)
			_alpha(1.0)
		elif look == "rot":
			# the floor withers under it: a black-green stain, dead veins creeping out from its heart
			var C: PackedColorArray = RAMP["blight"]
			_ellipse(c, cx, cy, RR, C[1], 0.55 * fade)
			_ellipse(c, cx, cy, RR * 0.6, C[0], 0.6 * fade)
			var grow := minf(1.0, zt / 1.2)
			_web(c, zx, zy, s["lines"], C[0], C[2], grow, 0.95 * fade)
			var i := 0
			while i + 1 < spots.size():
				var px := R(_wx(zx + spots[i], zy + spots[i + 1]))
				var py := R(_wy(zx + spots[i], zy + spots[i + 1]))
				_alpha(fade * (0.6 + 0.4 * sin(t * 3.0 + i)))
				_style(C[4] if i % 4 == 0 else C[3])
				_fr(c, px, py, 1, 1)
				i += 2
			_alpha(1.0)
		elif look == "boil":
			# a wet floor, hot: dark and shining, hot at its heart and cold at its rim, bubbles boiling up all over it
			var C: PackedColorArray = RAMP["scald"]
			_ellipse(c, cx, cy, RR, Color("#1e2a36"), 0.55 * fade)
			_ellipse(c, cx, cy, RR * 0.75, Color("#2a3846"), 0.5 * fade)
			_ellipse(c, cx, cy, RR * 0.35, Color("#ff8a2a"), (0.12 + 0.08 * sin(t * 6.0 + seed)) * fade)
			_alpha(fade)
			_rim(c, cx, cy, RR * 0.95, Color("#58a8f0"), 3)
			_rim(c, cx, cy, RR * 0.9, C[4], 4, PI * 1.05, PI * 0.45)
			for i in (3 if small else 7):
				var q := fmod(t * 1.6 + _h(seed, i, 21), 1.0)
				var a := _h(seed, i, 22) * TAU
				var d := sqrt(_h(seed, i, 23)) * zr * 0.8
				var px := R(_wx(zx + cos(a) * d, zy + sin(a) * d))
				var py := R(_wy(zx + cos(a) * d, zy + sin(a) * d))
				var b := R(1.0 + q * 3.0)
				_alpha(fade * (1.0 if q < 0.8 else (1.0 - q) * 5.0))
				_style(C[4])
				_fr(c, px - b, py - 1, 1, 1)
				_fr(c, px + b, py - 1, 1, 1)
				_fr(c, px - b + 1, py - 2, b * 2 - 1, 1)
				_style(Color.WHITE)
				_fr(c, px - 1, py - 2, 1, 1)
			_alpha(1.0)
		elif look == "wildfire" or look == "smoulder":
			# the ground burns: a glowing bed (Wildfire's bright and crackling; Fumes' low, sooty, smouldering)
			var C: PackedColorArray = RAMP["wildfire"] if look == "wildfire" else RAMP["fumes"]
			if look == "wildfire":
				_ellipse(c, cx, cy, RR, C[1], 0.5 * fade)
				_ellipse(c, cx, cy, RR * 0.65, C[2], 0.45 * fade)
				_ellipse(c, cx, cy, RR * 0.32, C[3], (0.35 + 0.2 * sin(t * 11.0 + seed)) * fade)
			else:
				_ellipse(c, cx, cy, RR, Color("#14100a"), 0.6 * fade)
				_ellipse(c, cx, cy, RR * 0.7, C[1], 0.4 * fade)
				var i := 0
				while i + 1 < spots.size():
					var px := R(_wx(zx + spots[i], zy + spots[i + 1]))
					var py := R(_wy(zx + spots[i], zy + spots[i + 1]))
					var on := sin(t * 4.0 + i * 1.7 + seed) > 0.0
					_alpha(fade)
					_style(Color("#ffc24a") if on else Color("#ff8a2a"))
					_fr(c, px, py, 2, 1)
					if on:
						_style(Color("#fff0a0"))
						_fr(c, px, py, 1, 1)
					i += 2
				_alpha(1.0)
		elif look == "fumes" or look == "coldmist" or look == "crackle":
			# the slick under a cloud: Fumes' sooty yellow, Frostbite's frosted green, Contagion's sick green
			var C: PackedColorArray = RAMP["fumes" if look == "fumes" else ("frostbite" if look == "coldmist" else "contagion")]
			_ellipse(c, cx, cy, RR, Color("#3a6a62") if look == "coldmist" else C[1], 0.4 * fade)
			_ellipse(c, cx, cy, RR * 0.65, C[2], 0.25 * fade)
			_alpha(fade)
			_rim(c, cx, cy, RR, C[4] if look == "coldmist" else C[3], 3)
			_alpha(1.0)
		elif look == "toxicice":
			# ice with venom frozen in it: pale blue ice, green veins glowing under it, crystals round its edge tipped green
			var C: PackedColorArray = RAMP["frostbite"]
			_ellipse(c, cx, cy, RR, C[3], 0.45 * fade)
			_ellipse(c, cx, cy, RR * 0.72, C[4], 0.3 * fade)
			var pulse := 0.5 + 0.5 * sin(t * 3.0 + seed)
			_web(c, zx, zy, s["lines"], Color("#3a5a2a"), Color("#c6e85a") if pulse > 0.5 else Color("#9ad23a"), 1.0, 0.9 * fade)
			var n := 5 if small else 10
			for i in n:
				var a := float(i) / n * TAU + _h(seed, i, 31) * 0.5
				var d := zr * (0.86 + _h(seed, i, 32) * 0.12)
				var qx := R(_wx(zx + cos(a) * d, zy + sin(a) * d))
				var qy := R(_wy(zx + cos(a) * d, zy + sin(a) * d))
				var tall := R(3.0 + _h(seed, i, 33) * 6.0)
				_alpha(fade)
				_style(C[3])
				_fr(c, qx + 1, qy - tall + 1, 1, tall)
				_style(C[5])
				_fr(c, qx, qy - tall, 1, tall)
				_style(Color("#b4cc24"))
				_fr(c, qx, qy - tall, 1, 1)
			_alpha(1.0)
	# the scars: a burnt star that glows and cools; a fissure that glows and cools; a furrow of snow
	for sc: Dictionary in scars:
		if not _here(sc["x"], sc["y"]):
			continue
		var C: PackedColorArray = RAMP[sc["word"]]
		var fade := minf(1.0, (float(sc["dur"]) - float(sc["t"])) / 0.6)
		var hot := maxf(0.0, 1.0 - float(sc["t"]) / (1.8 if sc["kind"] == "fissure" else 0.7))
		var cx := _wx(sc["x"], sc["y"])
		var cy := _wy(sc["x"], sc["y"])
		if sc["kind"] == "furrow":
			var e: PackedFloat64Array = sc["lines"][0]
			var ex := e[0]
			var ey := e[1]
			var n := maxi(2, int(R(sqrt(ex * ex + ey * ey) * 8.0)))
			for i in n + 1:
				var k := float(i) / n
				var px := R(_wx(sc["x"] + ex * k, sc["y"] + ey * k))
				var py := R(_wy(sc["x"] + ex * k, sc["y"] + ey * k))
				var w := 2.0 + R(2.0 * sin(k * PI))
				_alpha(fade * 0.9)
				_style(C[2])
				_fr(c, px - w, py + 1, w * 2, 1)
				_style(C[4])
				_fr(c, px - w, py - 1, w, 2)
				_style(C[5])
				_fr(c, px + w - 1, py - 2, 2, 2)
			_alpha(1.0)
			continue
		var dark := Color("#0a0608")
		_ellipse(c, cx, cy, float(sc["r"]) * 0.45, dark, 0.5 * fade)
		_web(c, sc["x"], sc["y"], sc["lines"], dark, C[5] if hot > 0.5 else (C[4] if hot > 0.0 else C[1]), 1.0 if hot > 0.0 else 0.0, fade)
	# Blight behind: a thorned brand of rot under each monster it has touched, turning slowly
	for m: Dictionary in view["monsters"]:
		if m["dead"] or not m["seen"] or not _here(m["x"], m["y"]):
			continue
		if not (float(m["blightT"]) > 0.0 and float(m["poisonT"]) > 0.0):
			continue
		var C: PackedColorArray = RAMP["blight"]
		var cx := _wx(m["x"], m["y"])
		var cy := _wy(m["x"], m["y"])
		var go := minf(1.0, float(m["blightT"]) / 0.4)
		var beat := 0.75 + 0.25 * sin(t * 4.0 + int(m["id"]))
		# a stain of rot under it, ringed, with hooked thorns turning round it
		_ellipse(c, cx, cy, 0.62, C[0], 0.7 * go)
		_ellipse(c, cx, cy, 0.42, C[1], 0.6 * go)
		_alpha(go)
		_rim(c, cx, cy, 0.62, C[2], 1)
		_alpha(go * beat)
		_rim(c, cx, cy, 0.6, C[3], 2)
		for i in 7:
			var a := float(i) / 7 * TAU + t * 0.8
			var x0 := cx + cos(a) * 0.6 * 22.6
			var y0 := cy + sin(a) * 0.6 * 11.3
			var x1 := cx + cos(a + 0.3) * 0.82 * 22.6
			var y1 := cy + sin(a + 0.3) * 0.82 * 11.3
			_pl(c, x0, y0 + 1, x1, y1 + 1, C[1])
			_pl(c, x0, y0, x1, y1, C[3])
			_style(C[5])
			_fr(c, R(x1), R(y1), 1, 1)
		_alpha(1.0)
	# Eruption behind: the hero's heat glows in the ground at their feet, cracks of lava opening as it builds
	var H: Dictionary = view["hero"]
	if heat > 0 and _here(H["x"], H["y"]):
		var C: PackedColorArray = RAMP["eruption"]
		var hx: float = H["x"]
		var hy: float = H["y"]
		var k := float(heat) / HEAT_FULL
		var full := heat >= HEAT_FULL
		var cx := _wx(hx, hy)
		var cy := _wy(hx, hy)
		_ellipse(c, cx, cy, 0.35 + 0.35 * k, C[3] if full else C[2], (0.25 + 0.3 * k) * (0.75 + 0.25 * sin(t * 12.0) if full else 1.0))
		var n := int(R(2.0 + 5.0 * k))
		_alpha(1.0)
		for i in n:
			var a := float(i) / n * TAU + 0.4
			var length := 0.35 + 0.45 * k
			var x1 := hx + cos(a) * length
			var y1 := hy + sin(a) * length
			_pl(c, _wx(hx + cos(a) * 0.15, hy + sin(a) * 0.15), _wy(hx + cos(a) * 0.15, hy + sin(a) * 0.15), _wx(x1, y1), _wy(x1, y1), C[5] if full and sin(t * 14.0 + i) > 0.0 else C[4])


## (the renderer's pass: what is on the screen or near it; the check's, everything)
func _here(x: float, y: float) -> bool:
	if not _live or view.is_empty():
		return true
	var H: Dictionary = view["hero"]
	var across: float = (x - y - H["x"] + H["y"]) * 16.0
	var down: float = (x + y - H["x"] - H["y"]) * 8.0
	return across > -340.0 and across < 340.0 and down > -220.0 and down < 240.0


# =====================================================================================================================
# IN THE AIR (airM3: over the dark, under the effects' sparks; overM3: over them)

## A cloud of puffs over a patch (cloud): `cols` belly, mid, top; lit from inside in `lit` now and then.
func _cloud(c, z: Dictionary, t: float, cols: PackedColorArray, lit, high: float, puffs: int, size: float, alpha: float, flick := 12.0) -> void:
	var s := shape_of(z)
	var seed: int = s["seed"]
	var fade := _fade_of(z)
	var born := minf(1.0, float(z["t"]) / 0.35)
	var going := maxf(0.0, minf(1.0, (float(z["dur"]) - float(z["t"])) / 0.5))
	var cx := R(_wx(z["x"], z["y"]) + sin(t * 0.8 + seed) * 2.0)
	var cy := R(_wy(z["x"], z["y"])) - high - R((1.0 - going) * 6.0)
	var wide := minf(1.6, z["r"]) * 17.0
	var beat := floori(t * flick)
	var struck := floori(_h(seed, beat, 5) * puffs) if lit != null and _h(seed, beat, 4) < 0.45 else -1
	_alpha(alpha * fade)
	for i in puffs:
		var churn := t * (0.7 + _h(i, seed, 6) * 0.6) + i * 2.1
		var ox := ((_h(i, seed, 1) - 0.5) * wide * 2.0 + sin(churn) * 2.5) * (0.35 + 0.65 * born)
		var oy := (_h(i, seed, 2) - 0.5) * 7.0 + cos(churn * 0.8) * 1.4
		var r := maxf(1.0, (size + _h(i, seed, 3) * size * 0.8 + sin(churn * 1.3) * 0.9) * (0.4 + 0.6 * born) * (0.5 + 0.5 * going))
		var px := R(cx + ox)
		var py := R(cy + oy)
		_style(cols[2])
		_el(c, px, py - 2, r, r * 0.55)
		var near: int = absi(i - struck) if struck >= 0 else 9
		_style(lit[1] if lit != null and near == 0 else (lit[0] if lit != null and near == 1 else (cols[0] if i % 2 == 0 else cols[1])))
		_el(c, px, py, r, r * 0.55)
		if lit != null and near == 0:
			_style(lit[2])
			_el(c, px, py + 1, r * 0.5, r * 0.22)
	if struck >= 0 and lit != null:
		_style(lit[1])
		_fr(c, R(cx - wide * 0.7), R(cy + 5), R(wide * 1.4), 1)
	_alpha(1.0)


## Low puffs turning over a patch (fog): `cols` belly, body, cap; `clear` a place on the screen (him) it thins round.
func _fog(c, z: Dictionary, t: float, cols: PackedColorArray, n: int, size: float, alpha: float, rise: float, clear: Vector2) -> void:
	var s := shape_of(z)
	var seed: int = s["seed"]
	var zr: float = z["r"]
	var fade := minf(1.0, minf(float(z["t"]) / 0.25, (float(z["dur"]) - float(z["t"])) * 2.0))
	for i in n:
		var a := float(i) / n * TAU + t * (0.25 + _h(i, seed, 1) * 0.3) * (1.0 if i % 2 == 0 else -1.0)
		var d := zr * (0.2 + _h(i, seed, 2) * 0.6)
		var life := fmod(t * rise + _h(i, seed, 6), 1.0) if rise != 0.0 else 0.0
		var px := R(_wx(z["x"] + cos(a) * d, z["y"] + sin(a) * d))
		var py := R(_wy(z["x"] + cos(a) * d, z["y"] + sin(a) * d)) - 6.0 - R(_h(i, seed, 3) * 8.0 + sin(t * 1.3 + i) * 2.0) - R(life * 26.0)
		var rr := size + _h(i, seed, 4) * size + life * 6.0
		var al := (alpha + _h(i, seed, 5) * 0.12) * fade * (minf(1.0, minf((1.0 - life) * 2.5, life * 6.0)) if rise != 0.0 else 1.0)
		# (a cloud thins round the hero standing in it: the player must never lose sight of them)
		if sqrt((px - clear.x) * (px - clear.x) + ((py - clear.y) * 1.6) * ((py - clear.y) * 1.6)) < 30.0:
			al *= 0.3
		_alpha(al)
		_style(cols[0])
		_el(c, px + 1, py + 2, rr * 1.5, rr * 0.75)
		_style(cols[1])
		_el(c, px, py, rr * 1.4, rr * 0.75)
		_style(cols[2])
		_el(c, px - rr * 0.35, py - rr * 0.3, rr * 0.8, rr * 0.4)
	_alpha(1.0)


func draw_air(c) -> void:
	if view.is_empty():
		return
	var t := clock
	var H: Dictionary = view["hero"]
	var hx := R(_wx(H["x"], H["y"]))
	var hy := R(_wy(H["x"], H["y"]))
	# (the small patches a shot leaves along its way share one cloud between those near each other)
	var shared := PackedFloat64Array()
	for z: Dictionary in view["zones"]:
		var look := look_of(z)
		if look == "":
			continue
		var zx: float = z["x"]
		var zy: float = z["y"]
		var zr: float = z["r"]
		var small := zr < 1.2
		if small and look in CLOUDED:
			var near := false
			var i := 0
			while i < shared.size() and not near:
				near = absf(shared[i] - zx) < 1.3 and absf(shared[i + 1] - zy) < 1.3
				i += 2
			if near:
				continue
			shared.append(zx)
			shared.append(zy)
		var s := shape_of(z)
		var seed: int = s["seed"]
		if look == "thunderhead":
			# a heavy thunderhead, low and dark, violet lightning moving inside it
			var C: PackedColorArray = RAMP["thunder"]
			_cloud(c, z, t, _cs(["#2c2444", "#382e52", "#5e527c"]), _cs([C[2], C[3], C[4]]), 38.0 if small else 46.0, 5 if small else 12, 6.0 if small else 8.0, 0.95, 14.0)
			# lightning crawling along its belly
			if _h(seed, floori(t * 10.0), 9) < 0.3:
				var cx := _wx(zx, zy)
				var cy := _wy(zx, zy) - (34.0 if small else 42.0)
				var px := cx - 14.0
				for i in 6:
					var nx := px + 5.0
					var ny := cy + R(_h(seed, floori(t * 10.0) * 7 + i, 10) * 6.0 - 3.0)
					_pl(c, px, cy + (i % 2), nx, ny, C[4])
					px = nx
		elif look == "hail":
			# a pale, icy cloud, and hail driving down out of it all the time, bouncing where it strikes
			var C: PackedColorArray = RAMP["hailstorm"]
			_cloud(c, z, t, _cs([C[1], C[2], C[3]]), _cs([C[3], C[4], C[5]]), 40.0 if small else 50.0, 4 if small else 10, 5.0 if small else 7.0, 0.9, 10.0)
			var fade := _fade_of(z)
			var n := 5 if small else 14
			for i in n:
				var q := fmod(t * 1.8 + _h(seed, i, 41), 1.0)
				var a := _h(seed, i, 42) * TAU
				var d := sqrt(_h(seed, i, 43)) * zr * 0.85
				var fx0 := zx + cos(a) * d
				var fy0 := zy + sin(a) * d
				var px := R(_wx(fx0, fy0))
				var py := R(_wy(fx0, fy0))
				_alpha(fade)
				if q < 0.7:
					# falling: a streak
					var up := R((1.0 - q / 0.7) * (38.0 if small else 48.0))
					_style(C[4])
					_fr(c, px, py - up - 3, 1, 3)
					_style(Color.WHITE)
					_fr(c, px, py - up, 1, 1)
				else:
					# bounced: a little hop
					var b := (q - 0.7) / 0.3
					var hop := R(sin(b * PI) * 4.0)
					_style(Color.WHITE)
					_fr(c, px + R(b * 3.0), py - hop, 1, 1)
			_alpha(1.0)
		elif look == "greenstorm":
			var C: PackedColorArray = RAMP["contagion"]
			_cloud(c, z, t, _cs(["#16301c", "#1e3a24", "#3a5c40"]), _cs([C[2], C[3], C[4]]), 38.0 if small else 48.0, 4 if small else 10, 5.0 if small else 7.0, 0.9, 12.0)
		elif look == "rot":
			var C: PackedColorArray = RAMP["blight"]
			_fog(c, z, t, _cs([C[1], C[2], C[3]]), int(R(6.0 + zr * 3.0)), 5.0, 0.3, 0.0, Vector2(hx, hy - 14))
			# spores drifting down through it
			var fade := _fade_of(z)
			for i in (5 if small else 14):
				var q := fmod(t * 0.35 + _h(seed, i, 51), 1.0)
				var a := _h(seed, i, 52) * TAU
				var d := sqrt(_h(seed, i, 53)) * zr * 0.8
				_alpha(fade * minf(1.0, minf(q * 5.0, (1.0 - q) * 3.0)))
				_style(C[5] if i % 3 == 0 else C[4])
				_fr(c, R(_wx(zx + cos(a) * d, zy + sin(a) * d) + sin(t * 2.0 + i) * 2.0), R(_wy(zx + cos(a) * d, zy + sin(a) * d)) - R(26.0 * (1.0 - q)), 1, 2 if i % 4 == 0 else 1)
			_alpha(1.0)
		elif look == "boil":
			# steam rolling up thick off it, warm white and cold blue together
			var C: PackedColorArray = RAMP["scald"]
			var fade := _fade_of(z)
			var n := int(R((6.0 if small else 12.0) + zr * 5.0))
			for i in n:
				var life := fmod(t * (0.4 + _h(i, seed, 1) * 0.3) + _h(i, seed, 6), 1.0)
				var a := _h(i, seed, 7) * TAU
				var d := zr * (0.1 + _h(i, seed, 2) * 0.8)
				var px := R(_wx(zx + cos(a) * d, zy + sin(a) * d) + sin(t * 1.1 + i) * 3.0)
				var py := R(_wy(zx + cos(a) * d, zy + sin(a) * d)) - 3.0 - R(life * 40.0)
				var rr := 5.0 + _h(i, seed, 4) * 6.0 + life * 10.0
				# (it thins round the hero standing in it: hidden from the monsters, never from the player)
				var near_hero := sqrt((px - hx) * (px - hx) + ((py - hy + 16.0) * 1.6) * ((py - hy + 16.0) * 1.6)) < 30.0
				_alpha((0.34 + _h(i, seed, 5) * 0.18) * fade * minf(1.0, minf((1.0 - life) * 2.5, life * 6.0)) * (0.3 if near_hero else 1.0))
				_style(Color.WHITE if i % 4 == 0 else (Color("#d8ecf8") if i % 4 == 1 else (C[4] if i % 4 == 2 else C[3])))
				_el(c, px, py, rr * 1.3, rr)
			_alpha(1.0)
		elif look == "fumes":
			# thick sour smoke rolling over itself, embers glowing in it; it flickers as if about to go up
			var C: PackedColorArray = RAMP["fumes"]
			_fog(c, z, t, _cs(["#2a2412", C[2], C[3]]), int(R(6.0 + zr * 4.0)), 6.0, 0.34, 0.35, Vector2(hx, hy - 14))
			var fade := _fade_of(z)
			for i in (3 if small else 7):
				var on := sin(t * (5 + i) + seed + i * 2) > 0.6
				if not on:
					continue
				var a := _h(seed, i, 61) * TAU
				var d := sqrt(_h(seed, i, 62)) * zr * 0.7
				_alpha(fade)
				_style(Color("#ffc24a") if i % 2 == 0 else Color("#ff8a2a"))
				_fr(c, R(_wx(zx + cos(a) * d, zy + sin(a) * d)), R(_wy(zx + cos(a) * d, zy + sin(a) * d)) - 8.0 - R(_h(seed, i, 63) * 14.0), 1, 1)
			_alpha(1.0)
		elif look == "coldmist":
			_fog(c, z, t, _cs(["#4a8a7c", "#9ad0c0", "#e4f8f4"]), int(R(6.0 + zr * 3.0)), 6.0, 0.22, 0.0, Vector2(hx, hy - 14))
			var fade := _fade_of(z)
			_style(Color.WHITE)
			for i in (2 if small else 5):
				if _h(i, seed, floori(t * 6.0)) > 0.4:
					continue
				var a := _h(seed, i, 71) * TAU
				var d := sqrt(_h(seed, i, 72)) * zr * 0.8
				_alpha(fade)
				_fr(c, R(_wx(zx + cos(a) * d, zy + sin(a) * d)), R(_wy(zx + cos(a) * d, zy + sin(a) * d)) - 6.0 - (i % 3) * 3, 1, 1)
			_alpha(1.0)
		elif look == "crackle":
			# a sick green cloud with lightning crawling through it
			var C: PackedColorArray = RAMP["contagion"]
			_fog(c, z, t, _cs([C[0], C[2], C[3]]), int(R(5.0 + zr * 3.0)), 5.0, 0.26, 0.0, Vector2(hx, hy - 14))
			var beat := floori(t * 9.0)
			for k in (1 if small else 3):
				if _h(seed, beat, 80 + k) > 0.55:
					continue
				var a := _h(seed, beat * 3 + k, 81) * TAU
				var b := a + 1.4 + _h(seed, beat * 3 + k, 82) * 2.0
				var d0 := zr * 0.7
				var px := _wx(zx + cos(a) * d0, zy + sin(a) * d0)
				var py := _wy(zx + cos(a) * d0, zy + sin(a) * d0) - 10.0
				var ex := _wx(zx + cos(b) * d0, zy + sin(b) * d0)
				var ey := _wy(zx + cos(b) * d0, zy + sin(b) * d0) - 10.0
				_alpha(_fade_of(z))
				for i in range(1, 5):
					var nx := px + (ex - px) / (5 - i) + (_h(beat, k, i) * 6.0 - 3.0 if i < 4 else 0.0)
					var ny := py + (ey - py) / (5 - i) + (_h(beat, k, i + 9) * 6.0 - 3.0 if i < 4 else 0.0)
					_pl(c, px, py, nx, ny, C[4] if i % 2 else C[5])
					px = nx
					py = ny
				_alpha(1.0)
		elif look == "toxicice":
			_fog(c, z, t, _cs(["#4a8a7c", "#9ad0c0", "#e4f8f4"]), int(R(3.0 + zr * 2.0)), 4.0, 0.14, 0.0, Vector2(hx, hy - 14))
		elif look == "molten":
			# heat shimmering up off it
			var C: PackedColorArray = RAMP["eruption"]
			var fade := _fade_of(z)
			for i in (2 if small else 5):
				var q := fmod(t * 0.8 + _h(seed, i, 91), 1.0)
				var a := _h(seed, i, 92) * TAU
				var d := sqrt(_h(seed, i, 93)) * zr * 0.6
				var px := _wx(zx + cos(a) * d, zy + sin(a) * d)
				var py := _wy(zx + cos(a) * d, zy + sin(a) * d) - 4.0 - q * 30.0
				_alpha(fade * 0.4 * minf(1.0, minf(q * 4.0, (1.0 - q) * 2.0)))
				for j in 6:
					_style(C[4])
					_fr(c, R(px + sin(t * 6.0 + j + i) * 2.0), R(py - j * 2), 1, 1)
			_alpha(1.0)
	# monsters: Thunder's stun crackling over the head, Blight's rot, Frostbite's jaws
	for m: Dictionary in view["monsters"]:
		if m["dead"] or not m["seen"]:
			continue
		var k = marks.get(m["key"])
		var sh := shift_of(m["key"])
		var sx := R(_wx(m["x"], m["y"])) + sh.x
		var sy := R(_wy(m["x"], m["y"])) + sh.y
		var top: float = m["top"]
		if k != null and k["thunder"] > 0.0 and float(m["stunT"]) > 0.0:
			_thunder_stun(c, sx, sy - top - 11.0, t, k)
		if k != null and k["blight"] and float(m["poisonT"]) > 0.0:
			_rot(c, sx, sy, top, m["half"], t, m)
	# Frostbite's jaws are drawn over the hit's own sparks (in draw_over), where they can be seen: here only where each is now
	for q: Dictionary in clamps:
		q["at"] = null
		var m = null
		for o: Dictionary in view["monsters"]:
			if o["key"] == q["id"] and not o["dead"]:
				m = o
				break
		if m == null:
			continue
		var sh := shift_of(m["key"])
		q["at"] = Vector3(R(_wx(m["x"], m["y"])) + sh.x, R(_wy(m["x"], m["y"])) + sh.y - R(float(m["top"]) * 0.5), m["half"])
	# the hero: Eruption's heat as embers circling low; Thunder's charge as sparks circling high
	if heat > 0:
		_draw_heat(c, hx, hy, t)
	if claps > 0:
		_draw_charge(c, hx, hy, t)


## Over the effects' sparks: the jaws, the columns, the lava bombs and hail, the bolts, the screen's flash (overM3).
func draw_over(c) -> void:
	var t := clock
	for q: Dictionary in clamps:
		if q["at"] != null:
			var at: Vector3 = q["at"]
			_jaws(c, at.x, at.y, q, at.z)
	for col: Dictionary in columns:
		# a jet standing up off the floor: it shoots up in the first quarter of its time, ragged at its edges, white at its
		# heart, thinning toward its head, then falls back, its foot going first
		var C: PackedColorArray = RAMP[col["word"]]
		var steam: bool = col["word"] == "scald"
		var ct: float = col["t"]
		var k := ct / float(col["dur"])
		var cx := R(_wx(col["x"], col["y"]))
		var cy := R(_wy(col["x"], col["y"]))
		var top := R(float(col["h"]) * minf(1.0, k / 0.22) * (1.0 - (k - 0.6) * 0.5 if k > 0.6 else 1.0))
		var foot := R(top * ((k - 0.55) / 0.45)) if k > 0.55 else 0.0
		var seed := R(float(col["x"]) * 97.0 + float(col["y"]) * 31.0)
		var cw: float = col["w"]
		var j := foot
		while j < top:
			var q := j / maxf(1.0, top)
			var wob := sin(j * 0.45 + seed + ct * 26.0) * 0.6 + sin(j * 1.1 - ct * 17.0 + seed * 0.3) * 0.4
			var half := maxf(0.0, R(cw * pow(1.0 - q, 0.6) + wob * 2.0))
			var sway := R(sin(j * 0.15 + ct * 20.0) * q * 2.0)
			_alpha(0.7 * (1.0 - q * 0.6) if steam else 1.0)
			_style(C[3] if steam else C[2])
			_fr(c, cx + sway - half - 1, cy - j, half * 2 + 3, 1)
			_style(C[4] if steam else C[3])
			_fr(c, cx + sway - half, cy - j, half * 2 + 1, 1)
			if half > 1:
				_style(Color.WHITE if steam else C[4])
				_fr(c, cx + sway - ceilf(half / 2.0), cy - j, ceilf(half / 2.0) * 2 + 1, 1)
			if q < 0.7 and half > 0:
				_style(C[5])
				_fr(c, cx + sway, cy - j, 1, 1)
			j += 1.0
		# its head boils over: globs thrown off it
		if k < 0.8 and top > 4:
			for i in 6:
				var a := ct * 11.0 + i * 1.05
				var r := 2.0 + cw * 0.5 + ((i * 3 + floori(ct * 30.0)) % 3)
				_alpha(0.6 if steam else 1.0)
				_style(C[4] if i % 2 else C[5])
				_fr(c, cx + R(cos(a) * r), cy - top + R(sin(a) * r * 0.5), 2, 2)
		_alpha(1.0)
	for b: Dictionary in bombs:
		var bt: float = b["t"]
		if bt < 0.0:
			continue
		var k := minf(1.0, bt / float(b["dur"]))
		var x0: float = b["x0"]
		var y0: float = b["y0"]
		var x1: float = b["x1"]
		var y1: float = b["y1"]
		var bh: float = b["h"]
		var hail: bool = b["word"] == "hailstorm"
		var x := x0 + (x1 - x0) * k
		var y := y0 + (y1 - y0) * k
		var px := R(_wx(x, y))
		var py := R(_wy(x, y) - bh * 4.0 * k * (1.0 - k) * (0.0 if hail else 1.0) - (bh * (1.0 - k) if hail else 0.0))
		var C: PackedColorArray = RAMP[b["word"]]
		if b["word"] == "eruption":
			# a lava bomb: a glowing heart, a black crust, a tail of sparks
			var q := maxf(0.0, k - 0.08)
			var tx := R(_wx(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q))
			var ty := R(_wy(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q) - bh * 4.0 * q * (1.0 - q))
			_pl(c, px, py, tx, ty, C[4])
			_style(C[1])
			_fr(c, px - 2, py - 1, 4, 3)
			_style(C[4])
			_fr(c, px - 1, py - 1, 2, 2)
			_style(C[5])
			_fr(c, px - 1, py - 1, 1, 1)
		else:
			# a hailstone streaking down
			_style(C[4])
			_fr(c, px, py - 4, 1, 4)
			_style(Color.WHITE)
			_fr(c, px, py, 2, 2)
	for b: Dictionary in bolts:
		var k: float = b["t"] / b["dur"]
		# (it flickers: on, a beat off, on again, then gone)
		if k > 0.3 and k < 0.42:
			continue
		var C: PackedColorArray = b["C"]
		var core := C[5] if k < 0.25 else (C[4] if k < 0.6 else C[3])
		var pts: PackedFloat64Array = b["pts"]
		var bz: float = b["z"]
		var bw: int = b["w"]
		var i := 0
		while i + 3 < pts.size():
			var x0 := _wx(pts[i], pts[i + 1])
			var y0 := _wy(pts[i], pts[i + 1]) - bz
			var x1 := _wx(pts[i + 2], pts[i + 3])
			var y1 := _wy(pts[i + 2], pts[i + 3]) - bz
			if k < 0.6:
				_thick(c, x0, y0 + 1, x1, y1 + 1, C[2], bw + 1)
			_thick(c, x0, y0, x1, y1, core, bw)
			if b["kind"] == "ice" and k < 0.7:
				# crystals standing off it
				var mx := (x0 + x1) / 2.0
				var my := (y0 + y1) / 2.0
				_pl(c, mx, my, mx + 2, my - 3, C[5])
				_pl(c, mx, my, mx - 2, my + 2, C[4])
			if b["kind"] == "fire" and k < 0.8 and i % 4 == 0:
				_style(Color("#fff0a0") if k < 0.4 else Color("#ffc24a"))
				_fr(c, R(x1), R(y1) - 2, 1, 2)
			i += 2
	for s: Dictionary in skies:
		var k: float = s["t"] / s["dur"]
		if k > 0.35 and k < 0.45:
			continue
		var C: PackedColorArray = s["C"]
		var bx := _wx(s["x"], s["y"])
		var by := _wy(s["x"], s["y"]) - 2.0
		var offs: PackedFloat64Array = s["offs"]
		var step: float = s["top"] / offs.size()
		var core := C[5] if k < 0.3 else (C[4] if k < 0.65 else C[3])
		var sw: int = s["w"]
		var w := sw if k < 0.5 else maxi(1, sw - 1)
		var px := bx
		var py := by
		for i in offs.size():
			var nx := bx + offs[i]
			var ny := by - (i + 1) * step
			if k < 0.6:
				_thick(c, px - w, py, nx - w, ny, C[3], 1)
				_thick(c, px + w, py, nx + w, ny, C[2], 1)
			_thick(c, px, py, nx, ny, core, w)
			px = nx
			py = ny
		if k < 0.7:
			for f: Dictionary in s["forks"]:
				var at: int = f["at"]
				var fo: PackedFloat64Array = f["offs"]
				var fx0 := bx + offs[at]
				var fy0 := by - (at + 1) * step
				for i in fo.size():
					var nx := bx + fo[i]
					var ny := fy0 + step * 0.6
					_pl(c, fx0, fy0, nx, ny, C[4] if i == 0 else C[3])
					fx0 = nx
					fy0 = ny
		# where it strikes, a splash of light on the floor
		if k < 0.5:
			_alpha(0.8 * (1.0 - k * 2.0))
			_style(C[5])
			_el(c, bx, by + 2, 9.0 + sw * 3, 4.0 + sw)
			_alpha(1.0)
	if flash["t"] < flash["dur"]:
		_alpha(flash["a"] * (1.0 - flash["t"] / flash["dur"]))
		_style(flash["color"])
		if _ovals != null:
			_ovals.append("screen,%s@%d" % [_fs.to_html(false), int(R(_ga * 1000.0))])
		elif c != null and _ga > 0.0:
			var rect: Rect2 = c.get_canvas_transform().affine_inverse() * c.get_viewport_rect()
			c.draw_rect(rect, Color(_fs, _ga))
		_alpha(1.0)


## Thunder's stun: violet sparks over the head, little bolts jumping between them (drawThunderStun).
func _thunder_stun(c, sx: float, cy: float, t: float, k: Dictionary) -> void:
	var C: PackedColorArray = RAMP["thunder"]
	var grow := minf(1.0, float(k["thunder0"]) / 0.12)
	var pts: Array = []
	for i in 3:
		var a := t * 7.0 + float(i) / 3 * TAU
		pts.append(Vector2(R(sx + cos(a) * 9.0 * grow), R(cy + sin(a) * 3.0 * grow)))
	var beat := floori(t * 16.0)
	for i in 3:
		if _h(beat, i, 3) > 0.6:
			continue
		var p0: Vector2 = pts[i]
		var p1: Vector2 = pts[(i + 1) % 3]
		var mx := (p0.x + p1.x) / 2.0 + (_h(beat, i, 4) - 0.5) * 6.0
		var my := (p0.y + p1.y) / 2.0 - 2.0 - _h(beat, i, 5) * 3.0
		_pl(c, p0.x, p0.y, mx, my, C[4])
		_pl(c, mx, my, p1.x, p1.y, C[5])
	for p: Vector2 in pts:
		_style(C[3])
		_fr(c, p.x - 1, p.y, 3, 1)
		_fr(c, p.x, p.y - 1, 1, 3)
		_style(C[5])
		_fr(c, p.x, p.y, 1, 1)


## Blight's rot on what it struck: sick veins climbing its body and drips of black rot off it, the more the lower its life
## (drawRot).
func _rot(c, sx: float, sy: float, top: float, half: float, t: float, m: Dictionary) -> void:
	var C: PackedColorArray = RAMP["blight"]
	var id := int(m["id"])
	var lost := 1.0 - maxf(0.0, m["life"]) / maxf(1.0, m["maxLife"])
	var n := 3 + int(R(lost * 6.0))
	for i in n:
		var x0 := sx + R((_h(id, i, 1) - 0.5) * half * 1.5)
		var length := R(top * (0.3 + 0.55 * lost) * (0.5 + _h(id, i, 2) * 0.5))
		# (it creeps: each vein's tip a little higher with every beat)
		var grow := 0.75 + 0.25 * fmod(t * 0.7 + _h(id, i, 4), 1.0)
		var px := x0
		var py := sy - 1.0
		var j := 0
		while j < length * grow:
			var nx := px + (-1.0 if _h(id, i * 13 + j, 3) < 0.5 else 1.0)
			var ny := py - 2.0
			_pl(c, px, py, nx, ny, C[2] if j % 4 == 0 else C[3])
			px = nx
			py = ny
			j += 2
		_style(C[4])
		_fr(c, px, py, 1, 1)
	# drips of black rot falling off it
	var drips := 1 + int(R(lost * 4.0))
	for i in drips:
		var q := fmod(t * (0.9 + _h(id, i, 5) * 0.6) + _h(id, i, 6), 1.0)
		var px := sx + R((_h(id, i, 7) - 0.5) * half * 1.2)
		var py := sy - R(top * (0.3 + _h(id, i, 8) * 0.5) * (1.0 - q))
		_alpha(minf(1.0, (1.0 - q) * 3.0))
		_style(C[1] if i % 2 else C[0])
		_fr(c, px, py, 1, 2)
		_style(C[2])
		_fr(c, px, py, 1, 1)
	_alpha(1.0)


## Frostbite's jaws: two curved jaws of ice, fanged, that snap shut on what it struck (drawJaws).
func _jaws(c, sx: float, cy: float, q: Dictionary, half: float) -> void:
	var C: PackedColorArray = RAMP["frostbite"]
	var big: bool = q["big"]
	var k: float = q["t"] / q["dur"]
	var shut := _smooth(k / 0.4) if k < 0.4 else 1.0
	var gape := R((1.0 - shut) * (18.0 if big else 11.0))
	var rx := maxf(11.0, half + (10.0 if big else 6.0))
	var ry := 8.0 if big else 6.0
	var long := 5 if big else 3
	_alpha((1.0 if k < 0.7 else (1.0 - k) / 0.3) * (1.0 if big else 0.85))
	for side in [-1.0, 1.0]:
		# the upper jaw is the top of an oval, its fangs pointing down; the lower the bottom, pointing up
		var jy: float = cy + side * gape
		var steps := 26
		for i in steps + 1:
			var a := PI * (float(i) / steps)
			var px := R(sx - cos(a) * rx)
			var py := R(jy + side * sin(a) * ry)
			_style(C[1])
			_fr(c, px, py + side * 2, 1, 1)
			_style(C[3])
			_fr(c, px, py + side, 1, 1)
			_style(C[5] if side < 0 else C[4])
			_fr(c, px, py, 1, 1)
			if i % 4 == 2:
				# a fang, white at its root, narrowing toward the other jaw
				for f in range(1, long + 1):
					_style(Color.WHITE if f <= 1 else (C[5] if f <= long / 2.0 + 1 else C[4]))
					_fr(c, px, py - side * f, 2 if f <= long / 2.0 else 1, 1)
	if k > 0.38 and k < 0.52:
		# the crunch: a white line across where they met, venom squeezed out
		_style(Color.WHITE)
		_fr(c, sx - rx - 4, cy, rx * 2 + 9, 1)
		_style(Color("#b4cc24"))
		_fr(c, sx - rx + 2, cy + 1, 1, 2)
		_fr(c, sx + rx - 3, cy + 1, 1, 3)
		_fr(c, sx, cy + 2, 1, 2)
	_alpha(1.0)


## Eruption behind: an ember for each heat, circling his feet; at full heat they blaze and smoke (drawHeat).
func _draw_heat(c, hx: float, hy: float, t: float) -> void:
	var C: PackedColorArray = RAMP["eruption"]
	var n := heat
	var full := n >= HEAT_FULL
	for i in n:
		var a := t * (5.0 if full else 2.6) + float(i) / n * TAU
		var px := R(hx + cos(a) * 15.0)
		var py := R(hy - 3.0 + sin(a) * 6.0)
		_style(C[2])
		_fr(c, px - 1, py - 1, 3, 3)
		_style(C[5] if full else C[4])
		_fr(c, px, py - 1, 1, 2)
		if full:
			_style(C[4])
			_fr(c, px, py - 4 - R(fmod(t * 20.0 + i * 3, 4.0)), 1, 1)


## Thunder behind: a ball of violet lightning for each hit toward the clap, circling his chest with a tail of where it has
## been; one hit short of the clap they go faster and bolts jump between them (drawCharge).
func _draw_charge(c, hx: float, hy: float, t: float) -> void:
	var C: PackedColorArray = RAMP["thunder"]
	var n := claps
	var ready := n >= CLAP_EVERY - 1
	var spin := t * (7.0 if ready else 4.0)
	var at := func(a: float) -> Vector2: return Vector2(R(hx + cos(a) * 15.0), R(hy - 16.0 + sin(a) * 5.0))
	var pts: Array = []
	for pass_i in [0, 1]:
		for i in n:
			var a := spin + float(i) / n * TAU
			# (the ones beyond him, up the screen, small and dim: they pass behind and come round in front)
			var far := sin(a) < 0.0
			if (pass_i == 0) != far:
				continue
			var p: Vector2 = at.call(a)
			if pass_i == 1:
				pts.append(p)
			var q := p
			for k in range(1, (3 if far else 6) + 1):
				var tp: Vector2 = at.call(a - k * 0.16)
				_pl(c, q.x, q.y, tp.x, tp.y, C[2] if far else (C[4] if k <= 2 else C[3]))
				q = tp
			if far:
				_style(C[3])
				_fr(c, p.x - 1, p.y - 1, 3, 3)
			else:
				_style(C[3])
				_fr(c, p.x - 2, p.y - 1, 5, 3)
				_fr(c, p.x - 1, p.y - 2, 3, 5)
				_style(C[4])
				_fr(c, p.x - 1, p.y - 1, 3, 3)
				_style(C[5])
				_fr(c, p.x, p.y, 1, 1)
				# (it crackles: a spark off it now and then)
				if _h(i, floori(t * 20.0), 7) < 0.4:
					_pl(c, p.x, p.y, p.x + R((_h(i, floori(t * 20.0), 8) - 0.5) * 10.0), p.y - 2.0 - R(_h(i, floori(t * 20.0), 9) * 6.0), C[5])
	if ready and pts.size() > 1:
		var beat := floori(t * 18.0)
		for i in pts.size():
			if _h(beat, i, 1) > 0.7:
				continue
			var p0: Vector2 = pts[i]
			var p1: Vector2 = pts[(i + 1) % pts.size()]
			var mx := (p0.x + p1.x) / 2.0 + (_h(beat, i, 2) - 0.5) * 8.0
			var my := (p0.y + p1.y) / 2.0 + (_h(beat, i, 3) - 0.5) * 6.0
			_pl(c, p0.x, p0.y, mx, my, C[4])
			_pl(c, mx, my, p1.x, p1.y, C[5])


# =====================================================================================================================
# The renderer's hooks: where a monster's picture is slid to, the colour laid over it, whether it rots, how solid he is, light.

## Where a monster's picture is moved to, game pixels: Avalanche's shove, sliding to where it now is (shiftM3). `key`: its.
func shift_of(key) -> Vector2:
	for s: Dictionary in slides:
		if s["id"] != key:
			continue
		var k := minf(1.0, float(s["t"]) / float(s["dur"]))
		var e := 1.0 - (1.0 - k) * (1.0 - k) * (1.0 - k)
		# (it is drawn where the slide has got to: behind where the rules have it, by what is left)
		var bx := (float(s["x1"]) - float(s["x0"])) * (1.0 - e)
		var by := (float(s["y1"]) - float(s["y0"])) * (1.0 - e)
		return Vector2(R(-(bx - by) * 16.0), R(-(bx + by) * 8.0))
	return Vector2.ZERO


## Whether any picture is being slid now.
func sliding() -> bool:
	return not slides.is_empty()


## A colour laid over a monster's picture, its strength the colour's alpha (none: 0): a crush, Thunder's stun, Frostbite's bite,
## Blight's rot (tintM3). `m`: a monster as the view has it.
func tint_of(m: Dictionary, t: float) -> Color:
	var k = marks.get(m["key"])
	if k != null and k["crush"] < 0.12:
		return Color(Color.WHITE, 0.7)
	var T: PackedColorArray = RAMP["thunder"]
	if k != null and k["thunder"] > 0.0 and float(m["stunT"]) > 0.0:
		return Color(T[5], 0.55) if floori(t * 20.0) % 3 == 0 else Color(T[3], 0.28)
	if float(m["biteDps"]) > 0.0 and (float(m["chillT"]) > 0.0 or float(m["frozenT"]) > 0.0):
		return Color(RAMP["frostbite"][3] if (floori(t * 4.0) + int(m["id"])) % 2 == 0 else Color("#7c9416"), 0.38)
	if k != null and k["blight"] and float(m["poisonT"]) > 0.0:
		return Color(RAMP["blight"][1], 0.25 + 0.4 * (1.0 - maxf(0.0, m["life"]) / maxf(1.0, m["maxLife"])))
	return Color(0, 0, 0, 0)


## The same of a monster itself (fx_figures.gd lays it over its picture where it is stronger than its state's own).
func tint(m: Object) -> Color:
	if not marks.has(m.get_instance_id()) and float(m.get("bite_dps")) <= 0.0:
		return Color(0, 0, 0, 0)
	return tint_of(_mon(m), clock)


## Whether a monster rots by Blight (the effects leave out Poison's bubbles on it: the rot is its sickness) (rotting).
func rotting(m: Object) -> bool:
	if m.poison_t <= 0.0:
		return false
	var k = marks.get(m.get_instance_id())
	return k != null and k["blight"]


## The same of a monster as the view has it (the check's).
func rots(m: Dictionary) -> bool:
	if float(m["poisonT"]) <= 0.0:
		return false
	var k = marks.get(m["key"])
	return k != null and k["blight"]


## Whether a monster's stun is Thunder's (its own look: words3.gd's is not shown on it).
func thunders(m: Object) -> bool:
	var k = marks.get(m.get_instance_id())
	return k != null and k["thunder"] > 0.0


## How solid he is drawn (1: as always): Scald's steam hides him (heroAlphaM3).
func hero_alpha() -> float:
	return 0.6 + 0.08 * sin(clock * 5.0) if hidden else 1.0


## Where these light the dark (lightsM3): `spot` takes a place on the screen (game pixels), how far, how strong.
func lights_to(spot: Callable) -> void:
	if view.is_empty():
		return
	var t := clock
	var lit := PackedFloat64Array()
	for z: Dictionary in view["zones"]:
		var look := look_of(z)
		if look == "":
			continue
		var zx: float = z["x"]
		var zy: float = z["y"]
		var zr: float = z["r"]
		var small := zr < 1.2
		if small:
			var near := false
			var i := 0
			while i < lit.size() and not near:
				near = absf(lit[i] - zx) < 1.0 and absf(lit[i + 1] - zy) < 1.0
				i += 2
			if near:
				continue
			lit.append(zx)
			lit.append(zy)
		var fade := minf(1.0, (float(z["dur"]) - float(z["t"])) * 2.0)
		var x := _wx(zx, zy)
		var y := _wy(zx, zy)
		var base := (30.0 if small else 18.0) + zr * 16.0
		if look == "molten":
			spot.call(x, y - 2, base + 10, 0.85 * fade)
		elif look == "wildfire":
			spot.call(x, y - 4, base + 6, (0.7 + 0.15 * sin(t * 13.0 + zx)) * fade)
		elif look == "smoulder" or look == "fumes":
			spot.call(x, y - 4, base, 0.45 * fade)
		elif look == "thunderhead" or look == "hail" or look == "greenstorm" or look == "crackle":
			spot.call(x, y - 6, base, (0.5 + 0.25 * (1.0 if floori(t * 12.0 + zy) % 3 == 0 else 0.0)) * fade)
		elif look == "boil" or look == "snow" or look == "toxicice" or look == "coldmist":
			spot.call(x, y - 2, base, 0.55 * fade)
		else:
			spot.call(x, y - 2, base, 0.4 * fade)
	for sc: Dictionary in scars:
		var hot := maxf(0.0, 1.0 - float(sc["t"]) / (1.8 if sc["kind"] == "fissure" else 0.7))
		if hot > 0.0 and sc["kind"] != "furrow":
			spot.call(_wx(sc["x"], sc["y"]), _wy(sc["x"], sc["y"]) - 2, 20.0 + float(sc["r"]) * 18.0, 0.8 * hot)
	for col: Dictionary in columns:
		if col["t"] >= 0.0:
			spot.call(_wx(col["x"], col["y"]), _wy(col["x"], col["y"]) - float(col["h"]) * 0.4, 60.0, 0.9 * (1.0 - float(col["t"]) / float(col["dur"])))
	for b: Dictionary in bombs:
		if b["word"] == "eruption" and b["t"] > 0.0:
			var q: float = b["t"] / b["dur"]
			var bx: float = b["x0"] + (b["x1"] - b["x0"]) * q
			var by: float = b["y0"] + (b["y1"] - b["y0"]) * q
			spot.call(_wx(bx, by), _wy(bx, by) - 20, 16.0, 0.6)
	var H: Dictionary = view["hero"]
	if heat > 0:
		spot.call(_wx(H["x"], H["y"]), _wy(H["x"], H["y"]) - 4, 20.0 + heat * 5, 0.5 + 0.08 * heat)
	for m: Dictionary in view["monsters"]:
		if m["dead"] or not m["seen"]:
			continue
		var k = marks.get(m["key"])
		if k != null and k["thunder"] > 0.0 and float(m["stunT"]) > 0.0:
			spot.call(_wx(m["x"], m["y"]), _wy(m["x"], m["y"]) - float(m["top"]) - 8, 20.0, 0.6)


## (into the place's dark: look.gd spot)
func lights() -> void:
	if fx == null or fx.look == null or not is_instance_valid(fx.look):
		return
	lights_to(func(x: float, y: float, r: float, a: float): fx.look.spot(Vector2(x, y), r, a))


# =====================================================================================================================
# The clock, and what the rules said happened.

## Age everything; and what goes on all the time: his meters, the patches' own life, Frostbite's bites, Blight's rot (tickM3).
func tick(dt: float) -> void:
	clock += dt
	for i in range(later.size() - 1, -1, -1):
		if i >= later.size():
			continue
		later[i]["t"] -= dt
		if later[i]["t"] <= 0.0:
			var fn: Callable = later[i]["fn"]
			later.remove_at(i)
			fn.call()
	_age(bolts, dt)
	_age(skies, dt)
	_age(scars, dt)
	_age(columns, dt)
	_age(clamps, dt)
	_age(slides, dt)
	for i in range(bombs.size() - 1, -1, -1):
		bombs[i]["t"] += dt
		if bombs[i]["t"] >= bombs[i]["dur"]:
			var b: Dictionary = bombs[i]
			bombs.remove_at(i)
			# it lands: a lava bomb splashes and burns; a hailstone cracks
			if b["word"] == "eruption":
				var C: PackedColorArray = RAMP["eruption"]
				fx.flames(b["x1"], b["y1"], 0.15, 3, 1.0)
				_fling(b["x1"], b["y1"], 5, _cs([C[5], C[4], C[3]]), {"speed": 1.6, "up": 60.0, "grav": 380.0, "life": 0.4, "z": 2.0, "size": 2.0})
				_ring(b["x1"], b["y1"], 0.35, 0.18, _cs([C[5], C[4], C[3]]))
			elif _r() < 0.5:
				_fling(b["x1"], b["y1"], 2, _cs(["#ffffff", RAMP["hailstorm"][4]]), {"speed": 1.2, "up": 50.0, "grav": 400.0, "life": 0.25, "z": 1.0, "size": 1.0})
	if flash["t"] < 9.0:
		flash["t"] += dt
	if view.is_empty():
		return
	var zones: Array = view["zones"]
	# (a pool of lava or a burning patch is its own fire: the scorch the hit's flame leaves on the floor is drawn over the
	# floor's patches, so none is kept under one, where it would dull it)
	for z: Dictionary in zones:
		var look := look_of(z)
		if look != "molten" and look != "wildfire" and look != "smoulder":
			continue
		var decals: Array = fx.decals
		for i in range(decals.size() - 1, -1, -1):
			var d: Dictionary = decals[i]
			if d["kind"] == "scorch" and sqrt((d["x"] - z["x"]) * (d["x"] - z["x"]) + (d["y"] - z["y"]) * (d["y"] - z["y"])) < z["r"] * 0.8:
				decals.remove_at(i)
	var mons: Array = view["monsters"]
	for key in marks.keys():
		var k: Dictionary = marks[key]
		if k["thunder"] > 0.0:
			k["thunder"] -= dt
			k["thunder0"] += dt
		k["crush"] += dt
		var m = null
		for o: Dictionary in mons:
			if o["key"] == key:
				m = o
				break
		if (m == null and not _kept_of(key)) or (m != null and m["dead"]):
			marks.erase(key)
	# his meters, as the rules hold them
	var H: Dictionary = view["hero"]
	var hv := 0
	var cv := -1
	for i in 3:
		if H["meldBehind"][i] == "eruption":
			hv = maxi(hv, int(H["heat"][i]))
		if H["meldBehind"][i] == "thunder":
			cv = maxi(cv, int(H["hits"][i]))
	heat = hv
	claps = cv
	hidden = false
	for z: Dictionary in zones:
		if z["kind"] == "steam" and not z.get("hostile", false) and sqrt((H["x"] - z["x"]) * (H["x"] - z["x"]) + (H["y"] - z["y"]) * (H["y"] - z["y"])) <= z["r"]:
			hidden = true
			break
	var room: float = fx.room()
	# at full heat he smokes, and sparks fly up off his feet
	if heat >= HEAT_FULL and _r() < 14.0 * dt * room:
		var C: PackedColorArray = RAMP["eruption"]
		var px: float = H["x"] + _rnd(-0.3, 0.3)
		var py: float = H["y"] + _rnd(-0.3, 0.3)
		var z := _rnd(0, 4)
		var vz := _rnd(30, 60)
		_add(px, py, z, 0.0, 0.0, vz, 0.5, C[4], 1.0, -10.0, _cs([C[5], C[4], C[3], "#4a3a36"]))
	# what the patches do all the time
	for z: Dictionary in zones:
		var look := look_of(z)
		if look == "":
			continue
		var r: float = z["r"]
		var zx: float = z["x"]
		var zy: float = z["y"]
		var at := func() -> void:
			var a := _r() * TAU
			var d := sqrt(_r()) * r * 0.85
			_at(zx + cos(a) * d, zy + sin(a) * d)
		var rate := func(n: float) -> bool: return _r() < n * dt * room * minf(1.6, 0.5 + r * 0.6)
		if look == "molten":
			if rate.call(3.0):
				at.call()
				var C: PackedColorArray = RAMP["eruption"]
				var vx := _rnd(-0.4, 0.4)
				var vy := _rnd(-0.4, 0.4)
				var vz := _rnd(40, 80)
				_add(_ax, _ay, 1.0, vx, vy, vz, 0.45, C[4], 2.0, 300.0, _cs([C[5], C[4], C[3], C[1]]))
			if rate.call(1.2):
				at.call()
				_puffs(_ax, _ay, 0.1, 1, _cs(["#6a5048", "#4a3a36", "#2a2220"]), {"up": 22.0, "z": 4.0, "life": 1.0})
		elif look == "wildfire":
			if rate.call(3.0):
				at.call()
				fx.flames(_ax, _ay, 0.1, 1, 1.1)
			if rate.call(2.4):
				at.call()
				var x0 := _ax
				var y0 := _ay
				at.call()
				_bolt(x0, y0, _ax, _ay, RAMP["wildfire"], {"w": 1, "dur": 0.14, "kind": "fire", "z": 4.0, "wob": 0.15})
		elif look == "smoulder":
			if rate.call(2.0):
				at.call()
				var C: PackedColorArray = RAMP["fumes"]
				_puffs(_ax, _ay, 0.05, 1, _cs([C[2], C[1], "#2a2418", "#1a160e"]), {"up": 24.0, "z": 2.0, "life": 1.2})
		elif look == "boil":
			# geysers: a jet of steam bursting up out of it now and then
			if rate.call(1.1):
				at.call()
				var x := _ax
				var y := _ay
				var C: PackedColorArray = RAMP["scald"]
				columns.append({"x": x, "y": y, "t": 0.0, "dur": 0.32, "h": 34.0, "w": 2.0, "word": "scald"})
				_puffs(x, y, 0.1, 4, _cs([C[5], C[4], C[3]]), {"up": 80.0, "z": 4.0, "life": 0.7, "drift": 0.3})
				_fling(x, y, 4, _cs(["#ffffff", C[4]]), {"speed": 1.2, "up": 120.0, "grav": 420.0, "life": 0.5, "z": 20.0, "size": 1.0})
		elif look == "snow":
			# powder blown across it
			if rate.call(4.0):
				at.call()
				var C: PackedColorArray = RAMP["avalanche"]
				var pz := _rnd(1, 6)
				var vz := _rnd(-2, 4)
				var col := _pick(_cs([C[5], C[4]]))
				_add(_ax, _ay, pz, 1.4, -0.4, vz, 0.6, col, 1.0, 0.0)
		elif look == "toxicice" or look == "coldmist":
			if rate.call(1.5):
				at.call()
				var C: PackedColorArray = RAMP["frostbite"]
				var pz := _rnd(2, 8)
				var vz := _rnd(4, 10)
				var col := _pick(_cs([C[5], "#b4cc24", C[4]]))
				_add(_ax, _ay, pz, 0.0, 0.0, vz, 0.8, col, 1.0, 0.0)
		elif look == "rot" or look == "fumes" or look == "crackle":
			if rate.call(1.5):
				at.call()
				if look == "crackle":
					spores(_ax, _ay, 0.1, 1)
				else:
					var C: PackedColorArray = RAMP["blight" if look == "rot" else "fumes"]
					var life := _rnd(0.5, 0.9)
					var pz := _rnd(1, 6)
					var vx := _rnd(-0.2, 0.2)
					var vy := _rnd(-0.2, 0.2)
					var vz := _rnd(8, 18)
					var size := 3.0 if _r() < 0.35 else 2.0
					_add(_ax, _ay, pz, vx, vy, vz, life, C[3], size, -6.0, _cs([C[4], C[3], C[3], C[2]]))
	# (the melded shots' trails: the Warrior throws none)
	# Frostbite's bite: every half second the jaws close again on each chilled one it holds
	var step := floori(float(view.get("time", clock)) * 2.0)
	for m: Dictionary in mons:
		if m["dead"] or not float(m["biteDps"]) > 0.0 or not (float(m["chillT"]) > 0.0 or float(m["frozenT"]) > 0.0):
			continue
		var mk := _mark(m["key"])
		if mk["bite"] == step:
			continue
		mk["bite"] = step
		clamps.append({"id": m["key"], "t": 0.0, "dur": 0.24, "big": false, "at": null})
		if room > 0.3:
			_fling(m["x"], m["y"], 3, _cs(["#b4cc24", "#7c9416"]), {"speed": 0.8, "up": 10.0, "grav": 300.0, "life": 0.4, "z": 12.0, "size": 1.0})
			_puffs(m["x"], m["y"], 0.2, 2, _cs(["#cfe8e8", "#9ad0c0", "#6aa890"]), {"up": 8.0, "z": 10.0, "life": 0.6})
	# Blight's rot: spores and ash off what it rots, the more the lower its life
	for m: Dictionary in mons:
		if m["dead"]:
			continue
		var mk = marks.get(m["key"])
		if mk == null or not mk["blight"] or float(m["poisonT"]) <= 0.0:
			continue
		var lost := 1.0 - maxf(0.0, m["life"]) / maxf(1.0, m["maxLife"])
		if _r() < (2.0 + lost * 10.0) * dt * room:
			var C: PackedColorArray = RAMP["blight"]
			var px: float = m["x"] + _rnd(-0.25, 0.25)
			var py: float = m["y"] + _rnd(-0.25, 0.25)
			var z := _rnd(6, 20)
			var vx := _rnd(-0.2, 0.2)
			var vy := _rnd(-0.2, 0.2)
			var vz := _rnd(6, 16)
			_add(px, py, z, vx, vy, vz, 0.9, C[3], 1.0, -2.0, _cs([C[4], C[3], C[2], C[1]]))


## (where `at` last put a place: the game's `const [x, y] = at()`)
var _ax := 0.0
var _ay := 0.0


func _at(x: float, y: float) -> void:
	_ax = x
	_ay = y


static func _age(list: Array, dt: float) -> void:
	for i in range(list.size() - 1, -1, -1):
		list[i]["t"] += dt
		if list[i]["t"] >= list[i]["dur"]:
			list.remove_at(i)


## (a monster's marks are kept while it is in the fight, though out of the view near him: the game keeps them while it lives)
func _kept_of(key) -> bool:
	if not _live:
		return false
	var o = instance_from_id(int(key)) if key is int else null
	return o != null and is_instance_valid(o) and not o.dead


## The looks, called up by what the rules say happened (eventsM3), one telling at a time, as fx.gd hears it.
func event(e: Dictionary) -> void:
	if _live:
		read()
	var t: String = e.get("t", "")
	if t == "hit" and not e.get("onHero", false) and not e.get("poison", false):
		for w in melds_in(e.get("words")):
			hit_look(w, e["x"], e["y"], 0.8, false)
	elif t == "burst":
		var m = e.get("meld")
		if m is String:
			if m == "scald":
				scald_crack(e["x"], e["y"], e["r"])
			elif m == "eruption":
				eruption_blast(e["x"], e["y"], e["r"])
			elif m == "thunder":
				thunder_clap(e["x"], e["y"], e["r"])
			elif m == "fumes":
				fumes_blast(e["x"], e["y"], e["r"])
			return
		# an area ability carrying a melded word: its look over the whole blast (a whirlwind's turns, small)
		for w in melds_in(e.get("words")):
			if e.get("echo", false):
				continue
			# (a hit's own splash, 'blast' or 'shock', is the hit's: its look is already on the hit)
			var style: String = e.get("style", "")
			if style == "whirl":
				var rx := _rnd(-0.5, 0.5)
				var ry := _rnd(-0.5, 0.5)
				hit_look(w, e["x"] + rx * float(e["r"]), e["y"] + ry * float(e["r"]), 0.6, false)
			elif style == "slam" or style == "nova" or style == "land":
				hit_look(w, e["x"], e["y"], e["r"], true)
	elif t == "arc" and e.get("meld") is String:
		var from_zone := false
		for z: Dictionary in view.get("zones", []):
			if absf(float(z["x"]) - float(e["x0"])) < 0.01 and absf(float(z["y"]) - float(e["y0"])) < 0.01:
				from_zone = true
				break
		arc_look(e["meld"], e, from_zone)
	elif t == "zone" and e.get("meld") is String:
		var look := look_of_kind(e["meld"], e.get("kind"), "zone")
		if look != "" and look != "own":
			laid_look(look, e["x"], e["y"], e["r"])
	elif t == "stun" and e.get("meld") == "thunder":
		var k := _mark(_key_of(e))
		if k["thunder"] <= 0.0:
			k["thunder0"] = 0.0
		k["thunder"] = maxf(k["thunder"], float(e.get("secs", 0.0)))
	elif t == "meldFx":
		if e.get("what", "") == "shove":
			shoved(e, _key_of(e))
		else:
			crushed(e, _key_of(e))
	elif t == "swing" and not e.get("echo", false) and int(e.get("n", 0)) == 0:
		var reach: float = e.get("reach", 1.0)
		for w in melds_in(e.get("words")):
			carry_look(w, e["x"] + e["dx"] * reach * 0.8, e["y"] + e["dy"] * reach * 0.8, e["dx"], e["dy"])
	elif t == "cast" and not e.get("echo", false):
		for w in melds_in(e.get("words")):
			carry_look(w, e["x"] + e["dx"] * 0.5, e["y"] + e["dy"] * 0.5, e["dx"], e["dy"])
	elif t == "text" and e.get("text", "") == "HEAT":
		# full heat: his feet flare
		var C: PackedColorArray = RAMP["eruption"]
		_ring(e["x"], e["y"], 0.9, 0.3, _cs([C[5], C[4], C[3]]), {"closing": true, "heavy": true})
		_fling(e["x"], e["y"], 10, _cs([C[5], C[4]]), {"speed": 1.5, "up": 90.0, "grav": 100.0, "life": 0.5, "z": 2.0, "size": 1.0})


## The key a telling's monster is kept by: the check's, its `id` itself; in the fight, the monster's instance (found by the
## game's number, near where the telling says).
func _key_of(e: Dictionary):
	if not _live:
		return int(e.get("id", -1))
	var id = e.get("id")
	var best = null
	var near := 1e9
	var src = fx.monsters.list if fx.monsters != null and is_instance_valid(fx.monsters) else []
	var at := Vector2(float(e.get("x1", e.get("x", 0.0))), float(e.get("y1", e.get("y", 0.0))))
	for m in src:
		if not is_instance_valid(m) or m.dead:
			continue
		if (id is int or id is float) and int(m.id) == int(id) and int(id) >= 0:
			return m.get_instance_id()
		var d: float = m.world.distance_to(at)
		if d < near and d < 0.6:
			near = d
			best = m
	return best.get_instance_id() if best != null else -1


# =====================================================================================================================
# What it reads, in the fight

## A monster as the looks have it (the game's names).
func _mon(m: Object) -> Dictionary:
	var size = L.FIGURE_SIZE.get(m.art.name if m.art != null else m.kind, L.FIGURE_SIZE.get(m.kind))
	return {"key": m.get_instance_id(), "id": int(m.id) if int(m.id) >= 0 else m.get_instance_id() % 100000, "x": m.world.x, "y": m.world.y,
		"dead": m.dead, "seen": m.seen and m.visible, "top": float(size["top"]) if size != null else 30.0, "half": float(size["half"]) if size != null else 8.0,
		"stunT": m.stun_t, "poisonT": m.poison_t, "chillT": m.chill_t, "frozenT": m.frozen_t, "biteDps": m.bite_dps, "blightT": m.blight_t,
		"life": m.life, "maxLife": m.max_life}


## The rules' state, read afresh once a frame (in the game's names: see `view`).
func read() -> void:
	var f := Engine.get_process_frames()
	if f == _read_frame:
		return
	_read_frame = f
	var h = fx.hero() if fx != null else null
	if h == null:
		view = {}
		return
	var meld := ["", "", ""]
	var behind := ["", "", ""]
	for i in 3:
		var r: Dictionary = h.loadout.r(i)
		meld[i] = r.get("meld") if r.get("meld") is String else ""
		behind[i] = r.get("meld_behind") if r.get("meld_behind") is String else ""
	var hero := {"x": h.world.x, "y": h.world.y, "meld": meld, "meldBehind": behind, "heat": h.melds.heat, "hits": h.melds.hits}
	var zones: Array = fx.wakes.list if fx.wakes != null and is_instance_valid(fx.wakes) else []
	_patched = false
	for z: Dictionary in zones:
		if owns_zone(z):
			_patched = true
			break
	var mons: Array = []
	for m in fx._near:
		if not is_instance_valid(m) or m.dead:
			continue
		var key: int = m.get_instance_id()
		var held: bool = marks.has(key) or m.bite_dps > 0.0 or m.blight_t > 0.0
		if not held:
			for q: Dictionary in clamps:
				if q["id"] == key:
					held = true
					break
		if held:
			mons.append(_mon(m))
	view = {"hero": hero, "zones": zones, "monsters": mons, "time": clock}


## A frame: read, and its clock moved on (fx.gd update).
func update(dt: float) -> void:
	var t0 := Time.get_ticks_usec() if fx.timing else 0
	read()
	tick(dt)
	if fx.timing:
		cost_update += Time.get_ticks_usec() - t0


## (what reading and ticking and what painting cost, microseconds, summed while fx.gd is `timing`: the check's measure)
var cost_update := 0
var cost_paint := 0


## The three layers as fx.gd draws them, timed while it is timing.
func paint(c, layer: int) -> void:
	var t0 := Time.get_ticks_usec() if fx.timing else 0
	if layer == 0:
		draw_floor(c)
	elif layer == 1:
		draw_air(c)
	else:
		draw_over(c)
	if fx.timing:
		cost_paint += Time.get_ticks_usec() - t0


## What it keeps, written out as the check reads it (tools/godot_melds3.ts `kept`).
func kept() -> Dictionary:
	var hx := func(C: PackedColorArray) -> String: return C[3].to_html(false)
	var out := {"bolts": [], "skies": [], "bombs": [], "scars": [], "columns": [], "clamps": [], "slides": [], "marks": [], "later": []}
	for b: Dictionary in bolts:
		out["bolts"].append([Array(b["pts"]), b["t"], b["dur"], hx.call(b["C"]), b["w"], b["kind"], b["z"]])
	for s: Dictionary in skies:
		var forks: Array = []
		for f: Dictionary in s["forks"]:
			forks.append([f["at"], Array(f["offs"])])
		out["skies"].append([s["x"], s["y"], s["top"], Array(s["offs"]), forks, s["t"], s["dur"], hx.call(s["C"]), s["w"]])
	for b: Dictionary in bombs:
		out["bombs"].append([b["x0"], b["y0"], b["x1"], b["y1"], b["t"], b["dur"], b["h"], b["word"]])
	for s: Dictionary in scars:
		var lines: Array = []
		for l in s["lines"]:
			lines.append(Array(l))
		out["scars"].append([s["x"], s["y"], s["r"], s["t"], s["dur"], s["kind"], s["seed"], lines, s["word"]])
	for c: Dictionary in columns:
		out["columns"].append([c["x"], c["y"], c["t"], c["dur"], c["h"], c["w"], c["word"]])
	for c: Dictionary in clamps:
		out["clamps"].append([c["id"], c["t"], c["dur"], c["big"]])
	for s: Dictionary in slides:
		out["slides"].append([s["id"], s["x0"], s["y0"], s["x1"], s["y1"], s["t"], s["dur"], s["frozen"]])
	for id in marks:
		var k: Dictionary = marks[id]
		out["marks"].append([id, k["thunder"], k["thunder0"], k["blight"], k["crush"], k["bite"]])
	out["flash"] = [flash["t"], flash["dur"], (flash["color"] as Color).to_html(false), flash["a"]]
	out["heat"] = heat
	out["claps"] = claps
	out["hidden"] = hidden
	for l: Dictionary in later:
		out["later"].append(l["t"])
	return out


## Once the monsters have stepped: he is drawn fainter in Scald's steam (render.ts: his alpha by heroAlphaM3).
func follow() -> void:
	var h = fx.hero() if fx != null else null
	if h == null or not h.alive:
		return
	var sp = h.get("_sprite")
	if sp is Sprite2D:
		sp.modulate.a = hero_alpha()
