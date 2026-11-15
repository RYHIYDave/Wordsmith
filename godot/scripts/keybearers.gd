## FLOOR 5, THE TEMPLE DOOR'S TWO KEYBEARERS, as the game fights them (game/act1_rules/keybearers.ts RULES_BLADE, RULES_FLAME,
## KB, KF, KEY_DROP; run as the bosses of floors 2 to 5 are run, game/bosses.ts BossRules step, pickAct, startAct, stepAct,
## endAct; their pictures' own numbers, art/key_bearers.ts, art/cultists.ts FRENZY, art/action_f2_fx.ts SIGIL; game/facing.ts
## handOf, beside; game/action_f4.ts pictureWays; which picture is shown, render/figure.ts gaitFrame). The owner, 13 Nov 2026:
## “I think just like a souped up version of the dagger cultist and a super version of the plane cult that makes sense flame
## fire cultist”; their blows, “The leap and the stab, a thrown dagger ranged attack” and “Fire fan and fire ring, plus a
## bigger version of the regular mob attack”; “Key rings to the floor (Recommended)”. Each an elite in a room of the mine.
##   HOW EACH GOES: he stands; he sets off after a hero further off than he likes (or out of his sight), walks at his pictures'
##     own pace, and stops where his walk comes round to its first frame, as near the hero as he likes to stand. His walk
##     loops from his stand: no pictures of setting off or stopping. Struck while he stands or goes, he reels (his `reel`
##     list, a third of a second from the blow).
##   HIS ACTS, the biggest ready one he is in reach of (and sees the hero), each played by its own clock from start to end;
##     he turns to the hero as it begins, and no more until it is over.
##   THE KEYBEARER OF THE KNIFE (`keyblade`): the dagger cultist, 1.24 times as big. He runs at 3.224 tiles a second (a round
##     of 8 frames at 13 a second), as near as 1.4 tiles, and sets off again beyond 1.8.
##     THE STAB (his basic blow, within 2.4 tiles; list `attack`, 2.7 s): the dagger cultist's frenzy: four stabs, at 0.5,
##       0.733, 0.967 and 1.2 s, each a step of 0.372 on IN HIS PICTURE, along the way his picture faces (one of the four
##       corners it is painted from); each strikes a hero within 1.35 tiles of where his picture has him then, and before
##       him, x0.45. Then he stands winded, the opening; as it ends he is moved the 1.488 tiles his steps took him.
##     THE THROW (3 to 9 tiles; list `throw`, 1.2 s; every 4.5 s): a knife drawn from his bandolier, held back by his ear
##       from 0.42 s, flung at 0.62 s from his hand, straight at where the hero is then (perils.gd kb_knife), x1.
##     THE LEAP (1.8 to 4.5 tiles; list `leap`, 1.5 s; every 6 s): he rears up, leaves the floor at 0.5 s, turns a flip in
##       the air (the owner: “Gimme a flip in the knife guys jump”), and at 0.9 s plunges his blade down 0.759 tiles before
##       his picture: a hero within 1.15 tiles of that is struck, x1.4. In the air he is carried on toward where the hero
##       stood as he began (as far as 3.4 tiles), so that the plunge comes down there; his picture springs back to him.
##       He is carried only so far as the floor lets him: he stops at the first place that is no floor to walk on (a chest's
##       tile, a brazier's, a wall), and plunges there (keybearers.ts carry; so too the stab's last move).
##   THE KEYBEARER OF THE FLAME (`keyflame`): the fire cultist made bigger. He walks in procession at 1.4 tiles a second (a
##     round of 8 frames at 8 a second); he stands off, as near as 5 tiles, and sets off again beyond 6.
##     THE SIGIL (his basic blow, within 8 tiles; list `attack`, 1.95 s): the fire cultist's sigil, 2.5 tiles round, under
##       where the hero stands as his hand begins to trace it (0.16 s); it erupts at his slam (1.2 s), x1.2, and burns on
##       (perils.gd kb_sigil).
##     THE FAN (within 9 tiles; list `fan`, 1.4 s; every 4 s): his burning hand drawn back, held from 0.45 s, swept across at
##       0.76 s: three balls of fire fly from it, 22 degrees apart, the middle one at where the hero is then (kb_ball), x1.25.
##     THE RING (within 3.5 tiles; list `ring`, 2.1 s; every 8 s): both hands raised, the ring's reach marked round him on the
##       floor (kb_reach); at 1.3 s he strikes the floor and a ring of fire bursts out from him along it (kb_ring), x1.5.
##   THEIR KEYS: each, killed, drops his key: it tumbles from his hip to the floor 0.75 tiles to his side (0.15 before him),
##     rings there half a second later, and lies. The hero come within 0.6 tiles of it (0.7 s or more after it was dropped)
##     takes it: monsters.gd `quest_item("key", where it lay)`, and it is gone. What that does (the temple door, its chains,
##     the lines said, the sound and sparkle of game.ts templeKeyTaken) is the listener's. `keys_lying(mgr)` says where
##     keys lie now.
## The game's names for their acts are 'keyblade:stab', 'keyblade:throw', 'keyblade:leap', 'keyflame:sigil', 'keyflame:fan'
## and 'keyflame:ring'; here kb_stab, kb_throw, kb_leap, kb_sigil, kb_fan, kb_ring (monsters.gd `used` counts them).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")

