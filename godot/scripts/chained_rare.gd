## THE CHAINED RARE: the Godot game's own, not the browser game's. The owner's idea, 22 Nov 2026, his words: “Adding a new
## mechanic for the first five levels of wordsmith.  2-5 in the campaign, in all relevant levels in endless.  A chained immobile
## rare enemy.  He has his words plus a bonus word above him.  He will drop the guaranteed word above him if you tap him to unchain
## and fight him.  Or you can leave him if you don’t want to interact with it at all.” Read as:
##   WHERE: one on each of floors 2 to 5 as the floor is laid (none on floor 1 of the story, where no word falls yet, nor on any floor
##     before the wordsmith's ring is lit), and one on every endless level that is one of floors 1 to 5 (there his word falls on
##     floor 1 too: it is what he is for). In one of the floor's ordinary rooms, those off the way through first, never the start's,
##     the boss's, a lair, a vault or an elite room; well clear of where the hero comes in, of the floor's things and its traps.
##   WHO: one of the floor's own yellow-pack leaders' kinds, alone: a rare, his name in a yellow pack's leader's yellow, an elite by
##     the game's rules for one alone (game.ts spawn) but with TWICE AN ELITE'S LIFE (TUNE.eliteLife is his kind's life four times
##     over, so his is eight times; a pack's leader has PACKS.leaderLife, three), with HIS WORDS, two of the floor's own (three from depth 10, on an endless level), AND THE BONUS
##     WORD as well, never two of Flame, Frost and Lightning among them, and what Power, Swift and Guarding give him in his numbers
##     (game.ts spawn). Over his head, as over any monster that carries a word, the rune of the bonus word: what he will leave. His
##     words, 22 Nov 2026, of it: “I want him to have the word above him as well.  It’s got to be tough”.
##   HELD: three iron stakes driven into the floor round him, a chain from each to an iron band at his waist. He stands; he turns to
##     the hero in his sight within 9 tiles, and now and then heaves at his chains toward him, the chains going taut and rattling.
##     He never wakes, nothing of the hero's reaches him (monsters.gd shut_in), the aim help never locks onto him, and he strikes at
##     no one: he can be walked past and left.
##   FREED: a touch on him (touch.gd _spot_at: the hero is walked to him, and his chains are broken 2 tiles off), or E within 2.4
##     tiles (B with a controller; the prompt, "Break the chains"): the chains snap, their links flying, and half a second later he
##     roars and fights as any elite of his kind. Killed, he leaves the bonus word, always (loot.gd on_kill), and all an elite leaves.
##   The first time he is in the hero's sight within 9 tiles, a line says what he is and what he carries.
##   ONCE PER FLOOR: beaten on a floor of the story, he is never chained there again for that hero (loot.gd chained_beaten, kept in
##     his save); freed and left alive, he is there again the next time the floor is laid. Every endless level has its own. His pick,
##     22 Nov 2026, asked whether he should come back each time a floor is laid fresh: “Once per floor”.
## His chains and stakes are painted here in code, in the game's grain (two picture pixels to a game pixel), iron lit from the upper
## left on the dungeon's deep indigo, no black outlines (docs/art/RULEBOOK.md). `--only=chained`: check_chained.gd.
extends Node

const Monster := preload("res://scripts/monster.gd")
const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const Words := preload("res://scripts/words.gd")

## (the first five levels: floors 2 to 5 of the story; on an endless level, 1 to 5)
const STORY_FROM := 2
const LAST := 5
## (how near E breaks his chains; a touch walks the hero in to 2 tiles: touch.gd)
const NEAR := 2.4
## (how far he looks for the hero, and the line said the first time he is seen)
const SEE := 9.0
## (ENDLESS ANY LEVEL: on every endless level whatever its floor, and this many of them, at least and at most; each at least APART
## tiles from the others. Off: one, on endless levels of floors 1 to 5 only, as first built)
static var ENDLESS_ANY := true
## (ANY_FLOOR off at his word, 23 Nov 2026: “The chained is a new mechanic for floors 2-5 in the campaign and the relevant floors in
## endless”: on endless levels of floors 1 to 5 only, but two or three of them there)
static var ANY_FLOOR := false
const ENDLESS_N := [2, 3]
const APART := 10.0


