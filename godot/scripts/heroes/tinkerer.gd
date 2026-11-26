## THE TINKERER (game/tinkerer.ts; game.ts tossVial, vialBursts, whistle, holdJump, golemPounds, stepGolem, stepRocket, golemSpot; her
## blast jump in useEvasive and blastLands), her three moves by the game's rules:
##   HER VIAL TOSS (her tap): she lobs a vial off her belt where she aims (no further than its range, as far as she sees); it flies
##     TINKER_TUNE.toss.flight and bursts where it comes down, hurting all within the move's radius. Aimed at an enemy for her, it
##     goes where the enemy will be as it comes down (lock.ts placedAim). Twin, a second beside it; "of Echoes", a weaker one after.
##   HER GOLEM (her tap and hold): her first whistles it out beside her (it drops in); from then on it is always with her. It runs
##     after her (faster than she runs) and goes for what is awake near her. IT ONLY SHOOTS, by his word of 21 Nov 2026 (“i think
##     we should change the golem to be ranged, small shots, then big shot on the whistle.”; asked whether the big shot takes the
##     place of its pound and its jump, his pick “Replace them (Recommended)”): it stands off and fires its cannon's small shot at
##     what it fights (game.ts, the gun arm's cannon act, from any way off within its reach; a shot about as often as it punched),
##     or with her tree's GUN ARM its tesla coil zaps it; each whistle after the first braces it and charges its BIG SHOT at where
##     she points, fired as she lets go (game.ts stepCharge, chargedShot: the cannon's shell, the coil's beam; Twin, a second; "of
##     Echoes", a weaker one after). Far from where it is going, it rocket-jumps there (GOLEM_ROCKET: crouched half a second, its
##     stacks swung down and flaring, the blast, the flight, its landing its fist slam). It cannot be broken: monsters do not fight
##     it. Left far behind (a way taken), it is whistled up beside her again; it winds down where it stands when she falls.
##   HER BLAST JUMP (her swipe): a bomb at her feet goes off, what is by her hurt and blown away, and she rides the blast to a spot,
##     nothing hurting her in the air (Twin, a second bomb a moment later where she was; "of Echoes", a weaker one after).
## The Golem's hits are hers, made with her tap and hold's words. HER TREE in the port: her vials' talents, Mark II (two Golems),
## Growth Serum, Overdrive, Shrapnel, Lightning Rod and Prospector (on its big shot, as its pound was), and the GUN ARM, his word of
## 21 Nov 2026 (“we can keep the tesla coil for now, but i feel like it will need to be changed in the future”): its cannon swapped
## for the tesla coil.
extends "res://scripts/heroes/kit.gd"

## (his word, 21 Nov 2026: the Golem only shoots) Its small shot's wait after each: the punch's, so that it fires about as often as
## it punched and hits about as hard (the game's cannon waited TINKER_TUNE.golem.cannon.wait, 3 s, beside its fists). His to change.
const SHOT_WAIT := 0.5

## (assets/heroes/golem.json: tools/godot_tinkerer.ts, her tune and its rocket jump's frames, as the game has them)
## THE BIG ONE NOW AND THEN (his pick, 26 Nov 2026, “Fix the balance (Recommended)”, after the speed and tank test found her
## unkillable: every fifth vial knocks everything near down for 1.2 s, and she throws them so fast that the next big one came before
## they were up, so that nothing near her ever struck; with it on a big one comes no sooner than BIG_ONE_SECS after the last, the
## fifth vial or a later one: they are down a little more than a third of the time). ON at his yes to the numbers (her toughness
## before and after, docs/tests/speed_tank_2026-11-26.txt), 26 Nov 2026: “Yes, both (Recommended)”.
static var BIG_ONE_WAIT := true
const BIG_ONE_SECS := 3.0
var _since_big := 0
var _big_at := -1e9
var G := {}
var TT := {}
var GT := {}
var RK := {}
## Her vials in the air: {x0, y0, x1, y1, t, flight, skill, frac, wake}.
var vials: Array = []
## Her Golems (one; two with Mark II): {id, x, y, fx, fy, act, act_t, did, target, ax, ay, cannon_cd, jump_cd, walked, skill, seat,
## jx, jy, grow_t, over_t, zap_t, held, ch_frac, skid, twin, echo}. `act`: arrive, stand, walk, cannon, charge, jump, down.
var golems: Array = []
var _deny := 0.0
var _next_golem := 0
## (her coming down after her blast jump: her picture's own `land`, until she does anything but stand: figure.ts sinceLand)
var land_t := -1.0
## HER TREE (game/talents.ts TINKERER_TREE; game.ts brewVial, vialBursts, clusterOf, brewOn, blastLands, golemPounds, shrapnel,
## overdrive, digGold; TINKER_TUNE.talents): her vials thrown (The Big One's count); her puddles of tar ({x, y, r, t}); whether a
## vial of hers is bursting now (Alchemy: what it kills drops gold).
var vials_thrown := 0
var tars: Array = []
var brewing := false
## HER TREE'S CONTRAPTION (game.ts throwContraption, updateTinkerer, lobVial, contraptionBolt, boltStrikes; TINKER_TUNE.contraption):
## her tap sets one down in her Vial Toss's place, three at once; set up, it lobs her little bombs or fires bolts of energy, her
## pick, at what comes near. Each {id, x0, y0, x, y, t, next, shot_age, fx, fy, broke, echo, woke, skill, frac}.
var contraptions: Array = []
var _next_con := 0


func _T() -> Dictionary:
	return Talents.D["tinkerTalents"]


## (game.ts brewVial) What her tree puts in a vial leaving her hand: The Big One, every fifth a big one; Mad Mixture, a brew.
func _brew(v: Dictionary) -> void:
	# (UNIQUE ITEMS: the Sticky Wrench, her vials stick to what they hit and burst a moment later, twice as wide)
	if h.uniques != null and h.uniques.wears("stickywrench") and not v.get("bomb", false):
		v["sticky"] = true
	if h.has("thebigone"):
		vials_thrown += 1
		if _big_now(int(_T()["bigOne"]["every"])):
			v["big"] = true
	if h.has("madmixture"):
		v["brew"] = ["burn", "freeze", "poison"][randi() % 3]


## (The Big One) Whether the vial just thrown is a big one: every `every`th; with BIG_ONE_WAIT, no sooner than BIG_ONE_SECS after the
## last (the one owed comes with the first vial after the wait).
func _big_now(every: int) -> bool:
	if not BIG_ONE_WAIT:
		return vials_thrown % every == 0
	_since_big += 1
	if _since_big >= every and h._clock - _big_at >= BIG_ONE_SECS:
		_since_big = 0
		_big_at = h._clock
		return true
	return false


func _init(hero) -> void:
	super(hero, "tinkerer")
	G = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/golem.json"))
	TT = G["tune"]
	GT = TT["golem"]
	RK = G["rocket"]


func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_deny = maxf(0.0, _deny - dt)
	if land_t >= 0.0:
		land_t += dt
	return super(dt, way, hooked)


## (lock.ts placedAim) Her vial aimed at an enemy for her goes where it will be as it comes down.
func _aim(reach: float, kind := "", which := -1) -> Vector2:
	# (on a phone, where the thumb or the aim help put it, as for any move: kit.gd)
	var touched: bool = (which >= 0 and h.touch_aim.has(which)) or (which == -1 and h.touch_aim.has(0))
	if kind == "vialtoss" and not touched and not (Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)) and h.monsters != null:
		var m = h.monsters.nearest(h.world, reach)
		if m != null:
			return _lead(m, float(Words.data()["skills"]["vialtoss"]["windup"]) + float(TT["toss"]["flight"]))
	return super(reach, kind, which)


func _shake(amount: float) -> void:
	if h.fx != null and is_instance_valid(h.fx):
		h.fx.kick(amount)


func _sfx(name: String, vol: float) -> void:
	h.sfx.play(name, linear_to_db(vol))


func _open(p: Vector2) -> bool:
	return h.map != null and h.map.open_at(floori(p.x), floori(p.y))


## (where a Golem may stand: room for its body on the walk grid (monsters.gd clear: props, slanted walls, water and pits kept
## out), not open ground alone, which is the test for sight: set down by that it stood in walls, crates and water, and fired
## from there; the bug hunt's fifth round, 25 Nov 2026)
const GOLEM_R := 0.3


func _stands(p: Vector2) -> bool:
	if h.monsters == null or not is_instance_valid(h.monsters):
		return _open(p)
	return h.monsters.clear(p.x, p.y, GOLEM_R)


## A place by `p` a Golem may stand: `p`, else the middle of the nearest tile round it with room, in her sight; else where she is.
func _stand_near(p: Vector2) -> Vector2:
	if _stands(p):
		return p
	for r in range(1, 5):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var q := Vector2(floori(p.x) + dx + 0.5, floori(p.y) + dy + 0.5)
				if _stands(q) and (h.monsters == null or h.monsters.sees(h.world, q)):
					return q
	return h.world


