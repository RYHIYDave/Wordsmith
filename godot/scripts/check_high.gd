## THE HIGH CITY'S RUNES MELDED (meldshigh_rules.gd and its parts; behind melds52.gd HIGH_ON): `--only=words --cases=high --shots=<dir>`
## (or `--cases=high:<id>,<id>`), on floor 2's pack the words check gathers (main.gd _words_shots), the switch on for the check. Off,
## the bench makes none of them; on, each from its two runes, and each level 2 from two of one; each its stone and its gear; each
## level 2 rune its rune half as strong again. Then EACH OF THE 110 ON ITS OWN, as his doc has it (his words of the first try: “I
## don't need this done quick, I need it done right”): in front of the Strike, behind it, and carried by a monster, what its twist
## waits on made so (`_setup`: a kill, one nearly dead, a third use, a dodge, burning, poison, a curse, a mark, his frenzy...), and
## its OWN moment seen: a telling of it that only its twist sends (not the line, the lance, the thorns, the spirit, the cull, the
## mark, the wave or the dodge every one of a rune's melds sends: GENERIC).
extends RefCounted

const Words := preload("res://scripts/words.gd")
const M52 := preload("res://scripts/melds52.gd")
const FoeHigh := preload("res://scripts/foe_meldshigh.gd")

const HC := ["piercing", "bleeding", "reaping", "culling", "surging"]
## (tellings every meld of a rune sends: not the twist's own)
const GENERIC := ["line", "lance", "thorns", "spirit", "blow", "cull", "mark", "take", "wave", "dodge", "foe"]
## THE 20 REDONE (his pick "Least exciting", 24 Nov 2026): each side must show its new moment itself, not just any of its own.
const EXPECT := {
	"impaler": {"front": ["heap"], "behind": ["stake"], "foe": ["grow"]},
	"witchpin": {"front": ["thread"], "behind": ["needle"], "foe": ["seek"]},
	"artery": {"front": ["jet"], "behind": ["burst"], "foe": ["jet"]},
	"hemorrhage": {"front": ["rupture"], "behind": ["spread"], "foe": ["rupture"]},
	"papercut": {"front": ["blade"], "behind": ["flurry"], "foe": ["cuts"]},
	"gangrene": {"front": ["rot"], "behind": ["seep"], "foe": ["rot"]},
	"bloodfeast": {"front": ["stream"], "behind": ["drain"], "foe": ["drink"]},
	"thornshield": {"front": ["burst"], "behind": ["lash"], "foe": ["burst"]},
	"bloodhex": {"front": ["drip"], "behind": ["spill"], "foe": ["sigil"]},
	"ghoul": {"front": ["maw"], "behind": ["stream"], "foe": ["feed"]},
	"deadeye": {"front": ["sight"], "behind": ["shot"], "foe": ["eye"]},
	"macabre": {"front": ["dance"], "behind": ["frenzy"], "foe": ["frenzy"]},
	"gravewarden": {"front": ["ward"], "behind": ["haul"], "foe": ["shade"]},
	"fetch": {"front": ["leap"], "behind": ["dart"], "foe": ["blink"]},
	"bloodprice": {"front": ["price"], "behind": ["price"], "foe": ["drink"]},
	"mercy": {"front": ["sight"], "behind": ["pass"], "foe": ["sight"]},
	"lastrites": {"front": ["taken", "thrown"], "behind": ["grow"], "foe": ["pass"]},
	"heartbeat": {"front": ["stream"], "behind": ["burst"], "foe": ["throb"]},
	"bastion": {"front": ["wall"], "behind": ["push"], "foe": ["ward"]},
	"bloodharvest": {"front": ["rise"], "behind": ["splash"], "foe": ["blood"]},
	# (round 2, his "And then do it again")
	"bodkin": {"front": ["shard"], "behind": ["seek"], "foe": ["shatter"]},
	"coup": {"front": ["dash"], "behind": ["slash"], "foe": ["blur"]},
	"massacre": {"front": ["whirl"], "behind": ["killmark"], "foe": ["frenzy"]},
	"barrage": {"front": ["volley"], "behind": ["twice"], "foe": ["fan"]},
	"bloodlance": {"front": ["burst"], "behind": ["draw"], "foe": ["trail"]},
	"bloodrage": {"front": ["spray"], "behind": ["spring"], "foe": ["rage"]},
	"dart": {"front": ["return"], "behind": ["path"], "foe": ["dash"]},
	"harrow": {"front": ["spikes"], "behind": ["row"], "foe": ["rake"]},
	"harvest": {"front": ["sweep"], "behind": ["rise"], "foe": ["soul"]},
	"lacerate": {"front": ["burst"], "behind": ["path"], "foe": ["gape"]},
	"spearwall": {"front": ["spears"], "behind": ["wall"], "foe": ["stagger"]},
	"thornspray": {"front": ["root"], "behind": ["spray"], "foe": ["spray"]},
	"undying": {"front": ["hand"], "behind": ["again"], "foe": ["hand"]},
	"wraithstep": {"front": ["image"], "behind": ["fast"], "foe": ["rise"]},
	"deathwatch": {"front": ["scythe"], "behind": ["creep"], "foe": ["shadow"]},
	"flicker": {"front": ["blink"], "behind": ["flick"], "foe": ["echo"]},
	"haunting": {"front": ["wail"], "behind": ["shroud"], "foe": ["wail"]},
	"spark": {"front": ["zap"], "behind": ["trail"], "foe": ["spark"]},
	"purge": {"front": ["flood"], "behind": ["wide"]},
	"stinger": {"front": ["burst"], "behind": ["trail"], "foe": ["cloud"]},
	# (the others whose own moment was told by a common name, now told as their own)
	"wraithspear": {"behind": ["javelin"]},
	"deathblow": {"behind": ["finish"]},
	"breakthrough": {"front": ["breach"], "behind": ["thrust"]},
	"bloodwave": {"behind": ["thornring"]},
	"soulstorm": {"front": ["soul"], "behind": ["rise"]},
	"deathknell": {"front": ["toll"]},
}
## (those the films wait on, as they need it: their front's twist on a kill, a cull, a third use; their behind's, a dodge)

