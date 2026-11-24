## BLEEDING'S MELDS AT WORK (meldshigh_rules.gd; his doc High City Melds, "Bleeding"). In front, what it hits bleeds, worse while
## it moves (last_words.gd struck, bleed_monster; the bleeding itself monsters.gd, which asks `tick` how hard each bite is); behind,
## thorns where it ends cut whatever walks through (add_thorns, _step_zones, which ask `thorns` and `cut`). Each meld's wound or
## thorns do something of their own:
##   Gore        throws back, the wound running harder while they stagger; thorns grown with Power's might
##   Gangrene    each dose of poison on a bleeding one makes it bleed harder, and it dies in a cloud of rot; thorns in a cloud of
##               poison, what they cut festering and leaving puffs of rot as it walks
##   Rimeblood   a bleeding one frozen bursts in spikes of frozen blood; thorns of ice, chilling
##   Bloodboil   one burning and bleeding spatters fire as it moves; thorns on burning ground
##   Galvanic    every arc makes bleed, and jerks them a step; thorns that strike with lightning, arcing on
##   Lacerate    each hit on one bleeding opens a cut that shows, the third bursting them open on it and those beside it;
##               thorns along his path in his burst of speed
##   Mangle      as its stun ends, the wound tears: its first steps three times as hard; thorns on cracked ground, worse on the staggered
##   Fangs       Twin's second bite doubles the bleeding; a second ring of thorns round the first
##   Bloodfeast  what they bleed streams to him, healing him, and hardens into a red shield once he is whole; a pool ringed with
##               thorns, draining the bleeding near into it and healing him inside
##   Bloodburst  a bleeding one dying bursts, all near it bleeding; a rune ringed by thorns, flinging them out as it goes off
##   Artery      a critical opens an artery: three times as hard, its blood jetting out behind, making all it reaches bleed; the
##               marked one struck a critical bursts, opening an artery in every enemy it splashes
##   Bloodrage   the bleeding near him keep his frenzy from fading, and at a full frenzy each hit on one bleeding sprays its
##               blood in an arc on those beside it; at a full frenzy thorns where he strikes
##   Thornshield behind his shield, what strikes him bleeds, and its thorns burst out as it breaks; a ward edged with thorns,
##               lashing what strikes him while he stands in it
##   Hemorrhage  the bleeding grows the longer it runs, and grown full the wound ruptures, all near bleeding; thorns spreading wider
##               the longer they stand
##   Papercut    each hit on one bleeding cuts it again at once, a paper blade flying on to the next one bleeding; thorns
##               bursting out as a flurry of blades spinning outward
##   Bramble     the bleeding spreads to those it touches; a wide thicket of thorns
##   Fishhook    dragged, they bleed hard; a vortex lined with thorns
##   Thornspray  Splitting's copies open the bleeding wider and leave thorns taking root under each they strike; thorns flung
##               out, taking root
##   Bloodhex    a cursed one's bleeding never stops, and drips into hex circles under it; a hex circle grown over with thorns,
##               each that dies in it spilling a new one
##   Clot        slowed, its bleeding is held, and pours out at once as the slow ends; a bubble of slow time full of thorns
##   Briar       held, then torn free: it bleeds hard; a snare of briars, the first to cross held and cut
##   with the High City's others: Bloodharvest (mh_reap.gd), Butcher (a cull flings blood; thorns that cull), Bloodwave (mh_surge.gd)
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Words := preload("res://scripts/words.gd")

var H
## (Lacerate behind: where his path's last thorns were laid, each move)
var _path: Array = [Vector2.INF, Vector2.INF, Vector2.INF]
## (Thornshield: his shield a moment ago, and when he was last struck; its wards behind {at, r, until, i})
var _shield_was := 0.0
var _hit_at := -9.0
var _wards: Array = []
## (Bloodhex behind: its circles {at, r, until, i})
var _circles: Array = []


func _init(h) -> void:
	H = h


