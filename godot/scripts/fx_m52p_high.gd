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
	"return", "volley", "flick", "blink", "spears", "lunge", "ghost", "dash", "spark", "zap", "javelin", "breach", "thrust"]
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
	"finish": 1.1, "thornring": 0.9,
	"impale": 0.7, "barb": 0.9, "root": 0.6, "image": 0.8, "hand": 1.1, "wail": 0.9, "shroud": 0.5, "slash": 0.5, "whirl": 0.8,
	"watch": 0.7, "scythe": 1.0, "creep": 0.4, "flood": 1.3, "sweep": 1.0, "blur": 0.5, "rage": 0.7, "gape": 0.8, "shadow": 0.8,
	"stagger": 0.8, "rake": 0.6, "trail2": 0.4}
const GROUNDS := {"cloud": 0.8, "ice": 0.8, "fire": 0.8, "storm": 0.9, "vortex": 0.9, "ward": 0.9, "bubble": 0.9, "snare": 0.8, "rune": 0.8,
	"well": 1.0, "circle": 0.8, "bell": 1.2, "pair": 0.8, "watch": 0.8, "thicket": 0.9, "quick": 0.6, "long": 0.6, "briar": 0.8, "culling": 0.8,
	"grown": 0.9, "rime": 0.8, "burning": 0.8, "charged": 0.9, "cracked": 1.0, "spring": 0.7, "mark": 0.6, "thorns": 0.6, "spirit": 0.6,
	"blow": 0.4, "hold": 0.8, "lances": 0.8, "pool": 0.9, "flurry": 0.8, "spill": 0.8, "throb": 0.9}
## (the heavy ones: the screen kicked, how hard, in game pixels, as the game's own melds kick theirs: Volatile's 3 to 11, the city's
## 1.5 to 3; his Art Rulebook's Animations: “the screen kicks on big casts and hits”)
const KICK := {"quake": 3.0, "slam": 3.3, "blade": 2.7, "thud": 2.4, "pyre": 2.1, "burst": 1.8, "land": 1.8, "shatter": 1.8, "go": 1.8,
	"roll": 2.4, "cracked": 2.1, "again": 1.8, "toll": 1.5, "gore": 1.8, "spend": 1.8, "end": 1.8, "bell": 1.8,
	"heap": 2.7, "stake": 2.4, "price": 1.8, "rupture": 1.2, "taken": 1.8, "maw": 1.5, "flood": 2.7, "sweep": 1.8, "whirl": 1.5,
	"hand": 1.5, "scythe": 1.5}
## (the melds named for a thing: their own moment drawn as that thing, over what its kind draws)
const SIGN := {"guillotine:blade": "guillotine", "tombstone:thud": "tomb", "gallows:hang": "noose", "noose:tighten": "noose",
	"fishhook:hook": "hook", "gaff:haul": "hook", "pitchfork:prong": "fork", "scissors:snip": "scissors", "fangs:bite": "fangs",
	"impaler:stake": "stake", "witchpin:needle": "needle", "ghoul:maw": "maw", "macabre:dance": "dance", "thornshield:burst": "spikes",
	"lastrites:rites": "rites", "lastrites:pass": "rites", "bastion:ward": "shieldon", "gravewarden:shade": "shieldon",
	"bloodfeast:harden": "harden", "deadeye:eye": "eyeup",
	"spearwall:impale": "stake", "stinger:barb": "barb", "harrow:spikes": "spikes", "thornspray:root": "spikes", "lacerate:deeper": "cuts",
	"wraithstep:image": "image", "undying:hand": "hand", "haunting:wail": "wail", "coup:slash": "cuts", "massacre:whirl": "whirl",
	"deathwatch:watch": "hood", "deathwatch:shadow": "hood", "deathwatch:scythe": "scythe", "harvest:sweep": "scythe",
	"deathwatch:creep": "creep", "purge:flood": "flood", "spearwall:spears": "spears", "bloodwave:thornring": "spikes"}
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
	if w in ["freeze", "shatter", "spikes", "crack", "rime", "ice", "hail"] and not (w == "spikes" and str(b["id"]) in BLOODY):
		return PackedColorArray(ICE)
	if w in ["ablaze", "pyre", "run", "fire", "burning", "ground"] and str(b["id"]) in ["sunspear", "bloodboil", "cremate", "nova"]:
		return PackedColorArray(FIRE)
	if w in ["wound", "bite", "gore", "open", "tear", "pour", "spray", "bleed", "deeper", "unending", "grows", "fester", "prick", "wider", "red", "hook", "drag", "thornring"]:
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
		b["stay"] = true
		line = false
	b["line"] = line
	b["end"] = 0.55 if line else float(BURSTS.get(what, GROUNDS.get(what, 0.7)))
	# (what stands a while, a wall or a row of spears, is drawn for as long as it stands)
	if b.has("secs") and what in ["wall", "spears"]:
		b["end"] = float(b["secs"])
	# (an after-image is of him as he stood when it began)
	if SIGN.get(str(b["id"]) + ":" + what, "") == "image":
		_catch_ghost(b)
	# (Pitchfork's fork is driven down where its second prong goes, ahead of him, never over him: Animations 4)
	if str(b["id"]) == "pitchfork" and what == "prong" and fx != null and fx.hero() != null:
		var hh = fx.hero()
		var at: Vector2 = hh.world + (hh.face as Vector2) * 1.6
		b["x"] = at.x
		b["y"] = at.y
		b["stay"] = true
	if fx == null:
		return true
	var R := _R(b)
	var x: float = b["x"]
	var y: float = b["y"]
	var minor: bool = b.get("minor", false)
	if KICK.has(what) and not minor:
		fx.kick(float(KICK[what]))
		# (HEAVY BLOWS LAND WITH A FREEZE, his Art Rulebook's Movement 7: a Heavy or Volatile meld's landing or blast holds a tenth of
		# a second, as the game's own Heavy and Volatile melds do: fx_melds52.gd HOLDS)
		if _heavy(str(b["id"])):
			fx.hold(0.12 if what in ["quake", "slam", "heap", "flood", "roll"] else 0.1)
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
	elif what in ["shatter", "spikes", "freeze", "rime", "ice", "hail"] and not (what == "spikes" and str(b["id"]) in BLOODY):
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
			_shard(px - 3.0, py - 5.0, 7.0, 11.0, R, sd, fade)
			_glow(px, py - 4.0, 8.0, R[4], 0.5 * fade)
		else:
			# (a spear's line flashing: white heart, its colour round it, thinning as it goes)
			var w := 5 if what in ["beam", "rush", "road", "wide", "lance", "line", "carry", "javelin", "breach", "thrust"] else (1 if what == "sight" else 3)
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
			# (speed lines streaming off it, white at their heads)
			for k in 5:
				var sy := cy - 16.0 + k * 5.0
				var ln := 16.0 + u * 14.0 + _rh(sd, k) * 8.0
				var hx := cx - 6.0 - u * 6.0 - _rh(sd, k + 7) * 4.0
				_ga(fade * 0.85)
				_fs(R[3])
				_line(hx - ln, sy, hx, sy, 2)
				_fs(R[5])
				_line(hx - 6.0, sy, hx, sy, 1)
				_fs(Color.WHITE)
				_fill(_ri(hx), _ri(sy), 1, 1)
		"heal", "feed", "draw", "orb", "drop":
			for k in 6:
				var a2 := k * TAU / 6.0 + t * 3.0
				_drop(cx + cos(a2) * 14.0 * fade, cy - 8.0 + sin(a2) * 6.0 * fade - u * 12.0, BLOOD if what != "draw" else R, fade)
			_glow(cx, cy - 8.0 - u * 12.0, 12.0, (BLOOD if what != "draw" else R)[4], 0.4 * fade)
		"frenzy", "keep", "grow", "rage":
			_flames(cx, cy + 6.0, 6, 20.0, 22.0, fade, R, sd)
		"shield", "guard", "ward":
			# (over its head, clear of him or what it guards: Animations 4)
			_shield_face(cx, cy - 34.0, 20.0, R, fade)
		"soul", "bright", "second", "longer", "fetch", "rise", "spirit", "two", "short", "well", "circle", "blink":
			# (a soul going up off it: wisps of it rising and turning, its light going up with them)
			_wisps(b["x"], b["y"], b["x"], b["y"] - 0.0001, u, 5, SOUL, sd, 2, 6.0, 36.0)
			_glow(cx, cy - 10.0 - u * 18.0, 15.0, SOUL[4], fade * 0.8)
			for k in 3:
				var ang := t * 5.0 + k * TAU / 3.0
				_fs(SOUL[5])
				_ga(fade)
				_fill(_ri(cx + cos(ang) * (6.0 + u * 6.0)), _ri(cy - 14.0 - u * 18.0 + sin(ang) * 3.0), 2, 2)
		"dose", "fester", "cloud", "rot", "seep", "shroud":
			# (its cloud billowing up off it: curls of it rolling, lit on top, and its sickly light)
			for k in 4:
				var bx := cx + (_rh(sd, k) - 0.5) * 22.0
				var by := cy + 4.0 - u * 14.0 - k * 4.0
				_curl(bx, by, 9.0 + 4.0 * _rh(sd, k + 3) + u * 4.0, [R[1], R[3], R[4]], sd + k, fade * 0.9)
			_glow(cx, cy - u * 10.0, 14.0, R[4], fade * 0.45)
		"charge", "drive", "go", "runes", "rune":
			_glyph(b["id"], cx, cy - 16.0, 2, R[3], R[5], fade)
		"bell", "toll":
			_bell(cx, cy - 22.0, R, fade, u)
	_ga(1.0)


