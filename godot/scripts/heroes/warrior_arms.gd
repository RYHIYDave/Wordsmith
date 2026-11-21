## THE WARRIOR'S BATTLE AXE AND WARHAMMER (game/talents.ts WARRIOR_TREE2, WARRIOR_KITS; game.ts), his moves once his tree's first
## point picks one of them (the greatsword's are hero.gd's own). His pictures are the art chat's, the bake's `axe` and `hammer` sets
## (assets/heroes/warrior-axe, warrior-hammer), and his moves walk, wind up and land as every other hero's do (heroes/kit.gd).
##   THE BATTLE AXE
##     CLEAVE (tap): a wide chop, every enemy in its arc struck (defs.ts arcCos: hero.gd _strike).
##     AXE THROW (hold): the axe thrown, flying through what it meets to the end of its flight (a wall turns it sooner), turning
##       and coming back to his hand through what it meets again; his hands empty meanwhile (braced, or running, empty-handed). A
##       tap while it is out and an axe appears in his hands and he Cleaves (his words of 11 Nov 2026, 09:07: “I understand that the
##       axe is going to kind of materialize to keep fighting but I do need that to work that way”); come back to empty hands it is
##       caught, to hands that hold one it is gone into it, a cyan glint.
##     LEAPING CHOP (swipe): a crouch, the leap, and the axe brought down `ahead` before where he lands.
##   THE WARHAMMER
##     SMASH (tap): the maul down on a spot before him, all on it struck: knocked a little back, dazed toward a stun (hero.gd).
##     EARTHQUAKE (hold): the ground before him (`ahead`) quakes, and what stands on it is stunned.
##     SHOULDER CHARGE (swipe): a crouch, then the charge, striking every enemy in his way at its own strength (`through`).
##   HIS TREE: Twin Axes (two thrown, one to each side of his aim, each for less), Red Mist and Rend (hero.gd), Headlong (a kill and
##   Leaping Chop is ready again); Tremors (the ground shakes three times, each weaker), Heavy Head (hero.gd), Bulldozer (the
##   charge carries what it strikes along, and stuns them where he stops), Wide Swing (hero.gd _strike).
extends "res://scripts/heroes/kit.gd"

## (hero.gd LUNGE: where the warrior's landing strikes when his move has no `ahead` of its own: game.ts land)
const LAND_AHEAD := 1.0

var weapon := "battleaxe"
## (game/talents.ts WARRIOR_TUNE)
var W := {}
## (THE THROWN AXE, game/state.ts Hero.handsEmpty, appear, caughtAt: his hands empty while it flies; the tap being made began with
## them empty; how long since it came back to empty hands, or less than 0)
var hands_empty := false
var appear := false
var caught_t := -1.0
## (his landing, how long since, for its picture; -1 none)
var land_t := -1.0
## (Bulldozer: what his charge carries along before him)
var carried: Array = []
var _deny := 0.0


func _init(hero, w := "battleaxe") -> void:
	super(hero, "warrior")
	weapon = w
	C = clips["warrior:axe" if w == "battleaxe" else "warrior:hammer"]
	Talents.ready_up()
	W = Talents.D["warriorTune"]


## (the look of what he sends: heroes/warrior_arms_look.gd)
func look_path() -> String:
	return "res://scripts/heroes/warrior_arms_look.gd"


func _tick(dt: float) -> void:
	super(dt)
	_deny = maxf(0.0, _deny - dt)
	if caught_t >= 0.0:
		caught_t += dt


## (game.ts updateHero) His hands are empty only while an axe of his is out, or its throw is being wound up: a throw broken off
## leaves it in them.
func _step_own(dt: float) -> void:
	if hands_empty and not (not windup.is_empty() and bool(_def(int(windup["skill"])).get("returns", false))) and not _axe_out():
		hands_empty = false
	if land_t >= 0.0:
		land_t = -1.0 if walked_way != Vector2.ZERO else land_t + dt


func _axe_out() -> bool:
	for p in shots:
		if p.get("returns", false):
			return true
	return false


# =====================================================================================================================
# HIS MOVES (game.ts begin, deliver)

func _begin(i: int, at: Vector2, wind: float) -> void:
	# (THE THROWN AXE: a tap while it flies and his hands are empty, an axe appears in them and he Cleaves; throwing it leaves his
	# hands empty: game.ts begin)
	appear = false
	if hands_empty and i == 0:
		appear = true
		hands_empty = false
	if bool(_def(i).get("returns", false)):
		hands_empty = true
	super(i, at, wind)


