## THE STOKER, floor 3's furnace keeper, as the game fights him (game/act1_rules/stoker.ts RULES, STOKER_TUNE, FRAMES, LASTS,
## GEAR_AT; his pictures' own numbers, art/stoker_moves.ts and art/stoker_fx.ts; run as the bosses are, game/bosses.ts BossRules
## step, pickAct, startAct, stepAct, endAct, breakOff; game.ts struckT and render/figure.ts gaitFrame; render/render.ts
## STOKER_PIECES_FADE). An elite in his arena off floor 3 while the furnace burns (game.ts furnaceMade), not the floor's boss:
## his falling opens no way on; he leaves the forge crank's gear.
##   HE WALKS at 1.4 tiles a second, the floor shaking at each footfall (every 0.6 s of his walk, felt within 12 tiles). He sets
##     off after a hero further than 2.6 + 0.8 tiles (or out of his sight) and halts as his walk comes round (every 1.2 s of
##     it), as near the hero as he likes to stand. Struck while he stands or walks, he reels (his picture only: 13 frames).
##   HIS ACTS, the biggest ready one the hero is in reach of (and in his sight), each at its own clock. As each begins he is
##     turned SQUARE to the nearest of the four ways his pictures are seen (in front, in front turned over, behind, behind
##     turned over: his forward along one of the floor's axes) toward the hero, and turned no more until it is over; its fire
##     is laid in that frame from where he stands, and every blow is reckoned in it, where its picture lands (perils.gd, THE
##     STOKER'S, which strikes; stopped before its blow lands, it is gone with him; landed, it burns on by itself):
##     THE SHOVEL OF COALS (stoker:coals; 3.1 s; a hero 2.2 to 8 tiles off): where the hero stands 1.0 s in is taken and kept
##       (8 tiles off at the most); at 1.83 s seven coals fly, each coming down 0.62 to 0.83 s later on its own spot round it,
##       0.6 round: a hero within it (and 0.15) as it lands is struck, x1.0 (by coals landing in the same step, once); each
##       burns 3 s, whoever stands in one burnt x0.3 every 0.5 s until it dies down (2.6 s).
##     THE FIRE RAKE (stoker:rake; 3.0 s; within 4.2 tiles; every 4.5 s): at 1.03 s the blade comes down at his right, 75
##       degrees off his forward, and is dragged round to 60 degrees to his left over 0.47 s, fastest at first; a hero in the
##       band 1.5 to 4.2 tiles before him as the blade passes his way (within 10 degrees of it) is struck, x1.2, once; the
##       band behind the blade burns 3.6 s, whoever stands in it burnt x0.3 every 0.5 s until it dies down (3.1 s).
##     THE FURNACE BURSTS (stoker:burst; 3.4 s; within 6 tiles; every 10 s), his finisher, once he is below a third of his
##       life: at 1.47 s a ring rolls out from him, from 1.2 tiles at 8 tiles a second to 6.8, 0.8 deep; a hero within its
##       depth as it passes, and not in one of its three gaps (34 degrees wide, at 60, 180 and 300 degrees off his forward),
##       is struck once, x1.6.
##   HIS DEATH, THE FURNACE EXPLODES (4.2 s of his pictures): the blast on the floor under him from 1.55 s (harmless); what is
##     left of him fades over 2 s once his death is done; THE GEAR lies 2.25 tiles before him and 0.36 to his left as his
##     picture was seen (where he fell, if that is no floor), and is picked up, once it lies still (2.85 s after he falls), by
##     a hero within 0.9 tiles of it: monsters.gd quest_item("gear", where it lay).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")

## (RULES.gait: the pace his walk is painted for, art/stoker_moves.ts ST_PACE, and its round, ST_WALK's 12 frames at 10 a
## second; he sets off and halts at once, his walk looping from his stand; STOKER_TUNE.stopAt)
const GAIT := {"pace": 1.4, "cycle": 1.2, "setOff": 0.0, "halt": 0.0, "stopAt": 2.6, "slack": 0.8}
## (RULES.tick, ST_SHAKE: the camera shaken `by` game pixels at each footfall, two a round of his walk, felt within `near`)
const FOOTFALL := {"every": 0.6, "by": 1.0, "near": 12.0}

