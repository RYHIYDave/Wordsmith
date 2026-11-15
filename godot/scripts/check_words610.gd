## THE CHECKS OF FLOORS 6 TO 10'S WORDS (Twin, Leech, Volatile, Precise, Frenzied, Guarding, Lasting, Fleeting, Vast), run by
## main.gd's shot mode at the end of its own, with its helpers and on its floor:
##   `words`  (--only=words): each word IN FRONT of and BEHIND each of his three moves, on main.gd's pack of six (A the one a Strike
##            hits, B and C beside it, D and E an arc's jump further off, F out of reach), his roll fixed, no critical hits: the
##            move made, and in one line what the rules did beside what the game's own formula gives (game.ts deliver,
##            channelBite, endChannel, land, hitMonster, boons, kill, explodeKill, wake, leavePatches, addRune, addPatch). Lasting
##            and Fleeting, which change nothing alone, are set beside the word whose time they change: Flame in front of Strike
##            and the Lunge, nothing more in front of the Whirlwind (its held length), Poison behind each (its cloud). A picture a
##            case. One kill a case where a word answers a kill (Volatile in front, Frenzied behind, Leech behind): A, its life
##            made 1 of 1000 and its experience none.
##   `foes`   (--only=foewords): each word on a monster, a skeleton of floor 2 handed it (the rules are the same for any carrier:
##            game.ts hurtHero, monsterAttack, updateMonsters `rage`, damageMonster's shield, kill, addWarn), against the game's
##            formula: its blow on him and what it leaves.
##   `ui`     (--only=wordsui): on floor 6, each word's rune stone lying where it fell and taken up, on the gear screen among his
##            words, set in a slot of a move (its name in the move's), and refused where the game refuses it ("Already there").
extends RefCounted

const Hero := preload("res://scripts/hero.gd")
const Words := preload("res://scripts/words.gd")

var M
var h


func _init(main, hero) -> void:
	M = main
	h = hero


# =====================================================================================================================
# --only=words
# =====================================================================================================================

## Everything on him and on the pack that the nine words leave, gone; A alive again if a case killed it.
func _clean() -> void:
	h.frenzy = 0
	h.frenzy_t = 0.0
	h.shield = 0.0
	h.shield_t = 0.0
	h._later = []
	h.uses = [0, 0, 0]
	h._marked = [-1, -1, -1]
	for m in M._w_pack:
		if m.dead:
			m.dead = false
			m._dead_for = 0.0
			m.modulate.a = 1.0
			m._set_list("idle", true)
		m.mark_t = 0.0
		m.shield = 0.0
		m.last_skill = -1
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9


## A case begun: the words set (main.gd _w_set: the pack whole and where it stands), and what the nine leave gone.
func _put_words(i: int, side: String, words: Array) -> Dictionary:
	_clean()
	var r: Dictionary = M._w_set(h, i, side, words)
	_clean()
	return r


## Where move `i` lands for the check: the Strike from where he stands, at A; the Whirlwind round him a step in among the pack;
## the Lunge's landing a tile before where he comes down.
func _at(i: int) -> Vector2:
	if i == 1:
		return M._w_home + M._w_face * 2.0 + Vector2(-M._w_face.y, M._w_face.x) * 0.2
	if i == 2:
		return M._w_home + M._w_face * 2.0
	return M._w_pack[0].world


## Which of the pack an area of `rad` round `at` reaches (game.ts blast: within its radius and the monster's own).
func _in(at: Vector2, rad: float) -> Array:
	var out: Array = []
	for k in M._w_pack.size():
		var m = M._w_pack[k]
		out.append(m.world.distance_to(at) <= rad + m.r)
	return out


## The pack in the order the floor keeps them (the order a blast goes through them: its fourth and later struck are quiet).
func _order() -> Array:
	var out: Array = []
	for m in M._monsters.list:
		var k: int = M._w_pack.find(m)
		if k >= 0:
			out.append(k)
	return out


## Move `i` made, as each case wants it: `turns` of the Whirlwind (then let go); then `after` seconds more.
func _use(i: int, turns := 1, after := 0.35) -> void:
	if i == 0:
		await M._w_strike(h)
	elif i == 1:
		h.world = _at(1)
		await M._w_whirl_begin(h)
		if turns > 1:
			await M._w_whirl_on(h, turns)
		else:
			h.auto_whirl = false
			await M._w_until(func() -> bool: return h._act != "whirl", 2.0)
	else:
		h.world = M._w_home - M._w_face * 3.5
		await M._w_lunge(h, M._w_home + M._w_face * 1.0)
	if after > 0.0:
		await M._wait(after)


## Move `i` made as _use makes it, `read` asked the first frame after `told` has been told (what a use gives him, read as he is
## given it: the Lunge gives it as he leaps, the Whirlwind as it begins to spin); what it said.
func _use_then(i: int, told: String, read: Callable) -> float:
	var got := 0.0
	if i == 0:
		await M._w_strike(h)
		got = read.call()
	elif i == 1:
		h.world = _at(1)
		await M._w_whirl_begin(h)
		got = read.call()
		h.auto_whirl = false
		await M._w_until(func() -> bool: return h._act != "whirl", 2.0)
	else:
		h.world = M._w_home - M._w_face * 3.5
		h._lunge_cd = 0.0
		h.auto_lunge = M._w_home + M._w_face * 1.0
		await M._w_until(func() -> bool: return M.fx.seen.get(told, 0) > 0, 3.0)
		got = read.call()
		await M._w_until(func() -> bool: return h._act != "lunge", 3.0)
	await M._wait(0.05)
	return got


