## THE FLESHMANCER, floor 5's boss, as the game fights him, his moves done the action way (game/bosses.ts GAITS.fleshmancer,
## FM2_ACTS, FLESH_BLINK, FLESHMANCER, BOSS_PACE; BossRules step, forcedAct, pickAct, startAct, fmActing, endAct,
## raiseFromHeaps, died; game/fm_action.ts FM2; game/facing.ts; game/boss_calls.ts). The numbers of his moves are his
## pictures' own (art/fleshmancer_action.ts, art/fleshmancer_action_fx.ts), copied here; what his moves leave on the floor is
## stepped and drawn by perils.gd (its block THE FLESHMANCER'S, game/fm_action.ts stepFm), which reads these tables.
## The owner's outline (bosses.ts): "a very powerful cultist fleshmancer, human sized, whose spells fill the room and must be
## dodged"; and, 17 Oct 2026, 11:37: "The fleshmancer needs a teleport to move around the arena."
##   HIS GLIDE: he stands; he sets off after a hero further than 3.6 + 1.6 tiles (or out of his sight), glides at 1.6 tiles a
##     second, and halts where his glide comes round to its first frame, as near the hero as he likes to stand.
##   HIS ACTS, the biggest ready one he is in reach of (and sees the hero, but for raising the dead), each at its own clock:
##     THE SHARDS (his basic blow, from as far as 9.5 tiles): two fans of bone shards drawn up out of the floor and hung
##       before him, their lanes marked: nine aimed at the hero as he begins, then eight in their gaps, turned toward where
##       the hero is by then; flung at 0.87 s and 1.73 s, 15 tiles a second out to 10 tiles; each strikes once, 42% of his blow.
##     THE RINGS OF HANDS (within 6.2 tiles; every 9 s): five rings of cracks round where he stands, two gaps in each; the
##       first, third and fifth burst up at 1.2 s, the others at 2.0 s; a hero within half a tile of a hand as its ring comes
##       up (and 0.3 s after) is struck, 90% of his blow, once by each ring.
##     THE FIRE (within 7 tiles; every 15 s): from 1.07 s to 2.27 s the stream out of the skull's jaws is whipped round him,
##       a turn and more, out to 7 tiles; the floor is left burning in ten lanes, 3 s each; the stream burns 50% of his blow
##       every 0.22 s, a lane half that.
##     RAISE THE DEAD (within 14 tiles, seen or not; every 17 s; never more than 6 of his standing): at 1.4 s as many as
##       three skeletons come up, one beside each bone heap of his hall on the hero's side, the rest round him.
##     HIS TELEPORT (not chosen: when the hero has stood within 2.6 tiles of him for 1.5 s, or after 12 s anyway, both
##       counted, as the game counts them, only while he is between his moves): his dead drag him down into a pit (1 s;
##       nothing reaches him from 0.67 s), he is nowhere for 0.4 s, and he erupts out of another, 5 tiles or more from the
##       hero and in his sight, marked a second before: whoever is within 2 tiles of it as he erupts is struck, his whole
##       blow, and thrown back. Nothing reaches him until he has erupted.
##   Below half his life his waits run 35% faster. He calls out his moves, a line at most every 5 seconds, his shards' at
##   most every 20. When he falls, the dead he raised fall with him.
extends RefCounted

## (GAITS.fleshmancer: the pace his glide is painted for and its loop; setting off, stopping; how near the hero he comes, and
## how much further off the hero must be before he sets off again. He goes at 1.6 tiles a second, BOSS_PACE: his own speed.)
const GAIT := {"pace": 1.0, "cycle": 1.0, "setOff": 0.5, "halt": 0.6, "stopAt": 3.6, "slack": 1.6}
## (FM2_ACTS; the game's names for them: fm:shards, fm:rings, fm:fire, raise, blink, rise. `forced`: not chosen, his rules bring it.)
const ACTS := [
	{"id": "shards", "clip": "attack", "long": 80.0 / 30.0, "hit": 26.0 / 30.0, "dmg": 0.42, "cooldown": 0.0, "first": 0.0, "after": 0.9, "near": 0.0, "far": 9.5},
	{"id": "rings", "clip": "rings", "long": 92.0 / 30.0, "hit": 36.0 / 30.0, "dmg": 0.9, "cooldown": 9.0, "first": 4.0, "after": 0.8, "near": 0.0, "far": 6.2},
	{"id": "fire", "clip": "fire", "long": 102.0 / 30.0, "hit": 32.0 / 30.0, "dmg": 0.5, "cooldown": 15.0, "first": 9.0, "after": 1.0, "near": 0.0, "far": 7.0},
	{"id": "raise", "clip": "raise", "long": 84.0 / 30.0, "hit": 42.0 / 30.0, "dmg": 0.0, "cooldown": 17.0, "first": 6.0, "after": 0.8, "near": 0.0, "far": 14.0},
	{"id": "blink", "clip": "sink", "long": 1.0 + 0.4, "hit": 20.0 / 30.0, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "rise", "clip": "rise", "long": 42.0 / 30.0, "hit": 20.0 / 30.0, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 99.0, "forced": true},
]
const BLINK_ACT := 4
const RISE_ACT := 5

