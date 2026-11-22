## THE DAMAGE CHECK (his words, 22 Nov 2026: “I'd like you to check on damage.  I feel like right about the time you get a word
## in back and in front of your attacks the damage kinda skyrockets.  So can you run, let's say a ranger with full dex scaling,
## optimized gear rolls for poison damage, full damage talent tree points, and words to push the poison as far as possible and see
## how hard it can actually hit in a min/max build.  Maybe try it with warrior and str and power, tinker with lightning and
## volatile, and the mage with fire or frost maxed”).
##   godot ... -- --only=dmg --shots=<dir>    (WS_DMG_FAST=1: worked out only, no fights) with WS_DMG_GEAR=<file> (tools/godot_dmg_gear.ts: every base and every word a piece can
##                                            take, at the top of its range); WS_DMG="ranger warrior" for some builds only
## Each build, a hero of level 50 (every talent point and every word slot open), every attribute point in what his attacks grow
## with, his ten talents on his attacks' damage, and the best gear there is for it: each piece a plain one of its best base with
## four words burned in (the most a piece holds), chosen one at a time for what they add to his quick attack, and his words chosen
## the same way, over again until nothing better is found. What the choosing goes by is worked out from his own numbers as the fight
## has them (hero.gd avg_hit, the move's words, his talents, his criticals, the poison's doses, the burning): the damage a second of
## his quick attack into one enemy. Then the FIGHT, on floor 20 among its own monsters: his quick attack, by itself, as he would
## make it, into one elite that cannot die (8 s, after 2 s to warm up), and into a pack of six of the floor's own, every one held
## where it stands, till all are dead. Step by step: no words; one in front; one in front and one behind; all four; all four with
## his attributes as his class starts. Written to <shots>/dmg.txt.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const Talents := preload("res://scripts/talents.gd")

var M
var h
var dir := ""
var G := {}
var out: Array = []
var dummy = null
var pack: Array = []
var spot := Vector2.ZERO
var way := Vector2.RIGHT

## The builds: whose, what his front's damage word must be of, his talents (his weapon first, free, for the Warrior).
const BUILDS := [
	{"id": "ranger", "cls": "ranger", "label": "RANGER, POISON (Dexterity)", "must": "poison",
		"talents": ["keeneye", "venom", "steadyaim", "quickdraw", "longshot", "lightstep", "huntersmark", "splitshot", "piercing", "farsight"]},
	{"id": "warrior", "cls": "warrior", "label": "WARRIOR, POWER (Strength)", "must": "power",
		"talents": ["greatsword", "sweepingcut", "drilledleap", "footwork", "honededge", "giantslayer", "executioner", "mastertop", "gswhirlwind", "thickskin", "shieldwall"]},
	{"id": "tinkerer", "cls": "tinkerer", "label": "TINKERER, LIGHTNING AND VOLATILE", "must": "lightning", "also": "volatile",
		"talents": ["bombsaway", "clustervials", "tar", "madmixture", "alchemy", "thebigone", "growthserum", "lightningrod", "shrapnel", "fortune"]},
	{"id": "mage_fire", "cls": "mage", "label": "MAGE, FIRE (Intelligence)", "must": "fire",
		"talents": ["kindling", "searing", "aura", "flamewarp", "fuel", "inferno", "lasting", "charged", "forking", "ball"]},
	{"id": "warlock", "cls": "warlock", "label": "WARLOCK (Strength and Intelligence), as a man", "must": "",
		"talents": ["branded", "hexchain", "blazingarm", "withering", "pyre", "souldebt", "lastrites", "hunger", "terribleroar", "bloodlust"]},
	{"id": "brawler", "cls": "brawler", "label": "BRAWLER (Strength and Dexterity)", "must": "",
		"talents": ["vstiffjab", "vviperjab", "vknockdown", "vlauncher", "vswitchkick", "vlonglegs", "vwallslam", "vaftershock", "vthunderknee", "vfullset"]},
	{"id": "mage_frost", "cls": "mage", "label": "MAGE, FROST (Intelligence)", "must": "frost",
		"talents": ["bittercold", "deepfreeze", "aura", "frostwarp", "rime", "shatter", "lasting", "kindling", "searing", "spear"]},
]
const LEVEL := 50
## (WS_DMG_ALL: the tough pack's life each)
const TOUGH := 2000000.0


