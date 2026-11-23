## THE COLOURS AND TABLES OF WHAT THE FIGHT SHOWS (fx.gd and the fx_*.gd beside it), every one the game's own, taken out of
## it by tools/godot_fxlooks.ts into assets/fx/looks.json, none of them written here by hand:
##   P           the game's palette (art/palette.ts P), by name
##   EL          the elements' ramps, dark to light (art/palette.ts ELEMENT_RAMP): "phys", "fire", "frost", "lightning"
##   HUE         the colour each word shows in as a move is used with it behind (render/fx.ts WORD_HUE)
##   WORD        each word's own colour (art/icons.ts WORD_COLOR): a guardian smoulders in its first word's
##   POWER_HOT, STONE, WIND, MIRROR, FLAME, EMBER, SMOKE, ICE, SNOW, VOLT, BLOOD, VIOLET, VENOM, BUBBLE
##               the effects' own ramps, brightest first (render/fx.ts)
##   MAX_PARTICLES, AMBIENT_EASY, AMBIENT_FULL    how many particles may be alive, and when what only dresses the scene
##               thins out (render/fx.ts)
##   CRACKLE, AIR, STRUCK_STEEL, BLADE, WILD_BLOOD, MATTER, THRUST_POINT, THRUST_POINT_Z    BIG AND WILD (render/wild.ts)
##   HEAVY, DUST, STAGGER, STAGGER_PX, W3_*    Heavy's bronze, its dust, a stagger's length and reach, and the colours its
##               functions write straight into what they draw (render/words3.ts)
##   FIGURE_SIZE the top of each figure's head and half its width, game pixels (art/bestiary.ts)
## And the game's own noise (engine/rng.ts hash2; render/fx.ts hash is the same with no third number) and its way of
## picking and rolling (rnd, pick), for the scripts that follow its effects.
extends RefCounted

const FILE := "res://assets/fx/looks.json"

static var raw := {}
## (THE SAME LOOK WHATEVER THE SOURCE: his words, 23 Nov 2026: “if a bolt of lightning is going to bounce between things from
## different sources, I'd like them to be the same.  Or anything frozen should be frozen in the same way.  Burning same thing”.
## On with fx_m52kit.gd OWN, the melds' words' own looks, off until his yes to the pictures: `same`)
static var _kit = null


static func same() -> bool:
	if _kit == null:
		_kit = load("res://scripts/fx_m52kit.gd")
	return bool(_kit.OWN)


static var P := {}
static var EL := {}
static var HUE := {}
static var WORD := {}
static var POWER_HOT := PackedColorArray()
static var STONE := PackedColorArray()
static var WIND := PackedColorArray()
static var MIRROR := PackedColorArray()
static var FLAME := PackedColorArray()
static var EMBER := PackedColorArray()
static var SMOKE := PackedColorArray()
static var ICE := PackedColorArray()
static var SNOW := PackedColorArray()
static var VOLT := PackedColorArray()
static var BLOOD := PackedColorArray()
static var VIOLET := PackedColorArray()
static var VENOM := PackedColorArray()
static var BUBBLE := PackedColorArray()
static var MAX_PARTICLES := 900
static var AMBIENT_EASY := 140
static var AMBIENT_FULL := 420
static var CRACKLE := PackedColorArray()
static var AIR := PackedColorArray()
static var STRUCK_STEEL := PackedColorArray()
static var BLADE := PackedColorArray()
static var WILD_BLOOD := PackedColorArray()
## (what flies off each kind of monster when it is hit: figure -> {bits: colours, sparks, blood, dust})
static var MATTER := {}
static var THRUST_POINT := 1.05
static var THRUST_POINT_Z := 9.0
static var HEAVY := PackedColorArray()
static var DUST := PackedColorArray()
static var STAGGER := 0.55
static var STAGGER_PX := 7.0
## (the colours words3.ts's functions write straight into what they draw, each in the order they stand there: heavyHit's stone
## thrown up; grit's dark grain; drawCracks's beaten middle, chips, dark slabs, gap (twice) and far ends; drawStun's dark)
static var W3_STONE := PackedColorArray()
static var W3_GRIT := PackedColorArray()
static var W3_CRACKS := PackedColorArray()
static var W3_STUN := PackedColorArray()
static var FIGURE_SIZE := {}


