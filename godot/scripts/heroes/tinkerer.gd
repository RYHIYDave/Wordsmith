## THE TINKERER (game/tinkerer.ts; game.ts tossVial, vialBursts, whistle, holdJump, golemPounds, stepGolem, stepRocket, golemSpot; her
## blast jump in useEvasive and blastLands), her three moves by the game's rules:
##   HER VIAL TOSS (her tap): she lobs a vial off her belt where she aims (no further than its range, as far as she sees); it flies
##     TINKER_TUNE.toss.flight and bursts where it comes down, hurting all within the move's radius. Aimed at an enemy for her, it
##     goes where the enemy will be as it comes down (lock.ts placedAim). Twin, a second beside it; "of Echoes", a weaker one after.
##   HER GOLEM (her tap and hold): her first whistles it out beside her (it drops in); from then on it is always with her. It runs
##     after her (faster than she runs), goes for what is awake near her, and fights it with its combo, uppercut, uppercut, SLAM
##     (GOLEM_COMBO); far from where it is going, it rocket-jumps there (GOLEM_ROCKET: crouched half a second, its stacks swung
##     down and flaring, the blast, the flight, its landing its fist slam). Each whistle after rocket-jumps it onto where she aims,
##     landing as its ground pound (nearer than COMBO_TUNE.jumpFrom, it pounds where it stands). It cannot be broken: monsters do
##     not fight it. Left far behind (a way taken), it is whistled up beside her again; it winds down where it stands when she falls.
##   HER BLAST JUMP (her swipe): a bomb at her feet goes off, what is by her hurt and blown away, and she rides the blast to a spot,
##     nothing hurting her in the air (Twin, a second bomb a moment later where she was; "of Echoes", a weaker one after).
## The Golem's hits are hers, made with her tap and hold's words. Her skill tree (the Contraption, the gun arm, Mark II, her vials'
## talents) is not in the port yet: her Golem has its cannon arm, as he picked it, and fights with its fists (GOLEM_CANNON off).
extends "res://scripts/heroes/kit.gd"

## (assets/heroes/golem.json: tools/godot_tinkerer.ts, her tune and its rocket jump's frames, as the game has them)
var G := {}
var TT := {}
var GT := {}
var CB := {}
var RK := {}
## Her vials in the air: {x0, y0, x1, y1, t, flight, skill, frac, wake}.
var vials: Array = []
## Her Golems (one): {x, y, fx, fy, act, act_t, did, target, ax, ay, punch_cd, jump_cd, walked, skill, seat, combo, combo_t, jx, jy,
## twin}. `act`: arrive, stand, walk, punch, pound, jump, down.
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


func _T() -> Dictionary:
	return Talents.D["tinkerTalents"]


## (game.ts brewVial) What her tree puts in a vial leaving her hand: The Big One, every fifth a big one; Mad Mixture, a brew.
func _brew(v: Dictionary) -> void:
	if h.has("thebigone"):
		vials_thrown += 1
		if vials_thrown % int(_T()["bigOne"]["every"]) == 0:
			v["big"] = true
	if h.has("madmixture"):
		v["brew"] = ["burn", "freeze", "poison"][randi() % 3]


func _init(hero) -> void:
	super(hero, "tinkerer")
	G = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/golem.json"))
	TT = G["tune"]
	GT = TT["golem"]
	CB = G["combo"]
	RK = G["rocket"]


func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_deny = maxf(0.0, _deny - dt)
	if land_t >= 0.0:
		land_t += dt
	return super(dt, way, hooked)


## (lock.ts placedAim) Her vial aimed at an enemy for her goes where it will be as it comes down.
func _aim(reach: float, kind := "") -> Vector2:
	if kind == "vialtoss" and not (Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)) and h.monsters != null:
		var m = h.monsters.nearest(h.world, reach)
		if m != null:
			return _lead(m, float(Words.data()["skills"]["vialtoss"]["windup"]) + float(TT["toss"]["flight"]))
	return super(reach, kind)


