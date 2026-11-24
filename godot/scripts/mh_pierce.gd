## PIERCING'S MELDS AT WORK (meldshigh_rules.gd; his doc High City Melds, "Piercing"). In front, Piercing's blow goes on through the
## first enemy it strikes along a line (last_words.gd pierce_on); behind, a lance of light strikes down its line a moment later
## (throw_lance, _lance_lands). Each meld's line does something of its own:
##   Impaler     carries all it runs through on its point to its line's end, slamming them into a heap; its lance spends
##               Power's might, wider for each step of it, and drives a stake that bursts where it ends
##   Stinger     a dose more on each down the line, the last left a barb that bursts in venom; its lance leaves a trail of poison
##   Icelance    a chill harder down the line, the last frozen; its lance leaves a strip of ice that freezes as it cracks
##   Sunspear    sets the line burning, and one dying burning runs its fire down the line; its lance leaves burning ground
##   Stormlance  forks at its end; its lance arcs out to all near its line
##   Dart        each gone through takes time off its wait, and the dart comes back, striking on its way; its lance strikes down
##               the path he ran in his burst of speed
##   Battering   knocks each aside, stunned; its lance cracks the ground down its line
##   Pitchfork   Twin's second blow a line beside the first; a second lance across the first
##   Bloodlance  heals twice for each beyond the first, the last burst open into a life orb; its lance draws the life orbs on
##               its line to him
##   Fuse        a charge in each, going off down the line; its lance a string of runes going off in turn
##   Bodkin      a sight on each it passes, the last a certain critical bursting out of its back in shards; its lance strikes
##               to the marked one, a certain critical
##   Barrage     a tile farther for each step of the frenzy, and at a full frenzy a rattling volley down its line; at a full
##               frenzy each lance twice
##   Spearwall   a shield for each gone through, and a row of spears across its line that strikes and throws back what runs
##               on it; its lance leaves a wall of light that stops shots
##   Longspear   half as far again, its line lingering; its lance stands a while, striking what crosses it
##   Flicker     the line flashing twice, a blink apart, and he blinks to its end; its lance at once, flicking back down its
##               line, and sooner again
##   Broadspear  a line three times as wide; its lance as wide as a road
##   Gaff        the line dragged back to the first; its lance drags all into a vortex at its far end
##   Trident     three lines after the first; shards that go through, from the lance's end
##   Witchpin    stitches the line together with a thread of curse: a hit on one stings them all; its lance a strip of hex
##               where each that crosses is pinned a moment by a needle
##   Sundial     the slow deeper down the line, the last stood still; its lance a band of slow time
##   Skewer      the line pinned together; its lance a snare along its line
##   Harrow (with Bleeding) spikes erupting under each run through, a wound that bleeds standing still; its lance a row of thorns
##   Wraithspear (with Reaping) a kill's soul flies on down the line; Deathblow (with Culling) a cull carries it a tile farther,
##   its lance culls; Breakthrough (with Surging): mh_surge.gd.
extends RefCounted

var H
## (Fuse: charges to go off {o, at, i})
var _fuses: Array = []
## (Longspear in front: lines lingering {a, way, len, w, t, dur, i, hit})
var _lines: Array = []
## (Longspear behind: lances standing {a, way, len, w, t, dur, i, share, hit})
var _stands: Array = []
## (Spearwall: walls of light {a, b, t, dur})
var walls: Array = []
## (Skewer behind: snares along a line {a, way, len, t, dur, i, on})
var _snares: Array = []
## (Dart behind: each move's burst of speed begun {from, t})
var _dart: Array = [null, null, null]
## (Sunspear: who was set burning by one line {line: [monsters]})
var _sun := {}
var _sun_n := 0
## (Witchpin behind: its strips' needles {a, way, len, t, dur, i, pinned})
var _needles: Array = []


func _init(h) -> void:
	H = h


func fresh() -> void:
	_fuses = []
	_lines = []
	_stands = []
	walls = []
	_snares = []
	_dart = [null, null, null]
	_sun = {}
	_needles = []


static func _rot(v: Vector2, a: float) -> Vector2:
	return v.rotated(a)


# --- in front: the line ---

## The way the line goes (Pitchfork: Twin's second blow a line beside the first).
func way(i: int, w: Vector2) -> Vector2:
	if H.f(i) == "pitchfork" and H.hero.m52.blow_n % 2 == 1:
		H.tell("pitchfork", "prong", H.hero.world)
		return w.rotated(H.n("pitchfork", "spread", 0.38))
	return w