## Read the file, once.
static func ready_up() -> void:
	if not raw.is_empty():
		return
	raw = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	for k in raw["P"]:
		P[k] = Color(str(raw["P"][k]))
	for k in raw["ELEMENT_RAMP"]:
		EL[k] = ramp_of(raw["ELEMENT_RAMP"][k])
	for k in raw["WORD_HUE"]:
		HUE[k] = Color(str(raw["WORD_HUE"][k]))
	for k in raw["WORD_COLOR"]:
		WORD[k] = Color(str(raw["WORD_COLOR"][k]))
	var r: Dictionary = raw["ramps"]
	POWER_HOT = ramp_of(r["POWER_HOT"])
	STONE = ramp_of(r["STONE"])
	WIND = ramp_of(r["WIND"])
	MIRROR = ramp_of(r["MIRROR"])
	FLAME = ramp_of(r["FLAME"])
	EMBER = ramp_of(r["EMBER"])
	SMOKE = ramp_of(r["SMOKE"])
	ICE = ramp_of(r["ICE"])
	SNOW = ramp_of(r["SNOW"])
	VOLT = ramp_of(r["VOLT"])
	BLOOD = ramp_of(r["BLOOD"])
	VIOLET = ramp_of(r["VIOLET"])
	VENOM = ramp_of(r["VENOM"])
	BUBBLE = ramp_of(r["BUBBLE"])
	MAX_PARTICLES = int(raw["limits"]["MAX_PARTICLES"])
	AMBIENT_EASY = int(raw["limits"]["AMBIENT_EASY"])
	AMBIENT_FULL = int(raw["limits"]["AMBIENT_FULL"])
	var w: Dictionary = raw["wild"]
	CRACKLE = ramp_of(w["CRACKLE"])
	AIR = ramp_of(w["AIR"])
	STRUCK_STEEL = ramp_of(w["STRUCK_STEEL"])
	BLADE = ramp_of(w["BLADE"])
	WILD_BLOOD = ramp_of(w["BLOOD"])
	THRUST_POINT = float(w["THRUST_POINT"])
	THRUST_POINT_Z = float(w["THRUST_POINT_Z"])
	for k in w["MATTER"]:
		var m: Dictionary = w["MATTER"][k]
		MATTER[k] = {"bits": ramp_of(m["bits"]), "sparks": bool(m["sparks"]), "blood": bool(m["blood"]), "dust": bool(m["dust"])}
	var w3: Dictionary = raw["words3"]
	HEAVY = ramp_of(w3["HEAVY"])
	DUST = ramp_of(w3["DUST"])
	STAGGER = float(w3["STAGGER"])
	STAGGER_PX = float(w3["STAGGER_PX"])
	W3_STONE = ramp_of(w3["heavyHit"])
	W3_GRIT = ramp_of(w3["grit"])
	W3_CRACKS = ramp_of(w3["drawCracks"])
	W3_STUN = ramp_of(w3["drawStun"])
	FIGURE_SIZE = raw["FIGURE_SIZE"]


## A list of the game's colours ("#rrggbb") as colours.
static func ramp_of(list: Array) -> PackedColorArray:
	var out := PackedColorArray()
	for c in list:
		out.append(Color(str(c)))
	return out


## A ramp turned round (the game's `ramp.slice().reverse()`: an element's, brightest first).
static func turned(ramp: PackedColorArray) -> PackedColorArray:
	var out := ramp.duplicate()
	out.reverse()
	return out


## A ramp without its first colour (the game's `VENOM.slice(1)`).
static func rest(ramp: PackedColorArray) -> PackedColorArray:
	return ramp.slice(1)


## One of a list of colours, any (fx.ts pick).
static func pick(list: PackedColorArray) -> Color:
	return list[randi() % list.size()]


## A number from a to b, any (fx.ts rnd).
static func rnd(a: float, b: float) -> float:
	return a + randf() * (b - a)


## The game's own noise (engine/rng.ts hash2): a steady number from 0 to 1 out of three whole ones, the very same as the
## game's (its sums are of 32 bits: Math.imul), so that a mark made of it looks the same every frame.
static func hash2(x: int, y: int, k := 0) -> float:
	var h := (imul(x, 374761393) + imul(y, 668265263) + imul(k, 2246822519)) & 0xffffffff
	h = imul(h ^ (h >> 13), 1274126177)
	return float(h ^ (h >> 16)) / 4294967296.0


static func imul(a: int, b: int) -> int:
	a &= 0xffffffff
	b &= 0xffffffff
	return ((a & 0xffff) * b + ((((a >> 16) * b) & 0xffff) << 16)) & 0xffffffff