# =====================================================================================================================
# WHAT HER MOVES SEND (game.ts deliver)

func _deliver(i: int, from: Vector2, to: Vector2, frac: float, primary: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var way := to - from
	way = way / way.length() if way.length() >= 0.01 else h.face
	var each: float = frac * float(r["count_dmg"])
	var echo := not primary
	var kind := str(def["kind"])
	# (a Contraption refused, three standing and none past its first shot, is no use: no boons, no words that answer a use, not
	# counted; the bug hunt's fifth round, 25 Nov 2026)
	if primary and kind == "contraption" and _contraption_refused():
		h.uses[i] = maxi(0, h.uses[i] - 1)
		return
	h._cast(i, kind, from, way, echo)
	if primary:
		h._time_word_sound(i)
	if kind == "vialtoss":
		for k in (1 if echo else int(r["count"])):
			_toss_vial(i, from, to, each, k, echo)
	elif kind == "golem":
		# (the first whistle brings her Golem out; each after has it charge its big shot. Twin, a second shot after the first; "of
		# Echoes", a weaker one after that: each Golem charging keeps it for when it fires)
		if not echo:
			_whistle(i, to, each, int(r["count"]))
			_scrip(i)
		else:
			for g in _up():
				if g["act"] == "charge" and not g["did"]:
					g["echo"] = each
	elif kind == "contraption":
		# (a Contraption thrown down where she aimed, no further than its range; "of Echoes", the newest one lobs a weaker shot
		# with its first)
		if echo:
			var up := contraptions.filter(func(q): return float(q["broke"]) < 0.0)
			if not up.is_empty():
				up.back()["echo"] = each
		else:
			_throw_contraption(i, from, to, each)
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, kind, from, way, again)
	# (its boons and the last words': kit.gd _used)
	if primary:
		_used(i, from, way, frac, true)


## (game.ts tossVial) A vial lobbed from her hand to where she aimed (`n` the how-manyth of Twin's, each further to one side).
func _toss_vial(i: int, from: Vector2, to: Vector2, frac: float, n: int, echo: bool) -> void:
	var T: Dictionary = TT["toss"]
	var p := _reach_point(to, float(_def(i)["range"]))
	var far := p.distance_to(from)
	if far <= 0.0:
		far = 1.0
	var side := 0.0 if n == 0 else (1.0 if n % 2 == 1 else -1.0) * ceilf(n / 2.0) * float(T["twin"])
	var x1 := p.x - ((p.y - from.y) / far) * side
	var y1 := p.y + ((p.x - from.x) / far) * side
	var v := {"x0": from.x, "y0": from.y, "x1": x1, "y1": y1, "t": 0.0, "flight": float(T["flight"]), "skill": i, "frac": frac, "wake": n == 0 and not echo, "n": n}
	_brew(v)
	vials.append(v)
	_say({"t": "vial", "id": -1, "x0": from.x, "y0": from.y, "x1": x1, "y1": y1, "flight": float(T["flight"]), "n": n, "echo": echo, "big": v.get("big", false)})
	if n == 0:
		_sfx("vial", 0.3 if echo else 0.5)
	# (UNIQUE ITEMS: the Foreman's Wrench, whenever she tosses a vial each of her Golems lobs one as well, at the same spot)
	if n == 0 and not echo and h.uniques != null and h.uniques.wears("foremanswrench"):
		for g in _up():
			if g["act"] == "arrive":
				continue
			var gv := {"x0": float(g["x"]), "y0": float(g["y"]), "x1": x1, "y1": y1, "t": 0.0, "flight": float(T["flight"]), "skill": i,
				"frac": frac * float(h.uniques.ut["foreman"]["share"]), "wake": false, "foreman": true}
			_brew(gv)
			vials.append(gv)
			_say({"t": "vial", "id": -1, "x0": g["x"], "y0": g["y"], "x1": x1, "y1": y1, "flight": float(T["flight"]), "n": 0, "big": gv.get("big", false)})
			h.uniques._say({"id": "foremanswrench", "what": "lob"})


## (game.ts vialBursts) A vial of hers bursting where it comes down, hurting all within the move's radius.
func _vial_bursts(v: Dictionary) -> void:
	var T := _T()
	var i: int = v["skill"]
	var rad: float = float(_def(i)["radius"]) * float(h.loadout.r(i)["size"])
	var little: bool = v.get("little", false)
	var big: bool = v.get("big", false)
	var brew: String = v.get("brew", "")
	# (UNIQUE ITEMS: the Sticky Wrench, twice as wide)
	if v.get("sticky", false) and h.uniques != null:
		rad *= float(h.uniques.ut["sticky"]["wide"])
	# (CLUSTER VIALS: a little one bursts smaller; THE BIG ONE, three times as wide)
	if little:
		rad *= float(T["cluster"]["size"])
	if big:
		rad *= float(T["bigOne"]["wide"])
	var at := Vector2(v["x1"], v["y1"])
	_say({"t": "vialBurst", "x": at.x, "y": at.y, "r": rad, "little": little, "big": big, "brew": brew, "bomb": v.get("bomb", false)})
	_sfx("shatter", 0.2 if little else 0.35)
	if big:
		_shake(4.0)
		_sfx("slam", 0.8)
	# (what it bursts on, for what her tree does to them after)
	var caught: Array = []
	if brew != "" or big:
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and not h.monsters.shut_in(m) and m.world.distance_to(at) <= rad + m.r:
				caught.append(m)
	# (ALCHEMY: what it kills drops gold)
	brewing = true
	# (TWIN: the how-manyth vial of its use, as hard as the melds of Twin make it: melds52_rules.gd blow)
	var bk: float = h.m52.blow(i, int(v.get("n", 0))) if h.m52 != null else 1.0
	h._blast(i, at, rad, float(v["frac"]) * bk, "vial", bool(v["wake"]), linear_to_db(0.8))
	brewing = false
	# (MAD MIXTURE: its brew on top of its own words, on what it burst on)
	if brew != "":
		_brew_on(caught, brew, i, float(v["frac"]))
	# (THE BIG ONE: everything it burst on knocked down)
	if big:
		for m in caught:
			if is_instance_valid(m) and not m.dead:
				m.throw_from(at, float(T["bigOne"]["far"]), 0.2)
				m.stun_for(float(T["bigOne"]["down"]), "", true)
	# (TAR: a puddle of it left where it burst)
	if not little and h.has("tar"):
		var tr: float = rad * float(T["tar"]["size"])
		tars.append({"x": at.x, "y": at.y, "r": tr, "t": 0.0})
		_say({"t": "tar", "x": at.x, "y": at.y, "r": tr, "secs": T["tar"]["secs"]})
	# (GROWTH SERUM: bursting by her Golem, it makes it grow)
	if h.has("growthserum"):
		for g in _up():
			if Vector2(g["x"], g["y"]).distance_to(at) <= rad + golem_body(g) + float(T["growth"]["near"]):
				_grow(g)
	# (CLUSTER VIALS: it bursts into three little ones that bounce out and burst again)
	if not little and h.has("clustervials"):
		_cluster_of(v)


## (Cluster Vials) Vial `v`, bursting, breaks into little ones that bounce out round it (a wall stops one short).
func _cluster_of(v: Dictionary) -> void:
	var K: Dictionary = _T()["cluster"]
	var a0 := randf() * TAU
	var c := Vector2(v["x1"], v["y1"])
	for n in int(K["n"]):
		var a := a0 + float(n) / float(K["n"]) * TAU
		var far: float = K["far"]
		while far > 0.0 and not _open(c + Vector2(cos(a), sin(a)) * far):
			far = maxf(0.0, far - 0.25)
		var e := c + Vector2(cos(a), sin(a)) * far
		var l := {"x0": c.x, "y0": c.y, "x1": e.x, "y1": e.y, "t": 0.0, "flight": float(K["flight"]), "skill": v["skill"], "frac": float(v["frac"]) * float(K["share"]), "wake": false, "little": true}
		if v.get("brew", "") != "":
			l["brew"] = v["brew"]
		vials.append(l)
		_say({"t": "vial", "id": -1, "x0": c.x, "y0": c.y, "x1": e.x, "y1": e.y, "flight": float(K["flight"]), "n": n, "little": true})


## (Mad Mixture) A vial's brew on those it burst on: burning, freezing (a chill: on one chilled already, frozen) or poisoning.
func _brew_on(ms: Array, brew: String, i: int, frac: float) -> void:
	var X: Dictionary = _T()["mixture"]
	var r: Dictionary = h.loadout.r(i)
	var base: Array = h.base_for(r["element"])
	var hit: float = (float(base[0]) + float(base[1])) / 2.0 * float(r["dmg_mult"]) * frac
	for m in ms:
		if not is_instance_valid(m) or m.dead:
			continue
		match brew:
			"burn":
				m.set_alight(hit * float(X["burn"]) / 3.0, 3.0)
			"freeze":
				m.chill_by(float(X["chill"]))
			_:
				var secs: float = Words.data()["poison"]["time"]
				m.dose(hit * float(X["poison"]) / secs, secs)


