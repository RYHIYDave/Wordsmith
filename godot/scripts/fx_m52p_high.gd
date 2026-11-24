## THE HIGH CITY'S RUNES MELDED AS THE FIGHT SHOWS THEM (behind melds52.gd HIGH_ON until his yes), painted with the melds' brushes
## (fx_m52kit.gd), from the moments each meld's own twist tells (meldshigh_rules.gd and its parts; on a monster, foe_meldshigh.gd).
## The High City's own acts (the line, the lance, the wound, the thorns, the soul, the spirit, the cull, the mark, the shockwave)
## are drawn as Piercing's, Bleeding's, Reaping's, Culling's and Surging's own are (fx_words7.gd); what is here is each twist's own
## moment, in the meld's own colour (its stone's), shaped as the thing it is:
##   LINES   from where it is to where it goes: a spear's line flashing, a bolt (arcs, forks, jumps), wisps (a soul's flight, a
##           drag), a thrown shard, a beam, a wave rolling down a line, a wall of light standing
##   BURSTS  at a place, wild: a flash, a spray and flying bits (stone, spark, ice, blood, ash), the screen kicked on the heavy ones
##   MARKS   on one struck: drops of blood running, a wound tearing, stars of a stun, a curse's eye, a clock's hand, a cuff and
##           chain, frost spikes, tongues of flame, a sight snapping shut, a skull's grin for the doomed
##   ON HIM  haste's streaks, life's drops coming to him, frenzy's flames, a shield's face, a soul's glint
##   GROUND  what it lays (its cloud, ice, fire, storm, vortex, hex, bubble, ward, snares, bell): a burst where it is laid, and the
##           ground itself as the game draws its kind (wakes.gd)
## BY HIS ART RULEBOOK: as big and wild, kinetic and weighty as it will go; every shape the thing it is, never a plain ball, box or
## ring alone; the heavy ones kick the screen and hold; nothing on his side in the enemy's pink or gold, and what a monster lays on
## him in the enemy's pink burning to gold.
extends "res://scripts/fx_m52kit.gd"

## (how long each kind of moment is drawn)
const LINES := ["fork", "arc", "jump", "soul", "fly", "hurl", "copy", "snip", "throw", "beam", "seek", "cross", "trail", "ground", "cracks",
	"road", "runes", "hex", "band", "row", "wall", "stand", "linger", "flash", "three", "wide", "reach", "path", "rush", "line", "lance",
	"shard", "spread", "drag", "pass", "jolt", "haul", "aside", "back", "twice", "draw", "run", "fly",
	"carry", "stitch", "thread", "jet", "blade", "stream", "drain", "lash", "sight", "shot", "leap", "dart", "thrown", "push", "drink",
	"return", "volley", "flick", "blink", "spears", "lunge", "ghost", "dash", "spark", "zap"]
const BURSTS := {"go": 1.2, "burst": 1.3, "spikes": 1.0, "spray": 1.0, "fling": 1.0, "land": 1.1, "shatter": 1.2, "pyre": 1.3, "quake": 1.5,
	"end": 1.2, "echo": 0.9, "again": 1.1, "slam": 1.5, "landed": 1.0, "toll": 1.0, "bolt": 0.9, "crack": 1.0, "blade": 1.4, "split": 0.9,
	"tear": 1.0, "pour": 1.1, "counted": 0.9, "hang": 0.8, "hour": 0.7, "coup": 0.8, "thud": 1.4, "second": 0.7, "bright": 0.9, "red": 0.8,
	"haunt": 0.8, "rise": 1.0, "orb": 0.7, "take": 0.9, "freeze": 0.9, "go2": 1.0, "deeper": 0.6, "fester": 0.6, "grows": 0.5, "unending": 0.6,
	"bite": 0.8, "gore": 1.1, "open": 1.0, "prick": 0.6, "wider": 0.6, "hook": 0.7, "mercy": 0.9, "purge": 0.8, "brief": 0.7, "tighten": 0.7,
	"surge": 1.0, "drive": 0.7, "gap": 0.9, "cut": 0.6, "charge": 0.6, "ablaze": 0.7, "dose": 0.6, "curse": 0.6, "slow": 0.6, "pin": 0.8,
	"wound": 0.7, "longer": 0.5, "fetch": 0.5, "still": 0.8, "bind": 0.7, "stun": 0.8, "feed": 0.6, "crit": 0.9, "splash": 0.8, "bleed": 0.6,
	"keep": 0.5, "fast": 0.6, "dance": 0.6, "guard": 0.6, "short": 0.5, "two": 0.7, "sign": 0.7, "killmark": 0.8, "lull": 0.9, "snares": 0.9,
	"hail": 0.5, "ring": 1.0, "grow": 0.9, "spark": 0.7, "roll": 1.4, "sooner": 0.5, "spend": 0.9, "prong": 0.5, "reach2": 0.5, "frenzy": 0.6,
	"haste": 0.6, "shield": 0.7, "heal": 0.7, "dodge": 0.5, "wave": 0.5, "cull": 0.5, "foe": 0.8, "stop": 0.5, "caught": 0.8, "stand2": 0.6,
	"heap": 1.5, "stake": 1.4, "needle": 0.8, "seek": 0.7, "rupture": 1.0, "cuts": 0.5, "rot": 1.0, "seep": 0.5, "harden": 0.8,
	"drip": 0.6, "sigil": 0.7, "eye": 0.9, "shade": 0.6, "circle": 0.3, "blink": 0.7, "price": 1.2, "taken": 1.0,
	"rites": 0.9, "maw": 1.0, "blood": 0.8, "fed": 0.6, "sight": 0.8, "jet": 0.8, "pass": 0.8, "push": 0.6, "thrown": 0.6,
	"impale": 0.7, "barb": 0.9, "root": 0.6, "image": 0.8, "hand": 1.1, "wail": 0.9, "shroud": 0.5, "slash": 0.5, "whirl": 0.8,
	"watch": 0.7, "scythe": 1.0, "creep": 0.4, "flood": 1.3, "sweep": 1.0, "blur": 0.5, "rage": 0.7, "gape": 0.8, "shadow": 0.8,
	"stagger": 0.8, "rake": 0.6, "trail2": 0.4}