func fresh() -> void:
	_path = [Vector2.INF, Vector2.INF, Vector2.INF]
	_shield_was = 0.0
	_hit_at = -9.0
	_wards = []
	_circles = []


func _secs(i: int) -> float:
	return float(H.lw.L()["bleed"]["secs"]) * float(H.hero.loadout.r(i)["last"])


func _bleed(o, dps: float, secs: float) -> void:
	if H.ok(o):
		H.lw.bleed_monster(o, maxf(1.0, dps), secs)


# --- in front ---

## Bleeding of move `i` has been laid on `m` by a hit of `dmg` (`fresh`: it was not bleeding).
func on(m, i: int, dmg: float, fresh: bool) -> void:
	var id: String = H.f(i)
	if id == "" or not H.ok(m):
		return
	m.m52["bleed_by"] = id
	m.m52["bleed_i"] = i
	if fresh or not m.m52.has("bleed_from"):
		m.m52["bleed_from"] = H.clock()
	if fresh:
		m.m52["lac"] = 0
	match id:
		"gore":
			H.throw(m, H.hero.world, H.n("gore", "throw", 0.8))
			m.m52["gore_t"] = H.clock() + H.n("gore", "stagger", 0.8)
			H.tell(id, "gore", m.world)
		"lacerate":
			if not fresh:
				m.m52["lac"] = mini(int(H.n("lacerate", "most", 3)), int(m.m52.get("lac", 0)) + 1)
				H.tell(id, "deeper", m.world, {"n": m.m52["lac"]})
				if int(m.m52["lac"]) >= int(H.n("lacerate", "most", 3)):
					# (the third cut: they all burst open, striking it hard and bleeding those beside it)
					m.m52["lac"] = 0
					H.tell(id, "burst", m.world)
					H.hit(m, i, H.n("lacerate", "burst", 0.5))
					for q in H.near(m.world, H.n("lacerate", "r", 1.3), 4, [m]):
						_bleed(q, m.bleed_dps * 0.6, _secs(i))
		"mangle":
			m.m52["mangle"] = true
		"fangs":
			if H.hero.m52.blow_n % 2 == 1:
				m.m52["fang_t"] = H.clock() + _secs(i)
				H.tell(id, "bite", m.world)
		"papercut":
			if not fresh:
				var cut: float = m.bleed_dps * H.n("papercut", "cut", 0.6)
				m.damage(maxf(1.0, roundf(cut)), "phys", false, false, [], false, true, i)
				H.tell(id, "cut", m.world)
				# (the cut flies on as a paper blade to the nearest other one bleeding)
				for q in H.near(m.world, H.n("papercut", "reach", 3.0), 4, [m]):
					if q.bleed_t > 0.0:
						q.damage(maxf(1.0, roundf(cut * H.n("papercut", "blade", 0.8))), "phys", false, false, [], false, true, i)
						H.tell(id, "blade", m.world, {"x1": q.world.x, "y1": q.world.y})
						break
		"bramble":
			m.m52["bramble"] = true
		"fishhook":
			# (hooked: hauled in toward where it struck, and the haul tears it: the bite above, x3 while thrown)
			m.m52["fish"] = true
			var to: Vector2 = H.hero.world + (m.world - H.hero.world).limit_length(H.n("fishhook", "stop", 0.7))
			if H.once("hook%d" % m.get_instance_id(), 0.4) and m.world.distance_to(to) > 0.2:
				H.drag(m, to, 0.0)
				H.tell(id, "hook", m.world, {"x1": to.x, "y1": to.y})
		"bloodhex":
			m.m52["bloodhex"] = true
		"clot":
			m.m52["clot"] = true
		"briar":
			m.m52["briar"] = true
		"harrow":
			m.m52["harrow_t"] = maxf(float(m.m52.get("harrow_t", 0.0)), H.clock() + H.n("harrow", "secs", 4.0))