## (Tar) What walks in a puddle of hers moves at a crawl: this share of its speed (1 in none). A bat flies over it.
func tar_k(m) -> float:
	if m.kind == "bat":
		return 1.0
	for p in tars:
		if m.world.distance_to(Vector2(p["x"], p["y"])) <= float(p["r"]) + m.r * 0.5:
			return float(_T()["tar"]["crawl"])
	return 1.0


# =====================================================================================================================
# HER BLAST JUMP (game.ts useEvasive, blastLands)

func _use_evasive(at: Vector2, way: Vector2) -> void:
	var def := _def(2)
	at = _evasive_at(at, way)
	if charges[2] < 1:
		return
	# (ABILITIES: MANA: not without the mana for it: game.ts useEvasive, noMana)
	if h.mana < float(h.loadout.r(2)["mana"]):
		h.no_mana()
		return
	var land := _reach_point(at, float(def["range"]))
	if land.distance_to(h.world) < 0.5:
		if _deny <= 0.0:
			_deny = 0.8
			h.sfx.play("deny")
			h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "No room", "color": "#8c8090"})
		return
	_pay_evasive()
	_face(at)
	land_t = -1.0
	var r: Dictionary = h.loadout.r(2)
	var x0: Vector2 = h.world
	var dir: Vector2 = (at - x0).normalized() if at.distance_to(x0) > 0.0 else h.face
	h._cast(2, "blastjump", x0, dir)
	h._boons(2)
	h._time_word_sound(2)
	h.last.dodge_surge(x0)
	var rad: float = float(def["radius"]) * float(r["size"])
	_say({"t": "blastJump", "x0": x0.x, "y0": x0.y, "x1": land.x, "y1": land.y, "r": rad})
	_shake(3.0)
	_sfx("slam", 0.9)
	var bomb := func(k: int, share: float, echoed: bool) -> void:
		h._blast(2, x0, rad, share, "bomb", k == 0 and not echoed, linear_to_db(0.8), k, echoed)
		if h.monsters != null:
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and m.world.distance_to(x0) <= rad + m.r:
					m.throw_from(x0, float(TT["blast"]["throw"]), 0.25)
	for k in int(r["count"]):
		if k == 0:
			bomb.call(0, float(r["count_dmg"]), false)
		else:
			_after(0.22 * k, func() -> void: bomb.call(k, float(h.loadout.r(2)["count_dmg"]), false))
	if float(r["echo"]) > 0.0:
		h._echo_of(2, "blastjump", x0, dir, func() -> void: bomb.call(0, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]), true))
	var secs: float = TT["blast"]["secs"]
	move = {"kind": "blast", "from": x0, "to": land, "t": 0.0, "dur": secs}
	h._act = "lunge"
	if h.move_safe():
		h._invuln = maxf(h._invuln, secs + 0.1)
	# (UNIQUE ITEMS: the Tow Line, her Golems ride the jump with her; the Company Scrip, no cooldown, for gold)
	if h.uniques != null and h.uniques.wears("towline"):
		_tow_ride(x0, land)
	_scrip(2)


func _move_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
	if h.move_safe():
		h._invuln = maxf(h._invuln, 0.06)
	var k := clampf(float(move["t"]) / float(move["dur"]), 0.0, 1.0)
	h.world = (move["from"] as Vector2).lerp(move["to"], k)
	_anim_t += dt
	if k >= 1.0:
		move = {}
		h._act = ""
		_anim_t = 0.0
		# (her coming down: a thud of dust where she lands)
		_say({"t": "blastLand", "x": h.world.x, "y": h.world.y})
		land_t = 0.0
		# (UNIQUE ITEMS: the Tow Line, a Golem that did not ride her jump pounds where it stands as she lands)
		if h.uniques != null and h.uniques.wears("towline"):
			for g in _up():
				if g.get("towed", false) or g["act"] == "jump":
					continue
				_pounds(int(g["skill"]), Vector2(g["x"], g["y"]), float(h.loadout.r(int(g["skill"]))["count_dmg"]) * float(h.uniques.ut["tow"]["share"]), 0, false, g)
		# (her tree's BOMBS AWAY: a second bomb goes off where she lands)
		if h.has("bombsaway"):
			var B: Dictionary = _T()["bombsAway"]
			var r2: Dictionary = h.loadout.r(2)
			var rad: float = float(_def(2)["radius"]) * float(r2["size"]) * float(B["size"])
			var x1: Vector2 = h.world
			_say({"t": "bombsAway", "x": x1.x, "y": x1.y, "r": rad})
			_shake(3.0)
			_sfx("slam", 0.9)
			h._blast(2, x1, rad, float(r2["count_dmg"]) * float(B["share"]), "bomb", false, linear_to_db(0.8))
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and m.world.distance_to(x1) <= rad + m.r:
					m.throw_from(x1, float(TT["blast"]["throw"]), 0.25)


# =====================================================================================================================
# HER GOLEM (game.ts whistle, holdJump, golemPounds, stepGolem, stepRocket)

## Her Golems out and not winding down.
func _up() -> Array:
	return golems.filter(func(g): return g["act"] != "down")


## (game.ts golemSpot) Where Golem `seat` keeps by her, `back` behind her: at her one side.
func _golem_spot(seat: int, back: float) -> Vector2:
	var side := 1.2 if seat == 0 else (-1.2 if seat == 1 else 0.0)
	if seat >= 2:
		back += 1.3
	return Vector2(h.world.x - h.face.y * side - h.face.x * back, h.world.y + h.face.x * side - h.face.y * back)


func _wind_down(g: Dictionary) -> void:
	g["act"] = "down"
	g["act_t"] = 0.0
	_say({"t": "golemDown", "x": g["x"], "y": g["y"]})


func _golem_idle(g: Dictionary) -> void:
	g["act"] = "stand"
	g["act_t"] = 0.0
	g["did"] = false


## (game.ts golemFrac) What a Golem's hits come to: her tap and hold's hit, as its blows share it.
func _golem_frac(g: Dictionary) -> float:
	return float(h.loadout.r(int(g["skill"]))["count_dmg"])


func _turn_golem(g: Dictionary, to: Vector2) -> void:
	var d := to - Vector2(g["x"], g["y"])
	if d.length() > 0.05:
		g["fx"] = d.x / d.length()
		g["fy"] = d.y / d.length()


## (game.ts whistle) Her tap and hold: her Golem whistled out beside her; or, out already (his word: it only shoots), each braces
## and charges its big shot at where she points, firing as she lets go (one charging or firing already goes on with it: a held
## button asks again and again). Twin, a second shot after the first.
func _whistle(i: int, to: Vector2, frac: float, count: int) -> void:
	var up := _up()
	# (all she may have out: one; two with her tree's MARK II, the second at her other side)
	if up.size() < golems_most():
		# (the first place free: at her one side, at her other, behind her)
		var seat := 0
		while up.any(func(q): return int(q["seat"]) == seat):
			seat += 1
		var s := _golem_spot(seat, 0.6)
		var p: Vector2 = _stand_near(s)
		# (one winding down is gone as a new one comes)
		golems = up
		_next_golem += 1
		golems.append({"id": _next_golem, "x": p.x, "y": p.y, "fx": h.face.x, "fy": h.face.y, "act": "arrive", "act_t": 0.0, "did": false, "target": null, "ax": p.x, "ay": p.y,
			"cannon_cd": 0.0, "jump_cd": 0.0, "walked": 0.0, "skill": i, "seat": seat, "jx": p.x, "jy": p.y, "twin": 0, "echo": 0.0, "grow_t": 0.0, "over_t": 0.0,
			"zap_t": float(_T()["tesla"]["every"]), "held": -1.0, "ch_frac": frac, "skid": 0.0})
		golems.sort_custom(func(a, b): return int(a["seat"]) < int(b["seat"]))
		_say({"t": "golemArrive", "x": p.x, "y": p.y})
		_shake(2.0)
		_sfx("whistle", 0.7)
		_sfx("slam", 0.6)
		_overdrive()
		return
	for g in up:
		# (nor one in its rocket jump: it charged in mid-air where it was, its tow mark left on; the bug hunt's fifth round)
		if g["act"] == "charge" or g["act"] == "jump":
			continue
		var d: Vector2 = to - Vector2(g["x"], g["y"])
		if d.length() > 0.3:
			g["fx"] = d.x / d.length()
			g["fy"] = d.y / d.length()
		g["act"] = "charge"
		g["act_t"] = 0.0
		g["did"] = false
		g["skill"] = i
		g["ax"] = to.x
		g["ay"] = to.y
		g["held"] = -1.0
		g["ch_frac"] = frac
		g["skid"] = 0.0
		g["twin"] = count
		g["echo"] = 0.0
		_say({"t": "golemCharge", "x": g["x"], "y": g["y"]})
	_sfx("slam", 0.4)
	_overdrive()


