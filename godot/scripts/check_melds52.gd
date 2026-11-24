## THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES (melds52.gd, melds52_rules.gd): `--only=words --cases=m52` (or
## `--cases=m52:<id>,<id>`), on floor 2's pack of six skeletons the words check gathers (main.gd _words_shots). With the switch
## on for the check: the bench makes each from its two runes, and two of one of the eleven its level 2; the 23 melds and the
## damage words' ranks as they were; with it off, none of these. Their stones, their gear (one property of each of its two runes,
## each a quarter weaker; a level 2 rune's, half again). Then each in front of the Strike and behind it: its name on the move, its
## line on its page, the blow landing, and its twist seen at work where one Strike at the pack shows it.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const M52 := preload("res://scripts/melds52.gd")

var M
var h
var n := 0
var bad: Array = []

## What one Strike at the pack shows of each twist (rules' tellings, "id:what"), in front and behind.
const FRONT := {"onslaught": "onslaught:second", "viper": "viper:bite", "flashfreeze": "flashfreeze:freeze", "aftershock": "aftershock:burst",
	"flurry": "flurry:stack", "quickdraw": "quickdraw:draw", "momentum": "momentum:build", "tailwind": "tailwind:gust", "blink": "blink:blink",
	"earthquake": "earthquake:wave", "gale": "gale:blow", "marrow": "marrow:drink", "secondwind": "secondwind:wind", "pressurepoint": "pressurepoint:point",
	"concussion": "concussion:boom", "quickfuse": "quickfuse:pop",
	# (the last floor 1-10 group)
	"hornet": "hornet:barb", "tempo": "tempo:beat", "staccato": "staccato:tick", "ripple": "ripple:ripple", "reverb": "reverb:ring",
	"rapier": "rapier:flick", "ambush": "ambush:glint", "bullseye": "bullseye:ring", "aftermath": "aftermath:smoke", "whipcrack": "whipcrack:crack",
	"lamprey": "lamprey:drink", "cluster": "cluster:bomblets", "bloodbloom": "bloodbloom:bloom", "mayhem": "mayhem:spark", "timebomb": "timebomb:tick",
	"blastwave": "blastwave:wave", "transfusion": "transfusion:drip", "charge": "charge:ram", "mire": "mire:mud", "anvil": "anvil:sparks",
	"minefield": "minefield:mine"}
const BEHIND := {"flashfreeze": "flashfreeze:sheet", "aftershock": "aftershock:quake", "gale": "gale:gust", "flurry": "flurry:gust",
	"duelist": "duelist:mark", "needle": "needle:mark", "brand": "brand:mark", "seeker": "seeker:mark", "quickdraw": "quickdraw:mark",
	# (the last floor 1-10 group)
	"staccato": "staccato:quick", "ripple": "ripple:wide", "timebomb": "timebomb:wait", "blastwave": "blastwave:wide", "sanctuary": "sanctuary:ward",
	"parry": "parry:ward", "aegis": "aegis:wide", "aftermath": "aftermath:linger", "whipcrack": "whipcrack:snap", "spree": "spree:two",
	"fury": "fury:hold", "lancet": "lancet:mark", "vendetta": "vendetta:mark", "ambush": "ambush:mark",
	"doubletap": "doubletap:marks", "bullseye": "bullseye:marks"}


## (THE FILMS' THIRD STEP, the carrier: a monster's life; how low it starts, for what its twist waits on; those it dies for;
## the numbers of the twist made certain for the film; how long to wait after his blows, for what comes back after)
const FOE_LIFE := 600.0
const FOE_LOW := {"lifeline": 0.4, "rampage": 0.5, "rapier": 0.4, "hairtrigger": 0.3, "shieldwall": 0.7, "fury": 0.5}
const FOE_DIES := ["cluster", "bloodbloom", "blastwave", "mayhem", "timebomb", "minefield", "quickfuse", "concussion", "smoulder"]
const FOE_TUNE := {"needle": {"foeCrit": 1.0}, "brand": {"foeCrit": 1.0}, "hornet": {"foeWindow": 99.0}, "rapier": {"foeEach": 10.0}, "doubletap": {"foeCrit": 1.0}, "vendetta": {"foeCrit": 1.0},
	"detonator": {"foeCrit": 1.0}, "lancet": {"foeCrit": 1.0}, "bullseye": {"foeCrit": 1.0}}