## The radius move `i`'s area has with its words (its Strike's reach).
func _rad(i: int, r: Dictionary) -> float:
	return [1.7, 2.0, 1.6][i] * float(r["size"])


## A hit of move `i` for `frac` of it as it lands, rounded (main.gd _w_hit).
func _hit(i: int, frac := 1.0) -> int:
	return M._w_hit(h, i, frac)


## A kill wanted: A's life made 1 of 1000, and nothing given for it.
func _victim() -> Object:
	var a = M._w_pack[0]
	a.max_life = 1000.0
	a.life = 1.0
	a.xp = 0.0
	a.summoned = true
	return a


## What the pack is expected to lose from move `i`'s hits alone (`each`: a hit's share), those its area reaches; a Strike, A.
func _plain(i: int, r: Dictionary, each := 1.0) -> Array:
	var want: Array = []
	var reach := _in(_at(i), _rad(i, r)) if i > 0 else [true, false, false, false, false, false]
	for k in 6:
		want.append(_hit(i, each) if reach[k] else 0)
	return want


## (`only`: those words alone, by name, a comma between; "" all nine)
func words(only := "") -> void:
	var wilds: Array = Words.data()["wilds"]
	if only != "":
		var some := only.split(",")
		wilds = wilds.filter(func(w): return some.has(w))
	var before: int = M._w_n
	var bad: int = M._w_bad.size()
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	for w in wilds:
		for side in ["front", "behind"]:
			for i in 3:
				await _case(str(w), side, i)
	h.stats["life_regen"] = regen
	_clean()
	print("WORDS610: %d cases of the nine words, %d not as the game's formula gives" % [M._w_n - before, M._w_bad.size() - bad])