func _shake(amount: float) -> void:
	if h.fx != null and is_instance_valid(h.fx):
		h.fx.kick(amount)


func _sfx(name: String, vol: float) -> void:
	h.sfx.play(name, linear_to_db(vol))


func _open(p: Vector2) -> bool:
	return h.map != null and h.map.open_at(floori(p.x), floori(p.y))


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
	h._cast(i, kind, from, way, echo)
	if primary:
		h._time_word_sound(i)
	if kind == "vialtoss":
		for k in (1 if echo else int(r["count"])):
			_toss_vial(i, from, to, each, k, echo)
	elif kind == "golem":
		# (the first whistle brings her Golem out; each after rocket-jumps it, or sets it on to pound. Twin, a second pound; "of
		# Echoes", a weaker one after that)
		if not echo:
			_whistle(i, to, each, int(r["count"]))
		else:
			for g in _up():
				_after(float(GT["pound"]["long"]), func() -> void: _pounds(i, Vector2(g["x"], g["y"]), each, 0, true, g))
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, kind, from, way, again)


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
	var v := {"x0": from.x, "y0": from.y, "x1": x1, "y1": y1, "t": 0.0, "flight": float(T["flight"]), "skill": i, "frac": frac, "wake": n == 0 and not echo}
	_brew(v)
	vials.append(v)
	_say({"t": "vial", "id": -1, "x0": from.x, "y0": from.y, "x1": x1, "y1": y1, "flight": float(T["flight"]), "n": n, "echo": echo, "big": v.get("big", false)})
	if n == 0:
		_sfx("vial", 0.3 if echo else 0.5)


## (game.ts vialBursts) A vial of hers bursting where it comes down, hurting all within the move's radius.
func _vial_bursts(v: Dictionary) -> void:
	var T := _T()
	var i: int = v["skill"]
	var rad: float = float(_def(i)["radius"]) * float(h.loadout.r(i)["size"])
	var little: bool = v.get("little", false)
	var big: bool = v.get("big", false)
	var brew: String = v.get("brew", "")
	# (CLUSTER VIALS: a little one bursts smaller; THE BIG ONE, three times as wide)
	if little:
		rad *= float(T["cluster"]["size"])
	if big:
		rad *= float(T["bigOne"]["wide"])
	var at := Vector2(v["x1"], v["y1"])
	_say({"t": "vialBurst", "x": at.x, "y": at.y, "r": rad, "little": little, "big": big, "brew": brew})
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
	h._blast(i, at, rad, float(v["frac"]), "vial", bool(v["wake"]), linear_to_db(0.8))
	brewing = false
	# (MAD MIXTURE: its brew on top of its own words, on what it burst on)
	if brew != "":
		_brew_on(caught, brew, i, float(v["frac"]))
	# (THE BIG ONE: everything it burst on knocked down)
	if big:
		for m in caught:
			if is_instance_valid(m) and not m.dead:
				m.throw_from(at, float(T["bigOne"]["far"]), 0.2)
				m.stun_for(float(T["bigOne"]["down"]))
	# (TAR: a puddle of it left where it burst)
	if not little and h.has("tar"):
		var tr: float = rad * float(T["tar"]["size"])
		tars.append({"x": at.x, "y": at.y, "r": tr, "t": 0.0})
		_say({"t": "tar", "x": at.x, "y": at.y, "r": tr, "secs": T["tar"]["secs"]})
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
	h._invuln = maxf(h._invuln, secs + 0.1)


func _move_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
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


