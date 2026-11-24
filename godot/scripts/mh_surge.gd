## SURGING'S MELDS AT WORK (meldshigh_rules.gd; his doc High City Melds, "Surging"). In front, every third use a shockwave round him
## (last_words.gd cast, which hands the shockwave to `cast`); behind, his dodge releases a surge (dodge_surge, to `dodge`; hero.gd
## asks `dodge_far`, `dodge_cd_k` and tells `landed`). Each meld's shockwave does something of its own:
##   Upheaval    throws them up, each landing on those beneath; his dodge's surge spends Power's might
##   Pestilence  spreads each poisoned one's doses to those near; a poison cloud where he dodged from
##   Blizzard    hail round him two seconds, chilling, then freezing; a ring of frost freezing the first to cross it
##   Nova        a ring of fire, those already burning exploding; a ring of burning ground where he dodged from
##   Thunderclap a bolt on each it strikes, arcing on; a storm where he dodged from
##   Rush        he surges forward with it, through those in his path; his dodge twice as far, surging at both ends
##   Seismic     the ground cracks open in lines out from him; his landing slams, stunning those near
##   Tremor      it comes twice, the second wider; his dodge's surge again where he lands
##   Heartbeat   heals him for each it strikes; his dodge's surge draws the life orbs near to him
##   Overload    a rune on each it strikes, going off a moment later; a rune where he dodged from, going off as a surge
##   Lens        a beam straight ahead, far stronger, a certain critical; his dodge's surge flies to the marked one
##   Crescendo   grows with the frenzy, every second use at a full frenzy; at a full frenzy each dodge surges twice
##   Bastion     a shield for each it strikes; a ward where he lands
##   Resonance   a ring hanging round him, striking whatever crosses it; his dodge's surge rings on where he dodged from
##   Spark       a smaller one every second use; his dodge back a third sooner
##   Tsunami     a wave rolling out across the room, carrying them; his dodge's surge three times as wide
##   Undertow    goes out, then draws back, dragging what it struck; a vortex where he dodged from
##   Ricochet    three more copies of his blow at the nearest; shards out every way from his dodge
##   Hexwave     curses all it strikes, staggering the cursed; a hex circle where he dodged from
##   Lull        time slowed round him two seconds; a bubble of slow time where he dodged from
##   Tangle      a ring of snares round him; his dodge's surge holds all it strikes
##   with the High City's others: Breakthrough (a wave down the line; a lance down his dodge), Bloodwave (tears every wound open;
##   thorns), Soulstorm (the souls just gathered ride it; his dodge raises what it kills), Deathknell (culls the weak; a bell)
extends RefCounted

var H
## (Blizzard: hail round him till {until, i}; Lull: time slowed round him till)
var _hail := {}
var _lull := {}
## (Resonance: rings hanging {at, r, t, dur, i, last: {id: t}}; Blizzard behind: frost rings {at, r, t, dur, i, hit})
var _rings: Array = []
var _frost: Array = []
## (Tsunami: waves rolling {at, r, far, speed, i, share, hit})
var _waves: Array = []
## (Deathknell behind: bells {at, t, dur, next, i}; Resonance behind: echoes {at, t, n, i, share})
var _bells: Array = []
var _echoes: Array = []
## (Soulstorm behind: kills of his dodge's surge rise till then, near where)
var _raise := {}
## (Rush, Tremor, Seismic, Bastion: the dodge of move `i` to be landed)
var _dodging := -1


func _init(h) -> void:
	H = h


func fresh() -> void:
	_hail = {}
	_lull = {}
	_rings = []
	_frost = []
	_waves = []
	_bells = []
	_echoes = []
	_raise = {}
	_dodging = -1


func _S() -> Dictionary:
	return H.lw.L()["surge"]


## Whether a use of move `i` (its count `uses`) brings the shockwave: -1, Surging's own (every third).
func due(i: int, uses: int) -> int:
	match H.f(i):
		"spark":
			return 1 if uses % 2 == 0 else 0
		"crescendo":
			if H.frenzy_full():
				return 1 if uses % 2 == 0 else 0
	return -1


