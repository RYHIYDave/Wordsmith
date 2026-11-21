## THE OSSUARY AMALGAMATION, floor 4's boss, as the game fights it (game/bosses.ts GAITS.amalgam, AM2_ACTS, AM2, AMALGAM; BossRules
## step, forcedAct, pickAct, startAct, amActing, acting 'burst', endAct, stepAmPeril, the 'arm' peril, died; art/amalgam_action.ts,
## art/amalgam_action_fx.ts, art/amalgam_mites.ts; game/facing.ts; game/boss_calls.ts): its moves "done the action way" (AM_ACTION),
## as they are when the game starts. The owner, 31 Oct 2026: “Let’s make the change plus add the action to all his moves cause he
## is not intimidating at all”. So before each big move it rears up to its full height, holds, and crashes down.
##   ITS CRAWL: it stands; it sets off after a hero further than 1.9 + 0.6 tiles (or out of its sight), crawls at 0.8 tiles a
##     second, and stops where its crawl comes round to its first frame, as near the hero as it likes to stand.
##   ITS ACTS, the biggest ready one the hero is in reach of, each at its own clock:
##     THE GRASPING FAN (its basic blow; his pick, 2 Nov 2026: “Grasping fan (Recommended)”; a hero caught, “Just a hit
##       (Recommended)”): a dozen arms of the dead shot out across the floor before it in a wide fan, each one's line marked on
##       the floor from 0.1 s; as they land (1.07 s) a hero within 0.6 of a line, from 1 tile out to its reach (about 4.75), is
##       struck. Not dragged.
##     THE BONE RAIN: reared, roaring; all four arms slammed down (1.47 s): the ossuary's walls shed their skulls over the whole
##       floor round it (8.5 tiles each way), in three waves 0.6 s apart. Each skull's shadow is on the floor a second, then it
##       bursts where it lands, striking a hero within 0.9 for 0.45 of its blow; and a BONE MITE pulls itself together there.
##     THE FLOOR ARMS: slammed down flat (1.33 s); eight holes of arms of the dead burst up, the first under the hero, the others
##       round where he stood (1.4 to 3.2 tiles off), a gap left the way away from it; each 0.5 to 1.1 s after the slam, its
##       crack glowing half a second before; a hero within 0.9 of one as it comes up is struck for 0.75 of its blow.
##     DEVOUR, its biggest: its cone marked on the floor from 0.5 s; from its rake (1.27 s) to its bite (2.2 s) whoever is in the
##       cone is dragged to its maw at 3.6 tiles a second, a bone beast of its own too; the bite strikes within 1.3 of its maw
##       for 1.8 of its blow, and any beast dragged in is eaten back (5% of its life each).
##     A BONE BEAST BURSTS OUT of it, behind its right flank, each time its life falls below 80%, 60%, 40%, 20% (unless four
##       already live). When it falls, its beasts fall apart with it.
##   It calls out its big moves ("Fly, brothers.", "All our hands.", "Be one of us.", "We break. We mend."), a line at most every
##   5 seconds.
## Its two small kinds fight by rules of their own, below: THE BONE MITES (class Mite) and THE BONE BEASTS (class Beast).
extends RefCounted

const BakedFigure := preload("res://scripts/baked_figure.gd")

## (bosses.ts GAITS.amalgam: the pace its crawl is painted for and its loop, setting off, stopping; how near the hero it stops, and
## how much further off he must be before it sets off again)
const GAIT := {"pace": 0.8, "cycle": 0.8, "setOff": 0.7, "halt": 0.5, "stopAt": 1.9, "slack": 0.6}
## (bosses.ts AM2_ACTS, in their own order; their lengths and blows the pictures' own, art/amalgam_action.ts: FAN_LONG 78 frames,
## FAN_HIT 32, FAN.reach; RAIN_LONG 90, RAIN_HIT 44; ARMS_LONG 84, ARMS_HIT 40; DEVOUR_LONG 96, DEVOUR_HITS[0] 38; 30 frames a
## second. In the game the fan and the rain are 'am:fan' and 'am:rain'. `forced`: not chosen, the rules bring it)
const ACTS := [
	{"id": "fan", "clip": "attack", "long": 78.0 / 30.0, "hit": 32.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 4.75},
	{"id": "rain", "clip": "rain", "long": 90.0 / 30.0, "hit": 44.0 / 30.0, "dmg": 0.45, "cooldown": 10.0, "first": 3.0, "after": 0.6, "near": 0.0, "far": 11.0},
	{"id": "floorArms", "clip": "floorArms", "long": 84.0 / 30.0, "hit": 40.0 / 30.0, "dmg": 0.75, "cooldown": 9.0, "first": 5.0, "after": 0.6, "near": 0.0, "far": 11.0},
	{"id": "devour", "clip": "devour", "long": 96.0 / 30.0, "hit": 38.0 / 30.0, "dmg": 1.8, "cooldown": 12.0, "first": 8.0, "after": 0.8, "near": 0.0, "far": 4.2},
	{"id": "burst", "clip": "burst", "long": 1.5, "hit": 0.6, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 0.0, "forced": true},
]
const BURST_I := 4
## THE GRASPING FAN (art/amalgam_action.ts FAN): `n` arms from `from` to `to` degrees (its right to its left), each reaching
## `reach` tiles from its middle, `vary` more or less; a hero within `r` of an arm's line, from `near` tiles out, is struck as
## they land; the lines marked from `mark` s, run out to their full length over `grow` s (render/act1_fx/amalgam.ts).
const FAN := {"n": 12, "from": -60.0, "to": 60.0, "reach": 4.75, "vary": 0.45, "near": 1.0, "r": 0.6, "mark": 0.1, "grow": 0.35}
## WHERE ITS WEIGHT LANDS (art/amalgam_action_fx.ts SLAM_RING): a ring round the middle of where its front hands come down,
## `ahead` tiles before it: the bone rain's, the floor arms'. It goes out to its edge over `wave`, breaks up over `fade` more,
## and its cracks are gone by `long` (art/chained_action_fx.ts RING). Drawn only: what strikes is the skulls and the arms.
const SLAM_RING := {"ahead": 1.71, "rain": 3.2, "arms": 2.8, "long": 1.6, "wave": 0.2, "fade": 0.25}
## THE BONE RAIN (art/amalgam_action_fx.ts RAIN; seconds from the slam, tiles): three waves, the first wave's skulls leaving
## their niches `first` after the slam, each wave `gap` after the one before (each skull up to `ripple` later); `fly` from its
## niche to the floor, its shadow there all that while; the skulls on a lattice of triangles `spacing` apart, each wave every
## third point of it; a hero within `r` of where one lands is struck; none nearer the wall than `edge`, nor nearer its middle
## than `clear`; a bone mite pulls itself together `mite_at` after it lands; its scuff lies `scuff`; it falls from `high` game
## pixels. `rx`, `ry`: the floor it rains over, an ellipse round it (bosses.ts AM2.rain).
const RAIN := {"first": 0.15, "gap": 0.6, "ripple": 0.12, "fly": 1.0, "spacing": 2.1, "r": 0.9, "edge": 0.9, "clear": 1.8,
	"mite_at": 0.05, "scuff": 1.2, "high": 150.0, "rx": 8.5, "ry": 8.5}