## HIS PICTURES' OWN MOMENTS (art/stoker_moves.ts ST_COALS, ST_RAKE, ST_BURST; art/stoker.ts ST_DEATH), seconds: the art counts
## his blows on the game's frames, 30 a second.
## (the coals: where they will come down marked from COALS_MARK, where the hero stands then; flung at COALS_HIT)
const COALS_MARK := 1.0
const COALS_HIT := 55.0 / 30.0
## (the rake: its arc marked from RAKE_MARK; slammed down at RAKE_HIT, then dragged round for RAKE_DRAG)
const RAKE_MARK := 0.3
const RAKE_HIT := 31.0 / 30.0
const RAKE_DRAG := 14.0 / 30.0
## (the burst: his door flung open at BURST_OPEN; the ring marked from BURST_MARK; the fire out of him at BURST_HIT)
const BURST_OPEN := 0.3
const BURST_MARK := 0.4
const BURST_HIT := 44.0 / 30.0
## (his death: how long its pictures are; he bursts at DIES_HIT; his gear lies still from GEAR_STILL. render/render.ts
## STOKER_PIECES_FADE: what is left of him fades over this long, once his death is done)
const DIES_LONG := 4.2
const DIES_HIT := 1.55
const GEAR_STILL := 2.85
const PIECES_FADE := 2.0

## (ACTS, his basic blow first and his biggest last: `first`, seconds from waking before it may first be used; `after`, the
## wait after it before his next act; `near` and `far`, the hero's distance at which it is used; `peril`, what it lays on the
## floor, perils.gd, which strikes: how hard, TUNE. The game's names for them: stoker:coals, stoker:rake, stoker:burst)
const ACTS := [
	{"id": "coals", "clip": "attack", "long": 3.1, "hit": COALS_HIT, "cooldown": 0.0, "first": 0.8, "after": 0.9, "near": 2.2, "far": 8.0, "peril": "st_coals"},
	{"id": "rake", "clip": "rake", "long": 3.0, "hit": RAKE_HIT, "cooldown": 4.5, "first": 1.5, "after": 0.9, "near": 0.0, "far": 4.2, "peril": "st_rake"},
	{"id": "burst", "clip": "burst", "long": 3.4, "hit": BURST_HIT, "cooldown": 10.0, "first": 0.0, "after": 1.2, "near": 0.0, "far": 6.0, "peril": "st_ring"},
]
## (STOKER_TUNE: how hard each blow is, times his own; the burning's tick and how hard it burns; the burst comes below
## `burstBelow` of his life; how near the gear must be to be picked up, tiles)
const TUNE := {"coal": 1.0, "rake": 1.2, "ring": 1.6, "burn": 0.3, "tick": 0.5, "burstBelow": 1.0 / 3.0, "take": 0.9}
## (TUNE.heroRadius; his fire reaches half of it beyond its edge)
const HERO_R := 0.3