## (art/key_bearers.ts KEY_K: how many times as big as their cultists they are; art/new_mobs3.ts TILE3: so many of a figure's
## own lengths to a tile)
const KEY_K := 1.24
const TILE3 := 39.191835884530846

## THE KNIFE (RULES_BLADE.gait: the pace his run is painted for, KNIFE_PACE 2.6 times KEY_K, and its loop, 8 frames at 13 a
## second; no setting off, no stopping; how near the hero he comes, and how much further off the hero must be before he sets
## off again)
const KNIFE_GAIT := {"pace": 3.224, "cycle": 8.0 / 13.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.4, "slack": 0.4}
## (BLADE_ACTS: `first`, seconds from waking before it may first be used; `after`, the wait after it before his next act;
## `near` and `far`, the hero's distance at which it is used. Their lengths and blows his pictures' own: FRENZY.long 81 frames,
## FRENZY_HITS[0]; KB_THROW.long, hit; KB_LEAP.long, hit)
const KNIFE_ACTS := [
	{"id": "kb_stab", "clip": "attack", "long": 81.0 / 30.0, "hit": 15.0 / 30.0, "dmg": 0.45, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 2.4},
	{"id": "kb_throw", "clip": "throw", "long": 1.2, "hit": 0.62, "dmg": 1.0, "cooldown": 4.5, "first": 1.5, "after": 0.6, "near": 3.0, "far": 9.0},
	{"id": "kb_leap", "clip": "leap", "long": 1.5, "hit": 0.9, "dmg": 1.4, "cooldown": 6.0, "first": 2.5, "after": 0.6, "near": 1.8, "far": 4.5},
]
## (KB.stab; art/cultists.ts FRENZY_HITS, FRENZY_STEP 0.3: each stab a step on, his picture's, struck within `reach` of where
## he is then and before him; `travel`, the four of them)
const STAB := {"hits": [15.0 / 30.0, 22.0 / 30.0, 29.0 / 30.0, 36.0 / 30.0], "step": 0.3 * KEY_K, "reach": 1.35, "travel": 4.0 * 0.3 * KEY_K}
## (KB.leap; KB_LEAP.leap: when he leaves the floor; `lunge`: how far his picture lunges, 24 of his lengths, grown; `most`:
## the most the rules carry him on besides; `short`: how far short of the hero that brings his plunge; `r`: how near it strikes)
const LEAP := {"leap": 0.5, "lunge": 24.0 * KEY_K / TILE3, "most": 3.4, "short": 0.35, "r": 1.15}
## (KB.knife: how fast his thrown knife flies, how far, how near it strikes, how long its glint)
const KNIFE := {"speed": 12.0, "reach": 10.0, "r": 0.42, "burst": 0.18}
## (art/key_bearers.ts throwFrom(): where the knife leaves his hand: tiles before him, to the left he is drawn with, game
## pixels up. Worked out there from his bones at the throw's blow, and copied here)
const THROW_FROM := [0.7327222657272875, 0.0024408374230361035, 19.599003951576833]

