## THE PHYSICIAN, FLOOR 14'S BOSS (the House of Quiet, "The Physician's Theatre"), as the game fights him with his new moves on
## (game/act1_rules/physician.ts ACTION, PHYSICIAN9_ACTS: PHYSICIAN_ACTION on; art/physician_action.ts, physician_action_fx.ts, the
## art chat's, his yes there: "Diagnosis (Recommended)", "Bigger operation"). Every moment and reach is the art's; what each hurts
## and how often, the rules':
##   HIS STALK: a tile a second, stopping at any frame; 1.2 tiles off, and 0.4 nearer.
##   THE RAP (his basic, within 3 tiles; list `attack`, 2.2 s): the cane hauled up and held, brought down far before him at 0.933 s:
##     whoever is in its line (from 0.2 behind him to 1.9 before, 0.6 either side of 0.15 to his right) or within 1.5 of where the
##     ferrule cracks the boards (1.9 before him) is struck x1.
##   THE DRAW (within 3.2 tiles, every 9 s, the first 3 s in; list `draw`, 3.33 s): en garde, held; the long lunge at 1.067 s down a
##     lane 3.6 tiles long, 0.65 either side: struck x0.8, and ONE OF THE WORDS SET IN HIS MOVES DRAWN OUT OF ITS SOCKET (by the dice);
##     it hangs over the Physician's head from 2.267 s on. BEATEN BACK OUT OF HIM by five blows that land on him (not what burns or
##     poisons him) or a twentieth of his life in harm, or at his death, it flies home to its socket (or the pouch, if that socket
##     will not take it now). He draws no other while he holds one. A WORD IS NEVER LOST: leaving the floor, falling, or the game
##     saved while he holds it, it is the hero's again (give_back_all, in_the_save).
##   DIAGNOSIS (from 1.6 to 15 tiles, the hero in his lens's sight; every 11 s, the first 5 s in; list `diagnose`, 3.27 s): the great
##     brass lens raised before his beak at 0.733 s; its beam (0.26 radians either side, 18 tiles long) follows the hero 0.22 s behind;
##     the mark fills in 1.4 s while he stands in its light, drains in 1.6 while he is hid from it (behind whatever of the floor cannot
##     be walked: the beds, the table, the walls). He looks for 8 s at most, the look looping (0.733 to 2.333 s), then lowers it.
##   HE OPERATES (the mark full, from that very frame: list `operate`, 3.67 s): the field locked where the hero stood; the theatre
##     plunged dark, one hard spotlight on the field; his instruments flung out round it, held; at 1.4 s they close in: whoever is
##     within 2.5 tiles of its middle is struck x2.
##   ROUNDS (within 16 tiles, every 18 s, the first 7 s in, while he has room and someone to raise; list `rounds`, 3.87 s): three raps
##     of the cane (0.933, 1.533, 2.133 s), a great ring of the Hush rolling out from each to 6.5 tiles in 0.6 s: whoever it passes is
##     hushed, once a ring. THE PATIENTS RISE: up to four lying near him (16 tiles), the nearest first, one with each rap in turn;
##     where too few lie there, patients are laid in the free ward beds near him and rise out of them (worth nothing). Never more
##     than six of his called on their feet.
extends "res://scripts/act1/act1.gd"

const Words := preload("res://scripts/words.gd")
const Perils := preload("res://scripts/perils.gd")

