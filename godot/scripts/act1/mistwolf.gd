## THE MIST WOLF (floor 9's side boss, in its glade), as the game fights it (game/act1_rules/f9_bosses.ts RULES_WOLF, WOLF_ACTS,
## F9_TUNE.wolf, howl, knock.claw, lunging, calledOf, walkableNear; art/f9_bosses_moves.ts WOLF_MOVES, WOLF_PLAY, wolfCarry,
## LUNGE_LONG; art/f9_bosses_fx.ts BITE_RING, CLAW_SWEEP, CLOUD, HOWL_FOGS; render/act1_fx/f9_bosses.ts). His word for it, 13 Nov
## 2026: “I was a spectral wolf boss”. What it shares with the Troll Chieftain: f9_boss.gd.
##   ITS WALK: 2.4 tiles a second, a round of 0.625 s; as near as 2 tiles, off again beyond 2.6.
##   THE BITE (its blow, within 2.68 tiles; list `attack`, 1.6 s): coiled and held, and at you: at 0.66 s a hero within 0.84 +
##     0.3 of the spot 2.08 tiles before where it stood, or under its jaws on the way there (0.28 to 2.08 tiles before it, within
##     0.56 + 0.3 to either side), is struck, x1.
##   THE CLAW SWEEP (within 2.61 tiles; list `claw`, 1.9 s; every 4.5 s, first 2 s): reared up and held, its frenzy of three
##     rakes at 0.68, 0.82 and 1.0 s across the arc before it (0.62 tiles before it, 0.62 to 2.49 tiles out from there, from 1.3
##     to its right round to 1.4 radians to its left): each a hero in it is struck, x0.45, x0.45, then the last, both paws, x0.7
##     and thrown back 1.4 of a heavy blow's step.
##   THE LUNGE (1 to 4.11 tiles; list `lunge`, 1.8 s; every 6 s, first 3 s): crouched and held, the lane marked, and through you
##     as mist (carried 200 of its lengths, 5.61 tiles): whoever it passes through from 0.7 to 0.9 s is struck, x1.4; nothing
##     reaches it from 0.66 to 0.9 s, nor does it jostle or bar the way from 0.66 to 1.0 s; it ends turned back the way it came.
##   THE MIST CLOUD (within 2.92 tiles; list `cloud`, 3.2 s; every 13 s, first 6 s): blasted out round it; it is gone into it
##     (nothing reaches it from 0.66 to 2.5 s) while its claws come at whoever is in it (within 3.1 of the spot 0.56 tiles before
##     it) at 0.95, 1.35, 1.75 and 2.15 s, x0.35 each.
##   THE HOWL (within 12 tiles; list `howl`, 3.1 s; every 20 s, first 7 s; while fewer than 3 of its wolves are about): the
##     wolves of the floor come out of the mist either side of it, at 1.2 s and 1.45 s (as many as make 3 at most): each a fog
##     wolf of the floor, of its pack, with no words and worth nothing, awake at once and turned to the hero, ready a moment after
##     (0.5 s, 0.8 s), on the nearest whole floor to where its mist rises (or halfway to it).
extends "res://scripts/act1/f9_boss.gd"