# --- his pictures' own numbers (art/fleshmancer_action.ts: seconds, his frames at 30 a second) ---

## (SHARD_HITS, SHARD_DRAW, SHARD_LONG: each fan flies at its hit; when each is drawn up out of the floor, from and to)
const SHARD_HITS := [26.0 / 30.0, 52.0 / 30.0]
const SHARD_DRAW := [[3.0 / 30.0, 14.0 / 30.0], [34.0 / 30.0, 44.0 / 30.0]]
const SHARD_LONG := 80.0 / 30.0
## (RING_HITS: his two slams)
const RING_HITS := [36.0 / 30.0, 60.0 / 30.0]
## (FIRE_HIT, FIRE_STOP, FIRE_LONG; WHIP: where the stream starts, radians to his left of the way he faces, how far round it
## goes, thrown round fastest at first)
const FIRE_HIT := 32.0 / 30.0
const FIRE_STOP := 68.0 / 30.0
const FIRE_LONG := 102.0 / 30.0
const WHIP := {"from": -0.75, "round": 385.0 * PI / 180.0, "ease": 1.45}
## (RAISE_HIT, RAISE_LONG, RAISE_HOLD: the summoning, from his arms flung up to the call)
const RAISE_HIT := 42.0 / 30.0
const RAISE_LONG := 84.0 / 30.0
const RAISE_HOLD := [22.0 / 30.0, 40.0 / 30.0]
## (the mini fleshmancer's fire: MINI_HIT, MINI_STOP, MINI_LONG, MINI_WHIP: across before him, from his right to his left)
const MINI_HIT := 26.0 / 30.0
const MINI_STOP := 44.0 / 30.0
const MINI_LONG := 68.0 / 30.0
const MINI_WHIP := {"from": -1.3, "round": 2.6, "ease": 1.35}

# --- what he sends out (art/fleshmancer_action_fx.ts) ---

## (SHARDS: a fan of 9 and a fan of 8 in its gaps, 12 degrees apart; each hangs 1.6 tiles out from him, 40 picture pixels
## up; flies 15 tiles a second out to 10 tiles; strikes a hero within 0.3 of it; its lane marked out to 6.5; its burst 0.35 s)
const SHARDS := {"fan": [9, 8], "apart": 12.0, "hang_r": 1.6, "hang_z": 40.0, "speed": 15.0, "reach": 10.0, "r": 0.3, "lane": 6.5, "burst": 0.35}
## (RINGS: five, a hand every 0.62 tiles round each, two gaps of three hands opposite each other, each ring's turned 1.15
## radians on from the last; rings 1, 3 and 5 at his first slam, each a frame after the one inside it; a hand strikes within 0.5)
const RINGS := {"radii": [1.4, 2.6, 3.8, 5.0, 6.2], "apart": 0.62, "gapHands": 3, "turn": 1.15, "first": [0, 2, 4], "r": 0.5, "lit": 6.0 / 30.0, "ripple": 1.0 / 30.0}
## (FIRE: the stream comes down 0.9 tiles from him and runs on to 7, half a tile to either side; every 40 degrees of its turn
## it leaves a lane burning, 0.3 to either side, 3 s, dying back from its end over the last 0.8, then scorched 1.2 s)
const FIRE := {"land": 0.9, "reach": 7.0, "half": 0.5, "every": 40.0 * PI / 180.0, "laneHalf": 0.3, "burn": 3.0, "die": 0.8, "scorch": 1.2}
const MINI_FIRE := {"land": 0.5, "reach": 3.6, "half": 0.38, "every": 32.0 * PI / 180.0, "laneHalf": 0.24, "burn": 2.0, "die": 0.6, "scorch": 0.9}
## (RAISE: each heap's dead burst up 0.05 s after the one before, its bone and dirt thrown 1.4 tiles in 0.7 s: drawn only)
const HEAP := {"apart": 0.05, "throw": 1.4, "long": 0.7}
## (PIT: the pit of his dead under him, 0.85 tiles round, open from frame 4 to frame 28 of his going)
const PIT := {"r": 0.85, "open": 4.0 / 30.0, "shut": 28.0 / 30.0}
## (RISE_MARK: where he will rise, marked from a second before he erupts, 2 tiles round; its burst out to the ring in 0.16 s)
const RISE_MARK := {"warn": 1.0, "r": 2.0, "out": 0.16}

# --- the rules' own numbers ---