## How hard one bite of `m`'s bleeding is, `dmg` as it stands (`moved`: it moved since the last bite). 0: held.
func tick(m, dmg: float, moved: bool) -> float:
	if not M52.HIGH_ON:
		return dmg
	var id: String = str(m.m52.get("bleed_by", ""))
	var now: float = H.clock()
	var k := 1.0
	# (one run through: it bleeds as hard standing still: Harrow)
	if not moved and float(m.m52.get("harrow_t", 0.0)) > now:
		k *= maxf(1.0, m.bleed_move)
	if float(m.m52.get("gore_t", 0.0)) > now:
		k *= H.n("gore", "harder", 2.0)
	if float(m.m52.get("fang_t", 0.0)) > now:
		k *= 2.0
	if float(m.m52.get("artery_t", 0.0)) > now:
		k *= H.n("artery", "open", 3.0)
	if float(m.m52.get("tear_t", 0.0)) > now:
		k *= H.n("mangle", "tear", 3.0)
	if float(m.m52.get("gal_t", 0.0)) > now:
		k *= 1.5
	match id:
		"gangrene":
			if m.poison_t > 0.0:
				k *= 1.0 + H.n("gangrene", "perDose", 0.15) * m.poison_n
				if H.once("fester%d" % m.get_instance_id(), 1.0):
					H.tell(id, "fester", m.world, {"n": m.poison_n})
		"lacerate":
			k *= 1.0 + H.n("lacerate", "per", 0.5) * int(m.m52.get("lac", 0))
		"hemorrhage":
			var grown: float = 1.0 + H.n("hemorrhage", "grow", 0.5) * (now - float(m.m52.get("bleed_from", now)))
			k *= minf(H.n("hemorrhage", "most", 3.0), grown)
			if H.once("hem%d" % m.get_instance_id(), 1.0):
				H.tell(id, "grows", m.world)
			if grown >= H.n("hemorrhage", "full", 2.0):
				# (grown full, the wound ruptures: all near it bleed, and it opens again, fresh)
				m.m52["bleed_from"] = now
				H.tell(id, "rupture", m.world)
				for q in H.near(m.world, H.n("hemorrhage", "r", 1.6), 6, [m]):
					_bleed(q, m.bleed_dps * H.n("hemorrhage", "spray", 0.6), 3.0)
		"fishhook":
			if not m.thrown.is_empty():
				k *= H.n("fishhook", "dragged", 3.0)
				if H.once("fish%d" % m.get_instance_id(), 0.5):
					H.tell(id, "drag", m.world)
		"bloodhex":
			if m.hex_t > 0.0:
				m.bleed_t = maxf(m.bleed_t, 0.6)
				if H.once("bhex%d" % m.get_instance_id(), 1.0):
					H.tell(id, "unending", m.world)
				# (its blood drips into hex circles under it as it goes)
				if H.once("drip%d" % m.get_instance_id(), H.n("bloodhex", "drip", 1.2)):
					H.ground("hex", int(m.m52.get("bleed_i", 0)), m.world, 0.8, H.n("bloodhex", "circle", 3.0), 0.25)
					H.tell(id, "drip", m.world)
		"rimeblood":
			if m.frozen_t > 0.0 and not m.m52.get("rime", false):
				m.m52["rime"] = true
				_spikes(m)
			elif m.frozen_t <= 0.0:
				m.m52["rime"] = false
		"bloodboil":
			if moved and m.burn_t > 0.0 and H.once("boil%d" % m.get_instance_id(), 0.5):
				H.tell(id, "spatter", m.world)
				for q in H.near(m.world, H.n("bloodboil", "r", 1.3), 4, [m]):
					q.set_alight(maxf(1.0, m.burn_dps * H.n("bloodboil", "fire", 0.6)), 2.0)
		"bramble":
			if H.once("bram%d" % m.get_instance_id(), 0.5):
				for q in H.near(m.world, m.r + 0.9, 4, [m]):
					if q.bleed_t <= 0.0:
						_bleed(q, m.bleed_dps * H.n("bramble", "spread", 0.5), 3.0)
						H.tell(id, "spread", m.world, {"x1": q.world.x, "y1": q.world.y})
		"clot":
			if m.still_t > 0.0:
				m.m52["held"] = float(m.m52.get("held", 0.0)) + dmg * k
				return 0.0
			elif float(m.m52.get("held", 0.0)) > 0.0:
				var all: float = float(m.m52["held"])
				m.m52["held"] = 0.0
				H.tell(id, "pour", m.world, {"n": all})
				return dmg * k + all
		"mangle":
			if m.stun_t > 0.0:
				m.m52["stunned"] = true
			elif m.m52.get("stunned", false):
				m.m52["stunned"] = false
				m.m52["tear_t"] = now + H.n("mangle", "secs", 1.5)
				H.tell(id, "tear", m.world)
		"briar":
			if m.bind_t > 0.0:
				m.m52["bound"] = true
			elif m.m52.get("bound", false):
				m.m52["bound"] = false
				m.m52["tear_t"] = now + H.n("briar", "secs", 1.5)
				m.damage(maxf(1.0, roundf(m.bleed_dps * H.n("briar", "tear", 1.5))), "phys", false, false, [], false, true, int(m.m52.get("bleed_i", -1)))
				H.tell(id, "tear", m.world)
		"bloodfeast":
			# (what it bleeds streams to him, healing him; once he is whole, it hardens round him into a red shield)
			if H.hero.life >= H.hero.max_life - 0.5:
				H.shield(H.n("bloodfeast", "harden", 0.006), id)
				if H.once("harden", 1.0):
					H.tell(id, "harden", H.hero.world)
			else:
				H.heal_life(dmg * k * H.n("bloodfeast", "share", 0.25), id)
			if H.once("feast%d" % m.get_instance_id(), 0.6):
				H.tell(id, "stream", m.world, {"x1": H.hero.world.x, "y1": H.hero.world.y})
	if m.bleed_t <= 0.0:
		m.m52["lac"] = 0
	return dmg * k


