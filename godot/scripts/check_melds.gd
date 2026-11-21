## THE CHECKS OF WORDMELDING (the meld's port, 15 Nov 2026), run by main.gd's shot mode with its helpers and on its floor:
##   `words` (--only=words; `--cases=meld` theirs alone, `--cases=meld:<word>,<word>` those words'): each of the 28 words melding
##            makes IN FRONT of and BEHIND his Strike, on main.gd's pack of six (A the one a Strike hits, B and C beside it, D and E
##            an arc's jump further off, F out of reach), his roll fixed, no critical hits (but where a word wants one): the move
##            made, and in one line what the rules did beside what the game's own formula gives (game.ts hitMonster, meldHit,
##            meldArc, meldPatch, meldZone, runeTwist, explodeKill, chainArcs, shatterKill, ruptureKill, meld8Struck, updateMelds8,
##            damageMonster, hurtHero, updateDots). A picture a case. What a move with its words comes to, number by number, is
##            words_check.gd's (none differing over 59220 loadouts); what is held here is each word's TWIST, as the fight does it.
##   `page`  (--only=meld): in town, the wordsmith: before the Meldstone, no melding; the Meldstone given (FLAME and FROST); his
##            half opened (TRADE first, then MELDING); the two laid in, refused for want of runedust, melded for one (SCALD, a new
##            word found, both used up, its page under it); two of one word (POWER II, shown before it is made); Volatile with a
##            damage word (POWDERKEG); the game's refusals (a melded word, a ranked one, a word of another group, Volatile twice, a
##            third word, a word he has none of); a word laid taken back out; the melded word set in a socket of his Strike, and
##            its name; the eight across the groups (refused by the page, as the game's page refuses them; their rules meld them);
##            a melded word burned into a piece of gear, as the game makes it there, and known on its page from then on. Its last
##            line begins MELDPAGE.
extends RefCounted

const Words := preload("res://scripts/words.gd")

var M
var h
var _bad := 0
var _n := 0


func _init(main, hero) -> void:
	M = main
	h = hero


# =====================================================================================================================
# --only=words --cases=meld
# =====================================================================================================================

## Everything on him and on the pack that the words leave, gone; the pack alive and ordinary again.
func _clean() -> void:
	h.frenzy = 0
	h.frenzy_t = 0.0
	h.shield = 0.0
	h.shield_t = 0.0
	h._later = []
	h.uses = [0, 0, 0]
	h._marked = [-1, -1, -1]
	h.melds.forget()
	h.stats["crit_chance"] = 0.0
	h.stats["block_chance"] = 0.0
	M._monsters._later.clear()
	for m in M._w_pack:
		if m.dead:
			m.dead = false
			m._dead_for = 0.0
			m.modulate.a = 1.0
			m._set_list("idle", true)
		m.mark_t = 0.0
		m.shield = 0.0
		m.last_skill = -1
		m.elite = false
		m.demolished = false
		m.summoned = false
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9


## A case begun: the words set on his Strike (main.gd _w_set: the pack whole and where it stands), and what they leave gone.
func _put(side: String, words: Array) -> Dictionary:
	_clean()
	var r: Dictionary = M._w_set(h, 0, side, words)
	_clean()
	M._w_reset(h)
	return r


func _hit(frac := 1.0, might := 0.0) -> int:
	return M._w_hit(h, 0, frac, might)


func _avg(frac := 1.0) -> float:
	return M._w_avg(h, 0, frac)


## What the pack loses from a Strike's own hits: A the whole hit, and those its splash reaches, the splash's share (quiet).
func _plain(r: Dictionary) -> Array:
	var want: Array = [_hit(), 0, 0, 0, 0, 0]
	if float(r["splash"]) > 0.0:
		var rad: float = float(r["splash"]) * float(r["size"])
		for k in range(1, 6):
			if M._w_spot(k).distance_to(M._w_spot(0)) <= rad + M._w_pack[k].r:
				want[k] = _hit(float(r["splash_dmg"]))
	return want


## A kill wanted: A's life made 1 of 1000, and nothing given for it.
func _victim() -> Object:
	var a = M._w_pack[0]
	a.max_life = 1000.0
	a.life = 1.0
	a.xp = 0.0
	a.summoned = true
	return a


func _patches(kind: String) -> Array:
	return M.wakes.list.filter(func(z): return z["kind"] == kind)


## The game's own time passes, `secs` of it, the clock by which burning and poison bite held off.
func _hold(secs: float) -> void:
	var t := 0.0
	while t < secs:
		M._monsters._dot_t = 1.0
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _near(a: float, b: float, tol := 0.001) -> bool:
	return absf(a - b) <= tol * maxf(1.0, absf(b))


## (`only`: those words alone, by name, a comma between; "" all 28)
func words(only := "") -> void:
	var made: Array = Words.made()
	if only != "":
		var some := only.split(",")
		made = made.filter(func(w): return some.has(w))
	var before: int = M._w_n
	var bad: int = M._w_bad.size()
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	for w in made:
		for side in ["front", "behind"]:
			await _case(str(w), side)
	h.stats["life_regen"] = regen
	_clean()
	print("MELDS: %d cases of the 28 words melding makes, %d not as the game's formula gives" % [M._w_n - before, M._w_bad.size() - bad])