## (game.ts towRide) THE TOW LINE: her Golems ride her Blast Jump, each to its own side of where she comes down, landing in a ground
## pound.
func _tow_ride(x0: Vector2, x1: Vector2) -> void:
	var d := x0.distance_to(x1)
	var u: Vector2 = (x1 - x0) / d if d > 0.01 else h.face
	for g in _up():
		if g["act"] == "jump" or g["act"] == "charge":
			continue
		var seat: int = g["seat"]
		var side := 1.2 if seat == 0 else (-1.2 if seat == 1 else 0.0)
		var back := 0.6 + (1.3 if seat >= 2 else 0.0)
		var to := Vector2(x1.x - u.y * side - u.x * back, x1.y + u.x * side - u.y * back)
		if not _open(to):
			to = x1
		var gat := Vector2(g["x"], g["y"])
		if gat.distance_to(to) < 1.0:
			continue
		_turn_golem(g, to)
		g["jx"] = gat.x
		g["jy"] = gat.y
		g["ax"] = to.x
		g["ay"] = to.y
		g["act"] = "jump"
		g["act_t"] = (float(RK["blast"]) - 1.0) / 30.0
		g["did"] = false
		g["towed"] = true
		h._tell({"t": "unique", "id": "towline", "what": "ride", "x": gat.x, "y": gat.y, "x1": to.x, "y1": to.y})
		h.uniques._say({"id": "towline", "what": "ride"})


## (game.ts scrip) THE COMPANY SCRIP: her whistle or her Blast Jump, just used, has no cooldown, for gold; without the gold, its
## cooldown as ever.
func _scrip(i: int) -> void:
	if h.uniques == null or not h.uniques.wears("companyscrip"):
		return
	var L = h.monsters.loot if h.monsters != null else null
	if L == null:
		return
	var cost: int = maxi(1, roundi(float(h.uniques.ut["scrip"]["gold"]) * maxf(1.0, float(L.power()))))
	if L.gold < cost:
		return
	L.gold -= cost
	charges[i] = max_charges[i]
	cd[i] = 0.0
	h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "-%d gold" % cost, "color": "#ffd27a"})
	h.uniques._say({"id": "companyscrip", "what": "paid", "gold": cost})


## (game.ts armOf) The arm on her Golem: its cannon; with her tree's GUN ARM, the tesla coil (his word of 21 Nov 2026: the node
## swaps the cannon for the coil, no pick).
func arm_of() -> String:
	return "tesla" if h.has("gunarm") else "cannon"

## (game.ts golemsMost) How many Golems she may have out at once: one; two with her tree's MARK II.
func golems_most() -> int:
	# (UNIQUE ITEMS: the Second Whistle, one more than she would have, at full strength)
	var more: int = int(h.uniques.ut["whistle"]["more"]) if h.uniques != null and h.uniques.wears("secondwhistle") else 0
	return (int(_T()["markII"]) if h.has("markii") else 1) + more


## (GROWTH SERUM, game.ts growGolem) Golem `g` grows, twice as big and twice as strong, for a while.
func _grow(g: Dictionary) -> void:
	if float(g.get("grow_t", 0.0)) <= 0.0:
		_say({"t": "golemGrow", "x": g["x"], "y": g["y"]})
	g["grow_t"] = float(_T()["growth"]["secs"])


## (game.ts golemBody) How far Golem `g`'s body reaches from its middle (grown, twice as far).
func golem_body(g) -> float:
	return 0.5 * (float(_T()["growth"]["big"]) if g != null and float(g.get("grow_t", 0.0)) > 0.0 else 1.0)


## (game.ts golemMight) How many times as strong Golem `g` is (grown, twice).
func golem_might(g) -> float:
	return float(_T()["growth"]["strong"]) if g != null and float(g.get("grow_t", 0.0)) > 0.0 else 1.0


## (render.ts drawTinkerers) How big Golem `g` is drawn: twice grown, growing and shrinking back over a quarter of a second.
func golem_grow(g: Dictionary) -> float:
	var GS: Dictionary = _T()["growth"]
	var gt: float = g.get("grow_t", 0.0)
	if gt <= 0.0:
		return 1.0
	return 1.0 + (float(GS["big"]) - 1.0) * clampf(minf((float(GS["secs"]) - gt) / 0.25, gt / 0.25), 0.0, 1.0)


## (Overdrive) Her whistle sends her Golems into overdrive: they move and strike twice as fast for five seconds.
func _overdrive() -> void:
	if not h.has("overdrive"):
		return
	for g in _up():
		if float(g.get("over_t", 0.0)) <= 0.0:
			_say({"t": "overdrive", "x": g["x"], "y": g["y"]})
		g["over_t"] = float(_T()["overdrive"]["secs"])


## (game.ts golemPounds) Its rocket jump's landing at `at`, its fist slam: everything within the move's radius struck and thrown.
## (Its ground pound on her whistle is gone, his word: its big shot in its place.)
func _pounds(i: int, at: Vector2, frac: float, n: int, echo: bool, _g = null) -> void:
	var rad: float = float(_def(i)["radius"]) * float(h.loadout.r(i)["size"])
	_shake(2.5 if n > 0 or echo else 5.0)
	_sfx("slam", 0.6 if n > 0 or echo else 1.0)
	# (GROWTH SERUM: grown, it strikes twice as hard)
	h._blast(i, at, rad, frac * (golem_might(_g) if _g != null else 1.0), "pound", n == 0 and not echo, linear_to_db(0.8), n, echo)
	if h.monsters != null:
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= rad + m.r:
				m.throw_from(at, 1.2, 0.2)


## (game.ts stepCharge, HER TREE'S GUN ARM in the game; every Golem's in the port) Golem `g` charging its big shot, each step.
## Braced and charging while she holds (its aim on where she points), held at its full; let go, it fires once braced (the
## cannon's shell, the tesla coil's beam), as strong as she held it, thrown back by its own shot; then it winds down.
func _step_charge(g: Dictionary, gdt: float) -> void:
	var C: Dictionary = GT["charge"]
	var kind := "beam" if arm_of() == "tesla" else "shell"
	if float(g["held"]) < 0.0:
		# (still held: its aim follows her finger)
		var hold := _holding()
		if hold:
			var at := _aim(99.0)
			var d := at.distance_to(Vector2(g["x"], g["y"]))
			if d > 0.3:
				g["ax"] = at.x
				g["ay"] = at.y
				g["fx"] = (at.x - float(g["x"])) / d
				g["fy"] = (at.y - float(g["y"])) / d
		if not hold or float(g["act_t"]) >= float(C["most"]):
			g["held"] = minf(float(g["act_t"]), float(C["most"]))
		return
	var fire_t := maxf(float(C["build"]), float(g["held"]))
	var power := minf(1.0, float(g["held"]) / float(C["build"]))
	if not g["did"] and float(g["act_t"]) >= fire_t:
		g["did"] = true
		_charged_shot(g, kind, power, float(g["ch_frac"]))
		# (Twin: a second shot a moment after; "of Echoes": a weaker one after those)
		var aim := Vector2(g["ax"], g["ay"])
		for k in range(1, maxi(1, int(g["twin"]))):
			_after(0.22 * k, func() -> void:
				if g["act"] != "down" and golems.has(g):
					_charged_shot(g, kind, power, float(g["ch_frac"]), aim))
		var echo: float = g.get("echo", 0.0)
		if echo > 0.0:
			_after(0.22 * maxi(1, int(g["twin"])), func() -> void:
				if g["act"] != "down" and golems.has(g):
					_charged_shot(g, kind, power, echo, aim))
	# (thrown back by its own shot, easing to a stop: the art's chargeSkid)
	if g["did"]:
		var k := minf(1.0, (float(g["act_t"]) - fire_t) / ((12.0 if kind == "shell" else 18.0) / 30.0))
		var want: float = float(C["skid"][kind]) * (1.0 - pow(1.0 - k, 3.0) if kind == "shell" else 1.0 - pow(1.0 - k, 2.0))
		var stp: float = want - float(g["skid"])
		if stp > 0.0:
			var was := Vector2(g["x"], g["y"])
			var now: Vector2 = h.map.slide(was, 0.45, Vector2(-float(g["fx"]), -float(g["fy"])) * stp)
			g["x"] = now.x
			g["y"] = now.y
			var moved := now.distance_to(was)
			g["skid"] = float(g["skid"]) + moved + (stp if moved < stp * 0.5 else 0.0)
	if float(g["act_t"]) >= fire_t + float(C["shellEnd" if kind == "shell" else "beamEnd"]):
		g["held"] = -1.0
		g["skid"] = 0.0
		_golem_idle(g)