func _say(s: String) -> void:
	out.append(s)
	print("DMG " + s)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	G = JSON.parse_string(FileAccess.get_file_as_string(OS.get_environment("WS_DMG_GEAR")))
	# (WS_ELEMENT_SPLASH: Flame's splash round what a one-enemy move hits, words.gd ELEMENT_SPLASH, for sizing it)
	if OS.has_environment("WS_ELEMENT_SPLASH"):
		Words.ELEMENT_SPLASH = float(OS.get_environment("WS_ELEMENT_SPLASH"))
	# (WS_BURN_MORE: burning's own, words.gd BURN_MORE, for sizing it)
	if OS.has_environment("WS_BURN_MORE"):
		Words.BURN_MORE = float(OS.get_environment("WS_BURN_MORE"))
	if OS.has_environment("WS_BURN_ALL"):
		Words.BURN_MORE_ALL = float(OS.get_environment("WS_BURN_ALL"))
	h.unhurt = true
	M.go_to("floor20", "start")
	await M._wait(2.0)
	_arena()
	_say("FLOOR 20's own monsters, for the measure of it: %s" % _lives())
	var only: Array = Array(OS.get_environment("WS_DMG").split(" ", false)) if OS.has_environment("WS_DMG") else []
	for b in BUILDS:
		if not only.is_empty() and not only.has(b["id"]):
			continue
		await _build(b)
	var f := FileAccess.open(dir + "/dmg.txt", FileAccess.WRITE)
	f.store_string("\n".join(out) + "\n")
	f.close()
	print("DMG DONE")


# --- the place and the monsters ---

## The biggest room of the floor: him at its west side, the room before him to the east; every monster of the floor but seven let
## go of; one an elite that cannot die, six a pack.
func _arena() -> void:
	var best = null
	for r in M.map.rooms:
		if best == null or float(r["w"]) * float(r["h"]) > float(best["w"]) * float(best["h"]):
			best = r
	spot = Vector2(float(best["x"]) + 2.5, float(best["y"]) + float(best["h"]) / 2.0)
	h.world = spot
	h._place()


func _monsters_here() -> Array:
	var keep: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.elite and m.state != "rise":
			keep.append(m)
	return keep


## Floor 20's regulars, its elites (four times their life), and its boss if it is here.
func _lives() -> String:
	var lives := {}
	for m in M._monsters.list:
		if not is_instance_valid(m) or m.dead:
			continue
		var k: String = "%s%s" % [m.kind, " (boss)" if m.boss else (" (elite)" if m.elite else "")]
		lives[k] = int(m.max_life)
	var parts: Array = []
	for k in lives:
		parts.append("%s %d" % [k, lives[k]])
	parts.sort()
	return ", ".join(parts)


static func _hold(m) -> void:
	if not is_instance_valid(m) or m.dead:
		return
	m.speed = 0.0
	m.state = "recover"
	m._t = 1e9
	m._cd = 1e9


## The floor's most common plain kind: what the elite and the pack are made of (monsters.gd call_up: as the floor's own plain one
## of it is made); every monster of the floor let go of.
var kind := ""
func _set_out() -> void:
	var n := {}
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.elite and M._monsters._plain.has(m.kind):
			n[m.kind] = int(n.get(m.kind, 0)) + 1
	for k in n:
		if kind == "" or n[k] > n[kind]:
			kind = k
	_clear()
	await M.get_tree().process_frame


func _clear() -> void:
	# (and nothing left of the last fight: the ground his moves left, his might and haste)
	if M.wakes != null:
		M.wakes.list.clear()
	h.might = 0.0
	h.might_t = 0.0
	for o in M._monsters.list:
		if is_instance_valid(o):
			o.queue_free()
	M._monsters.list = M._monsters.list.filter(func(o): return false)


func _one(at: Vector2):
	var m = M._monsters.call_up(kind, at, 900, -way)
	m.xp = 0
	_hold(m)
	return m


# --- his numbers, worked out ---

