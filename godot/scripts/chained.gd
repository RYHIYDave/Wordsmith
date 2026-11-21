## THE CHAINED ONE, floor 3's boss, as the game fights him when it starts (game/bosses.ts GAITS.chained, CO2_ACTS, CO2, CHAINED,
## CHAINED_SPIN; BossRules step, forcedAct, pickAct, startAct, coActing, acting, endAct, breakOff, died; his pictures' own
## numbers, art/chained_action.ts and art/chained_action_fx.ts; game/facing.ts handOf, beside, fromFigure; game/boss_calls.ts).
## The owner, 31 Oct 2026: “He needs some work.  I think the action really needs to be applied to his moves”. So his moves are
## the ones DONE THE ACTION WAY (CO_ACTION, on: a big wind-up held, a blow of two frames, bigger areas), on HIS NEW BODY, 1.2
## times as tall (CO_LOOK, put on as the game starts, game/enemy_moves.ts): his lash and his whirl's chains reach 1.2 times as far.
##   HIS SHAMBLE: he stands; he sets off after a hero further than 2.1 + 0.7 tiles (or out of his sight), walks, and halts as
##     the clock of his walk comes round (every 1.0 of it), as near the hero as he likes to stand; his pictures go by the
##     ground he covers (a clock of dt * pace / 1.1), so his feet keep their grip as he grows quicker.
##   HIS ACTS, the biggest ready one he is in reach of (and sees the hero), each at its own clock; he turns to the hero as it
##     begins, and no more until it is over:
##     THE LASH (his basic blow, within 3.2 tiles), a combo: a forehand at 0.87 s and a backhand at 1.73 s, each a strip before
##       him (4.1 and 4.2 tiles long), x0.9; then THE FINISHER at 2.93 s, both fists brought down and a CRACK run out along the
##       floor from 2.4 to 6.4 tiles before him, 0.8 to either side, its lane marked from 2.33 s: struck once as it runs,
##       x1.3, and knocked back; as it ends he stands 1.22 tiles on, where his steps have taken him.
##     THE CHAIN WHIRL (within 2.9 tiles): gathered, his chains' reach marked round him; from 1.15 s to 4.2 s he spins (its two
##       turns played round four times more) and WALKS AFTER THE HERO at 1.7 tiles a second, his chains out 3.53 tiles round
##       him: a blow every 0.3 s at most, x0.55, each knocking the hero back; then his fists go up, a red circle 3.5 round him
##       from 4.2 s, and at 4.8 s THE RING: all within it struck, x1.0, and thrown back.
##     THE HOOK (3 to 7.5 tiles): aimed, flung at 1.63 s to 0.6 past where the hero stood (3.5 to 7.5 tiles), biting at 1.73 s:
##       a hero within 0.6 of it as it flies is caught (x0.5), held (he cannot walk or dodge) and DRAGGED IN with it, a jerk
##       with each haul, to 0.9 before him by 2.47 s; then THE BLOW WAITING: a red circle 1.5 round a point 2 tiles before him
##       from 2.57 s, his fists hammered down there at 3.07 s, x1.2.
##     THE BALL (3.2 to 5.6 tiles; while he has it): the spot 4.5 tiles before him marked 2.5 round from 1.5 s; whipped down
##       at 2.3 s, it lands at 2.47 s: all within it struck, x1.5, and thrown back.
##   HIS CHAINS BREAK as he is hurt: below 0.66 of his life he tears his left chain loose, below 0.33 the ball's (2.3 s each;
##     as it snaps, 0.8 s in, whoever is within 2.3 tiles is struck, x0.5, and thrown back). Each makes him quicker (1.5, then
##     2.2 times his first pace) and changes his figure (chained, chained1, chained2); free of the ball he has none to throw.
##   He calls out his big moves ("Mine! MINE!", "Round... round... ROUND!", "Mmmph... FREE!"), a line at most every 5 seconds.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")

## (GAITS.chained)
const GAIT := {"pace": 1.1, "cycle": 1.0, "setOff": 0.389, "halt": 0.389, "stopAt": 2.1, "slack": 0.7}