## The ways the line goes (Trident: three after the first).
func ways(i: int, w: Vector2) -> Array:
	if H.f(i) == "trident":
		var a: float = H.n("trident", "fan", 0.42)
		return [w.rotated(-a), w, w.rotated(a)]
	return [w]


func copy_k(i: int) -> float:
	return H.n("trident", "copy", 0.7) if H.f(i) == "trident" else 1.0


## How long the line is, as a share of Piercing's (Barrage: a tile more for each step of the frenzy; Longspear half as far again).
func line_k(i: int, line: float) -> float:
	match H.f(i):
		"barrage":
			return (line + H.hero.frenzy * H.n("barrage", "perStep", 1.0)) / line
		"longspear":
			return H.n("longspear", "far", 1.5)
	return 1.0


func wide_k(i: int) -> float:
	return H.n("broadspear", "wide", 3.0) if H.f(i) == "broadspear" else 1.0


## How hard the `n`th it goes through is struck (Impaler: harder on each than the one before).
func each_k(i: int, n: int) -> float:
	if H.f(i) == "impaler":
		return 1.0 + H.n("impaler", "step", 0.2) * n
	return 1.0


## Whether the `n`th of `count` is a certain critical (Bodkin: the last in the line).
func sure(i: int, n: int, count: int) -> bool:
	return H.f(i) == "bodkin" and n == count


## The `n`th of `count` gone through, `o`, has been struck.
func each(i: int, o, n: int, count: int, at: Vector2, w: Vector2) -> void:
	var id: String = H.f(i)
	if id == "" or not H.ok(o):
		return
	match id:
		"impaler":
			H.tell(id, "drive", o.world, {"n": n})
		"bodkin":
			H.tell(id, "sight", o.world)
			if n == count:
				H.tell(id, "gap", o.world)
		"stinger":
			for k in n:
				o.dose(maxf(1.0, H.hero.avg_hit(i, H.n("stinger", "dose", 0.12))), -1.0, "poison")
			H.tell(id, "dose", o.world, {"n": n})
		"icelance":
			o.chill_by(minf(0.8, H.n("icelance", "chill", 0.25) + H.n("icelance", "per", 0.12) * n))
			if n == count:
				o.freeze_now()
				H.tell(id, "freeze", o.world)
		"sunspear":
			o.set_alight(maxf(1.0, H.hero.avg_hit(i, H.n("sunspear", "burn", 0.25))), H.n("sunspear", "secs", 3.0))
			o.m52["sunspear"] = _sun_n
			if not _sun.has(_sun_n):
				_sun[_sun_n] = []
			_sun[_sun_n].append(o)
			H.tell(id, "ablaze", o.world)
		"dart":
			H.cool_move(i, H.n("dart", "cut", 0.25))
			H.tell(id, "cut", o.world)
		"batteringram":
			var side := Vector2(-w.y, w.x) * (1.0 if n % 2 == 1 else -1.0)
			H.throw(o, o.world - side, H.n("batteringram", "throw", 1.2))
			H.stun(o, H.n("batteringram", "stun", 0.7))
			H.tell(id, "aside", o.world, {"x1": o.world.x + side.x, "y1": o.world.y + side.y})
		"bloodlance":
			H.heal_life(H.hero.max_life * H.n("bloodlance", "heal", 0.012), id)
		"fuse":
			_fuses.append({"o": o, "at": H.clock() + H.n("fuse", "wait", 0.35) + H.n("fuse", "gap", 0.15) * n, "i": i})
			H.tell(id, "charge", o.world, {"n": n})
		"spearwall":
			H.shield(H.n("spearwall", "shield", 0.02), id)
		"witchpin":
			H.curse(o, H.n("witchpin", "secs", 4.0), H.n("witchpin", "curse", 0.12) + H.n("witchpin", "per", 0.05) * n)
			H.tell(id, "curse", o.world, {"n": n})
		"sundial":
			H.still(o, H.n("sundial", "secs", 2.0), minf(0.85, H.n("sundial", "slow", 0.25) + H.n("sundial", "per", 0.12) * n))
			if n == count:
				H.stun(o, H.n("sundial", "stop", 0.8))
			H.tell(id, "slow", o.world, {"n": n})
		"harrow":
			o.m52["harrow_t"] = H.clock() + H.n("harrow", "secs", 4.0)
			H.tell(id, "wound", o.world)
			# (spikes erupt from the ground under it, cutting it and those beside it)
			H.tell(id, "spikes", o.world)
			for q in H.near(o.world, H.n("harrow", "r", 0.9), 4):
				H.hit(q, i, H.n("harrow", "spike", 0.15))
				H.lw.bleed_monster(q, maxf(1.0, H.hero.avg_hit(i, 0.2)), 3.0)