## How many to lay on this endless level (ENDLESS_N), by the floor's own luck or `rng`.
static func endless_n(rng: RandomNumberGenerator) -> int:
	return rng.randi_range(int(ENDLESS_N[0]), int(ENDLESS_N[1])) if ENDLESS_ANY else 1
## (how far from him his three stakes are driven, tiles)
const STAKE_R := 1.35
## (from the chains snapping to his first step, seconds)
const BREAK := 0.5
## (a heave at his chains: how long, and how long between them while he sees the hero)
const HEAVE := 0.7
const HEAVE_GAP := [3.5, 6.5]
## (defs.ts PACKS.leaderLife, TUNE.eliteLife: a yellow pack's leader's life, and an elite's alone, times his kind's; HIS, twice an
## elite's: his words, 22 Nov 2026, “I think he should have at least double the elite bonus health”)
const LEADER_LIFE := 3.0
const ELITE_LIFE := 4.0
const RARE_LIFE := ELITE_LIFE * 2.0
## (game.ts spawn: what Power gives a monster's life and its blows, and Swift its pace; defs.ts GUARD.monster, Guarding's shield)
const POWER_LIFE := 0.3
const POWER_DMG := 0.4
const SWIFT_PACE := 0.35
const GUARD_SHIELD := 0.2
const ELEMENTS := ["fire", "frost", "lightning"]
## (his pack's number: his own, so that no pack wakes with him nor he with one)
const PACK := 990000
const MSG_WORD := Color("#7af8f0")
## THE IRON, lit from the upper left, on the dungeon's dark: its seam a deep indigo, never black (art RULEBOOK, Pixels 5)
const SEAM := Color("#150f26")
const IRON0 := Color("#2c2838")
const IRON1 := Color("#4f4a5e")
const IRON2 := Color("#837d94")
const IRON3 := Color("#bdb8cc")
## (the sparks off iron as it snaps: the yellow of a blow on armour, art RULEBOOK, Fight 4)
const SPARK := Color("#ffd27a")

var main
var monsters
var map: FloorMap
var hero
var loot
var sfx

## (the rare himself, monster.gd; null where none was laid)
var m = null
## (where his stakes stand, tiles)
var stakes: Array[Vector2] = []
## "held", "breaking" (his chains snapped, he is not yet in the fight), "free", "beaten" (killed); "" while none is laid
var phase := ""
## What E does where the hero stands: [what is shown, what it does] (main.gd prompt).
var prompt := ["", ""]
## (the bonus word, the rune over his head)
var bonus := ""
var told := false
var _brk := 0.0
var _heave := 0.0
var _heave_in := 2.0
## (the links flying as his chains snap: {p, v, t, life, c}, game pixels from where they snapped (_snap_at))
var _bits: Array = []
var _snap_at := Vector2.ZERO
var _back: Node2D
var _front: Node2D
var _stake_nodes: Array = []
var _rng := RandomNumberGenerator.new()


## Is there one on this floor (game rules above): floors 2 to 5 of the story once words fall, and any of 1 to 5 as an endless level.
static func wanted(game, where: String) -> bool:
	if not where.begins_with("floor") or game.map == null or game.loot == null:
		return false
	var d := int(game.map.depth)
	# (ENDLESS ANY LEVEL, his words, 23 Nov 2026: “In endless mode I want multiple chained and stronghold encounters per level.  And
	# I want these random encounters, (chained, stronghold, muffled bells, and royal cards) to show up in any level.”: on an endless
	# level of any floor, ENDLESS_N of them)
	if game.in_endless and ENDLESS_ANY and ANY_FLOOR and d >= 1:
		return true
	if d < 1 or d > LAST:
		return false
	if game.in_endless:
		return true
	# (ONCE PER FLOOR: beaten on a floor of the story, he is not chained there again for this hero: loot.gd chained_beaten)
	return d >= STORY_FROM and game.loot.words_fall() and not game.loot.chained_beaten.has(d)


## Whether his chains still hold him.
func held() -> bool:
	return phase == "held" and m != null and is_instance_valid(m) and not m.dead