## The shockwave of a use of move `i`, round `at`, `share` of its hit: its meld's own, or Surging's ring.
func cast(i: int, at: Vector2, share: float) -> void:
	var id: String = H.f(i)
	var S := _S()
	var R: float = S["radius"]
	match id:
		"spark":
			R *= H.n("spark", "small", 0.67)
			share *= H.n("spark", "small", 0.67)
		"crescendo":
			var k: float = 1.0 + H.n("crescendo", "per", 0.12) * H.hero.frenzy
			R *= k
			share *= k
	# (what was so before it struck: Nova's burning, Hexwave's cursed, Bloodwave's bleeding)
	var before: Array = H.near(at, R)
	var burning: Array = before.filter(func(o): return o.burn_t > 0.0)
	var cursed: Array = before.filter(func(o): return o.hex_t > 0.0)
	# (the shockwave itself: Lens a beam, Tsunami a rolling wave, Breakthrough a wave down the line, else the ring)
	match id:
		"lens":
			var w: Vector2 = H.hero.face
			var len: float = H.n("lens", "len", 7.0)
			H.tell(id, "beam", at, {"x1": at.x + w.x * len, "y1": at.y + w.y * len})
			H.lw.rec("surge_wave")
			for o in H.on_line(at, w, len, H.n("lens", "w", 0.6)):
				H.hero.hit_monster(o, i, share * H.n("lens", "k", 2.0), true, true)
			return
		"tsunami":
			H.tell(id, "roll", at, {"r": H.n("tsunami", "far", 7.0)})
			H.lw.rec("surge_wave")
			_waves.append({"at": at, "r": 0.4, "far": H.n("tsunami", "far", 7.0), "speed": H.n("tsunami", "speed", 6.0), "i": i, "share": share, "hit": []})
			return
		"breakthrough":
			var w: Vector2 = H.hero.face
			var len: float = H.n("breakthrough", "len", 10.0)
			H.tell(id, "line", at, {"x1": at.x + w.x * len, "y1": at.y + w.y * len})
			H.lw.rec("surge_wave")
			for o in H.on_line(at, w, len, H.n("breakthrough", "w", 0.9)):
				var d: float = o.world.distance_to(at)
				H.later(d / 14.0, func() -> void:
					if H.ok(o):
						H.hero.hit_monster(o, i, share, true))
			return
	H.hero._tell({"t": "surge", "x": at.x, "y": at.y, "r": R})
	H.lw.rec("surge_wave")
	H.hero._blast(i, at, R, share, "nova", false, -6.0)
	var struck: Array = before.filter(func(o): return is_instance_valid(o))
	if id == "":
		return
	H.tell(id, "wave", at, {"r": R, "n": struck.size()})
	var OWN := {"blizzard": "hail", "nova": "ring", "seismic": "cracks", "overload": "runes", "crescendo": "grow", "resonance": "hang",
		"spark": "spark", "hexwave": "hex", "lull": "lull", "tangle": "snares"}
	if OWN.has(id):
		H.tell(id, OWN[id], at, {"r": R})
	match id:
		"upheaval":
			for o in struck:
				if not H.ok(o):
					continue
				H.throw(o, at, H.n("upheaval", "throw", 0.9))
				var me = self
				H.later(0.4, func() -> void: me._land(i, o))
		"pestilence":
			for o in struck:
				if H.ok(o) and o.poison_t > 0.0:
					for q in H.near(o.world, H.n("pestilence", "r", 1.6), 6, [o]):
						q.dose(o.poison_dps / maxf(1.0, o.poison_n), -1.0, "poison")
					H.tell(id, "spread", o.world)
		"blizzard":
			_hail = {"until": H.clock() + H.n("blizzard", "secs", 2.0), "i": i, "next": 0.0}
		"nova":
			for o in burning:
				if H.ok(o):
					H.tell(id, "burst", o.world)
					for q in H.near(o.world, H.n("nova", "r", 1.3)):
						H.hit(q, i, H.n("nova", "burst", 0.4), "fire")
			for o in struck:
				if H.ok(o):
					o.set_alight(maxf(1.0, H.hero.avg_hit(i, H.n("nova", "burn", 0.3))), 3.0)
		"thunderclap":
			for o in struck:
				if not H.ok(o):
					continue
				H.hit(o, i, H.n("thunderclap", "bolt", 0.3), "lightning")
				H.tell(id, "bolt", o.world)
				var nx: Array = H.near(o.world, 3.0, 1, struck)
				if not nx.is_empty():
					H.hit(nx[0], i, H.n("thunderclap", "arc", 0.3), "lightning")
					H.tell(id, "arc", o.world, {"x1": nx[0].world.x, "y1": nx[0].world.y})
		"rush":
			_rush(i, share)
		"seismic":
			for k in 6:
				var d := Vector2(1, 0).rotated(TAU * k / 6.0)
				for s in 3:
					var p: Vector2 = at + d * (1.0 + s * 1.0)
					H.ground("cracks", i, p, 0.55, H.n("seismic", "cracks", 3.5), 0.0)
				for o in H.on_line(at, d, 3.5, 0.5):
					H.stun(o, H.n("seismic", "stagger", 0.35))
		"tremor":
			H.later(H.n("tremor", "after", 0.35), func() -> void:
				H.tell("tremor", "again", at, {"r": R * 1.5})
				H.blast(i, at, R * H.n("tremor", "wider", 1.5), share * H.n("tremor", "second", 0.7)))
		"heartbeat":
			H.heal_life(H.hero.max_life * H.n("heartbeat", "per", 0.012) * struck.size(), id)
		"overload":
			for o in struck:
				if H.ok(o):
					H.ground("rune", i, o.world, 0.8, 0.0, H.hero.avg_hit(i, H.n("overload", "rune", 0.4)))
		"bastion":
			if not struck.is_empty():
				H.shield(H.n("bastion", "per", 0.015) * struck.size(), id)
		"resonance":
			_rings.append({"at": at, "r": R, "t": 0.0, "dur": H.n("resonance", "secs", 3.0), "i": i, "last": {}})
		"undertow":
			H.later(H.n("undertow", "after", 0.4), func() -> void:
				H.tell("undertow", "back", at)
				for o in struck:
					H.drag(o, H.hero.world, 0.8))
		"ricochet":
			for q in H.near(at, H.n("ricochet", "reach", 5.0), 3):
				H.hit(q, i, H.n("ricochet", "copy", 0.5))
				H.tell(id, "copy", at, {"x1": q.world.x, "y1": q.world.y})
		"hexwave":
			for o in struck:
				if not H.ok(o):
					continue
				if cursed.has(o):
					H.stun(o, H.n("hexwave", "stagger", 0.5))
				H.curse(o, 4.0, H.n("hexwave", "curse", 0.15))
		"lull":
			_lull = {"until": H.clock() + H.n("lull", "secs", 2.0), "i": i}
		"tangle":
			for k in 6:
				var d := Vector2(1, 0).rotated(TAU * k / 6.0 + 0.5) * (R * 0.8)
				H.ground("snare", i, at + d, 0.0, 0.0, H.n("tangle", "hold", 1.2))
		"bloodwave":
			for o in struck:
				if H.ok(o) and o.bleed_t > 0.0:
					var all: float = o.bleed_dps * o.bleed_t
					o.bleed_t = 0.0
					o.damage(maxf(1.0, roundf(all)), "phys", false, false, [], false, true, i)
					H.tell(id, "tear", o.world, {"n": all})
		"soulstorm":
			var n: int = mini(8, H.reap.souls.size())
			for k in n:
				var d := Vector2(1, 0).rotated(TAU * k / maxf(1.0, n))
				H.tell(id, "soul", at, {"x1": at.x + d.x * 5.0, "y1": at.y + d.y * 5.0})
				var on: Array = H.on_line(at, d, 5.0, 0.5)
				if not on.is_empty():
					H.hit(on[0], i, H.n("soulstorm", "soul", 0.35))
		"deathknell":
			for o in struck:
				if H.ok(o) and H.lw.cull_monster(o, maxf(float(H.hero.loadout.r(i)["cull"]), H.n("deathknell", "under", 0.2)), i):
					H.tell(id, "toll", o.world)