## Rimeblood: its frozen blood bursts in spikes, cutting and bleeding those near.
func _spikes(m) -> void:
	var i: int = int(m.m52.get("bleed_i", 0))
	H.tell("rimeblood", "spikes", m.world)
	for q in H.near(m.world, H.n("rimeblood", "r", 1.6), 6, [m]):
		H.hit(q, i, H.n("rimeblood", "spike", 0.35), "frost")
		_bleed(q, m.bleed_dps * 0.6, 3.0)


## A hit of move `i` has landed on `m` (`c`: a critical): Artery's, and at a full frenzy Bloodrage's thorns.
func struck(m, i: int, _dmg: float, c: bool, _at: Vector2) -> void:
	var front_a: bool = H.f(i) == "artery"
	var marked_a: bool = H.ok(m) and m.m52.get("artery_mark", false)
	if c and H.ok(m) and (front_a or marked_a):
		m.m52["artery_t"] = H.clock() + _secs(i)
		m.m52.erase("artery_mark")
		H.tell("artery", "open", m.world)
		var dps: float = maxf(m.bleed_dps, H.hero.avg_hit(i, 0.3))
		if front_a:
			# (its blood jets out behind it, and all the jet reaches bleed)
			var d: Vector2 = m.world - H.hero.world
			var w: Vector2 = d.normalized() if d.length() > 0.1 else H.hero.face
			var len: float = H.n("artery", "jet", 2.6)
			H.tell("artery", "jet", m.world, {"x1": m.world.x + w.x * len, "y1": m.world.y + w.y * len})
			for o in H.on_line(m.world, w, len, 0.5, [m]):
				_bleed(o, dps * H.n("artery", "jetShare", 0.8), _secs(i))
		if marked_a:
			# (the marked one's blood bursts out, opening an artery in every enemy it splashes)
			H.tell("artery", "burst", m.world)
			for q in H.near(m.world, H.n("artery", "r", 1.7), 8, [m]):
				_bleed(q, dps * 0.6, _secs(i))
				q.m52["artery_t"] = H.clock() + _secs(i)
	if H.f(i) == "bloodrage" and H.frenzy_full() and H.ok(m) and m.bleed_t > 0.0 and H.once("brage%d" % m.get_instance_id(), 0.3):
		# (at a full frenzy, a hit on one bleeding sprays its blood in an arc on those beside it)
		H.tell("bloodrage", "spray", m.world, {"r": 1.4})
		for q in H.near(m.world, H.n("bloodrage", "arc", 1.4), 4, [m]):
			H.hit(q, i, H.n("bloodrage", "spray", 0.15))
			_bleed(q, m.bleed_dps * 0.6, _secs(i))
	if H.b(i) == "bloodrage" and H.frenzy_full() and H.once("rage%d" % i, H.n("bloodrage", "every", 0.6)) and H.ok(m):
		H.thorns(i, m.world, 0.7, H.hero.avg_hit(i, float(H.hero.loadout.r(i)["thorns"])) * 0.5, 2.5)
		H.tell("bloodrage", "spring", m.world)