## (its own lengths to a length; WOLF_PLAY.walk)
const WK := 1.1
const WALK := {"pace": 2.4, "frames": 10, "fps": 16}
## (RULES_WOLF.gait)
const GAIT := {"pace": 2.4, "cycle": 0.625, "setOff": 0.0, "halt": 0.0, "stopAt": 2.0, "slack": 0.6, "trueBack": true}
## (WOLF_ACTS: each move's length and blow its pictures', WOLF_MOVES; how far each reaches, its marks' own lengths)
const ACTS := [
	{"id": "mistwolf:bite", "clip": "attack", "long": 1.6, "hit": 0.66, "dmg": 1.0, "cooldown": 0.0, "first": 0.5, "after": 0.5, "near": 0.0, "far": 2.6769631777349034},
	{"id": "mistwolf:claw", "clip": "claw", "long": 1.9, "hit": 0.68, "dmg": 1.3, "cooldown": 4.5, "first": 2.0, "after": 0.6, "near": 0.0, "far": 2.606706996939059},
	{"id": "mistwolf:lunge", "clip": "lunge", "long": 1.8, "hit": 0.76, "dmg": 1.4, "cooldown": 6.0, "first": 3.0, "after": 0.7, "near": 1.0, "far": 4.113413993878118},
	{"id": "mistwolf:cloud", "clip": "cloud", "long": 3.2, "hit": 0.66, "dmg": 0.35, "cooldown": 13.0, "first": 6.0, "after": 0.8, "near": 0.0, "far": 2.918975276816621},
	{"id": "mistwolf:howl", "clip": "howl", "long": 3.1, "hit": 0.9, "dmg": 0.0, "cooldown": 20.0, "first": 7.0, "after": 0.8, "near": 0.0, "far": 12.0},
]
## (BITE_RING, CLAW_SWEEP, CLOUD, HOWL_FOGS: its own lengths; the claw's three rakes, WOLF_MOVES.claw.beats; F9_TUNE.wolf.rakes,
## knock.claw, howl.most; square.wolf)
const BITE_RING := {"f": 74.0, "r": 20.0}
const CLAW := {"f": 22.0, "r0": 30.0, "r1": 78.0, "a0": -1.1, "a1": 1.2}
const RAKES := [0.68, 0.82, 1.0]
const RAKE_DMG := [0.45, 0.45, 0.7]
const CLAW_KNOCK := 1.4
const CLOUD := {"f": 20.0, "r": 130.0, "hurts": [0.95, 1.35, 1.75, 2.15], "thins": 2.5}
const HOWL_FOGS := [{"f": 50.0, "l": 80.0, "at": 1.2}, {"f": 0.0, "l": -80.0, "at": 1.45}]
const HOWL_MOST := 3
const SQ := {"near": 1.0, "far": 0.4}
## (wolfCarry: how far each move has carried it, its own lengths, 120 to a second; the howl and the cloud nowhere)
const CARRY := {
	"bite": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11.9861,
		28.2387, 36.75, 38, 39.25, 40.5, 41.75, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 41.881,
		41.7619, 41.6429, 41.5238, 41.4048, 41.2857, 41.1667, 41.0476, 40.9286, 40.8095, 40.6905, 40.5714, 40.4524, 40.3333,
		40.2143, 40.0952, 39.9722, 39.8333, 39.6944, 39.5556, 39.4167, 39.2778, 39.1389, 39, 38.029, 37.1926, 36.4808, 35.8836,
		35.3908, 34.9925, 34.6785, 34.439, 34.2637, 34.1426, 34.0658, 34.0231, 34.0046, 34.0001, 33.9828, 33.8819, 33.6997,
		33.4463, 33.1318, 32.7665, 32.3605, 31.9239, 31.4671, 31, 30.5329, 30.0761, 29.6395, 29.2335, 28.8682, 28.5537, 28.3003,
		28.1181, 28.0172, 27.99, 27.8819, 27.6676, 27.3622, 26.9809, 26.5388, 26.0512, 25.5332, 25, 24.4668, 23.9488, 23.4612,
		23.0191, 22.6378, 22.3324, 22.1181, 22.01, 21.9864, 21.9061, 21.7601, 21.5556, 21.2995, 20.9992, 20.6618, 20.2943,
		19.904, 19.4979, 19.0833, 18.6673, 18.2569, 17.8595, 17.482, 17.1317, 16.8157, 16.5411, 16.3151, 16.1448, 16.0374, 16],
	"claw": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		2.25, 3.5, 4.75, 6, 7.25, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8.1111, 8.6667, 9.2222, 9.7778, 9.479, 8.7146, 8.0714,
		7.5387, 7.1062, 6.7634, 6.5, 6.3054, 6.1693, 6.0811, 6.0306, 6.0071, 6.0004, 6.7619, 8.6667, 10.5714, 12.4762, 14.381,
		16.2857, 18.1905, 20.0952, 22, 22.1934, 22.3739, 22.542, 22.6981, 22.8426, 22.976, 23.0987, 23.2113, 23.314, 23.4074,
		23.4919, 23.568, 23.6361, 23.6966, 23.75, 23.7967, 23.8373, 23.872, 23.9014, 23.9259, 23.946, 23.9621, 23.9746, 23.984,
		23.9907, 23.9953, 23.998, 23.9994, 23.9999, 24, 23.987, 23.949, 23.888, 23.8056, 23.7037, 23.584, 23.4483, 23.2984,
		23.136, 22.963, 22.781, 22.592, 22.3976, 22.1997, 22, 21.8003, 21.6024, 21.408, 21.219, 21.037, 20.864, 20.7016, 20.5517,
		20.416, 20.2963, 20.1944, 20.112, 20.051, 20.013, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
		20, 19.987, 19.949, 19.888, 19.8056, 19.7037, 19.584, 19.4483, 19.2984, 19.136, 18.963, 18.781, 18.592, 18.3976, 18.1997,
		18, 17.8003, 17.6024, 17.408, 17.219, 17.037, 16.864, 16.7016, 16.5517, 16.416, 16.2963, 16.1944, 16.112, 16.051, 16.013,
		16],
	"lunge": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 5.7222, 18.0833, 30.4444, 42.8056, 55.1667, 67.5278, 80, 92.5, 105, 117.5, 130, 142.5, 155,
		167.5, 180, 190.309, 191.76, 193.059, 194.213, 195.232, 196.123, 196.896, 197.559, 198.119, 198.587, 198.97, 199.277,
		199.515, 199.695, 199.823, 199.91, 199.962, 199.989, 199.999, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200,
		200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200,
		200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200,
		200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200,
		200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (no howl while as many of its wolves as may be are about)
	if a["id"] == "mistwolf:howl":
		return called_of(m) < HOWL_MOST
	return true