## (game/fm_action.ts FM2: his teleport's going, out of reach from `gone`, nowhere for `pause`, coming back, out of reach
## till `up`; the rise's blow, a share of his; how long a ring's hands strike as they come up; how often the fire burns, and
## how much a lane does of the stream's; how long each of his perils lasts after its act begins)
const FM2 := {
	"sink": 1.0, "gone": 20.0 / 30.0, "pause": 0.4, "rise": 42.0 / 30.0, "up": 20.0 / 30.0,
	"riseDmg": 1.0, "handUp": 0.3, "tick": 0.22, "laneShare": 0.5,
	"lasts": {"shards": 80.0 / 30.0 + 0.5, "rings": 60.0 / 30.0 + 2.0, "fire": 102.0 / 30.0 + 3.0 + 1.2, "mini": 68.0 / 30.0 + 2.0 + 0.9},
}
## (game/bosses.ts FLESH_BLINK: he goes when the hero has been within `near` tiles for `crowd` seconds, or every `every`
## seconds of his fight; he comes up `far` tiles or more from the hero)
const BLINK := {"near": 2.6, "crowd": 1.5, "every": 12.0, "far": 5.0}
## (FLESHMANCER.hurryAt, hurry: below this share of his life he is quicker to cast again, by this much)
const HURRY := {"at": 0.5, "by": 1.35}
## (FLESHMANCER.raise: as many as `n` at a casting, never more than `most` standing, each `apart` after the one before. Its
## `stir` and `rise` are his pictures' of it: each is up and in the fight SUMMON.rise after it begins, as the Warden's dead.)
const RAISE := {"n": 3, "most": 6, "stir": 0.3, "rise": 1.0, "apart": 0.14}
const SUMMON_RISE := 1.4
## (defs.ts DEPTH_SCALE: a monster's life and blows grow by this share for every floor below the first)
const DEPTH_SCALE := {"life": 0.35, "dmg": 0.22}
## (game/boss_calls.ts BOSS_CALL_LINES, BOSS_CALLS: his lines, how long one stays up, the least time from one to the next, and
## from his basic blow's to its next)
const CALLS := {"shards": "Bone remembers how to cut.", "rings": "Stay in the circle.", "raise": "Rise. Serve.", "fire": "Burn, and be useful."}
const CALL_GAP := 5.0
const BASIC_GAP := 20.0
const SAY_FOR := 1.8
## (defs.ts MSG.foe: something dangerous has a name)
const FOE := Color("#ff8a3a")
## (game.ts knockHero: HEAVY.knock tiles a step)
const HEAVY_KNOCK := 0.6

## THE BONE HEAPS OF HIS HALL, where he raises his dead (game/first5.ts LAIR_HEAPS, the game's `L.floor.heaps`), by the floor
## and its seed ("depth:seed"). THE LAYOUT SHOULD CARRY THEM (assets/floor5/layout.json, made by tools/godot_export.ts): it
## does not yet, so floor 5's for seed 1 are written here. A hall with none: his dead come up round him.
const HEAPS := {"5:1": [Vector2(149.5, 98.5), Vector2(151.5, 85.5)]}

var mode := "stand"
var gt := 0.0
var cds: Array = []
## The act he is making: {i, t, hand}; null: none.
var act = null
var _clock := 0.0
var _last_call := -1000.0
var _last_basic := -1000.0
## (FLESH_BLINK) how long the hero has crowded him; how long till he goes anyway; gone, he is to come back.
var _crowd := 0.0
var _blink_in: float = BLINK["every"]
var _rise_next := false
## The dead he has called that have not yet begun to come up: {at, in}.
var _coming: Array = []


## A step of him, awake (monster.gd step hands him here).
func step(m, dt: float, hero) -> void:
	_clock += dt
	_come_up(m, dt, hero)
	_step(m, dt, hero)
	# (between his two pits nothing of him is drawn, his bar and his line too: render.ts unseen, blinkNowhere. Faded out,
	# not hidden: whether a monster is seen at all is sight.gd's to say.)
	m.modulate.a = 0.0 if _nowhere() else 1.0


func _step(m, dt: float, hero) -> void:
	if cds.is_empty():
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	# (hurt, he casts again sooner)
	var hurry: float = HURRY["by"] if m.life < m.max_life * HURRY["at"] else 1.0
	m._cd -= dt * hurry
	for k in cds.size():
		cds[k] -= dt * hurry
	if act != null:
		_step_act(m, dt, hero)
		return
	m.state = "chase"
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	var forced := _forced(m, dt, hero)
	var want := forced
	if forced < 0 and m._cd <= 0.0 and hero.alive:
		want = _pick(m, dist, los)
	var moving := mode == "setOff" or mode == "walk" or mode == "halt"
	var go: bool = hero.alive and forced < 0 and want < 0 and (dist > GAIT["stopAt"] + GAIT["slack"] or (not los and dist > 1.2))
	if not moving:
		m._set_list("idle")
		gt += dt
		if dist > 0.01:
			m.face = to / dist
		if want >= 0:
			_start(m, want, hero)
		elif go:
			_to("setOff")
		return
	# CARRIED OVER THE FLOOR AT HIS PACE, from the first moment of setting off to the last of stopping
	var sp: float = m.speed
	var v: Vector2 = to / dist if dist < 2.5 and los and dist > 0.01 else m.mgr.flow_dir(m.world)
	if mode != "halt" and v != Vector2.ZERO:
		m.face = v
	var step: Vector2 = m.face * sp * dt
	var rr := minf(m.r, 0.42)
	if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
		m.world.x += step.x
	if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
		m.world.y += step.y
	var before := gt
	gt += dt * sp / GAIT["pace"]
	# (he means to stop where his glide next comes round to its first frame: an act is ready and the hero in its reach, or
	# there is no way on; or, there, stopping would leave him as near the hero as he likes to stand)
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
	# (his pictures go by the ground he has covered)
	if mode == "stand":
		m._set_list("idle")
	else:
		m._set_list(mode)
		m._anim_t = gt