## HIS PICTURES' OWN MOMENTS (art/chained_action.ts), seconds: the art counts them on the game's frames, 30 a second.
## (LASH_HITS, LASH_LONG)
const LASH_HITS := [26.0 / 30.0, 52.0 / 30.0, 88.0 / 30.0]
const LASH_LONG := 108.0 / 30.0
## (WHIRL_SPIN, WHIRL_HIT, WHIRL_LONG; WHIRL_LOOP, the stretch of his spin played round and round: two turns, 720 degrees at
## WHIRL_RATE 1440 a second, from frame 47; `extra`: CO2.whirl.loops, 4, more times round)
const WHIRL_SPIN := 1.0
const WHIRL_HIT := 84.0 / 30.0
const WHIRL_LONG := 102.0 / 30.0
const WHIRL_LOOP := {"at": 47.0 / 30.0, "span": 0.5, "extra": 2.0}
## (HOOK_LET, HOOK_BITE, HOOK_PULLS, HOOK_BACK, HOOK_BLOW, HOOK_LONG)
const HOOK_LET := 49.0 / 30.0
const HOOK_BITE := 52.0 / 30.0
const HOOK_PULLS := [[58.0 / 30.0, 63.0 / 30.0], [68.0 / 30.0, 74.0 / 30.0]]
const HOOK_BACK := 74.0 / 30.0
const HOOK_BLOW := 92.0 / 30.0
const HOOK_LONG := 111.0 / 30.0
## (BALL_LET, BALL_LAND, BALL_HAUL, BALL_BACK: 3.26 and as much later as its hauling comes, BALL_HAUL - 2.26; BALL_LONG: 0.85
## more; BALL_REACH; BALL_PULLS)
const BALL_LET := 69.0 / 30.0
const BALL_LAND := 74.0 / 30.0
const BALL_HAUL := 79.0 / 30.0
const BALL_BACK := 3.26 + (79.0 / 30.0 - 2.26)
const BALL_LONG := 3.26 + (79.0 / 30.0 - 2.26) + 0.85
const BALL_REACH := 4.5
const BALL_PULLS := [[BALL_HAUL, BALL_HAUL + 0.18], [BALL_HAUL + 0.38, BALL_HAUL + 0.56], [BALL_HAUL + 0.56, BALL_HAUL + 0.76], [BALL_HAUL + 0.76, BALL_BACK - 0.02]]

## (CO2_ACTS: `first`, seconds from waking before it may first be used; `after`, the wait after it before his next act; `near`
## and `far`, the hero's distance at which it is used; the two that break his chains are not chosen: the rules bring them)
const ACTS := [
	{"id": "lash", "clip": "attack", "long": LASH_LONG, "hit": 26.0 / 30.0, "dmg": 0.9, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 3.2},
	{"id": "whirl", "clip": "whirl", "long": WHIRL_LONG + 2.0, "hit": 1.15, "dmg": 0.55, "cooldown": 10.0, "first": 5.0, "after": 0.6, "near": 0.0, "far": 2.9},
	{"id": "hook", "clip": "hook", "long": HOOK_LONG, "hit": HOOK_LET, "dmg": 0.5, "cooldown": 8.0, "first": 2.5, "after": 0.15, "near": 3.0, "far": 7.5},
	{"id": "ball", "clip": "ball", "long": BALL_LONG, "hit": BALL_LET, "dmg": 1.5, "cooldown": 12.0, "first": 7.0, "after": 0.6, "near": 3.2, "far": 5.6},
	{"id": "breakL", "clip": "breakL", "long": 2.3, "hit": 0.8, "dmg": 0.5, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 0.0, "forced": true},
	{"id": "breakBall", "clip": "breakBall", "long": 2.3, "hit": 0.8, "dmg": 0.5, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 0.0, "forced": true},
]
## (CHAINED_LOOK's LOOK_K: how many times as tall his new body is, and so how much further he reaches)
const LOOK_K := 1.2
## (CO2.lash, with his new body: each blow's reach 1.2 times the approved 3.42 and 3.51, and its strip from his right to his
## left; CO2.crackDmg, CO2.crackWarn; CO2.travel: LASH_TRAVEL, 40 of his lengths, 1.2 times as far, 39.191835884530846 to a tile)
const LASH := [{"reach": 3.42 * 1.2, "from": -0.6, "to": 0.6}, {"reach": 3.51 * 1.2, "from": -1.4, "to": 0.6}]
const CRACK_DMG := 1.3
const CRACK_WARN := 70.0 / 30.0
const TRAVEL := 1.2247448713915892
## (CO2.whirl, its reach 1.2 times the approved 2.94; CHAINED_SPIN.chase)
const WHIRL := {"from": 1.15, "to": 2.2, "reach": 2.94 * 1.2, "gap": 0.3, "warn": 2.2, "ringDmg": 1.0, "chase": 1.7}
## (CO2.hook; startAct: it is flung `past` beyond the hero, no less than `least`, no more than CHAINED.hook.most)
const HOOK := {"r": 0.6, "ahead": 2.0, "warn": 77.0 / 30.0, "blowDmg": 1.2, "least": 3.5, "most": 7.5, "past": 0.6}
## (CO2.ball)
const BALL := {"warn": 1.5}
## (CHAINED.breakAt, faster, snap)
const BREAK_AT := [0.66, 0.33]
const FASTER := [1.0, 1.5, 2.2]
const SNAP := {"at": 0.8, "r": 2.3}
## (art/chained_action_fx.ts RING: a slam's ring goes out to its edge over `wave`, breaks up over `fade` more, its cracks gone
## by `long`; how far round the whirl's, the ball's and the blow waiting's strike. CRACK: along the way he faced, from where
## he stood: it splits the floor from `from` to `to`, `half` to either side, run out in `run`, gone by `long`)
const RING := {"wave": 0.2, "fade": 0.25, "long": 1.6, "whirl": 3.5, "ball": 2.5, "hammer": 1.5}
const CRACK := {"from": 2.4, "to": 6.4, "half": 0.8, "run": 0.15, "long": 1.8}
## THE HOOK'S WAY AND THE BALL'S (art/chained_action.ts actHookPath, actBallPath: their ends are worked out there from his bones
## as he lets go, and copied here): where each leaves his hands (tiles before him, to his left, its height in game pixels) and
## where each lies when it has been hauled back (tiles before him, to his left); the ball's height on the floor (half of 7.6).
const HOOK_FROM := [2.0580412968841117, -0.6924561622522483, 39.647385813788645]
const HOOK_HOME := [0.08101875722075302, -0.4196772324814032]
const BALL_FROM := [1.326806944007555, 0.0, 43.0]
const BALL_HOME := [0.918558653543692, 0.7654655446197433]
const BALL_HIGH := 3.8
## (render/bossfx.ts ground: his hook's line of aim runs out from 0.9 s; his chains' reach is marked round him from 0.3 s)
const AIM_FROM := 0.9
const GATHER_FROM := 0.3
## About where his right cuff is, and the ring of his collar (tiles before him, to his left, game pixels up): where the chain
## to his hook, and to his ball, is drawn from. Stand-ins: the game takes them from his bones at every frame (actCuffAt,
## actCollarAt), which are not here.
const CUFF := [0.5, -0.3, 40.0]
const COLLAR := [0.15, 0.0, 46.0]
## (game/boss_calls.ts BOSS_CALL_LINES.chained, BOSS_CALLS.gap, sayFor)
const CALLS := {"hook": "Mine! MINE!", "whirl": "Round... round... ROUND!", "ball": "Mmmph... FREE!"}
const CALL_GAP := 5.0
const SAY_FOR := 1.8
## (game.ts knockHero: HEAVY.knock tiles a step; TUNE.heroRadius; defs.ts MSG.foe; the colour of "Hooked")
const HEAVY_KNOCK := 0.6
const HERO_R := 0.3
const FOE := Color("#ff8a3a")
const HOOKED := Color("#ff8a80")