## LAID AS THE FLOOR IS (main.gd _build): his kind from the floor's own yellow-pack leaders (`mdata`, its monsters.json), his words
## and the bonus word from the floor's, his place in one of its rooms. `seed` (0 or more) for the checks: the same rare in the same
## place. Whether one was laid.
func lay(mdata: Dictionary, seed := -1) -> bool:
	if seed >= 0:
		_rng.seed = seed
	else:
		_rng.randomize()
	var leads: Array = (mdata.get("monsters", []) as Array).filter(func(o): return str(o.get("rarity", "")) == "leader" and not bool(o.get("boss", false)) and monsters._defs.has(str(o["kind"])))
	if leads.is_empty():
		return false
	var t: Dictionary = leads[_rng.randi_range(0, leads.size() - 1)]
	var at = _spot(float(t["r"]))
	if at == null:
		return false
	var P: int = loot.power()
	var pool: Array = loot.words_found_at(P).duplicate()
	if pool.is_empty():
		return false
	# (THE BONUS WORD first, and his own words with it: he fights with it too, and it is the one he leaves)
	bonus = str(pool[_rng.randi_range(0, pool.size() - 1)])
	var his := _draw(pool, (3 if P >= 10 else 2) + 1, [bonus])
	var d := _rare(t, his, at)
	var fig = monsters.figure_of(str(d["figure"]))
	if fig == null:
		return false
	var mon := Monster.new()
	mon.mgr = monsters
	mon.chained = 1
	mon.setup(d, monsters._defs[str(d["kind"])], fig)
	monsters.stands.add_child(mon)
	monsters.list.append(mon)
	m = mon
	phase = "held"
	# (his chains: those to the stakes behind him drawn behind his picture, the rest and his band in front of it)
	_back = _Chains.new()
	_back.k = self
	m.add_child(_back)
	m.move_child(_back, 0)
	_front = _Chains.new()
	_front.k = self
	_front.front = true
	m.add_child(_front)
	for s in stakes:
		var n := _Stake.new()
		n.k = self
		n.at = s
		n.position = Iso.to_screen(s.x, s.y)
		monsters.stands.add_child(n)
		_stake_nodes.append(n)
	return true


## `n` different words of `pool`, `first` among them, never two of Flame, Frost and Lightning (game.ts drawWords).
func _draw(pool: Array, n: int, first: Array = []) -> Array:
	var got: Array = first.duplicate()
	var left := pool.filter(func(w): return not got.has(w))
	while got.size() < n and not left.is_empty():
		var w: String = left.pop_at(_rng.randi_range(0, left.size() - 1))
		if ELEMENTS.has(w) and got.any(func(g): return ELEMENTS.has(g)):
			continue
		got.append(w)
	return got


## The rare, as game.ts spawn would make an elite of `t`'s kind alone with the words `his`: `t`'s numbers (a yellow pack's leader of
## this floor's, as the export made him) with a pack leader's life made an elite's, and his words' Power, Swift and Guarding in place
## of `t`'s.
func _rare(t: Dictionary, his: Array, at: Vector2) -> Dictionary:
	var d: Dictionary = t.duplicate(true)
	var def: Dictionary = monsters._defs[str(t["kind"])]
	var tw: Array = t.get("words", [])
	var was_p := 1.0 if tw.has("power") else 0.0
	var was_s := 1.0 if tw.has("swift") else 0.0
	var pw := 1.0 if his.has("power") else 0.0
	var sw := 1.0 if his.has("swift") else 0.0
	var life := roundf(float(t["maxLife"]) / LEADER_LIFE * RARE_LIFE / (1.0 + POWER_LIFE * was_p) * (1.0 + POWER_LIFE * pw))
	var dm := (1.0 + POWER_DMG * pw) / (1.0 + POWER_DMG * was_p)
	d["life"] = life
	d["maxLife"] = life
	d["dmgMin"] = float(t["dmgMin"]) * dm
	d["dmgMax"] = float(t["dmgMax"]) * dm
	d["speed"] = float(t["speed"]) / (1.0 + SWIFT_PACE * was_s) * (1.0 + SWIFT_PACE * sw)
	d["shield"] = roundf(life * GUARD_SHIELD) if his.has("guarding") else 0.0
	d["words"] = his.duplicate()
	d["half"] = []
	d["carries"] = [bonus]
	d["rarity"] = "leader"
	d["elite"] = true
	d["champion"] = false
	d["boss"] = false
	d["packId"] = PACK
	d["id"] = PACK + 1
	d["state"] = "sleep"
	d["a1"] = null
	d.erase("royal")
	d["x"] = at.x
	d["y"] = at.y
	var f: Vector2 = (map.start - at).normalized() if map.start.distance_to(at) > 0.01 else Vector2(0.7071, 0.7071)
	d["fx"] = f.x
	d["fy"] = f.y
	var fronts: Array = his.map(func(w): return str(Words.word(w)["front"]))
	fronts.append(str(def.get("name", t.get("name", t["kind"]))))
	d["name"] = " ".join(fronts)
	return d