## The damage a second of his quick attack into the elite, as the fight works it out: its average hit (his weapon's, the move's
## words, his damage bonuses and his might at its most), his talents' on it, his criticals, as many hits as a use makes, as many
## uses as a second has; the poison its doses keep up (eight of them, as the most that add up), the burning it keeps up.
func _dps() -> float:
	if dummy == null or not is_instance_valid(dummy) or dummy.dead:
		dummy = _one(spot + way * 4.5)
		dummy.elite = true
	var r: Dictionary = h.loadout.r(0)
	h.might = float(r["might"]) * 5.0
	var el: String = r["element"]
	var b: Array = h.base_for(el)
	var avg: float = (float(b[0]) + float(b[1])) / 2.0 * float(r["dmg_mult"]) * (1.0 + (float(h.stats["dmg_pct"]) + h._el_pct(el) + h.might) / 100.0)
	avg *= h._talent_hit_mult(dummy)
	var cc: float = clampf(float(h.stats["crit_chance"]), 0.0, 100.0) / 100.0
	var hit: float = avg * (1.0 + cc * float(h.stats["crit_mult"]) / 100.0)
	# (burning's own, words.gd BURN_MORE: a fire hit on what its own Flame keeps burning)
	if el == "fire" and float(r["ignite"]) > 0.0:
		hit *= 1.0 + Words.burn_more(h)
	var n: float = float(r["count"]) * float(r["count_dmg"])
	var rate: float = maxf(0.3, float(r["rate"])) * h.attack_pace()
	var dps: float = hit * n * rate
	if float(r["poison"]) > 0.0:
		var P: Dictionary = Words.data()["poison"]
		var flat: float = (float(h.stats.get("poison_min", 0.0)) + float(h.stats.get("poison_max", 0.0))) / 2.0 / float(P["time"])
		var dose: float = (hit * float(r["poison"]) * float(r["pace"]) + flat) * (1.0 + float(h.stats.get("poison_pct", 0.0)) / 100.0)
		dps += dose * float(Words.poison_most(h))
	if float(r["ignite"]) > 0.0:
		dps += hit * n * float(r["ignite"]) / 3.0 * float(r["pace"])
	h.might = 0.0
	return dps


## One hit's average and a critical one, before his talents (what is written over the struck enemy).
func _hit() -> Array:
	var r: Dictionary = h.loadout.r(0)
	var el: String = r["element"]
	var b: Array = h.base_for(el)
	var avg: float = (float(b[0]) + float(b[1])) / 2.0 * float(r["dmg_mult"]) * (1.0 + (float(h.stats["dmg_pct"]) + h._el_pct(el) + float(r["might"]) * 5.0) / 100.0)
	return [avg, avg * (1.0 + float(h.stats["crit_mult"]) / 100.0)]


# --- the hero made ---

func _hero(b: Dictionary, points: bool) -> void:
	var cls: String = b["cls"]
	M.set_class(cls, true)
	M.loot.level = LEVEL
	M.loot.ring_lit = true
	M.loot.gold = 0
	var C: Dictionary = Words.data()["classes"][cls]
	for k in ["str", "dex", "int"]:
		M.loot.attrs[k] = float(C["attrs"][k])
	if points:
		var n: float = float(G.get("attrPerLevel", 5)) * (LEVEL - 1)
		var grows: Array = C["two"] if C.get("two") != null else [C["primary"]]
		# (a class of two: the points where they do the most, worked out below)
		M.loot.attrs[grows[0]] += n
	h.talents = (b["talents"] as Array).duplicate()
	h.talents_changed()
	M.loot.derive()


## A class of two (the Tinkerer): his points shared out between the two as does the most (none, a quarter, ... all in the first).
func _share_points(b: Dictionary, lv := LEVEL) -> void:
	var C: Dictionary = Words.data()["classes"][b["cls"]]
	if C.get("two") == null:
		return
	var n: float = 5.0 * (lv - 1)
	var two: Array = C["two"]
	var best := -1.0
	var best_k := 0.0
	for k in [0.0, 0.25, 0.5, 0.75, 1.0]:
		M.loot.attrs[two[0]] = float(C["attrs"][two[0]]) + n * k
		M.loot.attrs[two[1]] = float(C["attrs"][two[1]]) + n * (1.0 - k)
		M.loot.derive()
		var d := _dps()
		if d > best:
			best = d
			best_k = k
	M.loot.attrs[two[0]] = float(C["attrs"][two[0]]) + n * best_k
	M.loot.attrs[two[1]] = float(C["attrs"][two[1]]) + n * (1.0 - best_k)
	M.loot.derive()


# --- the gear ---

func _slots_for(cls: String) -> Array:
	var main_base: Dictionary = _bases(cls, "mainhand")[0]
	var out_s: Array = ["mainhand"]
	if int(main_base["hands"]) < 2 or str(main_base["weapon"]) == "bow":
		out_s.append("offhand")
	out_s.append_array(["helm", "chest", "gloves", "belt", "boots", "amulet", "ring1", "ring2"])
	return out_s


func _bases(cls: String, slot: String) -> Array:
	var list: Array = G["bases"][cls][slot]
	if slot == "offhand" and cls == "ranger":
		list = list.filter(func(x): return str(x["offhand"]) == "quiver")
	if slot == "mainhand":
		list = list.duplicate()
		list.sort_custom(func(a, c) -> bool: return _avg_dmg(a) > _avg_dmg(c))
	return list