## WHAT HIS FIRE DOES ON THE FLOOR (art/stoker_fx.ts), tiles and seconds.
## (COALS: seven, each landing `flight` after the hit and `stagger` after the last, from `high` tiles up at the top of its arc;
## thrown at a hero `reach` tiles off at the most. COAL_SPOTS: each one's spot about where the hero stood: tiles along his
## forward, to his left. COAL_FIRE: its fire `r` round, burning `burns`, dying over its last `dies`)
const COALS := {"n": 7, "flight": 0.62, "stagger": 0.035, "high": 2.4, "reach": 8.0}
const COAL_SPOTS := [[0.0, 0.0], [1.55, 0.55], [1.15, -1.25], [-1.35, 0.95], [-1.05, -1.4], [0.25, 1.85], [0.05, -1.9]]
const COAL_FIRE := {"r": 0.6, "burns": 3.0, "dies": 0.8}
## (RAKE_FIRE: the band before him, from `r0` to `r1` out. RAKE_ARC: the ways of the blade on the floor, degrees off his
## forward to his left, from its start to its end)
const RAKE_FIRE := {"r0": 1.5, "r1": 4.2, "burns": 3.6, "dies": 1.0}
const RAKE_ARC := [-75.0, 60.0]
## (RING: rolling out from `r0` to `r1` round him at `pace` tiles a second, `deep` deep; its three gaps, `gap` degrees wide, at
## these ways off his forward; the floor it has passed scorched for `scorch`)
const RING := {"r0": 1.2, "r1": 6.0, "pace": 8.0, "deep": 0.8, "gap": 34.0, "gaps": [60.0, 180.0, 300.0], "scorch": 1.4}
## (BLAST: his death's shockwave, the same way; the floor scorched `scorch` round where he stood)
const BLAST := {"r0": 0.5, "r1": 3.0, "pace": 10.0, "deep": 0.5, "scorch": 1.2}
## (art/new_mobs3.ts TILE3: how many of his own lengths a tile is)
const TILE3 := 39.191835884530846
## (GEAR_AT: where his gear lies when it is still, art/stoker_moves.ts GEAR_REST, 88 of his lengths before him and 14 to his
## left, in tiles. art/stoker.ts GEAR: the gear itself, 9.5 of his lengths round, fourteen teeth)
const GEAR_AT := [88.0 / TILE3, 14.0 / TILE3]
const GEAR := {"r": 9.5 / TILE3, "teeth": 14}
## Where the coals leave his shovel: its lip at the hit (render/act1_fx/stoker.ts fromOf, worked out there from his bones:
## tiles before him, to his left, and up), and how high each one's arc is, times COALS.high (art/stoker_fx.ts coalAt's hash).
## THE GAME GIVES THE LIP'S HEIGHT IN HIS LENGTHS (168.93) WHERE coalAt TAKES TILES, so there each coal comes down out of the
## sky, out of sight until its last moment; here it is given in tiles (168.93 / TILE3), so that they are seen to fly from
## his shovel, as his pictures' notes have them. Seen only: where and when each lands is the same either way.
const COAL_FROM := [2.3498029215301544, -0.644386449249406, 168.93236670863462 / TILE3]
const COAL_HIGH := [0.9669013316277414, 1.1498713456094265, 0.9365161283873021, 0.999920046981424, 0.9781799810705706, 0.9433787099085748, 0.8911467520520091]

## THE FOUR WAYS THE GAME SHOWS HIM (FRAMES, by index, as kept on his perils): in front, in front turned over, behind, behind
## turned over; in each, his forward `f` and his left `l` on the floor.
const FRAMES := [
	{"f": Vector2(1, 0), "l": Vector2(0, -1)},
	{"f": Vector2(0, 1), "l": Vector2(-1, 0)},
	{"f": Vector2(0, -1), "l": Vector2(-1, 0)},
	{"f": Vector2(-1, 0), "l": Vector2(0, -1)},
]

var mode := "stand"
var gt := 0.0
var cds: Array = []
## The act he is making: {i, t, peril: what it has laid on the floor}; null: none.
var act = null
## (how long he has walked since his last footfall, and how long since a blow last landed on him)
var _foot := 0.0
var _struck := INF


