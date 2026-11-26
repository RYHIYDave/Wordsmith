## THE BRAWLER, THE VETERAN (game/veteran.ts; game.ts stepVeteran, vetPress, vetStart, vetAimOf, vetAimAt, vetPace, vetPlay,
## vetStrike, vetHit, popUp, comeDown): a fighter of punches and kicks with three globes over him, by the game's rules.
##   HOW A COMBO GOES: each press fills the next globe: a TAP a punch (green), a HOLD a kick (hot orange), a SWIPE the jump (white).
##     Three in and the combo is LOCKED: nothing more goes in until it is played out. Presses go in as fast as they are made and are
##     played in turn, each move whole: its held wind-up, its blow, its wind-down. A tap or a hold made while a swipe's jump has not
##     yet left the floor (or before it has begun) sets that globe in FIRE instead: a tap the flying uppercut, a hold the flying knee
##     after two punches, else the spinning jump kick (as the combo's first, the one that closes in). Every swipe spends the jump: not
##     ready, "No jump". A swipe breaks a locked combo and jumps out at once. R cancels the combo. The combo is over VET_TUNE.gap
##     after its last move with nothing more pressed: the globes go out.
##   WHICH MOVE A PRESS MAKES: a tap the jab first or after the jump, after the jab the cross, after the cross the hook, after a kick
##     the spinning elbow, else the cross; a hold the round kick, after the round kick the push kick.
##   EACH MOVE by the art's own numbers: he is carried as the art carries him (its baked place, frame by frame), faced the nearest of
##     his eight ways to what the press aimed at, his blow going out straight at it; he may walk himself at 0.6 of his pace in its
##     wind-up and wind-down; its force (a cone, a crescent, a round crescent) reaches each in it once as its front comes to them:
##     its share of the hit, then driven back for good, staggered, stunned, or thrown up (the uppercut: up in the air 0.55 s, and
##     stunned 2 s as it comes down). Nothing touches him in his dodging jump while he is off the floor.
## His skill tree and his unique items are not in the port yet.
extends "res://scripts/heroes/kit.gd"

## (assets/heroes/veteran.json: tools/godot_veteran.ts, his moves' numbers and the art's places, as the game has them)
var V := {}
var R := {}
var TUNE := {}
var MOVES := {}
## The globes filled so far in this combo, in order: "punch", "kick", "jump", "punchFire", "kickFire".
var globes: Array = []
## The presses whose globes are filled and whose moves are still to be played: {id, globe, tx, ty, aimed, tid}.
var queue: Array = []
## The move being played: {id, f, x0, y0, fx, fy, ax, ay, carried, hit, globe, tid, wx, wy, props, n}; {} none.
var mv := {}
var done: Array = []
var idle := 0.0
var _tap := false
var _hold := false
var _fire_was := false
var _cast_was := false
var _swipe := {}
var _deny := 0.0
var _plays := 0
## Those his uppercut has thrown up: {m, t}.
var up: Array = []

const PUNCHES := ["jab", "cross", "hook", "elbow", "uppercut", "hammerfist"]
const KICKS := ["roundkick", "push", "spinkick", "spinkickClose", "knee", "flyknee"]
## (THE BRAWLER REMADE, his ideas of 26 Nov 2026: heroes/brawler2.gd, its switch and its numbers; off, he is as he was)
const B2 := preload("res://scripts/heroes/brawler2.gd")
## (the bake's lists: his moves after every other hero's, art/heroes3.ts HERO_PICKS)
const VET_LIST0 := 58
## (game.ts TUNE.heroRadius: hero.gd RADIUS)
const HERO_R := 0.3


## (THE VETERAN'S TREE: Fire Starter, landed from his dodge jump: his next tap or hold comes out in fire)
var fire_ready := false
## (THE BRAWLER REMADE: the punches thrown toward the next punch globe; the punches in a row of this combo, for Knockdown)
var taps_in := 0
var _punches := 0


## THE VETERAN'S TREE (game/talents.ts VETERAN_TREE; game.ts, his moves; veteran.ts VET_TALENTS): `id` his, and its numbers.
func _has(id: String) -> bool:
	return h.has(id)


func _T() -> Dictionary:
	return Talents.D["vetTalents"]


func _init(hero) -> void:
	super(hero, "brawler")
	Talents.ready_up()
	V = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/veteran.json"))
	R = V["rules"]
	TUNE = V["tune"]
	MOVES = V["moves"]
	# (the two flying moves of the Brawler remade in his numbers, their stand-in frames: nothing of his old moves changed)
	B2.alias(V)


## How high off the floor his lowest foot is now, game pixels (veteran_fx.ts liftOf: vetLiftAt of the frame he is in; 0 out of
## a move): the shadow under him shrinks and fades by it (shadows.gd).
func lift_now() -> float:
	if mv.is_empty():
		return 0.0
	var L: Array = MOVES[mv["id"]]["lift"]
	if L.is_empty():
		return 0.0
	return float(L[clampi(floori(float(mv["f"])), 0, L.size() - 1)])


func _sfx(name: String, vol: float) -> void:
	h.sfx.play(name, linear_to_db(vol))


func _shake(amount: float) -> void:
	if h.fx != null and is_instance_valid(h.fx):
		h.fx.kick(amount)


func _full() -> bool:
	return globes.size() >= most()


## (game.ts vetMost) How many globes his combos hold: three; UNIQUE ITEMS, the Fourth Globe: four.
func most() -> int:
	return int(h.uniques.ut["fourth"]["globes"]) if h.uniques != null and h.uniques.wears("fourthglobe") else 3


static func is_punch(id: String) -> bool:
	return PUNCHES.has(id)


static func is_kick(id: String) -> bool:
	return KICKS.has(id)


## (veteran.ts vetMoveFor) The move a press makes, after the moves of the combo so far.
static func move_for(input: String, before: Array) -> String:
	var last = before.back() if not before.is_empty() else null
	match input:
		"swipe":
			return "dodge"
		"swipeTap":
			return "uppercut"
		"swipeHold":
			if before.is_empty():
				return "spinkickClose"
			var two := before.slice(-2)
			return "knee" if two.size() == 2 and is_punch(two[0]) and is_punch(two[1]) else "spinkick"
		"hold":
			return "push" if last == "roundkick" else "roundkick"
	if last == null or last == "dodge":
		return "jab"
	if last == "jab":
		return "cross"
	if last == "cross":
		return "hook"
	if is_kick(last):
		return "elbow"
	return "cross"