## (game.ts chargedShot) Golem `g` fires its big shot (`power` 0 to 1: how long she held it), `frac` of her tap and hold's hit; at
## `aim` (where it aimed as it fired, for Twin's and the echo's; else where it aims now).
func _charged_shot(g: Dictionary, kind: String, power: float, frac: float, aim = null) -> void:
	var C: Dictionary = GT["charge"]
	var might: float = frac * golem_might(g) * (float(C["least"]) + (1.0 - float(C["least"])) * power)
	var i: int = g["skill"]
	var at := Vector2(g["x"], g["y"])
	_shake(3.0 + 3.0 * power)
	if kind == "shell":
		var to: Vector2 = aim if aim != null else Vector2(g["ax"], g["ay"])
		var flight: float = at.distance_to(to) / float(C["speed"])
		var r: float = float(C["blast"]) * (float(C["blastLeast"]) + (1.0 - float(C["blastLeast"])) * power)
		_say({"t": "golemCharged", "kind": kind, "x0": at.x, "y0": at.y, "x1": to.x, "y1": to.y, "flight": flight, "r": r, "power": power})
		_sfx("explode", 0.6)
		_after(flight, func() -> void:
			_sfx("explode", 0.9)
			h._blast(i, to, r, might * float(C["shell"]), "bomb", true, linear_to_db(0.8))
			if h.has("shrapnel"):
				_shrapnel(i, to, might * float(C["shell"]), null)
			_prospect(to, g))
		_rod(g)
		return
	# (the beam: everything along it before it, once, out to its length or the wall)
	var f := Vector2(g["fx"], g["fy"])
	if aim != null and (aim as Vector2).distance_to(at) > 0.3:
		f = ((aim as Vector2) - at).normalized()
	var len := 0.6
	while len < float(C["beam"]):
		if not _open(at + f * len):
			break
		len += 0.1
	var end := at + f * len
	_say({"t": "golemCharged", "kind": kind, "x0": at.x, "y0": at.y, "x1": end.x, "y1": end.y, "flight": 0.0, "r": float(C["wide"]) / 2.0, "power": power})
	_sfx("zap", 1.0)
	var hits := 0
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m):
			continue
		var d: Vector2 = m.world - at
		var along := d.dot(f)
		var side := absf(-d.x * f.y + d.y * f.x)
		if along < 0.0 or along > len + m.r or side > float(C["wide"]) / 2.0 + m.r:
			continue
		h.hit_monster(m, i, might * float(C["beamShare"]), hits >= 4)
		hits += 1
	_prospect(end, g)
	_rod(g)


## (LIGHTNING ROD, his word: after its big shot, as it was after its ground pound) For a while every enemy near the Golem goes after
## it instead of her.
func _rod(g: Dictionary) -> void:
	if not h.has("lightningrod") or h.monsters == null:
		return
	var R: Dictionary = _T()["rod"]
	for q in h.monsters.decoys:
		if q.get("golem") == g:
			q["t"] = float(R["secs"])
			return
	h.monsters.decoys.append({"x": g["x"], "y": g["y"], "t": float(R["secs"]), "r": float(R["near"]), "size": golem_body(g), "golem": g})


## (PROSPECTOR, his word: its big shot, as its ground pound did) A handful of gold dug up where it lands, between them about one
## gold drop.
func _prospect(at: Vector2, g: Dictionary) -> void:
	# (no gold dug out of a town's floor: her Golems' big shots there dug up gold for nothing, 21 in 18 s; the bug hunt's fifth round)
	if not h.has("prospector") or h.monsters == null or h.monsters.loot == null or h.in_town:
		return
	var piles: int = _T()["prospector"]["n"]
	var all := randi_range(3, 8)
	var p: Vector2 = at if _open(at) else Vector2(g["x"], g["y"])
	for k in piles:
		var share := floori(all / float(piles)) + (1 if k < all % piles else 0)
		if share > 0:
			h.monsters.loot._gold(p, share)


## (game.ts teslaCoil, HER TREE'S GUN ARM) The tesla coil on Golem `g`'s back: every second it zaps the enemy nearest it (awake,
## seen), the spark leaping on to two more, each the nearest to the last; lightning, its hit a share of the Golem's.
func _tesla_coil(g: Dictionary, gdt: float) -> void:
	var Z: Dictionary = _T()["tesla"]
	g["zap_t"] = float(g["zap_t"]) - gdt
	if float(g["zap_t"]) > 0.0 or h.monsters == null:
		return
	var hit: Array = []
	var from := Vector2(g["x"], g["y"])
	var reach: float = GT["zapFar"]
	for n in int(Z["leaps"]) + 1:
		var best = null
		var bd := reach
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or not m.seen or m.state == "sleep" or m.state == "rise" or h.monsters.shut_in(m) or hit.has(m):
				continue
			var d: float = m.world.distance_to(from)
			if d <= bd and h.monsters.sees(from, m.world):
				bd = d
				best = m
		if best == null:
			break
		hit.append(best)
		from = best.world
		reach = Z["jump"]
	# (nothing near: it looks again shortly)
	if hit.is_empty():
		g["zap_t"] = 0.2
		return
	g["zap_t"] = float(Z["every"])
	var e := {"t": "teslaZap", "x": g["x"], "y": g["y"], "to": hit.map(func(m): return {"x": m.world.x, "y": m.world.y})}
	if float(g.get("grow_t", 0.0)) > 0.0:
		e["grown"] = true
	_say(e)
	_sfx("zap", 0.4)
	# (a zap of lightning, her hit as the Golem's shots share it, and as her talents make it; not her words)
	var i: int = g["skill"]
	var r: Dictionary = h.loadout.r(i)
	var frac: float = _golem_frac(g) * golem_might(g) * float(Z["share"])
	var base: Array = h.base_for("lightning")
	for m in hit:
		var dmg: float = randf_range(base[0], base[1]) * float(r["dmg_mult"]) * frac * (1.0 + (float(h.stats["dmg_pct"]) + float(h.stats.get("light_pct", 0.0)) + h.might) / 100.0)
		m.damage(h.side(m, dmg, i), "lightning", false, false, [], false, false, i)

## (game.ts updateTinkerer) Her vials in the air, and her Golem.
func _step_own(dt: float) -> void:
	_step_contraptions(dt)
	for k in range(vials.size() - 1, -1, -1):
		var v: Dictionary = vials[k]
		v["t"] = float(v["t"]) + dt
		# (UNIQUE ITEMS: the Sticky Wrench: landed, it sticks, to the enemy it landed on if there is one, and goes where that goes)
		if v.get("sticky", false) and not v.has("fuse") and float(v["t"]) >= float(v["flight"]) and h.uniques != null:
			var S: Dictionary = h.uniques.ut["sticky"]
			v["fuse"] = float(S["fuse"])
			var bd: float = float(S["grab"])
			if h.monsters != null:
				for m in h.monsters.list:
					# (a body freed this frame is still in the list: asked first whether it is there, as the rest are)
					if not is_instance_valid(m) or m.dead:
						continue
					var dd: float = m.world.distance_to(Vector2(v["x1"], v["y1"])) - m.r
					if not h.monsters.shut_in(m) and dd < bd:
						bd = dd
						v["stuck"] = m
			var sm = v.get("stuck")
			h._tell({"t": "unique", "id": "stickywrench", "what": "stuck", "x": v["x1"], "y": v["y1"], "secs": S["fuse"], "mid": sm.id if sm != null else null})
			h.uniques._say({"id": "stickywrench", "what": "stuck"})
		var sv = v.get("stuck")
		if sv != null and is_instance_valid(sv) and not sv.dead:
			v["x1"] = sv.world.x
			v["y1"] = sv.world.y
		# (her Contraption's little bombs sit a moment where they land before they go off)
		if float(v["t"]) < float(v["flight"]) + float(v.get("fuse", 0.0)):
			continue
		vials.remove_at(k)
		_vial_bursts(v)
	# (more out than she may have, her tree's Mark II undone: the second winds down)
	var up := _up()
	for k in range(golems_most(), up.size()):
		_wind_down(up[k])
	for g in golems.duplicate():
		_step_golem(g, dt)
	# (her Lightning Rod's decoys: each where its Golem is, ending as it winds down; each runs out: game.ts updateDecoys)
	if h.monsters != null:
		for k in range(h.monsters.decoys.size() - 1, -1, -1):
			var d: Dictionary = h.monsters.decoys[k]
			d["t"] = float(d["t"]) - dt
			var g = d.get("golem")
			if g != null and (g["act"] == "down" or not golems.has(g)):
				d["t"] = 0.0
			elif g != null:
				d["x"] = g["x"]
				d["y"] = g["y"]
			if float(d["t"]) <= 0.0:
				h.monsters.decoys.remove_at(k)
	# (her tree's TAR: its puddles dry up)
	for k in range(tars.size() - 1, -1, -1):
		tars[k]["t"] = float(tars[k]["t"]) + dt
		if float(tars[k]["t"]) >= float(_T()["tar"]["secs"]):
			tars.remove_at(k)