## A step of him, awake (monster.gd step hands him here).
func step(m, dt: float, hero) -> void:
	# (struck, he reels from the blow, not from what burns or poisons him: game.ts struckT; monster.gd struck_t)
	_struck = m.struck_t
	# (RULES.tick: the floor shaking at each footfall as he walks, two a round of his walk; felt near him)
	if act == null and mode == "walk":
		_foot += dt
		if _foot >= FOOTFALL["every"]:
			_foot -= FOOTFALL["every"]
			if hero.world.distance_to(m.world) < FOOTFALL["near"]:
				hero.kick(FOOTFALL["by"])
	else:
		_foot = 0.0
	if cds.is_empty():
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	# (FRENZIED, on him, hurrying him, and Withering slowing him: game.ts updateMonsters, `m.cd -= mdt * rage * wither`; bosses.ts step, his acts' waits by `rage`, his pace by it)
	for k in cds.size():
		cds[k] -= dt * m.frenzy()
	# (put to sleep in the middle of a move, as the hero fell, and woken again: the move is broken off)
	if act != null and m.state != "act":
		_break_off()
	if act != null:
		_step_act(m, dt, hero)
		return
	m._cd -= dt * m.rage()
	m.state = "chase"
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	var want := _pick(m, dist, los) if m._cd <= 0.0 and hero.alive else -1
	var moving := mode == "setOff" or mode == "walk" or mode == "halt"
	var go: bool = hero.alive and want < 0 and (dist > GAIT["stopAt"] + GAIT["slack"] or (not los and dist > 1.2))
	if not moving:
		gt += dt
		if dist > 0.01:
			m.face = to / dist
		if want >= 0:
			_start(m, want, hero)
			return
		if go:
			_to("setOff")
		_show(m)
		return
	# CARRIED OVER THE FLOOR AT HIS PACE, from the first moment of setting off to the last of stopping
	# (chilled, slower by the chill's share: bosses.ts step, `slow`; monster.gd slow)
	var sp: float = m.speed * m.slow() * m.rage()
	var v := Vector2.ZERO
	if dist > 0.01:
		v = to / dist if dist < 2.5 and los else m.mgr.flow_dir(m.world)
	if mode != "halt" and v != Vector2.ZERO:
		m.face = v
	_carry(m, m.face * sp * dt)
	var before := gt
	gt += dt * sp / GAIT["pace"]
	# (he means to stop where his walk next comes round: an act is ready and the hero in its reach, or there is no way on; or,
	# there, stopping would leave him as near the hero as he likes to stand)
	var stop := want >= 0 or v == Vector2.ZERO
	var here: bool = stop or (los and dist - GAIT["pace"] * GAIT["halt"] <= GAIT["stopAt"])
	if mode == "setOff":
		if gt >= GAIT["setOff"]:
			_to("halt" if here else "walk")
	elif mode == "walk":
		if here and floori(gt / GAIT["cycle"]) > floori(before / GAIT["cycle"]):
			_to("halt")
	elif gt >= GAIT["halt"]:
		_to("stand")
	_show(m)


func _to(next: String) -> void:
	mode = next
	gt = 0.0


## His picture when he makes no act (render/figure.ts gaitFrame): struck, he reels as his picture has it, from the blow;
## walking, his walk by the ground he has covered; else his stand, by how long he has stood.
func _show(m) -> void:
	if m.art.has("reel") and _struck < m.art.length("reel"):
		m._set_list("reel")
		m._anim_t = _struck
		return
	m._set_list("walk" if mode == "walk" else "idle")
	m._anim_t = gt


## pickAct: the biggest ready act the hero is in reach of; -1, none (he comes on, or waits).
func _pick(m, dist: float, los: bool) -> int:
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if cds[i] > 0.0:
			continue
		if dist < a["near"] or dist > a["far"]:
			continue
		# (RULES.can: his finisher, once he is below a third of his life)
		if a["id"] == "burst" and m.life >= m.max_life * TUNE["burstBelow"]:
			continue
		if not los:
			continue
		return i
	return -1


## startAct, RULES.start: turned square to the nearest of his four ways toward the hero, and from here on turned no more until
## it is over; what it lays on the floor begun, in that frame, from where he stands: its clock his act's, its harm rolled
## once, now, and (the coals') where the hero stands.
func _start(m, i: int, hero) -> void:
	var a: Dictionary = ACTS[i]
	var k := nearest_frame(hero.world - m.world)
	m.face = FRAMES[k]["f"]
	m.state = "act"
	m._set_list(a["clip"], true)
	m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
	act = {"i": i, "t": 0.0, "peril": m.mgr.perils.st_act(m, a["peril"], k, in_frame(k, m.world, hero.world), m._roll(), a["hit"])}