## (game.ts whistle) Her tap and hold: her Golem whistled out beside her; or, out already, it rocket-jumps onto where she points
## (GOLEM_COMBO), or nearer than that pounds the floor before it; Twin, a second pound after.
func _whistle(i: int, to: Vector2, frac: float, count: int) -> void:
	var up := _up()
	if up.is_empty():
		var seat := 0
		var s := _golem_spot(seat, 0.6)
		var p: Vector2 = s if _open(s) else h.world
		# (one winding down is gone as a new one comes)
		golems = up
		_next_golem += 1
		golems.append({"id": _next_golem, "x": p.x, "y": p.y, "fx": h.face.x, "fy": h.face.y, "act": "arrive", "act_t": 0.0, "did": false, "target": null, "ax": p.x, "ay": p.y,
			"punch_cd": 0.0, "jump_cd": 0.0, "walked": 0.0, "skill": i, "seat": seat, "combo": 0, "combo_t": 0.0, "jx": p.x, "jy": p.y, "twin": 0})
		_say({"t": "golemArrive", "x": p.x, "y": p.y})
		_shake(2.0)
		_sfx("whistle", 0.7)
		_sfx("slam", 0.6)
		_overdrive()
		return
	var jumped: Array = []
	if bool(CB["on"]):
		for g in up:
			if g["act"] != "jump" and _hold_jump(g, i, to, count):
				jumped.append(g)
	for g in up:
		if jumped.has(g) or (bool(CB["on"]) and g["act"] == "jump"):
			continue
		g["combo"] = 0
		var d: Vector2 = to - Vector2(g["x"], g["y"])
		if d.length() > 0.3:
			g["fx"] = d.x / d.length()
			g["fy"] = d.y / d.length()
		g["act"] = "pound"
		g["act_t"] = -float(GT["pound"]["lead"])
		g["did"] = false
		g["skill"] = i
		for k in range(1, count):
			_after(float(GT["pound"]["long"]) * k, func() -> void:
				if g["act"] != "down" and golems.has(g):
					_pounds(i, Vector2(g["x"], g["y"]), frac, k, false, g))
	_overdrive()


## (Overdrive) Her whistle sends her Golems into overdrive: they move and strike twice as fast for five seconds.
func _overdrive() -> void:
	if not h.has("overdrive"):
		return
	for g in _up():
		if float(g.get("over_t", 0.0)) <= 0.0:
			_say({"t": "overdrive", "x": g["x"], "y": g["y"]})
		g["over_t"] = float(_T()["overdrive"]["secs"])


## (game.ts holdJump) Golem `g` rocket-jumps onto `to`, if it is far enough off and there is floor to come down on.
func _hold_jump(g: Dictionary, i: int, to: Vector2, count: int) -> bool:
	var at := Vector2(g["x"], g["y"])
	var d := at.distance_to(to)
	if d < float(CB["jumpFrom"]):
		return false
	var u := (to - at) / d
	var go := minf(float(GT["jump"]["most"]), d)
	var l := at + u * go
	var k := 0
	while k < 12 and not _open(l):
		l -= u * 0.4
		k += 1
	if not _open(l) or l.distance_to(at) < float(CB["jumpFrom"]) * 0.6:
		return false
	g["fx"] = u.x
	g["fy"] = u.y
	g["jx"] = at.x
	g["jy"] = at.y
	g["ax"] = l.x
	g["ay"] = l.y
	g["act"] = "jump"
	g["act_t"] = 0.0
	g["did"] = false
	g["skill"] = i
	g["twin"] = count
	g["combo"] = 0
	return true