const GROUNDS := {"cloud": 0.8, "ice": 0.8, "fire": 0.8, "storm": 0.9, "vortex": 0.9, "ward": 0.9, "bubble": 0.9, "snare": 0.8, "rune": 0.8,
	"well": 1.0, "circle": 0.8, "bell": 1.2, "pair": 0.8, "watch": 0.8, "thicket": 0.9, "quick": 0.6, "long": 0.6, "briar": 0.8, "culling": 0.8,
	"grown": 0.9, "rime": 0.8, "burning": 0.8, "charged": 0.9, "cracked": 1.0, "spring": 0.7, "mark": 0.6, "thorns": 0.6, "spirit": 0.6,
	"blow": 0.4, "hold": 0.8, "lances": 0.8, "pool": 0.9, "flurry": 0.8, "spill": 0.8, "throb": 0.9}
## (the heavy ones: the screen kicked, how hard)
const KICK := {"quake": 0.5, "slam": 0.55, "blade": 0.45, "thud": 0.4, "pyre": 0.35, "burst": 0.3, "land": 0.3, "shatter": 0.3, "go": 0.3,
	"roll": 0.4, "cracked": 0.35, "again": 0.3, "toll": 0.25, "gore": 0.3, "spend": 0.3, "end": 0.3, "bell": 0.3,
	"heap": 0.45, "stake": 0.4, "price": 0.3, "rupture": 0.2, "taken": 0.3, "maw": 0.25, "flood": 0.45, "sweep": 0.3, "whirl": 0.25,
	"hand": 0.25, "scythe": 0.25}
## (the melds named for a thing: their own moment drawn as that thing, over what its kind draws)
const SIGN := {"guillotine:blade": "guillotine", "tombstone:thud": "tomb", "gallows:hang": "noose", "noose:tighten": "noose",
	"fishhook:hook": "hook", "gaff:haul": "hook", "pitchfork:prong": "fork", "scissors:snip": "scissors", "fangs:bite": "fangs",
	"impaler:stake": "stake", "witchpin:needle": "needle", "ghoul:maw": "maw", "macabre:dance": "dance", "thornshield:burst": "spikes",
	"lastrites:rites": "rites", "lastrites:pass": "rites", "bastion:ward": "shieldon", "gravewarden:shade": "shieldon",
	"bloodfeast:harden": "harden", "deadeye:eye": "eyeup",
	"spearwall:impale": "stake", "stinger:barb": "barb", "harrow:spikes": "spikes", "thornspray:root": "spikes", "lacerate:deeper": "cuts",
	"wraithstep:image": "image", "undying:hand": "hand", "haunting:wail": "wail", "coup:slash": "cuts", "massacre:whirl": "whirl",
	"deathwatch:watch": "hood", "deathwatch:shadow": "hood", "deathwatch:scythe": "scythe", "harvest:sweep": "scythe",
	"deathwatch:creep": "creep", "purge:flood": "flood", "spearwall:spears": "spears"}
## (the redone melds whose moments are their blood's, in blood's red)
const BLOODY := ["artery", "hemorrhage", "papercut", "bloodfeast", "bloodprice", "bloodharvest", "ghoul", "heartbeat", "thornshield",
	"bloodlance", "lacerate", "bloodrage", "harrow"]
const BLOODY_WHAT := ["burst", "jet", "stream", "draw", "price", "splash", "throb", "pool", "harden", "drain", "drink", "fed", "cut",
	"cuts", "rupture", "maw", "blood", "lash", "spread", "blade", "flurry", "heal", "deeper", "spikes", "gape", "rake", "trail", "rage"]