static func fire_for(input: String, before: Array) -> String:
	return move_for("swipeTap" if input == "tap" else "swipeHold", before)


## (veteran.ts vetFacing) The nearest of his eight ways to (dx, dy): a unit vector.
static func facing(d: Vector2) -> Vector2:
	var k := posmod(roundi(rad_to_deg(atan2(d.y, d.x)) / 45.0), 8)
	var a := k * PI / 4.0
	return Vector2(cos(a), sin(a))


# =====================================================================================================================
# EACH STEP (game.ts stepVeteran)

func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_deny = maxf(0.0, _deny - dt)
	_tick(dt)
	if not h.alive or h.scene_pace > 0.0:
		return false
	var fire: bool = Input.is_action_pressed("attack") or h.auto_attack
	var cast: bool = Input.is_action_pressed("whirl") or h.auto_whirl
	h.auto_attack = false
	h.auto_whirl = false
	var evade: Vector2 = h.auto_lunge
	h.auto_lunge = Vector2.INF
	if Input.is_action_just_pressed("lunge"):
		evade = h._pointer(way, float(_def(2)["range"]))
	# (THE COMBO CANCELLED: R; the move being played cut short where it is, the rest let go, the globes out; his jump comes down as
	# it was going)
	if (Input.is_action_just_pressed("change") or h.auto_change) and (not globes.is_empty() or not mv.is_empty() or not queue.is_empty()):
		h.auto_change = false
		var jump_on: bool = not mv.is_empty() and mv["id"] == "dodge"
		if not mv.is_empty() and not jump_on:
			mv = {}
		queue = []
		# (his jump goes on as it was going, its globe with it: all emptied, a press in its crouch wrote to a globe no longer there, a
		# script error; the bug hunt's fifth round, 25 Nov 2026)
		globes = ["jump"] if jump_on and not B2.on else []
		if jump_on:
			mv["globe"] = 0
		done = []
		fire_ready = false
		_tap = false
		_hold = false
		_swipe = {}
		_fire_was = fire
		_cast_was = cast
		_sfx("click", 0.5)
	# (a press goes in as it is made; one made while the combo is locked waits, while it is still held, for the combo's end)
	if fire and not _fire_was:
		_tap = true
	elif fire and not _tap and queue.is_empty() and (B2.on or not _full()):
		_tap = true
	if not fire:
		_tap = false
	_fire_was = fire
	if cast and not _cast_was:
		_hold = true
	elif cast and not _hold and queue.is_empty() and (B2.on or not _full()):
		_hold = true
	if not cast:
		_hold = false
	_cast_was = cast
	if evade != Vector2.INF:
		_swipe = {"x": evade.x, "y": evade.y, "t": float(TUNE["swipeWaits"])}
	elif not _swipe.is_empty():
		_swipe["t"] = float(_swipe["t"]) - dt
		if float(_swipe["t"]) <= 0.0:
			_swipe = {}
	if not hooked:
		if not _swipe.is_empty() and _press("swipe", Vector2(_swipe["x"], _swipe["y"])):
			_swipe = {}
		if _tap and _press("tap"):
			_tap = false
		if _hold and _press("hold"):
			_hold = false
	if mv.is_empty() and not queue.is_empty() and not hooked:
		_start()
	if not mv.is_empty():
		_play(dt, way)
		return true
	# (THE BRAWLER REMADE: the combo's string of moves over after the gap, as before; the globes lit kept till KEEP has gone by)
	if B2.on:
		if queue.is_empty():
			idle += dt
			if idle >= float(TUNE["gap"]):
				done = []
				_punches = 0
			if idle >= B2.KEEP:
				globes = []
				taps_in = 0
		return false
	# (not while presses wait their turn, as while a monster holds him: the globes went out with two still to come, and three taps more
	# played five; the bug hunt's fifth round)
	if not globes.is_empty() and queue.is_empty():
		idle += dt
		if idle >= float(TUNE["gap"]):
			globes = []
			done = []
	return false