## THE FLAME (RULES_FLAME.gait: FL_PACE, eight frames at eight a second; he stands off and casts)
const FLAME_GAIT := {"pace": 1.4, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 5.0, "slack": 1.0}
## (FLAME_ACTS; FL_SIGIL.long, hit; FL_FAN.long, hit; FL_RING.long, hit)
const FLAME_ACTS := [
	{"id": "kb_sigil", "clip": "attack", "long": 1.95, "hit": 1.2, "dmg": 1.2, "cooldown": 0.0, "first": 0.0, "after": 1.0, "near": 0.0, "far": 8.0},
	{"id": "kb_fan", "clip": "fan", "long": 1.4, "hit": 0.76, "dmg": 1.25, "cooldown": 4.0, "first": 1.5, "after": 0.8, "near": 0.0, "far": 9.0},
	{"id": "kb_ring", "clip": "ring", "long": 2.1, "hit": 1.3, "dmg": 1.5, "cooldown": 8.0, "first": 3.0, "after": 0.9, "near": 0.0, "far": 3.5},
]
## (KF.sigilR, the fire cultist's 1.75 made bigger; art/action_f2_fx.ts SIGIL: `delay` from its ring's first appearing to its
## eruption, `trace` its ring drawn round, `strike` the eruption's second frame, `pillar` the pillar standing, `fall` falling,
## `burn` the floor burning on; keybearers.ts `peril`: a burn's `share` of the blow, one `every` half second)
const SIGIL := {"r": 2.5, "delay": 1.04, "trace": 0.4, "strike": 1.0 / 30.0, "pillar": 0.3, "fall": 0.2, "burn": 3.0, "share": 0.18, "every": 0.5}
## (SIGIL_LONG: how long it lasts after its eruption)
const SIGIL_LONG := 0.3 + 0.2 + 3.0
## (KF.ball: how fast each ball of his fan flies, how far, how near it strikes, how long its burst; FL_FAN.wide: the fan's
## half-width, degrees)
const BALL := {"speed": 7.5, "reach": 9.0, "r": 0.45, "burst": 0.3, "wide": 22.0}
## (art/key_bearers.ts fanFrom(): where the fan leaves his hand, as THROW_FROM)
const FAN_FROM := [0.573747260802153, -0.11425537697315845, 24.11750634007299]
## (KF.ring: from `from` tiles out to `to`, at `speed` tiles a second, striking within `half` of its edge; seen dying for
## `fade` after. RING_LASTS: how long it lasts from its burst)
const RING := {"from": 0.8, "to": 5.0, "speed": 7.0, "half": 0.45, "fade": 0.35}
const RING_LASTS := (5.0 - 0.8) / 7.0 + 0.35

## (KEY_DROP: how long the key tumbles to the floor, where it lands, tiles to his side (`out`) and before him (`fwd`), how
## near the hero must come to take it, and how long after it has come to rest (`rest`). It tumbles from 22 game pixels up.)
const KEY_DROP := {"fall": 0.5, "out": 0.75, "fwd": 0.15, "take": 0.6, "rest": 0.2, "high": 22.0}


## Where the keys they have dropped lie on this floor now, not yet taken (for whoever must find one: a check, a map). `mgr`:
## monsters.gd.
static func keys_lying(mgr) -> Array:
	var out := []
	if mgr != null and is_instance_valid(mgr.stands):
		for c in mgr.stands.get_children():
			if c is TempleKey:
				out.append(c.at)
	return out