const GAIT := {"pace": 1.0, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.2, "slack": 0.4, "trueBack": true}
## (art/physician_action.ts: his moves' moments, frames at 30 a second)
const RAP9_HIT := 28.0 / 30.0
const RAP9_LONG := 66.0 / 30.0
const RAP9_HOLD := [12.0 / 30.0, 26.0 / 30.0]
const DRAW9_HIT := 32.0 / 30.0
const DRAW9_LONG := 100.0 / 30.0
const DRAW9_HOLD := [10.0 / 30.0, 30.0 / 30.0]
const DRAW9 := {"fill": [34.0 / 30.0, 48.0 / 30.0], "back": 58.0 / 30.0, "up": 66.0 / 30.0, "push": [68.0 / 30.0, 76.0 / 30.0]}
const DIAG := {"belt": 6.0 / 30.0, "lens": 12.0 / 30.0, "up": 22.0 / 30.0, "loop": [22.0 / 30.0, 70.0 / 30.0], "away": 80.0 / 30.0,
	"unbelt": 88.0 / 30.0, "long": 98.0 / 30.0}
const OP_STRIKE := [40.0 / 30.0, 42.0 / 30.0]
const OP_HIT := 42.0 / 30.0
const OP_LONG := 110.0 / 30.0
const OP_HOLD := [12.0 / 30.0, 40.0 / 30.0]
const ROUNDS9_HITS := [28.0 / 30.0, 46.0 / 30.0, 64.0 / 30.0]
const ROUNDS9_LONG := 116.0 / 30.0
const ROUNDS9_HOLD := [10.0 / 30.0, 26.0 / 30.0]
## (art/physician_action_fx.ts RAP, LUNGE, BEAM, FIELD, RINGS)
const RAP := {"ahead": 1.9, "left": -0.15, "r": 1.5, "half": 0.6, "lie": 0.8}
const LUNGE := {"to": 3.6, "half": 0.65, "needle": 0.25}
const BEAM := {"half": 0.26, "reach": 18.0, "lag": 0.22, "fill": 1.4, "drain": 1.6, "ring": 0.85}
const FIELD := {"r": 2.5, "lie": 1.4}
const RINGS := {"reach": 6.5, "out": 0.6, "band": 0.55, "ahead": 0.8, "left": -0.38}
## (game/act1_rules/physician.ts LOOK_FOR, PHYSICIAN.draw: `up` game pixels over his floor point, `beat`; PHYSICIAN.rounds)
const LOOK_FOR := 8.0
const HELD := {"up": 58.0, "hits": 5, "share": 0.05, "flight": 0.6}
const ROUNDS := {"n": 4, "most": 6, "reach": 16.0}
const FOE := Color("#ff8a3a")
const DRAWN := Color("#ff8a80")
const MSG_WORD := Color("#7af8f0")

const ACTS := [
	{"id": "physician:rap", "clip": "attack", "long": RAP9_LONG, "hit": RAP9_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 3.0},
	{"id": "physician:draw", "clip": "draw", "long": DRAW9_LONG, "hit": DRAW9_HIT, "dmg": 0.8, "cooldown": 9.0, "first": 3.0, "after": 0.6, "near": 0.0, "far": 3.2},
	{"id": "physician:diagnose", "clip": "diagnose", "long": 98.0 / 30.0, "hit": 22.0 / 30.0, "dmg": 0.0, "cooldown": 11.0, "first": 5.0, "after": 0.6, "near": 1.6, "far": 15.0},
	{"id": "physician:operate", "clip": "operate", "long": OP_LONG, "hit": OP_HIT, "dmg": 2.0, "cooldown": 0.0, "first": 0.0, "after": 1.0, "near": 0.0, "far": 0.0, "forced": true},
	{"id": "physician:rounds", "clip": "rounds", "long": ROUNDS9_LONG, "hit": 28.0 / 30.0, "dmg": 0.0, "cooldown": 18.0, "first": 7.0, "after": 0.8, "near": 0.0, "far": 16.0},
]
const I_DIAG := 2
const I_OP := 3

## Those of them that hold a word of the hero's now (give_back_all, in_the_save).
static var holders: Array = []

## (the monster these rules are his)
var me = null


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(m) -> void:
	me = m
	a1 = {"held": 0}


# --- the art's own ---