func _to(next: String) -> void:
	mode = next
	gt = 0.0


## forcedAct (FLESH_BLINK): gone, he comes back; crowded a while, or his while come round, he goes. -1: neither.
## (As the game has it, his clocks are set again the moment they bring his going, and he begins an act only from a stand:
## so a going that comes due while he glides is lost, and the next is 12 s on.)
func _forced(m, dt: float, hero) -> int:
	if _rise_next:
		_rise_next = false
		return RISE_ACT
	# (a hero who is down: the game is over there; here he waits for him)
	if not hero.alive:
		return -1
	var close: bool = hero.world.distance_to(m.world) < BLINK["near"]
	_crowd = _crowd + dt if close else 0.0
	_blink_in -= dt
	if _crowd >= BLINK["crowd"] or _blink_in <= 0.0:
		_crowd = 0.0
		_blink_in = BLINK["every"]
		return BLINK_ACT
	return -1


## pickAct: the biggest ready act he is in reach of; -1, none (he comes on, or waits).
func _pick(m, dist: float, los: bool) -> int:
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if a.get("forced", false) or cds[i] > 0.0:
			continue
		if dist < a["near"] or dist > a["far"]:
			continue
		if a["id"] == "raise":
			# (never more than six of his dead; out of the heaps, wherever the hero is: it needs no sight of him)
			if _called(m) > RAISE["most"] - 1:
				continue
		elif not los:
			continue
		return i
	return -1


## startAct: turned to the hero, and from here on turned no more until it is over.
func _start(m, i: int, hero) -> void:
	var a: Dictionary = ACTS[i]
	var to: Vector2 = hero.world - m.world
	if to.length() > 0.01:
		m.face = to.normalized()
	m.state = "act"
	act = {"i": i, "t": 0.0, "hand": hand_of(m.face)}
	m._set_list(a["clip"], true)
	m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
	if a["id"] == "raise":
		m.mgr.sfx.play("boss_roar", -3.0)
		if m.mgr.loot != null:
			m.mgr.loot.say("%s raises the dead" % m.title, FOE)
	# (THE BOSSES CALL OUT THEIR BIG MOVES: bossCall. Never two lines within 5 s; his shards' line, his basic blow's, no more
	# than once in 20 s, or it would be all he said)
	if CALLS.has(a["id"]) and _clock - _last_call >= CALL_GAP and not (i == 0 and _clock - _last_basic < BASIC_GAP):
		_last_call = _clock
		if i == 0:
			_last_basic = _clock
		m.say(CALLS[a["id"]], SAY_FOR)