## WHAT THE TWO SHARE WITH perils.gd: how a figure that faces a way on the floor is drawn, whether the hero can be struck, and
## their fire's own sums.
class Kit:
	## game/facing.ts handOf, for pictures from behind painted as the camera truly sees them (theirs are): 1 if his left in
	## his picture is the world's left of the way he faces, -1 if his right is (he is drawn turned over when he faces
	## screen-left).
	static func hand_of(f: Vector2) -> int:
		return -1 if f.x - f.y < 0.0 else 1

	## A point `fwd` tiles before him and `left` tiles to the left he is drawn with (beside).
	static func beside(at: Vector2, f: Vector2, hand: int, fwd: float, left: float) -> Vector2:
		return Vector2(at.x + f.x * fwd + f.y * hand * left, at.y + f.y * fwd - f.x * hand * left)

	## The way his pictures face on the floor, for the way he truly faces (action_f4.ts pictureWays): one of the four corners
	## he is painted from.
	static func picture_ahead(f: Vector2) -> Vector2:
		var ahead := Vector2(0, -1) if f.x + f.y < -0.2 else Vector2(1, 0)
		if f.x - f.y < 0.0:
			ahead = Vector2(ahead.y, ahead.x)
		return ahead

	static func at(t0: float, t1: float, when: float) -> bool:
		return t0 < when and t1 >= when

	## keybearers.ts open: whether the hero can be struck now: standing (the game not over), not unhurtable, not in the air
	## of his lunge.
	static func can_strike(hero) -> bool:
		return hero.alive and hero._invuln <= 0.0 and hero._act != "lunge"

	## ringAt: how far out the ring of fire's edge is `t` seconds from its burst (tiles).
	static func ring_at(t: float) -> float:
		return minf(RING["to"], float(RING["from"]) + float(RING["speed"]) * maxf(0.0, t))

	## art/action_f2_fx.ts burnRadius, for his great sigil: how far out the floor still burns `t` seconds after it erupted.
	static func burn_radius(t: float) -> float:
		if t < 0.0:
			return 0.0
		if t < float(SIGIL["pillar"]):
			return SIGIL["r"]
		var u: float = (t - float(SIGIL["pillar"])) / (float(SIGIL["fall"]) + float(SIGIL["burn"]))
		return 0.0 if u >= 1.0 else float(SIGIL["r"]) * pow(1.0 - u, 0.7)