## WHERE HE IS CHAINED: one of the floor's ordinary rooms of 6 tiles or more each way (off the way through first, in an order of the
## floor's own luck), at the tile nearest its middle that a body of radius `r` fits on, clear of the floor's things, its traps, its
## other monsters and where the hero comes in, with floor for his three stakes about him in the same room. Null where none will do.
func _spot(r: float):
	var rooms: Array = map.rooms.filter(func(q): return str(q.get("kind", "")) == "normal" and int(q["w"]) >= 6 and int(q["h"]) >= 6)
	var side: Array = rooms.filter(func(q): return int(q.get("path", 0)) < 0)
	var way: Array = rooms.filter(func(q): return int(q.get("path", 0)) >= 0)
	_shuffle(side)
	_shuffle(way)
	for q in side + way:
		var p = _in_room(q, r)
		if p != null:
			return p
	return null


func _shuffle(a: Array) -> void:
	for i in range(a.size() - 1, 0, -1):
		var j := _rng.randi_range(0, i)
		var x = a[i]
		a[i] = a[j]
		a[j] = x


func _in_room(q: Dictionary, r: float):
	var rx := float(q["x"])
	var ry := float(q["y"])
	var rw := float(q["w"])
	var rh := float(q["h"])
	var c := Vector2(rx + rw / 2.0, ry + rh / 2.0)
	var tries: Array[Vector2] = []
	for ty in range(int(ry) + 2, int(ry + rh) - 2):
		for tx in range(int(rx) + 2, int(rx + rw) - 2):
			tries.append(Vector2(tx + 0.5, ty + 0.5))
	tries.sort_custom(func(a, b): return a.distance_to(c) < b.distance_to(c))
	for p in tries:
		if p.distance_to(c) > 3.0:
			break
		if not _clear_at(p, r, 1.6):
			continue
		var a0 := _rng.randf() * TAU
		for k in 6:
			var ring: Array[Vector2] = []
			for j in 3:
				var a := a0 + k * TAU / 18.0 + j * TAU / 3.0
				var s := p + Vector2(cos(a), sin(a)) * STAKE_R
				if FloorMap.in_room(q, s) and _clear_at(s, 0.2, 0.9) and absf(map.lift_at(s.x, s.y) - map.lift_at(p.x, p.y)) < 1.0:
					ring.append(s)
			if ring.size() == 3:
				stakes = ring
				return p
	return null


## Floor a body of radius `r` stands on at `p`, flat and walkable, nothing of the floor's within `keep` tiles (its things, its
## traps, the fallen wordsmith), no monster within 1.2 tiles, 12 or more from where the hero comes in.
func _clear_at(p: Vector2, r: float, keep: float) -> bool:
	if not map.walkable(floori(p.x), floori(p.y)) or map.tile(floori(p.x), floori(p.y)) != FloorMap.FLOOR or map.in_wall(p.x, p.y):
		return false
	if not map.fits(p.x, p.y, r + 0.1):
		return false
	if p.distance_to(map.start) < 12.0:
		return false
	for o in map.props:
		if Vector2(float(o["x"]), float(o["y"])).distance_to(p) < keep:
			return false
	for z in map.hazards:
		if z is Dictionary and z.has("x") and Rect2(float(z["x"]), float(z["y"]), float(z.get("w", 1)), float(z.get("h", 1))).grow(keep + 0.6).has_point(p):
			return false
	if map.body is Dictionary and map.body.has("x") and Vector2(float(map.body["x"]), float(map.body["y"])).distance_to(p) < 3.0:
		return false
	for o in monsters.list:
		if is_instance_valid(o) and not o.dead and o.world.distance_to(p) < 1.2:
			return false
		# (another chained rare on the level: well apart from him)
		if is_instance_valid(o) and int(o.get("chained")) != 0 and o.world.distance_to(p) < APART:
			return false
	return true