var M
var h
var n := 0
var bad: Array = []
var dir := ""


func _init(main, hero) -> void:
	M = main
	h = hero
	dir = str(M._arg("shots"))


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("HIGH %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _fresh() -> void:
	h.m52.forget()
	h.m52.told = {}
	h.last.spirits = []
	h.last.zones = []
	h.last._lances = []
	h.last.reap.fresh_place()
	h.last.high.fresh_place()
	h.might = 0.0
	h.frenzy = 0
	h.frenzy_t = 0.0
	h.shield = 0.0
	h.barrier = 0.0
	h.uses = [0, 0, 0]
	h.stats["crit_chance"] = 0.0
	for m in M._w_pack:
		m.m52 = {}
		m.dead = false
		m._dead_for = 0.0
		m.modulate.a = 1.0
		m.visible = true
		m.risen = false
		for f in ["shock_t", "chill_t", "frozen_t", "freeze_immune", "stun_t", "burn_t", "poison_t", "bleed_t", "hex_t", "still_t", "bind_t", "bind_again", "mark_t"]:
			m.set(f, 0.0)
		m.thrown = {}
		m.words = []
	M._w_reset(h)
	# (nothing of the last case's monster still on its way: a shockwave warned, a shot in the air)
	M._monsters.perils.list.clear()
	M._monsters.perils._echoes.clear()
	for a in M._monsters._arrows:
		if is_instance_valid(a["node"]):
			a["node"].queue_free()
	M._monsters._arrows.clear()
	for f in ["bleed_t", "poison_t", "burn_t", "chill_t", "hex_t", "still_t", "root_t", "held", "frozen_t", "shock_t"]:
		h.set(f, 0.0)
	h.foe_hi = {}


func run(only := "") -> void:
	var was: bool = M52.HIGH_ON
	var T: Dictionary = M52.T()
	var all: Array = T["high"]
	var melds: Array = all.filter(func(id): return not M52.is_new_rank(id))
	var ranks: Array = all.filter(func(id): return M52.is_new_rank(id))
	# --- THE BENCH
	M52.HIGH_ON = false
	var none: bool = melds.all(func(id): return Words.meld_of(T["of"][id][0], T["of"][id][1]) == "") and ranks.all(func(id): return Words.meld_of(T["rankOf"][id]["word"], T["rankOf"][id]["word"]) == "")
	_line(none, "switched off, the bench makes none of the %d (Piercing + Flame: '%s')" % [all.size(), Words.meld_of("piercing", "fire")])
	M52.HIGH_ON = true
	var wrong: Array = []
	for id in melds:
		var of: Array = T["of"][id]
		if Words.meld_of(of[0], of[1]) != id or Words.meld_of(of[1], of[0]) != id or Words.meld_problem(of[0], of[1]) != "":
			wrong.append(id)
	for id in ranks:
		var w: String = T["rankOf"][id]["word"]
		if Words.meld_of(w, w) != id or Words.meld_problem(w, w) != "":
			wrong.append(id)
	_line(wrong.is_empty(), "switched on, it makes all %d melds from their two runes and the %d level 2 runes from two of one%s" % [melds.size(), ranks.size(), "" if wrong.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(wrong))])
	_line(Words.meld_of("plundering", "piercing") == "" and Words.meld_of("greed", "culling") == "" and Words.meld_of("mirroring", "piercing") == "", "and none with Plundering, Greed or Mirroring")
	var L = M.loot
	var it := {"slot": "mainhand", "ilvl": 10}
	var no_stone: Array = all.filter(func(id): return not L.pics.has("word:" + id))
	var no_gear: Array = all.filter(func(id): return L.imbue_options(id, it).is_empty())
	_line(no_stone.is_empty() and no_gear.is_empty(), "each its stone (%d of %d) and its gear (%d of %d)" % [all.size() - no_stone.size(), all.size(), all.size() - no_gear.size(), all.size()])
	var names := {}
	for id in all:
		names[str(T["words"][id]["name"])] = true
	_line(names.size() == all.size(), "each its own name (%d names for %d)" % [names.size(), all.size()])
	# --- LEVEL 2: its rune half as strong again on the move
	var FIELDS := {"piercing2": ["through", "lance"], "bleeding2": ["bleed", "thorns"], "reaping2": ["reap", "spirit"], "culling2": ["cull", "cull_mark"], "surging2": ["surge", "dodge_surge"]}
	var lv: Array = []
	for id in ranks:
		var w: String = T["rankOf"][id]["word"]
		var f: Array = FIELDS[id]
		var a0: float = float(M._w_set(h, 0, "front", [w])[f[0]])
		var b0: float = float(M._w_set(h, 0, "front", [id])[f[0]])
		var c1: float = float(M._w_set(h, 0, "behind", [w])[f[1]])
		var d1: float = float(M._w_set(h, 0, "behind", [id])[f[1]])
		if b0 <= a0 * 1.2 or d1 <= c1 * 1.2:
			lv.append("%s (%.2f/%.2f, %.2f/%.2f)" % [id, a0, b0, c1, d1])
	_line(lv.is_empty(), "each level 2 rune its rune half as strong again, in front and behind%s" % ("" if lv.is_empty() else ": " + ", ".join(PackedStringArray(lv))))
	# --- AT WORK: each on its own
	var ids: Array = melds
	if only != "":
		var some := only.split(",")
		ids = ids.filter(func(i): return some.has(i))
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	var res := {"front": [0, []], "behind": [0, []], "foe": [0, []]}
	var shot := 0
	for id in ids:
		var row := []
		for side in ["front", "behind", "foe"]:
			var seen := ""
			if side == "foe":
				seen = await _foe(id, shot < 4)
			else:
				seen = await _case(id, side, shot < 8)
			if seen != "":
				res[side][0] += 1
			else:
				res[side][1].append(id)
			row.append(seen.trim_prefix(id + ":") if seen != "" else "MISSING")
			shot += 1
		# (as it goes, one line a meld: what it showed in front, behind and on a monster)
		print("HIGH . %s: %s" % [id, " / ".join(PackedStringArray(row))])
	h.stats["life_regen"] = regen
	for side in ["front", "behind", "foe"]:
		var miss: Array = res[side][1]
		_line(miss.is_empty(), "each %s, its own twist seen: %d of %d%s" % ["in front of the Strike" if side == "front" else ("behind it" if side == "behind" else "carried by a monster"), res[side][0], ids.size(), "" if miss.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(miss))])
	M52.HIGH_ON = was
	_fresh()
	print("HIGH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## The pack stood for meld `id` (its line, its near ones), and what its twist waits on made so; `side` front or behind. Also used by
## the films (check_melds52.gd film).
func setup(id: String, side: String) -> void:
	var of: Array = M52.T()["of"][id]
	var pack: Array = M._w_pack
	var face: Vector2 = M._w_face
	var across := Vector2(-face.y, face.x)
	var home: Vector2 = M._w_home
	# (a line behind the first, one beside it, two near: what a line, an arc, a splash and a soul's flight need)
	var spots := [[1.2, 0.0], [1.3, 1.0], [2.2, 0.05], [3.1, -0.1], [3.0, 1.7], [2.0, -1.6]]
	for k in pack.size():
		var p: Array = spots[k] if k < spots.size() else [8.0, 0.0]
		pack[k].world = home + face * float(p[0]) + across * float(p[1])
		pack[k].max_life = 600.0
		pack[k].life = 600.0
	var hcs: Array = of.filter(func(w): return w in HC)
	var other: String = of[1] if hcs.has(of[0]) else of[0]
	# (a kill for Reaping: the first struck dies; its others nearby still to act on)
	if hcs.has("reaping") or id in ["bloodburst", "deathburst", "sunspear", "massacre", "gangrene"]:
		pack[0].life = 1.0
	# (one nearly dead for Culling: left just over one Strike's worth, so the Strike leaves it low; or low already behind)
	if hcs.has("culling"):
		var hit: float = float(M._w_hit(h, 0))
		for m in pack:
			m.max_life = 4000.0
			m.life = hit * 1.05 + m.max_life * 0.06 if side == "front" else m.max_life * 0.12
	# (Surging in front: this use its shockwave's; behind, his dodge after it)
	if hcs.has("surging") and side == "front":
		h.uses[0] = 1 if id in ["spark", "crescendo", "soulstorm"] else 2
	# (Soulstorm behind: one near him for his dodge's surge to kill, after the Strikes have killed the first)
	if id == "soulstorm" and side == "behind":
		pack[1].world = home + across * 1.2
	# (what its other rune's twist waits on)
	if id in ["impaler", "gore", "upheaval"]:
		h.might = 30.0
	if id in ["barrage", "bloodrage", "macabre", "massacre", "crescendo"]:
		h.frenzy = int(Words.data()["frenzy"]["max"])
		h.frenzy_t = 9.0
	if id in ["bodkin", "lens", "artery", "mercy"] and side == "behind":
		pack[1].mark_t = 6.0
		pack[2].mark_t = 6.0
	if id in ["deadeye", "artery", "mercy"] and side == "front":
		h.stats["crit_chance"] = 100.0
	if id in ["nova", "bloodboil", "cremate"]:
		for m in pack:
			m.burn_t = 4.0
			m.burn_dps = 2.0
	if id in ["gangrene", "pestilence", "nightshade"]:
		for m in pack:
			m.poison_t = 4.0
			m.poison_dps = 150.0 if id == "nightshade" else 2.0
			m.poison_n = 3
	if id in ["haunting", "hexwave", "condemn", "bloodhex"]:
		for m in pack:
			m.hex_t = 4.0
			m.hex_more = 0.2
	if id in ["coldcut"]:
		for m in pack:
			m.chill_t = 2.0
			m.chill = 0.3
	if id in ["bloodwave", "bloodburst", "bloodharvest", "thornspray", "bloodrage", "lacerate", "papercut", "fangs", "gangrene"] or other == "bleeding" and side == "front":
		for m in pack:
			m.bleed_t = 4.0
			m.bleed_dps = 6.0
			m.bleed_move = 2.0
	# (round 2: Lacerate's first cut already there; one beside him for Coup's cut as he runs past)
	if id == "lacerate" and side == "front":
		for m in pack:
			m.m52["lac"] = 1
			m.m52["bleed_from"] = 0.0
	if id == "coup" and side == "behind":
		pack[1].world = home + across * 0.6
		pack[1].life = pack[1].max_life * 0.6
	# (Noose in front: held, not culled by the first blow, so the hold can tighten)
	if id == "noose" and side == "front":
		for m in pack:
			m.life = m.max_life * 0.4
	# (Purge in front: three in reach of one blow)
	if id == "purge" and side == "front":
		pack[1].world = home + face * 1.1 + across * 0.55
		pack[2].world = home + face * 1.1 - across * 0.55
		for k in 3:
			pack[k].life = pack[k].max_life * 0.08
	# (Bloodboil and Mangle in front: enough life that the two Strikes and their burning and bleeding leave them standing, to
	# walk boiling, or to tear as the stun ends)
	if id in ["bloodboil", "mangle"] and side == "front":
		for m in pack:
			m.max_life = 4000.0
			m.life = 4000.0
	# (Mercy behind: two left standing, for the mark to pass to)
	if id == "mercy" and side == "behind":
		pack[3].life = pack[3].max_life * 0.5
		pack[4].life = pack[4].max_life * 0.5


## One meld on one side of the Strike: its setup, the Strike (twice), what it waits on after, and its own moment watched for.
func _case(id: String, side: String, snap: bool) -> String:
	_fresh()
	# (Purge in front waits on one blow culling three: the Whirl's, which strikes all round him; the Strike strikes one)
	var whirl: bool = id == "purge" and side == "front"
	var r: Dictionary = M._w_set(h, 1 if whirl else 0, side, [id])
	setup(id, side)
	var of: Array = M52.T()["of"][id]
	if whirl:
		await M._w_whirl_begin(h)
		await M._w_whirl_on(h, 2)
	else:
		await M._w_strike(h)
	await _after(id, side)
	await M._wait(0.35)
	# (Soulstorm in front: the first Strike's kill a soul gathered, the second its third use, whose wave carries it out)
	if not (of.has("surging") and side == "front" and id != "soulstorm") and not whirl:
		await M._w_strike(h)
	if of.has("surging") and side == "behind":
		if id == "heartbeat":
			h.last.high.orb(h.world + Vector2(1.6, 0.4))
			await M._wait(0.1)
		if id == "soulstorm" and not M._w_pack[1].dead:
			M._w_pack[1].life = 1.0
		h.last.dodge_surge(h.world)
		await M._wait(0.3)
		h.last.high.surge.landed(h.world)
	var t := 0.0
	var seen := ""
	while t < 3.2 and seen == "":
		await M._wait(0.1)
		t += 0.1
		h.world = M._w_home
		_nudge()
		seen = _own(id, side)
		if id in ["undying", "soulburst"] and side == "behind":
			for sp in h.last.spirits:
				sp["t"] = maxf(float(sp["t"]), float(sp["life"]) - 0.15)
		if id == "deathwatch" and side == "front":
			for m in M._w_pack:
				if not m.dead and m.m52.is_empty() == false:
					m.life = minf(m.life, m.max_life * 0.05)
	if snap and dir != "":
		await M._snap("%s/high_%s_%s.png" % [dir, id, side])
	if seen == "":
		print("HIGH   %s %s: named '%s', told %s" % [id, side, r["name"], str(h.m52.told.keys())])
	return seen


## What its twist waits on, after the first Strike: a blow on him behind his shield (Thornshield).
func _after(id: String, side: String) -> void:
	# (the first of the pack still standing, to strike him)
	var src = M._w_pack[1]
	for m in M._w_pack:
		if not m.dead:
			src = m
			break
	if id == "thornshield" and side == "front":
		# (a blow on him behind his shield, then one that breaks it)
		h.hurt_by(5.0, "phys", [], {}, src, h.world)
		await M._wait(0.1)
		h.shield = 3.0
		h.hurt_by(30.0, "phys", [], {}, src, h.world)
	if id == "thornshield" and side == "behind":
		# (struck while he stands in the ward)
		var W: Array = h.last.high.bleed._wards
		if not W.is_empty():
			h.world = W[0]["at"]
			h.hurt_by(5.0, "phys", [], {}, src, h.world)
			h.world = M._w_home
	if id == "gravewarden" and side == "front":
		# (a blow on him, which a shade takes)
		h.hurt_by(5.0, "phys", [], {}, src, h.world)
	if id == "lastrites" and side == "front":
		h.shield = maxf(h.shield, 20.0)
		h.hurt_by(5.0, "phys", [], {}, src, h.world)
	if id == "bloodhex" and side == "behind":
		# (one dies in the circle)
		var C: Array = h.last.high.bleed._circles
		if not C.is_empty():
			var m = M._w_pack[3]
			m.world = C[0]["at"]
			m.damage(m.life + m.shield + 10.0, "phys", false, false, [], false, false, -1)


## The pack moves a little each moment (what bleeds while it moves, Bloodboil's spatter, needs it).
func _nudge() -> void:
	# (each walks a small circle, as a monster in a fight is always on the move)
	var t: float = Time.get_ticks_msec() / 1000.0
	for k in M._w_pack.size():
		var m = M._w_pack[k]
		if not m.dead:
			var a: float = t * 3.0 + k
			m.world += Vector2(-sin(a), cos(a)) * 0.09


## Its own moment, if seen ("id:what" not one every meld of its rune sends), or "".
func _own(id: String, side := "") -> String:
	var want: Array = EXPECT.get(id, {}).get(side, [])
	for k in h.m52.told.keys():
		var s := str(k)
		if not s.begins_with(id + ":"):
			continue
		var what := s.trim_prefix(id + ":")
		if not want.is_empty():
			if want.has(what):
				return s
		elif not GENERIC.has(what):
			return s
	return ""


## A monster carrying `id` set up as its twist on him waits on (also used by the films, check_melds52.gd film): a kin near it,
## risen already for those whose twist is a risen one's, and him bleeding, poisoned, burning, cursed... as it needs.
func foe_setup(id: String, m) -> void:
	var of: Array = M52.T()["of"][id]
	if M._w_pack.size() > 1:
		var kin = M._w_pack[1]
		kin.world = m.world + Vector2(-M._w_face.y, M._w_face.x) * 1.0
		kin.max_life = 600.0
		kin.life = 300.0
	if id in ["ghoul", "deadeye", "macabre", "gravewarden", "undying", "haunting", "harvest"]:
		m.risen = true
	if id == "bodkin":
		h.shield = maxf(h.shield, 20.0)
	if id == "barrage":
		m.life = m.max_life * 0.3
	h.bleed_t = 4.0
	h.bleed_dps = 3.0
	if of.has("culling"):
		h.life = h.max_life * 0.2
	if id in ["gangrene", "nightshade", "quietus", "deathwatch", "longspear"]:
		h.poison_t = 4.0
		h.poison_dps = 2.0
	if id in ["cremate", "bloodboil", "quietus"]:
		h.burn_t = 4.0
		h.burn_dps = 2.0
	if id in ["icelance", "rimeblood"]:
		h.chill_t = 2.0
	if id in ["witchpin", "condemn"]:
		h.hex_t = 4.0
		h.hex_more = 0.15
	if id in ["finalhour"]:
		h.still_t = 2.0
		h.still_k = 0.2
	if id in ["galvanic"]:
		h.shock_t = 3.0
	if id in ["briar", "noose"]:
		h.root_t = 0.5


## Whether a monster carrying `id` must die for its twist on him to show (its rising, its burst, its rot, its shield passed on).
static func foe_dies(id: String) -> bool:
	var of: Array = M52.T()["of"][id]
	return of.has("reaping") and id != "harvest" or id in ["bloodburst", "fuse", "deathburst", "gangrene", "lastrites", "thornspray"]


## Carried by a monster: the moment its twist on him waits on (a blow of it, its shot, its death, its rising, its shockwave),
## and its telling as a monster's (foe).
func _foe(id: String, snap: bool) -> String:
	_fresh()
	# (he carries no runes here, so what is told is the monster's alone)
	M._w_put(h, 0, "front", [])
	var of: Array = M52.T()["of"][id]
	var m = M._w_pack[0]
	m.words = [id, of[0], of[1]]
	m.max_life = 600.0
	m.life = 600.0
	m.world = h.world + M._w_face * 1.2
	foe_setup(id, m)
	var k := func(w: String) -> float: return 1.0 if m.words.has(w) else 0.0
	var by: Dictionary = m.blow()
	# (its blow, twice; its shot; its shield struck)
	for _j in (3 if id in ["artery", "lacerate"] else 2):
		h.blow_by = m
		h.hurt_by(20.0, str(by.get("el", "phys")), m.words, {}, m, m.world)
		h.blow_by = null
	if of.has("piercing"):
		if id == "bodkin":
			h.shield = maxf(h.shield, 20.0)
		M._monsters.shoot(m, (h.world - m.world).normalized(), 7.0, 6.0, 15.0)
	if id in ["thornshield", "spearwall"]:
		m.shield = 50.0
		M._foe.shield(m, 10.0)
		m.shield = 0.0
		M._foe.shield(m, 10.0)
	if id in ["massacre", "harvest"] and M._w_pack.size() > 1:
		# (one of its kin dies near it)
		var kin = M._w_pack[1]
		kin.damage(kin.life + kin.shield + 10.0, "phys", false, false, [], false, false, -1)
	if id == "impaler":
		# (one of its shots going into a wall: it grows; then on him, harder)
		var wall := Vector2.INF
		for dy in range(-12, 13):
			for dx in range(-12, 13):
				var c := Vector2i(floori(h.world.x) + dx, floori(h.world.y) + dy)
				if wall == Vector2.INF and not M._monsters.map.open_at(c.x, c.y):
					wall = Vector2(c.x + 0.5, c.y + 0.5)
		if wall != Vector2.INF:
			var a := {"high": "impaler", "r": 0.3, "dir": Vector2(1, 0), "hit": false, "src": m}
			FoeHigh.fly(M._monsters, a, h.world, wall)
			FoeHigh.hit_k(M._monsters, a)
	# (its shockwave)
	if of.has("surging"):
		m.surge_t = 0.01
		m._surge(0.05)
	await M._wait(0.6)
	# (its death, and its rising)
	if foe_dies(id):
		m.damage(m.life + m.shield + 10.0, "phys", false, false, [], false, false, -1)
	var t := 0.0
	var seen := ""
	var wait: float = 4.5 if of.has("reaping") else 2.2
	while t < wait and seen == "":
		await M._wait(0.1)
		t += 0.1
		h.world = M._w_home
		var want: Array = EXPECT.get(id, {}).get("foe", [])
		for kk in h.m52.told.keys():
			if str(kk).begins_with(id + ":") and (want.is_empty() or want.has(str(kk).trim_prefix(id + ":"))):
				seen = str(kk)
	if snap and dir != "":
		await M._snap("%s/high_%s_foe.png" % [dir, id])
	if seen == "":
		print("HIGH   %s foe: told %s" % [id, str(h.m52.told.keys())])
	h.life = h.max_life
	return seen