## (game.ts vetPress) A press of his. Whether it went in.
func _press(kind: String, at := Vector2.ZERO) -> bool:
	var before: Array = done.duplicate()
	if not mv.is_empty():
		before.append(mv["id"])
	for q in queue:
		before.append(q["id"])
	# (THE FIRST LEVELS: not before its level, as every hero's move (kit.gd _use_skill): at level 1 his kick and his jump worked, the HUD
	# hiding them; the bug hunt's sixth round, 25 Nov 2026)
	if not h.move_open(2 if kind == "swipe" else (0 if kind == "tap" else 1)):
		return true
	if B2.on:
		return _press2(kind, at, before)
	if kind == "swipe":
		# (his jump in the air already: not another on top of it)
		if _full() and not mv.is_empty() and mv["id"] == "dodge":
			return false
		if charges[2] < 1:
			if _deny <= 0.0:
				_deny = 0.8
				h.sfx.play("deny")
				h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "No jump", "color": "#8c8090"})
			return true
		# (ABILITIES: MANA: not without the mana for it: game.ts useEvasive, noMana)
		if h.mana < float(h.loadout.r(2)["mana"]):
			h.no_mana()
			return true
		h.mana -= float(h.loadout.r(2)["mana"])
		# (A SWIPE BREAKS A LOCKED COMBO: cut short where it is, the rest let go, and he jumps out at once)
		if _full():
			mv = {}
			queue = []
			globes = []
			done = []
			fire_ready = false
		charges[2] -= 1
		h.uses[2] += 1
		# (THE VETERAN'S TREE: Light on His Feet, his jump comes back a third sooner)
		if cd[2] <= 0.0:
			cd[2] = float(h.loadout.r(2)["cooldown"]) * (float(_T()["lightFeet"]["wait"]) if _has("vlightfeet") else 1.0)
			full[2] = maxf(0.01, cd[2])
		fire_ready = false
		globes.append("jump")
		queue.append({"id": "dodge", "globe": globes.size() - 1, "tx": at.x, "ty": at.y})
		idle = 0.0
		# (UNIQUE ITEMS: Sprung Heels, he can jump again in the air: the jump he is in ends here, and the next begins from it)
		if not mv.is_empty() and mv["id"] == "dodge" and float(mv["f"]) >= float(R["dodge"]["air"][0]) and h.uniques != null and h.uniques.wears("sprungheels"):
			done.append("dodge")
			mv = {}
			h.uniques._say({"id": "sprungheels", "what": "again"})
		return true
	var i := 0 if kind == "tap" else 1
	# (THE VETERAN'S TREE: Fire Starter, landed from a dodge jump, his next tap or hold is in fire already, the jump not spent)
	if fire_ready and not _full():
		fire_ready = false
		globes.append("punchFire" if kind == "tap" else "kickFire")
		var fq := {"id": fire_for(kind, before), "globe": globes.size() - 1}
		fq.merge(_aim_of(kind))
		queue.append(fq)
		idle = 0.0
		return true
	# (set in fire: the swipe's jump waiting its turn, or begun and not yet off the floor)
	var last_q = queue.back() if not queue.is_empty() else null
	var jumping: bool = last_q == null and not mv.is_empty() and mv["id"] == "dodge" and float(mv["f"]) < float(R["dodge"]["air"][0])
	if (last_q != null and last_q["id"] == "dodge") or jumping:
		var g: int = last_q["globe"] if last_q != null else mv["globe"]
		if g < 0 or g >= globes.size():
			return false
		var prior: Array = before.slice(0, before.rfind("dodge"))
		var id := fire_for(kind, prior)
		globes[g] = "punchFire" if kind == "tap" else "kickFire"
		if last_q != null:
			last_q["id"] = id
			last_q.merge(_aim_of(kind), true)
		else:
			# (begun as the dodge's crouch: it is the fire move from its own start, at what he aims at)
			mv = {}
			var q := {"id": id, "globe": g}
			q.merge(_aim_of(kind))
			queue.push_front(q)
			_start()
		idle = 0.0
		return true
	if _full():
		return false
	# (UNIQUE ITEMS: the Last Round, the third globe of every combo sets itself in fire, the jump not spent)
	if globes.size() == 2 and h.uniques != null and h.uniques.wears("lastround"):
		globes.append("punchFire" if kind == "tap" else "kickFire")
		var lq := {"id": fire_for(kind, before), "globe": globes.size() - 1}
		lq.merge(_aim_of(kind))
		queue.append(lq)
		idle = 0.0
		h.uniques._say({"id": "lastround", "what": "fire"})
		return true
	globes.append("punch" if kind == "tap" else "kick")
	var q := {"id": move_for(kind, before), "globe": globes.size() - 1}
	q.merge(_aim_of(kind))
	queue.append(q)
	idle = 0.0
	return true


## THE BRAWLER REMADE (B2 on): a press of his. A swipe breaks off whatever he is doing and spends his jump: with a globe lit he flies
## at the enemy where it points carrying the first (all of them, with The Full Set and every globe lit), else the hop as before; a
## tap or a hold his next punch or kick, waiting its turn (WAITING at most). Whether it went in.
func _press2(kind: String, at: Vector2, before: Array) -> bool:
	if kind == "swipe":
		# (his jump in the air already: not another on top of it; UNIQUE ITEMS: Sprung Heels, he can jump again in the air)
		if not mv.is_empty() and mv["id"] == "dodge":
			var sprung: bool = float(mv["f"]) >= float(R["dodge"]["air"][0]) and h.uniques != null and h.uniques.wears("sprungheels")
			if not sprung:
				return false
		if charges[2] < 1:
			if _deny <= 0.0:
				_deny = 0.8
				h.sfx.play("deny")
				h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "No jump", "color": "#8c8090"})
			return true
		if h.mana < float(h.loadout.r(2)["mana"]):
			h.no_mana()
			return true
		h.mana -= float(h.loadout.r(2)["mana"])
		charges[2] -= 1
		h.uses[2] += 1
		if cd[2] <= 0.0:
			cd[2] = float(h.loadout.r(2)["cooldown"]) * (float(_T()["lightFeet"]["wait"]) if _has("vlightfeet") else 1.0)
			full[2] = maxf(0.01, cd[2])
		fire_ready = false
		if not mv.is_empty() and mv["id"] == "dodge":
			h.uniques._say({"id": "sprungheels", "what": "again"})
		if not mv.is_empty():
			done.append(mv["id"])
		mv = {}
		queue = []
		idle = 0.0
		if globes.is_empty():
			queue.append({"id": "dodge", "globe": -1, "tx": at.x, "ty": at.y})
		else:
			var spend := globes.size() if globes.size() >= most() and _has("vfullset") else 1
			var g: String = globes[0]
			globes = globes.slice(spend)
			var q := {"id": "hammerfist" if g == "punch" else "flyknee", "globe": -1, "leap": true, "set": spend, "tx": at.x, "ty": at.y, "aimed": true}
			var best := INF
			if h.monsters != null:
				for o in h.monsters.list:
					if not is_instance_valid(o) or o.dead or h.monsters.shut_in(o):
						continue
					var d: float = o.world.distance_to(at) - o.r
					if d <= 1.5 and d < best:
						best = d
						q["tid"] = o
			queue.append(q)
		_start()
		return true
	if queue.size() >= B2.WAITING:
		return false
	var q := {"id": move_for(kind, before), "globe": -1}
	q.merge(_aim_of(kind))
	queue.append(q)
	idle = 0.0
	return true


## (game.ts vetAimOf) What a press aims at: the point, and the enemy there if there is one.
func _aim_of(kind: String) -> Dictionary:
	var at := _aim(float(TUNE["retarget"]), kind)
	var out := {"tx": at.x, "ty": at.y, "aimed": true}
	var best := INF
	if h.monsters != null:
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead:
				continue
			var d: float = o.world.distance_to(at) - o.r
			if d <= 0.9 and d < best:
				best = d
				out["tid"] = o
	return out