func start(m, a: Dictionary, hero) -> void:
	begin(m, a, hero, "mistwolf:fx:")


func end(m, a: Dictionary, _hero) -> void:
	# (the lunge: it spun round in its skid to face back the way it came, at you)
	if a["id"] == "mistwolf:lunge":
		m.face = -m.face


func tick(m, dt: float, _dist: float, hero) -> bool:
	return square_up(m, dt, hero, SQ["near"], tiles(BITE_RING["f"], WK) + float(SQ["far"]), WALK["pace"])


## (nothing reaches it while it is mist: going through you, and gone into its cloud)
func reachable(m) -> bool:
	if act == null or m.state != "act":
		return true
	var id: String = ACTS[act["i"]]["id"]
	var t: float = act["t"]
	if id == "mistwolf:lunge":
		return not (t >= 0.66 and t <= 0.9)
	if id == "mistwolf:cloud":
		return not (t >= 0.66 and t <= float(CLOUD["thins"]))
	return true


## (going through you as mist: it neither jostles nor is jostled, nor does it bar your way, nor you its)
func aloft(m) -> bool:
	return act != null and m.state == "act" and ACTS[act["i"]]["id"] == "mistwolf:lunge" and float(act["t"]) >= 0.66 and float(act["t"]) <= 1.0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var move := move_of(a["id"])
	var h: Vector2 = hero.world
	var p := act_peril()
	var x0: Vector2 = m.world
	carried(m, tiles(carry_of(CARRY.get(move, []), t1) - carry_of(CARRY.get(move, []), t0), WK))
	if p.is_empty():
		return
	var free := open_to(hero)
	if crossed(t0, t1, a["hit"]):
		beat(m, hero, move)
		if move == "howl":
			sound(m, "boss_roar", 0.7)
	var r := Stoker.in_frame(int(p["a"]), Vector2(p["x"], p["y"]), h)
	var f := r.x * TILE3 / WK
	var l := r.y * TILE3 / WK
	var rr := HERO_R * TILE3 / WK
	match move:
		"bite":
			# (in its ring, or under its jaws as it goes there)
			var bf: float = BITE_RING["f"]
			var br: float = BITE_RING["r"]
			if crossed(t0, t1, a["hit"]) and free and (Vector2(f - bf, l).length() <= br + rr + 10.0 or (f > 10.0 and f < bf and absf(l) <= br + rr)):
				_strike(m, hero, p, 1, 1.0, 0.0, m.world)
		"claw":
			# (its frenzy: three rakes, each striking across its arc; the last, both paws, throws him)
			for i in RAKES.size():
				var at: float = RAKES[i]
				if i > 0 and crossed(t0, t1, at):
					beat(m, hero, "claw")
				if not crossed(t0, t1, at) or not free:
					continue
				var d := Vector2(f - float(CLAW["f"]), l).length()
				var ang := atan2(l, f - float(CLAW["f"]))
				if d >= float(CLAW["r0"]) - rr - 8.0 and d <= float(CLAW["r1"]) + rr and ang >= float(CLAW["a0"]) - 0.2 and ang <= float(CLAW["a1"]) + 0.2:
					_strike(m, hero, p, 1 << i, RAKE_DMG[i], CLAW_KNOCK if i == 2 else 0.0, m.world)
		"lunge":
			# (through him as mist: struck as it passes)
			if t1 > 0.7 and t0 < 0.9 and (int(p["d"]) & 1) == 0 and free and near_line(h, x0, m.world) <= m.r + HERO_R:
				_strike(m, hero, p, 1, 1.0, 0.0, x0)
		"cloud":
			# (its claws at whoever is in its cloud, again and again)
			var hurts: Array = CLOUD["hurts"]
			for i in hurts.size():
				if not crossed(t0, t1, hurts[i]) or not free:
					continue
				if Vector2(f - float(CLOUD["f"]), l).length() <= float(CLOUD["r"]) * 0.85 + rr:
					_strike(m, hero, p, 1 << i, 1.0, 0.0, m.world)
		"howl":
			for i in HOWL_FOGS.size():
				var q: Dictionary = HOWL_FOGS[i]
				if not crossed(t0, t1, q["at"]) or called_of(m) >= HOWL_MOST:
					continue
				var w := spot(p, WK, q["f"], q["l"])
				var s := _walkable_near(m, w)
				if s == Vector2.INF:
					s = _walkable_near(m, m.world + (w - m.world) * 0.5)
				if s != Vector2.INF:
					_call_wolf(m, hero, s, 0.5 + 0.3 * i)