## (game.ts golemPounds) A Golem's ground pound landing at `at`: everything within the move's radius (`size` of it: its combo's
## slam) struck and thrown. `landing`: its rocket jump's slam, its crater and dust its landing's own pictures.
func _pounds(i: int, at: Vector2, frac: float, n: int, echo: bool, _g = null, landing := false, size := 1.0) -> void:
	var rad: float = float(_def(i)["radius"]) * float(h.loadout.r(i)["size"]) * size
	if not landing:
		_say({"t": "golemPound", "x": at.x, "y": at.y, "r": rad, "n": n, "echo": echo})
	_shake(2.5 if n > 0 or echo else 5.0)
	_sfx("slam", 0.6 if n > 0 or echo else 1.0)
	h._blast(i, at, rad, frac, "pound", n == 0 and not echo, linear_to_db(0.8), n, echo)
	if h.monsters != null:
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= rad + m.r:
				m.throw_from(at, 1.2, 0.2)
	# (LIGHTNING ROD: for a while after its ground pound, every enemy near the Golem goes after it instead of her)
	if _g != null and size >= 1.0 and h.has("lightningrod") and h.monsters != null:
		var R: Dictionary = _T()["rod"]
		var dd = null
		for q in h.monsters.decoys:
			if q.get("golem") == _g:
				dd = q
		if dd != null:
			dd["t"] = float(R["secs"])
		else:
			h.monsters.decoys.append({"x": _g["x"], "y": _g["y"], "t": float(R["secs"]), "r": float(R["near"]), "size": 0.5, "golem": _g})
	# (PROSPECTOR: a ground pound, not its combo's slam, digs up a handful of gold, between them about one gold drop)
	if size >= 1.0 and h.has("prospector") and h.monsters != null and h.monsters.loot != null:
		var piles: int = _T()["prospector"]["n"]
		var all := randi_range(3, 8)
		var p: Vector2 = at if _open(at) or _g == null else Vector2(_g["x"], _g["y"])
		for k in piles:
			var share := floori(all / float(piles)) + (1 if k < all % piles else 0)
			if share > 0:
				h.monsters.loot._gold(p, share)


## (game.ts updateTinkerer) Her vials in the air, and her Golem.
func _step_own(dt: float) -> void:
	for k in range(vials.size() - 1, -1, -1):
		var v: Dictionary = vials[k]
		v["t"] = float(v["t"]) + dt
		if float(v["t"]) < float(v["flight"]):
			continue
		vials.remove_at(k)
		_vial_bursts(v)
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
	for g in golems:
		g["act_t"] = float(g["act_t"]) + dt