## WHAT THE TWO SHARE: the gait, the acts' clock, the reel, the key (game/bosses.ts BossRules, for a kind with Act1Rules).
class Bearer extends RefCounted:
	var mode := "stand"
	var gt := 0.0
	var cds: Array = []
	## The act he is making: {i, t, hand, a}; null: none. `a`: how far his leap carries him on.
	var act = null
	## (how long since he was last struck, and his life when last looked at: game.ts struckT)
	var _struck := 1e9
	var _life_was := -1.0

	func _gait() -> Dictionary:
		return {}

	func _acts() -> Array:
		return []

	## As an act begins, turned to the hero already, `dist` tiles from him (Act1Rules.start).
	func _begin(_m, _a: Dictionary, _dist: float) -> void:
		pass

	## From `t0` to `t1` of act `a`: what it does (Act1Rules.acting).
	func _acting(_m, _a: Dictionary, _t0: float, _t1: float, _hero) -> void:
		pass

	## As an act ends (Act1Rules.end).
	func _ended(_m, _a: Dictionary) -> void:
		pass

	## A step of him, awake (monster.gd step hands him here).
	func step(m, dt: float, hero) -> void:
		var G := _gait()
		var acts := _acts()
		if cds.is_empty():
			for a in acts:
				cds.append(float(a["first"]) * randf_range(0.7, 1.2))
		for k in cds.size():
			cds[k] -= dt
		if _life_was < 0.0:
			_life_was = m.max_life
		_struck = 0.0 if m.life < _life_was else _struck + dt
		_life_was = m.life
		# (put to sleep in the middle of a move, as the hero fell, and woken again: the move is broken off)
		if act != null and m.state != "act":
			act = null
			_to("stand")
		if act != null:
			_step_act(m, acts, dt, hero)
			return
		m._cd -= dt
		m.state = "chase"
		var to: Vector2 = hero.world - m.world
		var dist := to.length()
		var los: bool = hero.alive and dist < 16.0 and m.mgr.sees(m.world, hero.world)
		var want := _pick(acts, dist, los) if m._cd <= 0.0 and hero.alive else -1
		var moving := mode == "setOff" or mode == "walk" or mode == "halt"
		# (he sets off after a hero who is further off than he likes, or out of his sight)
		var go: bool = hero.alive and want < 0 and (dist > float(G["stopAt"]) + float(G["slack"]) or (not los and dist > 1.2))
		if not moving:
			gt += dt
			if dist > 0.01:
				m.face = to / dist
			if want >= 0:
				_start(m, acts, want, hero)
				return
			if go:
				_to("setOff")
			_picture(m)
			return
		# CARRIED OVER THE FLOOR AT HIS PACE, from the first moment of setting off to the last of stopping
		var sp: float = m.speed
		var v := Vector2.ZERO
		if dist > 0.01:
			v = to / dist if dist < 2.5 and los else m.mgr.flow_dir(m.world)
		if mode != "halt" and v != Vector2.ZERO:
			m.face = v
		_slide(m, m.face * sp * dt)
		var before := gt
		gt += dt * sp / float(G["pace"])
		# (he means to stop where his walk next comes round to its first frame: an act is ready and the hero in its reach, or
		# there is no way on; or, there, stopping would leave him as near the hero as he likes to stand)
		var stop := want >= 0 or v == Vector2.ZERO
		var here: bool = stop or (los and dist - float(G["pace"]) * float(G["halt"]) <= float(G["stopAt"]))
		if mode == "setOff":
			if gt >= float(G["setOff"]):
				_to("halt" if here else "walk")
		elif mode == "walk":
			if here and floori(gt / float(G["cycle"])) > floori(before / float(G["cycle"])):
				_to("halt")
		elif gt >= float(G["halt"]):
			_to("stand")
		_picture(m)

	func _to(next: String) -> void:
		mode = next
		gt = 0.0

	## render/figure.ts gaitFrame, for one not acting: struck, standing or going, he reels as his picture has it, from the
	## blow; else his walk, by how far round it the gait has carried him (his feet grip the floor); else his stand, by the
	## gait's clock (he has no pictures of setting off or stopping: his stand).
	func _picture(m) -> void:
		if m.art.has("reel") and _struck < m.art.length("reel"):
			m._set_list("reel")
			m._anim_t = _struck
			return
		m._set_list("walk" if mode == "walk" else "idle")
		m._anim_t = gt

	## pickAct: the biggest ready act he is in reach of, the hero in his sight; -1, none (he comes on, or waits).
	func _pick(acts: Array, dist: float, los: bool) -> int:
		if not los:
			return -1
		for i in range(acts.size() - 1, -1, -1):
			var a: Dictionary = acts[i]
			if cds[i] > 0.0 or dist < float(a["near"]) or dist > float(a["far"]):
				continue
			return i
		return -1

	## startAct: turned to the hero, and from here on turned no more until it is over.
	func _start(m, acts: Array, i: int, hero) -> void:
		var a: Dictionary = acts[i]
		var to: Vector2 = hero.world - m.world
		var dist := to.length()
		if dist > 0.01:
			m.face = to / dist
		m.state = "act"
		act = {"i": i, "t": 0.0, "hand": Kit.hand_of(m.face), "a": 0.0}
		m._set_list(a["clip"], true)
		m.mgr.used[a["id"]] = m.mgr.used.get(a["id"], 0) + 1
		_begin(m, a, dist)

	## stepAct: the act's clock runs, and what it does at each moment is done; his pictures go by that clock.
	func _step_act(m, acts: Array, dt: float, hero) -> void:
		var a: Dictionary = acts[act["i"]]
		var t0: float = act["t"]
		act["t"] = minf(a["long"], t0 + dt)
		var t1: float = act["t"]
		m._anim_t = t1
		_acting(m, a, t0, t1, hero)
		if t1 >= float(a["long"]):
			_end(m, a)

	## endAct: he stands as his pictures leave him, and waits his moment.
	func _end(m, a: Dictionary) -> void:
		var i: int = act["i"]
		m.state = "chase"
		act = null
		_to("stand")
		m._cd = float(a["after"]) * randf_range(0.9, 1.15)
		if float(a["cooldown"]) > 0.0:
			cds[i] = a["cooldown"]
		m._set_list("idle", true)
		_ended(m, a)

	## What a blow of his own does to the hero, `mult` times his blow (BossRules.blow).
	func _blow(m, hero, mult: float) -> void:
		if hero.alive:
			hero.hurt(m._roll() * mult)

	## game.ts slide, for him as he walks: the step along x kept if his body (no bigger than 0.42 round) is clear there, then
	## the step along y.
	func _slide(m, step: Vector2) -> void:
		var rr := minf(m.r, 0.42)
		if m.mgr.clear(m.world.x + step.x, m.world.y, rr):
			m.world.x += step.x
		if m.mgr.clear(m.world.x, m.world.y + step.y, rr):
			m.world.y += step.y

	## keybearers.ts carry: carried `d` tiles the way `way`, a tenth of a tile at a time, so far as the floor lets him: he
	## stops before the first place that is no floor to walk on.
	func _carry(m, way: Vector2, d: float) -> void:
		var n := maxi(1, ceili(absf(d) / 0.1))
		for i in n:
			var p: Vector2 = m.world + way * (d / n)
			if not m.mgr.map.walkable(floori(p.x), floori(p.y)):
				return
			m.world = p

	## The hero's way from `from`, as a unit (the way he faces if the hero is on it): keybearers.ts toward.
	func _toward(hero, from: Vector2, face: Vector2) -> Vector2:
		var to: Vector2 = hero.world - from
		var d := to.length()
		return to / d if d > 0.01 else face

	## As he falls (Act1Rules.died, dropKey): his key, tumbling from his hip to the floor beside him, ringing. To his left
	## as he is drawn if he fell in the middle of an act, else to the world's left of the way he faced (as the game has it);
	## where that is no floor, at his feet.
	func died(m) -> void:
		var hand: int = act["hand"] if act != null else 1
		var at := Kit.beside(m.world, m.face, hand, KEY_DROP["fwd"], KEY_DROP["out"])
		if not m.mgr.map.walkable(floori(at.x), floori(at.y)):
			at = m.world
		var key := TempleKey.new()
		key.mgr = m.mgr
		key.at = at
		key.from = m.world
		m.mgr.stands.add_child(key)