## (game.ts vetAimAt) Where a move goes as it begins: its enemy where it is now; that one fallen, the nearest in reach and sight;
## else the point aimed at.
func _aim_at(q: Dictionary) -> Vector2:
	var o = q.get("tid")
	if o != null:
		if is_instance_valid(o) and not o.dead:
			return o.world
		var near = null
		var nd: float = TUNE["retarget"]
		if h.monsters != null:
			for m in h.monsters.list:
				if not is_instance_valid(m) or m.dead or m.state == "sleep" or h.monsters.shut_in(m):
					continue
				var d: float = m.world.distance_to(h.world) - m.r
				if d < nd and h.monsters.sees(h.world, m.world):
					near = m
					nd = d
		if near != null:
			return near.world
	return Vector2(q["tx"], q["ty"])


## (game.ts vetStart) The next move of his combo begins: turned to what he aims at (the dodge: springing away the way he swiped).
func _start() -> void:
	var q: Dictionary = queue.pop_front()
	var f: Vector2 = h.face
	var id: String = q["id"]
	if id == "dodge":
		var d: Vector2 = Vector2(q["tx"], q["ty"]) - h.world
		f = facing(-d) if d.length() > 0.3 else facing(f)
	var a := f
	var at := Vector2.ZERO
	if id != "dodge":
		at = _aim_at(q)
		var d: Vector2 = at - h.world
		if d.length() > 0.3:
			f = facing(d)
			a = d / d.length()
		else:
			f = facing(f)
			a = f
	h._turn(f)
	_plays += 1
	# (THE VETERAN'S TREE: Switch Kick, a round kick straight after a punch with half its wind-up: begun half way through it)
	var prev: String = done.back() if not done.is_empty() else ""
	var f0 := 0.0
	if id == "roundkick" and prev != "" and is_punch(prev) and idle < float(TUNE["gap"]) and _has("vswitchkick"):
		f0 = floorf(float(R["roundkick"]["strike"]["from"]) * float(_T()["switchKick"]["skip"]))
	mv = {"id": id, "f": f0, "x0": h.world.x, "y0": h.world.y, "fx": f.x, "fy": f.y, "ax": a.x, "ay": a.y, "carried": Vector2.ZERO, "hit": [], "globe": q["globe"],
		"wx": 0.0, "wy": 0.0, "props": false, "n": _plays, "tid": null}
	# (THE BRAWLER REMADE: a punch thrown toward the next punch globe, the third lighting it (Quick Hands: each); a kick lighting a kick
	# globe; a flying move going as far past its own carry as reaches its enemy, LEAP at most, before its blow)
	if B2.on and id != "dodge":
		if q.get("leap", false):
			mv["leap"] = clampf(at.distance_to(h.world) - float(R[id]["carry"][0]) - 0.8, 0.0, B2.LEAP)
			mv["set"] = int(q.get("set", 1))
		elif is_punch(id):
			_punches += 1
			mv["nth"] = _punches
			taps_in += 1
			if taps_in >= (1 if _has("vquickhands") else B2.NEED):
				taps_in = 0
				if globes.size() < most():
					globes.append("punch")
		elif globes.size() < most():
			globes.append("kick")
	if id != "dodge":
		if h.monsters != null:
			for o in h.monsters.list:
				if is_instance_valid(o) and not o.dead and o.world.distance_to(at) < 0.05:
					mv["tid"] = o
					break
		# (the attack's words: what a use gives him, Swiftness, the frenzy, a shield; and a use of it as every hero's (hero.gd _cast):
		# Flurry, Tailwind, Quickdraw, the High City's and the city's melds that answer a use, the words' flash; his never were)
		var skill := 0 if is_punch(id) else 1
		# (a use as the blow is made, not as it is pressed: three quick punches were one use for Splitting, Precise and every word that
		# answers a use; the bug hunt's fifth round)
		h.uses[skill] += 1
		h._boons(skill)
		h._cast(skill, "vblow", h.world, a)
		h._time_word_sound(skill)
		# (THE LAST WORDS: Surging's shockwave, Mirroring's reflection and its mirrors, as every hero's moves have them (kit.gd _used);
		# his never did)
		var from0: Vector2 = h.world
		h.last.cast(skill, from0, a, 1.0, func(p: Vector2, w: Vector2, fr: float) -> void: _echo_blow(skill, p, w, fr))
	else:
		# (his jump, as every hero's evasive move: its words told, what a use gives him, Surging's surge where it begins: hero.gd lunge)
		h._cast(2, "vjump", h.world, a)
		h._boons(2)
		h._time_word_sound(2)
		h.last.dodge_surge(h.world)


## (the last words' blow made again elsewhere, Mirroring's reflection or a mirror's: a blow's weight on whatever stands within a tile
## of where it lands, that way)
func _echo_blow(i: int, at: Vector2, way: Vector2, frac: float) -> void:
	if h.monsters == null or not is_instance_valid(h.monsters):
		return
	var p: Vector2 = at + way * 0.7
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and o.state != "rise" and not h.monsters.shut_in(o) and o.world.distance_to(p) <= 0.9 + o.r:
			h.hit_monster(o, i, frac, true)


## (game.ts vetPace) How fast his move is played: his attack speed against his weapon's, as any attack of his quickens.
func _pace(id: String) -> float:
	if id == "dodge":
		return 1.0
	var r: Dictionary = h.loadout.r(0 if is_punch(id) else 1)
	var w = look.loot.gear.get("mainhand") if look != null and is_instance_valid(look) and look.loot != null else null
	var wr: float = float(w["aps"]) if w != null and float(w.get("aps", 0.0)) > 0.0 else 1.0
	var k: float = clampf(float(r["rate"]) / maxf(0.3, wr), 0.5, 2.0) * h.attack_pace()
	# (THE BRAWLER REMADE, Heavy Hands: his attack speed makes him no faster, his critical blows harder instead: more_crit)
	if B2.on and _has("vheavyhands"):
		return minf(1.0, k)
	return k