## (game.ts stepGolem) Her Golem `g`, each step.
func _step_golem(g: Dictionary, dt: float) -> void:
	# (her tree's OVERDRIVE: it moves and strikes twice as fast, its time `gdt`)
	var over: float = g.get("over_t", 0.0)
	var gdt := dt * (float(_T()["overdrive"]["fast"]) if over > 0.0 and g["act"] != "down" else 1.0)
	g["over_t"] = maxf(0.0, over - dt)
	g["act_t"] = float(g["act_t"]) + gdt
	g["punch_cd"] = maxf(0.0, float(g["punch_cd"]) - gdt)
	g["jump_cd"] = maxf(0.0, float(g["jump_cd"]) - gdt)
	var at := Vector2(g["x"], g["y"])
	if g["act"] == "down":
		if float(g["act_t"]) >= float(GT["down"]):
			golems.erase(g)
		return
	# (left far behind, or in another place: whistled up beside her again)
	if at.distance_to(h.world) > float(GT["lost"]) or not _open(at):
		var p := _golem_spot(int(g["seat"]), 0.0)
		if not _open(p):
			p = h.world
		g["x"] = p.x
		g["y"] = p.y
		g["act"] = "arrive"
		g["act_t"] = 0.0
		_say({"t": "golemArrive", "x": p.x, "y": p.y})
		return
	if g["act"] == "arrive":
		if float(g["act_t"]) >= float(GT["arrive"]):
			_golem_idle(g)
		return
	if g["act"] == "jump":
		_step_rocket(g, gdt)
		return
	var reach: float = GT["punch"]["reach"]
	if g["act"] == "punch":
		# (its uppercut: golemBlow)
		var blow: Dictionary = G["blow"]
		if not g["did"] and float(g["act_t"]) >= float(blow["hit"]):
			g["did"] = true
			var m = g["target"]
			if m != null and is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= reach + m.r + 0.6:
				_say({"t": "golemPunch", "x": m.world.x, "y": m.world.y, "dx": g["fx"], "dy": g["fy"]})
				_sfx("golemPunch", 0.8)
				h.hit_monster(m, int(g["skill"]), _golem_frac(g) * float(GT["punch"]["share"]), false)
				# (her tree's SHRAPNEL, its cannon off: its punch bursts where it lands, striking everything near)
				if h.has("shrapnel"):
					_shrapnel(int(g["skill"]), m.world, _golem_frac(g) * float(GT["punch"]["share"]), m)
				if not m.dead:
					m.throw_from(at, 0.8, 0.15)
		if float(g["act_t"]) >= float(blow["long"]):
			# (GOLEM_COMBO: the next of its combo comes quick)
			g["combo"] = int(g["combo"]) + 1
			g["combo_t"] = 0.0
			g["punch_cd"] = float(CB["between"])
			_golem_idle(g)
		return
	if g["act"] == "pound":
		# (GOLEM_COMBO: the slam that ends its combo, its pound's blow in a smaller ring)
		var slam := int(g["combo"]) >= 2
		if not g["did"] and float(g["act_t"]) >= float(GT["pound"]["hit"]):
			g["did"] = true
			# (the fist comes down a pace before it)
			var fist := at + Vector2(g["fx"], g["fy"]) * 0.9
			if slam:
				_pounds(int(g["skill"]), fist, _golem_frac(g) * float(CB["slam"]["share"]), 0, false, g, false, float(CB["slam"]["size"]))
			else:
				_pounds(int(g["skill"]), fist, _golem_frac(g), 0, false, g)
		if float(g["act_t"]) >= float(GT["pound"]["long"]):
			if slam:
				g["combo"] = 0
				g["combo_t"] = 0.0
				g["punch_cd"] = float(GT["punch"]["wait"])
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
	# (GOLEM_COMBO: a combo let lie starts again)
	g["combo_t"] = float(g["combo_t"]) + gdt
	if float(g["combo_t"]) > float(CB["lapse"]):
		g["combo"] = 0
	if best != null and bd <= reach and float(g["punch_cd"]) <= 0.0:
		_turn_golem(g, best.world)
		g["act"] = "pound" if int(g["combo"]) >= 2 else "punch"
		g["act_t"] = 0.0
		g["did"] = false
		g["target"] = best
		return
	# (where it goes: up to what it fights; else to her side, a little behind her)
	var goal: Vector2
	var stop: float
	if best != null and bd > reach * 0.8:
		goal = best.world
		stop = reach * 0.7 + best.r
	elif best != null:
		_turn_golem(g, best.world)
		goal = at
		stop = 1.0
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
		while k < 8 and not _open(l):
			l -= u * 0.5
			k += 1
		if _open(l) and l.distance_to(at) > 2.0:
			_turn_golem(g, goal)
			g["jx"] = at.x
			g["jy"] = at.y
			g["ax"] = l.x
			g["ay"] = l.y
			g["act"] = "jump"
			g["act_t"] = 0.0
			g["did"] = false
			g["twin"] = 0
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
	var rocket := {"x0": x0.x, "y0": x0.y, "x1": to.x, "y1": to.y, "fx": g["fx"], "fy": g["fy"], "gun": "cannon", "flight": float(RK["flight"])}
	if was < float(RK["blast"]) and f >= float(RK["blast"]):
		_say({"t": "bombsAway", "x": x0.x, "y": x0.y, "r": 1, "rocket": rocket})
		_shake(1.5)
		_sfx("explode", 0.45)
	if was < float(RK["land"]) and f >= float(RK["land"]):
		_say({"t": "golemArrive", "x": p.x, "y": p.y, "rocket": rocket})
		# (ITS FIST SLAM: it lands as its ground pound strikes)
		_pounds(int(g["skill"]), p, _golem_frac(g), 0, false, g, true)
		g["jump_cd"] = float(GT["jump"]["wait"])
		# (her hold's jump: Twin, a second pound where it came down)
		var i: int = g["skill"]
		for k in range(1, maxi(1, int(g["twin"]))):
			_after(float(GT["pound"]["long"]) * k, func() -> void:
				if g["act"] != "down" and golems.has(g):
					_pounds(i, p, _golem_frac(g), k, false, g))
		g["twin"] = 0
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