static func _avg_dmg(base: Dictionary) -> float:
	var n := 0.0
	for m in base["implicit"]:
		if m[0] == "dmgMin" or m[0] == "dmgMax":
			n += float(m[1])
	return n * maxf(0.5, float(base["aps"]))


## A piece: its base's own and the words burned into it (each option's numbers).
func _piece(cls: String, slot: String, base: Dictionary, opts: Array) -> Dictionary:
	var it: Dictionary
	if slot == "mainhand":
		it = (M.loot._starters[cls] as Dictionary).duplicate(true)
		it["aps"] = base["aps"]
	else:
		it = {"slot": slot.trim_suffix("1").trim_suffix("2"), "rarity": 2, "weapon": false, "aps": 0, "hands": 0, "imbues": []}
	it["name"] = base["name"]
	var mods: Array = (base["implicit"] as Array).duplicate(true)
	var words: Array = []
	for o in opts:
		mods.append_array((o["mods"] as Array).duplicate(true))
		words.append(o["word"])
	it["mods"] = mods
	it["dmg_words"] = words
	return it


func _options(slot: String) -> Array:
	return G["options"][slot.trim_suffix("1").trim_suffix("2")]


## The best gear for his quick attack: each piece's base and four words, chosen one at a time, over again until nothing better.
func _gear(cls: String) -> Dictionary:
	var slots := _slots_for(cls)
	var picks := {}
	for s in slots:
		picks[s] = {"base": _bases(cls, s if not s.begins_with("ring") else "ring")[0], "opts": []}
		M.loot.gear[s] = _piece(cls, s, picks[s]["base"], [])
	for s in M.loot.EQUIP:
		if not slots.has(s):
			M.loot.gear[s] = null
	M.loot.derive()
	for _pass in 3:
		var better := false
		for s in slots:
			var bslot: String = s if not s.begins_with("ring") else "ring"
			var was := _dps()
			# (its base: the one that does the most with the words it has)
			var best_base: Dictionary = picks[s]["base"]
			var best := was
			for base in _bases(cls, bslot):
				M.loot.gear[s] = _piece(cls, s, base, picks[s]["opts"])
				M.loot.derive()
				var v := _dps()
				if v > best + 1e-6:
					best = v
					best_base = base
			picks[s]["base"] = best_base
			# (its four words, afresh: one at a time, the one that adds the most, never two of a kind)
			var chosen: Array = []
			for k in 4:
				var groups := {}
				for c in chosen:
					for g in c["groups"]:
						groups[g] = true
				var top = null
				var top_v := -1.0
				for o in _options(s):
					var clash := false
					for g in o["groups"]:
						if groups.has(g):
							clash = true
					if clash:
						continue
					M.loot.gear[s] = _piece(cls, s, best_base, chosen + [o])
					M.loot.derive()
					var v := _dps()
					if v > top_v:
						top_v = v
						top = o
				chosen.append(top)
			M.loot.gear[s] = _piece(cls, s, best_base, chosen)
			M.loot.derive()
			if _dps() > was * 1.0005:
				better = true
			picks[s]["opts"] = chosen
		if not better:
			break
	return picks


# --- the words ---

static func _family(w: String) -> Array:
	return Words.parts_of(w)


var found_only := false
func _all_words() -> Array:
	var all: Array = (Words.ids() as Array).duplicate()
	if not found_only:
		all.append_array(Words.made())
	return all


## Words set in his quick attack's slots: [front0, front1, behind0, behind1], each an id or null.
func _set_words(ws: Array) -> void:
	var lo = h.loadout
	lo.front[0] = [ws[0], ws[1]]
	lo.behind[0] = [ws[2], ws[3]]
	lo._r = [null, null, null]


func _fits(ws: Array) -> bool:
	for side in [[ws[0], ws[1]], [ws[2], ws[3]]]:
		for k in 2:
			if side[k] == null:
				continue
			var rest: Array = side.duplicate()
			rest[k] = null
			if Words.socket_problem(rest, side[k], 1) != "":
				return false
	return true


## The best words for the sockets left open (`free`: which of the four may be chosen), the rest as they are.
func _words(ws: Array, free: Array) -> Array:
	var best: Array = ws.duplicate()
	_set_words(best)
	var best_v := _dps()
	for _pass in 3:
		var moved := false
		for k in free:
			for w in [null] + _all_words():
				var t: Array = best.duplicate()
				t[k] = w
				if not _fits(t):
					continue
				_set_words(t)
				var v := _dps()
				if v > best_v + 1e-6:
					best_v = v
					best = t
					moved = true
		if not moved:
			break
	_set_words(best)
	return best