## Upheaval: one thrown up comes down on those beneath it.
func _land(i: int, o) -> void:
	if not is_instance_valid(o):
		return
	H.tell("upheaval", "land", o.world)
	for q in H.near(o.world, H.n("upheaval", "r", 1.1), 6, [o]):
		H.hit(q, i, H.n("upheaval", "land", 0.35))


## Rush: he surges forward with the wave, through those in his path.
func _rush(i: int, share: float) -> void:
	var a: Vector2 = H.hero.world
	var w: Vector2 = H.hero.face
	var far := 0.0
	var most: float = H.n("rush", "far", 3.0)
	while far + 0.25 <= most:
		var p := a + w * (far + 0.25)
		if not H.hero._clear(p.x, p.y):
			break
		far += 0.25
	if far < 0.5:
		return
	var to := a + w * far
	H.tell("rush", "rush", a, {"x1": to.x, "y1": to.y})
	for o in H.on_line(a, w, far, 0.6):
		H.hit(o, i, share * H.n("rush", "share", 0.6))
	H.hero.world = to


# --- behind: the dodge ---

## His dodge, by move `i` (the one whose surge is strongest), from `at`: its meld's own surge, or Surging's. `share` its strength.
func dodge(i: int, at: Vector2, share: float) -> void:
	var id: String = H.b(i)
	var S := _S()
	var R: float = S["dodgeRadius"]
	var where := at
	_dodging = i if id in ["rush", "tremor", "seismic", "bastion"] else -1
	match id:
		"upheaval":
			if H.hero.might > 0.0:
				share *= 1.0 + H.hero.might / 100.0 * H.n("upheaval", "spend", 1.5)
				H.tell(id, "spend", at, {"n": H.hero.might})
				H.hero.might = 0.0
		"tsunami":
			R *= H.n("tsunami", "dodge", 3.0)
		"lens":
			for o in H.list():
				if H.ok(o) and o.mark_t > 0.0 and o.world.distance_to(at) < H.n("lens", "seek", 9.0):
					where = o.world
					H.tell(id, "fly", at, {"x1": where.x, "y1": where.y})
					break
		"soulstorm":
			_raise = {"until": H.clock() + 0.15, "at": at, "r": R + 0.5, "i": i}
	H.hero._tell({"t": "surge", "x": where.x, "y": where.y, "r": R, "dodge": true})
	H.lw.rec("surge_wave")
	var before: Array = H.near(where, R)
	H.hero._blast(i, where, R, share, "nova", false, -6.0)
	if id == "":
		return
	H.tell(id, "dodge", where, {"r": R})
	var OWN := {"pestilence": "cloud", "blizzard": "ring", "nova": "fire", "thunderclap": "storm", "overload": "rune", "spark": "sooner",
		"tsunami": "wide", "undertow": "vortex", "hexwave": "circle", "lull": "bubble", "tangle": "hold", "bloodwave": "thorns",
		"deathknell": "bell", "breakthrough": "lance"}
	if OWN.has(id):
		H.tell(id, OWN[id], at, {"r": R})
	match id:
		"pestilence":
			H.ground("venom", i, at, 1.4, 4.0, H.hero.avg_hit(i, H.n("pestilence", "cloud", 0.15)))
		"blizzard":
			_frost.append({"at": at, "r": H.n("blizzard", "ring", 1.6), "t": 0.0, "dur": H.n("blizzard", "secs", 4.0), "i": i, "hit": []})
		"nova":
			for k in 8:
				var d := Vector2(1, 0).rotated(TAU * k / 8.0) * 1.5
				H.ground("burn", i, at + d, 0.5, 3.5, H.hero.avg_hit(i, 0.2))
		"thunderclap":
			H.ground("storm", i, at, 1.5, 4.0, H.hero.avg_hit(i, 0.25))
		"heartbeat":
			var drops: Array = H.hero.monsters.loot._drops if H.hero.monsters != null and H.hero.monsters.loot != null else []
			var n := 0
			for d in drops:
				if d["kind"] == "orb" and (d["at"] as Vector2).distance_to(H.hero.world) <= H.n("heartbeat", "draw", 5.0):
					d["at"] = H.hero.world
					d["age"] = 99.0
					n += 1
			H.tell(id, "draw", H.hero.world, {"n": n})
		"overload":
			H.ground("rune", i, at, R, 0.0, H.hero.avg_hit(i, share))
		"crescendo":
			if H.frenzy_full():
				H.later(0.25, func() -> void:
					H.tell("crescendo", "again", at)
					H.blast(i, at, R, share))
		"resonance":
			_echoes.append({"at": at, "t": 0.0, "n": int(H.n("resonance", "rings", 3)), "i": i, "share": share * 0.5, "next": 1.0})
		"spark":
			pass
		"undertow":
			H.ground("vortex", i, at, 1.6, 3.0, 1.0)
		"ricochet":
			for k in 8:
				var d := Vector2(1, 0).rotated(TAU * k / 8.0)
				H.tell(id, "shard", at, {"x1": at.x + d.x * 3.0, "y1": at.y + d.y * 3.0})
				for o in H.on_line(at, d, 3.0, 0.35):
					H.hit(o, i, H.n("ricochet", "shard", 0.3))
		"hexwave":
			H.ground("hex", i, at, 1.6, 4.0, 0.25)
		"lull":
			H.ground("bubble", i, at, 1.6, 4.0, 0.5)
		"tangle":
			for o in before:
				H.bind(o, H.n("tangle", "hold", 1.2))
		"bloodwave":
			for k in 6:
				var d := Vector2(1, 0).rotated(TAU * k / 6.0) * 1.3
				H.thorns(i, at + d, 0.5, H.hero.avg_hit(i, 0.3), 3.5, {"meld": "bloodwave"})
		"deathknell":
			_bells.append({"at": at, "t": 0.0, "dur": H.n("deathknell", "bell", 4.0), "next": 1.0, "i": i})
		"breakthrough":
			var w: Vector2 = H.hero.face
			H.pierce.lance_from(i, at, at + w * H.n("breakthrough", "lance", 6.0), float(H.hero.loadout.r(i)["dodge_surge"]) + 0.5)