## THE KEYBEARER OF THE KNIFE (RULES_BLADE).
class Knife extends Bearer:
	func _gait() -> Dictionary:
		return KNIFE_GAIT

	func _acts() -> Array:
		return KNIFE_ACTS

	## (his leap: how far the rules carry him on as he flies, so that its plunge comes down where the hero stands)
	func _begin(_m, a: Dictionary, dist: float) -> void:
		if a["id"] == "kb_leap":
			act["a"] = clampf(dist - float(LEAP["lunge"]) - float(LEAP["short"]), 0.0, float(LEAP["most"]))

	func _acting(m, a: Dictionary, t0: float, t1: float, hero) -> void:
		var h: Vector2 = hero.world
		var ahead := Kit.picture_ahead(m.face)
		match a["id"]:
			"kb_stab":
				var hits: Array = STAB["hits"]
				for k in hits.size():
					if not Kit.at(t0, t1, hits[k]):
						continue
					m.mgr.sfx.play("swing", linear_to_db(0.4))
					# (where his picture has him as the stab lands, and whether the hero is before him there, within its reach)
					var b: Vector2 = m.world + ahead * (float(STAB["step"]) * (k + 1))
					var d := h - b
					var l := d.length()
					if l <= float(STAB["reach"]) and (l < 0.3 or d.dot(m.face) / l > -0.1) and Kit.can_strike(hero):
						_blow(m, hero, a["dmg"])
			"kb_leap":
				# (in the air from his leap to his plunge: carried on toward where the hero stood)
				var left: float = LEAP["leap"]
				var hit: float = a["hit"]
				if t1 > left and t0 < hit:
					_carry(m, m.face, float(act["a"]) * (minf(t1, hit) - maxf(t0, left)) / (hit - left))
				if Kit.at(t0, t1, hit):
					hero.kick(2.0)
					m.mgr.sfx.play("slam", linear_to_db(0.6))
					var p: Vector2 = m.world + ahead * float(LEAP["lunge"])
					if h.distance_to(p) <= float(LEAP["r"]) and Kit.can_strike(hero):
						_blow(m, hero, a["dmg"])
			"kb_throw":
				if Kit.at(t0, t1, a["hit"]):
					var o := Kit.beside(m.world, m.face, act["hand"], THROW_FROM[0], THROW_FROM[1])
					m.mgr.perils.kb_fly("kb_knife", o, _toward(hero, o, m.face), m._roll() * float(a["dmg"]), THROW_FROM[2])
					m.mgr.sfx.play("lunge", linear_to_db(0.45))

	## (his frenzy has carried him on, in his picture: he is where it left him)
	func _ended(m, a: Dictionary) -> void:
		if a["id"] == "kb_stab":
			_carry(m, Kit.picture_ahead(m.face), STAB["travel"])