## Galvanic: an arc makes what it strikes bleed, and jerks it a step.
func arc(o, i: int, from: Vector2) -> void:
	if H.f(i) != "galvanic" or not H.ok(o):
		return
	_bleed(o, H.hero.avg_hit(i, H.n("galvanic", "bleed", 0.3)), _secs(i))
	o.m52["bleed_by"] = "galvanic"
	o.m52["gal_t"] = H.clock() + 0.6
	H.throw(o, from, H.n("galvanic", "jerk", 0.45))
	H.tell("galvanic", "jolt", o.world, {"x1": from.x, "y1": from.y})


## Thornspray: a copy of Splitting striking one bleeding opens it wider.
func copy_hit(o, i: int) -> void:
	if H.f(i) != "thornspray" or not H.ok(o):
		return
	if o.bleed_t > 0.0:
		o.bleed_dps *= H.n("thornspray", "wider", 1.3)
		H.tell("thornspray", "wider", o.world)
	# (thorns take root under it)
	if H.once("troot%d" % o.get_instance_id(), 1.0):
		H.thorns(i, o.world, 0.5, H.hero.avg_hit(i, H.n("thornspray", "root", 0.2)), 2.5, {"meld": "thornspray"})
		H.tell("thornspray", "root", o.world)


## Artery behind: the one Precise marks bleeds while it carries the mark, and a critical on it opens its artery.
func marked(m, i: int) -> void:
	if H.b(i) == "artery" and H.ok(m):
		_bleed(m, H.hero.avg_hit(i, H.n("artery", "mark", 0.3)), float(Words.data()["precise"]["markTime"]))
		m.m52["artery_mark"] = true
		H.tell("artery", "mark", m.world)



## Thornshield in front: behind his shield, what strikes him bleeds.
func struck_him(src) -> void:
	_hit_at = H.clock()
	if src == null or not H.ok(src):
		return
	var i: int = H.any("thornshield")
	if i >= 0 and (H.hero.shield > 0.0 or H.hero.barrier > 0.0):
		_bleed(src, H.hero.avg_hit(i, H.n("thornshield", "bleed", 0.4)), _secs(i))
		H.tell("thornshield", "prick", src.world)
	# (behind: the ward's thorns lash what strikes him while he stands in it)
	for wd in _wards:
		if H.clock() <= float(wd["until"]) and H.hero.world.distance_to(wd["at"]) <= float(wd["r"]) and H.once("lash", 0.4):
			H.hit(src, int(wd["i"]), H.n("thornshield", "lash", 0.3))
			_bleed(src, H.hero.avg_hit(int(wd["i"]), 0.25), _secs(int(wd["i"])))
			H.tell("thornshield", "lash", wd["at"], {"x1": src.world.x, "y1": src.world.y})
			break