## The line is done: `first` struck, then `hits` gone through, along `w` from `at`, `line` tiles.
func end(i: int, first, hits: Array, at: Vector2, w: Vector2, line: float, frac: float) -> void:
	var id: String = H.f(i)
	if id == "":
		return
	_sun_n += 1
	var all: Array = ([first] if H.ok(first) else []) + hits
	var last = hits.back() if not hits.is_empty() else first
	var lat: Vector2 = last.world if last != null and is_instance_valid(last) else at + w * line
	H.tell(id, "line", at, {"x1": at.x + w.x * line, "y1": at.y + w.y * line, "n": hits.size()})
	match id:
		"bodkin":
			# (the last one's certain critical bursts out of its back in shards)
			if last != null and is_instance_valid(last):
				var lw: Vector2 = last.world
				for t in [-0.35, 0.0, 0.35]:
					var d: Vector2 = w.rotated(t)
					H.tell(id, "shard", lw, {"x1": lw.x + d.x * 2.2, "y1": lw.y + d.y * 2.2})
					for o in H.on_line(lw, d, H.n("bodkin", "shard", 2.2), 0.35, all):
						H.hit(o, i, H.n("bodkin", "shards", 0.3))
		"dart":
			# (the dart comes back to his hand, striking on its way)
			var from: Vector2 = at + w * line
			H.later(H.n("dart", "back", 0.25), func() -> void:
				var to: Vector2 = H.hero.world
				var d: Vector2 = to - from
				if d.length() < 0.5:
					return
				H.tell("dart", "return", from, {"x1": to.x, "y1": to.y})
				for o in H.on_line(from, d.normalized(), d.length(), 0.45):
					H.hit(o, i, H.n("dart", "return", 0.3)))
		"bloodlance":
			# (the last burst open, its life left as an orb)
			if not hits.is_empty() and last != null and is_instance_valid(last):
				H.orb(last.world)
				H.tell(id, "burst", last.world)
		"spearwall":
			# (a row of spears springs up across its line: what runs onto them is struck and thrown back)
			var c: Vector2 = H.hero.world + w * H.n("spearwall", "ahead", 1.6)
			var across := Vector2(-w.y, w.x)
			var half: float = H.n("spearwall", "half", 1.5)
			var a0: Vector2 = c - across * half
			_lines.append({"a": a0, "way": across, "len": half * 2.0, "w": 0.5, "t": 0.0, "dur": H.n("spearwall", "row", 3.0), "i": i, "hit": [], "id": "spearwall", "push": w})
			H.tell(id, "spears", a0, {"x1": a0.x + across.x * half * 2.0, "y1": a0.y + across.y * half * 2.0, "secs": H.n("spearwall", "row", 3.0)})
		"stinger":
			# (the sting stays in the last as a barb that swells, and bursts in venom)
			if last != null and is_instance_valid(last):
				var lst = last
				H.tell(id, "barb", lst.world)
				H.later(H.n("stinger", "burst", 0.8), func() -> void:
					var p: Vector2 = lst.world if is_instance_valid(lst) else lat
					H.tell("stinger", "burst", p)
					H.ground("venom", i, p, H.n("stinger", "r", 1.2), 3.0, H.hero.avg_hit(i, H.n("stinger", "dps", 0.15)))
					for q in H.near(p, H.n("stinger", "r", 1.2) + 0.2):
						q.dose(maxf(1.0, H.hero.avg_hit(i, H.n("stinger", "dose", 0.12))), -1.0, "poison"))
		"impaler":
			# (all it ran through carried on its point to the line's end, and slammed there in a heap)
			var to: Vector2 = at + w * line
			if not H.open(to):
				to = lat
			var n := 0
			for o in all:
				if H.ok(o) and not o.boss:
					H.drag(o, to, 0.35)
					n += 1
			if n > 0:
				H.tell(id, "carry", at, {"x1": to.x, "y1": to.y, "n": n})
				var share: float = H.n("impaler", "heap", 0.25) + H.n("impaler", "perBody", 0.1) * n
				H.later(0.28, func() -> void:
					H.tell("impaler", "heap", to, {"n": n})
					H.blast(i, to, H.n("impaler", "heapR", 1.3), share))
		"witchpin":
			# (the line stitched together with a thread of the curse)
			var until: float = H.clock() + H.n("witchpin", "thread", 4.0)
			for o in all:
				if H.ok(o):
					o.m52["thread"] = _sun_n
					o.m52["thread_t"] = until
			if all.size() > 1:
				H.tell(id, "stitch", at, {"x1": lat.x, "y1": lat.y, "n": all.size()})
		"barrage":
			if H.hero.frenzy > 0:
				H.tell(id, "reach", at + w * line, {"n": H.hero.frenzy})
			if H.frenzy_full():
				# (a rattling volley down its line, once for each step of the frenzy)
				for k in H.hero.frenzy:
					H.later(H.n("barrage", "gap", 0.1) * (k + 1), func() -> void:
						H.tell("barrage", "volley", at, {"x1": at.x + w.x * line, "y1": at.y + w.y * line})
						for o in H.on_line(at, w, line, 0.45):
							H.hit(o, i, H.n("barrage", "volley", 0.2)))
		"broadspear":
			H.tell(id, "wide", at, {"x1": at.x + w.x * line, "y1": at.y + w.y * line})
		"trident":
			H.tell(id, "three", at, {"x1": at.x + w.x * line, "y1": at.y + w.y * line})
		"stormlance":
			for q in H.near(lat, H.n("stormlance", "reach", 3.0), 8, all):
				H.hit(q, i, H.n("stormlance", "arc", 0.4), "lightning")
				H.tell(id, "fork", lat, {"x1": q.world.x, "y1": q.world.y})
		"batteringram":
			if H.ok(first):
				var side := Vector2(w.y, -w.x)
				H.throw(first, first.world - side, H.n("batteringram", "throw", 1.2))
				H.stun(first, H.n("batteringram", "stun", 0.7))
		"gaff":
			if H.ok(first):
				for o in hits:
					H.drag(o, first.world, 0.7)
				H.tell(id, "haul", first.world, {"n": hits.size()})
		"skewer":
			var count := all.size()
			for o in all:
				H.bind(o, H.n("skewer", "hold", 1.0) * (1.0 + H.n("skewer", "per", 0.25) * (count - 1)))
			H.tell(id, "pin", lat, {"n": count})
		"longspear":
			_lines.append({"a": at, "way": w, "len": line, "w": 0.5, "t": 0.0, "dur": H.n("longspear", "linger", 1.2), "i": i, "hit": all.map(func(o): return o.get_instance_id())})
			H.tell(id, "linger", at, {"x1": at.x + w.x * line, "y1": at.y + w.y * line})
		"flicker":
			var me = self
			H.later(H.n("flicker", "after", 0.12), func() -> void: me._flash(i, all, at, w, line))
		"deathblow":
			# (a cull carries it a tile farther, and those it then reaches are struck too, as long as it culls)
			var reach := at + w * line
			var gone := all.duplicate()
			for _k in 4:
				var culled := 0
				for o in all:
					if is_instance_valid(o) and o.dead and float(o.m52.get("culled_at", -9.0)) >= H.clock() - 0.05:
						culled += 1
				if culled <= 0:
					break
				var more: Array = H.on_line(reach, w, culled * H.n("deathblow", "per", 1.0), 0.45, gone)
				H.tell(id, "on", reach, {"x1": reach.x + w.x * culled, "y1": reach.y + w.y * culled})
				reach += w * culled
				all = []
				for o in more:
					H.hero.hit_monster(o, i, frac, true)
					all.append(o)
					gone.append(o)
				if more.is_empty():
					break