const FOE_TAIL := {"sanctuary": 3.6, "timebomb": 2.4, "detonator": 1.8}
## (whose twist is seen on a kill, or on one stunned already)
const KILL := ["quickfuse", "concussion", "smoulder", "cluster", "bloodbloom", "mayhem", "timebomb", "blastwave", "minefield"]
## (whose twist wants one alone, certain criticals, a frenzy built up: the film makes it so)
const SOLO := ["duelist"]
## (seen only as he moves: him darting aside after each blow in the film)
const MOVES := ["blink", "tailwind", "glide", "firewalk", "quicksilver", "charge"]
## (seen only in a burst of speed: him given one for the film)
const HASTE := ["onrush", "hornet", "firewalk", "quicksilver", "charge", "glide"]
## (seen only below half life)
const LOW := ["lifeline"]
## (seen only on one brought low but not killed: the pack made tough and low)
const TOUGH := ["hairtrigger"]
const SHIELD := ["talisman", "bulwark", "hemlock", "cinderward", "static", "windward", "fortress", "redoubt", "carapace", "minefield", "riposte", "shieldwall", "sanctuary", "parry", "aegis"]
const CRITS := ["needle", "brand", "seeker", "doubletap", "lancet", "detonator", "vendetta"]
const FRENZY := ["berserk", "fever", "whiteout", "overcharge", "blur", "juggernaut", "feedingfrenzy", "mayhem", "rapier", "shieldwall", "fury", "spree", "rampage", "tempo"]
## (whose moment behind is a kill's: its orb, its frenzy's)
const KILL_BEHIND := ["bloodlust", "coldblood", "secondwind", "berserk", "fever", "whiteout", "overcharge", "blur", "spree", "fury", "bloodbloom", "feedingfrenzy", "mayhem", "lifeline", "transfusion", "detonator", "rapier", "shieldwall", "minefield", "tempo"]
## (whose moment comes later than the others': a burn going out and lighting again)
const LONGER := {"rekindle:front": 2.6, "rekindle:behind": 2.0, "bloat:front": 1.6, "jolt:behind": 1.2, "smoulder:front": 1.0,
	"timebomb:front": 1.2, "timebomb:behind": 2.0, "detonator:front": 1.0, "cluster:front": 0.6, "fury:front": 1.5, "redoubt:front": 1.0, "transfusion:front": 1.0}
const STUNNED := ["pressurepoint", "daze", "charge", "mire", "anvil"]
## THE CITY'S MELDS (meldscity_rules.gd): what one Strike shows of each, in front (behind: its shards flying, or what it left), and
## what its twist waits on made so on the pack before the Strike: cursed, slowed in time, held, chilled, frozen. "" in front: seen
## only over quick uses (the films strike twice) or nothing told (Amber's longer hold).
const CITY_FRONT := {"maw": "maw:crash", "sump": "sump:drain", "drift": "drift:slide", "firewhirl": "firewhirl:whirl", "lodestone": "lodestone:tug",
	"riptide": "", "gravity": "gravity:crater", "pulling2": "", "splinter": "splinter:jolt", "spore": "spore:puff", "sleet": "sleet:sliver",
	"embers": "embers:burst", "fractal": "fractal:fork", "scatter": "", "rubble": "rubble:thud", "splitting2": "", "doom": "doom:thorn",
	"plague": "plague:pass", "hoarfrost": "hoarfrost:frozen", "brimstone": "brimstone:flare", "jinx": "jinx:mark", "whisper": "whisper:wisp",
	"burden": "burden:weight", "hexing2": "", "stasis": "stasis:hold", "stagnation": "", "frostlock": "frostlock:lock", "slowburn": "slowburn:slow",
	"stormglass": "stormglass:hang", "timeslip": "timeslip:hand", "standstill": "standstill:stun", "stilling2": "", "shackle": "shackle:clank",
	"strangler": "strangler:vines", "icebound": "icebound:climb", "firetrap": "firetrap:tongues", "tether": "tether:chain", "lasso": "",
	"anchor": "anchor:stun", "binding2": "", "confluence": "confluence:drag", "beckon": "beckon:wisp", "horizon": "horizon:rim", "reel": "reel:hook",
	"coven": "coven:mark", "constellation": "constellation:star", "web": "web:thread", "torpor": "torpor:drowse", "witchknot": "witchknot:knot", "amber": ""}
const CITY_PRE := {"tether": ["bind"], "doom": ["hex"], "plague": ["hex"], "hoarfrost": ["hex", "frozen"], "brimstone": ["hex"], "whisper": ["hex"], "beckon": ["hex"],
	"stasis": ["still"], "frostlock": ["still", "chill"], "slowburn": ["still"], "stormglass": ["still"], "timeslip": ["still"],
	"shackle": ["bind"], "icebound": ["bind", "chill"], "firetrap": ["bind"], "drift": ["chill"], "torpor": ["hex", "still"], "witchknot": ["hex", "bind"]}