## THE FLOOR ARMS (art/amalgam_action_fx.ts ARMS; seconds from the slam, tiles): `n` holes, the first under the hero, the others
## round where he stood between `near` and `far`, no two nearer than `apart`, none within `gap` degrees of the way away from it
## (bosses.ts AM2.armGap); each bursting up `first` to `last` after the slam; a hero within `r` of one `up` after it begins is
## struck. The arms are up `time` (BIG_ARM_TIME) and their crack fades over `after` (bosses.ts AMALGAM.arms.after); the crack
## glows `warn` before (art/boss_shots.ts ARM_CRACK_WARN, as the game draws it).
const ARMS := {"n": 8, "near": 1.4, "far": 3.2, "apart": 1.3, "gap": 35.0, "first": 0.5, "last": 1.1, "up": 0.12, "r": 0.9,
	"time": 1.3, "after": 0.8, "warn": 0.5}
## DEVOUR (bosses.ts AM2.devour): its cone, from `near` tiles before it (`narrow` to either side) out to `reach` (`wide` to
## either side) and `end` on to its point, marked from `warn`; from its `rake` to its `bite` (DEVOUR_HITS, frames 38 and 66) what
## is in the cone is dragged to its maw, `maw` tiles before it, at `pull` tiles a second; the bite strikes within `r` of its maw.
## A bone beast eaten gives it back `heal` of its life (AMALGAM.devour.heal).
const DEVOUR := {"warn": 0.5, "near": 1.0, "reach": 4.2, "end": 0.25, "narrow": 0.7, "wide": 2.0, "maw": 1.15, "pull": 3.6, "r": 1.3,
	"rake": 38.0 / 30.0, "bite": 66.0 / 30.0, "heal": 0.05}
## A BONE BEAST BURSTS OUT (bosses.ts AMALGAM.burstAt, burst): each time its life falls below one of these shares, where its
## picture throws it (tiles before it and to its left: behind its right flank), going that way, unless `most` already live.
const BURST_AT := [0.8, 0.6, 0.4, 0.2]
const BURST := {"spot": [-1.174, -1.378], "way": [-0.789, -0.614], "most": 4, "room": 0.36}
## (game/boss_calls.ts BOSS_CALL_LINES.amalgam, BOSS_CALLS: what it calls out as it begins each, a line at most every `gap` s)
const CALLS := {"rain": "Fly, brothers.", "floorArms": "All our hands.", "devour": "Be one of us.", "burst": "We break. We mend."}
const CALL_GAP := 5.0
const SAY_FOR := 1.8
const HERO_R := 0.3

## ITS TWO SMALL KINDS (game/defs.ts MONSTERS.mite, MONSTERS.beast: floor 1's numbers), and how monsters grow with the floor
## (defs.ts DEPTH_SCALE: life and blows this share more for every floor below the first; experience a quarter more, game.ts spawn).
const MITE_DEF := {"kind": "mite", "name": "Bone Mite", "life": 1, "dmgMin": 2, "dmgMax": 4, "speed": 3.2, "radius": 0.2, "range": 0.87,
	"windup": 14.0 / 30.0, "cooldown": 0.8, "xp": 0, "ranged": false, "projSpeed": 0, "keepMax": 0, "element": "phys", "aoe": 0}
const BEAST_DEF := {"kind": "beast", "name": "Bone Beast", "life": 24, "dmgMin": 7, "dmgMax": 11, "speed": 2.6, "radius": 0.36, "range": 1.0,
	"windup": 0.62, "cooldown": 1.5, "xp": 4, "ranged": false, "projSpeed": 0, "keepMax": 0, "element": "phys", "aoe": 0}
const DEPTH_SCALE := {"life": 0.35, "dmg": 0.22, "xp": 0.25}
## (art/amalgam_mites.ts MITE: a mite takes `form` s to pull itself together, and left alone crumbles `life` s after it began)
const MITE := {"form": 0.5, "life": 10.0}

var mode := "stand"
var gt := 0.0
var cds: Array = []
## The act it is making: {i, t, hand}; null: none.
var act = null
## (bosses.ts Monster.phase: how many of its beasts have burst out, or were not made because four lived)
var phase := 0
var _clock := 0.0
var _last_call := -1000.0