## rapStrikes: whether a hero `fwd` tiles before him and `left` to his left is struck by the rap.
static func rap_strikes(fwd: float, left: float) -> bool:
	if Vector2(fwd - float(RAP["ahead"]), left - float(RAP["left"])).length() <= float(RAP["r"]):
		return true
	return fwd >= -0.2 and fwd <= float(RAP["ahead"]) and absf(left - float(RAP["left"])) <= float(RAP["half"])


## drawStrikes: whether he is in the lunge's lane.
static func draw_strikes(fwd: float, left: float) -> bool:
	return fwd >= -0.2 and fwd <= float(LUNGE["to"]) and absf(left) <= float(LUNGE["half"])


## inCone: whether a floor point is in the beam's cone (from `L`, its middle the way `aim`) and within its reach.
static func in_cone(L: Vector2, aim: float, q: Vector2) -> bool:
	var d := q - L
	var n := d.length()
	if n > float(BEAM["reach"]) or n < 0.3:
		return false
	return absf(wrapf(atan2(d.y, d.x) - aim, -PI, PI)) <= float(BEAM["half"])


## ringAt: how far ring `i` has rolled out `m` seconds into his rounds (-1 before its rap, or once it is gone).
static func ring_at(i: int, m: float) -> float:
	var s := m - float(ROUNDS9_HITS[i])
	if s < 0.0 or s > float(RINGS["out"]):
		return -1.0
	return 0.2 + (float(RINGS["reach"]) - 0.2) * (1.0 - pow(1.0 - s / float(RINGS["out"]), 1.6))


## opDark: how dark the theatre is `t` seconds into his operation (art/physician_action_fx.ts OPERATION fall, rise).
static func op_dark(t: float) -> float:
	var f0 := 1.0 / 30.0
	var f1 := 4.0 / 30.0
	var r0 := OP_HIT + 0.45
	var r1 := OP_HIT + 0.8
	if t < f0:
		return 0.0
	if t < f1:
		return (t - f0) / (f1 - f0)
	if t < r0:
		return 1.0
	if t < r1:
		return 1.0 - smooth((t - r0) / (r1 - r0))
	return 0.0


## lensAt: where his lens is `t` seconds into his look or his operation, as his pictures hold it (tiles before him, tiles to his
## left, picture pixels up: the films' tables, art/physician_action.ts lensAt a frame at a time).
static func lens_at(move: String, t: float) -> Vector3:
	var T: Dictionary = Perils._fx.get("tables", {}).get("ph", {})
	var L: Array = T.get(move, [])
	if L.is_empty():
		return Vector3(0.6, 0.0, 60.0)
	var q: Array = L[clampi(floori(t * 30.0 + 1e-6), 0, L.size() - 1)]
	return Vector3(q[0], q[1], q[2])


## lensSpot: his lens's floor point through the look, him at `at` facing `f`, drawn with `hand`.
static func lens_spot(at: Vector2, f: Vector2, hand: int) -> Vector2:
	var L := lens_at("diagnose", float(DIAG["loop"][0]))
	return beside(at, f, hand, L.x, L.y)


## lensSees: whether the lens sees a floor point from its own: no tile on the way between that cannot be walked.
static func lens_sees(map, a: Vector2, b: Vector2) -> bool:
	var d := a.distance_to(b)
	var n := ceili(d / 0.12)
	for k in range(1, n):
		var along := (float(k) / n) * d
		if along < 0.3 or d - along < 0.35:
			continue
		var p := a + (b - a) * (float(k) / n)
		var tx := floori(p.x)
		var ty := floori(p.y)
		if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h or map.walk[ty * map.w + tx] != 1:
			return false
	return true


## beamRun: how far the beam's light goes from the lens at `at` along the way `a`, to the first tile it cannot cross, or its reach.
static func beam_run(map, at: Vector2, a: float) -> float:
	var c := Vector2(cos(a), sin(a))
	var d := 0.3
	while d < float(BEAM["reach"]):
		var p := at + c * d
		var tx := floori(p.x)
		var ty := floori(p.y)
		if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h or map.walk[ty * map.w + tx] != 1:
			return d
		d += 0.1
	return BEAM["reach"]