## (whose moment in front is a kill's)
const CITY_KILL := ["plague"]
## THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES (meldscity2_rules.gd): what one Strike shows of each in front (behind: what it left,
## "id:leave"), what its twist waits on made so on the pack first, whose moment is a kill's, whose wants his frenzy full, whose a
## certain critical. "": nothing told of it in one Strike (its copies faster, five copies; a chance; a blow on his shield).
const CITY2_FRONT := {"backwash": "backwash:stagger", "gullet": "gullet:drink", "harpoon": "", "whirlpool": "whirlpool:spin", "haven": "haven:shield",
	"eddy": "eddy:eddy", "whiplash": "whiplash:yank", "maelstrom": "maelstrom:maw", "hydra": "hydra:heads", "swarm": "swarm:drink",
	"shellburst": "shellburst:pop", "pinpoint": "pinpoint:aim", "riot": "riot:step", "phalanx": "phalanx:shield", "rebound": "rebound:bounce",
	"flechette": "", "starburst": "", "refrain": "refrain:deeper", "bloodcurse": "bloodcurse:drink", "hexblast": "hexblast:burst",
	"evileye": "evileye:glare", "delirium": "delirium:step", "talisman": "", "grudge": "grudge:brand", "omen": "omen:fall", "pall": "pall:veil",
	"rewind": "rewind:turn", "sap": "sap:drink", "slowfuse": "slowfuse:fuse", "stillpoint": "", "quickening": "quickening:deep", "respite": "",
	"eternity": "eternity:loop", "stutter": "stutter:catch", "doldrums": "doldrums:spread", "fetters": "fetters:cuff", "thrall": "thrall:drink",
	"tripwire": "tripwire:boom", "pin": "pin:pierce", "mauler": "mauler:step", "stockade": "stockade:shield", "manacle": "manacle:lock",
	"snag": "snag:hook", "dragnet": "dragnet:net"}
const CITY2_PRE := {"refrain": ["hex"], "bloodcurse": ["hex"], "hexblast": ["hex"], "evileye": ["hex"], "delirium": ["hex"], "grudge": ["hex"],
	"omen": ["hex"], "pall": ["hex"], "rewind": ["still"], "sap": ["still"], "slowfuse": ["still"], "quickening": ["still"], "eternity": ["still"],
	"stutter": ["still"], "fetters": ["bind"], "thrall": ["bind"], "tripwire": ["bind"], "pin": ["bind"], "mauler": ["bind"], "snag": ["bind"]}
const CITY2_KILL := ["hexblast", "slowfuse", "tripwire"]
const CITY2_FRENZY := ["riot", "quickening", "whirlpool"]
const CITY2_CRITS := ["evileye"]


## What a city meld's twist waits on, made so on `m`.
func _pre(id: String, m) -> void:
	for w in CITY_PRE.get(id, CITY2_PRE.get(id, [])):
		match w:
			"hex":
				m.hex_t = 4.0
				m.hex_more = 0.2
			"still":
				m.still_t = 3.0
				m.still_k = 0.3
			"bind":
				m.bind_t = 3.0
				m.bind_again = 0.0
			"chill":
				m.chill_t = 2.5
				m.chill = 0.3
			"frozen":
				m.frozen_t = 2.0


## What one Strike behind shows of a city meld: its shards flying, or the city's ground it left.
func _city_behind(id: String) -> String:
	if not M52.is_city(id) or M52.is_new_rank(id):
		return ""
	var of: Array = M52.T()["of"][id]
	return id + (":shards" if of.has("splitting") else ":leave")