## (THE BRAWLER REMADE, Heavy Hands) What his critical blows of move `i` gain, in % of the hit: HEAVY% for each 1% his attack speed
## would have quickened them (hero.gd hit_monster).
func more_crit(i: int) -> float:
	if not B2.on or not _has("vheavyhands") or i > 1:
		return 0.0
	var r: Dictionary = h.loadout.r(i)
	var w = look.loot.gear.get("mainhand") if look != null and is_instance_valid(look) and look.loot != null else null
	var wr: float = float(w["aps"]) if w != null and float(w.get("aps", 0.0)) > 0.0 else 1.0
	var k: float = clampf(float(r["rate"]) / maxf(0.3, wr), 0.5, 2.0) * h.attack_pace()
	return maxf(0.0, k - 1.0) * 100.0 * B2.HEAVY


## (veteran.ts vetWalkable) Whether he may walk himself `f` frames into move `id`: in its wind-up or its wind-down.
func _walkable(id: String, f: float) -> bool:
	var m: Dictionary = R[id]
	if id == "dodge" or m["strike"] == null or m["force"] == null:
		return false
	if m["air"] != null and f >= float(m["air"][0]) - 1.0 and f <= float(m["air"][1]) + 1.0:
		return false
	var force: Dictionary = m["force"]
	var end: float = float(force.get("from", m["strike"]["at"])) + float(force["long"])
	return f < float(m["strike"]["from"]) or f > end + 1.0


## (veteran.ts vetCarryAt) Where the floor point under him is a frame into a move: the art's own place, between its frames.
func _carry_at(id: String, f: float) -> Vector2:
	var P: Array = MOVES[id]["place"]
	var long: int = R[id]["long"]
	var k := clampf(f, 0.0, long)
	var i := mini(long - 1, floori(k))
	var u := k - i
	var a: Array = P[i]
	var b: Array = P[mini(long, i + 1)]
	return Vector2(float(a[0]) + (float(b[0]) - float(a[0])) * u, float(a[1]) + (float(b[1]) - float(a[1])) * u)


## (game.ts vetPlay) A step of the move being played: he walks himself in its wind-up and wind-down; he is carried as the art
## carries him; his blow lands on each its force comes to; and it ends.
func _play(dt: float, way: Vector2) -> void:
	var id: String = mv["id"]
	var m: Dictionary = R[id]
	var f0: float = mv["f"]
	mv["f"] = f0 + dt * float(V["fps"]) * _pace(id)
	var f: float = mv["f"]
	var want := way.length()
	if want > 0.1 and _walkable(id, f):
		var sp: float = h.walk_pace() * float(TUNE["walk"]) * minf(1.0, want)
		var was: Vector2 = h.world
		h._slide(way / want * sp * dt)
		mv["wx"] = float(mv["wx"]) + h.world.x - was.x
		mv["wy"] = float(mv["wy"]) + h.world.y - was.y
	# (as its blow begins to go out: straight at where its enemy is then, from where he is)
	var S = m["strike"]
	if S != null and f0 < float(S["from"]) and f >= float(S["from"]) and mv["tid"] != null:
		var o = mv["tid"]
		if is_instance_valid(o) and not o.dead:
			var d: Vector2 = o.world - h.world
			if d.length() > 0.3:
				mv["ax"] = d.x / d.length()
				mv["ay"] = d.y / d.length()
	# (carried: the art's step, slid along the floor; walls stop him)
	var c := _carry_at(id, minf(f, float(m["long"])))
	var dc: Vector2 = c - (mv["carried"] as Vector2)
	mv["carried"] = c
	if dc != Vector2.ZERO:
		var fw := Vector2(mv["fx"], mv["fy"])
		var left := Vector2(fw.y, -fw.x)
		h.world = h.map.slide(h.world, HERO_R, fw * dc.x + left * dc.y)
	# (THE BRAWLER REMADE: a flying move's leap past its own carry, over its frames before its blow; walls stop him)
	if float(mv.get("leap", 0.0)) > 0.0 and S != null:
		# (over his flight, take-off to blow, as the art carries him only in the air; the stand-ins', from the move's start)
		var till: float = maxf(1.0, float(S["from"]))
		var a0: float = float(m["air"][0]) if m["air"] != null and float(m["air"][0]) < till - 1.0 else 0.0
		var df: float = clampf(f, a0, till) - clampf(f0, a0, till)
		if df > 0.0:
			var was2: Vector2 = h.world
			h.world = h.map.slide(h.world, HERO_R, Vector2(mv["ax"], mv["ay"]) * float(mv["leap"]) * df / (till - a0))
			mv["wx"] = float(mv["wx"]) + h.world.x - was2.x
			mv["wy"] = float(mv["wy"]) + h.world.y - was2.y
	# (his dodging jump: nothing touches him while he is off the floor)
	# (THE VETERAN'S TREE: Hang Time, nor through any move of his in the air)
	# (UNIQUE ITEMS: Broken Shackles, he can be hit during his dodge: hero.gd move_safe)
	if m["air"] != null and (h.move_safe() if id == "dodge" else _has("vhangtime")) and f >= float(m["air"][0]) and f <= float(m["air"][1]):
		h._invuln = maxf(h._invuln, 0.06)
	if S != null and f >= float(S["at"]):
		_strike(m)
	if f >= float(m["long"]):
		done.append(id)
		mv = {}
		idle = 0.0
		# (THE VETERAN'S TREE: Fire Starter, landed from his dodge jump: his next tap or hold is in fire; the Brawler remade: a punch
		# globe lit)
		if id == "dodge" and _has("vfirestarter"):
			if not B2.on:
				fire_ready = true
			elif globes.size() < most():
				globes.append("punch")
		if id == "dodge":
			_jump_lands()
		# (the combo locked and played out: its globes go out; the Brawler remade, no combo locks: a flying blow his finish)
		if B2.on and B2.FLYING.has(id) and h.uniques != null and h.uniques.wears("winningstreak"):
			h.uniques.uq["streak"] = int(h.uniques.uq.get("streak", 0)) + 1
			h._tell({"t": "unique", "id": "winningstreak", "what": "streak", "x": h.world.x, "y": h.world.y, "mid": h.uniques.uq["streak"]})
			h.uniques._say({"id": "winningstreak", "what": "streak"})
		if not B2.on and _full() and queue.is_empty():
			globes = []
			done = []
			# (UNIQUE ITEMS: the Winning Streak, every combo he finishes makes his next blows hit harder)
			if h.uniques != null and h.uniques.wears("winningstreak"):
				h.uniques.uq["streak"] = int(h.uniques.uq.get("streak", 0)) + 1
				h._tell({"t": "unique", "id": "winningstreak", "what": "streak", "x": h.world.x, "y": h.world.y, "mid": h.uniques.uq["streak"]})
				h.uniques._say({"id": "winningstreak", "what": "streak"})