## The front's damage word: of the build's own (a word whose parts are it), the one that with the best of the rest does the most.
func _with_must(b: Dictionary, ws: Array, free: Array) -> Array:
	# (no word of its own asked for: the best of every word in every slot)
	if str(b["must"]) == "":
		return _words(ws, [0] + free)
	var best: Array = []
	var best_v := -1.0
	for w in _all_words():
		if not _family(w).has(b["must"]):
			continue
		var t: Array = ws.duplicate()
		t[0] = w
		if not _fits(t):
			continue
		t = _words(t, free)
		# (the Tinkerer's Volatile: somewhere on the move, the best place for it if the choosing left it out)
		if b.has("also") and not _has_family(t, b["also"]):
			t = _force(t, b["also"], free)
		_set_words(t)
		var v := _dps()
		if v > best_v:
			best_v = v
			best = t
	_set_words(best)
	return best


## THE BEST WORDS FOR HIM (his words, 22 Nov 2026: “I love to know what the best word combos are.  Just for my knowledge”): the
## best four with nothing held, worked out; then each other word in front in the first's place, the best of the rest round it;
## the `n` best of all those (each the same four however they sit) given their own gear and fought: his quick attack alone into
## the elite, and into the tough pack. Ranked by the elite, and by the pack.
func _top(b: Dictionary, n: int, reach: float) -> void:
	var free := [0, 1, 2, 3]
	var ws: Array = [null, null, null, null]
	_gear(b["cls"])
	ws = _words(ws, free)
	_gear(b["cls"])
	ws = _words(ws, free)
	var firsts: Array = []
	for w in _all_words():
		if w == ws[0]:
			continue
		var t: Array = [w, ws[1], ws[2], ws[3]]
		if not _fits(t):
			t[1] = null
			if not _fits(t):
				continue
		_set_words(t)
		firsts.append({"t": t, "v": _dps()})
	firsts.sort_custom(func(a, c) -> bool: return float(a["v"]) > float(c["v"]))
	var cands: Array = [ws]
	for f in firsts.slice(0, n + 3):
		cands.append(_words(f["t"], [1, 2, 3]))
	var seen := {}
	var uniq: Array = []
	for t in cands:
		var fr: Array = [str(t[0]), str(t[1])]
		fr.sort()
		var bh: Array = [str(t[2]), str(t[3])]
		bh.sort()
		var key := ",".join(fr) + "|" + ",".join(bh)
		if seen.has(key):
			continue
		seen[key] = true
		_set_words(t)
		uniq.append({"t": t, "v": _dps()})
	uniq.sort_custom(func(a, c) -> bool: return float(a["v"]) > float(c["v"]))
	var rows: Array = []
	for u in uniq.slice(0, n):
		var t: Array = u["t"]
		_set_words(t)
		_gear(b["cls"])
		_gear(b["cls"])
		_share_points(b)
		_set_words(t)
		var est := _dps()
		var q := await _fight_one(reach)
		var p := await _fight_pack(reach, false, TOUGH)
		rows.append({"w": _wname(t), "est": est, "q": q, "p": p})
		_say("TOP %s: worked out %d a second; his quick attack into the elite %d a second, the tough pack dead in %.1f s" % [_wname(t), int(est), int(q), p])
	rows.sort_custom(func(a, c) -> bool: return float(a["q"]) > float(c["q"]))
	_say("TOP BY THE ELITE: " + "; ".join(rows.map(func(r): return "%s %d" % [r["w"], int(r["q"])])))
	rows.sort_custom(func(a, c) -> bool: return float(a["p"]) < float(c["p"]))
	_say("TOP BY THE PACK: " + "; ".join(rows.map(func(r): return "%s %.1f s" % [r["w"], r["p"]])))


func _has_family(ws: Array, fam: String) -> bool:
	for w in ws:
		if w != null and _family(w).has(fam):
			return true
	return false


func _force(ws: Array, fam: String, free: Array) -> Array:
	var best: Array = ws
	var best_v := -1.0
	for k in free:
		for w in _all_words():
			if not _family(w).has(fam):
				continue
			var t: Array = ws.duplicate()
			t[k] = w
			if not _fits(t):
				continue
			_set_words(t)
			var v := _dps()
			if v > best_v:
				best_v = v
				best = t
	return best