func _flash(i: int, all: Array, at: Vector2, w: Vector2, line: float) -> void:
	H.tell("flicker", "flash", at, {"x1": at.x + w.x * line, "y1": at.y + w.y * line})
	for o in all:
		H.hit(o, i, H.n("flicker", "again", 0.33))
	# (and he blinks to the end of the line, as far as it is clear)
	var a: Vector2 = H.hero.world
	var far := 0.0
	while far + 0.25 <= line:
		var p := a + w * (far + 0.25)
		if not H.hero._clear(p.x, p.y):
			break
		far += 0.25
	if far >= 1.0:
		var to := a + w * far
		H.tell("flicker", "blink", a, {"x1": to.x, "y1": to.y})
		H.hero.world = to


## A hit of move `i` on `m`: Witchpin's thread stings all the others it stitched to `m`.
func struck(m, i: int, _dmg: float, _c: bool, _at: Vector2) -> void:
	if not H.ok(m) or not m.m52.has("thread") or H.clock() > float(m.m52.get("thread_t", 0.0)):
		return
	if not H.once("thr%d" % m.get_instance_id(), H.n("witchpin", "every", 0.3)):
		return
	var line = m.m52["thread"]
	for o in H.list():
		if H.ok(o) and o != m and o.m52.get("thread", -1) == line and H.clock() <= float(o.m52.get("thread_t", 0.0)):
			H.hit(o, i, H.n("witchpin", "sting", 0.25))
			H.tell("witchpin", "thread", m.world, {"x1": o.world.x, "y1": o.world.y})