## She has fallen (hero.gd steps no kit then): her Golems wind down where they stand, and lie there.
func fallen(dt: float) -> void:
	for g in _up():
		_wind_down(g)
	for c in contraptions:
		_break_contraption(c)
	_step_contraptions(dt)
	for g in golems:
		g["act_t"] = float(g["act_t"]) + dt


## (game.ts stepGolem) Her Golem `g`, each step.
func _step_golem(g: Dictionary, dt: float) -> void:
	# (her tree's OVERDRIVE: it moves and strikes twice as fast, its time `gdt`; and GROWTH SERUM runs out)
	var over: float = g.get("over_t", 0.0)
	var gdt := dt * (float(_T()["overdrive"]["fast"]) if over > 0.0 and g["act"] != "down" else 1.0)
	g["over_t"] = maxf(0.0, over - dt)
	g["grow_t"] = maxf(0.0, float(g.get("grow_t", 0.0)) - dt)
	g["act_t"] = float(g["act_t"]) + gdt
	g["cannon_cd"] = maxf(0.0, float(g["cannon_cd"]) - gdt)
	g["jump_cd"] = maxf(0.0, float(g["jump_cd"]) - gdt)
	var at := Vector2(g["x"], g["y"])
	if g["act"] == "down":
		if float(g["act_t"]) >= float(GT["down"]):
			golems.erase(g)
		return
	# (left far behind, or in another place: whistled up beside her again)
	if at.distance_to(h.world) > float(GT["lost"]) or (not _stands(at) and at.distance_to(h.world) > 0.5):
		var p := _stand_near(_golem_spot(int(g["seat"]), 0.0))
		g["x"] = p.x
		g["y"] = p.y
		g["act"] = "arrive"
		g["act_t"] = 0.0
		g["held"] = -1.0
		_say({"t": "golemArrive", "x": p.x, "y": p.y})
		return
	if g["act"] == "arrive":
		if float(g["act_t"]) >= float(GT["arrive"]):
			_golem_idle(g)
		return
	# (her tree's GUN ARM: its tesla coil zaps the enemy nearest it every second, from range)
	var arm := arm_of()
	if arm == "tesla" and g["act"] != "charge":
		_tesla_coil(g, gdt)
	if g["act"] == "charge":
		_step_charge(g, gdt)
		return
	if g["act"] == "jump":
		_step_rocket(g, gdt)
		return
	var C: Dictionary = GT["cannon"]
	if g["act"] == "cannon":
		# (ITS SMALL SHOT: its cannon brought down and fired at what it fights, the shot flying CANNON.speed tiles a second)
		if not g["did"] and float(g["act_t"]) >= float(C["hit"]):
			g["did"] = true
			_sfx("cannon", 0.8)
			var m = g["target"]
			var live: bool = m != null and is_instance_valid(m) and not m.dead
			var to: Vector2 = m.world if live else Vector2(g["ax"], g["ay"])
			var flight: float = at.distance_to(to) / float(C["speed"])
			_say({"t": "golemShot", "x0": at.x, "y0": at.y, "x1": to.x, "y1": to.y, "flight": flight})
			_shake(1.5)
			_sfx("slam", 0.5)
			var frac: float = _golem_frac(g) * golem_might(g) * float(C["share"])
			var i: int = g["skill"]
			_after(flight, func() -> void:
				var t = m if m != null and is_instance_valid(m) and not m.dead else null
				var l: Vector2 = t.world if t != null else to
				if t != null:
					h.hit_monster(t, i, frac, false)
				# (her tree's SHRAPNEL: the shot bursts where it lands, striking everything near)
				if h.has("shrapnel"):
					_shrapnel(i, l, frac, t))
		if float(g["act_t"]) >= float(C["long"]):
			g["cannon_cd"] = SHOT_WAIT
			_golem_idle(g)
		return
	# STANDING OR WALKING: what to go for, if anything (awake, near her, seen by it)
	var best = null
	var bd := 1e9
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or not m.seen or m.state == "sleep" or m.state == "rise" or h.monsters.shut_in(m):
				continue
			if m.world.distance_to(h.world) > float(GT["leash"]):
				continue
			var d: float = at.distance_to(m.world) - m.r
			if d < bd and h.monsters.sees(at, m.world):
				bd = d
				best = m
	# (its cannon: what it fights within its reach, from any way off (his word: it only shoots))
	if arm == "cannon" and best != null and bd <= float(C["far"]) and float(g["cannon_cd"]) <= 0.0:
		_turn_golem(g, best.world)
		g["act"] = "cannon"
		g["act_t"] = 0.0
		g["did"] = false
		g["target"] = best
		g["ax"] = best.world.x
		g["ay"] = best.world.y
		return
	# (where it goes: it stands off and fires, going no nearer what it fights than its arm reaches; else to her side, a little
	# behind her: Mark II's second at her other side)
	var goal: Vector2
	var stop: float
	var far: float = (float(C["far"]) if arm == "cannon" else float(GT["zapFar"])) - 0.5
	if best != null and bd <= far:
		_turn_golem(g, best.world)
		goal = at
		stop = 1.0
	elif best != null:
		goal = best.world
		stop = far * 0.85 + best.r
	else:
		var side := 1.0 if int(g["seat"]) == 0 else -1.0
		goal = Vector2(h.world.x - h.face.x * 0.8 - h.face.y * float(GT["near"]) * side, h.world.y - h.face.y * 0.8 + h.face.x * float(GT["near"]) * side)
		stop = 0.5
	var d := at.distance_to(goal)
	# (ITS ROCKET JUMP: far from where it is going, and seeing it, it blasts off there)
	var J: Dictionary = GT["jump"]
	if d - stop > float(J["from"]) and float(g["jump_cd"]) <= 0.0 and h.monsters != null and h.monsters.sees(at, goal):
		var u := (goal - at) / d
		var go := minf(float(J["most"]), d - stop)
		var l := at + u * go
		var k := 0
		while k < 8 and not _stands(l):
			l -= u * 0.5
			k += 1
		if _stands(l) and l.distance_to(at) > 2.0:
			_turn_golem(g, goal)
			g["jx"] = at.x
			g["jy"] = at.y
			g["ax"] = l.x
			g["ay"] = l.y
			g["act"] = "jump"
			g["act_t"] = 0.0
			g["did"] = false
			return
	if d > stop:
		var stp := minf(d - stop, float(GT["speed"]) * gdt)
		var r: float = G["radius"]
		# (caught inside something, set free; where it cannot walk straight there, the way round: popOut, wayRound, roundCorner)
		at = _pop_out(at, r)
		var via = _way_round(at, goal, r)
		var v: Vector2 = (via if via != null else goal) - at
		var vd := v.length() if v.length() > 0.0 else 1.0
		var mv := v / vd * stp
		var was := at
		at = h.map.slide(at, r, mv)
		at = _round_corner(at, r, mv, was)
		var went := at.distance_to(was)
		g["x"] = at.x
		g["y"] = at.y
		g["walked"] = float(g["walked"]) + went
		if went > 1e-4:
			_turn_golem(g, goal)
		if g["act"] != "walk":
			g["act"] = "walk"
			g["act_t"] = 0.0
	elif g["act"] != "stand":
		g["act"] = "stand"
		g["act_t"] = 0.0

## (game.ts stepRocket, GOLEM_ROCKET) Its rocket jump by its frames (30 a second from deciding to jump): held where it stands,
## crouched, until ROCKET.blast; the blast there, and it is carried through the air ROCKET.flight frames to where it comes down; its
## landing at ROCKET.land, its fist slam; it stands up again until ROCKET.end.
func _step_rocket(g: Dictionary, gdt: float) -> void:
	var x0 := Vector2(g["jx"], g["jy"])
	var to := Vector2(g["ax"], g["ay"])
	var f := float(g["act_t"]) * 30.0 + 1e-6
	var was := (float(g["act_t"]) - gdt) * 30.0 + 1e-6
	var u := clampf((f - float(RK["blast"])) / float(RK["flight"]), 0.0, 1.0)
	var p := x0.lerp(to, u)
	g["x"] = p.x
	g["y"] = p.y
	var rocket := {"x0": x0.x, "y0": x0.y, "x1": to.x, "y1": to.y, "fx": g["fx"], "fy": g["fy"], "gun": arm_of(), "flight": float(RK["flight"])}
	if was < float(RK["blast"]) and f >= float(RK["blast"]):
		_say({"t": "bombsAway", "x": x0.x, "y": x0.y, "r": 1, "rocket": rocket})
		_shake(1.5)
		_sfx("explode", 0.45)
	if was < float(RK["land"]) and f >= float(RK["land"]):
		_say({"t": "golemArrive", "x": p.x, "y": p.y, "rocket": rocket})
		# (ITS FIST SLAM: it lands as its ground pound strikes)
		_pounds(int(g["skill"]), p, _golem_frac(g), 0, false, g)
		# (UNIQUE ITEMS: the Tow Line's ride is free: its jump's wait set back to none)
		g["jump_cd"] = 0.0 if g.get("towed", false) else float(GT["jump"]["wait"])
		g.erase("towed")
	if f >= float(RK["end"]):
		_golem_idle(g)