## A kill of move `i`: Bloodburst's spray.
func killed(m, i: int) -> void:
	if H.f(i) == "gangrene" and m.poison_t > 0.0 and m.bleed_t > 0.0:
		# (festering, it dies in a cloud of rot that poisons and bleeds those near)
		H.tell("gangrene", "rot", m.world)
		H.ground("venom", i, m.world, H.n("gangrene", "rot", 1.4), 4.0, H.hero.avg_hit(i, H.n("gangrene", "dps", 0.15)))
		for q in H.near(m.world, H.n("gangrene", "rot", 1.4), 6, [m]):
			_bleed(q, maxf(m.bleed_dps, H.hero.avg_hit(i, 0.2)) * 0.6, _secs(i))
	if H.f(i) == "bloodburst" and m.bleed_t > 0.0:
		H.tell("bloodburst", "spray", m.world)
		for q in H.near(m.world, H.n("bloodburst", "r", 1.8), 8, [m]):
			_bleed(q, maxf(m.bleed_dps, H.hero.avg_hit(i, 0.2)) * H.n("bloodburst", "share", 0.8), _secs(i))


func used(_i: int) -> void:
	pass


## Any enemy dead: one dying in Bloodhex's circle spills a new one where it fell.
func died(m) -> void:
	for c in _circles.duplicate():
		if H.clock() <= float(c["until"]) and m.world.distance_to(c["at"]) <= float(c["r"]) + 0.3:
			var i: int = int(c["i"])
			var r: float = float(c["r"]) * 0.8
			H.ground("hex", i, m.world, r, 3.0, 0.25)
			H.thorns(i, m.world, r, H.hero.avg_hit(i, 0.2), 3.0, {"meld": "bloodhex"})
			_circles.append({"at": m.world, "r": r, "until": H.clock() + 3.0, "i": i})
			H.tell("bloodhex", "spill", m.world, {"r": r})
			return


# --- behind: the thorns ---

## Thorns `z` of move `i` are being laid: their meld's own changes, and what it lays with them.
func thorns(i: int, z: Dictionary) -> void:
	var id: String = H.b(i)
	if id == "":
		return
	z["meld"] = id
	var at := Vector2(z["x"], z["y"])
	match id:
		"gore":
			var k: float = 1.0 + H.hero.might / 100.0 * H.n("gore", "grow", 1.0)
			z["r"] = float(z["r"]) * minf(2.0, k)
			z["dmg"] = float(z["dmg"]) * k
		"gangrene":
			H.ground("venom", i, at, float(z["r"]), float(z["dur"]), H.hero.avg_hit(i, H.n("gangrene", "dps", 0.15)))
		"bloodboil":
			H.ground("burn", i, at, float(z["r"]), float(z["dur"]), H.hero.avg_hit(i, H.n("bloodboil", "ground", 0.2)))
		"mangle":
			H.ground("cracks", i, at, float(z["r"]), float(z["dur"]), 0.0)
		"fangs":
			var r0: float = z["r"]
			H.later(H.n("fangs", "after", 0.3), func() -> void: H.thorns(i, at, r0 * 1.9, float(z["dmg"]), float(z["dur"]), {"meld": "fangs", "rin": r0}))
		"bloodburst":
			H.ground("rune", i, at, float(z["r"]), 0.0, H.hero.avg_hit(i, 0.5))
			var me = self
			H.later(1.25, func() -> void: me._fling(i, at))
		"thornshield":
			var R: float = H.n("thornshield", "ward", 1.8)
			H.ground("ward", i, at, R, float(z["dur"]), H.n("thornshield", "guard", 0.3))
			z["r"] = R
			z["rin"] = R - 0.55
			_wards.append({"at": at, "r": R, "until": H.clock() + float(z["dur"]), "i": i})
		"hemorrhage":
			z["r0"] = z["r"]
		"bloodfeast":
			z["pool"] = true
		"papercut":
			z["every"] = 0.25
			z["r0"] = float(z["r"]) * H.n("papercut", "out", 1.6)
			z["r"] = float(z["r0"]) * 0.25
		"bramble":
			z["r"] = float(z["r"]) * H.n("bramble", "wide", 2.2)
		"fishhook":
			H.ground("vortex", i, at, float(z["r"]) * 1.3, float(z["dur"]), 1.0)
		"thornspray":
			for k in 5:
				var d: Vector2 = Vector2(1, 0).rotated(TAU * k / 5.0 + 0.4) * H.n("thornspray", "far", 1.9)
				H.thorns(i, at + d, 0.5, float(z["dmg"]) * 0.6, float(z["dur"]), {"meld": "thornspray"})
			H.tell(id, "fling", at)
		"bloodhex":
			H.ground("hex", i, at, float(z["r"]), float(z["dur"]), 0.25)
			_circles.append({"at": at, "r": float(z["r"]), "until": H.clock() + float(z["dur"]), "i": i})
		"clot":
			H.ground("bubble", i, at, float(z["r"]), float(z["dur"]), 0.5)
			z["every"] = 0.3
		"briar":
			z["briar"] = true
	var BEH := {"gore": "grown", "gangrene": "cloud", "rimeblood": "rime", "bloodboil": "burning", "galvanic": "charged", "mangle": "cracked",
		"fangs": "ring", "bloodburst": "rune", "thornshield": "ward", "hemorrhage": "long", "papercut": "flurry", "bramble": "thicket",
		"bloodfeast": "pool",
		"fishhook": "vortex", "thornspray": "spray", "bloodhex": "hex", "clot": "bubble", "briar": "briar", "butcher": "culling"}
	H.tell(id, BEH.get(id, "thorns"), at, {"r": z["r"]})