func _case(w: String, side: String, i: int) -> void:
	var move: String = ["strike", "whirlwind", "lunge"][i]
	var what := "%s %s %s" % [move, side, w]
	var with: Array = [w]
	if w == "lasting" or w == "fleeting":
		with = [w, "poison"] if side == "behind" else ([w] if i == 1 else [w, "fire"])
	var r := _put_words(i, side, with)
	var wrong: Array = []
	var said := "\"%s\"" % r["name"]
	var kills: bool = (w == "volatile" and side == "front") or (side == "behind" and (w == "frenzied" or w == "leech"))
	var victim = _victim() if kills else null
	if w == "leech" and side == "behind":
		# (its chance made certain for the check: the formula's own, words.gd, is held against the game by words_check.gd)
		h.loadout.r(i)["orb_chance"] = 1.0
	await M._wait(0.15)
	var life0: float = h.life
	match [w, side]:
		["twin", "front"]:
			var each: float = r["count_dmg"]
			await _use(i, 1, 0.5)
			var want := _plain(i, r, each)
			if i == 2:
				# (its second shock a little wider: rad x 1.15)
				var far := _in(_at(2), _rad(2, r) * 1.15)
				for k in 6:
					want[k] = (_hit(2, each) if _in(_at(2), _rad(2, r))[k] else 0) + (_hit(2, each) if far[k] else 0)
			else:
				for k in 6:
					want[k] *= 2
			var lost: Array = M._w_lost()
			var told: int = M.fx.seen.get("swing" if i == 0 else "burst", 0)
			said += "; two of each hit, %.0f%% each (formula %d x %.3f x %.2f = %d): they lost %s (formula %s), %d told" % [each * 100.0, M.W_ROLL, r["dmg_mult"], each, _hit(i, each), str(lost), str(want), told]
			M._w_is(wrong, lost == want and told == 2, "lost %s, told %d" % [str(lost), told])
		["twin", "behind"]:
			var echo: float = r["echo"]
			await _use(i, 1, float(Words.data()["echo"]["delay"]) + (1.1 if i == 1 else 0.4))
			var want := _plain(i, r)
			var again := _hit(i, echo)
			var n := 3 if i == 1 else 1
			for k in 6:
				if want[k] > 0:
					want[k] += again * n
			var lost: Array = M._w_lost()
			said += "; a moment later (%.1f s) a phantom makes it again%s for %.0f%% (formula %d): they lost %s (formula %s); echo told %d" % [Words.data()["echo"]["delay"], " three turns" if i == 1 else "", echo * 100.0, again, str(lost), str(want), M.fx.seen.get("echo", 0)]
			M._w_is(wrong, lost == want and M.fx.seen.get("echo", 0) == 1, "lost %s, echo told %d" % [str(lost), M.fx.seen.get("echo", 0)])
		["leech", "front"]:
			h.life = h.max_life * 0.5
			life0 = h.life
			await _use(i, 1, 0.1)
			var hits := 0
			for v in _plain(i, r):
				if v > 0:
					hits += 1
			var healed: float = h.life - life0
			said += "; %d struck, life back %.2f (formula %d x %.2f = %.2f), leech told %d" % [hits, healed, hits, r["leech"], hits * float(r["leech"]), M.fx.seen.get("leech", 0)]
			M._w_is(wrong, absf(healed - hits * float(r["leech"])) < 0.01 and M.fx.seen.get("leech", 0) == hits, "healed %.2f, told %d" % [healed, M.fx.seen.get("leech", 0)])
		["leech", "behind"]:
			var drops0: int = _orbs()
			# (his life at half, none of it coming back: an orb lying near him is taken at once, and heals him its share)
			h.life = h.max_life * 0.5
			life0 = h.life
			await _use(i, 1, 0.3)
			var hits := 0
			for v in _plain(i, r):
				if v > 0:
					hits += 1
			var orb_heal: float = h.max_life * float(M.loot.ORB_HEAL)
			var lying: int = _orbs() - drops0
			var healed: float = h.life - life0
			var dropped: bool = (lying == 1 and absf(healed) < 0.01) or (lying == 0 and absf(healed - orb_heal) < 0.01)
			said += "; the struck marked for the harvest (mark told %d: formula %d, the first three of an area), A killed: a life orb dropped (orb told %d; %d lying, or taken: his life %.1f more, an orb's %.1f); the chance a kill drops one %.0f%% (formula min(90, 35 + 0.4 x Str))" % [M.fx.seen.get("mark", 0), mini(3, hits), M.fx.seen.get("orb", 0), lying, healed, orb_heal, words_r(i, side, [w])["orb_chance"] * 100.0]
			M._w_is(wrong, M.fx.seen.get("mark", 0) == mini(3, hits) and victim.dead and M.fx.seen.get("orb", 0) == 1 and dropped, "mark %d, orb %d, %d lying, healed %.1f" % [M.fx.seen.get("mark", 0), M.fx.seen.get("orb", 0), lying, healed])
		["volatile", "front"]:
			var at: Vector2 = victim.world
			await _use(i, 1, 0.4)
			var boom := int(maxf(1.0, roundf(1000.0 * float(r["volatile"]))))
			var want := _plain(i, r)
			for k in range(1, 6):
				if M._w_pack[k].world.distance_to(at) <= 1.8 + M._w_pack[k].r:
					want[k] += boom
			var lost: Array = M._w_lost()
			lost[0] = 0
			want[0] = 0
			said += "; A killed explodes 1.8 round for %.0f%% of its life (formula 1000 x %.2f = %d): the rest lost %s (formula %s, its own hit and the blast)" % [r["volatile"] * 100.0, r["volatile"], boom, str(lost.slice(1)), str(want.slice(1))]
			M._w_is(wrong, victim.dead and lost == want and M.fx.last.get("burst", {}).get("words", []) == ["volatile"], "lost %s, burst %s" % [str(lost), M.fx.last.get("burst", {})])
		["volatile", "behind"]:
			var rad: float = 2.0 * float(r["size"])
			var at: Vector2 = _at(i) if i > 0 else M._w_pack[0].world
			await _use(i, 1, 0.05)
			var runes := _patches("rune")
			var dmg: float = M._w_avg(h, i) * float(r["rune"])
			var want := _plain(i, r)
			var reach := _in(at, rad)
			for k in 6:
				if reach[k]:
					want[k] += int(maxf(1.0, roundf(dmg)))
			var g: Dictionary = runes[0] if runes.size() == 1 else {}
			said += "; it wrote a rune %.2f round (formula 2 x %.3f), for %.2f (formula one hit %.2f x %.2f)" % [g.get("r", 0.0), r["size"], g.get("dmg", 0.0), M._w_avg(h, i), r["rune"]]
			M._w_is(wrong, runes.size() == 1 and absf(float(g.get("r", 0.0)) - rad) < 0.001 and absf(float(g.get("dmg", 0.0)) - dmg) < 0.01 and Vector2(g.get("x", 0.0), g.get("y", 0.0)).distance_to(at) < 0.05, "%d runes, %s" % [runes.size(), str(g)])
			await M._wait(1.4)
			var lost: Array = M._w_lost()
			said += "; 1.2 s on it went off: they lost %s (formula %s), the rune gone (%d lie)" % [str(lost), str(want), _patches("rune").size()]
			M._w_is(wrong, lost == want and _patches("rune").is_empty(), "lost %s" % str(lost))
		["precise", "front"], ["vast", "front"]:
			await _use(i, 1, 0.1)
			var want := _plain(i, r)
			var lost: Array = M._w_lost()
			var told: Dictionary = M.fx.last.get("swing" if i == 0 else "burst", {})
			var reach: float = told.get("reach", told.get("r", 0.0))
			said += "; %s %.2f (formula %.1f x %.3f), each hit %d (formula %d x %.3f): they lost %s (formula %s)" % ["reach" if i == 0 else "its area", reach, [1.7, 2.0, 1.6][i], r["size"], _hit(i), M.W_ROLL, r["dmg_mult"], str(lost), str(want)]
			M._w_is(wrong, lost == want and absf(reach - _rad(i, r)) < 0.001, "lost %s, reach %.3f" % [str(lost), reach])
			if w == "vast" and i > 0:
				var r0: float = told.get("r0", 0.0)
				said += "; told its edge without the word %.3f (formula %.3f / %.3f)" % [r0, _rad(i, r), r["wide"]]
				M._w_is(wrong, absf(r0 - _rad(i, r) / float(r["wide"])) < 0.001, "r0 %.3f" % r0)
		["precise", "behind"]:
			var crit: float = 1.0 + float(h.stats["crit_mult"]) / 100.0
			await _use(i, 2 if i == 1 else 1, 0.1)
			var marked: Array = []
			for k in 6:
				if M._w_pack[k].mark_t > 0.0:
					marked.append(k)
			var lost: Array = M._w_lost()
			if i == 1:
				# (two turns: the first marks the first it strikes, the second's hit on it is a certain critical and spends it)
				var want := _plain(i, r)
				var first: int = _first_struck(i, r)
				for k in 6:
					want[k] *= 2
				want[first] = _hit(i) + int(maxf(1.0, roundf(M._w_avg(h, i) * crit)))
				said += "; two turns: the first marked %s, the second struck it a certain critical (x%.2f): they lost %s (formula %s); markOn %d, markSpent %d" % ["ABCDEF"[first], crit, str(lost), str(want), M.fx.seen.get("markOn", 0), M.fx.seen.get("markSpent", 0)]
				M._w_is(wrong, lost == want and M.fx.seen.get("markOn", 0) == 1 and M.fx.seen.get("markSpent", 0) == 1 and marked.is_empty(), "lost %s, marked %s" % [str(lost), str(marked)])
			else:
				var first: int = 0 if i == 0 else _first_struck(i, r)
				var on: float = M._w_pack[first].mark_t
				said += "; it marked %s for %.2f s (formula %.0f)" % ["ABCDEF"[first], on, Words.data()["precise"]["markTime"]]
				M._w_is(wrong, marked == [first] and absf(on - float(Words.data()["precise"]["markTime"])) < M._w_tol(0.6), "marked %s for %.2f" % [str(marked), on])
				M._w_mark()
				if i == 0:
					await M._w_strike_again(h)
				else:
					await _use(2, 1, 0.1)
				var second: Array = M._w_lost()
				var want_crit := int(maxf(1.0, roundf(M._w_avg(h, i) * crit)))
				said += "; the next hit on it a certain critical: %d (formula %d x %.2f = %d), the mark spent (%.2f), markSpent %d" % [second[first], _hit(i), crit, want_crit, M._w_pack[first].mark_t if i == 0 else 0.0, M.fx.seen.get("markSpent", 0)]
				M._w_is(wrong, second[first] == want_crit and M.fx.seen.get("markSpent", 0) == 1, "the second took %d" % second[first])
		["frenzied", "front"]:
			var F: Dictionary = Words.data()["frenzy"]
			var ft: float = await _use_then(i, "frenzy", func() -> float: return h.frenzy_t)
			said += "; one use: his frenzy %d stack for %.2f s as it is given (formula 1, %.0f s), %.2f times as fast (formula 1 + %.2f)" % [h.frenzy, ft, F["hold"], h.frenzy_pace(), F["each"]]
			M._w_is(wrong, h.frenzy == 1 and absf(ft - float(F["hold"])) < M._w_tol(0.05) and absf(h.frenzy_pace() - 1.0 - float(F["each"])) < 1e-9, "frenzy %d for %.2f" % [h.frenzy, ft])
			if i == 0:
				var gap: float = await M._w_strike_again(h)
				var want: float = 1.0 / (float(r["rate"]) * (1.0 + float(F["each"])))
				said += "; held, his next blow begun %.3f s after the first (formula 1 / (%.3f x %.2f) = %.3f); then %d stacks" % [gap, r["rate"], 1.0 + float(F["each"]), want, h.frenzy]
				M._w_is(wrong, gap >= want - 0.001 and gap < want + 2.0 * M._w_frame + 0.02 and h.frenzy == 2, "gap %.3f" % gap)
			else:
				# (over half a second of the game's own time, frame by frame: each frame's step by that frame's own time)
				await M.get_tree().process_frame
				var cd0: float = h._whirl_cd if i == 1 else h._lunge_cd
				var d: float = M.get_process_delta_time()
				var el := 0.0
				while el < 0.5:
					await M.get_tree().process_frame
					el += d
					d = M.get_process_delta_time()
				var cd1: float = h._whirl_cd if i == 1 else h._lunge_cd
				var pace: float = (cd0 - cd1) / el
				said += "; its wait comes round %.3f times as fast (formula %.2f)" % [pace, 1.0 + float(F["each"])]
				M._w_is(wrong, absf(pace - 1.0 - float(F["each"])) < 0.08, "its wait ran %.3f" % pace)
		["frenzied", "behind"]:
			var F: Dictionary = Words.data()["frenzy"]
			await _use(i, 1, 0.05)
			said += "; A killed: his frenzy %d stack for %.2f s (formula 1, %.0f s), frenzyFed told %d" % [h.frenzy, h.frenzy_t, F["hold"], M.fx.seen.get("frenzyFed", 0)]
			M._w_is(wrong, victim.dead and h.frenzy == 1 and absf(h.frenzy_t - float(F["hold"])) < M._w_tol(0.5) and M.fx.seen.get("frenzyFed", 0) == 1, "frenzy %d for %.2f" % [h.frenzy, h.frenzy_t])
		["guarding", "front"]:
			var G: Dictionary = Words.data()["guard"]
			var st: float = await _use_then(i, "shield", func() -> float: return h.shield_t)
			var want := roundf(h.max_life * float(r["shield"]))
			said += "; one use: a shield of %.0f (formula %.0f x %.3f) for %.2f s as it is given (formula %.0f)" % [h.shield, h.max_life, r["shield"], st, G["shieldTime"]]
			M._w_is(wrong, absf(h.shield - want) < 0.5 and absf(st - float(G["shieldTime"])) < M._w_tol(0.05), "shield %.0f for %.2f" % [h.shield, st])
			var was: float = h.life
			var sh: float = h.shield
			h.unhurt = false
			var blow := maxf(1.0, roundf(20.0 * (1.0 - h.armour_cut())))
			h.hurt_by(20.0, "phys", [], {}, null, h.world + h.face)
			var took: float = h.last_blow.get("soaked", 0.0)
			said += "; a blow of %.0f on him: the shield took %.0f (formula the lesser of it and the shield, %.0f), his life %.0f less (formula %.0f), the shield %.0f left, guarded told %d" % [blow, took, minf(sh, blow), was - h.life, blow - minf(sh, blow), h.shield, M.fx.seen.get("guarded", 0)]
			M._w_is(wrong, absf(took - minf(sh, blow)) < 0.001 and absf((was - h.life) - (blow - minf(sh, blow))) < 0.001 and absf(h.shield - (sh - took)) < 0.001 and M.fx.seen.get("guarded", 0) == 1, "soaked %.0f" % took)
			h.unhurt = true
		["guarding", "behind"]:
			var G: Dictionary = Words.data()["guard"]
			await _use(i, 1, 0.05)
			var wards := _patches("ward")
			var at: Vector2 = _at(i) if i > 0 else M._w_pack[0].world
			var rad: float = maxf(1.5, _rad(i, r) if i > 0 else 1.0)
			var g: Dictionary = wards[0] if wards.size() == 1 else {}
			said += "; it left a ward %.2f round (formula %.2f) for %.1f s (formula %.0f), %.0f%% less harm inside (formula %.3f)" % [g.get("r", 0.0), rad, g.get("dur", 0.0), G["wardTime"], float(g.get("dmg", 0.0)) * 100.0, r["ward"]]
			M._w_is(wrong, wards.size() == 1 and absf(float(g.get("r", 0.0)) - rad) < 0.001 and absf(float(g.get("dur", 0.0)) - float(G["wardTime"])) < 0.001 and absf(float(g.get("dmg", 0.0)) - float(r["ward"])) < 1e-9 and Vector2(g.get("x", 0.0), g.get("y", 0.0)).distance_to(at) < 0.05, "%d wards %s" % [wards.size(), str(g)])
			h.world = at + (M._w_home - at).limit_length(rad * 0.5)
			var was: float = h.life
			h.unhurt = false
			h.hurt_by(40.0, "phys", [], {}, null, h.world + h.face)
			var want := maxf(1.0, roundf(40.0 * (1.0 - h.armour_cut()) * (1.0 - float(r["ward"]))))
			said += "; a blow of 40 on him inside it: %.0f (formula 40 x %.3f = %.0f)" % [was - h.life, 1.0 - float(r["ward"]), want]
			M._w_is(wrong, absf((was - h.life) - want) < 0.001, "took %.0f" % (was - h.life))
			h.unhurt = true
		["vast", "behind"]:
			var V: Dictionary = Words.data()["vast"]
			await _use(i, 1, 0.1)
			var want := _plain(i, r)
			var splash := int(maxf(1.0, roundf(_hit(i) * float(r["vast"]))))
			# (each hit not quiet, the first three an area strikes in the floor's order, splashes onto every other near it)
			var struck: Array = []
			for k in _order():
				if want[k] > 0:
					struck.append(k)
			for j in struck.slice(0, 3):
				for k in 6:
					if k != j and M._w_pack[k].world.distance_to(M._w_pack[j].world) <= float(V["splashR"]) + M._w_pack[k].r:
						want[k] += splash
			var lost: Array = M._w_lost()
			said += "; each hit splashes %.0f%% (formula %d x %.3f = %d) onto all within %.1f of what it hit: they lost %s (formula %s); vastSplash told %d" % [r["vast"] * 100.0, _hit(i), r["vast"], splash, V["splashR"], str(lost), str(want), M.fx.seen.get("vastSplash", 0)]
			M._w_is(wrong, lost == want, "lost %s" % str(lost))
		["lasting", "front"], ["fleeting", "front"]:
			if i == 1:
				# (the Whirlwind held to its end: as long as its word makes it, its turns as many as its time and pace give)
				var length: float = 2.4 * float(r["last"])
				var tick: float = 0.3 / float(r["pace"])
				h.world = _at(1)
				await M._w_whirl_begin(h)
				await M._w_until(func() -> bool: return h._landed or h._act != "whirl", 6.0)
				var turns: int = h._bites
				var want := int(ceil(length / tick - 1e-6))
				h.auto_whirl = false
				said += "; held, it spun %.2f s (formula 2.4 x %.3f = %.2f), %d turns (formula %d, one each %.3f s)" % [h._stopped_at, r["last"], length, turns, want, tick]
				M._w_is(wrong, absf(h._stopped_at - length) < M._w_tol(0.1) and absi(turns - want) <= 1, "spun %.2f, %d turns" % [h._stopped_at, turns])
				await M._w_until(func() -> bool: return h._act != "whirl", 2.0)
			else:
				await _use(i, 1, 0.05)
				var a = M._w_pack[0] if i == 0 else M._w_pack[_first_struck(i, r)]
				var dps: float = _hit(i) * float(r["ignite"]) / 3.0 * float(r["pace"])
				said += "; it burns %.2f a second (formula %d x %.3f / 3 x %.3f = %.2f) for %.2f s (formula 3 x %.3f = %.2f)" % [a.burn_dps, _hit(i), r["ignite"], r["pace"], dps, a.burn_t, r["last"], 3.0 * float(r["last"])]
				M._w_is(wrong, absf(a.burn_dps - dps) < 0.01 and absf(a.burn_t - 3.0 * float(r["last"])) < M._w_tol(0.2), "burning %.2f for %.2f" % [a.burn_dps, a.burn_t])
		["lasting", "behind"], ["fleeting", "behind"]:
			await _use(i, 1, 0.05)
			var clouds := _patches("venom")
			var g: Dictionary = clouds[0] if clouds.size() == 1 else {}
			var dps: float = M._w_avg(h, i) * float(r["cloud"]) * float(r["pace"])
			var dur: float = 5.0 * float(r["last"])
			said += "; its cloud poisons %.2f a second (formula one hit %.2f x %.3f x %.3f = %.2f) for %.2f s (formula 5 x %.3f)" % [g.get("dmg", 0.0), M._w_avg(h, i), r["cloud"], r["pace"], dps, g.get("dur", 0.0), r["last"]]
			M._w_is(wrong, clouds.size() == 1 and absf(float(g.get("dmg", 0.0)) - dps) < 0.01 and absf(float(g.get("dur", 0.0)) - dur) < 0.001, "%d clouds %s" % [clouds.size(), str(g)])
	await M._w_snap(what)
	M._w_say(what, said, wrong)
	h.auto_whirl = false
	await M._w_until(func() -> bool: return h._act == "", 2.0)
	await M._wait(0.1)