## A kill of move `i`: Sunspear's fire runs down its line; Wraithspear's soul flies on.
func killed(m, i: int) -> void:
	if m.m52.has("sunspear") and m.burn_t > 0.0:
		var line = m.m52["sunspear"]
		for o in _sun.get(line, []):
			if H.ok(o) and o != m:
				o.set_alight(maxf(o.burn_dps, 1.0) * H.n("sunspear", "harder", 1.6), H.n("sunspear", "secs", 3.0))
				H.tell("sunspear", "run", m.world, {"x1": o.world.x, "y1": o.world.y})
		_sun.erase(line)
	if H.f(i) == "wraithspear" and float(H.hero.loadout.r(i)["reap"]) > 0.0:
		var d: Vector2 = m.world - H.hero.world
		var w: Vector2 = d.normalized() if d.length() > 0.1 else H.hero.face
		var len: float = H.n("wraithspear", "len", 3.0)
		H.tell("wraithspear", "soul", m.world, {"x1": m.world.x + w.x * len, "y1": m.world.y + w.y * len})
		for o in H.on_line(m.world, w, len, 0.5, [m]):
			H.hit(o, i, H.n("wraithspear", "soul", 0.5))


func used(i: int) -> void:
	if H.b(i) == "dart":
		_dart[i] = {"from": H.hero.world, "t": H.clock()}


# --- behind: the lance ---

## How often a lance may be thrown, as a share of Piercing's own (Flicker: sooner).
func lance_every(i: int) -> float:
	return H.n("flicker", "every", 0.5) if H.b(i) == "flicker" else 1.0


## A lance of move `i` along `q` is thrown: its own changes to it.
func lance(i: int, q: Dictionary) -> void:
	var id: String = H.b(i)
	match id:
		"impaler":
			if H.hero.might > 0.0:
				var k: float = H.hero.might / 100.0
				q["share"] = float(q["share"]) * (1.0 + k * H.n("impaler", "spend", 1.5))
				q["w"] = float(H.lw.L()["pierce"]["lanceW"]) * minf(3.0, 1.0 + k * H.n("impaler", "wider", 4.0))
				q["stake"] = k
				H.tell(id, "spend", H.hero.world, {"n": H.hero.might})
				H.hero.might = 0.0
		"flicker":
			q["at"] = H.clock()
			H.tell(id, "quick", q["from"])
		"broadspear":
			q["w"] = float(H.lw.L()["pierce"]["lanceW"]) * H.n("broadspear", "lance", 3.0)
			H.tell(id, "road", q["from"], {"x1": q["from"].x + q["way"].x * float(q["len"]), "y1": q["from"].y + q["way"].y * float(q["len"])})
		"bodkin":
			var best = null
			var bd: float = H.n("bodkin", "reach", 9.0)
			for o in H.list():
				if H.ok(o) and o.mark_t > 0.0 and o.world.distance_to(H.hero.world) < bd:
					bd = o.world.distance_to(H.hero.world)
					best = o
			if best != null:
				var a: Vector2 = q["from"]
				var d: Vector2 = best.world - a
				q["way"] = d.normalized()
				q["len"] = maxf(1.0, d.length() + 0.3)
				q["sure"] = best.get_instance_id()
				H.tell(id, "seek", a, {"x1": best.world.x, "y1": best.world.y})
		"barrage":
			if H.frenzy_full():
				q["twice"] = true
				H.tell(id, "twice", q["from"])
		"pitchfork":
			var a: Vector2 = q["from"]
			var e: Vector2 = a + q["way"] * float(q["len"])
			var side := Vector2(-q["way"].y, q["way"].x)
			var half: float = H.n("pitchfork", "cross", 2.0)
			var me = self
			H.later(H.n("pitchfork", "after", 0.15), func() -> void: me.lance_from(i, e - side * half, e + side * half, float(q["share"]), {"cross": true}))
			H.tell(id, "cross", e, {"x1": e.x + side.x, "y1": e.y + side.y})
	if id != "":
		H.tell(id, "lance", q["from"], {"x1": q["from"].x + q["way"].x * float(q["len"]), "y1": q["from"].y + q["way"].y * float(q["len"])})