# --- held, freed ---

func _process(dt: float) -> void:
	prompt = ["", ""]
	if m == null or not is_instance_valid(m):
		return
	_fly(dt)
	if phase == "held":
		_held(dt)
	elif phase == "breaking":
		_brk -= dt
		if _brk <= 0.0:
			phase = "free"
			m.chained = 2
			m.tug = Vector2.ZERO
			monsters.wake(m)
	elif phase == "free" and m.dead:
		# (ONCE PER FLOOR: beaten on a floor of the story, kept with the hero; an endless level is a new one each time)
		phase = "beaten"
		if not main.in_endless and not loot.chained_beaten.has(int(map.depth)):
			loot.chained_beaten.append(int(map.depth))
	if _back != null:
		_back.queue_redraw()
		_front.queue_redraw()


func _held(dt: float) -> void:
	if m.dead or hero == null or not is_instance_valid(hero) or not hero.alive or main._going:
		m.tug = Vector2.ZERO
		return
	var to: Vector2 = hero.world - m.world
	var d := to.length()
	var sees: bool = d <= SEE and monsters.sees(m.world, hero.world)
	if sees and not told:
		told = true
		loot.say("%s is held in chains. It carries %s: break its chains and fight it for the word, or leave it be." % [m.title, str(Words.word(bonus)["name"]).to_upper()], MSG_WORD)
	# HIS HEAVE: now and then, while he sees the hero, he throws himself at his chains toward him
	if _heave > 0.0:
		_heave = maxf(0.0, _heave - dt)
	elif sees:
		_heave_in -= dt
		if _heave_in <= 0.0:
			_heave = HEAVE
			_heave_in = _rng.randf_range(HEAVE_GAP[0], HEAVE_GAP[1])
			sfx.play("f3_chains", linear_to_db(0.5))
	var k := heave_k()
	var way := Iso.to_screen(to.x, to.y).normalized() if d > 0.01 else Vector2.ZERO
	# (his picture pulled toward the hero, up to 3 game pixels, whole game pixels only)
	m.tug = (way * 3.0 * k).round() * 2.0
	if d <= NEAR and main._inv != null and not main._inv.visible:
		prompt = ["E: Break the chains", "chained"]
		if Input.is_action_just_pressed("interact"):
			unchain()


## How far into a heave he is: 0 at rest, up to 1 at its height.
func heave_k() -> float:
	return sin(PI * (1.0 - _heave / HEAVE)) if _heave > 0.0 else 0.0


## HIS CHAINS BROKEN: they snap, their links flying with sparks; half a second later he roars and is in the fight (_process).
func unchain() -> void:
	if not held():
		return
	phase = "breaking"
	_brk = BREAK
	_heave = 0.0
	m.tug = Vector2.ZERO
	_snap_at = m.position
	var waist := _waist()
	for s in stakes:
		var pts := _links(_stake_top(s), waist, 3.0)
		for i in pts.size():
			# (each link flung away from his waist and up, the nearer him the harder)
			var p: Vector2 = pts[i]
			var out := (p - waist)
			out = out.normalized() if out.length() > 0.01 else Vector2(_rng.randf_range(-1, 1), -1).normalized()
			var v := out * _rng.randf_range(30.0, 70.0) + Vector2(_rng.randf_range(-12, 12), _rng.randf_range(-70, -35))
			_bits.append({"p": p, "v": v, "t": 0.0, "life": _rng.randf_range(0.55, 0.9), "c": IRON2, "z": float(i % 2)})
	for i in 10:
		var a := _rng.randf() * TAU
		_bits.append({"p": waist, "v": Vector2(cos(a), sin(a) * 0.6) * _rng.randf_range(40.0, 90.0) + Vector2(0, -30), "t": 0.0, "life": _rng.randf_range(0.15, 0.3), "c": SPARK, "z": 1.0})
	sfx.play("gate_fall", linear_to_db(0.85))
	sfx.play("shatter", linear_to_db(0.35))
	if hero != null and is_instance_valid(hero):
		hero.kick(3.0)