## A step of it, awake (monster.gd step hands it here).
func step(m, dt: float, hero) -> void:
	_clock += dt
	if cds.is_empty():
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
		# (its mites' and its beasts' pictures brought in now, not in the middle of the fight)
		for def in [MITE_DEF, BEAST_DEF]:
			figure_of(m.mgr, def["kind"])
	# (FRENZIED, on him, hurrying him, and Withering slowing him: game.ts updateMonsters, `m.cd -= mdt * rage * wither`; bosses.ts step, his acts' waits by `rage`, his pace by it)
	for k in cds.size():
		cds[k] -= dt * m.frenzy()
	# (put back to sleep in the middle of an act, as when the hero falls: the act is broken off)
	if act != null and m.state != "act":
		act = null
		_to("stand")
	if act != null:
		_step_act(m, dt, hero)
		return
	m._cd -= dt * m.rage()
	m.state = "chase"
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	# (bosses.ts step: it sees a hero within 16 tiles of it on a clear line)
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	var forced := _forced(m)
	var want := forced
	if forced < 0 and m._cd <= 0.0 and hero.alive:
		want = _pick(dist, los)
	if mode == "stand":
		# (standing, it turns to him; an act that is due is begun; else it sets off after a hero who is further off than it likes,
		# or out of its sight and more than 1.2 tiles away)
		m._set_list("idle")
		gt += dt
		if dist > 0.01:
			m.face = to / dist
		if want >= 0:
			_start(m, want, hero)
		elif hero.alive and (dist > GAIT["stopAt"] + GAIT["slack"] or (not los and dist > 1.2)):
			_to("setOff")
		return
	Kit.carry(self, GAIT, m, dt, to, dist, los, want >= 0)


func _to(next: String) -> void:
	mode = next
	gt = 0.0


## forcedAct: a bone beast bursts out of it as its life falls below the next of its shares; -1, none.
func _forced(m) -> int:
	if phase >= BURST_AT.size() or m.life / m.max_life >= BURST_AT[phase]:
		return -1
	# (as many as may live are out: that one is not made)
	if beasts_of(m).size() >= int(BURST["most"]):
		phase += 1
		return -1
	return BURST_I


## pickAct: the biggest ready act the hero is in reach of; -1, none (it comes on, or waits).
func _pick(dist: float, los: bool) -> int:
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if a.get("forced", false) or cds[i] > 0.0:
			continue
		if dist < a["near"] or dist > a["far"]:
			continue
		# (out of the floor, out of the walls, wherever he is: those two need no clear line to him)
		if a["id"] != "floorArms" and a["id"] != "rain" and not los:
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
	act = {"i": i, "t": 0.0, "hand": Kit.hand_of(m.face)}
	m._set_list(a["clip"], true)
	m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
	if a["id"] == "devour":
		m.mgr.sfx.play("boss_roar", -6.0)
	if CALLS.has(a["id"]) and _clock - _last_call >= CALL_GAP:
		_last_call = _clock
		m.say(CALLS[a["id"]], SAY_FOR)