## A lance of the twist's own, from `a` to `e`, landing after Piercing's wait (none for Flicker's).
func lance_from(i: int, a: Vector2, e: Vector2, share: float, more := {}) -> void:
	var len := a.distance_to(e)
	if len < 0.3:
		return
	var P: Dictionary = H.lw.L()["pierce"]
	var w: Vector2 = (e - a) / len
	var delay: float = 0.0 if H.b(i) == "flicker" else float(P["lanceDelay"])
	H.hero._tell({"t": "lance", "x0": a.x, "y0": a.y, "x1": e.x, "y1": e.y, "w": P["lanceW"], "delay": delay})
	H.lw.rec("pierce_lance")
	var q := {"from": a, "way": w, "len": len, "at": H.clock() + delay, "skill": i, "share": share, "id": H.hero.loadout.r(i)["id"]}
	q.merge(more)
	H.lw._lances.append(q)


## Whether the lance's hit on `o` is a certain critical (Bodkin: the marked one).
func lance_sure(q: Dictionary, o) -> bool:
	return q.has("sure") and int(q["sure"]) == o.get_instance_id()


## The lance of move `i` has struck `o`.
func lance_hit(i: int, o, q: Dictionary) -> void:
	match H.b(i):
		"gaff":
			H.drag(o, q["from"] + q["way"] * float(q["len"]), 0.5)
		"deathblow":
			H.lw.cull_monster(o, maxf(float(H.hero.loadout.r(i)["cull_mark"]), H.n("deathblow", "under", 0.2)), i, true)