## HIS JUMP COMES DOWN WITH A BLOW (his pick, 25 Nov 2026, "Land with a blow (Recommended)": it struck nothing, and the words on it did
## nothing): as the Warrior's Lunge lands (hero.gd _fly), all round where he comes down struck at the jump's own weight, as its words
## make it (Twin: a second a moment later, a little wider; "of Echoes": a weaker one after), what the words behind it leave left there,
## and the last words with it.
func _jump_lands() -> void:
	var r2: Dictionary = h.loadout.r(2)
	var at: Vector2 = h.world
	var rad: float = 1.6 * float(r2["size"])
	var each: float = float(r2["count_dmg"])
	_shake(1.5)
	for n in int(r2["count"]):
		if n == 0:
			h._blast(2, at, rad, each, "land", true, -4.0)
		else:
			var kn: int = n
			_after(0.28 * n, func() -> void: h._blast(2, at, rad * 1.15, each, "land", false, -4.0, kn))
	if float(r2["echo"]) > 0.0:
		h._echo_of(2, "vjump", at, h.face, func() -> void: h._blast(2, at, rad, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]), "land", false, -4.0, 0, true))
	if h.last != null:
		h.last.cast(2, at, h.face, 1.0, func(p: Vector2, _w: Vector2, f: float) -> void: h._blast(2, p, rad, float(h.loadout.r(2)["count_dmg"]) * f, "land", false, -4.0, 0, true))


## (veteran.ts vetReach) The frame a blow's force reaches one standing at `p`, radius `r` (from where he stood as it began, along
## the way his blow goes), or -1 if it never does. Its front goes out over `long` frames, fast then slowing.
func _reach(m: Dictionary, o: Vector2, a: Vector2, left: Vector2, p: Vector2, r: float, more := 0.0) -> float:
	var F: Dictionary = m["force"]
	var from: float = float(F.get("from", m["strike"]["at"]))
	var d := p - o
	var dist := d.length()
	var near := maxf(0.0, dist - r - float(TUNE["body"]))
	var reach: float = float(F["reach"]) + more
	if near > reach:
		return -1.0
	if F["shape"] != "round" and F["shape"] != "ring":
		var t := deg_to_rad(float(F.get("dir", 0.0)))
		var u := a * cos(t) + left * sin(t)
		var along := d.dot(u)
		if along <= -r:
			return -1.0
		var off := absf(atan2(d.x * u.y - d.y * u.x, along))
		var spare := atan2(r + float(TUNE["body"]), maxf(0.3, dist))
		if off > deg_to_rad(float(F["deg"]) / 2.0) + spare:
			return -1.0
	var k := clampf(near / reach, 0.0, 1.0)
	return from + float(F["long"]) * (1.0 - pow(1.0 - k, 1.0 / 3.0))


## Where his blow goes out from: where he stood as the move began and what he walked; a flying move's, where he comes down.
func _origin() -> Vector2:
	# (a ring of force (the art chat's hammerfist): round where his fists strike the floor, a little before him)
	if not mv.is_empty() and R.has(mv["id"]) and R[mv["id"]]["force"] != null and R[mv["id"]]["force"]["shape"] == "ring":
		return h.world + Vector2(mv["ax"], mv["ay"]) * 0.7
	if B2.FLYING.has(str(mv.get("id", ""))):
		return h.world
	return Vector2(float(mv["x0"]) + float(mv["wx"]), float(mv["y0"]) + float(mv["wy"]))


## (game.ts vetStrike) His blow's force going out: what stands on the floor in its way, once a move; each monster it comes to struck,
## once.
func _strike(m: Dictionary) -> void:
	var F: Dictionary = m["force"]
	var S: Dictionary = m["strike"]
	var from: float = float(F.get("from", S["at"]))
	var f: float = mv["f"]
	if f > from + float(F["long"]) + 1.0:
		return
	var b := _origin()
	var a := Vector2(mv["ax"], mv["ay"])
	# (his left about the way his blow goes: never a mirror, from all eight sides)
	var left := Vector2(a.y, -a.x)
	var skill := 0 if is_punch(mv["id"]) else 1
	# (THE VETERAN'S TREE: Long Legs, his kicks reach a tile further)
	var more: float = float(_T()["longLegs"]["more"]) if S["kind"] == "kick" and _has("vlonglegs") else 0.0
	# (Vast's and Power's size widen his blows' reach, as their cards say; they did not: the bug hunt's fifth round)
	var size: float = maxf(0.1, float(h.loadout.r(skill).get("size", 1.0)))
	more = (float(F["reach"]) + more) * size - float(F["reach"])
	if not mv["props"] and f >= from:
		mv["props"] = true
		var reach: float = float(F["reach"]) + more
		if F["shape"] == "round" or F["shape"] == "ring":
			h._break_props(skill, b, reach)
		else:
			var t := deg_to_rad(float(F.get("dir", 0.0)))
			var u := a * cos(t) + left * sin(t)
			h._break_props(skill, b + u * reach * 0.6, 0.9)
	if h.monsters == null:
		return
	var k := 0
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead or (mv["hit"] as Array).has(o) or o.state == "rise" or h.monsters.shut_in(o):
			continue
		var at := _reach(m, b, a, left, o.world, o.r, more)
		if at < 0.0 or f < at:
			continue
		(mv["hit"] as Array).append(o)
		# (how many this blow has struck in all, not this frame: past the third, a quiet hit; counted afresh each frame, a round kick
		# through six struck five full; the bug hunt's fifth round)
		_hit(o, m, (mv["hit"] as Array).size() - 1)
		k += 1