## Which of the pack an area of move `i` strikes first (the floor's order).
func _first_struck(i: int, r: Dictionary) -> int:
	var reach := _in(_at(i), _rad(i, r))
	for k in _order():
		if reach[k]:
			return k
	return 0


## The patches of a kind that lie (wakes.gd).
func _patches(kind: String) -> Array:
	return M.wakes.list.filter(func(z): return z["kind"] == kind)


## The life orbs lying (loot.gd).
func _orbs() -> int:
	var n := 0
	for d in M.loot._drops:
		if d["kind"] == "orb":
			n += 1
	return n


## What move `i` comes to with `words` on `side` (words.gd resolve), without setting them.
func words_r(i: int, side: String, ws: Array) -> Dictionary:
	var f: Array = ws if side == "front" else []
	var b: Array = ws if side == "behind" else []
	return Words.resolve(Words.moves()[i], f, b, {"str": h.stats["str"], "dex": h.stats["dex"], "int": h.stats["int"], "area": h.stats["area"], "aps": h.stats["aps"], "cdr": h.stats["cdr"]})


# =====================================================================================================================
# --only=foewords
# =====================================================================================================================

## A skeleton of the floor handed `ws`, its roll fixed, where it stands before him.
func _carrier(m, ws: Array) -> void:
	m.words = ws
	m.half = []
	m.dmg_min = M.FW_ROLL
	m.dmg_max = M.FW_ROLL
	m.shield = 0.0
	m.life = m.max_life
	M._fw_still(m)