## The lance of move `i` has landed, striking `hits`: what its meld leaves down its line.
func lance_end(i: int, q: Dictionary, hits: Array) -> void:
	var id: String = H.b(i)
	if id == "" or q.get("cross", false) and id != "pitchfork" or q.get("back", false):
		return
	var a: Vector2 = q["from"]
	var w: Vector2 = q["way"]
	var len: float = q["len"]
	var e := a + w * len
	var pts := func(gap: float) -> Array:
		var out: Array = []
		var k := gap * 0.5
		while k < len:
			out.append(a + w * k)
			k += gap
		return out
	match id:
		"flicker":
			# (it flicks back down its line toward him, striking again)
			H.tell(id, "flick", e, {"x1": a.x, "y1": a.y})
			lance_from(i, e, a, float(q["share"]) * H.n("flicker", "back", 0.6), {"back": true})
		"impaler":
			if q.has("stake"):
				var r: float = minf(2.6, H.n("impaler", "stakeR", 1.0) + float(q["stake"]) * H.n("impaler", "stakeGrow", 3.0))
				H.tell(id, "stake", e, {"r": r})
				H.blast(i, e, r, H.n("impaler", "stake", 0.4))
		"stinger":
			H.tell(id, "trail", a, {"x1": e.x, "y1": e.y})
			for p in pts.call(1.3):
				H.ground("venom", i, p, 0.8, H.n("stinger", "cloud", 4.0), H.hero.avg_hit(i, H.n("stinger", "dps", 0.15)))
		"icelance":
			for p in pts.call(1.0):
				H.ground("ice", i, p, 0.6, H.n("icelance", "ice", 3.0), H.hero.avg_hit(i, 0.1))
			var me = self
			H.later(H.n("icelance", "crack", 1.0), func() -> void: me._crack(i, a, w, len))
		"sunspear":
			H.tell(id, "ground", a, {"x1": e.x, "y1": e.y})
			for p in pts.call(1.0):
				H.ground("burn", i, p, 0.6, H.n("sunspear", "ground", 3.5), H.hero.avg_hit(i, 0.2))
		"stormlance":
			for o in H.list():
				if not H.ok(o) or hits.has(o):
					continue
				var p: Vector2 = o.world - a
				var along := p.dot(w)
				if along < 0.0 or along > len:
					continue
				if absf(p.y * w.x - p.x * w.y) <= H.n("stormlance", "near", 2.0):
					var at := a + w * along
					H.hit(o, i, H.n("stormlance", "arc", 0.35), "lightning")
					H.tell(id, "arc", at, {"x1": o.world.x, "y1": o.world.y})
		"batteringram":
			H.tell(id, "cracks", a, {"x1": e.x, "y1": e.y})
			for p in pts.call(1.0):
				H.ground("cracks", i, p, 0.6, H.n("batteringram", "cracks", 3.5), 0.0)
		"bloodlance":
			var drops: Array = H.hero.monsters.loot._drops if H.hero.monsters != null and H.hero.monsters.loot != null else []
			var n := 0
			for d in drops:
				if d["kind"] != "orb":
					continue
				var p: Vector2 = d["at"] - a
				var along := p.dot(w)
				if along >= -0.3 and along <= len + 0.3 and absf(p.y * w.x - p.x * w.y) <= 0.9:
					d["at"] = H.hero.world
					d["age"] = 99.0
					n += 1
			H.tell(id, "draw", e, {"n": n})
		"fuse":
			H.tell(id, "runes", a, {"x1": e.x, "y1": e.y})
			var k := 0
			for p in pts.call(1.2):
				H.ground("rune", i, p, 0.75, 0.0, H.hero.avg_hit(i, H.n("fuse", "rune", 0.5)))
				var W = H.hero.wakes
				if W != null and not W.list.is_empty() and W.list.back()["kind"] == "rune":
					W.list.back()["dur"] = 0.5 + 0.15 * k
				k += 1
		"barrage":
			if q.get("twice", false) and not q.get("again", false):
				var me = self
				H.later(H.n("barrage", "again", 0.25), func() -> void: me.lance_from(i, a, e, float(q["share"]), {"again": true}))
		"spearwall":
			walls.append({"a": a, "b": e, "t": 0.0, "dur": H.n("spearwall", "wall", 3.0)})
			H.tell(id, "wall", a, {"x1": e.x, "y1": e.y, "secs": H.n("spearwall", "wall", 3.0)})
		"longspear":
			_stands.append({"a": a, "way": w, "len": len, "w": float(q.get("w", H.lw.L()["pierce"]["lanceW"])), "t": 0.0, "dur": H.n("longspear", "stand", 1.5), "i": i, "share": q["share"], "hit": hits.map(func(o): return o.get_instance_id())})
			H.tell(id, "stand", a, {"x1": e.x, "y1": e.y})
		"gaff":
			H.ground("vortex", i, e, 1.4, H.n("gaff", "vortex", 3.0), 1.0)
			H.tell(id, "vortex", e)
		"trident":
			for k in 6:
				var d := Vector2(1, 0).rotated(TAU * k / 6.0 + 0.3)
				H.tell(id, "shard", e, {"x1": e.x + d.x * 3.0, "y1": e.y + d.y * 3.0})
				for o in H.on_line(e, d, H.n("trident", "shard", 3.0), 0.35):
					H.hit(o, i, H.n("trident", "share", 0.35))
		"witchpin":
			H.tell(id, "hex", a, {"x1": e.x, "y1": e.y})
			for p in pts.call(1.4):
				H.ground("hex", i, p, 0.8, H.n("witchpin", "hex", 4.0), H.n("witchpin", "weaken", 0.25))
			_needles.append({"a": a, "way": w, "len": len, "t": 0.0, "dur": H.n("witchpin", "hex", 4.0), "i": i, "pinned": []})
		"sundial":
			H.tell(id, "band", a, {"x1": e.x, "y1": e.y})
			for p in pts.call(1.4):
				H.ground("bubble", i, p, 0.8, H.n("sundial", "band", 4.0), H.n("sundial", "crawl", 0.5))
		"skewer":
			_snares.append({"a": a, "way": w, "len": len, "t": 0.0, "dur": H.n("skewer", "snare", 6.0), "i": i, "on": H.on_line(a, w, len, 0.4).map(func(o): return o.get_instance_id())})
			H.tell(id, "snare", a, {"x1": e.x, "y1": e.y})
		"harrow":
			H.tell(id, "row", a, {"x1": e.x, "y1": e.y})
			for p in pts.call(1.0):
				H.thorns(i, p, 0.6, H.hero.avg_hit(i, H.n("harrow", "thorns", 0.3)), H.n("harrow", "secs", 3.0))