# =====================================================================================================================
# HOW IT GETS ROUND THINGS (game.ts popOut, wayRound, clearFor, roundCorner: his words, 3 Nov 2026, of the Golem stuck on things)

const CORNER_SLACK := 0.3
const WAY_ROUND := 14


func _free(x: float, y: float, r: float) -> bool:
	return h.map.fits(x, y, r)


## (game.ts popOut) Caught inside something: set at once on the nearest place within 0.9 where it may stand.
func _pop_out(b: Vector2, r: float) -> Vector2:
	if h.map.fits(b.x, b.y, r, true):
		return b
	var d := 0.05
	while d <= 0.9 + 1e-9:
		for k in 16:
			var a := k / 16.0 * TAU
			var p := b + Vector2(cos(a), sin(a)) * d
			if _free(p.x, p.y, r):
				return p
		d += 0.05
	return b


## (game.ts clearFor) Could a body of radius `r` walk straight from one place to the other?
func _clear_for(a: Vector2, b: Vector2, r: float) -> bool:
	var d := a.distance_to(b)
	var n := maxi(1, ceili(d / 0.2))
	for k in range(1, n + 1):
		var p := a + (b - a) * (float(k) / n)
		if k == n and floori(p.x) == floori(b.x) and floori(p.y) == floori(b.y) and d > 0.5:
			break
		if not _free(p.x, p.y, r):
			return false
	return true


## (game.ts wayRound) Where it could not walk straight to `goal`, the place to walk to next: along the shortest way over the walk
## grid (no farther than WAY_ROUND tiles about it), the farthest of its next few tiles it can walk straight to. null else.
func _way_round(at: Vector2, goal: Vector2, r: float):
	if _clear_for(at, goal, r):
		return null
	var m = h.map
	var sx := floori(at.x)
	var sy := floori(at.y)
	var tx := floori(goal.x)
	var ty := floori(goal.y)
	var R := WAY_ROUND
	if absi(tx - sx) > R or absi(ty - sy) > R:
		return null
	var S := 2 * R + 1
	var prev := PackedInt32Array()
	prev.resize(S * S)
	prev.fill(-2)
	var s0 := R * S + R
	prev[s0] = -1
	var q := PackedInt32Array([s0])
	var found := -1
	var qi := 0
	while qi < q.size() and found < 0:
		var c := q[qi]
		qi += 1
		var cx := (c % S) - R + sx
		var cy := (c / S) - R + sy
		for dd in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var nx: int = cx + dd.x
			var ny: int = cy + dd.y
			if absi(nx - sx) > R or absi(ny - sy) > R or nx < 0 or ny < 0 or nx >= m.w or ny >= m.h:
				continue
			var n := (ny - sy + R) * S + (nx - sx + R)
			if prev[n] != -2:
				continue
			# (the goal's own tile may be where what it fights stands: taken however it lies)
			if not (nx == tx and ny == ty) and not m.walkable(nx, ny):
				continue
			prev[n] = c
			if nx == tx and ny == ty:
				found = n
				break
			q.append(n)
	if found < 0:
		return null
	var path: Array = []
	var c := found
	while c != -1 and c != s0:
		path.append(Vector2((c % S) - R + sx + 0.5, (c / S) - R + sy + 0.5))
		c = prev[c]
	path.reverse()
	if path.is_empty():
		return null
	var next: Vector2 = path[0]
	for k in range(1, mini(path.size(), 8)):
		if _clear_for(at, path[k], r):
			next = path[k]
	return next


## (game.ts roundCorner) A body stopped dead against a corner slips round it, toward the nearest place to one side (no more than
## `r` + CORNER_SLACK) from which the step it wanted could be taken.
func _round_corner(b: Vector2, r: float, d: Vector2, was: Vector2) -> Vector2:
	if b != was:
		return b
	var help := r + CORNER_SLACK
	for along_x in [true, false]:
		var want: float = d.x if along_x else d.y
		var other: float = d.y if along_x else d.x
		if absf(want) < 1e-7 or b != was:
			continue
		var a := Vector2(b.x + want, b.y) if along_x else Vector2(b.x, b.y + want)
		var best := 0.0
		var best_s := INF
		var sides: Array = [signf(other)] if absf(other) > 1e-7 else [1.0, -1.0]
		for side in sides:
			var s := 0.04
			while s <= help + 1e-9:
				var o := Vector2(0.0, side * s) if along_x else Vector2(side * s, 0.0)
				if not _free(b.x + o.x, b.y + o.y, r):
					break
				if not _free(a.x + o.x, a.y + o.y, r):
					s += 0.04
					continue
				if s < best_s:
					best_s = s
					best = side * minf(absf(want), s)
				break
		if best == 0.0:
			continue
		var n := Vector2(b.x, b.y + best) if along_x else Vector2(b.x + best, b.y)
		if _free(n.x, n.y, r):
			b = n
	return b


# =====================================================================================================================
# HER PICTURES (render.ts, figure.ts)

## Her blast jump: her `leap` by how far through it she is; then her coming down (`land`), until she does anything but stand.
func _own_picture(side: int) -> Array:
	if not move.is_empty():
		var n: int = h.art.count(side, 39)
		var k := clampf(float(move["t"]) / float(move["dur"]), 0.0, 1.0)
		return [39, clampi(floori(k * n), 0, maxi(0, n - 1))]
	if land_t >= 0.0:
		var c = C["lists"].get("45")
		var n: int = h.art.count(side, 45)
		if c == null or n == 0 or walked_way.length() > 1e-4 or not attack.is_empty():
			land_t = -1.0
		else:
			var f := floori(land_t * float(c["fps"]) + 1e-6)
			if f < n:
				return [45, f]
			land_t = -1.0
	return []


func _clear_own() -> void:
	vials.clear()
	tars.clear()
	contraptions.clear()
	land_t = -1.0


## (Shrapnel) A burst where the Golem's blow lands: everything near struck for a share of it (game.ts shrapnel).
func _shrapnel(i: int, at: Vector2, frac: float, not_this) -> void:
	var S: Dictionary = _T()["shrapnel"]
	_say({"t": "shrapnel", "x": at.x, "y": at.y, "r": S["r"]})
	_sfx("hit", 0.5)
	var hits := 0
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or m == not_this or h.monsters.shut_in(m) or m.world.distance_to(at) > float(S["r"]) + m.r:
			continue
		h.hit_monster(m, i, frac * float(S["share"]), hits >= 3)
		hits += 1


# =====================================================================================================================
# HER TREE'S CONTRAPTION (game.ts throwContraption, updateTinkerer, lobVial, contraptionBolt, boltStrikes, breakContraption)

func _C() -> Dictionary:
	return TT["contraption"]


## (game.ts contraptionAmmo) What her Contraptions fire, her pick: "bombs" or "energy".
func ammo() -> String:
	var p = h.picks.get("contraptions")
	return "energy" if str(p) == "energy" else "bombs"


## (game.ts throwContraption) Her Contraption thrown from `from` toward `to`: where it comes to rest. A fourth puts the oldest out
## of action, but never one not yet past its first shot (with three such standing, nothing more is thrown: his words of 4 Nov
## 2026, “After taking the passive for contraption, I don’t think the words are working as intended.”).
## (as _throw_contraption refuses one: as many standing as she may have, the oldest not yet past its first shot)
func _contraption_refused() -> bool:
	var C := _C()
	var standing: Array = contraptions.filter(func(q): return float(q["broke"]) < 0.0)
	return standing.size() >= int(C["most"]) and float(standing[0]["t"]) < float(C["set"]) + float(C["first"])


func _throw_contraption(i: int, from: Vector2, to: Vector2, frac: float) -> void:
	var C := _C()
	var reach: float = _def(i)["range"]
	var p := _reach_point(from + h.face * 2.0, reach) if to.distance_to(from) < 0.6 else _reach_point(to, reach)
	var standing: Array = contraptions.filter(func(q): return float(q["broke"]) < 0.0)
	var ready: float = float(C["set"]) + float(C["first"])
	while standing.size() >= int(C["most"]):
		if float(standing[0]["t"]) < ready:
			return
		_break_contraption(standing.pop_front())
	_next_con += 1
	var c := {"id": _next_con, "x0": from.x, "y0": from.y, "x": p.x, "y": p.y, "t": 0.0, "next": float(C["first"]), "shot_age": 9.0,
		"fx": h.face.x, "fy": h.face.y, "broke": -1.0, "echo": 0.0, "woke": false, "skill": i, "frac": frac}
	contraptions.append(c)
	_say({"t": "contraption", "id": c["id"], "x0": from.x, "y0": from.y, "x": p.x, "y": p.y})
	_sfx("trapSet", 0.6)