# --- the word he holds ---

## The word he holds of the hero's, or "".
func held_word() -> String:
	return str(a1.get("w", "")) if int(a1.get("held", 0)) == 1 else ""


## THE DRAW TAKES A WORD: one of those set in the hero's moves (the dice say which), out of its socket and his. False: none is set.
func _draw_out(m, hero) -> bool:
	var L = hero.loadout
	var set: Array = []
	for i in 3:
		for k in L.front[i].size():
			if L.front[i][k] != null:
				set.append([i, 0, k])
		for k in L.behind[i].size():
			if L.behind[i][k] != null:
				set.append([i, 1, k])
	if set.is_empty():
		return false
	var c: Array = set[randi() % set.size()]
	var w: String = L.take(c[0], "front" if int(c[1]) == 0 else "behind", c[2])
	a1.merge({"held": 1, "w": w, "sk": c[0], "sd": c[1], "sl": c[2], "hits": 0, "life": m.life}, true)
	if not holders.has(self):
		holders.append(self)
	var name := _name_of(w)
	word(m, hero, "%s drawn out" % name, DRAWN)
	m.mgr.loot.say("%s draws out %s" % [m.title, name], FOE)
	return true


static func _name_of(w: String) -> String:
	var d = Words.word(w)
	return str(d.get("name", w) if d is Dictionary else w).to_upper()


## Where a word goes back to: its own socket if it is still empty and it may go in it there; else the pouch ({} then).
static func _home(front: Array, behind: Array, s: Dictionary, w: String) -> Dictionary:
	var sk := int(s.get("sk", -1))
	if sk < 0 or sk >= front.size():
		return {}
	var list: Array = behind[sk] if int(s.get("sd", 0)) == 1 else front[sk]
	var sl := int(s.get("sl", -1))
	if sl < 0 or sl >= list.size() or list[sl] != null:
		return {}
	return {"list": list, "i": sl} if Words.socket_problem(list, w) == "" else {}


## IT IS THE HERO'S AGAIN: the word he holds goes back to its socket (or the pouch); `fly`: beaten out of him, it flies home.
func give_back(fly: bool) -> void:
	var w := held_word()
	if w == "" or me == null or not is_instance_valid(me):
		a1["held"] = 0
		holders.erase(self)
		return
	var m = me
	var hero = m.mgr.hero
	var L = hero.loadout
	var home := _home(L.front, L.behind, a1, w)
	if not home.is_empty():
		home["list"][home["i"]] = w
		L._r = [null, null, null]
	else:
		m.mgr.loot.words[w] = int(m.mgr.loot.words.get(w, 0)) + 1
	a1["held"] = 0
	holders.erase(self)
	if not fly:
		return
	# (it breaks free over his head and flies home, taking its own colour again as it comes; `b`: it hung over the rune stones of
	# the words he carries, while he lived and carried any)
	peril(m, "physician:freed", m.world, {"dur": HELD["flight"], "w": w, "b": 1 if (not m.dead and not m.carries.is_empty()) else 0})
	var name := _name_of(w)
	word(m, hero, name, MSG_WORD)
	m.mgr.loot.say("%s is yours again" % name, MSG_WORD)


## (game.ts: as a place is left, and as the hero falls) every word any Physician holds is the hero's again.
static func give_back_all() -> void:
	for r in holders.duplicate():
		r.give_back(false)
	holders = []


## (game.ts save) THE SAVE HAS IT: a word a Physician holds is written into the save where it would go back to.
static func in_the_save(run: Dictionary) -> void:
	for r in holders:
		var w: String = r.held_word()
		if w == "" or r.me == null or not is_instance_valid(r.me) or r.me.dead:
			continue
		var home := _home(run["front"], run["behind"], r.a1, w)
		if not home.is_empty():
			home["list"][home["i"]] = w
		else:
			run["words"][w] = int(run["words"].get(w, 0)) + 1