## Icelance behind: the strip cracks, freezing what still stands on it.
func _crack(i: int, a: Vector2, w: Vector2, len: float) -> void:
	H.tell("icelance", "crack", a, {"x1": a.x + w.x * len, "y1": a.y + w.y * len})
	for o in H.on_line(a, w, len, 0.6):
		o.freeze_now()


## Whether a shot flying from `p0` to `p1` meets a wall of Spearwall's (it is stopped).
func blocks(p0: Vector2, p1: Vector2) -> bool:
	for wl in walls:
		if Geometry2D.segment_intersects_segment(p0, p1, wl["a"], wl["b"]) != null:
			H.tell(str(wl.get("id", "spearwall")), "stop", p1)
			return true
	return false


func step(dt: float) -> void:
	for k in range(_fuses.size() - 1, -1, -1):
		var fz: Dictionary = _fuses[k]
		if H.clock() < float(fz["at"]):
			continue
		_fuses.remove_at(k)
		var o = fz["o"]
		if H.ok(o):
			H.tell("fuse", "go", o.world)
			H.blast(int(fz["i"]), o.world, H.n("fuse", "r", 1.1), H.n("fuse", "blast", 0.45))
	for arr in [_lines, _stands]:
		for k in range(arr.size() - 1, -1, -1):
			var L: Dictionary = arr[k]
			L["t"] = float(L["t"]) + dt
			if float(L["t"]) >= float(L["dur"]):
				arr.remove_at(k)
				continue
			for o in H.on_line(L["a"], L["way"], float(L["len"]), float(L["w"])):
				if L["hit"].has(o.get_instance_id()):
					continue
				L["hit"].append(o.get_instance_id())
				if L.get("id", "") == "spearwall":
					# (run onto the spears: struck, and thrown back)
					H.hit(o, int(L["i"]), H.n("spearwall", "spear", 0.4))
					H.throw(o, o.world - L["push"], H.n("spearwall", "throw", 1.1))
					H.tell("spearwall", "impale", o.world)
					continue
				if arr == _lines:
					H.hero.hit_monster(o, int(L["i"]), 1.0, true)
				else:
					H.hero.hit_monster(o, int(L["i"]), float(L["share"]), true)
				H.tell("longspear", "cross", o.world)
	for k in range(_needles.size() - 1, -1, -1):
		var N: Dictionary = _needles[k]
		N["t"] = float(N["t"]) + dt
		if float(N["t"]) >= float(N["dur"]):
			_needles.remove_at(k)
			continue
		for o in H.on_line(N["a"], N["way"], float(N["len"]), 0.45):
			if N["pinned"].has(o.get_instance_id()) or o.state == "sleep":
				continue
			N["pinned"].append(o.get_instance_id())
			H.bind(o, H.n("witchpin", "pin", 0.7))
			H.curse(o, 3.0, H.n("witchpin", "curse", 0.12))
			H.tell("witchpin", "needle", o.world)
	for k in range(walls.size() - 1, -1, -1):
		walls[k]["t"] = float(walls[k]["t"]) + dt
		if float(walls[k]["t"]) >= float(walls[k]["dur"]):
			walls.remove_at(k)
	for k in range(_snares.size() - 1, -1, -1):
		var S: Dictionary = _snares[k]
		S["t"] = float(S["t"]) + dt
		if float(S["t"]) >= float(S["dur"]):
			_snares.remove_at(k)
			continue
		var now: Array = H.on_line(S["a"], S["way"], float(S["len"]), 0.4)
		var ids: Array = now.map(func(o): return o.get_instance_id())
		var took := false
		for o in now:
			if not S["on"].has(o.get_instance_id()) and o.state != "sleep":
				if H.bind(o, H.n("skewer", "hold", 1.0) * 1.8) > 0.0:
					H.tell("skewer", "caught", o.world)
					took = true
					break
		S["on"] = ids
		if took:
			_snares.remove_at(k)
	for i in 3:
		var D = _dart[i]
		if D == null:
			continue
		if H.clock() - float(D["t"]) >= H.n("dart", "after", 0.9):
			_dart[i] = null
			if H.b(i) == "dart":
				lance_from(i, D["from"], H.hero.world, float(H.hero.loadout.r(i)["lance"]), {"path": true})
				H.tell("dart", "path", D["from"], {"x1": H.hero.world.x, "y1": H.hero.world.y})