## stepAct, RULES.acting: its clock runs, his pictures by it, and what it does at each moment is done.
func _step_act(m, dt: float, hero) -> void:
	var a: Dictionary = ACTS[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(a["long"], t0 + dt)
	var t1: float = act["t"]
	m._anim_t = t1
	match a["id"]:
		"coals":
			if _at(t0, t1, 0.1):
				_sound(m, "fire", 0.35)
			if _at(t0, t1, COALS_MARK):
				# (where the hero stands at the mark is kept: thrown at a hero up to COALS.reach off; farther, at that much along
				# the way to him)
				var p: Dictionary = act["peril"]
				var r := in_frame(p["frame"], Vector2(p["x"], p["y"]), hero.world)
				p["aim"] = r * (COALS["reach"] / r.length()) if r.length() > COALS["reach"] else r
			if _at(t0, t1, COALS_HIT):
				_sound(m, "swing", 0.7)
				_sound(m, "fire", 0.5)
		"rake":
			if _at(t0, t1, RAKE_HIT):
				hero.kick(2.0)
				_sound(m, "hit", 0.6)
				_sound(m, "fire", 0.6)
		"burst":
			if _at(t0, t1, BURST_OPEN):
				_sound(m, "fire", 0.5)
			if _at(t0, t1, BURST_HIT):
				hero.kick(3.0)
				_sound(m, "explode", 0.8)
	if t1 >= a["long"]:
		_end(m, a)


## endAct: the act is over; he stands as his pictures leave him, and waits his moment.
func _end(m, a: Dictionary) -> void:
	var i: int = act["i"]
	m.state = "chase"
	act = null
	_to("stand")
	m._cd = float(a["after"]) * randf_range(0.9, 1.15)
	if a["cooldown"] > 0.0:
		cds[i] = a["cooldown"]
	m._set_list("idle", true)


## breakOff: his act is broken off (what it had begun on the floor, its blow not yet landed, goes: perils.gd).
func _break_off() -> void:
	act = null
	_to("stand")


## As he falls (RULES.died): the blast on the floor under him, from his death's start; his gear where it comes to lie, on the
## floor, or as near it as can be had; and what is left of him fades once his death is done, the gear left lying.
func died(m) -> void:
	act = null
	# (game.ts kill: one that is no boss, and whose kind has no voice, falls with the game's own sound)
	_sound(m, "monster_die", 0.7)
	var k := frame_of(m.face)
	m.mgr.perils.st_blast(m.world, k)
	var gear := Gear.new()
	gear.mgr = m.mgr
	gear.at = spot_of(k, m.world, GEAR_AT[0], GEAR_AT[1])
	if not m.mgr.map.walkable(floori(gear.at.x), floori(gear.at.y)):
		gear.at = m.world
	# (on the floor, under everyone, over what his fire has left there)
	m.mgr.perils.add_child(gear)
	# (his picture's own, not his: sight.gd says whether he is seen, and monster.gd fades what lies at the end of its while)
	var fade: Tween = m.create_tween()
	fade.tween_interval(DIES_LONG)
	fade.tween_property(m._sprite, "modulate:a", 0.0, PIECES_FADE)


## game.ts slide, for him: the step along x kept if his body (no bigger than 0.42 round) is clear there, then the step along y.
func _carry(m, step: Vector2) -> void:
	var rr := minf(m.r, 0.42)
	if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
		m.world.x += step.x
	if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
		m.world.y += step.y


## A sound of the game's, as loud as the game plays it (game.ts sfx: 1, full).
func _sound(m, sound: String, vol: float) -> void:
	m.mgr.sfx.play(sound, linear_to_db(vol))


# --- his pictures' own sums (game/act1_rules/stoker.ts, art/stoker_fx.ts) ---

static func _at(t0: float, t1: float, at: float) -> bool:
	return t0 < at and t1 >= at


## smooth: 0 up to `a`, 1 from `b`, eased between.
static func smooth(a: float, b: float, t: float) -> float:
	var u := clampf((t - a) / (b - a), 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)


## frameOf: the frame he is shown in, facing `f` (as baked_figure.gd shows him: from behind if fx + fy < -0.2; turned over if
## fx - fy < 0).
static func frame_of(f: Vector2) -> int:
	var flip := f.x - f.y < 0.0
	if f.x + f.y < -0.2:
		return 3 if flip else 2
	return 1 if flip else 0


## nearestFrame: the one of the four nearest the way `d`.
static func nearest_frame(d: Vector2) -> int:
	var best := 0
	var most := -INF
	for k in FRAMES.size():
		var along: float = d.dot(FRAMES[k]["f"])
		if along > most:
			most = along
			best = k
	return best


## spotOf: a spot of the floor in frame `k`, `fwd` tiles along his forward and `left` to his left from `o`.
static func spot_of(k: int, o: Vector2, fwd: float, left: float) -> Vector2:
	var f: Vector2 = FRAMES[k]["f"]
	var l: Vector2 = FRAMES[k]["l"]
	return o + f * fwd + l * left


## inFrame: where `p` is in frame `k` from `o`: (tiles along his forward, tiles to his left). How far, its length; the way,
## degrees off his forward to his left, way_of.
static func in_frame(k: int, o: Vector2, p: Vector2) -> Vector2:
	var d := p - o
	var f: Vector2 = FRAMES[k]["f"]
	var l: Vector2 = FRAMES[k]["l"]
	return Vector2(d.dot(f), d.dot(l))


static func way_of(r: Vector2) -> float:
	return rad_to_deg(atan2(r.y, r.x))


## LASTS: how long what he lays on the floor lies there (perils.gd's kinds), its clock his act's: the coals' until the last
## coal's fire has burnt out and its scorch gone; the rake's to the end of its drag and its burning; the ring's until it has
## rolled out and its scorch has gone; the blast's, his death's pictures and 1.5 s more.
static func lasts(kind: String) -> float:
	match kind:
		"st_coals":
			return COALS_HIT + coal_lands(COALS["n"] - 1) + COAL_FIRE["burns"] + 1.3
		"st_rake":
			return RAKE_HIT + RAKE_DRAG + RAKE_FIRE["burns"] + 0.2
		"st_ring":
			return BURST_HIT + (RING["r1"] + RING["deep"] - RING["r0"]) / RING["pace"] + RING["scorch"] + 0.2
	return DIES_LONG + 1.5


## coalLands: when coal `i` lands, seconds after the hit.
static func coal_lands(i: int) -> float:
	return COALS["flight"] + i * COALS["stagger"]


## Coal `i`'s spot on the floor, aimed at `aim` (tiles along his forward, to his left) in frame `k` from `o`.
static func coal_spot(k: int, o: Vector2, aim: Vector2, i: int) -> Vector2:
	return spot_of(k, o, aim.x + COAL_SPOTS[i][0], aim.y + COAL_SPOTS[i][1])


## coalBurning: whether coal `i` still burns `t` seconds into his throw: landed, and not yet died down.
static func coal_burning(i: int, t: float) -> bool:
	var age := t - (COALS_HIT + coal_lands(i))
	return age >= 0.0 and age < COAL_FIRE["burns"] - COAL_FIRE["dies"] * 0.5


## coalAt: where coal `i` is `since` seconds after the hit, on its way to its spot about `aim`: (tiles along his forward, to his
## left, up): a high arc, as a thing thrown up and over comes down.
static func coal_at(i: int, since: float, aim: Vector2) -> Vector3:
	var u := clampf(since / coal_lands(i), 0.0, 1.0)
	var z: float = COAL_FROM[2] * (1.0 - u) + 4.0 * COALS["high"] * u * (1.0 - u) * COAL_HIGH[i]
	return Vector3(lerpf(COAL_FROM[0], aim.x + COAL_SPOTS[i][0], u), lerpf(COAL_FROM[1], aim.y + COAL_SPOTS[i][1], u), z)


## rakeWay: the way the blade is on the floor `since` seconds after the hit (degrees off his forward, to his left), as it is
## dragged round: fastest at first, slowing as it comes round.
static func rake_way(since: float) -> float:
	var u := clampf(since / RAKE_DRAG, 0.0, 1.0)
	return lerpf(RAKE_ARC[0], RAKE_ARC[1], 1.0 - (1.0 - u) * (1.0 - u))


## rakePasses: when the blade passes the way `deg` (seconds after the hit); NAN if it never does.
static func rake_passes(deg: float) -> float:
	if deg < RAKE_ARC[0] or deg > RAKE_ARC[1]:
		return NAN
	return (1.0 - sqrt(1.0 - (deg - RAKE_ARC[0]) / (RAKE_ARC[1] - RAKE_ARC[0]))) * RAKE_DRAG


## ringAt: how far out the ring's front is `since` seconds after the hit (tiles); NAN before it, and once it has rolled out.
static func ring_at(since: float) -> float:
	var r: float = RING["r0"] + RING["pace"] * since
	return NAN if since < 0.0 or r > RING["r1"] + RING["deep"] else r


## inGap: whether the way `deg` (off his forward, to his left) is in one of the ring's gaps.
static func in_gap(deg: float) -> bool:
	var a := fposmod(deg, 360.0)
	for g in RING["gaps"]:
		if absf(fposmod(a - g + 540.0, 360.0) - 180.0) < RING["gap"] / 2.0:
			return true
	return false


## blastAt: how far out his death's shockwave is `since` seconds after he bursts (tiles); NAN before it, and once it has passed.
static func blast_at(since: float) -> float:
	var r: float = BLAST["r0"] + BLAST["pace"] * since
	return NAN if since < 0.0 or r > BLAST["r1"] + BLAST["deep"] else r


## HIS GEAR, the forge crank's, lying where it came to rest until it is taken (RULES.peril's GEAR_PERIL; game.ts
## furnaceGearTaken): picked up, once it lies still, by a hero who comes within TUNE.take of it; monsters.gd quest_item says so,
## and it is gone. A thing of its own on the floor, not one of perils.gd's marks: those are swept away when the hero falls
## (hero.gd _back), and the gear must lie there still. Drawn, once his death's pictures (which show it until then) are done,
## as a stand-in for the art chat's picture (art/stoker_room.ts gearDropped, GEAR_GLINT): a cog of worn iron, fourteen
## teeth, four spokes and a hub, a glint on it now and then (two of every eight frames, eight a second), a little light
## about it.
class Gear extends Node2D:
	## (art/stoker.ts GEAR_IRON, dark to pale; its glint)
	const IRON_DARK := Color("#1c1719")
	const IRON := Color("#90847c")
	const IRON_PALE := Color("#c6b8a8")
	const GLINT := Color("#fff6e0")

	var mgr  # monsters.gd
	var at := Vector2.ZERO
	var t := 0.0

	func _ready() -> void:
		position = Iso.to_screen(at.x, at.y)

	func _process(dt: float) -> void:
		t += dt
		var hero = mgr.hero
		if t >= GEAR_STILL and hero != null and hero.alive and hero.world.distance_to(at) <= TUNE["take"]:
			mgr.quest_item.emit("gear", at)
			queue_free()
			return
		# (lying, its light in the dark round it: render/act1_fx/stoker.ts gear)
		if t >= DIES_LONG and mgr.perils != null and mgr.perils.look != null:
			mgr.perils.look.spot(Iso.to_screen(at.x, at.y) / 2.0, 16.0, 0.35)
		queue_redraw()

	func _draw() -> void:
		if t < DIES_LONG:
			return
		if is_instance_valid(mgr) and mgr.perils != null and mgr.perils.has_film("st_gear"):
			# (THE GAME'S OWN picture of it, art/stoker_room.ts gearDropped: lying flat, glinting now and then, 8 pictures at
			# 8 a second)
			mgr.perils._film_pic(self, "st_gear", "stand", floori(t * 8.0) % 8, Vector2.ZERO)
			return
		var r: float = GEAR["r"]
		var teeth: int = GEAR["teeth"]
		draw_colored_polygon(_round(r * 2.4, 20), Color(IRON_PALE, 0.16))
		var rim := PackedVector2Array()
		for i in teeth * 4:
			var a := TAU * i / (teeth * 4.0)
			var out := r if i % 4 < 2 else r * 0.8
			rim.append(Iso.to_screen(cos(a) * out, sin(a) * out))
		draw_colored_polygon(rim, IRON)
		rim.append(rim[0])
		draw_polyline(rim, IRON_DARK, 1.0)
		draw_colored_polygon(_round(r * 0.55, 16), IRON_DARK)
		for i in 4:
			var a := TAU * (i + 0.5) / 4.0
			draw_line(Vector2.ZERO, Iso.to_screen(cos(a) * r * 0.6, sin(a) * r * 0.6), IRON_PALE, 2.0)
		draw_colored_polygon(_round(r * 0.27, 10), IRON_PALE)
		if int(t * 8.0) % 8 in [2, 3]:
			draw_rect(Rect2(Iso.to_screen(r * 0.7, -r * 0.7) + Vector2(-2, -3), Vector2(3, 3)), GLINT)

	## A circle `r` tiles round it on the floor: an ellipse on the screen.
	func _round(r: float, n: int) -> PackedVector2Array:
		var pts := PackedVector2Array()
		for i in n:
			var a := TAU * i / n
			pts.append(Iso.to_screen(cos(a) * r, sin(a) * r))
		return pts