static func _wname(ws: Array) -> String:
	var f: Array = [ws[0], ws[1]].filter(func(w): return w != null)
	var bh: Array = [ws[2], ws[3]].filter(func(w): return w != null)
	return "in front %s; behind %s" % [", ".join(f) if not f.is_empty() else "-", ", ".join(bh) if not bh.is_empty() else "-"]


# --- the fight ---

## His quick attack into the elite that cannot die: what it lost a second, from the 2nd second to the 10th.
func _fight_one(reach: float, hold := false) -> float:
	# (WS_DMG_FAST: worked out only, no fights: for trying a change quickly)
	if OS.has_environment("WS_DMG_FAST"):
		return 0.0
	_clear()
	# (what the last fight left to come, a moment after (Inferno's bursts, the echoes), gone off on nothing first)
	await M._wait(0.8)
	_clear()
	await M.get_tree().process_frame
	dummy = _one(spot + way * reach)
	dummy.elite = true
	dummy.max_life = 1e9
	dummy.life = 1e9
	h.world = spot
	h._place()
	h._turn(way)
	var t := 0.0
	var at2 := -1.0
	while t < 10.0:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		h.auto_attack = true
		# (WS_DMG_ALL: his hold too, as often as it is ready)
		if hold:
			h.auto_whirl = true
		h.world = spot
		# (where it stands, whatever throws or slides it: Deep Freeze, The Big One, Long Shot)
		if is_instance_valid(dummy):
			dummy.world = spot + way * reach
			_hold(dummy)
		if at2 < 0.0 and t >= 2.0:
			at2 = dummy.life
	return (at2 - dummy.life) / 8.0


## His quick attack into a pack, six of the floor's own held in a knot before him: seconds till all are dead (30 at most).
var pack_life := 0.0
func _fight_pack(reach: float, hold := false, life := 0.0) -> float:
	if OS.has_environment("WS_DMG_FAST"):
		return 0.0
	_clear()
	await M._wait(0.8)
	_clear()
	await M.get_tree().process_frame
	pack = []
	for k in 6:
		var a := TAU * k / 6.0
		pack.append(_one(spot + way * (reach + 0.4) + Vector2(cos(a), sin(a)) * 0.5))
		if life > 0.0:
			pack[k].max_life = life
			pack[k].life = life
	pack_life = pack[0].max_life
	h.world = spot
	h._place()
	var Mon := preload("res://scripts/monster.gd")
	Mon.trace = {}
	Mon.tracing = OS.has_environment("WS_DMG_TRACE")
	var t := 0.0
	while t < 30.0:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		h.auto_attack = true
		if hold:
			h.auto_whirl = true
		h.world = spot
		var alive := 0
		var left := 0.0
		for k2 in pack.size():
			var m = pack[k2]
			if is_instance_valid(m) and not m.dead:
				alive += 1
				left += m.life
				# (where it stands, whatever throws or slides it, as the elite)
				var a2 := TAU * k2 / 6.0
				m.world = spot + way * (reach + 0.4) + Vector2(cos(a2), sin(a2)) * 0.5
				_hold(m)
		# (WS_DMG_TRACE: the pack's life frame by frame, its first half second)
		if OS.has_environment("WS_DMG_TRACE") and t < 0.5:
			print("DMG TRACE t %.3f alive %d life %d hero life %d" % [t, alive, int(left), int(h.life)])
		if alive == 0:
			_trace_out()
			return t
	_trace_out()
	return 30.0


func _trace_out() -> void:
	var Mon := preload("res://scripts/monster.gd")
	if not Mon.tracing:
		return
	Mon.tracing = false
	var keys: Array = Mon.trace.keys()
	keys.sort_custom(func(a, b) -> bool: return Mon.trace[a] > Mon.trace[b])
	_say("  where the pack's harm came from: " + ", ".join(keys.slice(0, 8).map(func(k): return "%s %d" % [k, int(Mon.trace[k])])))


# --- a build ---