var mode := "stand"
var gt := 0.0
var cds: Array = []
## The act he is making: {i, t, hand, a, b, x, y}; null: none. `a`: how far his hook is flung, or when his whirl last struck;
## `b`: the lash's crack has struck (1), or the hook has caught the hero (1) and let him go (2); (x, y): where the ball will
## land, or his fists.
var act = null
## How free he is (Monster.form): 0 in all his chains, 1 his left chain broken, 2 the ball's too.
var form := 0
var _clock := 0.0
var _last_call := -1000.0
## (his hook or his ball is out across the room, and drawn there: perils.gd co_flung)
var _out := false
## (the sheets of the figure he will be next, read one at a time while he fights so that the game does not stop to read them
## as a chain breaks: render.ts keeps the next one ready the same way, `wanted`)
var _to_read: Array = []
var _kept: Array = []
var _read_in := 0.0


## A step of him, awake (monster.gd step hands him here).
func step(m, dt: float, hero) -> void:
	_clock += dt
	if cds.is_empty():
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
		_want(m, "chained1")
	# (FRENZIED, on him, hurrying him, and Withering slowing him: game.ts updateMonsters, `m.cd -= mdt * rage * wither`; bosses.ts step, his acts' waits by `rage`, his pace by it)
	for k in cds.size():
		cds[k] -= dt * m.frenzy()
	_read_ahead(dt)
	# (put to sleep in the middle of a move, as the hero fell, and woken again: the move is broken off)
	if act != null and m.state != "act":
		_break_off(m, hero)
	if act != null:
		_step_act(m, dt, hero)
		return
	m._cd -= dt * m.rage()
	m.state = "chase"
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
	# (a chain to break comes before whatever else he would do, and waits for nothing)
	var want := _forced(m)
	if want < 0 and m._cd <= 0.0 and hero.alive:
		want = _pick(dist, los)
	var moving := mode == "setOff" or mode == "walk" or mode == "halt"
	var go: bool = hero.alive and want < 0 and (dist > GAIT["stopAt"] + GAIT["slack"] or (not los and dist > 1.2))
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


## forcedAct: the act the rules bring, whatever else he would do: he tears his left chain loose when his life falls below 0.66
## of it, the ball's below 0.33. -1: none.
func _forced(m) -> int:
	if form < 2 and m.life / m.max_life < BREAK_AT[form]:
		return 4 if form == 0 else 5
	return -1


## pickAct: the biggest ready act he is in reach of; -1, none (he comes on, or waits).
func _pick(dist: float, los: bool) -> int:
	for i in range(ACTS.size() - 1, -1, -1):
		var a: Dictionary = ACTS[i]
		if a.get("forced", false) or cds[i] > 0.0:
			continue
		if dist < a["near"] or dist > a["far"]:
			continue
		# (free of the ball, he has none to throw)
		if a["id"] == "ball" and form >= 2:
			continue
		if not los:
			continue
		return i
	return -1