## (struck from where the blow lands; thrown back from there)
func _strike(m, hero, p: Dictionary, bit: int, mult: float, knock_by: float, from: Vector2) -> void:
	p["d"] = int(p["d"]) | bit
	strike_hero(m, hero, p, mult, from)
	if knock_by > 0.0:
		knock(hero, from, knock_by)


## calledOf: how many of the wolves it has called are about (its pack's).
static func called_of(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o.kind == "wolf" and o.pack_id == m.pack_id:
			n += 1
	return n


## walkableNear: the nearest whole floor to `at`, a ring at a time out to two tiles; INF: none.
static func _walkable_near(m, at: Vector2) -> Vector2:
	var map = m.mgr.map
	for r in range(0, 3):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var tx := floori(at.x) + dx
				var ty := floori(at.y) + dy
				if map.walkable(tx, ty):
					return Vector2(tx + 0.5, ty + 0.5)
	return Vector2.INF


## A FOG WOLF OUT OF THE MIST (game.ts spawn('wolf', x, y, its pack, 0, false): a wolf of the floor as the floor's own plain ones
## are made, its life and its blow as theirs; then no words, worth nothing, awake, turned to the hero, ready in `ready` s).
static func _call_wolf(m, hero, at: Vector2, ready: float) -> void:
	var mgr = m.mgr
	var defs: Dictionary = mgr._defs
	if not defs.has("wolf"):
		return
	var def: Dictionary = defs["wolf"]
	# (how much the floor makes of a plain one's life and blow: read off a plain one of the floor's own, of any kind)
	var k_life := 1.0
	var k_dmg := 1.0
	for o in mgr.list:
		if is_instance_valid(o) and not o.elite and not o.boss and not o.champion and o.rarity == "" and o.words.is_empty() and defs.has(o.kind):
			k_life = o.max_life / float(defs[o.kind]["life"])
			k_dmg = o.dmg_min / float(defs[o.kind]["dmgMin"])
			break
	var life := roundf(float(def["life"]) * k_life)
	var to: Vector2 = hero.world - at
	var way := to.normalized() if to.length() > 0.0 else Vector2(0.7071, 0.7071)
	var d := {"kind": "wolf", "x": at.x, "y": at.y, "fx": way.x, "fy": way.y, "r": float(def["radius"]), "life": life, "maxLife": life,
		"dmgMin": float(def["dmgMin"]) * k_dmg, "dmgMax": float(def["dmgMax"]) * k_dmg, "speed": float(def["speed"]), "packId": m.pack_id,
		"boss": false, "champion": false, "elite": false, "xp": 0, "words": [], "half": [], "carries": [], "name": def.get("name", "Fog Wolf")}
	if not mgr._figures.has("wolf"):
		mgr._figures["wolf"] = load("res://scripts/baked_figure.gd").new(mgr._figures_dir, "wolf", mgr._info)
	# (the monster's own script, fetched here: it holds this one)
	var o = load("res://scripts/monster.gd").new()
	o.mgr = mgr
	o.setup(d, def, mgr._figures["wolf"])
	o.state = "chase"
	o._cd = ready
	mgr.stands.add_child(o)
	mgr.list.append(o)