## (game.ts breakContraption) Put out of action: it falls apart where it stands.
func _break_contraption(c: Dictionary) -> void:
	if float(c["broke"]) >= 0.0:
		return
	c["broke"] = 0.0
	_say({"t": "contraptionEnd", "id": c["id"], "x": c["x"], "y": c["y"]})


## (game.ts updateTinkerer) Her Contraptions, each step: set up, they fire; their time up (LASTING and FLEETING: longer or shorter),
## they fall apart. Her tap's Swift and her Frenzied pace quicken their shots.
func _step_contraptions(dt: float) -> void:
	var C := _C()
	for k in range(contraptions.size() - 1, -1, -1):
		var c: Dictionary = contraptions[k]
		c["t"] = float(c["t"]) + dt
		c["shot_age"] = float(c["shot_age"]) + dt
		if float(c["broke"]) >= 0.0:
			c["broke"] = float(c["broke"]) + dt
			if float(c["broke"]) >= float(C["broke"]):
				contraptions.remove_at(k)
			continue
		var i: int = c["skill"]
		var r: Dictionary = h.loadout.r(i)
		if str(_def(i)["kind"]) != "contraption" or float(c["t"]) >= float(C["set"]) + float(C["life"]) * float(r["last"]) or not h.alive:
			_break_contraption(c)
			continue
		if float(c["t"]) < float(C["set"]):
			continue
		c["next"] = float(c["next"]) - dt
		if float(c["next"]) > 0.0:
			continue
		var energy := ammo() == "energy"
		var shot: bool = _contraption_bolt(c, float(c["frac"])) if energy else _lob_vial(c, float(c["frac"]))
		if shot and float(c["echo"]) > 0.0:
			# ("of Echoes": with its first shot, a weaker one after it)
			var share: float = c["echo"]
			c["echo"] = 0.0
			_after(0.2, func() -> void:
				if float(c["broke"]) < 0.0:
					if energy:
						_contraption_bolt(c, share, true)
					else:
						_lob_vial(c, share, true))
		var pace: float = (float(r["rate"]) if float(r["rate"]) > 0.0 else 1.0) * h.frenzy_pace() * float(r["pace"])
		c["next"] = (float(C["boltEvery"] if energy else C["every"]) / pace) if shot else 0.2


## What is near Contraption `c` for it to fire at (awake, seen, not shut in, in its sight), nearest first, within `reach`.
func _near_con(c: Dictionary, reach: float) -> Array:
	var at := Vector2(c["x"], c["y"])
	var out: Array = []
	if h.monsters == null:
		return out
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or not m.seen or m.state == "sleep" or m.state == "rise" or h.monsters.shut_in(m):
			continue
		if m.world.distance_to(at) <= reach and h.monsters.sees(at, m.world):
			out.append(m)
	out.sort_custom(func(a, b): return a.world.distance_to(at) < b.world.distance_to(at))
	return out


## (game.ts lobVial, its pick BOMBS) A little bomb lobbed out of Contraption `c` at the nearest within its reach (as many as Twin
## says, at as many), aimed where it is going; it goes off a moment after it lands. False, nothing near.
func _lob_vial(c: Dictionary, frac: float, echo := false) -> bool:
	var C := _C()
	var near := _near_con(c, float(C["reach"]))
	if near.is_empty():
		return false
	var count: int = int(h.loadout.r(int(c["skill"]))["count"])
	for n in (1 if echo else count):
		var m = near[mini(n, near.size() - 1)]
		var lead := 0.35 if m.speed > 0.0 and m.state == "chase" else 0.0
		var to: Vector2 = m.world + m.face * lead
		var v := {"x0": c["x"], "y0": c["y"], "x1": to.x, "y1": to.y, "t": 0.0, "flight": float(C["bombFlight"]), "skill": c["skill"], "frac": frac,
			"wake": not c["woke"] and not echo and n == 0, "bomb": true, "fuse": float(C["bombFuse"])}
		if v["wake"]:
			c["woke"] = true
		_brew(v)
		vials.append(v)
		_say({"t": "vial", "id": c["id"], "x0": c["x"], "y0": c["y"], "x1": to.x, "y1": to.y, "flight": float(C["bombFlight"]), "n": n, "echo": echo, "big": v.get("big", false), "bomb": float(C["bombFuse"])})
		var far := (to - Vector2(c["x"], c["y"])).length()
		if far > 0.0:
			c["fx"] = (to.x - float(c["x"])) / far
			c["fy"] = (to.y - float(c["y"])) / far
	c["shot_age"] = 0.0
	_sfx("vial", 0.3 if echo else 0.5)
	return true


## (game.ts contraptionBolt, its pick ENERGY) A bolt of energy at the nearest awake within its reach (Twin: at as many). False,
## nothing near.
func _contraption_bolt(c: Dictionary, frac: float, echo := false) -> bool:
	var C := _C()
	var near := _near_con(c, float(C["boltReach"]))
	if near.is_empty():
		return false
	var count: int = int(h.loadout.r(int(c["skill"]))["count"])
	var i: int = c["skill"]
	for n in (1 if echo else count):
		var m = near[mini(n, near.size() - 1)]
		var d: float = m.world.distance_to(Vector2(c["x"], c["y"]))
		if d == 0.0:
			d = 1.0
		var flight: float = d / float(C["boltSpeed"])
		c["fx"] = (m.world.x - float(c["x"])) / d
		c["fy"] = (m.world.y - float(c["y"])) / d
		_say({"t": "contraptionBolt", "id": c["id"], "x0": c["x"], "y0": c["y"], "x1": m.world.x, "y1": m.world.y, "flight": flight})
		var second := n > 0
		_after(flight, func() -> void:
			if is_instance_valid(m) and not m.dead:
				_bolt_strikes(m, i, frac * float(C["boltShare"]), second, false))
	c["shot_age"] = 0.0
	_sfx("zap", 0.25 if echo else 0.4)
	return true


## (game.ts boltStrikes) Her energy bolt striking `t`, and what her tree's vial talents do with it as with a vial (his words of 6
## Nov 2026: “Why can’t energy do what the bombs do?”): Mad Mixture, The Big One, Tar, Growth Serum, Cluster Vials (it leaps on,
## little ones), Alchemy.
func _bolt_strikes(t, i: int, frac: float, second: bool, little: bool) -> void:
	var T := _T()
	var rad: float = float(_def(i)["radius"]) * float(h.loadout.r(i)["size"])
	if little:
		rad *= float(T["cluster"]["size"])
	var big := false
	if not little and h.has("thebigone"):
		vials_thrown += 1
		big = _big_now(int(T["bigOne"]["every"]))
	var brew := ""
	if h.has("madmixture"):
		brew = ["burn", "freeze", "poison"][randi() % 3]
	var at: Vector2 = t.world
	brewing = true
	h.hit_monster(t, i, frac * float(T["cluster"]["share"]) if little else frac, second)
	if big:
		h._blast(i, at, rad * float(T["bigOne"]["wide"]), frac, "bomb", false, linear_to_db(0.8))
		_shake(4.0)
		_sfx("slam", 0.8)
	brewing = false
	var caught: Array = [t]
	if big:
		caught = []
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and not h.monsters.shut_in(m) and m.world.distance_to(at) <= rad * float(T["bigOne"]["wide"]) + m.r:
				caught.append(m)
	if brew != "":
		_brew_on(caught, brew, i, frac)
	if big:
		for m in caught:
			if is_instance_valid(m) and not m.dead:
				m.throw_from(at, float(T["bigOne"]["far"]), 0.2)
				m.stun_for(float(T["bigOne"]["down"]), "", true)
	if not little and h.has("tar"):
		var tr: float = rad * float(T["tar"]["size"])
		tars.append({"x": at.x, "y": at.y, "r": tr, "t": 0.0})
		_say({"t": "tar", "x": at.x, "y": at.y, "r": tr, "secs": T["tar"]["secs"]})
	if h.has("growthserum"):
		for g in _up():
			if Vector2(g["x"], g["y"]).distance_to(at) <= rad + golem_body(g) + float(T["growth"]["near"]):
				_grow(g)
	if not little and h.has("clustervials"):
		var K: Dictionary = T["cluster"]
		var next: Array = []
		for m in h.monsters.list:
			if m != t and is_instance_valid(m) and not m.dead and not h.monsters.shut_in(m) and m.world.distance_to(at) <= float(K["far"]) + 1.5 and h.monsters.sees(at, m.world):
				next.append(m)
		next.sort_custom(func(a, b): return a.world.distance_to(at) < b.world.distance_to(at))
		for m in next.slice(0, int(K["n"])):
			var flight: float = m.world.distance_to(at) / float(_C()["boltSpeed"])
			_say({"t": "contraptionBolt", "id": -1, "x0": at.x, "y0": at.y, "x1": m.world.x, "y1": m.world.y, "flight": flight})
			_after(flight, func() -> void:
				if is_instance_valid(m) and not m.dead:
					_bolt_strikes(m, i, frac, true, true))