## startAct: turned to the hero, and from here on turned no more until it is over.
func _start(m, i: int, hero) -> void:
	var a: Dictionary = ACTS[i]
	var to: Vector2 = hero.world - m.world
	var dist := to.length()
	if dist > 0.01:
		m.face = to / dist
	m.state = "act"
	act = {"i": i, "t": 0.0, "hand": hand_of(m.face), "a": 0.0, "b": 0, "x": hero.world.x, "y": hero.world.y}
	m._set_list(a["clip"], true)
	m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
	match a["id"]:
		"hook":
			# (how far it is flung: a little past where he stands)
			act["a"] = maxf(HOOK["least"], minf(HOOK["most"], dist + HOOK["past"]))
		"ball":
			# (where it will come down)
			var p := beside(m.world, m.face, act["hand"], BALL_REACH, 0.0)
			act["x"] = p.x
			act["y"] = p.y
		"breakL":
			m.mgr.sfx.play("boss_roar", linear_to_db(0.9))
			_tell(m, "%s tears a chain loose" % m.title)
		"breakBall":
			m.mgr.sfx.play("boss_roar", linear_to_db(0.9))
			_tell(m, "%s tears free of the ball" % m.title)
	if CALLS.has(a["id"]) and _clock - _last_call >= CALL_GAP:
		_last_call = _clock
		m.call_line(CALLS[a["id"]], SAY_FOR)


func _step_act(m, dt: float, hero) -> void:
	var a: Dictionary = ACTS[act["i"]]
	var t0: float = act["t"]
	act["t"] = minf(a["long"], t0 + dt)
	var t1: float = act["t"]
	# (his pictures go by the act's own clock: his whirl's two turns played round and round)
	m._anim_t = act_clock(a, t1)
	match a["id"]:
		"lash":
			_lash(m, a, t0, t1, hero)
		"whirl":
			_whirl(m, a, t0, t1, dt, hero)
		"hook":
			_hook(m, a, t0, t1, hero)
		"ball":
			_ball(m, a, t0, t1, hero)
		_:
			_snap(m, a, t0, t1, hero)
	if t1 >= a["long"]:
		_end(m, a)