# --- shapes these add ---

## A drop of blood: its point above, swelling round below, lit on its left, a glint on its shoulder, its dark side to the lower right.
func _drop(x: float, y: float, R: PackedColorArray, a: float) -> void:
	var ix := _ri(x)
	var iy := _ri(y)
	var rows := [1, 1, 3, 3, 5, 5, 3]
	_ga(a)
	for k in rows.size():
		var w: int = rows[k]
		var x0 := ix - w / 2
		var yy := iy - 5 + k
		_fs(R[3])
		_fill(x0, yy, w, 1)
		if w >= 3:
			_fs(R[4])
			_fill(x0, yy, 1, 1)
			_fs(R[2])
			_fill(x0 + w - 1, yy, 1, 1)
	_fs(R[2])
	_fill(ix - 1, iy + 2, 3, 1)
	_fs(R[5])
	_fill(ix - 1, iy - 1, 1, 1)
	_ga(1.0)


## Stars of a stagger turning round over a head: four-pointed, twinkling, each with its glint and its light.
func _stars(cx: float, cy: float, n: int, R: PackedColorArray, a: float, spin: float) -> void:
	for k in n:
		var ang := spin + float(k) / n * TAU
		var px := _ri(cx + cos(ang) * 13.0)
		var py := _ri(cy + sin(ang) * 5.0)
		# (the near half of the circle brighter than the far)
		var near := sin(ang) > 0.0
		var arm := 3 + int(1.5 + 1.5 * sin(t * 12.0 + k * 1.7))
		_ga(a * (1.0 if near else 0.7))
		_fs(R[4])
		_fill(px, py - arm, 1, arm * 2 + 1)
		_fill(px - arm, py, arm * 2 + 1, 1)
		_fs(R[3])
		_fill(px - 1, py - 1, 1, 1)
		_fill(px + 1, py + 1, 1, 1)
		_fill(px + 1, py - 1, 1, 1)
		_fill(px - 1, py + 1, 1, 1)
		_fs(R[5])
		_fill(px - 1, py, 3, 1)
		_fill(px, py - 1, 1, 3)
		_fs(Color.WHITE)
		_fill(px, py, 1, 1)
		_glow(px, py, 5.0, R[4], 0.6 * a)
	_ga(1.0)