## THE KEYBEARER OF THE FLAME (RULES_FLAME).
class Flame extends Bearer:
	func _gait() -> Dictionary:
		return FLAME_GAIT

	func _acts() -> Array:
		return FLAME_ACTS

	## (his ring: its reach marked round him on the floor while he gathers it, until he strikes: render/act1_fx/keybearers.ts)
	func _begin(m, a: Dictionary, _dist: float) -> void:
		if a["id"] == "kb_ring":
			m.mgr.perils.kb_reach(m, a["hit"])

	func _acting(m, a: Dictionary, t0: float, t1: float, hero) -> void:
		match a["id"]:
			"kb_sigil":
				# (its ring under the hero as his hand begins to trace it; it erupts at his slam, the act's blow)
				var from: float = float(a["hit"]) - float(SIGIL["delay"])
				if Kit.at(t0, t1, from):
					m.mgr.perils.kb_sigil(hero.world, -float(SIGIL["delay"]) + (t1 - from), m._roll() * float(a["dmg"]), m)
					m.mgr.sfx.play("fire", linear_to_db(0.35))
			"kb_fan":
				if Kit.at(t0, t1, a["hit"]):
					var o := Kit.beside(m.world, m.face, act["hand"], FAN_FROM[0], FAN_FROM[1])
					var way := _toward(hero, o, m.face)
					var dmg: float = m._roll() * float(a["dmg"])
					for deg in [-float(BALL["wide"]), 0.0, float(BALL["wide"])]:
						m.mgr.perils.kb_fly("kb_ball", o, way.rotated(deg_to_rad(deg)), dmg, FAN_FROM[2])
					m.mgr.sfx.play("fire", linear_to_db(0.6))
			"kb_ring":
				if Kit.at(t0, t1, a["hit"]):
					m.mgr.perils.kb_ring(m.world, m._roll() * float(a["dmg"]))
					m.mgr.sfx.play("fire")
					m.mgr.sfx.play("slam", linear_to_db(0.5))
					hero.kick(3.0)