func _build(b: Dictionary) -> void:
	_say("")
	_say("=== %s ===" % b["label"])
	_hero(b, true)
	var reach: float = 1.5 if b["cls"] in ["warrior", "brawler"] else 4.5
	if kind == "":
		await _set_out()
	_share_points(b)
	# (WS_DMG_TOP=n: his best words found afresh, none held to the build's own kind, and the n best fought)
	if OS.has_environment("WS_DMG_TOP"):
		await _top(b, int(OS.get_environment("WS_DMG_TOP")), reach)
		return
	# (the words first with plain pieces, then the gear for them, then the words again for the gear, then the gear again)
	var ws: Array = [null, null, null, null]
	var picks := {}
	# (WS_DMG_WORDS: these four held from the first, and the gear chosen for them)
	if OS.has_environment("WS_DMG_WORDS"):
		ws = Array(OS.get_environment("WS_DMG_WORDS").split(",")).map(func(w): return null if w == "" or w == "-" else w)
		_set_words(ws)
		_gear(b["cls"])
		picks = _gear(b["cls"])
	else:
		_gear(b["cls"])
		ws = _with_must(b, ws, [1, 2, 3])
		picks = _gear(b["cls"])
		ws = _with_must(b, ws, [1, 2, 3])
		picks = _gear(b["cls"])
	_share_points(b)
	_set_words(ws)
	var s: Dictionary = h.stats
	_say("hero: level %d, Str %d Dex %d Int %d; weapon %d-%d at %.2f attacks a second; damage +%d%%, physical +%d%%, fire +%d%%, frost +%d%%, lightning +%d%%, poison +%d%%, poison added %d-%d; critical %d%% for +%d%%" % [LEVEL, s["str"], s["dex"], s["int"], s["dmg_min"], s["dmg_max"], s["aps"], s["dmg_pct"], s["phys_pct"], s["fire_pct"], s["frost_pct"], s["light_pct"], s["poison_pct"], s.get("poison_min", 0), s.get("poison_max", 0), s["crit_chance"], s["crit_mult"]])
	_say("talents: %s" % ", ".join(b["talents"]))
	for sl in picks:
		_say("  %s: %s + %s" % [sl, picks[sl]["base"]["name"], ", ".join((picks[sl]["opts"] as Array).map(func(o): return "%s (%s)" % [o["word"], ", ".join((o["mods"] as Array).map(func(m): return "%s %s" % [m[0], m[1]]))]))])
	# WS_DMG_ALL, THE FAIRER FIGHT (his “Yes to both”, 22 Nov 2026: the Mage's strengths are her abilities' waits, which Intelligence
	# makes shorter, and fire's that spread; the quick attack alone into one enemy is Dexterity's and poison's): all four words in his
	# quick attack and the same in his hold; his quick attack alone, and it and his hold as often as each is ready, into the elite,
	# and into a tough pack (six of the floor's own, TOUGH life each, held in a knot), till all are dead (30 s at most)
	if OS.has_environment("WS_DMG_ALL"):
		# (WS_DMG_WORDS="a,b,c,d": these four in place of the chosen, to hold one thing still while another is tried)
		if OS.has_environment("WS_DMG_WORDS"):
			ws = Array(OS.get_environment("WS_DMG_WORDS").split(",")).map(func(w): return null if w == "" or w == "-" else w)
		_set_words(ws)
		var lo = h.loadout
		lo.front[1] = [ws[0], ws[1]]
		lo.behind[1] = [ws[2], ws[3]]
		lo._r = [null, null, null]
		# (WS_BURN_SET="0,0.5,1": the same fights for each size of burning's own, words.gd BURN_MORE)
		# (WS_BURN_ALL_SET="0.25,0.5": the same for each size of every other hero's, words.gd BURN_MORE_ALL)
		var burns: Array = [Words.BURN_MORE]
		var all_set := OS.has_environment("WS_BURN_ALL_SET")
		if OS.has_environment("WS_BURN_SET"):
			burns = Array(OS.get_environment("WS_BURN_SET").split(",")).map(func(x): return float(x))
		if all_set:
			burns = Array(OS.get_environment("WS_BURN_ALL_SET").split(",")).map(func(x): return float(x))
		for bm in burns:
			if all_set:
				Words.BURN_MORE_ALL = float(bm)
			else:
				Words.BURN_MORE = float(bm)
			var q1 := await _fight_one(reach)
			var q2 := await _fight_one(reach, true)
			var p1 := await _fight_pack(reach, false, TOUGH)
			var p2 := await _fight_pack(reach, true, TOUGH)
			h.auto_whirl = false
			_say("ALL FOUR WORDS (%s), in his hold too (%s), burning's own +%d%%: into the elite, his quick attack alone %d a second, it and his hold %d a second; a tough pack (six of %d life), quick alone dead in %.1f s (%d a second), it and his hold %.1f s (%d a second)" % [_wname(ws), h.loadout.id(1), roundi(Words.burn_more(h) * 100.0), int(q1), int(q2), int(TOUGH), p1, int(6.0 * TOUGH / p1), p2, int(6.0 * TOUGH / p2)])
		lo.front[1] = [null, null]
		lo.behind[1] = [null, null]
		lo._r = [null, null, null]
		return
	# THE STEPS: no words; the front's damage word alone; it and the best one behind; all four; all four as his class starts
	var full: Array = ws
	var one_front: Array = [full[0], null, null, null]
	_set_words(one_front)
	var front_back: Array = _words(one_front, [2])
	var steps: Array = [["no words", [null, null, null, null]], ["one word in front (%s)" % full[0], one_front],
		["one in front and one behind (%s; %s)" % [front_back[0], front_back[2]], front_back], ["all four (%s)" % _wname(full), full]]
	var base_dps := -1.0
	for st in steps:
		_set_words(st[1])
		var a := _dps()
		var hit := _hit()
		var fight := await _fight_one(reach)
		var wipe := await _fight_pack(reach)
		if base_dps < 0.0:
			base_dps = maxf(1.0, fight)
		_say("%-70s worked out %7d a second; one hit %5d (critical %5d); IN THE FIGHT %7d a second into the elite (x%.1f no words), the pack of six dead in %.1f s" % [st[0], int(a), int(hit[0]), int(hit[1]), int(fight), fight / base_dps, wipe])
	# (the same four words, his attributes as his class starts: what the attribute adds to what the words do)
	_hero(b, false)
	for sl in picks:
		M.loot.gear[sl] = _piece(b["cls"], sl, picks[sl]["base"], picks[sl]["opts"])
	M.loot.derive()
	_set_words(full)
	var a2 := _dps()
	var fight2 := await _fight_one(reach)
	_say("%-70s worked out %7d a second; IN THE FIGHT %7d a second into the elite" % ["all four, no attribute points (his class's start)", int(a2), int(fight2)])
	if OS.has_environment("WS_DMG_EARLY"):
		await _early(b, reach)


