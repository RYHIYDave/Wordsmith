## CHECKS: THE HIGH CITY'S SEVEN LAST WORDS (game/defs.ts PIERCE, BLEED, REAP, CULL, SURGE, PLUNDER, MIRRORING; types.ts
## LAST_WORD_IDS), `--only=lastwords`: on floor 11, a Hushed given each word in turn, and what the word does on a monster is looked for
## (Bleeding makes him bleed; Plundering steals his gold and drops it as it dies; Culling hits harder while he is low; Mirroring sends
## back part of the harm he does it; Surging warns and sends out its wave; Reaping rises once; Piercing's shots fly through walls);
## then his Strike with each word, in front and behind, on floor 2's pack.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var shot := 0
var struck := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("WORDS16 %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/w16_%02d_%s.png" % [dir, shot, name])


func _run(secs: float, until := Callable(), heal := true) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		if heal and h.life < h.max_life:
			struck += 1
			h.life = h.max_life
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


static func _ready_only(m, i: int) -> void:
	var A: Array = m.h2.acts()
	if m.h2.cds.size() != A.size():
		m.h2.cds = []
		for a in A:
			m.h2.cds.append(0.0)
	for k in A.size():
		m.h2.cds[k] = 0.0 if k == i else 999.0
	m._cd = 0.0
	if m.h2.act == null:
		m.h2._to("stand")


func _seen(what: String) -> int:
	return int(M.fx.seen.get(what, 0))