func _case(w: String, side: String) -> void:
	var what := "strike %s %s" % [side, w]
	var r := _put(side, [w])
	var wrong: Array = []
	var said := "\"%s\"" % r["name"]
	var T: Dictionary = Words.data()["melds"]["tune"]
	var E: Dictionary = Words.data()["melds"]["eightTune"]
	var P: Array = M._w_pack
	var A = P[0]
	await M._wait(0.15)
	match [w, side]:
		# ----- THE TEN -----
		["eruption", "front"]:
			await M._w_strike(h)
			var pools: Array = _patches("burn").filter(func(z): return z.get("look") == "eruption")
			var g: Dictionary = pools[0] if pools.size() == 1 else {}
			var want: float = _hit() * float(T["eruption"]["poolDps"])
			said += "; the blast left %d pool of molten ground %.2f round for %.1f s, burning for %.2f a second (formula one hit %d x %.1f = %.2f), at A" % [pools.size(), g.get("r", 0.0), g.get("dur", 0.0), g.get("dmg", 0.0), _hit(), T["eruption"]["poolDps"], want]
			M._w_is(wrong, pools.size() == 1 and _near(g.get("r", 0.0), T["eruption"]["pool"]) and _near(g.get("dur", 0.0), T["eruption"]["poolDur"]) and _near(g.get("dmg", 0.0), want) and Vector2(g.get("x", 0.0), g.get("y", 0.0)).distance_to(M._w_spot(0)) < 0.05 and M.fx.last.get("zone", {}).get("meld") == "eruption", "%d pools %s" % [pools.size(), str(g)])
		["eruption", "behind"]:
			h.melds.heat[0] = int(T["eruption"]["heat"]) - 1
			await M._w_strike(h)
			var told: String = M.fx.last.get("text", {}).get("text", "")
			var full: int = h.melds.heat[0]
			var might: float = h.might
			# (the burning ground the first left taken away: what is read is the second's blow and its eruption)
			M.wakes.list.clear()
			M._w_mark()
			await M._w_strike_again(h)
			var hit := _hit(1.0, might)
			var blast := int(maxf(1.0, roundf(hit * float(T["eruption"]["blast"]))))
			var want: Array = [hit + blast, 0, 0, 0, 0, 0]
			for k in range(1, 6):
				if P[k].world.distance_to(A.world) <= float(T["eruption"]["blastR"]) + P[k].r:
					want[k] = blast
			var lost: Array = M._w_lost()
			said += "; a hit at heat %d: heat %d, \"%s\" told; the next erupts round A %.1f wide for %d (formula %d x %.1f): they lost %s (formula %s), heat %d" % [int(T["eruption"]["heat"]) - 1, full, told, T["eruption"]["blastR"], blast, hit, T["eruption"]["blast"], str(lost), str(want), h.melds.heat[0]]
			M._w_is(wrong, full == int(T["eruption"]["heat"]) and told == "HEAT" and lost == want and h.melds.heat[0] == 0 and M.fx.last.get("burst", {}).get("meld") == "eruption", "lost %s, heat %d" % [str(lost), h.melds.heat[0]])
		["avalanche", "front"]:
			var x0: Vector2 = A.world
			await M._w_strike(h)
			var went: float = A.world.distance_to(x0)
			var crowded := false
			# (crowded as it was shoved: the others where they stood then, before the splash shoved them in their turn)
			for k in range(1, 6):
				if M._w_spot(k).distance_to(A.world) < P[k].r + A.r:
					crowded = true
			var frozen: bool = A.frozen_t > 0.0
			var sh: Dictionary = M.fx.last.get("meldFx", {})
			said += "; A shoved %.2f tiles back from him (formula %.1f, less where a wall stops it), crowded %s, frozen %s (formula: frozen if shoved short or crowded); shove told %d" % [went, T["avalanche"]["shove"], crowded, frozen, M.fx.seen.get("meldFx", 0)]
			M._w_is(wrong, (went > float(T["avalanche"]["shove"]) * 0.8 - 0.001 or frozen) and (frozen == (went < float(T["avalanche"]["shove"]) * 0.8 or crowded)) and sh.get("what") == "shove" and int(sh.get("id", -1)) == A.id, "went %.2f, frozen %s, told %s" % [went, frozen, str(sh)])
		["avalanche", "behind"]:
			A.chill_t = 2.0
			A.chill = 0.3
			await M._w_strike(h)
			var want := int(maxf(1.0, roundf(_avg() * (1.0 + float(T["avalanche"]["chilled"])))))
			var lost: Array = M._w_lost()
			said += "; A chilled: its hit %d (formula %.2f x %.1f = %d), crush told %d" % [lost[0], _avg(), 1.0 + float(T["avalanche"]["chilled"]), want, M.fx.seen.get("meldFx", 0)]
			M._w_is(wrong, lost[0] == want and M.fx.last.get("meldFx", {}).get("what") == "crush", "lost %d" % lost[0])
		["thunder", "front"]:
			await M._w_strike(h)
			var lost: Array = M._w_lost()
			var want := _plain(r)
			var arcs: int = M.fx.seen.get("arc", 0)
			var sky: Dictionary = M.fx.last.get("arc", {})
			said += "; one bolt out of the sky (arc told %d, %s), no arcs: they lost %s (formula %s, the hit %.0f%% harder: %d); A stunned %.2f s (formula %.1f), told with %s" % [arcs, sky.get("meld", "-"), str(lost), str(want), float(T["thunder"]["bolt"]) * 100.0, _hit(), A.stun_t, T["thunder"]["stun"], M.fx.last.get("stun", {}).get("meld", "-")]
			M._w_is(wrong, lost == want and arcs == 1 and sky.get("meld") == "thunder" and sky.get("sky", false) and A.stun_t > float(T["thunder"]["stun"]) - 0.1 and M.fx.last.get("stun", {}).get("meld") == "thunder", "lost %s, arcs %d" % [str(lost), arcs])
		["thunder", "behind"]:
			h.melds.hits[0] = int(T["thunder"]["every"]) - 1
			await M._w_strike(h)
			var clap := int(maxf(1.0, roundf(_hit() * float(T["thunder"]["clap"]))))
			var want: Array = [_hit() + clap, 0, 0, 0, 0, 0]
			for k in range(1, 6):
				if P[k].world.distance_to(h.world) <= float(T["thunder"]["clapR"]) + P[k].r:
					want[k] = clap
			var lost: Array = M._w_lost()
			said += "; his %dth hit: a thunderclap round him %.1f wide for %d (formula %d x %.1f): they lost %s (formula %s), hits %d" % [int(T["thunder"]["every"]), T["thunder"]["clapR"], clap, _hit(), T["thunder"]["clap"], str(lost), str(want), h.melds.hits[0]]
			M._w_is(wrong, lost == want and h.melds.hits[0] == 0 and M.fx.last.get("burst", {}).get("meld") == "thunder", "lost %s" % str(lost))
		["blight", "front"]:
			A.life = 250000.0
			M._w_mark()
			await M._w_strike(h)
			var hit := _hit()
			var k: float = 1.0 + (float(T["blight"]["most"]) - 1.0) * (1.0 - (250000.0 - hit) / 1000000.0)
			var want: float = hit * float(r["poison"]) * k * float(r["pace"])
			said += "; A at a quarter of its life: its poison %.3f a second (formula %d x %.2f x %.4f = %.3f), the hit not weakened (%d)" % [A.poison_dps, hit, r["poison"], k, want, M._w_lost()[0]]
			M._w_is(wrong, _near(A.poison_dps, want, 1e-6) and M._w_lost()[0] == hit, "poison %.3f" % A.poison_dps)
		["blight", "behind"]:
			await M._w_strike(h)
			var bt: float = A.blight_t
			A.poison_t = 2.0
			A.poison_dps = 1.0
			M._w_mark()
			A.damage(100.0, "phys", false, false, [], false, false, -1)
			var want := int(roundf(100.0 * (1.0 + float(T["blight"]["more"]))))
			said += "; A touched: blighted %.2f s (formula %.0f); poisoned, a blow of 100 on it took %d (formula 100 x %.1f)" % [bt, T["blight"]["secs"], M._w_lost()[0], 1.0 + float(T["blight"]["more"])]
			M._w_is(wrong, bt > float(T["blight"]["secs"]) - 0.1 and M._w_lost()[0] == want, "blight %.2f, took %d" % [bt, M._w_lost()[0]])
		["scald", "front"]:
			A.burn_t = 2.0
			A.burn_dps = 1.0
			await M._w_strike(h)
			var crack := int(maxf(1.0, roundf(_hit() * float(T["scald"]["crack"]))))
			var want := _plain(r)
			want[0] += crack
			var lost: Array = M._w_lost()
			said += "; A burning, chilled by it: it cracks for %d (formula %d x %.1f): they lost %s (formula %s), A not again for %.1f s" % [crack, _hit(), T["scald"]["crack"], str(lost), str(want), A.scald_cd]
			M._w_is(wrong, lost == want and A.scald_cd > float(T["scald"]["again"]) - 0.1 and M.fx.seen.get("burst", 0) == 2, "lost %s" % str(lost))
		["scald", "behind"]:
			await M._w_strike(h)
			var steam: Array = _patches("steam")
			var g: Dictionary = steam[0] if steam.size() == 1 else {}
			var z: Dictionary = r["zone"]
			var want: float = _avg() * float(z["dps"])
			var at: Vector2 = Vector2(g.get("x", 0.0), g.get("y", 0.0))
			var out: bool = M._monsters.hero_hidden()
			h.world = at
			var inside: bool = M._monsters.hero_hidden()
			h.world = M._w_home
			said += "; it left steam (no burning ground: %d), %.1f s, hurting %.2f a second (formula %.2f x %.3f), slowing %.0f%%; he hidden standing in it %s, out of it %s" % [_patches("burn").size(), g.get("dur", 0.0), g.get("dmg", 0.0), _avg(), z["dps"], float(g.get("slow", 0.0)) * 100.0, inside, out]
			M._w_is(wrong, steam.size() == 1 and _patches("burn").is_empty() and _near(g.get("dmg", 0.0), want) and _near(g.get("slow", 0.0), T["scald"]["slow"]) and inside and not out, "%d steam %s" % [steam.size(), str(g)])
		["wildfire", "front"]:
			await M._w_strike(h)
			await M._wait(0.05)
			var arc := int(maxf(1.0, roundf(_hit() * float(r["arc_dmg"]))))
			var splash_dps: float = _hit(float(r["splash_dmg"])) * float(r["ignite"]) / 3.0 * float(r["pace"])
			var arc_dps: float = arc * maxf(r["ignite"], 0.3) / 3.0
			var ok := true
			var near: Array = [1, 2]
			for k in near:
				var want: float = maxf(splash_dps, arc_dps) if M._w_spot(k).distance_to(M._w_spot(0)) <= float(r["splash"]) * float(r["size"]) + P[k].r else arc_dps
				ok = ok and P[k].burn_t > 0.0 and _near(P[k].burn_dps, want)
			var tagged: bool = M.fx.last.get("arc", {}).get("meld") == "wildfire"
			said += "; its arcs set burning what they strike: B %.2f, C %.2f a second (formula the more of its splash's %.2f and the arc's %d x %.2f / 3 = %.2f); D, struck by a chain's jump, %.2f; arcs told as Wildfire's %s" % [P[1].burn_dps, P[2].burn_dps, splash_dps, arc, maxf(r["ignite"], 0.3), arc_dps, P[3].burn_dps if P[3].burn_t > 0.0 else 0.0, tagged]
			M._w_is(wrong, ok and tagged and P[3].burn_t <= 0.0, "B %.2f C %.2f D %.2f" % [P[1].burn_dps, P[2].burn_dps, P[3].burn_dps])
		["wildfire", "behind"]:
			await M._w_strike(h)
			var grounds: Array = _patches("burn").filter(func(z): return z.get("meld") == "wildfire")
			var g: Dictionary = grounds[0] if grounds.size() == 1 else {}
			var at := Vector2(g.get("x", 0.0), g.get("y", 0.0))
			# (all but D far off; D outside the burning but within the sparks' reach)
			for k in 6:
				if k != 3:
					P[k].world = M._w_home - M._w_face * 6.0 + Vector2(-M._w_face.y, M._w_face.x) * (k - 2.5)
			P[3].world = at + M._w_face * 2.2
			g["meld_t"] = 0.0
			M._w_mark()
			var n0: int = M.fx.seen.get("arc", 0)
			await _hold(0.75)
			var sparks: int = M.fx.seen.get("arc", 0) - n0
			var spark := int(maxf(1.0, roundf(float(g.get("dmg", 0.0)) * float(T["wildfire"]["spark"]) / 0.25)))
			var lost: int = M._w_lost()[3]
			said += "; the burning ground (Wildfire's: %d) threw %d sparks in 0.75 s (formula one at once, then each %.1f s) at D, 2.2 off it, each %d (formula %.2f x %.1f / 0.25): it lost %d" % [grounds.size(), sparks, T["wildfire"]["every"], spark, g.get("dmg", 0.0), T["wildfire"]["spark"], lost]
			M._w_is(wrong, grounds.size() == 1 and sparks == 2 and lost == 2 * spark and M.fx.last.get("arc", {}).get("meld") == "wildfire", "%d sparks, lost %d" % [sparks, lost])
		["fumes", "front"]:
			await M._w_strike(h)
			var clouds: Array = _patches("venom").filter(func(z): return z.get("look") == "fumes" and Vector2(z["x"], z["y"]).distance_to(M._w_spot(0)) < 0.05)
			var g: Dictionary = clouds[0] if clouds.size() == 1 else {}
			said += "; A burning and poisoned: a toxic cloud %.1f round for %.1f s, as hard as its poison (%.3f; formula %.3f); A not again for %.1f s" % [g.get("r", 0.0), g.get("dur", 0.0), g.get("dmg", 0.0), A.poison_dps, A.fumes_cd]
			M._w_is(wrong, clouds.size() == 1 and _near(g.get("r", 0.0), T["fumes"]["cloud"]) and _near(g.get("dur", 0.0), T["fumes"]["dur"]) and _near(g.get("dmg", 0.0), A.poison_dps) and A.fumes_cd > float(T["fumes"]["again"]) - 0.1, "%d clouds %s" % [clouds.size(), str(g)])
		["fumes", "behind"]:
			await M._w_strike(h)
			var clouds: Array = _patches("venom").filter(func(z): return z.get("meld") == "fumes")
			var g: Dictionary = clouds[0] if clouds.size() == 1 else {}
			var boom := int(maxf(1.0, roundf(float(g.get("dmg", 0.0)) * float(T["fumes"]["blast"]))))
			M._w_mark()
			A.burn_t = 2.0
			A.burn_dps = 0.001
			await _hold(0.05)
			var lost: Array = M._w_lost()
			var want: Array = [0, 0, 0, 0, 0, 0]
			for k in 6:
				if P[k].world.distance_to(Vector2(g.get("x", 0.0), g.get("y", 0.0))) <= float(g.get("r", 0.0)) + 0.5 + P[k].r:
					want[k] = boom
			var gone: bool = _patches("venom").filter(func(z): return z.get("meld") == "fumes").is_empty()
			said += "; Fumes' cloud (%.3f a second): A set burning, it goes up for %d (formula %.3f x %.0f): they lost %s (formula %s), the cloud gone %s" % [g.get("dmg", 0.0), boom, g.get("dmg", 0.0), T["fumes"]["blast"], str(lost), str(want), gone]
			M._w_is(wrong, clouds.size() == 1 and lost == want and gone and M.fx.last.get("burst", {}).get("meld") == "fumes", "lost %s" % str(lost))
		["hailstorm", "front"]:
			P[1].chill_t = 2.0
			P[1].chill = 0.3
			await M._w_strike(h)
			await M._wait(0.05)
			var passed: Array = []
			var n: int = M.fx.seen.get("arc", 0)
			# (the arc passed on from B, frozen by it, to the nearest it had not struck)
			var told: Dictionary = M.fx.last.get("arc", {})
			for o in [P[3]]:
				if o.chill_t > 0.0:
					passed.append(o.id)
			said += "; its arcs chill (C chilled %s); B, chilled already, frozen by its arc (%.2f s), passed it on to D (chilled %s); %d arcs told" % [P[2].chill_t > 0.0, P[1].frozen_t, P[3].chill_t > 0.0, n]
			M._w_is(wrong, P[2].chill_t > 0.0 and P[1].frozen_t > 0.0 and P[3].chill_t > 0.0 and M.fx.seen.get("arc", 0) >= 4, "B frozen %.2f, D chilled %s" % [P[1].frozen_t, P[3].chill_t > 0.0])
		["hailstorm", "behind"]:
			await M._w_strike(h)
			var storms: Array = _patches("storm")
			var g: Dictionary = storms[0] if storms.size() == 1 else {}
			await _hold(0.3)
			said += "; a storm of ice (no ice: %d), slowing %.0f%% (formula %.0f%%): A in it, chilled %.0f%%" % [_patches("ice").size(), float(g.get("slow", 0.0)) * 100.0, float(T["hailstorm"]["slow"]) * 100.0, A.chill * 100.0 if A.chill_t > 0.0 else 0.0]
			M._w_is(wrong, storms.size() == 1 and _patches("ice").is_empty() and _near(g.get("slow", 0.0), T["hailstorm"]["slow"]) and A.chill_t > 0.0 and A.chill >= float(T["hailstorm"]["slow"]) - 1e-9, "%d storms %s" % [storms.size(), str(g)])
		["frostbite", "front"]:
			await M._w_strike(h)
			var want: float = _hit() * float(T["frostbite"]["bite"])
			var bite: float = A.bite_dps
			M._w_mark()
			M._monsters._dot_t = 0.0
			A.poison_t = 0.0
			A.poison_dps = 0.0
			await M.get_tree().process_frame
			var lost: int = M._w_lost()[0]
			var tick := int(maxf(1.0, roundf(want * 0.5)))
			said += "; A chilled: it loses %.2f a second (formula %d x %.2f = %.2f); a bite of it: %d (formula half, %d)" % [bite, _hit(), T["frostbite"]["bite"], want, lost, tick]
			M._w_is(wrong, _near(bite, want) and lost == tick, "bite %.2f, lost %d" % [bite, lost])
		["frostbite", "behind"]:
			await M._w_strike(h)
			var ice: Array = _patches("ice").filter(func(z): return z.get("meld") == "frostbite")
			var g: Dictionary = ice[0] if ice.size() == 1 else {}
			# (the cloud of Poison behind taken away, so that what poisons A is the ice alone)
			M.wakes.list = M.wakes.list.filter(func(z): return z["kind"] != "venom")
			A.poison_t = 0.0
			A.poison_dps = 0.0
			A.poison_n = 0
			await _hold(0.3)
			said += "; Frostbite's ice (%d), biting %.3f a second: A on it poisoned %.3f a second, %d dose (formula a dose as hard as the ice)" % [ice.size(), g.get("dmg", 0.0), A.poison_dps, A.poison_n]
			M._w_is(wrong, ice.size() == 1 and A.poison_n == 1 and _near(A.poison_dps, float(g.get("dmg", 0.0))), "poison %.3f x%d" % [A.poison_dps, A.poison_n])
		["contagion", "front"]:
			await M._w_strike(h)
			await M._wait(0.05)
			var arc := int(maxf(1.0, roundf(_hit() * float(r["arc_dmg"]))))
			var want: float = arc * maxf(r["poison"], 0.2)
			said += "; every enemy its arcs strike poisoned: B %.3f, C %.3f a second (formula %d x %.2f = %.3f); D, a chain's jump, %.3f" % [P[1].poison_dps, P[2].poison_dps, arc, maxf(r["poison"], 0.2), want, P[3].poison_dps]
			M._w_is(wrong, _near(P[1].poison_dps, want) and _near(P[2].poison_dps, want) and P[3].poison_t <= 0.0, "B %.3f C %.3f" % [P[1].poison_dps, P[2].poison_dps])
		["contagion", "behind"]:
			await M._w_strike(h)
			var clouds: Array = _patches("venom").filter(func(z): return z.get("meld") == "contagion")
			var g: Dictionary = clouds[0] if clouds.size() == 1 else {}
			M.wakes.list = M.wakes.list.filter(func(z): return z["kind"] != "storm")
			M._w_mark()
			var n0: int = M.fx.seen.get("arc", 0)
			await _hold(0.35)
			var shock := int(maxf(1.0, roundf(float(g.get("dmg", 0.0)) * float(T["contagion"]["shock"]))))
			var lost: Array = M._w_lost()
			var total := 0
			for v in lost:
				total += int(v)
			said += "; Contagion's cloud (%.3f a second, the storm taken away) shocked %d in it (formula one at its bite) for %d (formula %.3f x %.0f): they lost %s" % [g.get("dmg", 0.0), M.fx.seen.get("arc", 0) - n0, shock, g.get("dmg", 0.0), T["contagion"]["shock"], str(lost)]
			M._w_is(wrong, clouds.size() == 1 and M.fx.seen.get("arc", 0) - n0 == 1 and total == shock and M.fx.last.get("arc", {}).get("meld") == "contagion", "lost %s" % str(lost))
		# ----- VOLATILE'S FIVE -----
		["demolition", "front"]:
			var v = _victim()
			var at: Vector2 = v.world
			await M._w_strike(h)
			await M._wait(0.2)
			var D: Dictionary = T["demolition"]
			var rad: float = 1.8 * float(D["bigger"])
			var boom := int(maxf(1.0, roundf(1000.0 * float(r["volatile"]) * float(D["bigger"]))))
			var want := _plain(r)
			for k in range(1, 6):
				if P[k].world.distance_to(at) <= rad + P[k].r:
					want[k] += boom
			var lost: Array = M._w_lost()
			lost[0] = 0
			want[0] = 0
			var b: Dictionary = M.fx.last.get("burst", {})
			said += "; A killed explodes %.2f round (formula 1.8 x %.1f), for %d (formula 1000 x %.2f x %.1f): the rest lost %s (formula %s)" % [b.get("r", 0.0), D["bigger"], boom, r["volatile"], D["bigger"], str(lost.slice(1)), str(want.slice(1))]
			M._w_is(wrong, v.dead and lost == want and _near(b.get("r", 0.0), rad) and b.get("meld") == "demolition", "lost %s" % str(lost))
			# (and an elite brought to half its life bursts, once, for half of it)
			_clean()
			M._w_reset(h)
			var e = P[0]
			e.elite = true
			e.max_life = 1000.0
			e.life = 500.0 + _hit() * 0.5
			M._w_mark()
			await M._w_strike(h)
			await M._wait(0.2)
			var half := int(maxf(1.0, roundf(1000.0 * float(r["volatile"]) * float(D["bigger"]) * float(D["half"]))))
			var lost2: Array = M._w_lost()
			var want2 := _plain(r)
			for k in range(1, 6):
				if P[k].world.distance_to(e.world) <= rad + P[k].r:
					want2[k] += half
			said += "; an elite struck to half its life (%.0f of 1000) bursts once for %d (formula %d x %.1f): the rest lost %s (formula %s), demolished %s" % [e.life, half, boom, D["half"], str(lost2.slice(1)), str(want2.slice(1)), e.demolished]
			M._w_is(wrong, e.demolished and not e.dead and lost2.slice(1) == want2.slice(1) and M.fx.last.get("volFx", {}).get("what") == "half", "lost %s" % str(lost2))
			e.elite = false
		["demolition", "behind"]:
			await M._w_strike(h)
			var D: Dictionary = T["demolition"]
			var runes: Array = _patches("rune")
			var g: Dictionary = runes[0] if runes.size() == 1 else {}
			# (one hit as the ground and runes are sized by: his might, from the Power in it, already in it: game.ts avgHit)
			var avg: float = M._w_avg(h, 0, 1.0, h.might)
			var dmg: float = avg * float(r["rune"]) * float(D["runeHard"])
			var rad: float = 2.0 * float(r["size"]) * float(D["runeWide"])
			await M._w_strike_again(h)
			var still: int = _patches("rune").size()
			said += "; one huge rune %.2f round (formula 2 x %.3f x %.0f), %.2f (formula %.2f x %.2f x %.0f), going off in %.1f s (formula %.1f); a second Strike lays none (%d lie)" % [g.get("r", 0.0), r["size"], D["runeWide"], g.get("dmg", 0.0), avg, r["rune"], D["runeHard"], g.get("dur", 0.0), D["wait"], still]
			M._w_is(wrong, runes.size() == 1 and _near(g.get("r", 0.0), rad) and _near(g.get("dmg", 0.0), dmg) and _near(g.get("dur", 0.0), D["wait"]) and still == 1 and g.get("meld") == "demolition", "%d runes %s" % [runes.size(), str(g)])
		["powderkeg", "front"]:
			var v = _victim()
			var at: Vector2 = v.world
			await M._w_strike(h)
			await M._wait(0.2)
			var K: Dictionary = T["powderkeg"]
			var hurt := int(maxf(1.0, roundf(1000.0 * float(r["volatile"]) * float(K["burning"]))))
			var splash_dps: float = _hit(float(r["splash_dmg"])) * float(r["ignite"]) / 3.0 * float(r["pace"])
			var ok := true
			var caught := 0
			for k in range(1, 6):
				if P[k].world.distance_to(at) <= 1.8 + P[k].r:
					caught += 1
					var splashed: bool = M._w_spot(k).distance_to(M._w_spot(0)) <= float(r["splash"]) * float(r["size"]) + P[k].r
					ok = ok and _near(P[k].burn_dps, maxf(splash_dps if splashed else 0.0, hurt * float(K["burn"])))
			said += "; A burning, killed: it explodes for %d (formula 1000 x %.2f x %.1f), setting the %d it strikes burning %.2f a second (formula %d x %.1f, or their own burning if more)" % [hurt, r["volatile"], K["burning"], caught, hurt * float(K["burn"]), hurt, K["burn"]]
			M._w_is(wrong, v.dead and ok and caught > 0 and M.fx.last.get("volFx", {}).get("what") == "catch" and M.fx.last.get("burst", {}).get("meld") == "powderkeg", "caught %d" % caught)
		["powderkeg", "behind"]:
			await M._w_strike(h)
			var K: Dictionary = T["powderkeg"]
			var runes: Array = _patches("rune")
			var g: Dictionary = (runes[0] as Dictionary).duplicate() if runes.size() == 1 else {}
			await _hold(float(K["wait"]) + 0.1)
			# (the rune's ground: new, of the powderkeg; the Strike's own ground is the powderkeg's too, laid by its Flame behind)
			var grounds: Array = _patches("burn").filter(func(z): return z.get("meld") == "powderkeg" and z["t"] < 0.3)
			var b: Dictionary = grounds[0] if grounds.size() == 1 else {}
			var want: float = float(g.get("dmg", 0.0)) * float(K["ground"]) * 0.2
			said += "; its rune (%.1f s) went off and left burning ground %.2f round (formula %.2f x 0.7) for %.0f s, burning %.3f a second (formula %.3f x %.2f x 0.2)" % [g.get("dur", 0.0), b.get("r", 0.0), g.get("r", 0.0), b.get("dur", 0.0), b.get("dmg", 0.0), g.get("dmg", 0.0), K["ground"]]
			M._w_is(wrong, runes.size() == 1 and _near(g.get("dur", 0.0), K["wait"]) and grounds.size() == 1 and _near(b.get("r", 0.0), float(g.get("r", 0.0)) * 0.7) and _near(b.get("dmg", 0.0), want) and _near(b.get("dur", 0.0), K["groundSecs"]), "%d grounds %s" % [grounds.size(), str(b)])
		["shatter", "front"]:
			var v = _victim()
			v.chill_t = 2.0
			v.chill = 0.3
			var at: Vector2 = v.world
			await M._w_strike(h)
			await M._wait(0.2)
			var S: Dictionary = T["shatter"]
			var shard := int(maxf(1.0, roundf(1000.0 * float(S["share"]))))
			var boom := int(maxf(1.0, roundf(1000.0 * float(r["volatile"]))))
			var want := _plain(r)
			for k in range(1, 6):
				if P[k].world.distance_to(at) <= float(S["reach"]) + P[k].r:
					want[k] += shard
				if P[k].world.distance_to(at) <= 1.8 + P[k].r:
					want[k] += boom
			var lost: Array = M._w_lost()
			lost[0] = 0
			want[0] = 0
			said += "; A, frozen by it, killed: shards of %d each (formula 1000 x %.2f) to all within %.1f, and Volatile's blast %d: the rest lost %s (formula %s)" % [shard, S["share"], S["reach"], boom, str(lost.slice(1)), str(want.slice(1))]
			M._w_is(wrong, v.dead and lost == want and M.fx.seen.get("volFx", 0) >= 1, "lost %s" % str(lost))
		["shatter", "behind"]:
			await M._w_strike(h)
			var S: Dictionary = T["shatter"]
			var runes: Array = _patches("rune")
			var g: Dictionary = runes[0] if runes.size() == 1 else {}
			await _hold(float(S["wait"]) * float(S["freezeAt"]) + 0.05)
			var frozen: Array = []
			var within: Array = []
			for k in 6:
				if P[k].frozen_t > 0.0:
					frozen.append(k)
				if P[k].world.distance_to(Vector2(g.get("x", 0.0), g.get("y", 0.0))) <= float(g.get("r", 0.0)) + P[k].r:
					within.append(k)
			said += "; its rune (%.1f s) froze what was in it %.0f%% through its wait: %s (formula those within %.2f: %s)" % [g.get("dur", 0.0), float(S["freezeAt"]) * 100.0, str(frozen), g.get("r", 0.0), str(within)]
			M._w_is(wrong, runes.size() == 1 and frozen == within and not within.is_empty() and M.fx.last.get("volFx", {}).get("what") == "freeze", "frozen %s" % str(frozen))
		["chainreaction", "front"]:
			var v = _victim()
			var at: Vector2 = v.world
			await M._w_strike(h)
			await M._wait(0.25)
			var C: Dictionary = T["chainreaction"]
			var boom := int(maxf(1.0, roundf(1000.0 * float(r["volatile"]))))
			var chain := int(maxf(1.0, roundf(boom * float(C["share"]))))
			var arc := int(maxf(1.0, roundf(_hit() * float(r["arc_dmg"]))))
			var order: Array = [1, 2, 3, 4, 5]
			order.sort_custom(func(a, b) -> bool: return P[a].world.distance_to(at) < P[b].world.distance_to(at))
			var three: Array = order.slice(0, int(C["arcs"]))
			var lost: Array = M._w_lost()
			var ok := true
			for k in range(1, 6):
				var rest: int = int(lost[k]) - (boom if P[k].world.distance_to(at) <= 1.8 + P[k].r else 0) - (chain if three.has(k) else 0)
				ok = ok and rest >= 0 and rest % arc == 0
			said += "; A killed explodes for %d, and arcs on to the %d nearest (%s) for %d each (formula %d x %.1f): the rest lost %s, all else whole arcs of %d; volFx told %d" % [boom, int(C["arcs"]), str(three), chain, boom, C["share"], str(lost.slice(1)), arc, M.fx.seen.get("volFx", 0)]
			M._w_is(wrong, v.dead and ok and M.fx.seen.get("volFx", 0) == int(C["arcs"]), "lost %s" % str(lost))
		["chainreaction", "behind"]:
			await M._w_strike(h)
			await M._wait(0.3)
			# (Strike again: a second rune, linked to the first)
			await M._w_strike_again(h)
			var C: Dictionary = T["chainreaction"]
			var two: int = _patches("rune").size()
			var t := 0.0
			var gone_at := -1.0
			while t < 2.0:
				await M.get_tree().process_frame
				t += M.get_process_delta_time()
				if gone_at < 0.0 and _patches("rune").is_empty():
					gone_at = t
			var link: int = M.fx.seen.get("volFx", 0)
			said += "; two runes laid (%d), the first going off set off the second (link told %d), both gone %.2f s after the second was laid (formula: the first's own wait out, then %.2f s on; not the second's own %.1f)" % [two, link, gone_at, C["next"], C["wait"]]
			M._w_is(wrong, two == 2 and link == 1 and gone_at > 0.0 and gone_at < float(C["wait"]) - 0.1, "two %d, link %d, gone %.2f" % [two, link, gone_at])
		["rupture", "front"]:
			var v = _victim()
			v.poison_t = 3.0
			v.poison_dps = 50.0
			v.poison_n = 1
			var at: Vector2 = v.world
			await M._w_strike(h)
			await M._wait(0.2)
			var R: Dictionary = T["rupture"]
			var ok := true
			var splashed := 0
			for k in range(1, 6):
				var in_it: bool = P[k].world.distance_to(at) <= float(R["reach"]) + P[k].r
				if in_it:
					splashed += 1
				ok = ok and (_near(P[k].poison_dps, 50.0 * float(R["share"])) if in_it else P[k].poison_t <= 0.0)
			said += "; A, poisoned (50 a second), killed: its poison splashed on the %d within %.1f, each %.1f a second (formula 50 x %.0f)" % [splashed, R["reach"], P[1].poison_dps, R["share"]]
			M._w_is(wrong, v.dead and ok and splashed > 0 and M.fx.last.get("volFx", {}).get("what") == "splash", "B %.2f" % P[1].poison_dps)
		["rupture", "behind"]:
			await M._w_strike(h)
			var R: Dictionary = T["rupture"]
			var runes: Array = _patches("rune")
			var g: Dictionary = (runes[0] as Dictionary).duplicate() if runes.size() == 1 else {}
			await _hold(float(R["wait"]) + 0.1)
			var clouds: Array = _patches("venom").filter(func(z): return z.get("meld") == "rupture" and z["t"] < 0.3)
			var b: Dictionary = clouds[0] if clouds.size() == 1 else {}
			var want: float = float(g.get("dmg", 0.0)) * float(R["cloud"]) * 0.2
			said += "; its rune (%.1f s) burst into a poison cloud %.2f round (formula %.2f x 0.75), %.3f a second (formula %.3f x %.2f x 0.2)" % [g.get("dur", 0.0), b.get("r", 0.0), g.get("r", 0.0), b.get("dmg", 0.0), g.get("dmg", 0.0), R["cloud"]]
			M._w_is(wrong, runes.size() == 1 and _near(g.get("dur", 0.0), R["wait"]) and clouds.size() == 1 and _near(b.get("r", 0.0), float(g.get("r", 0.0)) * 0.75) and _near(b.get("dmg", 0.0), want), "%d clouds %s" % [clouds.size(), str(b)])
		# ----- THE EIGHT ACROSS THE GROUPS -----
		["siphon", "front"], ["siphon", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			h.life = h.max_life * 0.5
			await M._w_strike(h)
			if side == "behind":
				# (the cloud's first bite poisons A)
				await _hold(0.3)
			var life0: float = h.life
			var n0: int = M.fx.seen.get("meld8", 0)
			var tick := int(maxf(1.0, roundf(A.poison_dps * 0.5)))
			M._monsters._dot_t = 0.0
			await M.get_tree().process_frame
			var healed: float = h.life - life0
			var told: int = M.fx.seen.get("meld8", 0) - n0
			said += "; a bite of A's poison (%d) healed him %.2f (formula %d x %.1f x %.1f = %.2f), siphon told %d" % [tick, healed, tick, E["siphon"]["heal"], k8, tick * float(E["siphon"]["heal"]) * k8, told]
			M._w_is(wrong, A.poison_t > 0.0 and told >= 1 and _near(healed, tick * float(E["siphon"]["heal"]) * k8 * told, 1e-3), "healed %.2f, told %d" % [healed, told])
		["cauterize", "front"], ["cauterize", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			var v = _victim()
			v.burn_t = 2.0
			v.burn_dps = 0.001
			h.life = h.max_life * 0.4
			var life0: float = h.life
			await M._w_strike(h)
			var hits := 0
			for q in _plain(r):
				if q > 0:
					hits += 1
			var want: float = h.max_life * float(E["cauterize"]["heal"]) * k8 + hits * float(r["leech"])
			said += "; A burning, killed: he is healed %.2f (formula %.0f x %.2f x %.1f = %.2f, and Leech's %.2f for each of the %d struck)" % [h.life - life0, h.max_life, E["cauterize"]["heal"], k8, h.max_life * float(E["cauterize"]["heal"]) * k8, r["leech"], hits]
			M._w_is(wrong, v.dead and _near(h.life - life0, want, 1e-3) and M.fx.last.get("meld8", {}).get("id") == "cauterize", "healed %.2f" % (h.life - life0))
		["forking", "front"], ["forking", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			await M._w_strike(h)
			# (in front, Twin's second hit a moment on; behind, read before the echo and the storm)
			if side == "front":
				await M._wait(0.25)
			var hits: int = int(r["count"]) if side == "front" else 1
			var fork: float = _hit(float(r["count_dmg"])) * float(E["forking"]["share"]) * k8
			var arc := int(maxf(1.0, roundf(_hit(float(r["count_dmg"])) * float(r["arc_dmg"])))) if int(r["arcs"]) > 0 else 0
			var lost: int = M._w_lost()[1]
			var want := int(roundf(hits * fork)) + hits * arc
			said += "; each hit on A (%d) arcs to the nearest other, B, for %.2f (formula %d x %.1f x %.1f), besides its lightning's %d: B lost %d (formula %d); forking told %d" % [hits, fork, _hit(float(r["count_dmg"])), E["forking"]["share"], k8, arc, lost, want, M.fx.seen.get("meld8", 0)]
			M._w_is(wrong, lost == want and M.fx.seen.get("meld8", 0) == hits, "B lost %d" % lost)
		["shiver", "front"], ["shiver", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			h.stats["crit_chance"] = 100.0
			await M._w_strike(h)
			var want: float = float(E["shiver"]["secs"]) * k8
			said += "; a critical hit: A frozen %.2f s (formula %.1f x %.1f = %.2f), shiver told %d" % [A.frozen_t, E["shiver"]["secs"], k8, want, M.fx.seen.get("meld8", 0)]
			M._w_is(wrong, A.frozen_t > want - M._w_tol(0.05) and A.frozen_t <= maxf(want, 1.1) + 0.001 and M.fx.last.get("meld8", {}).get("id") == "shiver", "frozen %.2f" % A.frozen_t)
			h.stats["crit_chance"] = 0.0
		["sunder", "front"], ["sunder", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			await M._w_strike(h)
			var su: float = A.sunder
			if A.stun_t <= 0.0:
				A.stun_for(2.0)
			M._w_mark()
			A.damage(100.0, "phys", false, false, [], false, false, -1)
			var want := int(roundf(100.0 * (1.0 + float(E["sunder"]["more"]) * k8)))
			said += "; struck: it takes %.0f%% more while stunned (formula %.1f x %.1f); stunned, a blow of 100 took %d (formula %d)" % [su * 100.0, E["sunder"]["more"], k8, M._w_lost()[0], want]
			M._w_is(wrong, _near(su, float(E["sunder"]["more"]) * k8) and M._w_lost()[0] == want, "sunder %.2f, took %d" % [su, M._w_lost()[0]])
		["fervor", "front"], ["fervor", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			var v = _victim()
			await M._w_strike(h)
			var pct: float = h.melds.fervor_pct("fire")
			said += "; A killed: fervor %.1f for %.1f s (formula %.1f, %.0f s), his fire %.0f%% hotter (formula %.1f x %.0f%%)" % [h.melds.fervor_n, h.melds.fervor_t, k8, E["fervor"]["secs"], pct, h.melds.fervor_n, float(E["fervor"]["burn"]) * 100.0]
			M._w_is(wrong, v.dead and _near(h.melds.fervor_n, k8) and h.melds.fervor_t > float(E["fervor"]["secs"]) - 0.2 and _near(pct, k8 * float(E["fervor"]["burn"]) * 100.0), "fervor %.2f" % h.melds.fervor_n)
		["rimeward", "front"], ["rimeward", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			h.stats["block_chance"] = 100.0
			h.unhurt = true
			var tries := 0
			A.chill_t = 0.0
			while tries < 60 and A.chill_t <= 0.0:
				tries += 1
				h.hurt_by(10.0, "phys", [], {}, A)
			var want: float = float(E["rimeward"]["secs"]) * k8
			said += "; a blow of A's blocked (after %d, his block %.0f%% at most): A chilled %.2f s (formula %.0f x %.1f), its slow %.2f (as the game has it: its time only)" % [tries, Words.data()["guard"]["blockCap"], A.chill_t, E["rimeward"]["secs"], k8, A.chill]
			M._w_is(wrong, _near(A.chill_t, want) and M.fx.last.get("meld8", {}).get("id") == "rimeward", "chilled %.2f" % A.chill_t)
			h.stats["block_chance"] = 0.0
		["implode", "front"], ["implode", "behind"]:
			var k8: float = 1.0 if side == "front" else float(E["behind"])
			var I: Dictionary = E["implode"]
			var at: Vector2 = A.world
			var d0: float = P[3].world.distance_to(at)
			var dc: float = P[2].world.distance_to(at)
			var c0: Vector2 = P[2].world
			await M._w_strike(h)
			var went: float = P[2].world.distance_to(c0)
			var want_go := minf(float(I["pull"]) * k8, maxf(0.0, dc - P[2].r))
			var hit := _hit()
			var br: float = float(I["r"]) * (0.7 if k8 < 1.0 else 1.0)
			var coming: int = h.melds.implosions.size()
			M._w_mark()
			await _hold(float(I["wait"]) + 0.05)
			said += "; (%d burst to come as it struck)" % coming
			# (drawn in, and then parted from A as bodies are: monsters.gd _part; so it stands no further off than the pull leaves it,
			# or touching A)
			var stands: float = P[2].world.distance_to(at)
			went = dc - stands if stands > A.r + P[2].r + 0.02 else want_go
			var lost: Array = M._w_lost()
			var want: Array = [0, 0, 0, 0, 0, 0]
			for k in 6:
				if P[k].world.distance_to(at) < br:
					want[k] = int(roundf(hit * float(I["share"]) * k8))
			said += "; C drawn %.2f toward where it struck (formula the less of %.1f x %.1f and %.2f), D (%.2f off; within %.1f: drawn too) now %.2f off; %.1f s on, a burst %.2f round there for %.2f (formula %d x %.1f x %.1f): they lost %s (formula %s)" % [went, I["pull"], k8, dc - P[2].r, d0, I["reach"], P[3].world.distance_to(at), I["wait"], br, hit * float(I["share"]) * k8, hit, I["share"], k8, str(lost), str(want)]
			M._w_is(wrong, absf(went - want_go) < 0.02 and lost == want and M.fx.last.get("burst", {}).get("meld") == "implode", "went %.2f, lost %s" % [went, str(lost)])
		# ----- RANK II -----
		_:
			if Words.is_rank(w):
				await _rank(w, side, r, wrong, said)
				return
			said += "; no case"
			wrong.append("no case for it")
	await M._w_snap(what)
	M._w_say(what, said, wrong)


## RANK II on his Strike: what the fight does of the word, its own figure half as strong again (resolve's numbers, held against the
## game's by words_check.gd), and its rank named in its line.
func _rank(w: String, side: String, r: Dictionary, wrong: Array, said: String) -> void:
	var what := "strike %s %s" % [side, w]
	var base: String = Words.parts_of(w)[0]
	var P: Array = M._w_pack
	var A = P[0]
	var named := false
	for l in r["lines"]:
		named = named or str(l).contains(" II:")
	await M._w_strike(h)
	await M._wait(0.05)
	match [base, side]:
		["power", "front"], ["fire", "front"], ["frost", "front"], ["lightning", "front"], ["poison", "front"]:
			var lost: Array = M._w_lost()
			said += "; A's hit %d (formula %d x %.3f)" % [lost[0], M.W_ROLL, r["dmg_mult"]]
			var want_a: int = _hit()
			match base:
				"fire":
					var want: float = _hit() * float(r["ignite"]) / 3.0 * float(r["pace"])
					said += ", burning %.3f a second (formula %d x %.3f / 3)" % [A.burn_dps, _hit(), r["ignite"]]
					M._w_is(wrong, _near(A.burn_dps, want), "burn %.3f" % A.burn_dps)
				"frost":
					said += ", chilled %.0f%% (formula %.0f%%)" % [A.chill * 100.0, float(r["chill"]) * 100.0]
					M._w_is(wrong, _near(A.chill, r["chill"]), "chill %.3f" % A.chill)
				"lightning":
					var arc := int(maxf(1.0, roundf(_hit() * float(r["arc_dmg"]))))
					said += ", its arcs %d each (formula %d x %.3f); B lost %d" % [arc, _hit(), r["arc_dmg"], lost[1]]
					M._w_is(wrong, int(lost[1]) % arc == 0 and int(lost[1]) > 0, "B lost %d" % lost[1])
				"poison":
					var want: float = _hit() * float(r["poison"]) * float(r["pace"])
					said += ", poisoned %.3f a second (formula %d x %.3f)" % [A.poison_dps, _hit(), r["poison"]]
					M._w_is(wrong, _near(A.poison_dps, want), "poison %.3f" % A.poison_dps)
			M._w_is(wrong, lost[0] == want_a, "A lost %d" % lost[0])
		["power", "behind"]:
			said += "; his might %.2f%% (formula %.2f)" % [h.might, r["might"]]
			M._w_is(wrong, _near(h.might, r["might"]), "might %.3f" % h.might)
		["fire", "behind"], ["frost", "behind"], ["lightning", "behind"]:
			var kind: String = {"fire": "burn", "frost": "ice", "lightning": "storm"}[base]
			var g: Array = _patches(kind)
			var z: Dictionary = r["zone"]
			var want: float = _avg() * float(z["dps"])
			said += "; it left %d %s, %.3f (formula %.2f x %.4f), slowing %.2f (formula %.2f)" % [g.size(), kind, g[0]["dmg"] if g.size() == 1 else 0.0, _avg(), z["dps"], g[0]["slow"] if g.size() == 1 else 0.0, z["slow"]]
			M._w_is(wrong, g.size() == 1 and _near(g[0]["dmg"], want) and _near(g[0]["slow"], z["slow"]), "%d %s" % [g.size(), kind])
		["poison", "behind"]:
			var g: Array = _patches("venom")
			var want: float = _avg() * float(r["cloud"]) * float(r["pace"])
			said += "; it left %d cloud, %.3f a second (formula %.2f x %.3f)" % [g.size(), g[0]["dmg"] if g.size() == 1 else 0.0, _avg(), r["cloud"]]
			M._w_is(wrong, g.size() == 1 and _near(g[0]["dmg"], want), "%d clouds" % g.size())
	said += "; its line names its rank %s" % named
	M._w_is(wrong, named, "no rank in its line")
	await M._w_snap(what)
	M._w_say(what, said, wrong)


# =====================================================================================================================
# --only=meld
# =====================================================================================================================

func _line(ok: bool, what: String) -> void:
	_n += 1
	if not ok:
		_bad += 1
	print("MELD %02d %s :: %s" % [_n, what, "OK" if ok else "WRONG"])


func page(dir: String) -> void:
	var loot = M.loot
	var inv = M._inv
	var smith := Vector2(9.5, 14.5)
	await M.go_to("town", "gate")
	await M._wait(0.8)
	h.walked = 5.0
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.furnace = "done"
	loot.meld_ask = true
	loot.level = 20
	loot.derive()
	for k in loot.words.keys():
		loot.words[k] = 0
	M.quest610.dust = 0
	h.world = M._spot_near(smith, 1.4, h.world)
	await M._wait(0.5)
	# --- before the Meldstone: his half opens on its trade page, and there is no melding (game.ts interactHint 'Wordsmith')
	var before: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.3)
	_line(before == "E: Wordsmith" and inv.visible and inv.wsmith == "trade" and loot.meld != "open" and loot.meld_problem("fire", "frost") == "He needs the MELDSTONE to meld",
		"before the Meldstone: his prompt '%s', used: his half on its trade page (%s), no MELD tab; melding refused: %s" % [before, inv.wsmith, loot.meld_problem("fire", "frost")])
	if inv.visible:
		inv.toggle()
	# --- the Meldstone given: FLAME and FROST
	loot.meld = "stone"
	await M._wait(0.2)
	var giving: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.5)
	_line(giving == "E: Give the Meldstone" and loot.meld == "open" and int(loot.words.get("fire", 0)) == 1 and int(loot.words.get("frost", 0)) == 1,
		"'%s': the Meldstone his (meld '%s'), FLAME x%d and FROST x%d given to meld" % [giving, loot.meld, int(loot.words.get("fire", 0)), int(loot.words.get("frost", 0))])
	if inv.visible:
		inv.toggle()
	# --- his half: TRADE first, then MELDING
	await M._wait(0.3)
	var using: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.3)
	await M._snap(dir + "/m01_his_half_trade.png")
	_line(using == "E: Wordsmith" and inv.visible and inv.wsmith == "trade", "'%s', used: the gear screen with his half beside it, on its first page (%s)" % [using, inv.wsmith])
	inv._press("ws_tab", null)
	await M._wait(0.3)
	await M._snap(dir + "/m02_melding_empty.png")
	_line(inv.wsmith == "meld" and inv.meld_in == [null, null], "MELD pressed: its second page, MELDING, the hollows empty (%s)" % str(inv.meld_in))
	# --- FLAME and FROST laid in, refused for want of runedust, then melded for one
	inv._press("word", "fire")
	inv._press("ws_hollow", 0)
	inv._press("word", "frost")
	inv._press("ws_to_meld", null)
	await M._wait(0.2)
	var why: String = inv._ws_why()
	await M._snap(dir + "/m03_laid_no_runedust.png")
	_line(inv.meld_in == ["fire", "frost"] and why == "Needs 1 runedust" and int(loot.words["fire"]) == 1, "FLAME pressed then the first hollow, FROST by TO THE MELD: laid %s (still his: FLAME x%d); MELD refused: '%s'" % [str(inv.meld_in), int(loot.words["fire"]), why])
	inv._press("ws_meld", null)
	_line(inv._note == "Needs 1 runedust" and int(loot.words["fire"]) == 1 and loot.melded.is_empty(), "MELD pressed with none: it says '%s', nothing made" % inv._note)
	M.quest610.dust = 3
	inv._press("ws_meld", null)
	await M._wait(0.3)
	await M._snap(dir + "/m04_scald_made.png")
	_line(loot.melded.get("word", "") == "scald" and loot.melded.get("first", false) and int(loot.words.get("scald", 0)) == 1 and int(loot.words["fire"]) == 0 and int(loot.words["frost"]) == 0 and M.quest610.dust == 2 and inv.meld_in == [null, null],
		"with 3 runedust, MELD: %s made (a new word, found %s), SCALD x%d, both used up (FLAME x%d, FROST x%d), runedust %d, the hollows empty again" % [loot.melded.get("word", "-"), loot.melded.get("first", false), int(loot.words.get("scald", 0)), int(loot.words["fire"]), int(loot.words["frost"]), M.quest610.dust])
	# --- the game's refusals
	loot.words["power"] = 2
	loot.words["volatile"] = 2
	loot.words["leech"] = 1
	loot.words["poison"] = 1
	loot.words["power2"] = 1
	loot.melded = {}
	var said := {}
	for w in ["scald", "power2", "leech", "lightning"]:
		said[w] = inv._ws_problem(w)
	inv._press("word", "volatile")
	inv._press("ws_hollow", 0)
	said["volatile twice"] = inv._ws_problem("volatile")
	inv._press("word", "power")
	inv._press("ws_hollow", 1)
	said["a third"] = inv._ws_problem("poison")
	await M._wait(0.2)
	await M._snap(dir + "/m05_volatile_and_power.png")
	_line(said["scald"] == "A melded word melds no further" and said["power2"] == "Rank II is the top, for now" and said["leech"] == "Only damage words and Volatile meld" and said["lightning"] == "No spare word" and said["volatile twice"] == "Volatile melds with a damage word" and said["a third"] == "Both hollows are full",
		"refused in the game's words: %s" % str(said))
	inv._press("ws_meld", null)
	await M._wait(0.3)
	await M._snap(dir + "/m06_demolition_made.png")
	_line(loot.melded.get("word", "") == "demolition" and int(loot.words.get("demolition", 0)) == 1 and int(loot.words["volatile"]) == 1 and int(loot.words["power"]) == 1 and M.quest610.dust == 1,
		"VOLATILE and POWER melded: %s x%d (VOLATILE x%d, POWER x%d left), runedust %d" % [loot.melded.get("word", "-"), int(loot.words.get("demolition", 0)), int(loot.words["volatile"]), int(loot.words["power"]), M.quest610.dust])
	# --- a word laid taken back out by pressing it
	inv._press("word", "power")
	inv._press("ws_hollow", 0)
	var laid: Array = inv.meld_in.duplicate()
	inv._press("ws_hollow", 0)
	_line(laid == ["power", null] and inv.meld_in == [null, null], "POWER laid %s; pressed again, taken back out %s" % [str(laid), str(inv.meld_in)])
	# --- two of one word: its next rank, shown before it is made
	loot.words["power"] = 2
	inv._press("word", "power")
	inv._press("ws_hollow", 0)
	inv._press("word", "power")
	inv._press("ws_hollow", 1)
	await M._wait(0.2)
	await M._snap(dir + "/m07_power_power_shown.png")
	var shown: String = Words.rank_up(inv.meld_in[0]) if inv.meld_in[0] != null and inv.meld_in[0] == inv.meld_in[1] else ""
	inv._press("ws_meld", null)
	await M._wait(0.3)
	await M._snap(dir + "/m08_power2_made.png")
	_line(shown == "power2" and loot.melded.get("word", "") == "power2" and int(loot.words.get("power2", 0)) == 2 and int(loot.words["power"]) == 0 and M.quest610.dust == 0,
		"two of POWER: MAKES %s shown before; melded: %s (POWER II x%d, POWER x%d), runedust %d" % [shown, loot.melded.get("word", "-"), int(loot.words.get("power2", 0)), int(loot.words["power"]), M.quest610.dust])
	# --- the eight across the groups: the page refuses their words; the rules meld them
	_line(inv._ws_problem("leech") == "Only damage words and Volatile meld" and Words.meld_problem("leech", "poison") == "" and Words.meld_of("leech", "poison") == "siphon",
		"LEECH and POISON: the page refuses LEECH ('%s'), as the game's page does; its rules (melds.ts meldProblem) would meld them: '%s', into %s" % [inv._ws_problem("leech"), Words.meld_problem("leech", "poison"), Words.meld_of("leech", "poison")])
	# --- the melded word set in a socket of his Strike, and its name
	inv._press("tab", "attacks")
	for k in 3:
		for s in ["front", "behind"]:
			for j in h.loadout.slots(k, s).size():
				var back: String = h.loadout.take(k, s, j)
				if back != "":
					loot.words[back] = int(loot.words.get(back, 0)) + 1
	inv._press("word", "scald")
	inv._press("slot", [0, "front", 0])
	var named: String = h.loadout.r(0)["name"]
	var two: String = h.loadout.problem(0, "front", "power2")
	await M._wait(0.3)
	await M._snap(dir + "/m09_scald_on_strike.png")
	_line(h.loadout.slots(0, "front")[0] == "scald" and named == "Scald Strike" and int(loot.words.get("scald", 0)) == 0 and h.loadout.r(0)["meld"] == "scald",
		"SCALD set in front of his Strike: '%s' (it does the work of FLAME and FROST: %s); a ranked word beside it refused: '%s'" % [named, str(h.loadout.wfronts(0)), two])
	_line(two == "One damage word per side", "a melded word takes its side's one damage-word place: POWER II beside SCALD, '%s'" % two)
	# --- a melded word burned into gear, as the game makes it there; known on its page from then on
	var w0 = loot.gear["mainhand"]
	var opts: Array = loot.burn_options("demolition", w0)
	var no: String = loot.burn("demolition", "mainhand")
	var made: Dictionary = loot.burned
	_line(no == "" and opts.size() <= 2 and str(made.get("text", "")) != "" and loot._know("demolition")["gear"] and int(loot.words.get("demolition", 0)) == 0,
		"DEMOLITION burned into his weapon (offered %d: %s): it became '%s', used up; known on gear from now on %s" % [opts.size(), " / ".join(PackedStringArray(opts.map(func(o): return o["range"]))), made.get("text", "-"), loot._know("demolition")["gear"]])
	inv._press("close", null)
	await M._wait(0.2)
	inv.open_wordsmith()
	inv._press("ws_tab", null)
	loot.melded = {"word": "demolition", "first": false}
	await M._wait(0.3)
	await M._snap(dir + "/m10_demolition_page_known_on_gear.png")
	inv.toggle()
	print("MELDPAGE: %d lines, %d wrong" % [_n, _bad])