## EARLY ON, WHERE HE FELT IT: a hero of level 10 (a word in front of each move, and one behind since level 4), his points in what
## his attacks grow with, his first two talents, the best plain weapon of floor 5 and nothing else on him; only words that are
## found. No words; the build's word in front; it and the best one behind.
func _early(b: Dictionary, reach: float) -> void:
	var E: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(OS.get_environment("WS_DMG_EARLY")))
	var keep := G
	G = E
	var cls: String = b["cls"]
	M.set_class(cls, true)
	M.loot.level = 10
	M.loot.ring_lit = true
	M.loot.gold = 0
	var C: Dictionary = Words.data()["classes"][cls]
	for k in ["str", "dex", "int"]:
		M.loot.attrs[k] = float(C["attrs"][k])
	var grows: Array = C["two"] if C.get("two") != null else [C["primary"]]
	M.loot.attrs[grows[0]] += 5.0 * 9
	var tl: Array = []
	for t in b["talents"]:
		if Talents.is_weapon(cls, t) or tl.filter(func(x): return not Talents.is_weapon(cls, x)).size() < 2:
			tl.append(t)
	h.talents = tl
	h.talents_changed()
	for s2 in M.loot.EQUIP:
		M.loot.gear[s2] = null
	M.loot.gear["mainhand"] = _piece(cls, "mainhand", _bases(cls, "mainhand")[0], [])
	M.loot.derive()
	_share_points(b, 10)
	found_only = true
	var fam: String = b["must"]
	var steps: Array = [["no words", [null, null, null, null]], ["%s in front" % fam, [fam, null, null, null]]]
	_set_words([fam, null, null, null])
	var fb: Array = _words([fam, null, null, null], [2])
	steps.append(["%s in front, %s behind" % [fam, fb[2]], fb])
	if b.has("also") and fb[2] != b["also"]:
		steps.append(["%s in front, %s behind" % [fam, b["also"]], [fam, null, b["also"], null]])
	found_only = false
	_say("EARLY ON: level 10, Str %d Dex %d Int %d, the best plain weapon of floor 5 (%d-%d) and nothing else; talents %s (floor 5's monsters: 22 to 115 life, elites 130 to 764, the Fleshmancer 5,577)" % [h.stats["str"], h.stats["dex"], h.stats["int"], h.stats["dmg_min"], h.stats["dmg_max"], ", ".join(tl)])
	var base_dps := -1.0
	for st in steps:
		_set_words(st[1])
		var a := _dps()
		var hit := _hit()
		var fight := await _fight_one(reach)
		if base_dps < 0.0:
			base_dps = maxf(1.0, fight)
		_say("  %-60s worked out %6d a second; one hit %4d; IN THE FIGHT %6d a second (x%.1f no words)" % [st[0], int(a), int(hit[0]), int(fight), fight / base_dps])
	G = keep