func _deliver(i: int, from: Vector2, to: Vector2, frac: float, primary: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var to_way := to - from
	var len := to_way.length()
	var way: Vector2 = to_way / len if len >= 0.01 else h.face
	var each: float = frac * float(r["count_dmg"])
	var echo := not primary
	h._cast(i, str(def["kind"]), from, way, echo)
	if primary:
		h._time_word_sound(i)
	match str(def["kind"]):
		"melee":
			var reach: float = def["range"]
			for k in int(r["count"]):
				if k == 0:
					h._strike(i, from, way, each, 0, echo, reach)
				else:
					_after(0.13 * k, func() -> void: h._strike(i, from if echo else h.world, way, each, k, echo, reach))
		"burst":
			_quake(i, from, way, len, each, echo)
		"projectile":
			_throw(i, from, way, each)
	if primary:
		h._boons(i)
		# ("of Echoes": the move made again a moment later, weaker, from where it was made)
		if float(r["echo"]) > 0.0:
			var delay: float = Words.data()["echo"]["delay"]
			h._tell({"t": "echo", "x": from.x, "y": from.y, "dx": way.x, "dy": way.y, "kind": def["kind"], "delay": delay})
			_after(delay, func() -> void: _deliver(i, from, to, frac * float(h.loadout.r(i)["echo"]), false))
		# (THE LAST WORDS: Surging's shockwave, Mirroring's reflection and its mirrors)
		h.last.cast(i, from, way, frac, func(at: Vector2, w: Vector2, f: float) -> void: _deliver(i, at, at + w, f, false))


## THE EARTHQUAKE (game.ts deliver, a burst): round a spot before him (`ahead`), pulled back if a wall is in the way; the ground
## heaving in the floor's own stone (heroes/warrior_arms_look.gd) in place of the slam ring. TREMORS: three shakes, each wider and
## weaker, a moment apart; TWIN in front: a second after each.
func _quake(i: int, from: Vector2, way: Vector2, len: float, each: float, echo: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var sid: String = h.loadout.id(i)
	var reach: float = float(def["ahead"]) if def.get("ahead") != null else minf(float(def["range"]), maxf(len, 0.8))
	while reach > 0.2 and not _open(from + way * reach):
		reach -= 0.2
	var c: Vector2 = from + way * reach
	var rad: float = float(def["radius"]) * float(r["size"])
	h.sfx.play("slam")
	h.kick(2.5)
	var T: Dictionary = W["tremors"]
	var shares: Array = T["shares"]
	var shakes: int = int(T["n"]) if sid == "quake" and h.has("tremors") else 1
	for q in shakes:
		var share: float = each * (float(shares[mini(q, shares.size() - 1)]) if shakes > 1 else 1.0)
		var round_r: float = rad + (q * float(T["wider"]) if shakes > 1 else 0.0)
		if sid == "quake":
			var qe := {"t": "quake", "x": c.x, "y": c.y, "q": mini(2, q), "fx": way.x, "fy": way.y}
			if q == 0:
				_say(qe)
			else:
				_after(q * float(T["gap"]), func() -> void: _say(qe))
		for k in int(r["count"]):
			var at_t: float = q * float(T["gap"]) + 0.28 * k
			if at_t == 0.0:
				h._blast(i, c, round_r, share, "slam", true, linear_to_db(0.8), 0, echo)
			else:
				var first: bool = q == 0 and k == 0
				_after(at_t, func() -> void: h._blast(i, c, round_r * (1.15 if k > 0 else 1.0), share, "slam", first, linear_to_db(0.8), k, echo))


## THE THROWN AXE (game.ts deliver, a projectile that `returns`): through all it meets; TWIN AXES, two, one to each side of his aim,
## each for less; TWIN in front, as many again, fanned. The axes of one throw keep one list of who they have struck between them.
func _throw(i: int, from: Vector2, way: Vector2, each: float) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var base := atan2(way.y, way.x)
	var twin: bool = h.has("twinaxes")
	var TA: Dictionary = W["twinAxes"]
	var fans: Array = [-float(TA["fan"]), float(TA["fan"])] if twin else [0.0]
	var share: float = float(TA["share"]) if twin else 1.0
	var hit: Array = []
	var n: int = r["count"]
	var words: Array = h.loadout.wfronts(i)
	for k in n:
		for f in fans:
			var a: float = base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 0.16) + float(f)
			var u := Vector2(cos(a), sin(a))
			shots.append({"x": from.x + u.x * 0.4, "y": from.y + u.y * 0.4, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
				"r": minf(0.6, float(def["radius"]) * float(r["size"]) * (1.5 if float(r["splash"]) >= 1.5 else 1.0)), "dist": float(def["range"]),
				"dmg": each * share, "element": r["element"], "pierce": true, "returns": true, "back": false, "hit": hit, "volley": n > 1,
				"skill": i, "trail": 0.0, "words": words, "age": 0.0, "n": k, "flown": 0.0, "look": "axe"})


## (game.ts updateProjectiles) What he sends flying that does not come back as every hero's does (heroes/kit.gd); his axes their own
## way (_step_axes).
func _step_shots(dt: float) -> void:
	var axes: Array = shots.filter(func(p): return p.get("returns", false))
	shots = shots.filter(func(p): return not p.get("returns", false))
	super(dt)
	var rest: Array = shots
	shots = axes
	_step_axes(dt)
	shots = rest + shots


## (game.ts updateProjectiles, for his axes) Out to the end of its flight, a wall turning it sooner; then home to his hand, over
## walls, through what it meets again; caught within 0.6 of him (or after six seconds), as `_caught` says.
func _step_axes(dt: float) -> void:
	for i in range(shots.size() - 1, -1, -1):
		var p: Dictionary = shots[i]
		if not p.get("returns", false):
			continue
		p["age"] = float(p["age"]) + dt
		var v := Vector2(p["vx"], p["vy"])
		var sp := v.length() if v.length() > 0.0 else 1.0
		var travel := sp * dt
		var dead := false
		var r: Dictionary = h.loadout.r(int(p["skill"]))
		while travel > 0.0 and not dead:
			var stp := minf(0.25, travel)
			travel -= stp
			var n := Vector2(float(p["x"]) + v.x / sp * stp, float(p["y"]) + v.y / sp * stp)
			if not h._clear(n.x, n.y):
				# (what he throws may meet a sealed door, and open it; his axe, meeting a wall on its way out, turns back to him; on
				# its way back it flies over)
				if h.doors != null:
					h.doors.unseal({"front": h.loadout.wfronts(int(p["skill"])), "behind": h.loadout.wbehinds(int(p["skill"]))}, n, 0.1)
				if not p["back"]:
					_turn_back(p)
				p["x"] = n.x
				p["y"] = n.y
				continue
			p["x"] = n.x
			p["y"] = n.y
			p["dist"] = float(p["dist"]) - stp
			p["flown"] = float(p["flown"]) + stp
			h._break_props(int(p["skill"]), n, float(p["r"]))
			if h.monsters != null:
				for m in h.monsters.list:
					if not is_instance_valid(m) or m.dead or (p["hit"] as Array).has(m) or m.state == "rise":
						continue
					if m.world.distance_to(n) > float(p["r"]) + m.r:
						continue
					(p["hit"] as Array).append(m)
					_shot_hit(p, m)
			if r["zone"] != null:
				p["trail"] = float(p["trail"]) + stp
				if float(p["trail"]) >= 0.8:
					p["trail"] = 0.0
					h.wakes.add_ground(r["zone"], int(p["skill"]), n, 0.8, h.avg_hit(int(p["skill"]), float(p["dmg"])), r["meld_behind"])
		if not p["back"] and float(p["dist"]) <= 0.0:
			_turn_back(p)
		if p["back"]:
			var b: Vector2 = h.world - Vector2(p["x"], p["y"])
			var bd := b.length()
			if bd < 0.6 or float(p["age"]) > 6.0:
				shots.remove_at(i)
				_caught(p)
				continue
			p["vx"] = b.x / bd * sp
			p["vy"] = b.y / bd * sp
			p["dist"] = 99.0


## (game.ts turnBack) His thrown axe turns for home: what it struck on the way out it may strike again on the way back.
func _turn_back(p: Dictionary) -> void:
	p["back"] = true
	p["hit"] = []
	p["dist"] = 99.0
	_say({"t": "axeTurn", "x": p["x"], "y": p["y"]})


## Back to his hands: to empty hands, caught (Twin Axes' two in the one catch, as the last comes); to hands that hold one, gone
## into it, a glint.
func _caught(_p: Dictionary) -> void:
	if not hands_empty:
		_say({"t": "axeGlint", "x": h.world.x, "y": h.world.y})
	elif not _axe_out():
		hands_empty = false
		caught_t = 0.0
		_say({"t": "axeCatch", "x": h.world.x, "y": h.world.y})


# =====================================================================================================================
# LEAPING CHOP, SHOULDER CHARGE (game.ts useEvasive, the leap; lungeThrough; land)

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
	# (and his swings' combo with it: the next is the first; a swing's step is over)
	combo = 0
	combo_t = 0.0
	swing_step = {}
	_face(at)
	h.sfx.play("dodge", -4.0)
	var x0: Vector2 = h.world
	var dir: Vector2 = (at - x0).normalized() if at.distance_to(x0) > 0.0 else h.face
	h._cast(2, "leap", x0, dir)
	h._boons(2)
	h._time_word_sound(2)
	h.last.dodge_surge(x0)
	var dist := land.distance_to(x0)
	move = {"kind": "leap", "t": 0.0, "dur": float(def["secs"]) if def.get("secs") != null else 0.26 + dist * 0.03, "from": x0, "to": land,
		"crouch": float(def.get("crouch", 0.0)), "hit": []}
	carried = []
	land_t = -1.0
	h._act = "lunge"
	h.sfx.play("lunge", -6.0)


func _move_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
	_anim_t += dt
	# (a leap's crouch, where it has one, before he leaves the floor: he stays where he is meanwhile)
	var off: float = float(move["t"]) - float(move["crouch"])
	var k := clampf(off / float(move["dur"]), 0.0, 1.0)
	h.world = (move["from"] as Vector2).lerp(move["to"], k)
	h._invuln = maxf(h._invuln, 0.06)
	# (THE WARRIOR'S WARHAMMER: Shoulder Charge strikes every enemy in his way, at its own strength)
	if off > 0.0 and bool(_def(2).get("through", false)):
		_through()
	if k >= 1.0:
		move = {}
		h._act = ""
		_anim_t = 0.0
		_land()


## (game.ts lungeThrough) Every enemy he meets on the way struck once; Bulldozer, those struck carried along before him.
func _through() -> void:
	var D: Dictionary = Talents.D["tune"]["drilledLunge"]
	var hit: Array = move["hit"]
	var before := hit.size()
	var r: Dictionary = h.loadout.r(2)
	var push: bool = h.loadout.id(2) == "charge" and h.has("bulldozer")
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or hit.has(m) or m.state == "rise" or h.monsters.shut_in(m):
				continue
			if m.world.distance_to(h.world) > m.r + float(T["tune"]["heroRadius"]) + float(D["reach"]):
				continue
			hit.append(m)
			h.hit_monster(m, 2, float(r["count_dmg"]), hit.size() > 1)
			if push and not m.dead and not m.boss:
				carried.append(m)
	if before == 0 and not hit.is_empty():
		h._landed_on(2)
	var ahead: Vector2 = h.world + h.face * float(W["bulldozer"]["ahead"])
	for m in carried:
		if is_instance_valid(m) and not m.dead and _open(ahead):
			m.world = ahead


## (game.ts land) He comes down: Bulldozer's carried stunned where he stops; a shock round where his axe comes down (`ahead`) or his
## shoulder lands, as its words make it, which leaves there what the words behind it leave; Twin, a second a moment later, a little
## wider; "of Echoes", a weaker one after that.
func _land() -> void:
	for m in carried:
		if is_instance_valid(m) and not m.dead:
			m.stun_for(float(W["bulldozer"]["stun"]))
	carried = []
	var def := _def(2)
	var r: Dictionary = h.loadout.r(2)
	var fwd: float = float(def["ahead"]) if def.get("ahead") != null else LAND_AHEAD
	var at: Vector2 = h.world + h.face * fwd
	var rad: float = float(def["radius"]) * float(r["size"])
	h.sfx.play("slam", -4.0)
	h._shake = 0.15
	var each: float = r["count_dmg"]
	for n in int(r["count"]):
		if n == 0:
			h._blast(2, at, rad, each, "land", true, -4.0)
		else:
			_after(0.28 * n, func() -> void: h._blast(2, at, rad * 1.15, each, "land", false, -4.0, n))
	if float(r["echo"]) > 0.0:
		h._echo_of(2, "leap", at, h.face, func() -> void: h._blast(2, at, rad, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]), "land", false, -4.0, 0, true))
	land_t = 0.0