## (the enemy's pink burning to gold: what a monster's twist lays on him)
static var ENEMY := PackedColorArray([Color("#3a0420"), Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")])
static var BLOOD := PackedColorArray([Color("#1a0204"), Color("#4a0610"), Color("#800818"), Color("#c0202c"), Color("#ff6a5c"), Color("#ffd0c8")])
static var SOUL := PackedColorArray([Color("#101a14"), Color("#2a3e32"), Color("#4a6a58"), Color("#8ab8a0"), Color("#c8ecd8"), Color("#f0fff6")])
static var DUST6 := PackedColorArray([Color("#2a2420"), Color("#4a4038"), Color("#7a6a58"), Color("#a8967c"), Color("#c8b89c"), Color("#e8dcc4")])
static var LIGHT := PackedColorArray([Color("#2a2410"), Color("#6a5a18"), Color("#b09a28"), Color("#fff060"), Color("#fffbd0"), Color("#ffffff")])


func ids() -> Array:
	return M52.T().get("high", [])


## Its colours: the enemy's when a monster's on him; the element's own when it is one (his “I want consistency with my damage”);
## blood's for a wound; a soul's for the dead; else the meld's own.
func _R(b: Dictionary) -> PackedColorArray:
	if b.get("foe", false):
		return ENEMY
	var w: String = b["what"]
	if w in ["fork", "arc", "jump", "bolt", "jolt", "charged", "storm", "spark", "zap"]:
		return LIGHT
	if w in ["freeze", "shatter", "spikes", "crack", "rime", "ice", "hail"]:
		return PackedColorArray(ICE)
	if w in ["ablaze", "pyre", "run", "fire", "burning", "ground"] and str(b["id"]) in ["sunspear", "bloodboil", "cremate", "nova"]:
		return PackedColorArray(FIRE)
	if w in ["wound", "bite", "gore", "open", "tear", "pour", "spray", "bleed", "deeper", "unending", "grows", "fester", "prick", "wider", "red", "hook", "drag"]:
		return BLOOD
	if str(b["id"]) in BLOODY and w in BLOODY_WHAT:
		return BLOOD
	if w in ["soul", "fly", "second", "bright", "rise", "fetch", "longer", "spirit", "haunt", "fast", "dance", "guard", "short", "two", "well",
			"shade", "circle", "leap", "dart", "haul", "blink", "image", "lunge", "ghost", "wail", "hand", "shroud", "creep"]:
		return SOUL
	return ramp(b["id"])


func begin(b: Dictionary, e: Dictionary) -> bool:
	var what: String = b["what"]
	var line := LINES.has(what) and (absf(b["x1"] - b["x"]) + absf(b["y1"] - b["y"]) > 0.05)
	if not line and not BURSTS.has(what) and not GROUNDS.has(what):
		return false
	# (what a monster's twist does to itself or its kin is drawn on it, not on him)
	if b.get("foe", false) and what in ["feed", "throb", "ward", "shade", "eye", "frenzy", "blood", "blink", "rot", "burst", "fed", "pass",
			"blur", "rage", "dash", "stagger", "spray", "soul"] and b.has("x1"):
		b["x"] = b["x1"]
		b["y"] = b["y1"]
		line = false
	b["line"] = line
	b["end"] = 0.55 if line else float(BURSTS.get(what, GROUNDS.get(what, 0.7)))
	# (what stands a while, a wall or a row of spears, is drawn for as long as it stands)
	if b.has("secs") and what in ["wall", "spears"]:
		b["end"] = float(b["secs"])
	if fx == null:
		return true
	var R := _R(b)
	var x: float = b["x"]
	var y: float = b["y"]
	var minor: bool = b.get("minor", false)
	if KICK.has(what) and not minor:
		fx.kick(float(KICK[what]))
	if line:
		# (where it goes: a flash at its end, sparks thrown along it)
		fx.flash(b["x1"], b["y1"], 10.0, 0.8, 0.14, PackedColorArray([Color.WHITE, R[5], R[4]]))
		if not minor:
			fx.spray(b["x1"], b["y1"], 8, PackedColorArray([R[5], R[4], R[3]]), 2.5, 10.0)
		return true
	var big: float = float(BURSTS.get(what, GROUNDS.get(what, 0.7)))
	if minor:
		big *= 0.5
	fx.flash(x, y, 10.0, big, 0.18, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
	fx.spray(x, y, int(6 + big * 10.0), PackedColorArray([R[5], R[4], R[3]]), 2.5 + big * 2.0, 12.0)
	if big >= 1.0:
		fx.glow(x, y, 2.0 + big, 0.5)
	# (what flies off it, as the thing it is)
	var kind := "spark"
	if what in ["quake", "slam", "thud", "land", "cracked", "crack", "landed"]:
		kind = "stone"
	elif what in ["shatter", "spikes", "freeze", "rime", "ice", "hail"]:
		kind = "stone"
		R = PackedColorArray(ICE)
	elif what in ["spray", "gore", "tear", "pour", "bite", "open", "fling", "spring", "bleed"]:
		kind = "dot"
	elif what in ["cloud", "fester", "dose"]:
		kind = "puff"
	var nb := int(4 + big * 8.0)
	for i in nb:
		_bit(x, y, 6.0, kind, DUST6 if kind == "stone" and not what in ["shatter", "spikes", "freeze", "rime", "ice", "hail"] else R, 2.0 + big * 1.6, 0.6, 40 if kind != "puff" else 0, 10, 20 + big * 20.0)
	return true


func paint_floor(b: Dictionary) -> void:
	var what: String = b["what"]
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var fade := 1.0 - u
	var R := _R(b)
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"])
	if GROUNDS.has(what) or what in ["quake", "slam", "cracked", "roll", "toll", "bell", "ring", "lull", "snares", "hang"]:
		# (where it lands or is laid: its edge rolling out, a jagged front, not a plain ring)
		var rr: float = float(b["r"]) * (0.4 + 0.8 * u)
		_front(b["x"], b["y"], rr, R, int(b["seed"]), fade * 0.9, "shock" if what in ["quake", "slam", "cracked", "roll", "toll", "bell"] else "water")
	if b.get("line", false) and what in ["wall", "stand", "linger", "row", "band", "hex", "road", "ground", "cracks", "trail", "runes"]:
		# (what a line leaves standing: a bar of its light along the floor)
		var x1 := _wx(b["x1"], b["y1"])
		var y1 := _wy(b["x1"], b["y1"])
		_ga(0.35 * fade)
		_fs(R[2])
		_line(cx, cy, x1, y1, 7)
		_ga(0.8 * fade)
		_fs(R[4])
		_line(cx, cy, x1, y1, 3)
		_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var what: String = b["what"]
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var fade := 1.0 - u
	var R := _R(b)
	var sd: int = int(b["seed"])
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"]) - 12.0
	var sign: String = SIGN.get(str(b["id"]) + ":" + what, "")
	if sign != "":
		var on_line: bool = b.get("line", false)
		_thing(sign, _wx(b["x1"], b["y1"]) if on_line else cx, (_wy(b["x1"], b["y1"]) - 12.0) if on_line else cy, R, fade, u, b)
	if b.get("line", false):
		var x1 := _wx(b["x1"], b["y1"])
		var y1 := _wy(b["x1"], b["y1"]) - 12.0
		if what in ["fork", "arc", "jump", "jolt", "bolt", "lash", "spark", "zap"]:
			_bolt(cx, cy, x1, y1, R, sd, fade)
		elif what in ["thread", "stitch"]:
			_thread(cx, cy, x1, y1, R, fade, u)
		elif what == "jet":
			# (blood jetting out: drops flung along it, thinning)
			for k in 9:
				var f := minf(1.0, u * 1.8) * float(k + 1) / 9.0
				_drop(cx + (x1 - cx) * f, cy + (y1 - cy) * f - sin(f * PI) * 6.0, R, fade)
		elif what in ["soul", "fly", "drag", "haul", "draw", "back", "spread", "pass", "run", "stream", "drain", "drink", "leap", "dart", "push", "thrown",
				"lunge", "ghost", "blink", "dash"]:
			_wisps(b["x"], b["y"], b["x1"], b["y1"], u, 5, R, sd, 2)
		elif what in ["hurl", "copy", "snip", "throw", "shard", "three", "blade", "return"]:
			# (a thrown thing: a shard flying from here to there, its trail behind)
			var px := cx + (x1 - cx) * minf(1.0, u * 1.6)
			var py := cy + (y1 - cy) * minf(1.0, u * 1.6) - sin(minf(1.0, u * 1.6) * PI) * 10.0
			_ga(0.4 * fade)
			_fs(R[3])
			_line(cx, cy, px, py, 2)
			_shard(px - 2.0, py - 3.0, 5.0, 7.0, R, sd, fade)
		else:
			# (a spear's line flashing: white heart, its colour round it, thinning as it goes)
			var w := 5 if what in ["beam", "rush", "road", "wide", "lance", "line", "carry"] else (1 if what == "sight" else 3)
			_ga(0.35 * fade)
			_fs(R[2])
			_line(cx, cy, x1, y1, w + 4)
			_ga(fade)
			_fs(R[4])
			_line(cx, cy, x1, y1, w)
			_fs(Color.WHITE)
			_line(cx, cy, x1, y1, 1)
			_glow(x1, y1, 14.0, R[5], 0.6 * fade)
			if what == "sight":
				_sight(x1, y1 - 4.0, u, R, fade)
		_ga(1.0)
		return
	match what:
		"wound", "bite", "gore", "open", "tear", "pour", "bleed", "deeper", "unending", "grows", "prick", "wider", "red", "hook", "spray", "jet", "rupture", "cut", "cuts", "price", "splash", "blood", "fed", "gape", "rake", "trail2":
			# (drops of blood running down, more the deeper the wound)
			var nd := 3 + (4 if what in ["open", "pour", "tear", "gore"] else 0)
			for k in nd:
				var dx := (_rh(sd, k) - 0.5) * 14.0
				var dy := u * (10.0 + _rh(sd, k + 9) * 10.0)
				_drop(cx + dx, cy - 4.0 + dy, R, fade)
		"stun", "thud", "aside", "quake", "slam", "stagger":
			_stars(cx, cy - 10.0, 5, PackedColorArray(DUST6) if not b.get("foe", false) else R, fade, t * 6.0)
		"curse", "haunt", "hex", "unending", "condemn", "pass", "seek", "sigil", "drip", "eye":
			_eye(cx, cy - 14.0, R, fade)
		"slow", "still", "hour", "lull", "band", "sooner":
			_hand(cx, cy - 14.0, R, fade, u)
		"bind", "pin", "caught", "tighten", "snare", "hold", "snares":
			_chain(cx, cy - 4.0, R, fade)
		"ablaze", "pyre", "burning", "fire":
			_flames(cx, cy + 12.0, 5, 18.0, 22.0 * (1.0 - u * 0.5), fade, PackedColorArray(FIRE) if not b.get("foe", false) else R, sd)
		"freeze", "spikes", "shatter", "crack":
			for k in 5:
				var ang := k * TAU / 5.0 + 0.3
				_shard(cx + cos(ang) * 8.0 * (0.5 + u), cy + sin(ang) * 4.0 * (0.5 + u), 3.0, 7.0, R, sd + k, fade)
		"gap", "crit", "sign", "mercy", "sight":
			_sight(cx, cy - 4.0, u, R, fade)
		"counted", "take", "killmark", "hang", "taken":
			_skull(cx, cy - 18.0, R, fade)
		"haste", "fast", "rush", "dance", "blur", "dash":
			for k in 4:
				_ga(fade * 0.7)
				_fs(R[4])
				var sy := cy - 6.0 + k * 4.0
				_line(cx - 14.0 - u * 10.0, sy, cx - 4.0 - u * 6.0, sy, 1)
		"heal", "feed", "draw", "orb", "drop":
			for k in 4:
				var a2 := k * TAU / 4.0 + t * 3.0
				_drop(cx + cos(a2) * 8.0 * fade, cy - 8.0 + sin(a2) * 4.0 * fade - u * 10.0, BLOOD if what != "draw" else R, fade)
		"frenzy", "keep", "grow", "rage":
			_flames(cx, cy + 4.0, 4, 14.0, 14.0, fade, R, sd)
		"shield", "guard", "ward":
			_shield_face(cx, cy - 10.0, 14.0, R, fade)
		"soul", "bright", "second", "longer", "fetch", "rise", "spirit", "two", "short", "well", "circle", "blink":
			_wisps(b["x"], b["y"], b["x"], b["y"] - 0.0001, u, 3, SOUL, sd, 2, 6.0, 26.0)
			_glow(cx, cy - 10.0 - u * 14.0, 10.0, SOUL[4], fade * 0.7)
		"dose", "fester", "cloud", "rot", "seep", "shroud":
			for k in 3:
				_glow(cx + (_rh(sd, k) - 0.5) * 14.0, cy - u * 10.0 - k * 3.0, 6.0, R[4], fade * 0.6)
		"charge", "drive", "go", "runes", "rune":
			_glyph(b["id"], cx, cy - 16.0, 2, R[3], R[5], fade)
		"bell", "toll":
			_bell(cx, cy - 22.0, R, fade, u)
	_ga(1.0)


# --- shapes these add ---

## A drop of blood: a point above, round below, its glint.
func _drop(x: float, y: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	_fs(R[2])
	_fill(_ri(x), _ri(y) - 2, 1, 1)
	_fill(_ri(x) - 1, _ri(y) - 1, 3, 3)
	_fs(R[4])
	_fill(_ri(x) - 1, _ri(y) - 1, 1, 1)
	_ga(1.0)


## Stars of a stagger turning round over a head.
func _stars(cx: float, cy: float, n: int, R: PackedColorArray, a: float, spin: float) -> void:
	for k in n:
		var ang := spin + float(k) / n * TAU
		var px := cx + cos(ang) * 8.0
		var py := cy + sin(ang) * 3.0
		_ga(a)
		_fs(R[5])
		_fill(_ri(px), _ri(py) - 1, 1, 3)
		_fill(_ri(px) - 1, _ri(py), 3, 1)
		_glow(px, py, 3.0, R[4], 0.5 * a)


## A curse's eye: lids, the iris, its pupil.
func _eye(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	_fs(R[2])
	for k in range(-5, 6):
		var h := int(round(2.5 * sqrt(maxf(0.0, 1.0 - (k * k) / 30.0))))
		_fill(_ri(cx) + k, _ri(cy) - h, 1, 1)
		_fill(_ri(cx) + k, _ri(cy) + h, 1, 1)
	_fs(R[4])
	_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 3)
	_fs(R[0])
	_fill(_ri(cx), _ri(cy), 1, 1)
	_glow(cx, cy, 8.0, R[4], 0.4 * a)


## A clock's hand going round on its dial (Stilling's slowed time).
func _hand(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	_ga(a * 0.6)
	_fs(R[2])
	for k in 12:
		var ang := k * TAU / 12.0
		_fill(_ri(cx + cos(ang) * 6.0), _ri(cy + sin(ang) * 6.0), 1, 1)
	_ga(a)
	_fs(R[5])
	var ang2 := -PI * 0.5 + u * TAU * 0.4
	_line(cx, cy, cx + cos(ang2) * 5.0, cy + sin(ang2) * 5.0, 1)


## A cuff and the chain from it, over its feet.
func _chain(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	for k in 4:
		_fs(R[3] if k % 2 == 0 else R[4])
		var lx := cx - 9.0 + k * 5.0
		_fill(_ri(lx), _ri(cy) - 1, 4, 1)
		_fill(_ri(lx), _ri(cy) + 1, 4, 1)
		_fill(_ri(lx), _ri(cy), 1, 1)
		_fill(_ri(lx) + 3, _ri(cy), 1, 1)


## The doomed one's skull, grinning over it.
func _skull(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	_fs(R[4])
	_fill(_ri(cx) - 3, _ri(cy) - 3, 7, 4)
	_fill(_ri(cx) - 2, _ri(cy) + 1, 5, 2)
	_fs(R[0])
	_fill(_ri(cx) - 2, _ri(cy) - 2, 2, 2)
	_fill(_ri(cx) + 1, _ri(cy) - 2, 2, 2)
	_fill(_ri(cx) - 1, _ri(cy) + 2, 1, 1)
	_fill(_ri(cx) + 1, _ri(cy) + 2, 1, 1)
	_glow(cx, cy, 9.0, R[4], 0.4 * a)


## A shield's face, its boss glinting.
func _shield_face(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	var w := s * 0.8
	for row in int(s):
		var v := float(row) / s
		var half: float = w * 0.5 * (1.0 if v < 0.55 else (1.0 - (v - 0.55) / 0.45))
		_ga(a)
		_fs(R[1] if row == 0 or row == int(s) - 1 else (R[3] if v < 0.5 else R[2]))
		_fill(_ri(cx - half), _ri(cy - s * 0.5 + row), maxi(1, _ri(half * 2.0)), 1)
	_glow(cx, cy - s * 0.15, 6.0, R[5], 0.5 * a)


## A bell swinging as it tolls.
func _bell(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var sw := sin(u * TAU * 2.0) * 3.0
	_ga(a)
	for row in 9:
		var half := 1.0 + row * 0.55
		_fs(R[4] if row < 3 else R[3])
		_fill(_ri(cx + sw * (row / 9.0) - half), _ri(cy + row), _ri(half * 2.0), 1)
	_fs(R[5])
	_fill(_ri(cx + sw) - 1, _ri(cy) + 9, 2, 2)
	_glow(cx, cy + 5.0, 12.0, R[4], 0.5 * a)


# --- the named things ---

## The thing a meld is named for, over the one it falls on (`u` how far through its moment).
func _thing(sign: String, cx: float, cy: float, R: PackedColorArray, a: float, u: float, b: Dictionary) -> void:
	match sign:
		"guillotine":
			_guillotine(cx, cy, R, a, u)
		"tomb":
			_tomb(cx, cy, R, a, u)
		"noose":
			_noose(cx, cy, R, a, u)
		"hook":
			_hook(cx, cy, R, a, u, b)
		"fork":
			_fork(cx, cy, R, a, u)
		"scissors":
			_scissors(cx, cy, R, a, u)
		"fangs":
			_fangs(cx, cy, R, a, u)
		"stake":
			_stake(cx, cy, R, a, u)
		"needle":
			_needle(cx, cy, R, a, u)
		"maw":
			_maw(cx, cy, R, a, u)
		"dance":
			_dance(cx, cy, R, a, u)
		"spikes":
			_spikes(cx, cy, R, a, u)
		"rites":
			_shield_face(cx, cy - 12.0, 16.0, R, a)
			_flames(cx, cy - 24.0, 1, 2.0, 6.0, a, PackedColorArray(FIRE), int(b["seed"]))
		"shieldon":
			_shield_face(cx, cy - 10.0, 12.0, R, a)
		"harden":
			_shield_face(cx, cy - 10.0, 16.0, BLOOD, a)
		"eyeup":
			_eye(cx, cy - 26.0, R, a)
			_eye(cx, cy - 26.0, R, a * 0.5)
		"barb":
			_barb(cx, cy, R, a, u)
		"cuts":
			_slashes(cx, cy, R, a, u, int(b.get("n", 1)))
		"image":
			_afterimage(cx, cy, a, u)
		"hand":
			_hand_up(cx, cy, a, u)
		"wail":
			_wail(cx, cy, R, a, u)
		"whirl":
			_whirl(cx, cy, R, a, u, float(b.get("r", 1.8)))
		"hood":
			_hood(cx, cy, a, u)
		"scythe":
			_scythe(cx, cy, R, a, u)
		"creep":
			_skull(cx, cy - 6.0, SOUL, a * 0.8)
		"flood":
			_flood(cx, cy, a, u, float(b.get("r", 7.0)))
		"spears":
			if b.has("x1"):
				_spear_row(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 12.0, _wx(b["x1"], b["y1"]), _wy(b["x1"], b["y1"]) - 12.0, R, a, u)
	_ga(1.0)


## A guillotine: two posts and their beam over it, the slanted blade dropping between them and biting at the neck.
func _guillotine(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var top := cy - 34.0
	var neck := cy - 6.0
	_ga(a)
	_fs(DUST6[1])
	_fill(_ri(cx) - 11, _ri(top), 3, _ri(neck - top) + 8)
	_fill(_ri(cx) + 9, _ri(top), 3, _ri(neck - top) + 8)
	_fs(DUST6[3])
	_fill(_ri(cx) - 11, _ri(top), 1, _ri(neck - top) + 8)
	_fill(_ri(cx) + 9, _ri(top), 1, _ri(neck - top) + 8)
	_fs(DUST6[2])
	_fill(_ri(cx) - 13, _ri(top) - 3, 27, 3)
	# (the blade: down in a third of the moment, then held)
	var f := minf(1.0, u / 0.3)
	var by := top + 2.0 + (neck - 6.0 - top) * f * f
	for row in 7:
		_fs(R[4] if row >= 4 else R[3])
		# (its edge slants: the left side lower)
		for col in 17:
			_fill(_ri(cx) - 8 + col, _ri(by) + row + int((16 - col) * 0.35) - 2, 1, 1)
	_fs(Color.WHITE)
	for col in 17:
		_fill(_ri(cx) - 8 + col, _ri(by) + 6 + int((16 - col) * 0.35) - 2, 1, 1)
	if f >= 1.0:
		_glow(cx, neck, 16.0, R[4], a * 0.8 * (1.0 - (u - 0.3) / 0.7))
	_ga(1.0)


## A gravestone dropping onto it: its round top, the cross cut in it, and the dust it throws.
func _tomb(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.22)
	var base := cy + 10.0 - (1.0 - f * f) * 30.0
	var W := 12
	var H := 16
	_ga(a)
	for row in H:
		var half := W * 0.5
		if row < 4:
			half = W * 0.5 * sqrt(maxf(0.0, 1.0 - pow((4.0 - row) / 4.0, 2.0)))
		_fs(STONE[1] if row == H - 1 else (STONE[3] if row < 3 else STONE[2]))
		_fill(_ri(cx - half), _ri(base - H + row), maxi(1, _ri(half * 2.0)), 1)
		_fs(STONE[4])
		_fill(_ri(cx - half), _ri(base - H + row), 1, 1)
	# (the cross cut in it, glowing its meld's colour)
	_fs(R[4])
	_fill(_ri(cx), _ri(base - H) + 3, 1, 8)
	_fill(_ri(cx) - 2, _ri(base - H) + 5, 5, 1)
	_glow(cx, base - H * 0.5, 9.0, R[4], a * 0.5)
	if f >= 1.0:
		# (where it lands: its shadow and the dust)
		_ga(a * 0.5)
		_fs(DUST6[0])
		_fill(_ri(cx) - 8, _ri(base), 17, 2)
		for k in 6:
			var dx := (k - 2.5) * 5.0 * (1.0 + (u - 0.22) * 2.0)
			_fs(DUST6[3])
			_fill(_ri(cx + dx), _ri(base) - 1 - int((u - 0.22) * 8.0 * (1.0 - absf(k - 2.5) / 3.0)), 2, 1)
	_ga(1.0)


## A noose: the rope coming down to its knot's coils and the loop round the neck, drawn tight.
func _noose(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var neck := cy - 4.0
	var loop := 7.0 - 3.0 * minf(1.0, u / 0.4)
	var knot := neck - loop * 0.6 - 4.0
	_ga(a)
	# (the rope, from above)
	_fs(DUST6[3])
	_fill(_ri(cx), _ri(neck - 40.0), 1, _ri(knot - (neck - 40.0)))
	_fs(DUST6[2])
	_fill(_ri(cx) + 1, _ri(neck - 40.0), 1, _ri(knot - (neck - 40.0)))
	# (its knot: the coils)
	for k in 4:
		_fs(R[4] if k % 2 == 0 else R[3])
		_fill(_ri(cx) - 1, _ri(knot) + k * 2 - 6, 4, 1)
	# (the loop)
	for k in 20:
		var ang := k * TAU / 20.0
		_fs(R[4] if sin(ang) < 0.0 else R[3])
		_fill(_ri(cx + cos(ang) * loop), _ri(neck + sin(ang) * loop * 0.45), 2, 1)
	_glow(cx, neck, 10.0, R[4], a * 0.4)
	_ga(1.0)


## A hook: its shank, the bend and the barb, sunk in and hauling (toward where it pulls, if it says).
func _hook(cx: float, cy: float, R: PackedColorArray, a: float, u: float, b: Dictionary) -> void:
	var tug := sin(minf(1.0, u * 2.0) * PI) * 4.0
	var hx := cx - tug
	_ga(a)
	# (the line it hangs on)
	_fs(DUST6[4])
	_fill(_ri(hx) + 3, _ri(cy) - 26, 1, 14)
	# (shank)
	_fs(R[4])
	_fill(_ri(hx) + 3, _ri(cy) - 13, 2, 10)
	# (bend)
	for k in 9:
		var ang := float(k) / 8.0 * PI
		_fill(_ri(hx + cos(ang) * 4.0), _ri(cy - 3.0 + sin(ang) * 4.0), 2, 2)
	# (barb, its point up)
	_fs(R[5])
	_fill(_ri(hx) - 4, _ri(cy) - 7, 2, 4)
	_fill(_ri(hx) - 3, _ri(cy) - 6, 2, 1)
	_glow(hx, cy - 4.0, 9.0, R[4], a * 0.5)
	_ga(1.0)


## A pitchfork's head: three tines driven in, the cross piece and the haft.
func _fork(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var push := minf(1.0, u / 0.25) * 6.0
	var top := cy - 22.0 + push
	_ga(a)
	_fs(DUST6[3])
	_fill(_ri(cx), _ri(top) - 14, 2, 14)
	_fs(R[3])
	_fill(_ri(cx) - 6, _ri(top), 14, 2)
	for k in 3:
		var tx := cx - 6.0 + k * 6.0
		_fs(R[4])
		_fill(_ri(tx), _ri(top) + 2, 2, 12)
		_fs(R[5])
		_fill(_ri(tx), _ri(top) + 13, 2, 2)
	_glow(cx, top + 14.0, 10.0, R[4], a * 0.5)
	_ga(1.0)


## A pair of shears snapping shut on it: two blades crossing at their pivot, their rings behind.
func _scissors(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var open := 0.55 * (1.0 - minf(1.0, u / 0.3))
	var px := cx - 4.0
	var py := cy - 6.0
	_ga(a)
	for s2 in [-1.0, 1.0]:
		var ang: float = s2 * open
		var ex := px + cos(ang) * 14.0
		var ey := py + sin(ang) * 14.0
		_fs(R[4])
		_line(px, py, ex, ey, 2)
		_fs(Color.WHITE)
		_line(px, py, ex, ey, 1)
		# (its ring)
		var rx := px - cos(ang) * 6.0
		var ry := py - sin(ang) * 6.0
		_fs(R[3])
		for k in 10:
			var a2 := k * TAU / 10.0
			_fill(_ri(rx + cos(a2) * 2.5), _ri(ry + sin(a2) * 2.5), 1, 1)
	_fs(R[5])
	_fill(_ri(px) - 1, _ri(py) - 1, 2, 2)
	if u >= 0.3:
		_glow(px + 12.0, py, 10.0, R[4], a * 0.7)
	_ga(1.0)


## Jaws closing on it: an upper and a lower row of fangs meeting.
func _fangs(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var gap := 9.0 * (1.0 - minf(1.0, u / 0.3))
	var mid := cy - 6.0
	_ga(a)
	for s2 in [-1.0, 1.0]:
		var jaw: float = mid + s2 * (gap + 3.0)
		_fs(R[2])
		_fill(_ri(cx) - 9, _ri(jaw) - (2 if s2 < 0.0 else 0), 19, 2)
		# (its teeth, pointing at the other jaw)
		var toward: float = -s2
		for k in 4:
			var tx := cx - 8.0 + k * 5.0
			for row in 4:
				var w2 := 3 - int(row * 0.75)
				var ty: float = jaw + (0.0 if s2 < 0.0 else -1.0) + toward * float(row)
				_fs(R[5] if row >= 2 else R[4])
				_fill(_ri(tx) + (3 - w2) / 2, _ri(ty), maxi(1, w2), 1)
	if u >= 0.3:
		_glow(cx, mid, 10.0, R[4], a * 0.6)
	_ga(1.0)


## A spear-shaft driven into the ground, its haft quivering, the ground cracked round its foot.
func _stake(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.15)
	var foot := cy + 10.0
	var top := foot - 30.0 * f
	var q := sin(u * 40.0) * (1.0 - u) * 2.0
	_ga(a)
	_fs(DUST6[3])
	_line(cx + q, top, cx, foot - 4.0, 2)
	_fs(R[4])
	_fill(_ri(cx) - 1, _ri(foot) - 6, 3, 6)
	_fs(Color.WHITE)
	_fill(_ri(cx), _ri(foot) - 6, 1, 6)
	if f >= 1.0:
		_fs(DUST6[1])
		for k in 5:
			var ang := k * TAU / 5.0 + 0.4
			_line(cx, foot, cx + cos(ang) * (6.0 + u * 8.0), foot + sin(ang) * (3.0 + u * 4.0), 1)
	_glow(cx, foot - 3.0, 12.0, R[4], a * 0.6)
	_ga(1.0)


## A black needle pinning it, its eye and the thread from it.
func _needle(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.2)
	var tip := cy + 6.0
	var top := tip - 22.0
	var off := (1.0 - f) * 14.0
	_ga(a)
	_fs(R[1])
	_line(cx + 3.0, top - off, cx, tip - off, 2)
	_fs(R[4])
	_line(cx + 3.0, top - off, cx + 2.0, top + 4.0 - off, 1)
	_fs(R[0])
	_fill(_ri(cx + 3.0), _ri(top + 1.0 - off), 1, 1)
	_glow(cx, tip, 8.0, R[3], a * 0.5)
	_ga(1.0)


## A ghoul's maw opening in the ground: a ring of teeth closing.
func _maw(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var open := 14.0 * (1.0 - minf(1.0, u / 0.35)) + 4.0
	var y := cy + 10.0
	_ga(a * 0.7)
	_fs(BLOOD[0])
	for k in 24:
		var ang := k * TAU / 24.0
		_fill(_ri(cx + cos(ang) * open * 0.9), _ri(y + sin(ang) * open * 0.4), 2, 1)
	_ga(a)
	for k in 10:
		var ang := k * TAU / 10.0
		var px := cx + cos(ang) * open
		var py := y + sin(ang) * open * 0.45
		var tx := cx + cos(ang) * (open - 5.0)
		var ty := y + sin(ang) * (open - 5.0) * 0.45
		_fs(Color("#f0e6d0"))
		_line(px, py, tx, ty, 1)
	_glow(cx, y, open, BLOOD[3], a * 0.4)
	_ga(1.0)


## A corpse jerking up to dance: grey wisps whirling round a grinning skull.
func _dance(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	for k in 6:
		var ang := t * 9.0 + k * TAU / 6.0
		var px := cx + cos(ang) * 9.0
		var py := cy - 6.0 + sin(ang) * 4.0
		_ga(a * 0.8)
		_fs(SOUL[4] if k % 2 == 0 else SOUL[3])
		_line(px, py, px - cos(ang + 1.2) * 5.0, py - sin(ang + 1.2) * 2.0, 1)
	_skull(cx, cy - 14.0 + sin(t * 18.0) * 2.0, SOUL, a)
	_ga(1.0)


## Thorns bursting out all round: spikes shooting outward.
func _spikes(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var reach := 6.0 + 22.0 * minf(1.0, u / 0.3)
	for k in 12:
		var ang := k * TAU / 12.0 + 0.13
		var x0 := cx + cos(ang) * reach * 0.35
		var y0 := cy + sin(ang) * reach * 0.18
		var x1 := cx + cos(ang) * reach
		var y1 := cy + sin(ang) * reach * 0.5
		_ga(a)
		_fs(R[2])
		_line(x0, y0, x1, y1, 2)
		_fs(R[5])
		_fill(_ri(x1), _ri(y1), 1, 1)
	_ga(1.0)


## A curse's thread stitching one to the next: a dark wavering line, its stitches catching the light.
func _thread(ax: float, ay: float, bx: float, by: float, R: PackedColorArray, a: float, u: float) -> void:
	var n := 14
	var px := ax
	var py := ay
	for k in range(1, n + 1):
		var f := float(k) / n
		var x := ax + (bx - ax) * f
		var y := ay + (by - ay) * f + sin(f * TAU * 2.0 + t * 8.0) * 2.5
		_ga(a)
		_fs(R[1] if k % 2 == 0 else R[3])
		_line(px, py, x, y, 1)
		if k % 3 == 0:
			_fs(R[5])
			_fill(_ri(x), _ri(y), 1, 1)
		px = x
		py = y
	_ga(1.0)


## A barb left in it, swelling green before it bursts.
func _barb(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var sw := 2.0 + u * 5.0
	_ga(a)
	_fs(R[1])
	_line(cx - 5.0, cy - 12.0, cx, cy - 4.0, 1)
	_fs(R[3])
	for row in int(sw * 2.0):
		var half := sw * sqrt(maxf(0.0, 1.0 - pow((row - sw) / sw, 2.0)))
		_fill(_ri(cx - half), _ri(cy - 4.0 - sw + row), maxi(1, _ri(half * 2.0)), 1)
	_fs(R[5])
	_fill(_ri(cx) - 1, _ri(cy - 4.0 - sw) + 1, 1, 1)
	_glow(cx, cy - 4.0, 6.0 + sw, R[4], a * (0.3 + u * 0.4))
	_ga(1.0)


## Slash marks on it, one for each cut, raked across.
func _slashes(cx: float, cy: float, R: PackedColorArray, a: float, u: float, n: int) -> void:
	var f := minf(1.0, u / 0.2)
	for k in clampi(n, 1, 3):
		var ox := (k - (clampi(n, 1, 3) - 1) * 0.5) * 4.0
		var x0 := cx + ox - 5.0
		var y0 := cy - 16.0
		var x1 := x0 + 10.0 * f
		var y1 := y0 + 12.0 * f
		_ga(a)
		_fs(R[3])
		_line(x0, y0, x1, y1, 2)
		_fs(Color.WHITE)
		_line(x0, y0, x1, y1, 1)
	_ga(1.0)


## A grey afterimage of him where he stood, fading.
func _afterimage(cx: float, cy: float, a: float, u: float) -> void:
	_ga(a * 0.55)
	_fs(SOUL[3])
	_fill(_ri(cx) - 3, _ri(cy) - 18, 6, 6)
	_fill(_ri(cx) - 4, _ri(cy) - 12, 8, 10)
	_fill(_ri(cx) - 4, _ri(cy) - 2, 3, 8)
	_fill(_ri(cx) + 1, _ri(cy) - 2, 3, 8)
	_fs(SOUL[5])
	_fill(_ri(cx) - 1, _ri(cy) - 16, 1, 1)
	_fill(_ri(cx) + 1, _ri(cy) - 16, 1, 1)
	_glow(cx, cy - 8.0, 12.0, SOUL[4], a * 0.4)
	_ga(1.0)


## A dead hand bursting up from the ground, its fingers clawing, then closing.
func _hand_up(cx: float, cy: float, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.25)
	var base := cy + 10.0
	var top := base - 16.0 * f
	_ga(a)
	_fs(SOUL[2])
	_fill(_ri(cx) - 3, _ri(top) + 6, 7, _ri(base - top) - 6)
	var close := minf(1.0, maxf(0.0, (u - 0.35) / 0.3))
	for k in 4:
		var fx := cx - 4.0 + k * 3.0
		var tip := top - 5.0 + close * 4.0
		_fs(SOUL[3])
		_line(fx, top + 6.0, fx + (cx - fx) * close * 0.6, tip, 1)
	_fs(SOUL[3])
	_line(cx + 4.0, top + 9.0, cx + 7.0 - close * 3.0, top + 4.0, 1)
	_fs(DUST6[1])
	_fill(_ri(cx) - 7, _ri(base), 15, 2)
	_glow(cx, top + 4.0, 9.0, SOUL[4], a * 0.4)
	_ga(1.0)


## A ghost's wail: rings of sound spreading from it, a gaping mouth.
func _wail(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	for k in 3:
		var rr := 6.0 + (u * 18.0 + k * 6.0)
		_ga(a * (1.0 - k * 0.25) * (1.0 - u))
		_fs(SOUL[4])
		for j in 18:
			var ang := j * TAU / 18.0
			_fill(_ri(cx + cos(ang) * rr), _ri(cy - 8.0 + sin(ang) * rr * 0.5), 1, 1)
	_ga(a)
	_fs(SOUL[1])
	_fill(_ri(cx) - 2, _ri(cy) - 12, 4, 6)
	_ga(1.0)


## A whirl of blades round him, spinning out.
func _whirl(cx: float, cy: float, R: PackedColorArray, a: float, u: float, r: float) -> void:
	var rr := r * 16.0 * (0.4 + u * 0.8)
	for k in 6:
		var ang := t * 14.0 + k * TAU / 6.0
		var px := cx + cos(ang) * rr
		var py := cy + sin(ang) * rr * 0.5
		_ga(a)
		_fs(R[4])
		_line(px, py, px + cos(ang + 1.6) * 7.0, py + sin(ang + 1.6) * 3.5, 2)
		_fs(Color.WHITE)
		_line(px, py, px + cos(ang + 1.6) * 7.0, py + sin(ang + 1.6) * 3.5, 1)
	_ga(1.0)


## A reaper's hooded shadow standing over it, watching.
func _hood(cx: float, cy: float, a: float, u: float) -> void:
	var top := cy - 34.0
	_ga(a * 0.75)
	for row in 26:
		var half := 3.0 + row * 0.28 if row > 6 else 3.0 + row * 0.5
		_fs(Color("#0c0a12") if row % 5 != 0 else Color("#1c1826"))
		_fill(_ri(cx - half), _ri(top + row), _ri(half * 2.0), 1)
	_fs(Color("#e8e0ff"))
	_fill(_ri(cx) - 2, _ri(top) + 5, 1, 1)
	_fill(_ri(cx) + 1, _ri(top) + 5, 1, 1)
	_ga(1.0)


## A scythe's blade sweeping round, its arc of light behind it.
func _scythe(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var sweep := minf(1.0, u / 0.35) * PI * 1.2
	var rr := 22.0
	_ga(a * 0.6)
	_fs(R[3])
	var n := 16
	for k in n:
		var ang := -PI * 0.6 + sweep * float(k) / n
		_fill(_ri(cx + cos(ang) * rr), _ri(cy - 6.0 + sin(ang) * rr * 0.5), 2, 1)
	var ang2 := -PI * 0.6 + sweep
	var bx := cx + cos(ang2) * rr
	var by := cy - 6.0 + sin(ang2) * rr * 0.5
	_ga(a)
	_fs(DUST6[2])
	_line(cx, cy - 6.0, bx, by, 1)
	_fs(Color.WHITE)
	_line(bx, by, bx + cos(ang2 + 1.9) * 9.0, by + sin(ang2 + 1.9) * 5.0, 2)
	_fs(R[4])
	_line(bx, by + 1.0, bx + cos(ang2 + 1.9) * 9.0, by + 1.0 + sin(ang2 + 1.9) * 5.0, 1)
	_ga(1.0)


## A white light flooding out from him, far and wide.
func _flood(cx: float, cy: float, a: float, u: float, r: float) -> void:
	var rr := r * 16.0 * minf(1.0, u / 0.4)
	_glow(cx, cy, rr, Color("#fffbe8"), a * 0.5 * (1.0 - u))
	_ga(a * (1.0 - u))
	_fs(Color.WHITE)
	for k in 48:
		var ang := k * TAU / 48.0
		_fill(_ri(cx + cos(ang) * rr), _ri(cy + sin(ang) * rr * 0.5), 2, 1)
	_ga(1.0)


## A row of spears standing up across a line, their points catching the light.
func _spear_row(ax: float, ay: float, bx: float, by: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.12)
	var n := 9
	for k in n:
		var g := float(k) / (n - 1)
		var x := ax + (bx - ax) * g
		var y := ay + (by - ay) * g + 12.0
		var h := 14.0 * f
		_ga(a)
		_fs(DUST6[3])
		_line(x, y, x + 1.0, y - h, 1)
		_fs(R[5])
		_fill(_ri(x + 1.0), _ri(y - h) - 2, 1, 2)
	_ga(1.0)