func _fly(dt: float) -> void:
	if _bits.is_empty():
		return
	var keep: Array = []
	for b in _bits:
		b["t"] = float(b["t"]) + dt
		if float(b["t"]) >= float(b["life"]):
			continue
		b["v"] = (b["v"] as Vector2) + Vector2(0, 240.0) * dt
		b["p"] = (b["p"] as Vector2) + (b["v"] as Vector2) * dt
		keep.append(b)
	_bits = keep


# --- what is drawn, in game pixels from his feet ---

## The iron band at his waist, where his chains meet (game pixels from his feet).
func _waist() -> Vector2:
	return Vector2(0.0, -roundf(m._head() * 0.42) - roundf(m._lift / 2.0)) + m.tug / 2.0


## The ring on a stake's head, where its chain is made fast (game pixels from his feet).
func _stake_top(s: Vector2) -> Vector2:
	var sp := (Iso.to_screen(s.x, s.y) - Iso.to_screen(m.world.x, m.world.y)) / 2.0
	return (sp + Vector2(0, -6.0 - roundf(map.lift_at(s.x, s.y) / 2.0))).round()


## Where a chain's links lie from `a` to `b`, `pitch` game pixels apart, hanging `sag` at its middle.
func _links(a: Vector2, b: Vector2, sag: float, pitch := 2.0) -> Array:
	var n := maxi(3, roundi(a.distance_to(b) / pitch))
	var out: Array = []
	for i in range(1, n):
		var t := float(i) / float(n)
		out.append((a.lerp(b, t) + Vector2(0, sag * 4.0 * t * (1.0 - t))).round())
	return out


## His chains, drawn on `c` (his own picture's layer): the ones to the stakes behind him (`front` false) or before him (true), each
## hanging slack, or taut as he heaves away from its stake; his band; the links flying as they snap.
func draw_chains(c: CanvasItem, front: bool) -> void:
	if m == null or not is_instance_valid(m):
		return
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	if phase == "held" and not m.dead:
		var waist := _waist()
		var k := heave_k()
		var hd: Vector2 = (hero.world - m.world).normalized() if hero != null and is_instance_valid(hero) and hero.world.distance_to(m.world) > 0.01 else Vector2.ZERO
		var shake := Vector2(roundf(sin(Time.get_ticks_msec() / 1000.0 * 41.0)) * (1.0 if k > 0.5 else 0.0), 0.0)
		for s in stakes:
			var top := _stake_top(s)
			if (top.y + 6.0 >= 0.0) != front:
				continue
			# (a chain whose stake is behind his heave goes taut and shakes; one on his side of it hangs slacker)
			var pull: float = -(s - m.world).normalized().dot(hd)
			var sag := 4.0 - k * 4.0 * clampf(pull, 0.0, 1.0) + k * 2.0 * clampf(-pull, 0.0, 1.0)
			var pts := _links(top, waist, sag)
			for i in pts.size():
				var p: Vector2 = pts[i] + (shake if pull > 0.3 else Vector2.ZERO)
				_link(c, p, i % 2 == 0)
		if front:
			_band(c, waist)
	if front and not _bits.is_empty():
		var o: Vector2 = (_snap_at - m.position) / 2.0
		for b in _bits:
			var a := clampf(1.0 - (float(b["t"]) - float(b["life"]) * 0.6) / (float(b["life"]) * 0.4), 0.0, 1.0)
			var col: Color = b["c"]
			col.a = a
			var p: Vector2 = (o + (b["p"] as Vector2)).round()
			if col == SPARK:
				c.draw_rect(Rect2(p, Vector2(1, 1)), col)
			else:
				# (a link torn loose, tumbling: face on and edge on by turns)
				_link(c, p, int(floorf(float(b["t"]) * 14.0 + float(b["z"]))) % 2 == 0, a)
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## One link: `open` a ring seen face on (an oval 4 wide, 3 tall, lit on its upper left, its hole the dark), else one seen edge on
## (a short bar).
func _link(c: CanvasItem, p: Vector2, open: bool, a := 1.0) -> void:
	if open:
		c.draw_rect(Rect2(p + Vector2(-1, -1), Vector2(2, 1)), Color(IRON3, a))
		c.draw_rect(Rect2(p + Vector2(-2, 0), Vector2(1, 1)), Color(IRON2, a))
		c.draw_rect(Rect2(p + Vector2(1, 0), Vector2(1, 1)), Color(IRON1, a))
		c.draw_rect(Rect2(p + Vector2(-1, 1), Vector2(2, 1)), Color(IRON1, a))
		c.draw_rect(Rect2(p + Vector2(-1, 2), Vector2(2, 1)), Color(SEAM, 0.7 * a))
	else:
		c.draw_rect(Rect2(p + Vector2(-1, 0), Vector2(1, 1)), Color(IRON2, a))
		c.draw_rect(Rect2(p, Vector2(1, 1)), Color(IRON1, a))
		c.draw_rect(Rect2(p + Vector2(-1, 1), Vector2(2, 1)), Color(SEAM, 0.6 * a))