func _init(main, hero) -> void:
	M = main
	h = hero


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("MELDS52 %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(only := "") -> void:
	var was: bool = M52.ON
	var was_city: bool = M52.CITY_ON
	var T: Dictionary = M52.T()
	# (THE CITY'S MELDS: off, the bench makes none of them; on for the rest of the check)
	M52.ON = true
	M52.CITY_ON = false
	_line(Words.meld_of("pulling", "power") == "" and Words.meld_of("binding", "binding") == "" and Words.meld_of("twin", "power") == "onslaught", "the city's melds switched off, the bench makes none of them (Pulling + Power: '%s'), the 98 as before" % Words.meld_of("pulling", "power"))
	M52.CITY_ON = true
	# (THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES: likewise)
	var was_city2: bool = M52.CITY2_ON
	M52.CITY2_ON = false
	_line(Words.meld_of("pulling", "twin") == "" and Words.meld_of("binding", "vast") == "" and Words.meld_of("pulling", "volatile") == "implode", "the city's runes with the floor 6–10 runes switched off, the bench makes none of them (Pulling + Twin: '%s'), Implode as before" % Words.meld_of("pulling", "twin"))
	M52.CITY2_ON = true
	# (REAPING WITH THE DAMAGE RUNES: likewise; its own check check_reap5.gd)
	var was_reap: bool = M52.REAP_ON
	M52.REAP_ON = false
	_line(Words.meld_of("reaping", "fire") == "", "Reaping with the damage runes switched off, the bench makes none of them (Reaping + Flame: '%s')" % Words.meld_of("reaping", "fire"))
	M52.REAP_ON = true
	# --- THE BENCH
	M52.ON = false
	_line(Words.meld_of("twin", "power") == "" and Words.meld_of("swift", "swift") == "" and Words.meld_problem("twin", "power") != "", "switched off, the bench makes none of them (Twin + Power: '%s')" % Words.meld_of("twin", "power"))
	M52.ON = true
	var wrong: Array = []
	for id in T["melds"]:
		var of: Array = T["of"][id]
		if Words.meld_of(of[0], of[1]) != id or Words.meld_of(of[1], of[0]) != id or Words.meld_problem(of[0], of[1]) != "":
			wrong.append(id)
	for id in T["ranks"]:
		var w: String = T["rankOf"][id]["word"]
		if Words.meld_of(w, w) != id or Words.meld_problem(w, w) != "":
			wrong.append(id)
	_line(wrong.is_empty(), "switched on, the bench makes all %d from their two runes and the %d level 2 runes from two of one%s" % [T["melds"].size(), T["ranks"].size(), "" if wrong.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(wrong))])
	var kept: bool = Words.meld_of("power", "fire") == "eruption" and Words.meld_of("leech", "poison") == "siphon" and Words.meld_of("power", "power") == "power2" and Words.meld_of("twin", "lightning") == "forking"
	_line(kept, "the 23 melds and the damage runes' Rank II as they were (Power + Flame: %s, Twin + Lightning: %s)" % [Words.meld_of("power", "fire"), Words.meld_of("twin", "lightning")])
	# --- STONES AND GEAR
	var L = M.loot
	var no_stone: Array = T["order"].filter(func(id): return not L.pics.has("word:" + id))
	_line(no_stone.is_empty(), "every one has its stone (%d of %d)" % [T["order"].size() - no_stone.size(), T["order"].size()])
	var it := {"slot": "mainhand", "ilvl": 10}
	var no_gear: Array = []
	for id in T["order"]:
		var opts: Array = L.imbue_options(id, it)
		if opts.is_empty() or (not M52.is_new_rank(id) and not opts.all(func(o): return o.has("also") or opts.size() > 0)):
			no_gear.append(id)
	var e: Array = L.imbue_options("onslaught", it)
	var crit_with: Array = e.map(func(o): return "%s+%s" % [o["stat"], o.get("also", "-")])
	_line(no_gear.is_empty(), "on a weapon, every one gives a property of each of its runes (Onslaught: %s)" % ", ".join(PackedStringArray(crit_with.slice(0, 4))))
	# --- AT WORK
	var ids: Array = T["order"]
	if only != "":
		var some := only.split(",")
		ids = ids.filter(func(i): return some.has(i))
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	var fine := 0
	var cases := 0
	var not_seen: Array = []
	for id in ids:
		for side in ["front", "behind"]:
			cases += 1
			h.m52.forget()
			h.m52.told = {}
			for m in M._w_pack:
				m.m52 = {}
				m.dead = false
				m._dead_for = 0.0
				m.modulate.a = 1.0
				m.shock_t = 0.0
				m.chill_t = 0.0
				m.frozen_t = 0.0
				m.freeze_immune = 0.0
				m.stun_t = 0.0
				m.burn_t = 0.0
				m.poison_t = 0.0
				m.mark_t = 0.0
				m.hex_t = 0.0
				m.still_t = 0.0
				m.bind_t = 0.0
				m.bind_again = 0.0
			var r: Dictionary = M._w_set(h, 0, side, [id])
			# (what its twist waits on, made so for the one Strike: a kill, a stunned one)
			h.haste_t = 0.0
			h.frenzy = 0
			h.frenzy_t = 0.0
			h.shield = 0.0
			h.shield_t = 0.0
			for m in M._w_pack:
				if KILL.has(id) or (side == "behind" and KILL_BEHIND.has(id) and BEHIND.has(id)) or M52.is_reap(id):
					m.life = 1.0
				if STUNNED.has(id):
					m.stun_t = 3.0
				if side == "front":
					_pre(id, m)
					if CITY_KILL.has(id) or CITY2_KILL.has(id):
						m.life = 1.0
			if CITY2_FRENZY.has(id) and side == "front":
				h.frenzy = int(Words.data()["frenzy"]["max"])
				h.frenzy_t = 6.0
			if HASTE.has(id):
				h.haste = 30.0
				h.haste_t = 6.0
			if CRITS.has(id) or (CITY2_CRITS.has(id) and side == "front"):
				h.stats["crit_chance"] = 100.0
			var wd: Dictionary = T["words"][id]
			var named: bool = str(r["name"]).contains(str(wd["front"]) if side == "front" else str(wd["behind"]).trim_prefix("of "))
			var lined: bool = (r["lines"] as Array).any(func(l): return str(l).contains(str(wd["frontText"] if side == "front" else wd["behindText"]).substr(0, 20)))
			await M._w_strike(h)
			await M._wait(1.6)
			var lost := 0
			for k in M._w_pack.size():
				lost += maxi(0, int(roundf(M._w_was[k] - M._w_pack[k].life)))
			h.stats["crit_chance"] = 0.0
			var want: String = (FRONT if side == "front" else BEHIND).get(id, "")
			if M52.is_city(id):
				want = CITY_FRONT.get(id, "") if side == "front" else _city_behind(id)
			if M52.is_city2(id):
				want = CITY2_FRONT.get(id, "") if side == "front" else id + ":leave"
			if M52.is_reap(id):
				want = id + (":soul" if side == "front" else ":rise")
			var seen: bool = want == "" or int(h.m52.told.get(want, 0)) > 0
			if not seen:
				not_seen.append("%s %s" % [id, side])
			var ok: bool = named and lined and lost > 0 and seen
			if ok:
				fine += 1
			else:
				print("MELDS52   %s %s: named %s ('%s'), its line %s, the pack lost %d, its twist %s (%s)" % [id, side, named, r["name"], lined, lost, seen, str(h.m52.told)])
	h.stats["life_regen"] = regen
	_line(fine == cases, "each one in front of the Strike and behind it, %d cases: its name, its line, the blow landing, its twist seen: %d%s" % [cases, fine, "" if not_seen.is_empty() else " (twist not seen: %s)" % ", ".join(PackedStringArray(not_seen))])
	M52.ON = was
	M52.CITY_ON = was_city
	M52.CITY2_ON = was_city2
	M52.REAP_ON = was_reap
	print("MELDS52: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


# --- THE FILMS (`--only=words --cases=m52film[:<id>,<id>]`, run with `--fixed-fps 30`): each meld in front of his Strike at the
# pack, then behind it, then carried by one of the pack that comes for him; each frame to <shots>/film/<id>/NNNN.jpg, made into
# <shots>/film/<id>.mp4 (ffmpeg) as each is done, its frames then let go.

var _dir := ""


## The film waiting `secs`; for a meld seen only as he moves (MOVES), him darting aside (`way` 1 one way, -1 back) as the blow
## finishes (a second at the least, so the dart is seen whole).
func _walk(k: int, secs: float, id: String, way: float) -> int:
	if not MOVES.has(id):
		return await _frames(k, secs)
	k = await _frames(k, 0.15)
	h.auto_dir = Vector2(way, 0.3 * way).normalized()
	k = await _frames(k, 0.75)
	h.auto_dir = Vector2.ZERO
	return await _frames(k, maxf(0.1, secs - 0.9))


func _frames(k: int, secs: float) -> int:
	var t := 0.0
	while t < secs - 0.001:
		# (no lesson's banner over the film)
		M.guide.use_t = 0.0
		await M.get_tree().process_frame
		await RenderingServer.frame_post_draw
		M.get_viewport().get_texture().get_image().save_jpg("%s/%04d.jpg" % [_dir, k], 0.92)
		k += 1
		t += M.get_process_delta_time()
	return k


## (the film: one of the pack not on his snare walks onto it, from a step beyond it, so it springs)
func _snare_walk(k: int) -> int:
	k = await _frames(k, 0.3)
	if h.wakes == null:
		return k
	for z in h.wakes.list:
		if str(z["kind"]) != "snare" or z.get("hostile", false):
			continue
		var at := Vector2(z["x"], z["y"])
		for m in M._w_pack:
			if m.dead or (z["on_it"] as Array).has(m.id) or m.world.distance_to(at) < 0.9:
				continue
			var away: Vector2 = (at - h.world).normalized() if at.distance_to(h.world) > 0.01 else Vector2(1, 0)
			m.world = at + away * 1.3
			m._place()
			k = await _frames(k, 0.15)
			h.melds._slide(m, at - m.world, 12)
			return await _frames(k, 0.6)
	return k


func _fresh() -> void:
	# (nothing of his last film's frenzy or shield left on him; nor its spirits and creatures, nor what they threw)
	h.last.spirits = []
	if h.last.reap != null:
		h.last.reap.fresh_place()
	h.frenzy = 0
	h.frenzy_t = 0.0
	h.shield = 0.0
	h.shield_t = 0.0
	h.m52.forget()
	# (nothing of the last film's monster still on its way: a shockwave warned, a shot in the air)
	M._monsters.perils.list.clear()
	M._monsters.perils._echoes.clear()
	for a in M._monsters._arrows:
		if is_instance_valid(a["node"]):
			a["node"].queue_free()
	M._monsters._arrows.clear()
	for m in M._w_pack:
		m.m52 = {}
		m.dead = false
		m._dead_for = 0.0
		m.modulate.a = 1.0
		m.visible = true
		m.shock_t = 0.0
		m.chill_t = 0.0
		m.frozen_t = 0.0
		m.freeze_immune = 0.0
		m.stun_t = 0.0
		m.burn_t = 0.0
		m.poison_t = 0.0
		m.mark_t = 0.0
		m.hex_t = 0.0
		m.still_t = 0.0
		m.bind_t = 0.0
		m.bind_again = 0.0
		m.words = []
		m.shield = 0.0
	# (the loot its kills dropped, cleared: a film shows the melds, not a helmet's label)
	if M.loot != null:
		for d in M.loot._drops.duplicate():
			if str(d["kind"]) == "gear":
				(d["node"] as Node).queue_free()
				M.loot._drops.erase(d)
	h.poison_t = 0.0
	h.burn_t = 0.0
	h.chill_t = 0.0
	h.held = 0.0
	h.hex_t = 0.0
	h.still_t = 0.0
	h.root_t = 0.0
	h.root_again = 0.0
	h.life = h.max_life


func film(only := "") -> void:
	var was: bool = M52.ON
	M52.ON = true
	var was_reap: bool = M52.REAP_ON
	M52.REAP_ON = true
	var T: Dictionary = M52.T()
	var root: String = M._arg("shots") + "/film"
	DirAccess.make_dir_recursive_absolute(root)
	h.unhurt = true
	# (no guide's prompts over the films)
	h.walked = 1000.0
	M.loot.taught = true
	for f in ["met", "quick", "slow", "evade", "flask"]:
		M.guide.set(f, true)
	var ids: Array = T["melds"]
	# (`city`: the city's 45)
	if only == "city":
		ids = T["city"].filter(func(w): return not M52.is_new_rank(w))
		only = ""
	# (`city2`: the city's runes with the floor 6–10 runes, 44)
	if only == "city2":
		ids = T["city2"]
		only = ""
	# (`reap`: Reaping with the damage runes, 5)
	if only == "reap":
		ids = T["reap"]
		only = ""
	# (`high`: the High City's runes melded, 110; `high:<from>-<to>`, a run of them by their order)
	var was_high: bool = M52.HIGH_ON
	M52.HIGH_ON = true
	if only.begins_with("high"):
		var hi: Array = T["high"].filter(func(w): return not M52.is_new_rank(w))
		var span := only.trim_prefix("high").trim_prefix(":")
		if span.contains("-"):
			hi = hi.slice(int(span.get_slice("-", 0)), int(span.get_slice("-", 1)))
		ids = hi
		only = ""
	# (any words named: the game's own melds too, filmed the same way to set beside these)
	if only != "":
		ids = Array(only.split(","))
	for id in ids:
		_dir = root + "/" + id
		DirAccess.make_dir_recursive_absolute(_dir)
		# (nothing of the film before left over: its warnings, its effects)
		M._monsters.perils.clear()
		M.fx.clear()
		var k := 0
		h.m52.told = {}
		for side in ["front", "behind"]:
			_fresh()
			# (Hourglass behind works on the ground the blow leaves: Guarding beside it, for the film, leaves a ward)
			# (Purge in front waits on one blow culling three: the Whirl's, as its check makes it)
			var whirl: bool = id == "purge" and side == "front"
			M._w_set(h, 1 if whirl else 0, side, [id, "guarding"] if id == "hourglass" and side == "behind" else [id])
			for m in M._w_pack:
				if (KILL.has(id) and side == "front") or (KILL_BEHIND.has(id) and side == "behind"):
					# (a monster's life, not the test pack's million: what bursts for a share of it bursts as in a fight)
					m.max_life = FOE_LIFE
					m.life = 1.0
				if STUNNED.has(id) and side == "front":
					m.stun_t = 3.0
				# (REAPING WITH A DAMAGE RUNE: the first it strikes falls, burning, frozen or poisoned for the twist in front; behind,
				# the rest stand for its creature to fight)
				if M52.is_reap(id) and (m == M._w_pack[0] or side == "front" and M._w_pack.find(m) < 3):
					m.max_life = FOE_LIFE
					m.life = 1.0
					if side == "front":
						match id:
							"cinderbrood":
								m.set_alight(20.0, 4.0)
							"wintergrave":
								m.frozen_t = 2.0
							"bogborn":
								m.dose(20.0)
				if side == "front":
					_pre(id, m)
					if CITY_KILL.has(id) or CITY2_KILL.has(id):
						m.max_life = FOE_LIFE
						m.life = 1.0
			# (what a twist waits on, made so for the film: one alone, certain criticals, a frenzy built up)
			if SOLO.has(id) and side == "front":
				for j in range(1, M._w_pack.size()):
					M._w_pack[j].world += Vector2(6.0, 6.0)
			h.stats["crit_chance"] = 100.0 if CRITS.has(id) or (CITY2_CRITS.has(id) and side == "front") else 0.0
			if CITY2_FRENZY.has(id) and side == "front":
				h.frenzy = int(preload("res://scripts/words.gd").data()["frenzy"]["max"])
				h.frenzy_t = 6.0
			if FRENZY.has(id):
				h.frenzy = int(preload("res://scripts/words.gd").data()["frenzy"]["max"]) - 1
				h.frenzy_t = 1.2 if id == "fury" else 5.0
			if HASTE.has(id):
				h.haste = 30.0
				h.haste_t = 6.0
			if LOW.has(id):
				h.life = h.max_life * 0.4
			if id == "icebreaker" and side == "front":
				for m in M._w_pack:
					m.frozen_t = 2.0
			if TOUGH.has(id):
				for m in M._w_pack:
					m.max_life = 2500.0
					m.life = 320.0
			# (THE HIGH CITY'S RUNES MELDED: the pack stood and what each one's own twist waits on made so, as its check makes it:
			# check_high.gd setup: a kill, one nearly dead, a third use, his frenzy, a mark, burning, poison, a curse...)
			var CH = preload("res://scripts/check_high.gd").new(M, h) if M52.is_high(id) else null
			if CH != null:
				CH.setup(id, side)
			k = await _frames(k, 0.25)
			if whirl:
				M._w_whirl_begin(h)
				k = await _frames(k, 1.6)
				h.auto_whirl = false
			else:
				M._w_strike(h)
				k = await _walk(k, 0.6, id, 1.0)
			# (what its new moment waits on after the first blow, as its check makes it: a blow on him, one dying in its circle)
			if CH != null:
				await CH._after(id, side)
			if not whirl:
				M._w_strike(h)
			if M52.is_high(id) and (M52.T()["of"][id] as Array).has("surging") and side == "behind":
				if id == "heartbeat":
					h.last.high.orb(h.world + Vector2(1.6, 0.4))
					k = await _frames(k, 0.2)
				if id == "soulstorm" and not M._w_pack[1].dead:
					M._w_pack[1].life = 1.0
				h.last.dodge_surge(h.world)
				k = await _frames(k, 0.3)
				h.last.high.surge.landed(h.world)
			# (a spirit's end is its own moment for these: brought on, for the film)
			if M52.is_high(id) and side == "behind" and id in ["undying", "soulburst"]:
				k = await _frames(k, 0.8)
				for sp in h.last.spirits:
					sp["t"] = maxf(float(sp["t"]), float(sp["life"]) - 0.2)
			var rest := (1.4 if side == "front" else 2.2) + float(LONGER.get(id + ":" + side, 0.0)) + (2.2 if M52.is_reap(id) and side == "behind" else 0.0)
			# (THE CITY'S MELDS behind: a vortex's end is its own moment; a snare springs on one walked onto it)
			if side == "behind" and (M52.is_city(id) or M52.is_city2(id)) and not M52.is_new_rank(id):
				var of: Array = M52.T()["of"][id]
				if of.has("pulling"):
					rest += 1.8
				if of.has("binding"):
					k = await _snare_walk(k)
			# (so the film sees his shell go and his frenzy fade, which in a fight take their full time: cut short once the blow has landed)
			if side == "front" and id in ["redoubt", "fury"]:
				k = await _frames(k, 0.4)
				rest -= 0.4
				if id == "redoubt":
					h.shield_t = minf(h.shield_t, 0.3)
				else:
					h.frenzy_t = minf(h.frenzy_t, 0.3)
			k = await _walk(k, rest, id, -1.0)
		# (carried by one of the pack, which comes for him: its two runes and the meld, as an altar lays them)
		_fresh()
		# (a Guarding meld: his shield up as the monster comes, to show what it does to what strikes it)
		M._w_put(h, 0, "front", [id] if SHIELD.has(id) else [])
		M._w_reset(h)
		if SHIELD.has(id):
			M._w_strike(h)
		var m = M._w_pack[0]
		m.words = FoeWordsOf.call(id)
		# (a Guarding carrier starts back out of his opening blow's reach, so its own shell is seen as it comes)
		m.world = h.world + h.face * (2.4 if SHIELD.has(id) else 1.2)
		# (Duelist's waits on it coming for him alone: the rest of the pack drawn off)
		if SOLO.has(id):
			for j in range(1, M._w_pack.size()):
				M._w_pack[j].world = h.world + Vector2(7.0, 7.0)
		# (a carrier as the game lays one: a monster's life, not the test pack's million, and Guarding's shield, a fifth of it)
		m.max_life = FOE_LIFE
		m.life = FOE_LIFE * float(FOE_LOW.get(id, 1.0))
		m.shield = roundf(FOE_LIFE * 0.2) if m.words.has("guarding") else 0.0
		# (THE HIGH CITY'S: as its check sets it up: a kin near it, risen already where its twist is a risen one's, him as it needs)
		var CHF = preload("res://scripts/check_high.gd") if M52.is_high(id) else null
		if CHF != null:
			CHF.new(M, h).foe_setup(id, m)
		# (what its twist waits on, made so for the film: him poisoned or shocked, its criticals certain)
		var tune: Dictionary = M52.T()["tune"]
		var kept := {}
		for w in FOE_TUNE.get(id, {}):
			kept[w] = tune[id].get(w, null)
			tune[id][w] = FOE_TUNE[id][w]
		if id in ["hornet", "mire", "reverb", "hourglass"]:
			h.poison_t = 6.0
			h.poison_dps = 2.0
		if id == "quicksilver":
			h.shock_t = 6.0
		m.state = "chase"
		m._t = 0.0
		m._cd = 0.0
		m.speed = 1.2
		k = await _frames(k, 2.6)
		# (a Piercing carrier's shot, flying through walls at him)
		if CHF != null and (M52.T()["of"][id] as Array).has("piercing") and not m.dead:
			M._monsters.shoot(m, (h.world - m.world).normalized(), 7.0, 6.0, 15.0)
			k = await _frames(k, 0.8)
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9
		# (he strikes back: its shield struck and broken, it hurt and brought low, or killed, for what each waits on)
		if FOE_DIES.has(id) or M52.is_reap(id) or (CHF != null and CHF.foe_dies(id)) or ((M52.is_city(id) or M52.is_city2(id)) and not M52.is_new_rank(id) and (M52.T()["of"][id] as Array).has("splitting")) or id in ["hexblast", "slowfuse", "tripwire"]:
			m.life = 1.0
		M._w_strike(h)
		k = await _frames(k, 0.6)
		if not m.dead:
			M._w_strike(h)
		k = await _frames(k, float(FOE_TAIL.get(id, 4.0 if M52.is_reap(id) or (CHF != null and CHF.foe_dies(id)) else 1.4)))
		for w in kept:
			if kept[w] == null:
				tune[id].erase(w)
			else:
				tune[id][w] = kept[w]
		h.poison_t = 0.0
		h.shock_t = 0.0
		if CHF != null:
			for f in ["bleed_t", "burn_t", "chill_t", "hex_t", "still_t", "root_t"]:
				h.set(f, 0.0)
			h.life = h.max_life
		var out: Array = []
		# (the High City's 110 smaller, so that all of them go on one page)
		var crf := "31" if M52.is_high(id) else "26"
		var code := OS.execute("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "30", "-i", _dir + "/%04d.jpg", "-vf", "crop=400:280:290:130,scale=800:560:flags=neighbor", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", crf, "-movflags", "+faststart", root + "/" + id + ".mp4"], out, true)
		OS.execute("ffmpeg", ["-y", "-loglevel", "error", "-ss", "0.9", "-i", root + "/" + id + ".mp4", "-frames:v", "1", root + "/" + id + ".jpg"], out, true)
		for f in DirAccess.get_files_at(_dir):
			DirAccess.remove_absolute(_dir + "/" + f)
		DirAccess.remove_absolute(_dir)
		print("MELDS52 FILM %s: %d frames, ffmpeg %d" % [id, k, code])
		print("MELDS52 TOLD %s: %s" % [id, ", ".join(PackedStringArray(h.m52.told.keys()))])
		var want: Array = preload("res://scripts/check_high.gd").EXPECT.get(id, {}).get("foe", [])
		print("MELDS52 FOE %s: %s" % [id, "shown" if h.m52.told.keys().any(func(t): return str(t).ends_with(":foe") or str(t).ends_with(":foeSplit") or (M52.is_reap(id) and str(t).ends_with(":rise")) or want.any(func(w): return str(t) == id + ":" + w)) else "NOT SHOWN"])
	M52.ON = was
	M52.REAP_ON = was_reap
	M52.HIGH_ON = was_high


## The words one carrying meld `id` has on it, as an altar lays them (foe_words.gd foe_words_of).
var FoeWordsOf := func(id: String) -> Array: return preload("res://scripts/foe_words.gd").foe_words_of([id])