func _step_act(m, dt: float, hero) -> void:
	var a: Dictionary = ACTS[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(a["long"], t0 + dt)
	var t1: float = act["t"]
	# (its pictures go by the act's own clock)
	m._anim_t = t1
	_acting(m, a, t0, t1, dt, hero)
	if t1 >= a["long"]:
		_end(m, a)


## What each act does from t0 to t1 of it (amActing; its bursting, acting 'burst').
func _acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	var at := func(T: float) -> bool: return t0 < T and t1 >= T
	var hand: int = act["hand"]
	var perils = m.mgr.perils
	match a["id"]:
		"fan":
			# (each arm's line marked on the floor, from where its reach begins out to its end)
			if at.call(FAN["mark"]):
				var segs := []
				for line in fan_lines():
					var way := Vector2(cos(line[0]), sin(line[0]))
					segs.append([way * FAN["near"], way * line[1]])
				perils.am_lines(m, hand, segs, a["hit"] - FAN["mark"], FAN["grow"], true)
			if not at.call(a["hit"]):
				return
			# (its dozen arms land across the floor: a hero on an arm's line is struck, and not dragged)
			var rel := Kit.from_figure(m.world, m.face, hand, hero.world)
			if fan_strikes(rel.x, rel.y):
				_blow(m, hero, a["dmg"])
			hero.kick(3.0)
			m.mgr.sfx.play("slam", -3.0)
		"rain":
			if not at.call(a["hit"]):
				return
			var c := Kit.beside(m.world, m.face, hand, SLAM_RING["ahead"], 0.0)
			perils.am_ring(c.x, c.y, SLAM_RING["rain"], SLAM_RING)
			hero.kick(5.0)
			m.mgr.sfx.play("slam")
			m.mgr.sfx.play("boss_roar", -4.0)
			# (the skulls, out of the walls over the floor round it: each its shadow first, then down. One roll for them all)
			var dmg: float = m._roll() * a["dmg"]
			var form := _form_mite.bind(m.mgr, m.get_script(), m.pack_id, m)
			for d in rain_drops():
				var p: Vector2 = m.world + d["at"]
				if Kit.free_at(m.mgr, p.x, p.y, RAIN["edge"]):
					perils.am_drop(p.x, p.y, d["land"], dmg, m.world + d["from"], d["seed"], RAIN, form, m)
		"floorArms":
			if not at.call(a["hit"]):
				return
			var c := Kit.beside(m.world, m.face, hand, SLAM_RING["ahead"], 0.0)
			perils.am_ring(c.x, c.y, SLAM_RING["arms"], SLAM_RING)
			hero.kick(5.0)
			m.mgr.sfx.play("slam")
			# (the first where he stands, the others round him, a gap left the way away from it: the way out. One roll for them all.
			# Sixty tries at placing them, as the game makes: fewer than eight where there is no room)
			var dmg: float = m._roll() * a["dmg"]
			var h: Vector2 = hero.world
			var away := atan2(h.y - m.world.y, h.x - m.world.x)
			var spots: Array[Vector2] = [h]
			var tries := 0
			while spots.size() < int(ARMS["n"]) and tries < 60:
				tries += 1
				var ang := randf_range(0.0, TAU)
				if absf(fposmod(ang - away + 3.0 * PI, TAU) - PI) < deg_to_rad(ARMS["gap"]):
					continue
				var p := h + Vector2(cos(ang), sin(ang)) * randf_range(ARMS["near"], ARMS["far"])
				if not m.mgr.map.open_at(floori(p.x), floori(p.y)):
					continue
				var apart := true
				for q in spots:
					if q.distance_to(p) < ARMS["apart"]:
						apart = false
				if apart:
					spots.append(p)
			for k in spots.size():
				var hit: float = ARMS["first"] + (ARMS["last"] - ARMS["first"]) * k / maxf(1.0, ARMS["n"] - 1.0)
				perils.am_arm(spots[k].x, spots[k].y, hit, dmg, ARMS, m)
		"devour":
			var maw := Kit.beside(m.world, m.face, hand, DEVOUR["maw"], 0.0)
			# (its cone marked on the floor from its warning to its rake)
			if at.call(DEVOUR["warn"]):
				var pts := [Vector2(DEVOUR["near"], DEVOUR["narrow"]), Vector2(DEVOUR["reach"], DEVOUR["wide"]), Vector2(DEVOUR["reach"] + DEVOUR["end"], 0.0),
					Vector2(DEVOUR["reach"], -DEVOUR["wide"]), Vector2(DEVOUR["near"], -DEVOUR["narrow"])]
				var segs := []
				for j in pts.size():
					segs.append([pts[j], pts[(j + 1) % pts.size()]])
				perils.am_lines(m, hand, segs, DEVOUR["rake"] - DEVOUR["warn"], 0.0, false)
			if t1 > DEVOUR["rake"] and t0 < DEVOUR["bite"]:
				# (raked in: what is in its cone is dragged to its maw, a bone beast of its own too, 0.3 round; not one still bursting
				# out; one that is out of the cone again is let go)
				if hero.alive:
					_pull(m, hero, HERO_R, maw, dt)
				for o in beasts_of(m):
					if o.h2.act == "emerge":
						continue
					if _pull(m, o, 0.3, maw, dt):
						o.h2.drag(o, m)
					elif o.h2.act == "dragged":
						o.h2.break_off(o)
			if at.call(DEVOUR["rake"]):
				hero.kick(2.0)
				m.mgr.sfx.play("swing", -2.0)
			if at.call(DEVOUR["bite"]):
				if hero.alive and hero.world.distance_to(maw) <= DEVOUR["r"]:
					_blow(m, hero, a["dmg"])
				hero.kick(4.0)
				m.mgr.sfx.play("slam", -2.0)
				# (any bone beast it has dragged in to within its bite's reach and half a tile is eaten back: gone, nobody's kill, and
				# it mends; one not near enough is let go)
				for o in m.mgr.list:
					if not is_instance_valid(o) or o.dead or o.kind != "beast" or o.h2.act != "dragged":
						continue
					if o.world.distance_to(maw) <= DEVOUR["r"] + 0.5:
						o.dead = true
						o.state = "dead"
						o.queue_free()
						m.life = minf(m.max_life, m.life + m.max_life * DEVOUR["heal"])
					else:
						o.h2.break_off(o)
		"burst":
			if not at.call(a["hit"]):
				return
			# (where its picture throws it; if there is no room there, the nearest of six places to stand round it that is clear of
			# its own body by 0.3)
			var s := Kit.beside(m.world, m.face, hand, BURST["spot"][0], BURST["spot"][1])
			if not Kit.free_at(m.mgr, s.x, s.y, BURST["room"]):
				for q in spots_round(m.mgr, m.world, 6):
					if q.distance_to(m.world) > m.r + 0.3:
						s = q
						break
			var w := Kit.beside(Vector2.ZERO, m.face, hand, BURST["way"][0], BURST["way"][1])
			var depth: int = m.mgr.map.depth
			var o = new_monster(m.mgr, m.get_script(), BEAST_DEF, s, w.normalized(), m.pack_id,
				roundf(BEAST_DEF["life"] * (1.0 + DEPTH_SCALE["life"] * (depth - 1))), roundi(BEAST_DEF["xp"] * (1.0 + DEPTH_SCALE["xp"] * (depth - 1))))
			o.h2.begin(o, "emerge")
			put(m.mgr, o)
			hero.kick(3.0)
			m.mgr.sfx.play("explode", -6.0)


## endAct: it stands as its pictures leave it, and waits its moment; a beast burst out is counted.
func _end(m, a: Dictionary) -> void:
	var i: int = act["i"]
	m.state = "chase"
	act = null
	_to("stand")
	m._cd = float(a["after"]) * randf_range(0.9, 1.15)
	if a["cooldown"] > 0.0:
		cds[i] = a["cooldown"]
	if a["id"] == "burst":
		phase += 1
	m._set_list("idle", true)


## As it falls (bosses.ts died): its bone beasts fall apart with it. (Its mites crumble by themselves, within a second: Mite.)
func died(m) -> void:
	for o in beasts_of(m):
		o.hurt(1e9)


func _blow(m, hero, mult: float) -> void:
	if hero.alive:
		# (with its words: bosses.ts blow, hurtHero(roll, monsterElement(m), m.words, m))
		m.harm_hero(hero, m._roll() * mult)


## Devour's drag: a body (the hero, a beast) `rad` round that is in its cone is moved a step toward its maw, sliding along walls
## (within a quarter tile of it, it is there). Whether it is in the cone.
func _pull(m, body, rad: float, maw: Vector2, dt: float) -> bool:
	var rel := Kit.from_figure(m.world, m.face, act["hand"], body.world)
	if not in_cone(rel.x, rel.y, rad):
		return false
	var to: Vector2 = maw - body.world
	var d := to.length()
	if d >= 0.25:
		body.world = Kit.slide(m.mgr, body.world, rad, to / d * minf(d, DEVOUR["pull"] * dt))
	return true


## A BONE MITE PULLS ITSELF TOGETHER where a skull of the rain burst (bosses.ts stepAmPeril; perils.gd calls this as the skull's
## bones gather): if there is room for it there. It faces the hero; until it has formed it is only a picture (not to be hit, doing
## nothing); then it is among the monsters: one blow kills it; left alone it crumbles 10 s after it began.
func _form_mite(at: Vector2, mgr, script, pack: int, maker) -> void:
	if not Kit.free_at(mgr, at.x, at.y, MITE_DEF["radius"]):
		return
	var to: Vector2 = mgr.hero.world - at
	var o = new_monster(mgr, script, MITE_DEF, at, to.normalized() if to.length() > 0.0 else Vector2(1, 0), pack, 1.0)
	o.rise(MITE["form"])
	o._set_list("form", true)
	o.h2.maker = maker
	put(mgr, o)
	mgr.used["mite_form"] = mgr.used.get("mite_form", 0) + 1


## The bone beasts of its that live (bosses.ts beasts).
static func beasts_of(m) -> Array:
	var out := []
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o.kind == "beast" and o.pack_id == m.pack_id:
			out.append(o)
	return out


# --- the fan, the rain and the cone, as the art's tables have them ---

static var _fan: Array = []
static var _drops: Array = []


## art/kit.ts hash: a steady number from 0 to 1 for (x, y, k), the same every time (the game's own 32-bit arithmetic).
static func hash01(x: int, y: int, k: int) -> float:
	var h := ((x & 0xFFFFFFFF) * 374761393 + (y & 0xFFFFFFFF) * 668265263 + (k & 0xFFFFFFFF) * 2147483647) & 0xFFFFFFFF
	h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
	return float(h ^ (h >> 16)) / 4294967296.0


## fanLines (art/amalgam_action.ts fanArmWay): each of the fan's arms, [its way (radians to its left of the way it faces), its
## reach (tiles)].
static func fan_lines() -> Array:
	if _fan.is_empty():
		var n: int = FAN["n"]
		for i in n:
			var deg: float = FAN["from"] + (FAN["to"] - FAN["from"]) * i / (n - 1) + (hash01(i, 1, 2201) - 0.5) * 6.0
			_fan.append([deg_to_rad(deg), FAN["reach"] + (hash01(i, 2, 2201) - 0.5) * 2.0 * FAN["vary"]])
	return _fan


## fanStrikes: whether the fan strikes a hero `fwd` tiles before it and `left` to its left as its arms land: within `r` of an
## arm's line, from `near` out to its reach and 0.2.
static func fan_strikes(fwd: float, left: float) -> bool:
	for line in fan_lines():
		var along: float = fwd * cos(line[0]) + left * sin(line[0])
		var across: float = -fwd * sin(line[0]) + left * cos(line[0])
		if along >= FAN["near"] and along <= line[1] + 0.2 and absf(across) <= FAN["r"]:
			return true
	return false


## rainDrops (art/amalgam_action_fx.ts), over the floor the rules give it (bosses.ts AM2.rain) with it at the middle: every
## skull, {at: where it lands, from: its niche on the wall (both tiles from it), land: seconds from the slam, wave, seed}.
static func rain_drops() -> Array:
	if not _drops.is_empty():
		return _drops
	var d: float = RAIN["spacing"]
	var h := d * sqrt(3.0) / 2.0
	var rx: float = RAIN["rx"]
	var ry: float = RAIN["ry"]
	var n := ceili(maxf(rx, ry) / h) + 2
	for j in range(-n, n + 1):
		for i in range(-n, n + 1):
			var x := i * d + j * d * 0.5
			var y := j * h
			var e := sqrt((x / rx) * (x / rx) + (y / ry) * (y / ry))
			var out := sqrt(x * x + y * y)
			# (not in the wall, nor within `edge` of it along its way out from the middle; nor on the Amalgamation itself)
			if e >= 1.0 or (e > 0.3 and (1.0 - e) * out / maxf(e, 1e-6) < RAIN["edge"]):
				continue
			if out < RAIN["clear"]:
				continue
			var wave := posmod(i - j, 3)
			var leave: float = RAIN["first"] + RAIN["gap"] * wave + RAIN["ripple"] * hash01(i + 40, j + 40, 1301)
			var a := atan2(y / ry, x / rx) + (hash01(i + 40, j + 40, 1303) - 0.5) * 0.3
			_drops.append({"at": Vector2(x, y), "from": Vector2(cos(a) * rx, sin(a) * ry), "land": leave + RAIN["fly"], "wave": wave, "seed": _drops.size()})
	return _drops


## inCone: whether a body `r` round, `fwd` tiles before it and `left` to its left, is inside the devour's cone.
static func in_cone(fwd: float, left: float, r: float) -> bool:
	if fwd < DEVOUR["near"] - r or fwd > DEVOUR["reach"] + DEVOUR["end"] + r:
		return false
	var k := clampf((fwd - DEVOUR["near"]) / (DEVOUR["reach"] - DEVOUR["near"]), 0.0, 1.0)
	return absf(left) <= DEVOUR["narrow"] + (DEVOUR["wide"] - DEVOUR["narrow"]) * k + r


# --- the rest ---

## game/nav.ts scatter (game.ts spotsRound): as many as `count` places to stand round `at`, the nearest first: the middles of
## floor tiles walked to from its own tile, the nearest of them and a random pick of the others close by. (Asked only of where
## the Amalgamation stands, which is floor.)
static func spots_round(mgr, at: Vector2, count: int) -> Array:
	var map = mgr.map
	var first := Vector2i(floori(at.x), floori(at.y))
	if not map.walkable(first.x, first.y):
		return []
	var pool := count + ceili(count * 0.6) + 2
	var queue: Array = [first]
	var seen := {first: true}
	var head := 0
	while head < queue.size() and queue.size() < pool * 2 + 8:
		var c: Vector2i = queue[head]
		head += 1
		for side in [Vector2i(-1, 0), Vector2i(1, 0), Vector2i(0, -1), Vector2i(0, 1)]:
			var q: Vector2i = c + side
			if map.walkable(q.x, q.y) and not seen.has(q):
				seen[q] = true
				queue.append(q)
	var nearer := func(a: Vector2i, b: Vector2i) -> bool:
		var da := (Vector2(a) + Vector2(0.5, 0.5)).distance_squared_to(at)
		var db := (Vector2(b) + Vector2(0.5, 0.5)).distance_squared_to(at)
		return da < db if da != db else a.y * map.w + a.x < b.y * map.w + b.x
	queue.sort_custom(nearer)
	queue = queue.slice(0, pool)
	var rest := queue.slice(1)
	rest.shuffle()
	var chosen: Array = [queue[0]] + rest.slice(0, count - 1)
	chosen.sort_custom(nearer)
	var out := []
	for c in chosen:
		out.append(Vector2(c) + Vector2(0.5, 0.5))
	return out


## A monster of its own, made as monsters.gd `summon` makes the Warden's dead (game.ts spawn: its kind's numbers, its blows
## grown with the floor; `life` as the rules give it; `xp` what it is worth, or -1: it leaves nothing). Not yet on the floor: `put`.
static func new_monster(mgr, script, def: Dictionary, at: Vector2, face: Vector2, pack: int, life: float, xp := -1):
	var dm: float = 1.0 + DEPTH_SCALE["dmg"] * (mgr.map.depth - 1)
	var d := {"kind": def["kind"], "name": def["name"], "x": at.x, "y": at.y, "fx": face.x, "fy": face.y, "r": float(def["radius"]),
		"life": life, "maxLife": life, "dmgMin": def["dmgMin"] * dm, "dmgMax": def["dmgMax"] * dm, "speed": float(def["speed"]),
		"packId": pack, "boss": false, "champion": false}
	if xp >= 0:
		d["xp"] = xp
	var o = script.new()
	o.mgr = mgr
	o.setup(d, def, figure_of(mgr, def["kind"]))
	return o


## A kind's baked pictures, as the floor's monsters keep them (monsters.gd), brought in the first time they are wanted.
static func figure_of(mgr, kind: String) -> BakedFigure:
	if not mgr._figures.has(kind):
		mgr._figures[kind] = BakedFigure.new(mgr._figures_dir, kind, mgr._info)
	return mgr._figures[kind]


## It is set on the floor, among the monsters.
static func put(mgr, o) -> void:
	mgr.stands.add_child(o)
	mgr.list.append(o)


## WHAT ITS THREE KINDS SHARE (a class of their own, so that the mite's and the beast's rules below may use them too): how a
## figure that faces a way on the floor is drawn (game/facing.ts), the game's own slide, the gait, and an enemy sound's gap.
class Kit:
	## game/facing.ts handOf, for pictures from behind that are painted turned over (the amalgamation and its beast): 1 if its left in
	## its picture is the world's left of the way it faces, -1 if its right is.
	static func hand_of(f: Vector2) -> int:
		return -1 if (f.x - f.y < 0.0) != (f.x + f.y < -0.2) else 1

	## A point `fwd` tiles before it and `left` tiles to the left it is drawn with (beside).
	static func beside(at: Vector2, f: Vector2, hand: int, fwd: float, left: float) -> Vector2:
		return Vector2(at.x + f.x * fwd + f.y * hand * left, at.y + f.y * fwd - f.x * hand * left)

	## Where `p` is from it: (tiles before it, tiles to the left it is drawn with) (fromFigure).
	static func from_figure(at: Vector2, f: Vector2, hand: int, p: Vector2) -> Vector2:
		var d := p - at
		return Vector2(d.x * f.x + d.y * f.y, (d.x * f.y - d.y * f.x) * hand)

	## game.ts free, on the walk grid: whether a body `r` round fits at (x, y), every tile under it floor to stand on.
	static func free_at(mgr, x: float, y: float, r: float) -> bool:
		for ty in range(floori(y - r), floori(y + r) + 1):
			for tx in range(floori(x - r), floori(x + r) + 1):
				if not mgr.map.walkable(tx, ty):
					return false
		return true

	## game.ts slide: a body moved a step, sliding along walls (the step along x kept if it fits there, then the step along y).
	static func slide(mgr, at: Vector2, r: float, step: Vector2) -> Vector2:
		if step.x != 0.0 and free_at(mgr, at.x + step.x, at.y, r):
			at.x += step.x
		if step.y != 0.0 and free_at(mgr, at.x, at.y + step.y, r):
			at.y += step.y
		return at

	## CARRIED OVER THE FLOOR AT ITS PACE, from the first moment of setting off to the last of stopping (bosses.ts step, its second
	## half), for the one whose rules `ai` keep its `mode` and `gt`: straight at a hero it sees within 2.5 tiles, else down the flow
	## field; its pictures go by the ground it has covered. `stop`: it means to stop where its walk next comes round to its first
	## frame (an act is ready); it stops there too if there is no way on, or stopping would leave it as near him as it likes to stand.
	static func carry(ai, G: Dictionary, m, dt: float, to: Vector2, dist: float, los: bool, stop: bool) -> void:
		# (chilled, slower by the chill's share: bosses.ts step, `slow`; monster.gd slow)
		var sp: float = m.speed * m.slow() * m.rage()
		var v: Vector2 = to / dist if dist < 2.5 and los and dist > 0.01 else m.mgr.flow_dir(m.world)
		if ai.mode != "halt" and v != Vector2.ZERO:
			m.face = v
		var step: Vector2 = m.face * sp * dt
		# (game.ts: a monster walks with a body no bigger than 0.42 round, so that a big one gets through a doorway)
		var rr := minf(m.r, 0.42)
		if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
			m.world.x += step.x
		if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
			m.world.y += step.y
		var before: float = ai.gt
		ai.gt += dt * sp / G["pace"]
		var here: bool = stop or v == Vector2.ZERO or (los and dist - G["pace"] * G["halt"] <= G["stopAt"])
		var next: String = ai.mode
		if ai.mode == "setOff":
			if ai.gt >= G["setOff"]:
				next = "halt" if here else "walk"
		elif ai.mode == "walk":
			if here and floori(ai.gt / G["cycle"]) > floori(before / G["cycle"]):
				next = "halt"
		elif ai.gt >= G["halt"]:
			next = "stand"
		if next != ai.mode:
			ai.mode = next
			ai.gt = 0.0
		if ai.mode == "stand":
			m._set_list("idle")
		else:
			m._set_list(ai.mode)
			m._anim_t = ai.gt

	## (when each enemy sound was last heard, by its name)
	static var _heard := {}

	## An enemy's sound, if it has not been heard within `gap` seconds: so that a swarm's blows are not a din (game.ts enemyRec).
	static func family_sound(mgr, name: String, gap: float, db: float) -> void:
		var now := Time.get_ticks_msec() / 1000.0
		if _heard.has(name) and now - float(_heard[name]) < gap:
			return
		_heard[name] = now
		mgr.sfx.play(name, db)


## A BONE BEAST, a piece of the Amalgamation broken off it: quick, and it bites (bosses.ts GAITS.beast, ACTS.beast; BossRules step,
## startAct, acting 'bite', endAct, drag, breakOff). It bursts out of its maker (`emerge`, a second: it does nothing else), then
## scuttles at the hero at 2.6 tiles a second (its walk painted for 1.5, played faster to match), stops a tile off, and bites: at
## 0.62 s of 1.12, a hero within 1.5 tiles (and a little) who is before it; again after 0.8 s. Dragged in by its maker's devour
## (`dragged`: it does nothing else, going round in its pictures) it is eaten at the bite, or let go. Its voice is the bones'.
class Beast extends RefCounted:
	const GAIT := {"pace": 1.5, "cycle": 0.4, "setOff": 0.3, "halt": 0.3, "stopAt": 1.0, "slack": 0.4}
	## (ACTS.beast: its bite, bursting out, dragged; each its picture, its length, what it waits after)
	const BITE := {"long": 1.12, "hit": 0.62, "dmg": 1.0, "after": 0.8, "far": 1.45, "reach": 1.5}
	const CLIP := {"bite": "attack", "emerge": "emerge", "dragged": "dragged"}
	const LONG := {"bite": 1.12, "emerge": 1.0, "dragged": 1e9}
	const AFTER := {"bite": 0.8, "emerge": 0.2, "dragged": 0.5}

	var mode := "stand"
	var gt := 0.0
	## The act it is making ("": none), how far into it, and the side it is drawn with.
	var act := ""
	var t := 0.0
	var hand := 1

	func step(m, dt: float, hero) -> void:
		# (put back to sleep in the middle of an act: the act is broken off)
		if act != "" and m.state != "act":
			act = ""
			mode = "stand"
			gt = 0.0
		if act != "":
			_step_act(m, dt, hero)
			return
		m._cd -= dt * m.rage()
		m.state = "chase"
		var to: Vector2 = hero.world - m.world
		var dist := to.length()
		var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
		# (pickAct: its bite, when its wait is out and it sees a hero within 1.45 tiles)
		var want: bool = hero.alive and m._cd <= 0.0 and los and dist <= BITE["far"]
		if mode == "stand":
			m._set_list("idle")
			gt += dt
			if dist > 0.01:
				m.face = to / dist
			if want:
				begin(m, "bite", hero)
			elif hero.alive and (dist > GAIT["stopAt"] + GAIT["slack"] or (not los and dist > 1.2)):
				mode = "setOff"
				gt = 0.0
			return
		Kit.carry(self, GAIT, m, dt, to, dist, los, want)

	## startAct: its bite turned to the hero; bursting out and dragged, turned as the rules turn it.
	func begin(m, id: String, hero = null) -> void:
		if hero != null:
			var to: Vector2 = hero.world - m.world
			if to.length() > 0.01:
				m.face = to.normalized()
		m.state = "act"
		act = id
		t = 0.0
		hand = Kit.hand_of(m.face)
		m._set_list(CLIP[id], true)
		Kit.family_sound(m.mgr, "atkBones", 0.25, -4.0)
		if id == "bite":
			m.mgr.used["beast_bite"] = m.mgr.used.get("beast_bite", 0) + 1

	func _step_act(m, dt: float, hero) -> void:
		var t0 := t
		t = minf(LONG[act], t0 + dt)
		if act == "dragged":
			# (dragged, its pictures go round and round)
			m._anim_t = fmod(t, m.art.length("dragged"))
			return
		m._anim_t = t
		if act == "bite" and t0 < BITE["hit"] and t >= BITE["hit"]:
			# (acting 'bite': a hero within 1.5 tiles and half his radius, and not behind it)
			var rel := Kit.from_figure(m.world, m.face, hand, hero.world)
			if hero.alive and hero.world.distance_to(m.world) <= BITE["reach"] + HERO_R * 0.5 and rel.x > -0.2:
				m.harm_hero(hero, m._roll() * BITE["dmg"])
			m.mgr.sfx.play("swing", -10.0)
		if t >= LONG[act]:
			# (endAct: it stands, and waits its moment)
			m._cd = float(AFTER[act]) * randf_range(0.9, 1.15)
			break_off(m)

	## breakOff: its act is over, or broken off: it stands.
	func break_off(m) -> void:
		if act == "":
			return
		m.state = "chase"
		act = ""
		mode = "stand"
		gt = 0.0
		m._set_list("idle", true)

	## drag: it is being dragged in to its maker's maw, its skull turned back toward what drags it; it does nothing else.
	func drag(m, maker) -> void:
		if act == "dragged":
			return
		break_off(m)
		begin(m, "dragged")
		var to: Vector2 = maker.world - m.world
		if to.length() > 0.0:
			m.face = -to.normalized()

	func died(m) -> void:
		m.mgr.sfx.play("bones_death", -4.0)


## A BONE MITE, pulled together out of a skull of the bone rain where it burst: dead in one blow, quick, many; nothing to take
## from it (bosses.ts stepAmPeril; game/defs.ts MONSTERS.mite; game.ts updateMonsters, startWindup, monsterAttack: a monster
## with its one blow). It skitters at the hero at 3.2 tiles a second (straight when it sees him within 2.5 tiles, else down
## the flow field); within 0.75 tiles of him (and his radius) it winds up its bite, 0.47 s; the bite lands if he is still
## within 0.75 + 0.45 (and his radius); it recovers 0.3 s, and bites again after 0.8 s (0.9 to 1.2 times that).
## LEFT ALONE IT CRUMBLES 10 s after it began to form, its death played, nothing gained (the owner's pick, 1 Nov 2026: “They
## crumble after a while”); and once its Amalgamation is dead it crumbles with it, the mites one after another within a second.
## Its voice is the bones'.
class Mite extends RefCounted:
	const RECOVER := 0.3
	## (its Amalgamation: monster.gd; none: any on the floor)
	var maker = null
	## (seconds left before it crumbles, untouched: bosses.ts crumbleT, MITE.life less MITE.form)
	var crumble: float = MITE["life"] - MITE["form"]
	var t := 0.0
	var _begun := false

	func step(m, dt: float, hero) -> void:
		if not _begun:
			# (formed: its first bite no sooner than 0.2 s on)
			_begun = true
			m._cd = 0.2
		if not _maker_lives(m):
			# (game.ts updateMonsters: its Amalgamation dead, it crumbles 0.15 to 0.85 s on, by where it stands)
			crumble = minf(crumble, 0.15 + (absi(floori(m.world.x * 7.0 + m.world.y * 13.0)) % 8) * 0.1)
		crumble -= dt
		if crumble <= 0.0:
			# (it crumbles: its death played; it was nobody's kill)
			m.dead = true
			m.state = "dead"
			m._set_list("die", true)
			m.queue_redraw()
			return
		m._cd -= dt * m.rage()
		var to: Vector2 = hero.world - m.world
		var dist := to.length()
		var def: Dictionary = m.def
		var reach: float = float(def["range"]) + (m.r - 0.32)
		match m.state:
			"windup":
				t -= dt
				if t <= 0.0:
					# (monsterAttack: its bite, if he is still in its reach; it recovers, and waits)
					m.state = "recover"
					t = RECOVER
					m._cd = float(def["cooldown"]) * randf_range(0.9, 1.2)
					Kit.family_sound(m.mgr, "atkBones", 0.25, -4.0)
					m.mgr.sfx.play("swing", -10.0)
					if hero.alive and dist <= reach + 0.45 + HERO_R:
						m.harm_hero(hero, m._roll())
				return
			"recover":
				t -= dt
				if t <= 0.0:
					m.state = "chase"
					m._set_list("idle")
				return
		m.state = "chase"
		if not hero.alive:
			m._set_list("idle")
			return
		# (game.ts updateMonsters: a monster sees a hero within 15 tiles of it on a clear line)
		var los: bool = dist < 15.0 and m.mgr.sees(m.world, hero.world)
		if los and dist <= reach + HERO_R and m._cd <= 0.0:
			# (startWindup: turned to him, its bite begun)
			if dist > 0.01:
				m.face = to / dist
			m.state = "windup"
			t = float(def["windup"])
			m._set_list("attack", true)
			m.mgr.used["mite_bite"] = m.mgr.used.get("mite_bite", 0) + 1
			return
		# (it comes on until it is within four fifths of its reach, and his radius: straight at him, or down the flow field)
		var way := Vector2.ZERO
		if dist > reach * 0.8 + HERO_R:
			way = to / dist if los and dist < 2.5 else m.mgr.flow_dir(m.world)
		if way == Vector2.ZERO:
			m._set_list("idle")
			if dist > 0.01:
				m.face = to / dist
			return
		var step: Vector2 = way * m.speed * m.slow() * m.rage() * dt
		var rr := minf(m.r, 0.42)
		if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
			m.world.x += step.x
		if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
			m.world.y += step.y
		m.face = way
		m._set_list("walk")

	func _maker_lives(m) -> bool:
		if maker != null:
			return is_instance_valid(maker) and not maker.dead
		for o in m.mgr.list:
			if is_instance_valid(o) and o.kind == "amalgam" and not o.dead:
				return true
		return false

	func died(m) -> void:
		m.mgr.sfx.play("bones_death", -4.0)