## The iron band at his waist the chains are fast to: a strap 7 across, its rivet catching the light.
func _band(c: CanvasItem, w: Vector2) -> void:
	var p := w.round()
	c.draw_rect(Rect2(p + Vector2(-3, -1), Vector2(7, 3)), IRON1)
	c.draw_rect(Rect2(p + Vector2(-3, -1), Vector2(7, 1)), IRON2)
	c.draw_rect(Rect2(p + Vector2(-3, 2), Vector2(7, 1)), SEAM)
	c.draw_rect(Rect2(p + Vector2(-1, 0), Vector2(1, 1)), IRON3)
	c.draw_rect(Rect2(p + Vector2(2, 0), Vector2(1, 1)), IRON0)


## A stake, drawn on `c` at its own place among what stands (game pixels from its foot): an iron spike driven into the floor, the
## stone cracked round it, a ring on its head; once his chains are broken, two links left hanging from the ring.
func draw_stake(c: CanvasItem, s: Vector2) -> void:
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var y := -roundf(map.lift_at(s.x, s.y) / 2.0)
	# (the crack in the stone round its foot)
	c.draw_rect(Rect2(-3, y - 1, 6, 2), Color(SEAM, 0.75))
	c.draw_rect(Rect2(-4, y, 1, 1), Color(SEAM, 0.5))
	c.draw_rect(Rect2(3, y - 1, 1, 1), Color(SEAM, 0.5))
	# (the spike: lit down its left side)
	c.draw_rect(Rect2(-1, y - 5, 2, 5), IRON1)
	c.draw_rect(Rect2(-1, y - 5, 1, 4), IRON2)
	c.draw_rect(Rect2(-2, y - 6, 4, 1), IRON2)
	c.draw_rect(Rect2(-2, y - 6, 1, 1), IRON3)
	# (the ring on its head)
	c.draw_rect(Rect2(-1, y - 9, 2, 1), IRON3)
	c.draw_rect(Rect2(-2, y - 8, 1, 2), IRON2)
	c.draw_rect(Rect2(1, y - 8, 1, 2), IRON1)
	if phase != "held":
		_link(c, Vector2(1, y - 4), false)
		_link(c, Vector2(2, y - 2), true)
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## Gone with the floor (main.gd _build frees the place, and with it what stands on it).
func _exit_tree() -> void:
	for n in _stake_nodes:
		if is_instance_valid(n):
			n.queue_free()
	_stake_nodes = []


class _Chains extends Node2D:
	var k
	var front := false

	func _draw() -> void:
		k.draw_chains(self, front)


class _Stake extends Node2D:
	var k
	var at := Vector2.ZERO

	func _process(_dt: float) -> void:
		if k == null or not is_instance_valid(k):
			queue_free()
			return
		queue_redraw()

	func _draw() -> void:
		k.draw_stake(self, at)