## Bloodburst behind: the rune goes off and flings its thorns out.
func _fling(i: int, at: Vector2) -> void:
	H.tell("bloodburst", "fling", at)
	for q in H.near(at, H.n("bloodburst", "fling", 2.4), 8):
		H.hit(q, i, H.n("bloodburst", "thorn", 0.3))
		_bleed(q, H.hero.avg_hit(i, 0.25), _secs(i))


## A cut of thorns `z` on `o` has landed: their meld's own.
func cut(o, z: Dictionary) -> void:
	var id: String = str(z.get("meld", ""))
	var i: int = int(z["skill"])
	if id == "" or not H.ok(o):
		return
	match id:
		"rimeblood":
			o.chill_by(H.n("rimeblood", "chill", 0.3))
		"galvanic":
			H.hit(o, i, H.n("galvanic", "strike", 0.2), "lightning")
			var nx: Array = H.near(o.world, 2.5, 1, [o])
			if not nx.is_empty():
				H.hit(nx[0], i, H.n("galvanic", "strike", 0.2), "lightning")
				H.tell(id, "arc", o.world, {"x1": nx[0].world.x, "y1": nx[0].world.y})
		"mangle":
			if o.stagger_t > 0.0:
				H.hit(o, i, H.n("mangle", "staggered", 0.3))
		"gangrene":
			o.m52["fester_t"] = H.clock() + H.n("gangrene", "fester", 4.0)
			o.m52["fester_i"] = i
		"hemorrhage":
			H.hit(o, i, H.n("hemorrhage", "deeper", 0.05) * float(z["t"]))
		"briar":
			if z.get("briar", false):
				z["briar"] = false
				H.bind(o, H.n("briar", "hold", 1.4))
				H.tell(id, "caught", o.world)
		"butcher":
			H.lw.cull_monster(o, maxf(float(H.hero.loadout.r(i)["cull_mark"]), H.n("butcher", "under", 0.2)), i, true)


## Whether `o` at `d` from thorns `z` is in them (a ring's, Fangs' second and Thornshield's edge, only its band).
static func inside(z: Dictionary, d: float, r: float) -> bool:
	return d <= float(z["r"]) + r * 0.5 and d >= float(z.get("rin", -1.0)) - r * 0.5