## A curse's eye opening over it: its lids and lashes, the dark within, the iris lit from the upper left, a slit of a pupil, a glint.
func _eye(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	var ix := _ri(cx)
	var iy := _ri(cy)
	_ga(a)
	for k in range(-10, 11):
		var h := int(round(5.0 * sqrt(maxf(0.0, 1.0 - float(k * k) / 110.0))))
		# (the dark within)
		if h > 0:
			_fs(R[0])
			_fill(ix + k, iy - h + 1, 1, maxi(1, h * 2 - 1))
		# (the upper lid, heavy; the lower, lit)
		_fs(R[1])
		_fill(ix + k, iy - h - 1, 1, 1)
		_fs(R[2])
		_fill(ix + k, iy - h, 1, 1)
		_fs(R[3])
		_fill(ix + k, iy + h, 1, 1)
	# (its lashes, flicking up off the lid)
	_fs(R[2])
	for k in 5:
		var lx := ix - 8 + k * 4
		var lh := int(round(5.0 * sqrt(maxf(0.0, 1.0 - float((lx - ix) * (lx - ix)) / 110.0))))
		_line(lx, iy - lh - 2, lx + (lx - ix) * 0.25, iy - lh - 5, 1)
	# (the iris)
	for dy in range(-3, 4):
		var hw := int(round(sqrt(maxf(0.0, 12.25 - float(dy * dy)))))
		for dx in range(-hw, hw + 1):
			_fs(R[5] if dx + dy < -3 else (R[4] if dx + dy < 2 else R[3]))
			_fill(ix + dx, iy + dy, 1, 1)
	_fs(R[0])
	_fill(ix, iy - 2, 1, 5)
	_fs(Color.WHITE)
	_fill(ix - 2, iy - 2, 1, 1)
	_glow(cx, cy, 14.0, R[4], 0.5 * a)
	_ga(1.0)


## A clock's dial over it, its hand going round (Stilling's slowed time): the rim, the hours (the quarters bolder), a hand and a
## sweeping second hand, its light.
func _hand(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var r := 11.0
	_ga(a * 0.85)
	_fs(R[2])
	for k in 28:
		var ang := k * TAU / 28.0
		_fill(_ri(cx + cos(ang) * r), _ri(cy + sin(ang) * r), 2, 1)
	for k in 12:
		var ang := k * TAU / 12.0
		var q := k % 3 == 0
		_fs(R[4] if q else R[3])
		_fill(_ri(cx + cos(ang) * (r - 2.5)), _ri(cy + sin(ang) * (r - 2.5)), 2 if q else 1, 2 if q else 1)
	_ga(a)
	var ang2 := -PI * 0.5 + u * TAU * 0.4
	_fs(R[5])
	_line(cx, cy, cx + cos(ang2) * 8.0, cy + sin(ang2) * 8.0, 2)
	_fs(Color.WHITE)
	_line(cx, cy, cx + cos(ang2) * 7.0, cy + sin(ang2) * 7.0, 1)
	var ang3 := -PI * 0.5 + u * TAU * 2.4
	_fs(R[4])
	_line(cx, cy, cx + cos(ang3) * 9.0, cy + sin(ang3) * 9.0, 1)
	_fs(R[5])
	_fill(_ri(cx) - 1, _ri(cy) - 1, 2, 2)
	_glow(cx, cy, 13.0, R[4], 0.45 * a)
	_ga(1.0)


## A cuff and the chain from it, over its feet: links lying flat and links on their edge, one through the next, each lit on top, and
## the iron cuff with its rivet.
func _chain(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	var ix := _ri(cx)
	var iy := _ri(cy)
	_ga(a)
	for k in 5:
		var lx := ix - 16 + k * 6
		if k % 2 == 0:
			# (a link lying flat: an oval of iron, its hole dark)
			_fs(R[3])
			_fill(lx + 1, iy - 2, 6, 1)
			_fill(lx + 1, iy + 2, 6, 1)
			_fill(lx, iy - 1, 1, 3)
			_fill(lx + 7, iy - 1, 1, 3)
			_fs(R[5])
			_fill(lx + 1, iy - 2, 3, 1)
			_fs(R[1])
			_fill(lx + 3, iy + 2, 4, 1)
		else:
			# (a link on its edge: a bar)
			_fs(R[4])
			_fill(lx, iy - 1, 8, 1)
			_fs(R[2])
			_fill(lx, iy, 8, 1)
	# (the cuff)
	_fs(R[1])
	_fill(ix + 14, iy - 5, 5, 10)
	_fs(R[3])
	_fill(ix + 14, iy - 5, 2, 10)
	_fs(R[5])
	_fill(ix + 16, iy - 1, 1, 1)
	_ga(1.0)


## The doomed one's skull, grinning over it: its dome lit from the upper left, deep sockets with a spark in each, the hole of its
## nose, its teeth and jaw.
func _skull(cx: float, cy: float, R: PackedColorArray, a: float) -> void:
	var ix := _ri(cx)
	var top := _ri(cy) - 8
	var widths := [5, 9, 11, 13, 13, 13, 13, 11, 9, 9, 7, 7]
	_ga(a)
	for row in widths.size():
		var w: int = widths[row]
		var x0 := ix - w / 2
		_fs(R[4])
		_fill(x0, top + row, w, 1)
		_fs(R[5])
		_fill(x0, top + row, mini(2, w), 1)
		_fs(R[3])
		_fill(x0 + w - 2, top + row, 2, 1)
	# (its sockets, its nose, its teeth)
	_fs(R[0])
	_fill(ix - 5, top + 4, 4, 3)
	_fill(ix + 2, top + 4, 4, 3)
	_fill(ix - 4, top + 7, 2, 1)
	_fill(ix + 3, top + 7, 2, 1)
	_fill(ix, top + 7, 1, 2)
	_fs(R[1])
	for k in 4:
		_fill(ix - 3 + k * 2, top + 9, 1, 2)
	_fs(R[2])
	_fill(ix - 4, top + 11, 9, 1)
	_fs(Color.WHITE)
	_fill(ix - 4, top + 5, 1, 1)
	_fill(ix + 3, top + 5, 1, 1)
	_glow(cx, cy, 13.0, R[4], 0.5 * a)
	_ga(1.0)


## A shield's face: a heater shield, dark-rimmed, its face lit from the upper left, a stripe down it and its boss glinting.
func _shield_face(cx: float, cy: float, s: float, R: PackedColorArray, a: float) -> void:
	var w := s * 0.8
	var rows := int(s)
	for row in rows:
		var v := float(row) / s
		var half: float = w * 0.5 * (1.0 if v < 0.55 else (1.0 - (v - 0.55) / 0.45))
		var x0 := _ri(cx - half)
		var ww := maxi(1, _ri(half * 2.0))
		_ga(a)
		_fs(R[1] if row == 0 or row == rows - 1 else (R[3] if v < 0.5 else R[2]))
		_fill(x0, _ri(cy - s * 0.5 + row), ww, 1)
		if row > 0 and row < rows - 1 and ww > 3:
			_fs(R[0])
			_fill(x0 + ww - 1, _ri(cy - s * 0.5 + row), 1, 1)
			_fs(R[4])
			_fill(x0, _ri(cy - s * 0.5 + row), 1, 1)
			_fs(R[4] if v < 0.5 else R[3])
			_fill(_ri(cx), _ri(cy - s * 0.5 + row), 1, 1)
	_fs(R[5])
	_fill(_ri(cx) - 1, _ri(cy - s * 0.15) - 1, 3, 3)
	_fs(Color.WHITE)
	_fill(_ri(cx) - 1, _ri(cy - s * 0.15) - 1, 1, 1)
	_glow(cx, cy - s * 0.15, s * 0.6, R[5], 0.55 * a)


## A bell swinging as it tolls: its crown, its shoulder lit, its body flaring to the lip, the clapper striking, and its sound going out.
func _bell(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var sw := sin(u * TAU * 2.0) * 4.0
	_ga(a)
	_fs(R[2])
	_fill(_ri(cx) - 1, _ri(cy) - 3, 3, 3)
	for row in 15:
		var half := 2.0 + row * 0.45
		if row >= 11:
			half += (row - 10) * 1.1
		var x0 := _ri(cx + sw * (row / 15.0) - half)
		var ww := _ri(half * 2.0)
		_fs(R[4] if row < 4 else R[3])
		_fill(x0, _ri(cy + row), ww, 1)
		_fs(R[5])
		_fill(x0 + 1, _ri(cy + row), 1, 1)
		_fs(R[1])
		_fill(x0 + ww - 1, _ri(cy + row), 1, 1)
	_fs(R[1])
	_fill(_ri(cx + sw - 8.5), _ri(cy) + 14, 17, 1)
	_fs(R[5])
	_fill(_ri(cx + sw * 1.4) - 1, _ri(cy) + 14, 3, 3)
	# (its toll going out, either side)
	for k in 2:
		var rr := 14.0 + (u * 20.0 + k * 8.0)
		_ga(a * (1.0 - u) * (1.0 - k * 0.35))
		_fs(R[4])
		for j in 9:
			var ang := -0.7 + j * 0.175
			_fill(_ri(cx + cos(ang) * rr), _ri(cy + 6.0 + sin(ang) * rr * 0.6), 2, 1)
			_fill(_ri(cx - cos(ang) * rr), _ri(cy + 6.0 + sin(ang) * rr * 0.6), 2, 1)
	_glow(cx, cy + 6.0, 16.0, R[4], 0.55 * a)
	_ga(1.0)


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
			_shield_face(cx, cy - 14.0, 22.0, R, a)
			_flames(cx, cy - 24.0, 1, 2.0, 6.0, a, PackedColorArray(FIRE), int(b["seed"]))
		"shieldon":
			# (Gravewarden's shade: a shade circling the one it guards, its shield face beside it, not over him; on a risen monster,
			# circling it: the second check of the weakest melds, 27 Nov 2026, his Art Rulebook's Animations 4 and 7)
			if str(b["id"]) == "gravewarden":
				var who = b.get("m")
				# (a risen monster's: round it, where it stands, not round him)
				if b.get("foe", false) and b.has("x1"):
					cx = _wx(b["x1"], b["y1"])
					cy = _wy(b["x1"], b["y1"]) - 12.0
					who = null
				var mine: bool = not b.get("foe", false)
				var rr := (_half(who) + 10.0) if who != null else (22.0 if mine else 18.0)
				var ang := t * 3.0 + float(b["seed"] % 7)
				var sx := cx + cos(ang) * rr
				# (his: circling above his head, never across him, Animations 4)
				var sy := (cy - 30.0 + sin(ang) * 5.0) if mine else (cy - 10.0 + sin(ang) * rr * 0.45)
				_shade_figure(sx, sy, R, a, u)
				_shield_face(sx, sy - 22.0, 12.0, R, a * 0.9)
			else:
				_shield_face(cx, cy - 12.0, 18.0, R, a)
		"harden":
			_shield_face(cx, cy - 14.0, 22.0, BLOOD, a)
		"eyeup":
			_eye(cx, cy - 26.0, R, a)
			_eye(cx, cy - 26.0, R, a * 0.5)
		"barb":
			_barb(cx, cy, R, a, u)
		"cuts":
			_slashes(cx, cy, R, a, u, int(b.get("n", 1)))
		"image":
			_afterimage(cx, cy, a, u, b, R)
		"hand":
			_hand_up(cx, cy, a, u)
		"wail":
			# (a monster's risen ghost following him, wailing: the ghost itself at his shoulder, its wail going out at him, not a mouth
			# over him; the check of 27 Nov 2026, Animations 4 and 7)
			if b.get("foe", false):
				var gx := cx + 20.0
				var gy := cy - 22.0 + sin(t * 4.0) * 2.0
				_shade_figure(gx, gy, R, a, u)
				_wail(gx, gy + 14.0, R, a, u)
			else:
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


## A pitchfork driven down onto it: its haft from above, the crossbar, three tines tapering to bright points, and the sparks where
## they bite.
func _fork(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var push := minf(1.0, u / 0.2)
	var top := _ri(cy - 30.0 + push * 12.0)
	var ix := _ri(cx)
	_ga(a)
	_fs(DUST6[2])
	_fill(ix - 1, top - 26, 3, 26)
	_fs(DUST6[4])
	_fill(ix - 1, top - 26, 1, 26)
	_fs(R[2])
	_fill(ix - 11, top, 23, 3)
	_fs(R[4])
	_fill(ix - 11, top, 23, 1)
	for k in 3:
		var tx := ix - 10 + k * 10
		for row in 18:
			var w := 3 if row < 10 else (2 if row < 15 else 1)
			_fs(R[4] if row < 15 else R[5])
			_fill(tx, top + 3 + row, w, 1)
			if w > 1:
				_fs(R[2])
				_fill(tx + w - 1, top + 3 + row, 1, 1)
		_fs(Color.WHITE)
		_fill(tx, top + 20, 1, 1)
	if push >= 1.0:
		_fs(R[5])
		for k in 6:
			var ang := -PI * 0.5 + (k - 2.5) * 0.45
			var d := 4.0 + (u - 0.2) * 20.0
			_fill(_ri(cx + cos(ang) * d * 1.6), _ri(top + 20 + sin(ang) * d), 1, 1)
	_glow(cx, top + 18.0, 16.0, R[4], a * 0.6)
	_ga(1.0)


## A pair of shears snapping shut on it: two long blades crossing at their pivot, each with an edge of light, their rings behind.
func _scissors(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var open := 0.6 * (1.0 - minf(1.0, u / 0.3))
	var px := cx - 6.0
	var py := cy - 8.0
	_ga(a)
	for s2 in [-1.0, 1.0]:
		var ang: float = s2 * open
		var ex := px + cos(ang) * 24.0
		var ey := py + sin(ang) * 24.0
		_fs(R[2])
		_line(px, py + 1.0, ex, ey + 1.0, 3)
		_fs(R[4])
		_line(px, py, ex, ey, 2)
		_fs(Color.WHITE)
		_line(px + cos(ang) * 6.0, py + sin(ang) * 6.0 - 1.0, ex, ey - 1.0, 1)
		# (its ring)
		var rx := px - cos(ang) * 9.0
		var ry := py - sin(ang) * 9.0
		for k in 16:
			var a2 := k * TAU / 16.0
			_fs(R[3] if sin(a2) > 0.0 else R[4])
			_fill(_ri(rx + cos(a2) * 4.0), _ri(ry + sin(a2) * 4.0), 2, 1)
	_fs(R[5])
	_fill(_ri(px) - 1, _ri(py) - 1, 3, 3)
	if u >= 0.3:
		_glow(px + 18.0, py, 16.0, R[4], a * 0.8)
		_fs(Color.WHITE)
		_ga(a * (1.0 - (u - 0.3)))
		_fill(_ri(px) + 14, _ri(py) - 5, 1, 11)
		_fill(_ri(px) + 9, _ri(py), 11, 1)
	_ga(1.0)


## Jaws closing on it: gums and two rows of long fangs meeting, the bite flashing.
func _fangs(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var gap := 13.0 * (1.0 - minf(1.0, u / 0.3))
	var mid := cy - 8.0
	_ga(a)
	for s2 in [-1.0, 1.0]:
		var jaw: float = mid + s2 * (gap + 4.0)
		_fs(BLOOD[1])
		_fill(_ri(cx) - 15, _ri(jaw) - (3 if s2 < 0.0 else 0), 31, 3)
		_fs(BLOOD[2])
		_fill(_ri(cx) - 15, _ri(jaw) - (3 if s2 < 0.0 else 0), 31, 1)
		var toward: float = -s2
		for k in 6:
			var tx := cx - 14.0 + k * 5.5
			var long := 7 if k == 1 or k == 4 else 5
			for row in long:
				var w2 := maxi(1, 3 - int(row * 3.0 / long))
				var ty: float = jaw + (0.0 if s2 < 0.0 else -1.0) + toward * float(row)
				_fs(Color("#fff4e0") if row < 2 else R[5] if row < long - 1 else R[4])
				_fill(_ri(tx) + (3 - w2) / 2, _ri(ty), w2, 1)
	if u >= 0.3:
		_glow(cx, mid, 16.0, R[4], a * 0.7)
	_ga(1.0)


## A spear-shaft driven into the ground: its iron head buried, the haft quivering, the ground cracked round its foot.
func _stake(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.15)
	var foot := cy + 12.0
	var top := foot - 42.0 * f - (1.0 - f) * 40.0
	var q := sin(u * 40.0) * (1.0 - u) * 3.0
	_ga(a)
	_fs(DUST6[2])
	_line(cx + q + 1.0, top, cx + 1.0, foot - 6.0, 2)
	_fs(DUST6[4])
	_line(cx + q, top, cx, foot - 6.0, 1)
	for row in 8:
		var hw := 3 - absi(row - 3) if row < 7 else 1
		_fs(R[4] if row < 4 else R[3])
		_fill(_ri(cx) - hw, _ri(foot) - 8 + row, hw * 2 + 1, 1)
	_fs(Color.WHITE)
	_fill(_ri(cx) - 1, _ri(foot) - 7, 1, 4)
	if f >= 1.0:
		for k in 7:
			var ang := k * TAU / 7.0 + 0.4
			_fs(DUST6[1])
			_line(cx, foot, cx + cos(ang) * (9.0 + u * 12.0), foot + sin(ang) * (4.0 + u * 6.0), 2)
			_fs(R[3])
			_fill(_ri(cx + cos(ang) * (9.0 + u * 12.0)), _ri(foot + sin(ang) * (4.0 + u * 6.0)), 1, 1)
	_glow(cx, foot - 4.0, 16.0, R[4], a * 0.65)
	_ga(1.0)


## A black needle pinning it: driven down, its eye at the top, a gleam down its length and the thread curling off it.
func _needle(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.2)
	var tip := cy + 8.0
	var top := tip - 34.0
	var off := (1.0 - f) * 22.0
	_ga(a)
	_fs(R[0])
	_line(cx + 5.0, top - off, cx, tip - off, 3)
	_fs(R[2])
	_line(cx + 4.0, top - off, cx, tip - off, 1)
	_fs(R[5])
	_line(cx + 4.0, top + 2.0 - off, cx + 3.0, top + 10.0 - off, 1)
	# (its eye, and the thread through it)
	_fs(R[0])
	_fill(_ri(cx + 4.0), _ri(top + 1.0 - off), 2, 3)
	_fs(R[4])
	var px := cx + 5.0
	var py := top + 2.0 - off
	for k in 10:
		var nx := px + 2.0 + sin(k * 0.9 + t * 6.0) * 2.0
		var ny := py - 2.0 + k * 0.2
		_line(px, py, nx, ny, 1)
		px = nx
		py = ny
	if f >= 1.0:
		_fs(Color.WHITE)
		_fill(_ri(cx) - 2, _ri(tip) - 1, 5, 1)
	_glow(cx, tip, 13.0, R[3], a * 0.6)
	_ga(1.0)


## A ghoul's maw opening in the ground: a gullet of dark, a ring of long fangs round it, closing.
func _maw(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var open := 20.0 * (1.0 - minf(1.0, u / 0.35)) + 6.0
	var y := cy + 10.0
	_ga(a * 0.85)
	for dy in range(-_ri(open * 0.4), _ri(open * 0.4) + 1):
		var hw := _ri(open * 0.9 * sqrt(maxf(0.0, 1.0 - pow(dy / (open * 0.4), 2.0))))
		_fs(BLOOD[0] if absi(dy) < open * 0.25 else BLOOD[1])
		_fill(_ri(cx) - hw, _ri(y) + dy, hw * 2, 1)
	_ga(a)
	for k in 14:
		var ang := k * TAU / 14.0
		var px := cx + cos(ang) * open
		var py := y + sin(ang) * open * 0.45
		var tx := cx + cos(ang) * (open - 8.0)
		var ty := y + sin(ang) * (open - 8.0) * 0.45 - 2.0
		_fs(Color("#c8bca4"))
		_line(px, py, tx, ty, 2)
		_fs(Color("#fff4e0"))
		_line(px, py - 1.0, (px + tx) * 0.5, (py + ty) * 0.5 - 1.0, 1)
	_glow(cx, y, open * 1.2, BLOOD[3], a * 0.5)
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


## Thorns bursting out all round: spikes shooting outward, thick at their roots, their points bright.
func _spikes(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var reach := 8.0 + 34.0 * minf(1.0, u / 0.3)
	for k in 14:
		var ang := k * TAU / 14.0 + 0.13
		var len := reach * (0.8 + 0.3 * _rh(19, k))
		var x0 := cx + cos(ang) * len * 0.3
		var y0 := cy + sin(ang) * len * 0.15
		var xm := cx + cos(ang) * len * 0.7
		var ym := cy + sin(ang) * len * 0.35
		var x1 := cx + cos(ang) * len
		var y1 := cy + sin(ang) * len * 0.5
		_ga(a)
		_fs(R[1])
		_line(x0, y0 + 1.0, xm, ym + 1.0, 3)
		_fs(R[2])
		_line(x0, y0, xm, ym, 3)
		_fs(R[3])
		_line(xm, ym, x1, y1, 2)
		_fs(R[5])
		_line((xm + x1) * 0.5, (ym + y1) * 0.5, x1, y1, 1)
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


## A barb left in it, swelling green before it bursts: its hooked shaft, the swelling round it, lit, glistening.
func _barb(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var sw := 3.0 + u * 7.0
	_ga(a)
	_fs(R[1])
	_line(cx - 9.0, cy - 18.0, cx, cy - 5.0, 2)
	_fs(R[4])
	_line(cx - 9.0, cy - 18.0, cx - 5.0, cy - 15.0, 1)
	for row in int(sw * 2.0):
		var half := sw * sqrt(maxf(0.0, 1.0 - pow((row - sw) / sw, 2.0)))
		_fs(R[3] if row > sw * 0.6 else R[4])
		_fill(_ri(cx - half), _ri(cy - 4.0 - sw + row), maxi(1, _ri(half * 2.0)), 1)
		_fs(R[2])
		_fill(_ri(cx + half) - 1, _ri(cy - 4.0 - sw + row), 1, 1)
	_fs(R[5])
	_fill(_ri(cx - sw * 0.4), _ri(cy - 4.0 - sw) + 2, 2, 1)
	_glow(cx, cy - 4.0, 8.0 + sw, R[4], a * (0.35 + u * 0.4))
	_ga(1.0)


## Slash marks on it, one for each cut, raked across: each deep, dark-edged, with its gleam.
func _slashes(cx: float, cy: float, R: PackedColorArray, a: float, u: float, n: int) -> void:
	var f := minf(1.0, u / 0.2)
	for k in clampi(n, 1, 3):
		var ox := (k - (clampi(n, 1, 3) - 1) * 0.5) * 7.0
		var x0 := cx + ox - 9.0
		var y0 := cy - 26.0
		var x1 := x0 + 18.0 * f
		var y1 := y0 + 22.0 * f
		_ga(a)
		_fs(R[1])
		_line(x0 + 1.0, y0 + 1.0, x1 + 1.0, y1 + 1.0, 3)
		_fs(R[3])
		_line(x0, y0, x1, y1, 2)
		_fs(Color.WHITE)
		_line(x0, y0, x0 + (x1 - x0) * 0.6, y0 + (y1 - y0) * 0.6, 1)
	_glow(cx, cy - 16.0, 14.0, R[4], a * 0.5)
	_ga(1.0)


## An after-image of him where he stood, fading: his own picture, pixel for pixel, in the meld's light (as Blink's are), a second
## one a step on, and a wisp of it trailing; without his picture caught, a grey shape of him.
func _afterimage(cx: float, cy: float, a: float, u: float, b := {}, R = null) -> void:
	var g: Dictionary = b.get("ghost", {})
	if not g.is_empty() and _canvas != null:
		var C: PackedColorArray = R if R != null else SOUL
		var tones := [C[2], C[4], C[5]]
		var runs := _ghost_runs(g["tex"])
		var inv := _canvas.get_global_transform().affine_inverse()
		var xf: Transform2D = inv * (g["xf"] as Transform2D)
		var off: Vector2 = g["off"]
		# (two of him: where he stood, and the first, a little drifted, fainter)
		for k in 2:
			var drift := Vector2(-6.0 * u - 3.0 * k, -2.0 * u) * 2.0
			var fade := a * (1.0 - 0.45 * k)
			for i in range(0, runs.size(), 4):
				var y := float(runs[i])
				_ga((0.5 if runs[i + 3] == 0 else 0.72) * fade)
				_fs(tones[runs[i + 3]])
				_gbox(xf * (off + Vector2(float(runs[i + 1]), y)) + drift, xf * (off + Vector2(float(runs[i + 2]) + 1.0, y + 1.0)) + drift)
		_glow(cx, cy - 10.0, 14.0, C[4], a * 0.45)
		_ga(1.0)
		return
	_ga(a * 0.55)
	_fs(SOUL[3])
	_fill(_ri(cx) - 3, _ri(cy) - 18, 6, 6)
	_fill(_ri(cx) - 4, _ri(cy) - 12, 8, 10)
	_fill(_ri(cx) - 4, _ri(cy) - 2, 3, 8)
	_fill(_ri(cx) + 1, _ri(cy) - 2, 3, 8)
	_glow(cx, cy - 8.0, 12.0, SOUL[4], a * 0.4)
	_ga(1.0)


## A dead hand bursting up from the ground: the earth thrown up round it, its forearm, its palm lit on the left, four bony fingers
## clawing, then closing, and its thumb.
func _hand_up(cx: float, cy: float, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.25)
	var base := _ri(cy + 10.0)
	var top := base - _ri(24.0 * f)
	var ix := _ri(cx)
	var close := minf(1.0, maxf(0.0, (u - 0.35) / 0.3))
	_ga(a)
	# (the forearm)
	for y in range(top + 10, base):
		var w := 6
		_fs(SOUL[2])
		_fill(ix - 3, y, w, 1)
		_fs(SOUL[3])
		_fill(ix - 3, y, 2, 1)
		_fs(SOUL[0])
		_fill(ix + 2, y, 1, 1)
	# (the palm)
	for y in range(top + 4, top + 10):
		_fs(SOUL[3])
		_fill(ix - 5, y, 10, 1)
		_fs(SOUL[4])
		_fill(ix - 5, y, 3, 1)
		_fs(SOUL[1])
		_fill(ix + 4, y, 1, 1)
	# (the fingers: two joints each, bending in as it closes)
	for k in 4:
		var fx0 := float(ix - 4 + k * 3)
		var mid := Vector2(fx0 + (ix - fx0) * close * 0.3, float(top + 4) - 4.0 + close * 1.0)
		var tip := Vector2(mid.x + (ix - fx0) * close * 0.5 + (k - 1.5) * (1.0 - close) * 0.8, mid.y - 4.0 + close * 6.0)
		_fs(SOUL[3])
		_line(fx0, top + 4, mid.x, mid.y, 2)
		_fs(SOUL[4])
		_line(mid.x, mid.y, tip.x, tip.y, 1)
		_fs(SOUL[5])
		_fill(_ri(mid.x), _ri(mid.y), 1, 1)
	# (the thumb)
	_fs(SOUL[3])
	_line(ix + 5, top + 8, ix + 9 - close * 4.0, top + 3 + close * 2.0, 2)
	# (the earth thrown up)
	_fs(DUST6[1])
	_fill(ix - 10, base, 21, 2)
	for k in 7:
		var dx := (k - 3) * 4.0 * (1.0 + u)
		var up := (1.0 - absf(k - 3) / 4.0) * 10.0 * sin(minf(1.0, u * 2.0) * PI)
		_fs(DUST6[2 + k % 2])
		_fill(_ri(cx + dx), base - _ri(up) - 1, 2, 2)
	_glow(cx, top + 6.0, 13.0, SOUL[4], a * 0.45)
	_ga(1.0)


## A ghost's wail: its mouth gaping, and the cry going out from it either way in breaking waves.
func _wail(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	for k in 3:
		var rr := 8.0 + (u * 26.0 + k * 7.0)
		_ga(a * (1.0 - k * 0.25) * (1.0 - u))
		for j in 11:
			var ang := -0.85 + j * 0.17
			var wob := sin(j * 1.7 + t * 14.0) * 1.2
			var w := 2 if j > 2 and j < 8 else 1
			_fs(SOUL[4] if j % 3 else SOUL[5])
			_fill(_ri(cx + cos(ang) * (rr + wob)), _ri(cy - 8.0 + sin(ang) * (rr + wob) * 0.6), w, w)
			_fill(_ri(cx - cos(ang) * (rr + wob)), _ri(cy - 8.0 + sin(ang) * (rr + wob) * 0.6), w, w)
	_ga(a)
	var gape := 5 + int(3.0 * sin(minf(1.0, u * 3.0) * PI * 0.5))
	_fs(SOUL[2])
	_fill(_ri(cx) - 3, _ri(cy) - 13, 7, gape + 2)
	_fs(SOUL[0])
	_fill(_ri(cx) - 2, _ri(cy) - 12, 5, gape)
	_glow(cx, cy - 10.0, 12.0, SOUL[4], 0.5 * a)
	_ga(1.0)


## A shade: a hooded ghost at (cx, cy) (its middle): a peaked hood rounding into its shoulders, lit from the upper left and outlined
## dark on its far side, a dark oval of a face with two eyes burning in R, its robe hanging into three tattered strands that sway
## behind it. In SOUL, the eyes and glow in R.
func _shade_figure(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	cy += sin(t * 5.0) * 1.0
	var top := -11
	var bottom := 8
	for dy in range(top, bottom + 1):
		var v := float(dy - top) / float(bottom - top)
		# (the hood's peak rounding out into the shoulders, the robe widening a little to its hem)
		var half := 6.5 * sqrt(clampf(v / 0.45, 0.0, 1.0)) if v < 0.45 else lerpf(6.5, 7.5, (v - 0.45) / 0.55)
		var lean := (1.0 - v) * 1.5
		var x0 := _ri(cx - half + lean)
		var x1 := _ri(cx + half + lean)
		for x in range(x0, x1 + 1):
			var side := (float(x) - (cx + lean)) / maxf(1.0, half)
			var c: Color = SOUL[4] if side < -0.35 else (SOUL[3] if side < 0.4 else SOUL[2])
			if x == x1 or (dy == top + 1 and x == x0):
				c = SOUL[1]
			_ga(a * (0.95 - v * 0.15))
			_fs(c)
			_fill(x, _ri(cy) + dy, 1, 1)
	# (the hem torn into three strands, swaying)
	for k in 3:
		var sx := cx + (float(k) - 1.0) * 5.0
		for j in 7:
			var v := float(j) / 6.0
			var sway := sin(t * 7.0 + float(k) * 1.3 + v * 3.0) * 2.0 * v
			_ga(a * (0.85 - v * 0.6))
			_fs(SOUL[3] if j < 3 else SOUL[2])
			_fill(_ri(sx + sway) - (1 if j < 3 else 0), _ri(cy) + bottom + 1 + j, 2 if j < 3 else 1, 1)
	# (the dark of its face, and its eyes burning in it)
	_ga(a)
	_fs(SOUL[0])
	_fill(_ri(cx) - 2, _ri(cy) - 7, 5, 6)
	_fill(_ri(cx) - 3, _ri(cy) - 6, 7, 4)
	_fs(R[4])
	_fill(_ri(cx) - 2, _ri(cy) - 5, 2, 2)
	_fill(_ri(cx) + 1, _ri(cy) - 5, 2, 2)
	_fs(Color.WHITE)
	_fill(_ri(cx) - 2, _ri(cy) - 5, 1, 1)
	_fill(_ri(cx) + 1, _ri(cy) - 5, 1, 1)
	_glow(cx, cy - 4.0, 14.0, R[4], 0.5 * a)
	_glow(cx, cy, 26.0, SOUL[4], 0.35 * a)
	_ga(1.0)


## A whirl of blades round him, spinning out: each a long blade with an edge of light and a trail behind.
func _whirl(cx: float, cy: float, R: PackedColorArray, a: float, u: float, r: float) -> void:
	var rr := r * 18.0 * (0.4 + u * 0.8)
	for k in 6:
		var ang := t * 14.0 + k * TAU / 6.0
		var px := cx + cos(ang) * rr
		var py := cy + sin(ang) * rr * 0.5
		_ga(a * 0.5)
		_fs(R[3])
		for j in 4:
			var ta := ang - (j + 1) * 0.12
			_fill(_ri(cx + cos(ta) * rr), _ri(cy + sin(ta) * rr * 0.5), 2, 1)
		_ga(a)
		_fs(R[3])
		_line(px, py + 1.0, px + cos(ang + 1.6) * 12.0, py + 1.0 + sin(ang + 1.6) * 6.0, 3)
		_fs(R[5])
		_line(px, py, px + cos(ang + 1.6) * 12.0, py + sin(ang + 1.6) * 6.0, 2)
		_fs(Color.WHITE)
		_line(px, py, px + cos(ang + 1.6) * 8.0, py + sin(ang + 1.6) * 4.0, 1)
	_ga(1.0)


## A reaper's hooded shadow standing over it, watching: its hood, its eyes burning, its robe falling in tatters.
func _hood(cx: float, cy: float, a: float, u: float) -> void:
	var top := cy - 46.0
	_ga(a * 0.85)
	for row in 38:
		var half := 3.0 + row * 0.6 if row < 9 else 8.0 + (row - 9) * 0.32
		var x0 := _ri(cx - half)
		var w := _ri(half * 2.0)
		_fs(Color("#0c0a12"))
		_fill(x0, _ri(top + row), w, 1)
		_fs(Color("#262034"))
		_fill(x0, _ri(top + row), 1, 1)
		if row > 32 and row % 2 == 0:
			_fs(Color("#0c0a12"))
			for k in 4:
				_fill(x0 + _ri(_rh(23, row + k) * w), _ri(top + row) + 1, 1, 2)
	_fs(Color("#060408"))
	_fill(_ri(cx) - 4, _ri(top) + 5, 9, 6)
	_ga(a)
	_fs(Color("#e8e0ff"))
	_fill(_ri(cx) - 3, _ri(top) + 7, 2, 1)
	_fill(_ri(cx) + 2, _ri(top) + 7, 2, 1)
	_glow(cx, top + 7.0, 9.0, Color("#c8c0ff"), a * 0.6)
	_ga(1.0)


## A scythe's blade sweeping round: its long curved blade with an edge of light, the arc it leaves, the snath behind it.
func _scythe(cx: float, cy: float, R: PackedColorArray, a: float, u: float) -> void:
	var sweep := minf(1.0, u / 0.35) * PI * 1.2
	var rr := 30.0
	_ga(a * 0.6)
	var n := 22
	for k in n:
		var ang := -PI * 0.6 + sweep * float(k) / n
		_fs(R[3] if k < n - 4 else R[5])
		_fill(_ri(cx + cos(ang) * rr), _ri(cy - 6.0 + sin(ang) * rr * 0.5), 2, 2 if k > n / 2 else 1)
	var ang2 := -PI * 0.6 + sweep
	var bx := cx + cos(ang2) * rr
	var by := cy - 6.0 + sin(ang2) * rr * 0.5
	_ga(a)
	_fs(DUST6[2])
	_line(cx, cy - 6.0, bx, by, 2)
	for k in 8:
		var f := float(k) / 7.0
		var ba := ang2 + 1.9 - f * 0.5
		var l := 16.0 * f
		_fs(Color.WHITE if k > 5 else R[4])
		_fill(_ri(bx + cos(ba) * l), _ri(by + sin(ba) * l * 0.6), 2, 1)
		_fs(R[2])
		_fill(_ri(bx + cos(ba) * l), _ri(by + sin(ba) * l * 0.6) + 1, 2, 1)
	_ga(1.0)


## A white light flooding out from him, far and wide: its front rolling out jagged, and rays of it thrown out ahead.
func _flood(cx: float, cy: float, a: float, u: float, r: float) -> void:
	var rr := r * 16.0 * minf(1.0, u / 0.4)
	_glow(cx, cy, rr, Color("#fffbe8"), a * 0.5 * (1.0 - u))
	_ga(a * (1.0 - u))
	for k in 48:
		var ang := k * TAU / 48.0 + _rh(7, k) * 0.05
		var l := 3.0 + 5.0 * _rh(11, k)
		var px := cx + cos(ang) * rr
		var py := cy + sin(ang) * rr * 0.5
		_fs(Color("#e8dcb0"))
		_line(px, py + 1.0, px + cos(ang) * l, py + sin(ang) * l * 0.5 + 1.0, 2)
		_fs(Color.WHITE)
		_line(px, py, px + cos(ang) * l, py + sin(ang) * l * 0.5, 1)
	for k in 12:
		var ang := k * TAU / 12.0 + 0.2
		_fs(Color("#fffbe8"))
		_ga(a * (1.0 - u) * 0.8)
		_line(cx + cos(ang) * rr * 0.3, cy + sin(ang) * rr * 0.15, cx + cos(ang) * rr * 0.85, cy + sin(ang) * rr * 0.42, 1)
	_ga(1.0)


## A row of spears standing up across a line: shafts, their iron heads catching the light.
func _spear_row(ax: float, ay: float, bx: float, by: float, R: PackedColorArray, a: float, u: float) -> void:
	var f := minf(1.0, u / 0.12)
	var n := 9
	for k in n:
		var g := float(k) / (n - 1)
		var x := ax + (bx - ax) * g
		var y := ay + (by - ay) * g + 12.0
		var h := 22.0 * f
		_ga(a)
		_fs(DUST6[2])
		_line(x + 1.0, y, x + 2.0, y - h, 1)
		_fs(DUST6[4])
		_line(x, y, x + 1.0, y - h, 1)
		for row in 5:
			var hw := 1 if row == 0 or row == 4 else 2
			_fs(R[5] if row < 2 else R[4])
			_fill(_ri(x + 1.0) - hw + 1, _ri(y - h) - 5 + row, hw * 2 - 1, 1)
		_glow(x + 1.0, y - h - 2.0, 5.0, R[4], a * 0.5)
	_ga(1.0)


## (his picture as he stood, caught as a beat begins, for an after-image of him: fx_m52p_last.gd's Blink)
func _catch_ghost(b: Dictionary) -> void:
	if fx == null:
		return
	var h = fx.hero()
	if h == null:
		return
	var sp = h.get("_sprite")
	if sp == null or sp.texture == null:
		return
	b["ghost"] = {"tex": sp.texture, "xf": sp.get_global_transform(), "off": sp.offset}


## His picture `tex` made ready to be drawn as an after-image: its pixels in runs along each row, each run one of three tones by
## how light it is, flat [row, first, last, tone, ...] (drawn pixel for pixel, as crisp as he is).
func _ghost_runs(tex: Texture2D) -> PackedInt32Array:
	var key := tex.get_instance_id()
	if _ghost_cache.has(key):
		return _ghost_cache[key]
	var runs := PackedInt32Array()
	var img := tex.get_image()
	if img != null:
		if img.is_compressed():
			img.decompress()
		img.convert(Image.FORMAT_RGBA8)
		var w := img.get_width()
		for y in img.get_height():
			var x := 0
			while x < w:
				var c := img.get_pixel(x, y)
				if c.a < 0.5:
					x += 1
					continue
				var lv := _ghost_tone(c)
				var x1 := x
				while x1 + 1 < w:
					var d := img.get_pixel(x1 + 1, y)
					if d.a < 0.5 or _ghost_tone(d) != lv:
						break
					x1 += 1
				runs.append_array([y, x, x1, lv])
				x = x1 + 1
	_ghost_cache[key] = runs
	return runs


static func _ghost_tone(c: Color) -> int:
	var l := c.r * 0.3 + c.g * 0.59 + c.b * 0.11
	return 0 if l < 0.22 else (1 if l < 0.45 else 2)


var _ghost_cache := {}


## A box on the screen in the layer's own units (two to a game pixel), from `p` to `q`.
func _gbox(p: Vector2, q: Vector2) -> void:
	if _alpha <= 0.0:
		return
	var x0 := minf(p.x, q.x)
	var x1 := maxf(p.x, q.x)
	var y0 := minf(p.y, q.y)
	var y1 := maxf(p.y, q.y)
	var n := _pts.size()
	_pts.append_array([Vector2(x0, y0), Vector2(x1, y0), Vector2(x1, y1), Vector2(x0, y1)])
	var col := Color(_style.r * _alpha, _style.g * _alpha, _style.b * _alpha, _alpha)
	_cols.append_array([col, col, col, col])
	_idx.append_array([n, n + 1, n + 2, n, n + 2, n + 3])


## (is it a Heavy or a Volatile meld? its landings and blasts hold)
func _heavy(id: String) -> bool:
	var of: Array = M52.T()["of"].get(id, [])
	return of.has("heavy") or of.has("volatile")