## How much farther his dodge goes (Rush behind: twice as far).
func dodge_far() -> float:
	return H.n("rush", "farther", 2.0) if H.any("rush", false) >= 0 else 1.0


## His dodge's wait, as a share of its own (Spark behind: a third sooner).
func dodge_cd_k() -> float:
	return H.n("spark", "sooner", 0.67) if H.any("spark", false) >= 0 else 1.0


## He has landed his dodge at `at`.
func landed(at: Vector2) -> void:
	var i := _dodging
	_dodging = -1
	if i < 0:
		return
	var S := _S()
	var R: float = S["dodgeRadius"]
	match H.b(i):
		"rush", "tremor":
			H.tell(H.b(i), "landed", at, {"r": R})
			H.blast(i, at, R, float(H.hero.loadout.r(i)["dodge_surge"]))
		"seismic":
			H.tell("seismic", "slam", at)
			for q in H.near(at, H.n("seismic", "slam", 1.8)):
				H.stun(q, H.n("seismic", "stun", 0.8))
		"bastion":
			H.ground("ward", i, at, H.n("bastion", "ward", 1.6), 4.0, 0.3)
			H.tell("bastion", "ward", at)


## A kill: Soulstorm behind, one its dodge's surge killed rises as his spirit.
func killed(m, i: int) -> void:
	if _raise.is_empty() or H.clock() > float(_raise["until"]):
		return
	if m.boss or m.world.distance_to(_raise["at"]) > float(_raise["r"]):
		return
	H.raise_at(m.world, int(_raise["i"]), maxf(float(H.hero.loadout.r(int(_raise["i"]))["spirit"]), 0.5))
	H.tell("soulstorm", "rise", m.world)