func foes() -> void:
	var sk = M._fw_one("skeleton", "", [])
	if sk == null:
		print("FOEWORDS610: no plain skeleton on the floor")
		return
	var n0: int = M._fw_n
	var bad0: int = M._fw_bad.size()
	var LA: Dictionary = Words.data()["lasting"]
	var FL: Dictionary = Words.data()["fleeting"]
	sk.world = M._w_home + M._w_face * 0.8
	var plain: float = M._fw_exact("phys", [], "")
	# PRECISE: its hits find the gaps in his armour, half of it as if it were not there
	_carrier(sk, ["precise"])
	var b: Dictionary = M._fw_hit(h, sk)
	var a: float = M.FW_GEAR["armor"] * (1.0 - float(Words.data()["precise"]["armourIgnored"]))
	var want := maxf(1.0, roundf(M.FW_ROLL * (1.0 - minf(0.75, a / (a + 40.0 + 20.0 * maxf(1.0, M.map.depth))))))
	M._fw_line("precise", "its blow %d of %s: %d (the game: %d, half his armour of %d ignored; a plain one %d)" % [M.FW_ROLL, b["words"], b["dmg"], want, M.FW_GEAR["armor"], plain], b["dmg"] == want)
	# LEECH: it heals what its blow takes
	_carrier(sk, ["leech"])
	# (room in its life to heal: its most made 1000, half of it left)
	var max0: float = sk.max_life
	sk.max_life = 1000.0
	sk.life = 500.0
	var was: float = sk.life
	b = M._fw_hit(h, sk)
	M._fw_line("leech", "its blow %d on him, its life %.0f -> %.0f of %.0f: healed %.0f (the game: what its blow took, %d)" % [b["dmg"], was, sk.life, sk.max_life, sk.life - was, plain], absf(sk.life - was - plain) < 0.001)
	sk.max_life = max0
	# LASTING and FLEETING with Flame, Poison and Frost: how long, and how hard a second
	var cases := [["lasting", "fire"], ["lasting", "poison"], ["lasting", "frost"], ["fleeting", "fire"], ["fleeting", "poison"]]
	for q in cases:
		_carrier(sk, [q[1], q[0]])
		b = M._fw_hit(h, sk)
		var longer: float = 1.0 + (float(LA["monster"]) if q[0] == "lasting" else 0.0)
		var lasts: float = longer * (1.0 - (float(FL["monster"]) if q[0] == "fleeting" else 0.0))
		var dmg: float = b["dmg"]
		var line := ""
		var ok := false
		match q[1]:
			"fire":
				var dps: float = dmg * 0.3 / 3.0 * (longer / lasts)
				line = "he burns %.3f a second for %.2f s (the game: %.3f for %.2f)" % [h.burn_dps, h.burn_t, dps, 3.0 * lasts]
				ok = absf(h.burn_dps - dps) < 1e-4 and absf(h.burn_t - 3.0 * lasts) < 0.02
			"poison":
				var dps: float = dmg * 0.6 * (1.0 - M.FW_GEAR["res_poison"] / 100.0) / 4.0 * (longer / lasts)
				line = "he is poisoned %.3f a second for %.2f s (the game: %.3f for %.2f)" % [h.poison_dps, h.poison_t, dps, 4.0 * lasts]
				ok = absf(h.poison_dps - dps) < 1e-4 and absf(h.poison_t - 4.0 * lasts) < 0.02
			"frost":
				line = "he is chilled %.2f for %.2f s (the game: 0.30 for %.2f)" % [h.chill_k, h.chill_t, 2.0 * longer]
				ok = absf(h.chill_k - 0.3) < 1e-4 and absf(h.chill_t - 2.0 * longer) < 0.02
		M._fw_line("%s_%s" % q, "%s, its blow %d: %s" % [b["words"], dmg, line], ok)
	# TWIN: its blow comes again a moment later, as hard (a whole word)
	_carrier(sk, ["twin"])
	M._fw_clean(h)
	h.shield = 0.0
	was = h.life
	sk.state = "windup"
	sk._move = -1
	sk._land(h, 0.5, sk._reach())
	var first: float = was - h.life
	await M._wait(0.4)
	var both: float = was - h.life
	M._fw_line("twin", "its blow %d, and 0.28 s later a second, %d (the game: %d and %d x %.1f)" % [first, both - first, plain, plain, sk.twin()], absf(first - plain) < 0.001 and absf(both - first - roundf(plain * sk.twin())) < 0.001)
	M._fw_still(sk)
	# VAST: its blow reaches further, and its warnings are wider
	_carrier(sk, ["vast"])
	M._fw_clean(h)
	var plain_far: float = float(sk.def["range"]) + (sk.r - 0.32) + 0.45 + 0.3
	var vast_far: float = float(sk.def["range"]) * sk.vast() + (sk.r - 0.32) + 0.45 + 0.3
	h.world = sk.world + (M._w_home - sk.world).normalized() * (plain_far + vast_far) / 2.0
	was = h.life
	sk.state = "windup"
	sk._move = -1
	sk._land(h, h.world.distance_to(sk.world), sk._reach())
	var reached: bool = h.life < was
	M._fw_line("vast_reach", "he stands %.2f from it, beyond a plain blow's %.2f and within Vast's %.2f (the game: %.2f x %.1f): struck %s" % [h.world.distance_to(sk.world), plain_far, vast_far, sk.def["range"], sk.vast(), reached], reached)
	M._fw_still(sk)
	M._monsters.perils.warn(sk.world.x, sk.world.y, 1.0, 9.0, 0.0, sk)
	var wr: float = M._monsters.perils.list[-1]["r"]
	M._fw_line("vast_warn", "a warned blow of 1.0 tiles of its marked %.2f (the game: x%.1f)" % [wr, 1.0 + float(Words.data()["vast"]["monster"])], absf(wr - 1.0 - float(Words.data()["vast"]["monster"])) < 1e-6)
	M._monsters.perils.drop(sk)
	# FRENZIED: the more it is hurt, the faster it moves and the sooner it attacks again
	_carrier(sk, ["frenzied"])
	var rages: Array = []
	for k in [1.0, 0.5, 0.1]:
		sk.life = sk.max_life * k
		rages.append(sk.rage())
	var fm: float = Words.data()["frenzy"]["monster"]
	M._fw_line("frenzied", "its pace and its waits at its whole life, at half and at a tenth: x%.3f, x%.3f, x%.3f (the game: 1, %.3f, %.3f)" % [rages[0], rages[1], rages[2], 1.0 + fm * 0.5, 1.0 + fm * 0.9], absf(rages[0] - 1.0) < 1e-9 and absf(rages[1] - 1.0 - fm * 0.5) < 1e-9 and absf(rages[2] - 1.0 - fm * 0.9) < 1e-9)
	# GUARDING: a shield of a fifth of its life, as the game's spawn gives it, takes his harm first
	_carrier(sk, ["guarding"])
	sk.shield = roundf(sk.max_life * float(Words.data()["guard"]["monster"]))
	var sh: float = sk.shield
	was = sk.life
	var half_sh := floorf(sh / 2.0)
	sk.damage(half_sh, "phys")
	var left1: float = sk.shield
	var lost1: float = was - sk.life
	sk.damage(sh, "phys")
	var lost2: float = was - sk.life
	M._fw_line("guarding", "its shield %.0f (the game: a fifth of its life %.0f): a blow of %.0f on it, its shield %.0f left and its life %.0f less (the game: %.0f, 0); a blow of %.0f more, its shield %.0f, its life %.0f less (the game: 0, %.0f)" % [sh, sk.max_life, half_sh, left1, lost1, sh - half_sh, sh, sk.shield, lost2, sh - (sh - half_sh)], absf(left1 - (sh - half_sh)) < 0.001 and absf(lost1) < 0.001 and absf(sk.shield) < 0.001 and absf(lost2 - (sh - (sh - half_sh))) < 0.001)
	# VOLATILE: dying, it goes off after a short warning, of its element and no word
	_carrier(sk, ["volatile"])
	M._fw_clean(h)
	h.shield = 0.0
	sk.xp = 0.0
	sk.summoned = true
	sk.damage(sk.life + 1.0, "phys")
	var p: Dictionary = M._monsters.perils.list[-1] if not M._monsters.perils.list.is_empty() else {}
	var boom := maxf(1.0, roundf(M.FW_ROLL * 1.5 * (1.0 - M._fw_cut())))
	was = h.life
	await M._wait(0.9)
	M._fw_line("volatile", "it dies: a warning %.1f round for %.2f s, %s (the game: 1.8, 0.7 s, its element, no word), and then on him %d (the game: %d x 1.5 = %d)" % [p.get("r", 0.0), p.get("dur", 0.0), p.get("by", {}), was - h.life, M.FW_ROLL, boom], p.get("kind", "") == "warn" and absf(float(p.get("r", 0.0)) - 1.8) < 1e-6 and p.get("by", {}).get("words", ["-"]) == [] and absf(was - h.life - boom) < 0.001)
	print("FOEWORDS610: %d cases of the nine words on a monster, %d not as the game's formula gives" % [M._fw_n - n0, M._fw_bad.size() - bad0])