## (game.ts warriorKill) HEADLONG: a kill, and Leaping Chop is ready again at once.
func on_kill(_m) -> void:
	if h.has("headlong") and h.loadout.id(2) == "chop":
		cd[2] = 0.0
		charges[2] = max_charges[2]


func _open(p: Vector2) -> bool:
	return h.map != null and h.map.open_at(floori(p.x), floori(p.y))


# =====================================================================================================================
# HIS PICTURES (render/figure.ts: the crouch, the leap, the axe's throw with both, the axe appearing; braced or running with his
# hands empty, the catch; the landing)

static func _clip_at(c: Dictionary, t: float) -> int:
	return clampi(floori(t * float(c["fps"]) + 1e-6), 0, int(c["n"]) - 1)


## (figure.ts heldFrame) A held clip round and round from its loop.
static func _held_at(c: Dictionary, t: float) -> int:
	var n: int = c["n"]
	var from := clampi(roundi(float(c["loop"] if c.get("loop") != null else 0.0) * float(c["fps"])), 0, n - 1)
	var i := floori(maxf(0.0, t) * float(c["fps"]) + 1e-6)
	if i < from:
		return i
	return from + (i - from) % maxi(1, n - 1 - from)


func _own_picture(side: int) -> Array:
	var L: Dictionary = C["lists"]
	var twin: bool = weapon == "battleaxe" and h.has("twinaxes")
	if not move.is_empty():
		var t: float = move["t"]
		var crouch: float = move["crouch"]
		if crouch > 0.0 and t < crouch:
			var cl := 123 if L.has("123") else 124
			if L.has(str(cl)):
				return [cl, _clip_at(L[str(cl)], t)]
		var n: int = h.art.count(side, 39)
		return [39, clampi(floori(clampf((t - crouch) / float(move["dur"]), 0.0, 1.0) * n), 0, maxi(0, n - 1))]
	if not attack.is_empty():
		var s: int = attack["skill"]
		var age: float = attack["age"]
		var wind: float = attack["wind"]
		# (TWIN AXES: his throw with both, figure.ts TWIN_AXES_SHOWN)
		if s == 1 and twin and L.has("120"):
			return [120, mini(int(L["120"]["n"]) - 1, attack_frame(L["120"], age, wind))]
		# (a tap begun with his hands empty: its first pictures the axe appearing in them, then the Cleave's own)
		if s == 0 and appear and not attack.get("second", false) and L.has("119") and L.has("14"):
			var c: Dictionary = L["14"]
			var hit: float = float(c["hit"]) if c.get("hit") != null else 0.0
			var tt := ((age / wind) * hit if wind > 0.0 else hit) if age < wind else hit + (age - wind)
			var k := floori(tt * float(c["fps"]) + 1e-6)
			if k >= 0 and k < int(L["119"]["n"]):
				return [119, k]
		return []
	if weapon == "battleaxe":
		var walking := _way_of() >= 0
		# (THE THROWN AXE: its catch, standing or on the run; both caught with Twin Axes)
		if caught_t >= 0.0:
			var cl := (118 if twin and L.has("118") else 117) if walking else (122 if twin and L.has("122") else 43)
			if L.has(str(cl)):
				var c: Dictionary = L[str(cl)]
				if caught_t < (int(c["n"]) - 1) / float(c["fps"]):
					return [cl, _clip_at(c, caught_t)]
		# (braced, both out with Twin Axes, or running, his hands empty, while it flies)
		if hands_empty:
			if walking and L.has("116"):
				var n: int = L["116"]["n"]
				var stride = C.get("walkStride")
				var at := roundi(h.walked / float(stride) * n) if stride != null else floori(_anim_t * float(L["116"]["fps"]))
				return [116, posmod(at, n)]
			var hl := 121 if twin and L.has("121") else 41
			if not walking and L.has(str(hl)):
				return [hl, _held_at(L[str(hl)], _anim_t)]
	# (his landing, standing where he came down)
	if land_t >= 0.0 and _way_of() < 0 and L.has("45"):
		var c: Dictionary = L["45"]
		if land_t < (int(c["n"]) - 1) / float(c["fps"]):
			return [45, _clip_at(c, land_t)]
	return []


func _clear_own() -> void:
	carried = []
	hands_empty = false
	appear = false
	caught_t = -1.0
	land_t = -1.0