func struck(_m, _i: int, _dmg: float, _c: bool, _at: Vector2) -> void:
	pass


func used(_i: int) -> void:
	pass


func step(dt: float) -> void:
	var now: float = H.clock()
	if not _hail.is_empty():
		if now > float(_hail["until"]):
			_hail = {}
		else:
			_hail["next"] = float(_hail["next"]) - dt
			if float(_hail["next"]) <= 0.0:
				_hail["next"] = 0.15
				var p: Vector2 = H.hero.world + Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0)).normalized() * randf_range(0.6, float(_S()["radius"]))
				H.tell("blizzard", "hail", p)
				for o in H.near(p, 0.6):
					H.hit(o, int(_hail["i"]), H.n("blizzard", "hail", 0.12), "frost")
					o.chill_by(H.n("blizzard", "chill", 0.35))
	if not _lull.is_empty():
		if now > float(_lull["until"]):
			_lull = {}
		elif H.once("lull", 0.3):
			for o in H.near(H.hero.world, float(_S()["radius"])):
				H.still(o, 0.5, H.n("lull", "crawl", 0.5))
	for k in range(_rings.size() - 1, -1, -1):
		var g: Dictionary = _rings[k]
		g["t"] = float(g["t"]) + dt
		if float(g["t"]) >= float(g["dur"]):
			_rings.remove_at(k)
			continue
		for o in H.near(g["at"], float(g["r"]) + 0.4):
			var d: float = o.world.distance_to(g["at"])
			if d < float(g["r"]) - 0.5:
				continue
			var key := str(o.get_instance_id())
			if now - float(g["last"].get(key, -9.0)) >= 0.6:
				g["last"][key] = now
				H.hit(o, int(g["i"]), H.n("resonance", "ring", 0.3))
				H.tell("resonance", "ring", o.world)
	for k in range(_frost.size() - 1, -1, -1):
		var fr: Dictionary = _frost[k]
		fr["t"] = float(fr["t"]) + dt
		if float(fr["t"]) >= float(fr["dur"]):
			_frost.remove_at(k)
			continue
		for o in H.near(fr["at"], float(fr["r"]) + 0.3):
			var d: float = o.world.distance_to(fr["at"])
			if d >= float(fr["r"]) - 0.45 and not fr["hit"].has(o.get_instance_id()):
				fr["hit"].append(o.get_instance_id())
				o.freeze_now()
				H.tell("blizzard", "freeze", o.world)
	for k in range(_waves.size() - 1, -1, -1):
		var wv: Dictionary = _waves[k]
		var r0: float = wv["r"]
		wv["r"] = r0 + float(wv["speed"]) * dt
		if float(wv["r"]) >= float(wv["far"]):
			_waves.remove_at(k)
			continue
		for o in H.near(wv["at"], float(wv["r"])):
			if o.world.distance_to(wv["at"]) < r0 - 0.6 or wv["hit"].has(o.get_instance_id()):
				continue
			wv["hit"].append(o.get_instance_id())
			H.hero.hit_monster(o, int(wv["i"]), float(wv["share"]), true)
			H.throw(o, wv["at"], H.n("tsunami", "carry", 1.2))
	for k in range(_bells.size() - 1, -1, -1):
		var bl: Dictionary = _bells[k]
		bl["t"] = float(bl["t"]) + dt
		bl["next"] = float(bl["next"]) - dt
		if float(bl["t"]) >= float(bl["dur"]):
			_bells.remove_at(k)
			continue
		if float(bl["next"]) <= 0.0:
			bl["next"] = 1.0
			H.tell("deathknell", "toll", bl["at"])
			var i: int = int(bl["i"])
			for o in H.near(bl["at"], H.n("deathknell", "r", 2.0)):
				H.lw.cull_monster(o, maxf(float(H.hero.loadout.r(i)["cull_mark"]), H.n("deathknell", "under", 0.2)), i, true)
	for k in range(_echoes.size() - 1, -1, -1):
		var ec: Dictionary = _echoes[k]
		ec["next"] = float(ec["next"]) - dt
		if float(ec["next"]) <= 0.0:
			ec["next"] = 1.0
			ec["n"] = int(ec["n"]) - 1
			H.tell("resonance", "echo", ec["at"])
			H.blast(int(ec["i"]), ec["at"], float(_S()["dodgeRadius"]), float(ec["share"]))
			if int(ec["n"]) <= 0:
				_echoes.remove_at(k)