# =====================================================================================================================
# --only=wordsui
# =====================================================================================================================

func ui(dir: String) -> void:
	var wilds: Array = Words.data()["wilds"]
	var loot = M.loot
	await M.go_to("floor6", "down")
	await M._wait(1.2)
	if M.sight != null:
		M.sight.see_all()
	loot.ring_lit = true
	loot.level = 20
	loot.derive()
	var L = h.loadout
	for k in 3:
		for s in ["front", "behind"]:
			for j in L.slots(k, s).size():
				var back: String = L.take(k, s, j)
				if back != "":
					loot.words[back] = int(loot.words.get(back, 0)) + 1
	# THE STONES ON THE FLOOR: each word where a monster gave it up, in a row before him
	var at0: Vector2 = h.world
	var way := Vector2(1, 0)
	var row: Array = []
	for k in wilds.size():
		var p := at0 + way * (1.6 + 0.0) + Vector2(0, 1) * (k - 4) * 0.9
		if not M.map.walkable(floori(p.x), floori(p.y)):
			p = at0 + Vector2(0, 1) * (k - 4) * 0.4
		loot._word(p, wilds[k], true)
		row.append(p)
	await M._wait(0.4)
	await M._snap(dir + "/w610_01_the_nine_stones_lying.png")
	var lying: Array = M._wu_lying().map(func(q): return q[0])
	var stones := true
	for w in wilds:
		stones = stones and loot.pics.has("word:" + w)
	M._wu(lying == wilds and stones, "floor 6: the nine words' rune stones lying where they fell (%s), each its own stone in the sheet %s" % [str(lying), stones])
	var had := {}
	for w in wilds:
		had[w] = int(loot.words.get(w, 0))
	for p in row:
		h.world = p
		await M._wait(0.5)
	var taken := true
	for w in wilds:
		taken = taken and int(loot.words.get(w, 0)) == had[w] + 1
	M._wu(taken and M._wu_lying().is_empty(), "walked over, each taken up: he holds %s" % str(wilds.map(func(w): return "%s x%d" % [w, int(loot.words.get(w, 0))])))
	# THE GEAR SCREEN: his words, the nine among them; each set in a slot; refused where the game refuses
	M._inv.toggle()
	M._inv._press("tab", "attacks")
	await M._wait(0.3)
	await M._snap(dir + "/w610_02_the_gear_screen_his_words.png")
	var pouch: Array = M._inv._pouch.map(func(q): return q["w"])
	var all_there := true
	for w in wilds:
		all_there = all_there and pouch.has(w)
	M._wu(all_there, "the gear screen's ATTACKS: his words %s, the nine among them" % str(pouch))
	var places := [[0, "front", 0], [0, "front", 1], [0, "behind", 0], [0, "behind", 1], [1, "front", 0], [1, "front", 1], [1, "behind", 0], [2, "front", 0], [2, "behind", 0]]
	var set_ok := true
	var names: Array = []
	for k in wilds.size():
		var w: String = wilds[k]
		var q: Array = places[k]
		M._inv._press("word", w)
		M._inv._press("slot", q)
		var there: bool = L.slots(q[0], q[1])[q[2]] == w
		var part: String = str(Words.word(w)["front"] if q[1] == "front" else str(Words.word(w)["behind"]).trim_prefix("of "))
		var named: String = L.r(q[0])["name"]
		set_ok = set_ok and there and named.contains(part)
		names.append("%s -> %s" % [w, named])
	await M._wait(0.3)
	await M._snap(dir + "/w610_03_the_nine_set.png")
	M._wu(set_ok, "each set in a slot of a move, and read in its name: %s" % "; ".join(PackedStringArray(names)))
	# (refused: each where it is already on that side; and where no slot is free)
	var refused := true
	var said := []
	for k in wilds.size():
		var w: String = wilds[k]
		var q: Array = places[k]
		var why: String = L.problem(q[0], q[1], w)
		refused = refused and why in ["Already there", "No free socket"]
		said.append("%s %s" % [w, why])
	# (and as the gear screen says it: a second of the word, pressed onto the Whirlwind's free slot behind, beside itself)
	loot.words[wilds[6]] = int(loot.words.get(wilds[6], 0)) + 1
	var over: String = M._inv.place_problem(1, "behind", 1, wilds[6])
	M._inv._press("word", wilds[6])
	M._inv._press("slot", [1, "behind", 1])
	var note: String = M._inv._note
	await M._wait(0.3)
	await M._snap(dir + "/w610_04_already_there.png")
	M._wu(refused and over == "Already there" and note == "Already there" and L.slots(1, "behind")[1] == null, "each pressed again onto the side it is set on: %s (the game: \"Already there\", or \"No free socket\" where its side is full); a second %s pressed onto the Whirlwind's free slot behind, beside itself: '%s', it says '%s', the slot still empty" % [", ".join(PackedStringArray(said)), wilds[6], over, note])
	M._inv.toggle()
	h.world = at0
	print("WORDSUI610: the nine words' stones, taken, on the gear screen, set and refused")