func _step_act(m, dt: float, hero) -> void:
	var a: Dictionary = ACTS[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(a["long"], t0 + dt)
	var t1: float = act["t"]
	_acting(m, a, t0, t1, hero)
	if t1 >= a["long"]:
		_end(m, a)


## What each act does from t0 to t1 of it (fmActing): what it sends out is a peril, with its own clock from the act's start
## and its harm rolled once as the act begins (a share of his blow).
func _acting(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	var at := func(T: float) -> bool: return t0 < T and t1 >= T
	var begun: bool = at.call(1e-4)
	var perils = m.mgr.perils
	match a["id"]:
		"shards":
			if begun:
				var aim: Vector2 = hero.world - m.world
				perils.fm_shards(m.world, atan2(aim.y, aim.x), m._roll() * a["dmg"])
			for T in SHARD_HITS:
				if at.call(T):
					m.mgr.sfx.play("fire", -3.0)
					hero.kick(2.0)
		"rings":
			if begun:
				perils.fm_rings(m.world, atan2(m.face.y, m.face.x), m._roll() * a["dmg"])
			for k in RING_HITS.size():
				if at.call(RING_HITS[k]):
					hero.kick(5.0 if k == 0 else 4.0)
					m.mgr.sfx.play("slam", -2.0)
		"fire":
			if begun:
				perils.fm_fire(m.world, m.face, act["hand"], m._roll() * a["dmg"], false)
			if at.call(a["hit"]):
				m.mgr.sfx.play("fire")
				hero.kick(3.0)
		"raise":
			# (the bone heaps his dead will come out of, shaking from his summoning: the ones he will call on)
			if begun:
				var heaps := heaps_near(m, hero)
				var room := maxi(0, mini(RAISE["n"], RAISE["most"] - _called(m)))
				for k in mini(room, heaps.size()):
					perils.fm_heap(heaps[k], k)
			if at.call(a["hit"]):
				_raise_from_heaps(m, hero)
				hero.kick(3.0)
		"blink":
			if begun:
				perils.fm_pit(m.world)
			if at.call(0.24):
				m.mgr.sfx.play("slam", -6.0)
			if not at.call(FM2["sink"]):
				return
			# (gone, and nowhere: where he will come up, elsewhere in his hall, far from the hero and in sight of him; marked there)
			var spots: Array = []
			for s in spots_round(m.mgr.map, m.world, 120):
				if s.distance_to(hero.world) >= BLINK["far"] and m.mgr.sees(s, hero.world):
					spots.append(s)
			if not spots.is_empty():
				m.world = spots.pick_random()
				var d: Vector2 = hero.world - m.world
				if d.length() > 0.0:
					m.face = d.normalized()
			perils.fm_rise(m.world, FM2["pause"] + FM2["up"], m._roll() * FM2["riseDmg"])


## endAct: he stands as his pictures leave him, and waits his moment; gone, he comes back at once.
func _end(m, a: Dictionary) -> void:
	var i: int = act["i"]
	m.state = "chase"
	act = null
	_to("stand")
	m._cd = float(a["after"]) * randf_range(0.9, 1.15)
	if a["cooldown"] > 0.0:
		cds[i] = a["cooldown"]
	if a["id"] == "blink":
		_rise_next = true
		m._cd = 0.0
	m._set_list("idle", true)


## (blinkNowhere) Is he nowhere, between his two pits? (The game has one step between his going's end and his coming back's
## beginning in which he has no act, and is drawn standing where he will rise, and can be struck: here he is kept unseen and
## out of reach through it.)
func _nowhere() -> bool:
	return _rise_next or (act != null and act["i"] == BLINK_ACT and act["t"] >= FM2["sink"])


## (blinkedAway) Does a blow reach him now? Not between his going and his coming back: from 0.67 s into his going until he
## erupts (monster.gd hurt asks).
func reachable(_m) -> bool:
	if _rise_next:
		return false
	if act == null:
		return true
	return not ((act["i"] == BLINK_ACT and act["t"] >= FM2["gone"]) or (act["i"] == RISE_ACT and act["t"] < FM2["up"]))


## died: THE DEAD HE RAISED FALL WITH HIM: they were up by his will alone.
func died(m) -> void:
	m.modulate.a = 1.0
	_coming.clear()
	fall_with(m)


# --- raising the dead ---

## How many of the dead he has raised still stand, or are coming (called).
func _called(m) -> int:
	return _coming.size() + raised_by(m)


## THE FLESHMANCER RAISES THE DEAD (raiseFromHeaps): one out of each bone heap of his hall, standing up beside it on the side
## the hero is (where his hall has none, or too few, round him), each a little after the one before.
func _raise_from_heaps(m, hero) -> void:
	var room := maxi(0, mini(RAISE["n"], RAISE["most"] - _called(m)))
	if room <= 0:
		return
	var spots: Array = []
	for p in heaps_near(m, hero):
		if spots.size() >= room:
			break
		var best := Vector2.INF
		for s in spots_round(m.mgr.map, p, 5):
			if best == Vector2.INF or s.distance_to(hero.world) < best.distance_to(hero.world):
				best = s
		if best != Vector2.INF:
			spots.append(best)
	if spots.size() < room:
		var near := spots_round(m.mgr.map, m.world, room + 1)
		for k in range(1, near.size()):
			if spots.size() < room:
				spots.append(near[k])
	for k in spots.size():
		_coming.append({"at": spots[k], "in": k * RAISE["apart"]})
	_come_up(m, 0.0, hero)


## Each of the dead he has called begins to come up when its moment comes: his light on the spot, and it is up and in the
## fight 1.4 s later.
func _come_up(m, dt: float, hero) -> void:
	if _coming.is_empty():
		return
	var still: Array = []
	for c in _coming:
		c["in"] -= dt
		if c["in"] <= 0.0:
			m.mgr.perils.fm_glow(c["at"], 0.0, RAISE["stir"] + RAISE["rise"])
			raise_dead(m, c["at"], hero, SUMMON_RISE)
		else:
			still.append(c)
	_coming = still


## The bone heaps of his hall within 18 tiles of him, the nearest the hero first.
static func heaps_near(m, hero) -> Array:
	var out: Array = []
	for p in HEAPS.get("%d:%d" % [m.mgr.map.depth, m.mgr.map.map_seed], []):
		if p.distance_to(m.world) <= 18.0:
			out.append(p)
	out.sort_custom(func(a: Vector2, b: Vector2) -> bool: return a.distance_to(hero.world) < b.distance_to(hero.world))
	return out


## How many skeletons of his pack stand, or are coming up out of the ground.
static func raised_by(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and o != m and not o.dead and o.pack_id == m.pack_id and o.kind == "skeleton":
			n += 1
	return n


## One of the dead comes up at `at`, his: a skeleton of his pack, worth nothing, turned to the hero (game.ts spawn: an
## ordinary skeleton of this floor, its life and its blows grown with the floor). Made as the Warden's called dead are
## (monsters.gd summon): out of the ground in `secs`, till then only a picture. (The game's own picture of the
## Fleshmancer's way, its bones snatched up off the heap and slammed together, is not among the skeleton's lists: it crawls.)
static func raise_dead(m, at: Vector2, hero, secs: float) -> void:
	var mgr = m.mgr
	if not mgr._defs.has("skeleton"):
		return
	var def: Dictionary = mgr._defs["skeleton"]
	var deep := float(mgr.map.depth) - 1.0
	var life := roundf(float(def["life"]) * (1.0 + DEPTH_SCALE["life"] * deep))
	var blow: float = 1.0 + DEPTH_SCALE["dmg"] * deep
	var to: Vector2 = hero.world - at
	var f := to.normalized() if to.length() > 0.0 else Vector2(0.7071, 0.7071)
	if not mgr._figures.has("skeleton"):
		mgr._figures["skeleton"] = m.art.get_script().new(mgr._figures_dir, "skeleton", mgr._info)
	var s = m.get_script().new()
	s.mgr = mgr
	s.setup({"kind": "skeleton", "x": at.x, "y": at.y, "fx": f.x, "fy": f.y, "r": float(def["radius"]), "life": life, "maxLife": life,
		"dmgMin": float(def["dmgMin"]) * blow, "dmgMax": float(def["dmgMax"]) * blow, "speed": float(def["speed"]), "packId": m.pack_id,
		"boss": false, "champion": false}, def, mgr._figures["skeleton"])
	s.xp = 0.0
	s.rise(secs)
	mgr.stands.add_child(s)
	mgr.list.append(s)


## The skeletons of his pack fall with him (died): those still coming up go back into the ground; those up fall where they
## stand, worth nothing: they were his.
static func fall_with(m) -> void:
	for o in m.mgr.list:
		if not is_instance_valid(o) or o == m or o.dead or o.kind != "skeleton" or o.pack_id != m.pack_id:
			continue
		o.dead = true
		if o.state == "rise":
			gone(o)
			continue
		o.state = "dead"
		o._bar = 0.0
		o._set_list("die", true)
		m.mgr.perils.drop(o)
		o.queue_redraw()


## One of the floor's monsters gone at once, nothing of it left (one of the dead not yet up, back into the ground; a body
## the dead come up out of): freed, and out of the floor's list before the frame is over, so that nothing meets it freed.
static func gone(o) -> void:
	var mgr = o.mgr
	o.queue_free()
	(func() -> void: mgr.list.erase(o)).call_deferred()


## game.ts spotsRound (nav.ts scatter): as many as `count` places to stand round a point, tile middles, the nearest first:
## its own tile if that is floor to stand on (else the nearest that is, within four tiles), and a throw of the dice among
## the closest that can be walked to from it.
static func spots_round(map, at: Vector2, count: int) -> Array:
	var out: Array = []
	if count <= 0:
		return out
	var w: int = map.w
	var h: int = map.h
	var cx := clampi(floori(at.x), 0, w - 1)
	var cy := clampi(floori(at.y), 0, h - 1)
	if not map.walkable(cx, cy):
		var found := -1
		var found_d := INF
		var r := 1
		while r <= 4 and found < 0:
			for yy in range(cy - r, cy + r + 1):
				for xx in range(cx - r, cx + r + 1):
					if not map.walkable(xx, yy):
						continue
					var d := Vector2(xx + 0.5, yy + 0.5).distance_squared_to(at)
					if d < found_d:
						found_d = d
						found = yy * w + xx
			r += 1
		if found < 0:
			return out
		cx = found % w
		cy = found / w
	# (flooded outward over floor to stand on, side steps only, until there are comfortably more tiles than are wanted)
	var pool := count + ceili(count * 0.6) + 2
	var cap := pool * 2 + 8
	var seen := {}
	var queue: Array = [cy * w + cx]
	seen[queue[0]] = true
	var head := 0
	while head < queue.size() and queue.size() < cap:
		var i: int = queue[head]
		head += 1
		var ix := i % w
		var iy := i / w
		if ix > 0 and map.walkable(ix - 1, iy) and not seen.has(i - 1):
			seen[i - 1] = true
			queue.append(i - 1)
		if ix < w - 1 and map.walkable(ix + 1, iy) and not seen.has(i + 1):
			seen[i + 1] = true
			queue.append(i + 1)
		if iy > 0 and map.walkable(ix, iy - 1) and not seen.has(i - w):
			seen[i - w] = true
			queue.append(i - w)
		if iy < h - 1 and map.walkable(ix, iy + 1) and not seen.has(i + w):
			seen[i + w] = true
			queue.append(i + w)
	var nearer := func(a: int, b: int) -> bool:
		var da := Vector2(a % w + 0.5, a / w + 0.5).distance_squared_to(at)
		var db := Vector2(b % w + 0.5, b / w + 0.5).distance_squared_to(at)
		return da < db or (da == db and a < b)
	queue.sort_custom(nearer)
	if queue.size() > pool:
		queue.resize(pool)
	# (the nearest tile kept, then a throw of the dice among the others)
	var rest := queue.slice(1)
	rest.shuffle()
	var chosen: Array = [queue[0]]
	chosen.append_array(rest.slice(0, count - 1))
	chosen.sort_custom(nearer)
	for c in chosen:
		out.append(Vector2(int(c) % w + 0.5, int(c) / w + 0.5))
	return out


# --- where what he sends out is, moment by moment (art/fleshmancer_action_fx.ts; game/fm_action.ts) ---

static func smooth(u: float) -> float:
	var k := clampf(u, 0.0, 1.0)
	return k * k * (3.0 - 2.0 * k)


## Where his shards are `t` seconds into them (shardsAt, shardsNow), each fan by its own aim (radians on the floor; the
## second's NAN until it is drawn up). Each: {x, y: tiles from where he stood; z: picture pixels up; a: its way; state:
## "rising", "hanging", "flying" or "burst"; k: how far through that; fan; i: its number, by which it strikes once}.
static func shards_now(t: float, aim0: float, aim1: float) -> Array:
	var out: Array = []
	var hr: float = SHARDS["hang_r"]
	var high: float = SHARDS["hang_z"]
	var end: float = SHARDS["reach"]
	for fan in 2:
		var aim := aim0 if fan == 0 else aim1
		if is_nan(aim):
			continue
		var n: int = SHARDS["fan"][fan]
		var d0: float = SHARD_DRAW[fan][0]
		var d1: float = SHARD_DRAW[fan][1]
		var hit: float = SHARD_HITS[fan]
		var i: int = 0 if fan == 0 else SHARDS["fan"][0]
		for j in n:
			var off := j - (n - 1) / 2.0
			var a: float = aim + off * SHARDS["apart"] * PI / 180.0
			var ux := cos(a)
			var uy := sin(a)
			# (each drawn up a little after the one beside it, from the middle out)
			var rise := (t - d0 - absf(off) * 0.012) / (d1 - d0 - 0.06)
			if rise <= 0.0:
				continue
			if t < hit:
				# (up out of the floor where it will hang, turning from upright to its way)
				var k := smooth(rise)
				var z := high * (1.0 - (1.0 - k) * (1.0 - k))
				out.append({"x": ux * hr, "y": uy * hr, "z": z, "a": a, "state": "rising" if rise < 1.0 else "hanging", "k": k, "fan": fan, "i": i})
				i += 1
				continue
			var d: float = hr + SHARDS["speed"] * (t - hit)
			if d < end:
				var z := high - (high - 10.0) * clampf((d - hr) / 3.0, 0.0, 1.0)
				out.append({"x": ux * d, "y": uy * d, "z": z, "a": a, "state": "flying", "k": (d - hr) / (end - hr), "fan": fan, "i": i})
				i += 1
			else:
				var tb: float = t - hit - (end - hr) / SHARDS["speed"]
				if tb < SHARDS["burst"]:
					out.append({"x": ux * end, "y": uy * end, "z": 10.0, "a": a, "state": "burst", "k": tb / SHARDS["burst"], "fan": fan, "i": i})
					i += 1
	return out


## When a ring's hands burst up, seconds into his rings (ringBurst).
static func ring_burst(i: int) -> float:
	var slam: float = RING_HITS[0] if i in RINGS["first"] else RING_HITS[1]
	return slam + floorf(i / 2.0) * RINGS["ripple"]


static var _rings := {}


## A ring's hands (ringHands): {n: how many places round it; step: radians from one to the next; gaps: its two gaps' middles;
## hands: where each hand is, radians round from the way he faced, those in its gaps left out}.
static func ring_hands(i: int) -> Dictionary:
	if _rings.has(i):
		return _rings[i]
	var r: float = RINGS["radii"][i]
	var n := roundi(TAU * r / RINGS["apart"])
	var g0 := fmod(i * RINGS["turn"] + 0.6, TAU)
	var gaps := [g0, g0 + PI]
	var step := TAU / n
	var hands: Array = []
	for j in n:
		var a := j * step
		if not in_gap(a, gaps, step, 0.0):
			hands.append(a)
	var out := {"n": n, "step": step, "gaps": gaps, "hands": hands}
	_rings[i] = out
	return out


## Is a place `a` radians round a ring in one of its gaps (each three hands wide; `more` a little wider, for its crack)?
static func in_gap(a: float, gaps: Array, step: float, more: float) -> bool:
	for g in gaps:
		if absf(fmod(a - float(g) + PI * 3.0, TAU) - PI) < RINGS["gapHands"] * step / 2.0 + more:
			return true
	return false


## Whether a hero at `rel` (tiles from where he stood) is struck by ring `i` as it bursts up: within reach of one of its
## hands (ringStrikes). `aim`: the way he faced as he began, radians on the floor.
static func ring_strikes(i: int, rel: Vector2, aim: float) -> bool:
	var r: float = RINGS["radii"][i]
	for a in ring_hands(i)["hands"]:
		if rel.distance_to(Vector2(cos(aim + a), sin(aim + a)) * r) <= RINGS["r"]:
			return true
	return false


## Which way the stream pours `t` seconds into his fire, or a mini fleshmancer's: radians to his left of the way he faces;
## NAN while it does not pour (fireWay, miniWay).
static func fire_way(t: float, mini: bool) -> float:
	var hit := MINI_HIT if mini else FIRE_HIT
	var stop := MINI_STOP if mini else FIRE_STOP
	var whip: Dictionary = MINI_WHIP if mini else WHIP
	if t < hit - 1e-6 or t > stop + 1e-6:
		return NAN
	var k := clampf((t - hit) / (stop - hit), 0.0, 1.0)
	return whip["from"] + whip["round"] * (1.0 - pow(1.0 - k, whip["ease"]))


static var _lanes := {}


## The lanes his fire leaves burning: the way each burns (radians to his left), and when the stream passed it (fireLanes).
static func fire_lanes(mini: bool) -> Array:
	if _lanes.has(mini):
		return _lanes[mini]
	var hit := MINI_HIT if mini else FIRE_HIT
	var stop := MINI_STOP if mini else FIRE_STOP
	var whip: Dictionary = MINI_WHIP if mini else WHIP
	var size: Dictionary = MINI_FIRE if mini else FIRE
	var out: Array = []
	var n := floori(whip["round"] / size["every"] + 1e-6)
	for k in n + 1:
		var a: float = whip["from"] + k * size["every"]
		# (when it got there: the whip's ease undone)
		var u := 1.0 - pow(1.0 - (a - whip["from"]) / whip["round"], 1.0 / whip["ease"])
		out.append({"a": a, "at": hit + u * (stop - hit)})
	_lanes[mini] = out
	return out


## Whether a hero `fwd` tiles before him and `left` to his left is burned `t` seconds into his fire: in the stream, or in a
## lane burning (fireStrikes).
static func fire_strikes(t: float, fwd: float, left: float, mini: bool) -> bool:
	var size: Dictionary = MINI_FIRE if mini else FIRE
	var d := sqrt(fwd * fwd + left * left)
	if d < size["land"] - 0.2 or d > size["reach"] + 0.3:
		return false
	var b := atan2(left, fwd)
	var now := fire_way(t, mini)
	if not is_nan(now) and _beside_way(b, now, size["half"], d):
		return true
	for l in fire_lanes(mini):
		if t >= l["at"] and t < l["at"] + size["burn"] and _beside_way(b, l["a"], size["laneHalf"], d):
			return true
	return false


## Whether he is in the stream itself now (not only a lane): the stream burns the more (game/fm_action.ts inStream).
static func in_stream(t: float, fwd: float, left: float, mini: bool) -> bool:
	var size: Dictionary = MINI_FIRE if mini else FIRE
	var now := fire_way(t, mini)
	if is_nan(now):
		return false
	var d := sqrt(fwd * fwd + left * left)
	if d < size["land"] - 0.2 or d > size["reach"] + 0.3:
		return false
	return _beside_way(atan2(left, fwd), now, size["half"], d)


## Is the bearing `b`, `d` tiles out, within `half` a tile to either side of the way `a`?
static func _beside_way(b: float, a: float, half: float, d: float) -> bool:
	return absf(fmod(b - a + PI * 3.0, TAU) - PI) <= atan2(half, d)


## How much a bone heap shakes `t` seconds into his summoning, 0 to 1: from his arms flung up to the call (heapShake).
static func heap_shake(t: float) -> float:
	return smooth((t - RAISE_HOLD[0] + 0.2) / 0.4) if t < RAISE_HIT else 0.0


# --- game/facing.ts, for pictures from behind painted as the camera truly sees them ---

## handOf: 1 if his left in his picture is the world's left of the way he faces, -1 if his right is (he is drawn turned over
## when he faces screen-left).
static func hand_of(f: Vector2) -> int:
	return -1 if f.x - f.y < 0.0 else 1


## A point `fwd` tiles before him and `left` tiles to the left he is drawn with (beside).
static func beside(at: Vector2, f: Vector2, hand: int, fwd: float, left: float) -> Vector2:
	return Vector2(at.x + f.x * fwd + f.y * hand * left, at.y + f.y * fwd - f.x * hand * left)


## Where `p` is from him: (tiles before him, tiles to the left he is drawn with) (fromFigure).
static func from_figure(at: Vector2, f: Vector2, hand: int, p: Vector2) -> Vector2:
	var d := p - at
	return Vector2(d.x * f.x + d.y * f.y, (d.x * f.y - d.y * f.x) * hand)