## (game.ts vetHit) One of his blows landing: its share of the hit; driven back for good, staggered, stunned or thrown up.
func _hit(o, m: Dictionary, n: int) -> void:
	var id: String = mv["id"]
	var i := 0 if is_punch(id) else 1
	var rc: Dictionary = V["react"][m["force"]["react"]]
	var first: bool = (mv["hit"] as Array).size() == 1
	var share: float = m["share"]
	var T := _T()
	var fire: bool = m.get("globe") == "punchFire" or m.get("globe") == "kickFire" or (B2.on and B2.FLYING.has(id))
	var kicked: bool = m["strike"]["kind"] == "kick"
	# (THE VETERAN'S TREE: Launcher, his blows on one hanging in the air land twice as hard)
	if _has("vlauncher"):
		for u in up:
			if u["m"] == o:
				share *= float(T["launcher"]["mult"])
				break
	# (The Full Set: the last blow of a combo locked with a punch, a kick and a fire globe in it, a finisher)
	var finisher: bool = int(mv["globe"]) == most() - 1 and _has("vfullset") and globes.has("punch") and globes.has("kick") and (globes.has("punchFire") or globes.has("kickFire"))
	# (the Brawler remade: a flying blow that spent every globe, The Full Set's)
	if B2.on:
		finisher = int(mv.get("set", 0)) >= most() and _has("vfullset")
	if finisher:
		share *= float(T["fullSet"]["mult"])
	# (TWIN in front, as his move's card has it, “hits twice, each for” its share: each blow lands twice, the second a moment after;
	# his punches did not read it, the damage check found: words.gd, Twin)
	var tw: Dictionary = h.loadout.r(i)
	var twice: int = int(tw["count"])
	if twice > 1:
		share *= float(tw["count_dmg"])
	h.hit_monster(o, i, share, n >= 3)
	# (TWIN behind, of Echoes: each blow of the move landing again a moment later, weaker, as every hero's move is made again
	# (hero.gd _echo_of); his never were: the bug hunt's third round)
	var ek: float = float(tw.get("echo", 0.0))
	if ek > 0.0:
		var e_share := share * ek
		var again2 := func() -> void:
			if is_instance_valid(o) and not o.dead:
				h.hit_monster(o, i, e_share, true)
		if first:
			h._echo_of(i, "vblow", o.world, Vector2(mv["ax"], mv["ay"]), again2)
		else:
			_after(float(Words.data()["echo"]["delay"]), again2)
	# (each after the first as hard as the melds of Twin make it (melds52_rules.gd blow: Onslaught's full second): the bug hunt's
	# fifth round)
	for k2 in range(1, twice):
		var again := share
		var kk: int = k2
		_after(0.1 * k2, func() -> void:
			if is_instance_valid(o) and not o.dead:
				h.hit_monster(o, i, again * h.m52.blow(i, kk), true))
	# (THE LAST WORDS: PIERCING in front, his blow goes on through the first it lands on, to every enemy in a line behind it: hero.gd)
	var thr: float = float(tw.get("through", 0.0))
	if first and thr > 0.0:
		h.last.pierce_on(i, o, o.world, Vector2(mv["ax"], mv["ay"]), share * thr)
	# (Stoke: a fire move that lands takes two seconds off his jump's wait)
	if first and fire and _has("vstoke") and charges[2] < 1:
		cd[2] = maxf(0.01, cd[2] - float(T["stoke"]["secs"]))
	# (Thunder Knee: his flying knee and spinning jump kicks crack with lightning, on to three more near each one they hit)
	if id in ["knee", "spinkick", "spinkickClose", "flyknee"] and _has("vthunderknee"):
		_thunder(o, m)
	if finisher:
		_shake(5.0)
		if not o.dead:
			o.throw_from(_origin(), float(T["fullSet"]["throw"]), 0.3)
	if first:
		h._landed_on(i)
		# (what the words behind it leave, his blow leaves where it first lands, once a move)
		h._wake(i, o.world, 1.0, 1.0)
		var kick: bool = m["strike"]["kind"] == "kick"
		var heavy := kick or share >= 1.0
		_sfx(("heavyKick" if share >= 1.0 else "kick") if kick else ("haymaker" if share >= 1.0 else "jab"), 0.8 if heavy else 0.6)
		if share >= 1.5:
			_shake(3.5)
		elif heavy:
			_shake(1.8)
	if o.dead:
		return
	# (Viper Jab: his jab poisons; Stiff Jab: it breaks off what the one it hits is winding up)
	if id == "jab" and _has("vviperjab"):
		var hit: float = (float(h.stats["dmg_min"]) + float(h.stats["dmg_max"])) / 2.0 * float(h.loadout.r(0)["dmg_mult"]) * share
		var secs: float = Words.data()["poison"]["time"]
		o.dose(hit * float(T["viperJab"]["dose"]) / secs, secs)
	if id == "jab" and _has("vstiffjab") and not o.boss:
		o.break_off()
	# (Aftershock: every kick that lands knocks down everything near the one it hit)
	if kicked and _has("vaftershock"):
		_aftershock(o)
	# (the Brawler remade, Launcher: his flying hammerfist throws up all round where he lands)
	if id == "hammerfist" and _has("vlauncher") and first:
		rc = V["react"]["launch"]
	if rc.has("up") and _pop_up(o):
		o.stun_t = float(V["up"]["up"]) + float(rc.get("stun", 0.0))
		return
	var from := _origin()
	if rc.has("back") and not finisher:
		# (Wall Slam: one his kick drives into a wall or into another enemy is stunned)
		if kicked and _has("vwallslam") and _slams(o, from, float(rc["back"])) and not o.boss:
			o.stun_for(float(T["wallSlam"]["stun"]))
		o.throw_from(from, float(rc["back"]), float(TUNE["driveSecs"]))
	# (no boss is staggered nor stunned by his blows, as by no one's (monster.gd stun_for, stagger_from): every punch held one, and the
	# Warped Wordsmith stood held half his fight: the bug hunt's third round, 25 Nov 2026)
	if rc.has("stagger") and not o.boss:
		o.stagger_t = maxf(o.stagger_t, float(rc["stagger"]))
	# (a stun of his: his fire moves' and flying blows' alone, the biggest of his: STUNS MADE RARE, monster.gd)
	if rc.has("stun") and not o.boss:
		o.stun_for(float(rc["stun"]), "", true)
	# (Knockdown: the third punch of a combo knocks it off its feet)
	var third: bool = int(mv.get("nth", 0)) > 0 and int(mv.get("nth", 0)) % 3 == 0 if B2.on else int(mv["globe"]) == 2
	if third and is_punch(id) and _has("vknockdown") and not o.boss:
		o.stun_for(float(T["knockdown"]["down"]))