## THE LASH: the forehand and the backhand, each a strip before him; then the finisher's crack, run out along its lane.
func _lash(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	var hand: int = act["hand"]
	for i in 2:
		if not _at(t0, t1, LASH_HITS[i]):
			continue
		var l: Dictionary = LASH[i]
		var r := from_figure(m.world, m.face, hand, hero.world)
		if r.x > -0.2 and r.x <= l["reach"] and r.y >= l["from"] - HERO_R and r.y <= l["to"] + HERO_R:
			_blow(m, hero, a["dmg"])
		hero.kick(2.0)
		m.mgr.sfx.play("slam", linear_to_db(0.5))
	# (the finisher's lane marked as his fists go up; the crack struck once as it runs out along it)
	var f: float = LASH_HITS[2]
	if _at(t0, t1, CRACK_WARN):
		m.mgr.perils.co_crack(m, m.world, m.face, f - CRACK_WARN)
	if _at(t0, t1, f):
		hero.kick(5.0)
		m.mgr.sfx.play("slam")
	if t1 >= f and t0 < f + CRACK["run"] + 0.05 and (int(act["b"]) & 1) == 0:
		var r := from_figure(m.world, m.face, hand, hero.world)
		if crack_strikes(r.x, r.y, t1 - f):
			act["b"] = int(act["b"]) | 1
			_blow(m, hero, CRACK_DMG)
			_knock(m.world, hero, 0.8)


## THE CHAIN WHIRL: he comes on after the hero as he spins, his chains out round him; then the ring, slammed out round him.
func _whirl(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	var from := act_time(WHIRL["from"])
	var to := act_time(WHIRL["to"])
	var d: Vector2 = hero.world - m.world
	var dist := d.length()
	# (as he gathers them, how far his chains will reach is marked round him)
	if _at(t0, t1, GATHER_FROM):
		m.mgr.perils.co_reach(m, m.world.x, m.world.y, WHIRL["reach"], WHIRL_SPIN - GATHER_FROM)
	if _at(t0, t1, from):
		m.mgr.sfx.play("swing")
	if t1 > from and t0 < to:
		if dist > 0.9:
			_carry(m, d / dist * minf(dist - 0.9, WHIRL["chase"] * dt))
		# (a blow at most in each `gap`)
		if dist <= WHIRL["reach"] + HERO_R * 0.5 and t1 - float(act["a"]) >= WHIRL["gap"]:
			act["a"] = t1
			_blow(m, hero, a["dmg"])
			_knock(m.world, hero, 0.6)
	# (the ring: its red circle marked as his fists go up)
	var hit := act_time(WHIRL_HIT)
	var warn := act_time(WHIRL["warn"])
	if _at(t0, t1, warn):
		m.mgr.perils.mark(m.world.x, m.world.y, RING["whirl"], maxf(0.05, hit - warn), m)
	if _at(t0, t1, hit):
		if ring_strikes(hero.world - m.world, RING["whirl"] + HERO_R * 0.5):
			_blow(m, hero, WHIRL["ringDmg"])
			_knock(m.world, hero, 1.0)
		m.mgr.perils.co_ring(m.world.x, m.world.y, RING["whirl"])
		hero.kick(5.0)
		m.mgr.sfx.play("slam")


## THE HOOK: flung, it catches a hero it passes (or bites the floor); he is dragged in with it; then the blow waiting.
func _hook(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	var hand: int = act["hand"]
	var reach: float = act["a"]
	# (as he aims it, the line it will fly along runs out over the floor)
	if _at(t0, t1, AIM_FROM):
		var left: float = HOOK_FROM[1] * LOOK_K
		m.mgr.perils.co_aim(m, beside(m.world, m.face, hand, 0.6, left), beside(m.world, m.face, hand, reach, left * 0.3), HOOK_LET - AIM_FROM)
	if _at(t0, t1, HOOK_LET):
		m.mgr.sfx.play("swing", linear_to_db(0.7))
	if t1 > HOOK_LET and int(act["b"]) == 0 and t0 < HOOK_BITE + 0.06:
		# (looked for every 0.012 s of its flight; a hero in the air of his lunge is not caught)
		var steps := maxi(1, ceili((t1 - t0) / 0.012))
		for s in range(1, steps + 1):
			var p = hook_path(minf(HOOK_BITE, t0 + (t1 - t0) * s / steps), reach)
			if p == null:
				continue
			var w := beside(m.world, m.face, hand, p[0], p[1])
			if hero.alive and hero.world.distance_to(w) <= HOOK["r"] and hero._invuln <= 0.0 and hero._act != "lunge":
				act["b"] = 1
				_blow(m, hero, a["dmg"])
				hero.held = HOOK_BACK - t1 + 0.05
				_word(m, hero.world, "Hooked", HOOKED)
				m.mgr.sfx.play("hit", linear_to_db(0.8))
				break
		if _at(t0, t1, HOOK_BITE) and int(act["b"]) == 0:
			m.mgr.sfx.play("slam", linear_to_db(0.4))
	if int(act["b"]) == 1:
		# (dragged in with it, hand over hand, no nearer than 0.9 before him)
		var p = hook_path(t1, reach)
		if p != null and hero.alive:
			_drag(m, hero, beside(m.world, m.face, hand, maxf(p[0], 0.9), p[1]))
			hero.held = maxf(hero.held, 0.05)
		else:
			act["b"] = 2
			hero.held = 0.0
	# (THE BLOW WAITING: his fists hammered down before him where the hero lies)
	if _at(t0, t1, HOOK["warn"]):
		var c := beside(m.world, m.face, hand, HOOK["ahead"], 0.0)
		act["x"] = c.x
		act["y"] = c.y
		m.mgr.perils.mark(c.x, c.y, RING["hammer"], maxf(0.05, HOOK_BLOW - HOOK["warn"]), m)
	if _at(t0, t1, HOOK_BLOW):
		var spot := Vector2(act["x"], act["y"])
		if ring_strikes(hero.world - spot, RING["hammer"] + HERO_R * 0.5):
			_blow(m, hero, HOOK["blowDmg"])
		m.mgr.perils.co_ring(spot.x, spot.y, RING["hammer"])
		hero.kick(4.0)
		m.mgr.sfx.play("slam", linear_to_db(0.9))
	# (the hook out across the room and its chain, drawn where the game draws them)
	var seen = seen_hook(t1, reach)
	if seen == null:
		_take_in(m)
		return
	_out = true
	m.mgr.perils.co_flung(m, "hook", beside(m.world, m.face, hand, seen[0], seen[1]), seen[2], seen[3] > 0.0,
		beside(m.world, m.face, hand, CUFF[0], CUFF[1]), CUFF[2], beside(m.world, m.face, hand, reach, HOOK_FROM[1] * LOOK_K * 0.3), 0.0)


## THE BALL: where it will land marked from the first; whipped down; it lands, and its ring goes out.
func _ball(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	var spot := Vector2(act["x"], act["y"])
	if _at(t0, t1, BALL["warn"]):
		m.mgr.perils.mark(spot.x, spot.y, RING["ball"], maxf(0.05, BALL_LAND - BALL["warn"]), m)
	if _at(t0, t1, BALL_LET):
		m.mgr.sfx.play("swing")
	if _at(t0, t1, BALL_LAND):
		if ring_strikes(hero.world - spot, RING["ball"] + HERO_R * 0.5):
			_blow(m, hero, a["dmg"])
			_knock(spot, hero, 1.0)
		m.mgr.perils.co_ring(spot.x, spot.y, RING["ball"])
		hero.kick(6.0)
		m.mgr.sfx.play("slam")
	# (the ball out across the room and its chain, drawn where the game draws them)
	var seen = seen_ball(t1)
	if seen == null:
		_take_in(m)
		return
	_out = true
	var hand: int = act["hand"]
	m.mgr.perils.co_flung(m, "ball", beside(m.world, m.face, hand, seen[0], seen[1]), seen[2], seen[3] > 0.0,
		beside(m.world, m.face, hand, COLLAR[0], COLLAR[1]), COLLAR[2], spot, clampf((t1 - BALL_LET) / (BALL_LAND - BALL_LET), 0.0, 1.0))


## A CHAIN BREAKS: as it snaps, whoever is near him is struck and thrown back; what is left of it lies where he stood.
func _snap(m, a: Dictionary, t0: float, t1: float, hero) -> void:
	if not _at(t0, t1, SNAP["at"]):
		return
	if hero.world.distance_to(m.world) <= SNAP["r"]:
		_blow(m, hero, a["dmg"])
		_knock(m.world, hero, 1.0)
	m.mgr.perils.blast(m.world.x, m.world.y, SNAP["r"])
	hero.kick(5.0)
	m.mgr.sfx.play("explode", linear_to_db(0.8))
	m.mgr.perils.co_left(m.world, m.face, act["hand"], 0 if a["id"] == "breakL" else 1)


## endAct: the lash ends where his steps have taken him; free of one more chain he is quicker, and seen so.
func _end(m, a: Dictionary) -> void:
	var i: int = act["i"]
	if a["id"] == "lash":
		var p := beside(m.world, m.face, act["hand"], TRAVEL, 0.0)
		if m.mgr.map.walkable(floori(p.x), floori(p.y)):
			m.world = p
	_take_in(m)
	m.state = "chase"
	act = null
	_to("stand")
	m._cd = float(a["after"]) * randf_range(0.9, 1.15)
	if a["cooldown"] > 0.0:
		cds[i] = a["cooldown"]
	if a["id"] == "breakL" or a["id"] == "breakBall":
		form += 1
		m.speed *= FASTER[form] / FASTER[form - 1]
		_become(m, "chained1" if form == 1 else "chained2")
	m._set_list("idle", true)


## breakOff: his act is broken off; a hero he had hooked is let go.
func _break_off(m, hero) -> void:
	act = null
	_to("stand")
	_take_in(m)
	hero.held = 0.0


## As he falls (BossRules died): a hero he had hooked is let go.
func died(m) -> void:
	if m.mgr.hero != null:
		m.mgr.hero.held = 0.0


## What a blow of his own does to the hero, `mult` times his blow.
func _blow(m, hero, mult: float) -> void:
	if hero.alive:
		# (with his words: bosses.ts blow, hurtHero(roll, monsterElement(m), m.words, m))
		m.harm_hero(hero, m._roll() * mult)


## game.ts knockHero: a blow from `from` knocks the hero back `share` steps (walls stop him).
func _knock(from: Vector2, hero, share: float) -> void:
	var way: Vector2 = hero.world - from
	hero.knock(way.normalized() if way.length() >= 0.01 else -hero.face, HEAVY_KNOCK * share)


## game.ts slide, for him: the step along x kept if his body (no bigger than 0.42 round) is clear there, then the step along y.
func _carry(m, step: Vector2) -> void:
	var rr := minf(m.r, 0.42)
	if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
		m.world.x += step.x
	if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
		m.world.y += step.y


## game.ts slide, for the hero he drags: to `to` in one step, along x if his body is clear there, then along y. (The hero has
## taken his own step of this frame already: he is put on the screen where he now is, so that he is seen on the hook, not
## a frame behind it.)
func _drag(m, hero, to: Vector2) -> void:
	var step: Vector2 = to - hero.world
	if step.x != 0.0 and _hero_fits(m, hero.world.x + step.x, hero.world.y):
		hero.world.x += step.x
	if step.y != 0.0 and _hero_fits(m, hero.world.x, hero.world.y + step.y):
		hero.world.y += step.y
	hero.position = Iso.to_screen(hero.world.x, hero.world.y)


func _hero_fits(m, x: float, y: float) -> bool:
	for ty in range(floori(y - HERO_R), floori(y + HERO_R) + 1):
		for tx in range(floori(x - HERO_R), floori(x + HERO_R) + 1):
			if not m.mgr.map.walkable(tx, ty):
				return false
	return true


## His hook or his ball is back in his hands: no longer drawn out across the room.
func _take_in(m) -> void:
	if _out:
		_out = false
		m.mgr.perils.drop(m, ["co_flung"])


## A line of the game's (game.ts msg, in the colour of a foe's doings).
func _tell(m, text: String) -> void:
	if m.mgr.loot != null:
		m.mgr.loot.say(text, FOE)


## A word that comes up over a place on the floor (game.ts emit 'text').
func _word(m, at: Vector2, text: String, color: Color) -> void:
	var w := Word.new()
	w.text = text
	w.color = color
	w.position = Iso.to_screen(at.x, at.y)
	m.mgr.stands.add_child(w)


# --- his figure, as free as he is ---

## He is seen as `figure` from now on (art/bestiary.ts figureOf: chained, chained1 with his left chain gone, chained2 free of
## the ball too), as monsters.gd load_floor gives a monster its figure; and the one after it is read ahead.
func _become(m, figure: String) -> void:
	var mgr = m.mgr
	if not mgr._figures.has(figure):
		mgr._figures[figure] = BakedFigure.new(mgr._figures_dir, figure, mgr._info)
	m.art = mgr._figures[figure]
	_to_read.clear()
	_kept.clear()
	if figure == "chained1":
		_want(m, "chained2")


## The sheets of `figure` (<figure>-0.png, -1.png ...: baked_figure.gd) are to be read ahead.
func _want(m, figure: String) -> void:
	if m.mgr._figures.has(figure):
		return
	var i := 0
	while ResourceLoader.exists("%s/%s-%d.png" % [m.mgr._figures_dir, figure, i]):
		_to_read.append("%s/%s-%d.png" % [m.mgr._figures_dir, figure, i])
		i += 1


## One of them read every quarter of a second, and kept until he is that figure.
func _read_ahead(dt: float) -> void:
	if _to_read.is_empty():
		return
	_read_in -= dt
	if _read_in <= 0.0:
		_read_in = 0.25
		_kept.append(load(_to_read.pop_front()))


# --- his pictures' own sums (art/chained_action.ts, art/chained_action_fx.ts, art/chained_look.ts; game/bosses.ts) ---

static func _at(t0: float, t1: float, at: float) -> bool:
	return t0 < at and t1 >= at


## actClock: where in its pictures an act `t` seconds in is: the whirl's stretch played round and round, then on to its end.
static func act_clock(a: Dictionary, t: float) -> float:
	var l: Dictionary = WHIRL_LOOP
	var at: float = l["at"]
	var span: float = l["span"]
	var extra: float = l["extra"]
	if a["id"] != "whirl" or t < at + span:
		return t
	if t < at + span + extra:
		return at + fmod(t - at, span)
	return t - extra


## actTimeOf: a moment of the whirl's pictures as the act's own clock has it (its stretch played round).
static func act_time(at: float) -> float:
	var l: Dictionary = WHIRL_LOOP
	return at + float(l["extra"]) if at >= float(l["at"]) + float(l["span"]) else at


static func smooth(u: float) -> float:
	var k := clampf(u, 0.0, 1.0)
	return k * k * (3.0 - 2.0 * k)


## hauledBy: how far along its way back a thing he hauls in is: a jerk with each of his pulls.
static func hauled_by(t: float, pulls: Array) -> float:
	var done := 0.0
	for p in pulls:
		if t >= p[1]:
			done += 1.0
		elif t > p[0]:
			done += smooth((t - p[0]) / (p[1] - p[0]))
	return done / pulls.size()


## actHookPath: where his hook is `t` seconds into its move, flung `reach` tiles: [tiles before him, to his left, its height
## in game pixels, 1 flying or 0 hauled along the floor]; null while it is in his hand. It flies straight from his hand to
## where it bites; then it is hauled back to where it falls at his feet. (This is the hook the rules catch and drag by.)
static func hook_path(t: float, reach: float):
	if t < HOOK_LET or t >= HOOK_BACK:
		return null
	var x0: float = HOOK_FROM[0]
	var y0: float = HOOK_FROM[1]
	var z0: float = HOOK_FROM[2]
	var y1 := y0 * 0.3
	if t < HOOK_BITE:
		var k := (t - HOOK_LET) / (HOOK_BITE - HOOK_LET)
		return [x0 + (reach - x0) * k, y0 + (y1 - y0) * k, z0 + (1.0 - z0) * k + 6.0 * sin(PI * k), 1.0]
	var j := hauled_by(t, HOOK_PULLS)
	return [reach + (float(HOOK_HOME[0]) - reach) * j, y1 + (float(HOOK_HOME[1]) - y1) * j, 1.0, 0.0]


## actBallPath: where his ball is `t` seconds into its move, the same way: whipped down from over his head to crash BALL_REACH
## before him, dropping faster as it goes; it lies there; then it is hauled back along the floor to before him.
static func ball_path(t: float):
	if t < BALL_LET or t >= BALL_BACK:
		return null
	var x0: float = BALL_FROM[0]
	var y0: float = BALL_FROM[1]
	var z0: float = BALL_FROM[2]
	if t < BALL_LAND:
		var k := (t - BALL_LET) / (BALL_LAND - BALL_LET)
		return [x0 + (BALL_REACH - x0) * k, y0 - y0 * k, z0 + (BALL_HIGH - z0) * (0.4 * k + 0.6 * k * k) + 8.0 * sin(PI * k), 1.0]
	var j := hauled_by(t, BALL_PULLS)
	return [BALL_REACH + (float(BALL_HOME[0]) - BALL_REACH) * j, float(BALL_HOME[1]) * j, BALL_HIGH, 0.0]


## lookHookPath: the hook as the game DRAWS it on his new body: let go from his hand 1.2 times as far out, along the same way,
## and hauled back to his feet where they now are.
static func seen_hook(t: float, reach: float):
	var old = hook_path(t, reach)
	if old == null:
		return null
	if old[3] > 0.0:
		var k := clampf((t - HOOK_LET) / (HOOK_BITE - HOOK_LET), 0.0, 1.0)
		var x0: float = HOOK_FROM[0] * LOOK_K
		var y0: float = HOOK_FROM[1] * LOOK_K
		var z0: float = HOOK_FROM[2] * LOOK_K
		return [x0 + (reach - x0) * k, y0 + (y0 * 0.3 - y0) * k, z0 + (1.0 - z0) * k + 6.0 * sin(PI * k), 1.0]
	var home_x: float = HOOK_HOME[0]
	var home_y: float = HOOK_HOME[1]
	var span := reach - home_x
	var j := clampf((reach - float(old[0])) / span, 0.0, 1.0) if span > 1e-6 else 1.0
	return [reach + (home_x * LOOK_K - reach) * j, float(old[1]) + (home_y * LOOK_K - home_y) * j, 1.0, 0.0]


## lookBallPath: the ball as the game draws it on his new body, the same way; 1.2 times as big, so as much higher off the floor.
static func seen_ball(t: float):
	var old = ball_path(t)
	if old == null:
		return null
	var high := BALL_HIGH * LOOK_K
	if old[3] > 0.0:
		var k := clampf((t - BALL_LET) / (BALL_LAND - BALL_LET), 0.0, 1.0)
		var x0: float = BALL_FROM[0] * LOOK_K
		var y0: float = BALL_FROM[1] * LOOK_K
		var z0: float = BALL_FROM[2] * LOOK_K
		return [x0 + (BALL_REACH - x0) * k, y0 - y0 * k, z0 + (high - z0) * (0.4 * k + 0.6 * k * k) + 8.0 * sin(PI * k), 1.0]
	var home_x: float = BALL_HOME[0]
	var j := clampf((BALL_REACH - float(old[0])) / (BALL_REACH - home_x), 0.0, 1.0)
	return [BALL_REACH + (home_x * LOOK_K - BALL_REACH) * j, float(old[1]) * (1.0 + (LOOK_K - 1.0) * j), high, 0.0]


## crackReach: how far out the crack has run, `t` seconds after the finisher's blow (tiles from where he stood).
static func crack_reach(t: float) -> float:
	var from: float = CRACK["from"]
	if t < 0.0:
		return from
	var k := 1.0 - clampf(t / float(CRACK["run"]), 0.0, 1.0)
	return from + (float(CRACK["to"]) - from) * (1.0 - k * k)


## crackStrikes: whether a hero `along` tiles before where he stood and `across` to its side is struck by the crack at `t`.
static func crack_strikes(along: float, across: float, t: float) -> bool:
	return along >= 0.5 and along <= crack_reach(t) and absf(across) <= float(CRACK["half"])


## ringReach: how far out a ring of `radius` has gone, `t` seconds after its blow (tiles).
static func ring_reach(t: float, radius: float) -> float:
	if t < 0.0:
		return 0.0
	var k := 1.0 - clampf(t / float(RING["wave"]), 0.0, 1.0)
	return radius * (1.0 - k * k * k)


## ringStrikes: whether a hero `d` from a ring's middle is struck by it.
static func ring_strikes(d: Vector2, radius: float) -> bool:
	return d.length() <= radius


## game/facing.ts handOf, for pictures from behind painted as the camera truly sees them: 1 if his left in his picture is the
## world's left of the way he faces, -1 if his right is (he is drawn turned over when he faces screen-left).
static func hand_of(f: Vector2) -> int:
	return -1 if f.x - f.y < 0.0 else 1


## A point `fwd` tiles before him and `left` tiles to the left he is drawn with (beside).
static func beside(at: Vector2, f: Vector2, hand: int, fwd: float, left: float) -> Vector2:
	return Vector2(at.x + f.x * fwd + f.y * hand * left, at.y + f.y * fwd - f.x * hand * left)


## Where `p` is from him: (tiles before him, tiles to the left he is drawn with) (fromFigure).
static func from_figure(at: Vector2, f: Vector2, hand: int, p: Vector2) -> Vector2:
	var d := p - at
	return Vector2(d.x * f.x + d.y * f.y, (d.x * f.y - d.y * f.x) * hand)


## A word come up over the floor and gone (render/fx.ts float: from 34 game pixels up, rising 60 a second for 0.15 s and 16 a
## second after, gone at 0.8 s; the game's small letters), over everyone.
class Word extends Node2D:
	const PF := preload("res://scripts/pixel_font.gd")

	var text := ""
	var color := Color.WHITE
	var _t := 0.0

	func _ready() -> void:
		z_index = 60

	func _process(dt: float) -> void:
		_t += dt
		if _t > 0.8:
			queue_free()
		queue_redraw()

	func _draw() -> void:
		var up := 34.0 + 60.0 * minf(_t, 0.15) + 16.0 * maxf(0.0, _t - 0.15)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		PF.draw(self, text, 0, -up, color, {"align": "center", "font": "small", "shadow": Color("#120d18")})