func step(_dt: float) -> void:
	var now: float = H.clock()
	for i in 3:
		if H.b(i) == "lacerate" and H.hero.haste_t > 0.0:
			if _path[i] == Vector2.INF or H.hero.world.distance_to(_path[i]) >= H.n("lacerate", "gap", 0.9):
				_path[i] = H.hero.world
				H.thorns(i, H.hero.world, 0.5, H.hero.avg_hit(i, float(H.hero.loadout.r(i)["thorns"])) * 0.6, 2.5, {"meld": "lacerate"})
				H.tell("lacerate", "path", H.hero.world)
		else:
			_path[i] = Vector2.INF
	# (Thornshield in front: as his shield breaks under a blow, its thorns burst out all round him)
	var sh: float = H.hero.shield + H.hero.barrier
	var ti: int = H.any("thornshield")
	if ti >= 0 and _shield_was > 0.0 and sh <= 0.0 and now - _hit_at < 0.3:
		H.tell("thornshield", "burst", H.hero.world)
		for q in H.near(H.hero.world, H.n("thornshield", "burst", 1.8)):
			H.hit(q, ti, H.n("thornshield", "burstShare", 0.3))
			_bleed(q, H.hero.avg_hit(ti, 0.25), _secs(ti))
	_shield_was = sh
	for k in range(_wards.size() - 1, -1, -1):
		if now > float(_wards[k]["until"]):
			_wards.remove_at(k)
	for k in range(_circles.size() - 1, -1, -1):
		if now > float(_circles[k]["until"]):
			_circles.remove_at(k)
	# (their thorns as they stand: Hemorrhage's spreading, Papercut's flurry spinning out, Bloodfeast's pool draining)
	for z in H.lw.zones:
		if z["kind"] != "thorns":
			continue
		var zat := Vector2(z["x"], z["y"])
		match str(z.get("meld", "")):
			"hemorrhage":
				z["r"] = float(z["r0"]) * minf(H.n("hemorrhage", "widest", 2.2), 1.0 + H.n("hemorrhage", "spread", 0.6) * float(z["t"]))
				if H.once("hspread" + str(zat), 1.0):
					H.tell("hemorrhage", "spread", zat, {"r": z["r"]})
			"papercut":
				z["r"] = float(z["r0"]) * minf(1.0, 0.25 + float(z["t"]) / H.n("papercut", "spin", 0.6))
			"bloodfeast":
				var zi: int = int(z["skill"])
				if H.hero.world.distance_to(zat) <= float(z["r"]) + 0.3 and H.once("pool", 0.5):
					H.heal_life(H.hero.max_life * H.n("bloodfeast", "pool", 0.006), "bloodfeast")
					H.tell("bloodfeast", "heal", H.hero.world)
				for o in H.near(zat, float(z["r"]) + H.n("bloodfeast", "drain", 1.6)):
					if o.bleed_t > 0.0 and H.once("drain%d" % o.get_instance_id(), 0.6):
						o.damage(maxf(1.0, roundf(o.bleed_dps * 0.5)), "phys", false, false, [], false, true, zi)
						H.tell("bloodfeast", "drain", o.world, {"x1": zat.x, "y1": zat.y})
	# (Gangrene behind: one festering leaves puffs of rot behind it as it walks)
	for o in H.list():
		if not H.ok(o) or float(o.m52.get("fester_t", 0.0)) < now:
			continue
		var last: Vector2 = o.m52.get("seep_at", Vector2.INF)
		if (last == Vector2.INF or o.world.distance_to(last) > 0.05) and H.once("seep%d" % o.get_instance_id(), H.n("gangrene", "seep", 0.8)):
			o.m52["seep_at"] = o.world
			var gi: int = int(o.m52.get("fester_i", 0))
			H.ground("venom", gi, o.world, 0.55, 2.5, H.hero.avg_hit(gi, 0.08))
			H.tell("gangrene", "seep", o.world)
	if H.any("bloodrage") >= 0 and H.hero.frenzy > 0:
		for q in H.near(H.hero.world, H.n("bloodrage", "near", 4.0), 1):
			if q.bleed_t > 0.0:
				H.hero.frenzy_t = maxf(H.hero.frenzy_t, 0.4)
				if H.once("ragekeep", 1.0):
					H.tell("bloodrage", "keep", H.hero.world)