## (Wall Slam) Is the way it is driven blocked by a wall or another monster, within how far it is driven? (game.ts vetSlams)
func _slams(o, from: Vector2, back: float) -> bool:
	var d: Vector2 = o.world - from
	var u := d / d.length() if d.length() > 0.0 else Vector2(1, 0)
	var dd := 0.25
	while dd <= back + 0.01:
		var p: Vector2 = o.world + u * dd
		if not h.map.fits(p.x, p.y, minf(o.r, 0.42)):
			return true
		for q in h.monsters.list:
			if is_instance_valid(q) and q != o and not q.dead and q.world.distance_to(p) < q.r + o.r * 0.8:
				return true
		dd += 0.25
	return false


## (Aftershock) A ring of force through the floor round the one he kicked: everything near it falls (game.ts vetAftershock).
func _aftershock(o) -> void:
	var A: Dictionary = _T()["aftershock"]
	h._tell({"t": "burst", "x": o.world.x, "y": o.world.y, "r": A["r"], "el": "phys", "style": "shock"})
	for q in h.monsters.list:
		if not is_instance_valid(q) or q == o or q.dead or q.boss or h.monsters.shut_in(q):
			continue
		# (knocked down as every stun holds (monster.gd stun_for): an elite half as long, none through Fortress's shield; set by hand,
		# it held an elite 7.6 s of 10; the bug hunt's fifth round)
		if q.world.distance_to(o.world) <= float(A["r"]) + q.r:
			q.stun_for(float(A["down"]))


## (Thunder Knee) Lightning off the one his fire kick hit, on to the three nearest it: struck and stunned (game.ts vetThunder).
func _thunder(o, m: Dictionary) -> void:
	var K: Dictionary = _T()["thunderKnee"]
	var near: Array = []
	for q in h.monsters.list:
		if not is_instance_valid(q) or q == o or q.dead or (mv["hit"] as Array).has(q) or h.monsters.shut_in(q):
			continue
		if q.world.distance_to(o.world) <= float(K["far"]):
			near.append(q)
	near.sort_custom(func(a, b): return a.world.distance_to(o.world) < b.world.distance_to(o.world))
	for q in near.slice(0, int(K["n"])):
		h._tell({"t": "arc", "x0": o.world.x, "y0": o.world.y, "x1": q.world.x, "y1": q.world.y})
		h.hit_monster(q, 1, float(m["share"]) * float(K["share"]), true)
		if not q.dead and not q.boss:
			q.stun_for(float(K["stun"]))
	if not o.dead and not o.boss:
		o.stun_for(float(K["stun"]))


## (Guard Up) Between his blows his fists are up: a blow from in front of him does half harm (game.ts hurtHero). What is left.
func guard_k(by: Vector2) -> float:
	if not mv.is_empty() or not _has("vguardup"):
		return 1.0
	var G: Dictionary = _T()["guardUp"]
	var g: Vector2 = by - h.world
	if g.length() < 0.01 or g.dot(h.face) / g.length() >= float(G["cos"]):
		return 1.0 - float(G["less"])
	return 1.0


## (game.ts popUp) Thrown up in the air, stunned while it is up and two seconds after it comes down.
func _pop_up(o) -> bool:
	if o.dead or o.boss or o.state == "act" or h.monsters.shut_in(o):
		return false
	var B: Dictionary = V["up"]
	var was := false
	for u in up:
		if u["m"] == o:
			u["t"] = 0.0
			was = true
	if not was:
		up.append({"m": o, "t": 0.0})
	o.thrown = {}
	o.stun_t = maxf(o.stun_t, float(B["up"]) + float(B["stun"]))
	o.break_off()
	_say({"t": "popUp", "id": o.id, "x": o.world.x, "y": o.world.y})
	return true


## (game.ts comeDown) What is up comes down, stunned two seconds from then; and how high each is now (its picture lifted).
func _step_own(dt: float) -> void:
	var B: Dictionary = V["up"]
	for k in range(up.size() - 1, -1, -1):
		var u: Dictionary = up[k]
		var m = u["m"]
		u["t"] = float(u["t"]) + dt
		if not is_instance_valid(m) or m.dead:
			if is_instance_valid(m):
				m.pop = 0.0
			up.remove_at(k)
			continue
		var t := minf(1.0, float(u["t"]) / float(B["up"]))
		m.pop = roundf(4.0 * t * (1.0 - t) * float(B["high"]))
		if float(u["t"]) < float(B["up"]):
			continue
		m.pop = 0.0
		up.remove_at(k)
		m.stun_for(float(B["stun"]))
		_say({"t": "comeDown", "id": m.id, "x": m.world.x, "y": m.world.y, "secs": B["stun"]})
		_shake(1.5)


# =====================================================================================================================
# HIS PICTURES (render/veteran_fx.ts shown)

func turns_to_walk() -> bool:
	return mv.is_empty()


func walk_slow() -> float:
	return 1.0


## His frame while a move plays: its own list, by how far through it he is.
func _own_picture(side: int) -> Array:
	if mv.is_empty():
		return []
	var list: int = VET_LIST0 + (V["lists"] as Array).find(B2.art_of(mv["id"], V["lists"]))
	var n: int = h.art.count(side, list)
	if n == 0:
		return []
	return [list, clampi(floori(float(mv["f"])), 0, n - 1)]


func readiness() -> Dictionary:
	var out := super()
	out["whirl"] = 1.0
	return out


func _clear_own() -> void:
	taps_in = 0
	_punches = 0
	globes = []
	queue = []
	mv = {}
	done = []
	idle = 0.0
	_swipe = {}
	for u in up:
		if is_instance_valid(u["m"]):
			u["m"].pop = 0.0
	up.clear()