## A KEY OF THE TEMPLE DOOR, DROPPED (keybearers.ts KEY_PERIL and its `peril`; drawn as render/act1_fx/keybearers.ts keyNow
## has it, a stand-in for art/key_bearers_fx.ts keySprite): it tumbles from its bearer's hip to the floor, turning over,
## bounces as it rings there, and lies, its light on the floor round it and a glint running over it now and then, until the
## hero comes to it. It stands among those who stand (the game draws it at its own depth). It is no peril: what a fallen
## hero's coming back clears from the floor (hero.gd, the perils) leaves it lying, or the temple door could never be opened.
class TempleKey extends Node2D:
	## (art/key_bearers_fx.ts BRASS, dark to light; the line round it; the enemy's pink in its bow)
	const BRASS: Array[Color] = [Color("#2e1a0c"), Color("#6a4420"), Color("#a8742e"), Color("#dcaa52"), Color("#f6dc96")]
	const LINE := Color("#120a06")
	const PINK := Color("#ff4f8a")

	var mgr  # monsters.gd
	## Where it lies, where its bearer fell, and how long since it was dropped.
	var at := Vector2.ZERO
	var from := Vector2.ZERO
	var t := 0.0

	func _ready() -> void:
		position = Iso.to_screen(from.x, from.y)

	func _process(dt: float) -> void:
		if not is_instance_valid(mgr):
			queue_free()
			return
		var fall: float = KEY_DROP["fall"]
		var before := t
		t += dt
		# (taken once it has come to rest, by walking onto it)
		var hero = mgr.hero
		if t >= fall + float(KEY_DROP["rest"]) and hero != null and hero.alive and hero.world.distance_to(at) <= float(KEY_DROP["take"]):
			mgr.quest_item.emit("key", at)
			queue_free()
			return
		if before < fall and t >= fall:
			mgr.sfx.play("gold", linear_to_db(0.9))
		var on := _on_floor()
		position = Iso.to_screen(on.x, on.y)
		queue_redraw()

	## Over which place of the floor it is now (keyNow): from its bearer's hip to where it lies, as it falls.
	func _on_floor() -> Vector2:
		return from.lerp(at, clampf(t / float(KEY_DROP["fall"]), 0.0, 1.0))

	## How high it is now, game pixels (keyNow): thrown up a little off his hip and falling; then its bounce as it rings on
	## the stone, a smaller one, and lying.
	func _high() -> float:
		var fall: float = KEY_DROP["fall"]
		if t < fall:
			var u := t / fall
			return maxf(0.0, float(KEY_DROP["high"]) * (1.0 - u) + 14.0 * u * (1.0 - u) * 1.2)
		var b := t - fall
		if b < 0.16:
			return 4.0 * sin(PI * b / 0.16)
		return 1.5 * sin(PI * (b - 0.16) / 0.1) if b < 0.26 else 0.0

	func _draw() -> void:
		var fall: float = KEY_DROP["fall"]
		var on := _on_floor()
		var lift: float = mgr.map.lift_at(on.x, on.y) if is_instance_valid(mgr) and mgr.map != null else 0.0
		var foot := Vector2(0.0, -lift)
		var high := _high()
		# (its shadow under it while it is in the air)
		if high > 0.5:
			draw_colored_polygon(_oval(foot, 6.0, 3.0), Color(0, 0, 0, 0.3))
		# (lying, its light on the floor round it, so that it is seen)
		if t >= fall:
			var r := 2.0 * (20.0 + 4.0 * sin(t * 3.0))
			for k in 3:
				draw_colored_polygon(_oval(foot + Vector2(0, -4), r * (1.0 - 0.3 * k), r * 0.5 * (1.0 - 0.3 * k)), Color(BRASS[3], 0.09))
		# (the key: a quarter turn over 14 times a second as it tumbles; one more as it bounces; lying, its bow to the left)
		var turn := floori(t * 14.0) % 4 if t < fall else (1 if t - fall < 0.16 else 0)
		var mid := foot + Vector2(0.0, -2.0 * (high + 2.0))
		if is_instance_valid(mgr) and mgr.perils != null and mgr.perils.has_film("kb_key"):
			# (THE GAME'S OWN picture of it, art/key_bearers_fx.ts keySprite, its middle there)
			mgr.perils._film_pic(self, "kb_key", "stand", turn, mid)
		else:
			draw_set_transform(mid, turn * PI / 2.0 + (0.35 if turn % 2 == 1 else 0.0), Vector2.ONE)
			_draw_key(LINE, 1.0)
			_draw_key(BRASS[3], 0.0)
			draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
		# (a glint running over it now and then, as it lies)
		if t >= fall:
			var ph := fmod(t * 0.7 + at.x * 0.13, 1.0)
			if ph < 0.12:
				draw_rect(Rect2(mid + Vector2(-10.0 + ph * 160.0, -4.0), Vector2(2, 2)), Color("#fff6d8"))

	## The key as it lies, its middle at the middle (art/key_bearers_fx.ts keyAt, 26 by 14 picture pixels): its bow a ring of
	## brass round a dark hole, a mote of the enemy's pink in it; its shaft; its bit, two teeth down. `grow`: so much bigger
	## all round (its line), in `c`.
	func _draw_key(c: Color, grow: float) -> void:
		var line := grow > 0.0
		draw_circle(Vector2(-7, 0), 5.0 + grow, c)
		draw_rect(Rect2(-3.0 - grow, -1.5 - grow, 14.0 + 2.0 * grow, 3.0 + 2.0 * grow), c)
		draw_rect(Rect2(5.0 - grow, 1.5 - grow, 2.0 + 2.0 * grow, 3.0 + 2.0 * grow), c)
		draw_rect(Rect2(8.0 - grow, 1.5 - grow, 3.0 + 2.0 * grow, 2.0 + 2.0 * grow), c)
		if line:
			return
		# (the light along its upper side, the shade along its lower; the hole in its bow, the enemy's pink in it)
		draw_arc(Vector2(-7, 0), 4.0, PI, TAU, 10, BRASS[4], 2.0)
		draw_arc(Vector2(-7, 0), 4.0, 0.0, PI, 10, BRASS[2], 2.0)
		draw_rect(Rect2(-3.0, -1.5, 14.0, 1.0), BRASS[4])
		draw_rect(Rect2(-3.0, 0.5, 14.0, 1.0), BRASS[2])
		draw_circle(Vector2(-7, 0), 1.9, Color("#140a08"))
		draw_circle(Vector2(-7, 0), 0.9, PINK)

	## An oval on the screen round `c` (picture pixels).
	func _oval(c: Vector2, rx: float, ry: float, n := 20) -> PackedVector2Array:
		var pts := PackedVector2Array()
		for i in n:
			var a := TAU * i / n
			pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
		return pts