func run(main, hero, out: String) -> void:
	M = main
	h = hero
	dir = out
	M.loot.level = 30
	M.loot.ring_lit = true
	M.loot.derive()
	h.walked = 50.0
	h.unhurt = false
	await M.go_to("floor11", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	var m = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.kind == "hushed" and not o.boss and o.words.is_empty() and (m == null or o.world.distance_to(h.world) < m.world.distance_to(h.world)):
			m = o
	for o in M._monsters.list:
		if is_instance_valid(o) and o != m:
			o.queue_free()
	await M._wait(0.1)
	if m == null:
		_line(false, "no plain Hushed on floor 11")
		return
	await _on_monster(m)
	await _in_his_moves()
	print("WORDS16: %d steps, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## A blow of `m`'s, it carrying `w`: it is let at the hero, standing beside it, and its blow awaited.
func _blow_with(m, w: String, heal := true) -> bool:
	m.words = [w]
	m.half = []
	m.rise(0.0)
	m._t = 0.0
	h.world = M._spot_near(m.world, 0.9, h.world)
	_ready_only(m, 0)
	struck = 0
	var life0: float = h.life
	var got: bool = await _run(5.0, func(): return struck > 0 or h.life < life0, heal)
	await _run(0.1, Callable(), heal)
	return got


func _on_monster(m) -> void:
	# BLEEDING: its blow makes him bleed, twice as much while he walks
	h.bleed_t = 0.0
	var hit: bool = await _blow_with(m, "bleeding")
	var bled: bool = h.bleed_t > 0.0 and h.bleed_dps > 0.0
	await _snap("bleeding_on_him")
	_line(hit and bled, "BLEEDING on a monster: its blow makes him bleed %.1f a second for %.1f s" % [h.bleed_dps, h.bleed_t])
	h.bleed_t = 0.0
	m.rise(1e9)
	await _run(1.0)
	# PLUNDERING: its blow steals some of his gold, kept by it
	M.loot.gold = 1000
	hit = await _blow_with(m, "plundering")
	var taken: int = 1000 - int(M.loot.gold)
	_line(hit and taken > 0 and m.stolen == taken, "PLUNDERING on a monster: its blow steals %d of his gold, which it keeps (%d)" % [taken, m.stolen])
	m.rise(1e9)
	await _run(1.0)
	# CULLING: its blows much harder while he is low (a blow of 100, bare of his armour)
	m.words = ["culling"]
	h.life = h.max_life
	h.hurt_by(20.0, "phys", ["culling"], {}, m, m.world, true)
	var whole: float = h.max_life - h.life
	h.life = h.max_life * 0.3
	var was: float = h.life
	h.hurt_by(20.0, "phys", ["culling"], {}, m, m.world, true)
	var low: float = was - h.life
	h.life = h.max_life
	var LW: Dictionary = preload("res://scripts/words.gd").data()["last"]
	_line(absf(whole - 20.0) <= 1.0 and absf(low - roundf(20.0 * (1.0 + float(LW["cull"]["harder"])))) <= 1.0, "CULLING on a monster: a blow of 20 does %d, %d while he is under %d%% of his life" % [roundi(whole), roundi(low), roundi(float(LW["cull"]["low"]) * 100.0)])
	# MIRRORING: part of the harm he does it comes back at him
	m.words = ["mirroring"]
	m.mirror_t = 0.0
	m.rise(0.0)
	m.state = "chase"
	h.life = h.max_life
	var life0: float = m.life
	h.hit_monster(m, 0, 1.0, false)
	var done: float = life0 - m.life
	var back: float = h.max_life - h.life
	h.life = h.max_life
	_line(done > 0.0 and absf(back - maxf(1.0, roundf(done * float(LW["mirroring"]["back"])))) <= 1.0, "MIRRORING on a monster: of %d he does it, %d comes back at him" % [roundi(done), roundi(back)])
	# SURGING: every few seconds while he is near, its warning ring, then its wave
	m.words = ["surging"]
	m.surge_t = 0.3
	m.rise(0.0)
	m.state = "chase"
	h.world = M._spot_near(m.world, 1.5, h.world)
	var warned: bool = await _run(2.0, func(): return M._monsters.perils.list.any(func(p): return p.get("kind") == "warn" and p.get("by", {}).get("sound", "") == "surge_foe"))
	await _snap("surging_warns")
	struck = 0
	await _run(1.2)
	_line(warned and struck > 0, "SURGING on a monster: its warning ring round it, then its wave: the hero struck (%d)" % struck)
	# PIERCING: its shots fly on through walls (one loosed at the nearest wall that is not the map's edge: it is seen still flying
	# inside the wall, where a plain shot is gone)
	m.words = ["piercing"]
	var way := Vector2.ZERO
	var wall_at := 99.0
	for k in 32:
		var u := Vector2(cos(k * TAU / 32.0), sin(k * TAU / 32.0))
		var dd := 0.6
		while dd < 9.0:
			var p: Vector2 = m.world + u * dd
			if not M.map.open_at(floori(p.x), floori(p.y)):
				break
			dd += 0.2
		var beyond: Vector2 = m.world + u * (dd + 2.0)
		var inside: bool = beyond.x > 0.0 and beyond.y > 0.0 and beyond.x < M.map.w and beyond.y < M.map.h
		if inside and dd < wall_at:
			wall_at = dd
			way = u
	var through := false
	h.world = M._spot_near(m.world - way * 5.0, 0.0, h.world)
	if wall_at < 9.0:
		M._monsters.shoot(m, way, 10.0, wall_at + 4.0, 1.0)
		var a: Dictionary = M._monsters._arrows[-1]
		var past := [false]
		await _run(1.2, func():
			var p: Vector2 = a["pos"]
			var flying: bool = M._monsters._arrows.has(a)
			if flying and not M.map.open_at(floori(p.x), floori(p.y)):
				past[0] = true
			return past[0] or not flying)
		through = past[0]
	_line(through, "PIERCING on a monster: its shot flies on through the wall before it (%.1f tiles off)" % wall_at)
	# REAPING: struck dead, it rises once, with half its life and no words
	m.words = ["reaping"]
	var at: Vector2 = m.world
	var k0: int = M._monsters.list.size()
	m.rise(0.0)
	m.state = "chase"
	m.hurt(m.life + 10.0)
	var rose: bool = await _run(3.0, func(): return M._monsters.list.any(func(o): return is_instance_valid(o) and not o.dead and o.risen))
	var r = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.risen:
			r = o
	await _snap("reaping_rises")
	_line(rose and r != null and r.words.is_empty() and absf(r.max_life - roundf(m.max_life * 0.5)) <= 1.0 and r.world.distance_to(at) < 1.0, "REAPING on a monster: struck dead, it rises once where it fell, half its life, no words")
	# (and Plundering's gold dropped as one dies)
	if r != null:
		r.stolen = 37
		var drops0: int = M.loot._drops.size()
		r.hurt(r.life + 10.0)
		await _run(0.3)
		var gold_drop := false
		for d in M.loot._drops.slice(drops0):
			if d.get("kind") == "gold" and int(d.get("amount", 0)) == 37:
				gold_drop = true
		_line(gold_drop, "PLUNDERING on a monster: struck dead, it drops all it stole (37)")


# --- in his Strike: floor 2's pack of skeletons, as the words' own checks gather it ---

func _in_his_moves() -> void:
	await M.go_to("floor2", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	h.walked = 5.0
	if not M._w_find():
		_line(false, "no hall on floor 2 for the pack")
		return
	var near: Array = []
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == "skeleton" and not o.elite and not o.boss:
			near.append(o)
	near.sort_custom(func(a, b): return a.world.distance_to(M._w_home) < b.world.distance_to(M._w_home))
	M._w_pack = near.slice(0, M.W_FORM.size())
	for o in M._monsters.list:
		if is_instance_valid(o) and not M._w_pack.has(o):
			o.queue_free()
	await M._wait(0.2)
	h.unhurt = true
	var P: Array = M._w_pack
	var way: Vector2 = M._w_face
	# PIERCING in front: the blow goes on through the first, striking what is in a line behind it
	var r: Dictionary = M._w_set(h, 0, "front", ["piercing"])
	P[3].world = P[0].world + way * 1.5
	P[4].world = P[0].world + way * 2.6
	M._w_mark()
	var seen0 := _seen("pierceLine")
	await M._w_strike(h)
	await M._wait(0.1)
	await _snap("piercing_front")
	var lost: Array = M._w_lost()
	var thru: int = M._w_hit(h, 0, float(r["through"]))
	_line(_seen("pierceLine") > seen0 and absi(int(lost[3]) - thru) <= 1 and absi(int(lost[4]) - thru) <= 1, "PIERCING in front: through the first, the two in a line behind it struck for %s (%d each): %s" % [str(r["through"]), thru, str(lost)])
	# BLEEDING in front: what it hits bleeds
	r = M._w_set(h, 0, "front", ["bleeding"])
	await M._w_strike(h)
	await M._wait(0.1)
	var bled: bool = P[0].bleed_t > 0.0 and P[0].bleed_dps > 0.0
	M._w_mark()
	await M._wait(1.1)
	lost = M._w_lost()
	await _snap("bleeding_front")
	_line(bled and int(lost[0]) > 0, "BLEEDING in front: what it hits bleeds %.1f a second (%d lost in a second)" % [P[0].bleed_dps, int(lost[0])])
	# CULLING in front: one its hit leaves under its share dies outright
	r = M._w_set(h, 0, "front", ["culling"])
	P[0].life = P[0].max_life * float(r["cull"]) * 0.9 + M._w_hit(h, 0)
	var seen_cull := _seen("culled")
	await M._w_strike(h)
	await M._wait(0.2)
	await _snap("culling_front")
	# (and a moment on: it lies cut in two, its halves come to rest: render/words7.ts fallenW7)
	await M._wait(0.6)
	await _snap("culling_front_halves")
	_line(P[0].dead and _seen("culled") > seen_cull, "CULLING in front: struck to under %d%% of its life, it dies outright" % roundi(float(r["cull"]) * 100.0))
	# REAPING in front: a kill takes time off his waits
	var P1 = P[1]
	r = M._w_set(h, 0, "front", ["reaping"])
	h._whirl_cd = 5.0
	P1.life = 1.0
	await M._w_strike(h, P1.world - way * 1.2)
	await M._wait(0.1)
	_line(P1.dead and h._whirl_cd < 5.0 - float(r["reap"]) + 0.2, "REAPING in front: a kill leaves a soul that takes %s s off his waits (the Whirlwind's 5 s now %.2f)" % [str(r["reap"]), h._whirl_cd])
	# PLUNDERING in front and behind: a kill drops more gold; its gold bursts into his purse
	var P2 = P[2]
	r = M._w_set(h, 0, "front", ["plundering"])
	# (its gold may be swept into his purse at once, so the spray is counted, and the gold dropped or taken)
	var drops0: int = M.loot._drops.size()
	var purse0: int = M.loot.gold
	var spray0 := _seen("goldSpray")
	P2.life = 1.0
	await M._w_strike(h, P2.world - way * 1.2)
	await M._wait(0.2)
	var golds := 0
	for d in M.loot._drops.slice(drops0):
		if d.get("kind") == "gold":
			golds += 1
	var took: int = M.loot.gold - purse0
	_line(P2.dead and _seen("goldSpray") > spray0 and (golds >= 1 or took > 0), "PLUNDERING in front: a kill drops more gold (%d piles, %d taken up)" % [golds, took])
	# SURGING in front: every third use a shockwave round him
	var alive: Array = P.filter(func(o): return is_instance_valid(o) and not o.dead)
	r = M._w_set(h, 0, "front", ["surging"])
	var surges := _seen("surge")
	for k in 3:
		h._last_swing = -10.0
		await M._w_strike(h)
		await M._wait(0.15)
	await _snap("surging_front")
	_line(_seen("surge") == surges + 1, "SURGING in front: of three uses, the third releases a shockwave round him (%d)" % (_seen("surge") - surges))
	# MIRRORING in front: his reflection makes the same attack beside him
	r = M._w_set(h, 0, "front", ["mirroring"])
	var refl := _seen("reflection")
	await M._w_strike(h)
	await M._wait(0.15)
	await _snap("mirroring_front")
	_line(_seen("reflection") == refl + 1, "MIRRORED in front: his reflection beside him makes the same attack, for %s" % str(r["mirror"]))
	# BEHIND: the lance, the thorns, the spirit, the reaper's mark, the surge out of his dodge, the gold into his purse, the mirror
	r = M._w_set(h, 0, "behind", ["piercing"])
	var lances := _seen("lance")
	await M._w_strike(h)
	await M._wait(0.7)
	await _snap("piercing_behind")
	_line(_seen("lance") == lances + 1, "PIERCING behind: a moment after, a lance of light down its line")
	r = M._w_set(h, 0, "behind", ["bleeding"])
	await M._w_strike(h)
	await M._wait(0.2)
	await _snap("bleeding_behind")
	_line(h.last.zones.any(func(z): return z["kind"] == "thorns"), "BLEEDING behind: thorns where it ends, for %s s" % str(preload("res://scripts/words.gd").data()["last"]["bleed"]["thornLife"]))
	r = M._w_set(h, 0, "behind", ["culling"])
	await M._w_strike(h)
	await M._wait(0.2)
	_line(h.last.zones.any(func(z): return z["kind"] == "reaper"), "CULLING behind: a reaper's mark where it ends")
	alive = P.filter(func(o): return is_instance_valid(o) and not o.dead)
	if not alive.is_empty():
		var o = alive[0]
		r = M._w_set(h, 0, "behind", ["reaping"])
		o.life = 1.0
		await M._w_strike(h, o.world - way * 1.2)
		await M._wait(0.3)
		await _snap("reaping_behind")
		# (and once it has risen: the little grey Shade fighting for him, render/words7.ts spiritsW7)
		await M._wait(0.7)
		await _snap("reaping_spirit")
		_line(h.last.spirits.size() >= 1, "REAPING behind: a kill rises as a spirit fighting for him (%d)" % h.last.spirits.size())
	alive = P.filter(func(o): return is_instance_valid(o) and not o.dead)
	if not alive.is_empty():
		var o = alive[0]
		r = M._w_set(h, 0, "behind", ["plundering"])
		M.loot.gold = 0
		o.life = 1.0
		await M._w_strike(h, o.world - way * 1.2)
		await M._wait(0.2)
		_line(int(M.loot.gold) > 0, "PLUNDERING behind: a kill's gold bursts into his purse (%d)" % int(M.loot.gold))
	r = M._w_set(h, 0, "behind", ["mirroring"])
	await M._w_strike(h)
	await M._wait(0.2)
	var laid: bool = h.last.zones.any(func(z): return z["kind"] == "mirror")
	# (stepped off it, the pane rises where he stood: render/words7.ts paneUp; his reflection in it)
	var stood: Vector2 = h.world
	h.world = M._spot_near(stood + Vector2(1.6, -1.6), 0.0, stood)
	await M._wait(0.5)
	await _snap("mirroring_pane")
	h.world = stood
	var casts := _seen("mirrorCast")
	M._w_set(h, 0, "front", [])
	await M._w_strike(h)
	await M._wait(0.2)
	_line(laid and _seen("mirrorCast") == casts + 1, "MIRRORING behind: a mirror where he stood; his next attack it makes again, and is spent")
	r = M._w_set(h, 2, "behind", ["surging"])
	var surges2 := _seen("surge")
	h._lunge_cd = 0.0
	h._begin_lunge(h.world + h.face * 3.0)
	await M._wait(0.6)
	_line(_seen("surge") == surges2 + 1, "SURGING behind: his dodge releases a surge where it begins")