# --- his rounds ---

## Those of the patients he has called still on their feet (or rising).
func _called(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o.kind == "patient" and o.h2 != null and int(o.h2.a1.get("called", -1)) == m.id:
			n += 1
	return n


## The patients near him his rounds would raise (lying in their beds, or asleep on their feet), the nearest first.
func _lying(m) -> Array:
	var out: Array = []
	for o in m.mgr.list:
		if not is_instance_valid(o) or o.dead or o.kind != "patient" or o.h2 == null or o.world.distance_to(m.world) > float(ROUNDS["reach"]):
			continue
		var bed := int(o.h2.a1.get("bed", 0))
		if (bed == 1 and int(o.h2.a1.get("go", 0)) == 0) or (bed == 0 and o.state == "sleep"):
			out.append(o)
	out.sort_custom(func(a, b): return a.world.distance_to(m.world) < b.world.distance_to(m.world))
	return out


## freeBeds: the ward beds within `r` tiles that no living patient lies in, with room beside them to lie and to rise: the nearest
## first (game/act1_rules/patient.ts; the floor's beds as the game lays them: monsters.json `beds`, each bedPlace's).
func _free_beds(m, r: float) -> Array:
	var mgr = m.mgr
	var taken := {}
	for o in mgr.list:
		if is_instance_valid(o) and not o.dead and o.kind == "patient" and o.h2 != null and o.h2.a1.has("bt"):
			taken[int(o.h2.a1["bt"])] = true
	var out: Array = []
	for b in mgr.beds:
		if taken.has(int(b["bt"])):
			continue
		var s := Vector2(b["x"], b["y"])
		var up := s + Vector2(b["fx"], b["fy"]) * 0.36
		if s.distance_to(m.world) > r or not mgr.map.fits(s.x, s.y, 0.0) or not mgr.map.fits(up.x, up.y, 0.3):
			continue
		if mgr.hero.world.distance_to(s) < 0.8:
			continue
		var crowded := false
		for o in mgr.list:
			if is_instance_valid(o) and not o.dead and o.world.distance_to(s) < 0.6:
				crowded = true
				break
		if not crowded:
			out.append(b)
	out.sort_custom(func(a, b): return Vector2(a["x"], a["y"]).distance_to(m.world) < Vector2(b["x"], b["y"]).distance_to(m.world))
	return out


## HIS ROUNDS RAISE THE PATIENTS: as many as he may, those lying near first, then new ones laid in the free beds; each rises with
## one of his raps in turn.
func _make_rounds(m, hero) -> void:
	var room := maxi(0, mini(int(ROUNDS["n"]), int(ROUNDS["most"]) - _called(m)))
	if room <= 0:
		return
	var raised: Array = _lying(m).slice(0, room)
	if raised.size() < room:
		for b in _free_beds(m, float(ROUNDS["reach"])):
			if raised.size() >= room:
				break
			var s := Vector2(b["x"], b["y"])
			var add = m.mgr.call_up("patient", s, m.pack_id, Vector2(b["fx"], b["fy"]),
				{"bed": 1, "bt": b["bt"], "bfx": b["fx"], "bfy": b["fy"], "lx": s.x, "ly": s.y, "go": 0, "wait": 0.0})
			if add == null or add.h2 == null or int(add.h2.a1.get("bed", 0)) != 1:
				continue
			raised.append(add)
	for i in raised.size():
		var o = raised[i]
		o.h2.a1["called"] = m.id
		if o.state == "sleep":
			o.state = "chase"
			o._cd = randf_range(0.4, 0.9)
		# (one with each rap in turn)
		o.h2.call_up(float(ROUNDS9_HITS[i % 3]) - float(ROUNDS9_HITS[0]) + 0.15 * o.own_seed)
		if int(o.h2.a1.get("bed", 0)) == 0 and hero.world.distance_to(o.world) > 0.01:
			o.face = (hero.world - o.world).normalized()


# --- his fight ---

func can(m, a: Dictionary, dist: float, los: bool) -> bool:
	var hero = m.mgr.hero
	match str(a["id"]):
		"physician:draw":
			return held_word() == ""
		"physician:diagnose":
			# (only with the hero in his lens's sight)
			var f: Vector2 = (hero.world - m.world) / maxf(dist, 1e-6)
			return los and lens_sees(m.mgr.map, lens_spot(m.world, f, 1), hero.world)
		"physician:rounds":
			# (looked for again every half second, not every step: the floor's beds are many)
			var now: float = Time.get_ticks_msec() / 1000.0
			if now < float(a1.get("rNext", 0.0)):
				return int(a1.get("rOk", 0)) == 1
			a1["rOk"] = 1 if (_called(m) < int(ROUNDS["most"]) and _lying(m).size() + _free_beds(m, float(ROUNDS["reach"])).size() > 0) else 0
			a1["rNext"] = now + 0.5
			return int(a1["rOk"]) == 1
	return true


func start(m, a: Dictionary, hero) -> void:
	match str(a["id"]):
		"physician:rounds":
			m.mgr.loot.say("%s makes his rounds" % m.title, FOE)
	# (the marks of what he is making: act2/ph_marks.gd, its clock this act's)
	var long: float = a["long"]
	if a["id"] == "physician:rap":
		peril(m, "physician:rapmark", m.world, {"dur": minf(long, RAP9_HIT + float(RAP["lie"]))})
	elif a["id"] == "physician:draw":
		peril(m, "physician:drawmark", m.world, {"dur": minf(long, DRAW9_HIT + float(LUNGE["needle"]) + 0.1)})
	elif a["id"] == "physician:rounds":
		peril(m, "physician:roundsmark", m.world, {"dur": minf(long, float(ROUNDS9_HITS[2]) + float(RINGS["out"]))})
	elif a["id"] == "physician:diagnose":
		peril(m, "physician:look", m.world, {"dur": 1e9})


func acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	match str(a["id"]):
		"physician:rap":
			if not crossed(t0, t1, RAP9_HIT):
				return
			# (brought down hard far before him: in its line, or in the star of cracks round where the ferrule strikes)
			var r := rel(m, hero)
			if rap_strikes(r.x, r.y) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
			hero.kick(3.0)
			sound(m, "slam", 0.6)
		"physician:draw":
			if crossed(t0, t1, DRAW9_HIT):
				var r := rel(m, hero)
				if draw_strikes(r.x, r.y) and open_to(hero):
					blow(m, hero, float(a["dmg"]))
					if held_word() == "":
						_draw_out(m, hero)
				sound(m, "swing", 0.9)
			# (the word he drew comes up out of the quill as he pushes the plunger home, and hangs over his head: act2/ph_marks.gd)
			if crossed(t0, t1, float(DRAW9["push"][0])) and held_word() != "":
				peril(m, "physician:held", m.world, {"dur": 1e9, "w": held_word()})
		"physician:diagnose":
			var L := lens_spot(m.world, m.face, act["hand"])
			if crossed(t0, t1, float(DIAG["up"])):
				# (the lens up: its beam comes on, pointing at the hero)
				a1["dAim"] = atan2(hero.world.y - L.y, hero.world.x - L.x)
				a1["dFill"] = 0.0
				a1["dLook"] = 0.0
				a1["dLit"] = 0
				a1["dOn"] = 1
				sound(m, "gust", 0.4)
			if t1 < float(DIAG["up"]) or int(a1.get("dOn", 0)) == 0:
				return
			var step := maxf(0.0, t1 - t0)
			# THE BEAM follows him a breath behind; the mark fills while he stands in its light, drains while he is hid
			var want := atan2(hero.world.y - L.y, hero.world.x - L.x)
			a1["dAim"] = float(a1["dAim"]) + wrapf(want - float(a1["dAim"]), -PI, PI) * (1.0 - exp(-step / float(BEAM["lag"])))
			var lit: bool = hero.alive and in_cone(L, a1["dAim"], hero.world) and lens_sees(m.mgr.map, L, hero.world)
			a1["dLit"] = 1 if lit else 0
			a1["dFill"] = clamp01(float(a1["dFill"]) + (step / float(BEAM["fill"]) if lit else -step / float(BEAM["drain"])))
			a1["dLook"] = float(a1["dLook"]) + step
			if float(a1["dFill"]) >= 1.0:
				_operate(m, hero)
				return
			if float(a1["dLook"]) >= LOOK_FOR or not hero.alive:
				# (never full: he lowers it, the rest of his list from the look's end)
				a1["dOn"] = 0
				return
			# (THE LOOK, round and round while he looks)
			if float(act["t"]) >= float(DIAG["loop"][1]):
				act["t"] = float(DIAG["loop"][0]) + (float(act["t"]) - float(DIAG["loop"][1]))
		"physician:rounds":
			var S := beside(m.world, m.face, act["hand"], RINGS["ahead"], RINGS["left"])
			var d: float = hero.world.distance_to(S)
			for k in 3:
				if crossed(t0, t1, float(ROUNDS9_HITS[k])):
					hero.kick(3.0 if k == 2 else 2.0)
					sound(m, "slam", 0.4 + 0.1 * k)
					if k == 0:
						_make_rounds(m, hero)
				# (A GREAT RING OF THE HUSH rolls out from it: whoever it passes is hushed, once a ring)
				var bit := 1 << k
				if int(act.get("b", 0)) & bit:
					continue
				var r := ring_at(k, t1)
				if r >= 0.0 and absf(d - r) <= float(RINGS["band"]) / 2.0 + 0.15 and hero.alive:
					act["b"] = int(act.get("b", 0)) | bit
					hero.hush()


## THE MARK FULL: he operates, from the frame of his look he is at; the field locked where the hero stands.
func _operate(m, hero) -> void:
	cds[I_DIAG] = float(ACTS[I_DIAG]["cooldown"])
	var hand: int = act["hand"]
	act = {"i": I_OP, "t": 0.0, "hand": hand, "x": hero.world.x, "y": hero.world.y, "b": 0}
	m._set_list("operate", true)
	m._anim_t = 0.0
	a1["dOn"] = 0
	peril(m, "physician:op", hero.world, {"hit": OP_HIT, "dur": OP_HIT + float(FIELD["lie"]), "dmg": m._roll() * float(ACTS[I_OP]["dmg"]),
		"a": m.id, "c": floori(m.own_seed * 97.0)})
	m.mgr.voice("boss_roar", 0.5, linear_to_db(0.6))


## (game.ts damageMonster, lifeFloor: after every harm that lands on him) where a word is beaten back out of him: a blow that lands
## (not what burns or poisons him) counts one; the harm since he took it counts too.
func life_floor(m) -> float:
	if held_word() == "":
		return 0.0
	if m.struck_t == 0.0:
		a1["hits"] = int(a1.get("hits", 0)) + 1
		# (counted: marked a hair past the blow, so that what burns him in the same moment is not taken for another)
		m.struck_t = 1e-9
	if m.life > 0.0 and (int(a1["hits"]) >= int(HELD["hits"]) or float(a1["life"]) - m.life >= float(HELD["share"]) * m.max_life):
		give_back(true)
	return 0.0


func died(m) -> void:
	# (what he holds of the hero's flies home; his operation, not yet struck, is no more: the light comes back)
	give_back(true)
	var P = m.mgr.perils
	P.list = P.list.filter(func(p): return not (p.get("kind") == "a1" and p.get("a1") == "physician:op" and p.get("src") == m and float(p["t"]) < float(p["hit"])))
