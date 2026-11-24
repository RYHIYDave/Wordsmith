## ALL MELDS: THE LEAST EXCITING REDONE (meldsredo_rules.gd, foe_meldsredo.gd; behind melds52.gd REDO_ON), checked as the High
## City's are (check_high.gd), his words standing: “I'm just one guy and i can't check 300+ runes and 900 animations.  I need you to
## police yourself on this.” `--only=words --cases=redo --shots=<dir>` (or `redo:<id>,<id>`; the round's own, `redo:round=1`), on
## floor 2's pack the words check gathers (main.gd _words_shots), the switch on for the check. Off, none of the new moments is told;
## on, EACH REDONE ON ITS OWN in front of the Strike, behind it, and carried by a monster, what its new moment waits on made so
## (`setup`, `_after`, `foe_setup`), and that moment seen (EXPECT: the telling only it sends).
extends RefCounted

const Words := preload("res://scripts/words.gd")
const M52 := preload("res://scripts/melds52.gd")

## (each redone one's new moment, as told, in front, behind and on a monster)
const EXPECT := {
	"ambush": {"front": ["reel"], "behind": ["snap"], "foe": ["lunge"]},
	"berserk": {"front": ["quake"], "behind": ["roar"], "foe": ["swell"]},
	"blight": {"front": ["wither"], "behind": ["puff"], "foe": ["boil"]},
	"bulwark": {"front": ["shove"], "behind": ["bash"], "foe": ["charge"]},
	"canker": {"front": ["sore"], "behind": ["rot"], "foe": ["sore"]},
	"delirium": {"front": ["flail"], "behind": ["shriek"], "foe": ["rave"]},
	"doom": {"front": ["hammer"], "behind": ["crush"], "foe": ["shadow"]},
	"duelist": {"front": ["challenge"], "behind": ["out"], "foe": ["salute"]},
	"eternity": {"front": ["stop"], "behind": ["stop"], "foe": ["stop"]},
	"evileye": {"front": ["open"], "behind": ["burst"], "foe": ["gaze"]},
	"fervor": {"front": ["flare"], "behind": ["sparks"], "foe": ["fed"]},
	"fever": {"front": ["haze"], "behind": ["pulse"], "foe": ["sweat"]},
	"fury": {"front": ["aura"], "behind": ["ember"], "foe": ["roar"]},
	"glide": {"front": ["skate"], "behind": ["aside"], "foe": ["strip"]},
	"grudge": {"front": ["seal"], "behind": ["chain"], "foe": ["mark"]},
	"haymaker": {"front": ["fly"], "behind": ["crack"], "foe": ["down"]},
	"hourglass": {"front": ["fall"], "behind": ["flare"], "foe": ["hang"]},
	"lamprey": {"front": ["latch"], "behind": ["drip"], "foe": ["latch"]},
	"lancet": {"front": ["lance"], "behind": ["drive"], "foe": ["cut"]},
	"manacle": {"front": ["chain"], "behind": ["snap"], "foe": ["chain"]},
	# --- ROUND 2
	"mauler": {"front": ["fling"], "behind": ["whip"], "foe": ["maul"]},
	"momentum": {"front": ["roll"], "behind": ["drum"], "foe": ["barrel"]},
	"needle": {"front": ["mist"], "behind": ["needles"], "foe": ["needle"]},
	"onrush": {"front": ["rush"], "behind": ["bowl"], "foe": ["rush"]},
	"pin": {"front": ["spike"], "behind": ["spike"], "foe": ["spike"]},
	"quickdraw": {"front": ["draw"], "behind": ["glance"], "foe": ["gleam"]},
	"quickening": {"front": ["ripple"], "behind": ["pulse"], "foe": ["image"]},
	"rapier": {"front": ["thrust"], "behind": ["flourish"], "foe": ["lunge"]},
	"reverb": {"front": ["echo"], "behind": ["ring"], "foe": ["echo"]},
	"riposte": {"front": ["answer"], "behind": ["blade"], "foe": ["counter"]},
	"siphon": {"front": ["thread"], "behind": ["motes"], "foe": ["thread"]},
	"stillpoint": {"front": ["shards"], "behind": ["hush"], "foe": ["stop"]},
	"sunder": {"front": ["plates"], "behind": ["crack"], "foe": ["plates"]},
	"tailwind": {"front": ["gust"], "behind": ["trail"], "foe": ["grit"]},
	"tempo": {"front": ["beat"], "behind": ["beat"], "foe": ["beat"]},
	"timeslip": {"front": ["slip"], "behind": ["image"], "foe": ["slip"]},
	"transfusion": {"front": ["orb"], "behind": ["pulse"], "foe": ["thread"]},
	"vendetta": {"front": ["sigil"], "behind": ["slashes"], "foe": ["sigil"]},
	"windward": {"front": ["whirl"], "behind": ["gust"], "foe": ["gust"]},
	"amber": {"front": ["seal"], "behind": ["seal"], "foe": ["amber"]},
}
## (those whose front waits on a third blow: on what it curses, a count of blows)
const THIRD := ["doom", "grudge", "tempo", "transfusion"]
## (those whose behind waits on a third blow on the same one)
const THIRD_B := ["vendetta"]
## (those whose behind waits on a death in what it left: one brought low once it is laid)
const DIE_IN := ["canker", "delirium", "doom", "quickening"]
## (his first move struck at it first, on a monster: what it does when he does)
const STRUCK_FIRST := ["grudge", "riposte"]

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
	print("REDO %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


static func of(id: String) -> Array:
	var D: Dictionary = Words.data()["melds"]["of"]
	return D.get(id, M52.T()["of"].get(id, []))


func _fresh() -> void:
	h.m52.forget()
	h.m52.told = {}
	h.last.spirits = []
	h.last.zones = []
	h.last.reap.fresh_place()
	h.last.high.fresh_place()
	h.m52.rd.fresh()
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
		m.modulate = Color(1, 1, 1, 1)
		m.visible = true
		m.risen = false
		m.shield = 0.0
		for f in ["shock_t", "chill_t", "frozen_t", "freeze_immune", "stun_t", "burn_t", "poison_t", "bleed_t", "hex_t", "still_t", "bind_t", "bind_again", "mark_t"]:
			m.set(f, 0.0)
		m.thrown = {}
		m.words = []
	M._w_reset(h)
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
	var was: bool = M52.REDO_ON
	var T: Dictionary = M52.T()
	var rounds: Array = T.get("redoRounds", [])
	var all: Array = []
	for r in rounds:
		all.append_array(r)
	# --- THE SWITCH: off, none of the new moments; on, the table has every redone one's three texts
	M52.REDO_ON = false
	var off_none: bool = all.all(func(id): return not M52.is_redo(id))
	_line(off_none, "switched off, none of the %d counts as redone" % all.size())
	M52.REDO_ON = true
	var texts: Array = all.filter(func(id): return (T["redo"][id] as Dictionary).size() != 3 or not Words.data()["words"].has(id))
	_line(texts.is_empty() and all.size() == rounds.size() * 20, "switched on, %d redone in %d rounds of 20, each its three new texts%s" % [all.size(), rounds.size(), "" if texts.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(texts))])
	# --- AT WORK: each on its own
	var ids: Array = all
	if only.begins_with("round="):
		var k := int(only.trim_prefix("round=")) - 1
		ids = rounds[k] if k >= 0 and k < rounds.size() else []
	elif only != "":
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
				seen = await _foe(id, shot < 6)
			else:
				seen = await _case(id, side, shot < 12)
			if seen != "":
				res[side][0] += 1
			else:
				res[side][1].append(id)
			row.append(seen.trim_prefix(id + ":") if seen != "" else "MISSING")
			shot += 1
		print("REDO . %s: %s" % [id, " / ".join(PackedStringArray(row))])
	h.stats["life_regen"] = regen
	for side in ["front", "behind", "foe"]:
		var miss: Array = res[side][1]
		_line(miss.is_empty(), "each %s, its new moment seen: %d of %d%s" % ["in front of the Strike" if side == "front" else ("behind it" if side == "behind" else "carried by a monster"), res[side][0], ids.size(), "" if miss.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(miss))])
	M52.REDO_ON = was
	_fresh()
	print("REDO: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## The pack stood for meld `id`, and what its new moment waits on made so; `side` front or behind. Also used by the films.
func setup(id: String, side: String) -> void:
	var pack: Array = M._w_pack
	var face: Vector2 = M._w_face
	var across := Vector2(-face.y, face.x)
	var home: Vector2 = M._w_home
	var spots := [[1.2, 0.0], [1.3, 1.0], [2.2, 0.05], [3.1, -0.1], [3.0, 1.7], [2.0, -1.6]]
	for k in pack.size():
		var p: Array = spots[k] if k < spots.size() else [8.0, 0.0]
		pack[k].world = home + face * float(p[0]) + across * float(p[1])
		pack[k].max_life = 2000.0
		pack[k].life = 2000.0
	var fullf := func() -> void:
		h.frenzy = int(Words.data()["frenzy"]["max"])
		h.frenzy_t = 9.0
	match id:
		"berserk", "delirium", "fever", "fury", "mauler", "quickening":
			if side == "front":
				fullf.call()
		"tempo":
			if side == "behind":
				fullf.call()
	if id in ["needle", "pin", "rapier", "stillpoint", "vendetta"] or id == "quickdraw" and side == "behind":
		h.stats["crit_chance"] = 100.0
	if id == "momentum" and side == "front":
		h.m52.momentum = int(M52.tune("momentum").get("most", 5))
		h.m52.momentum_at = h.m52.time
	if id == "momentum" and side == "behind":
		h.might = h.m52.might_most(0)
	if id in ["onrush", "tailwind"]:
		h.haste = 30.0
		h.haste_t = 6.0
	if id == "onrush" and side == "behind":
		pack[1].world = home + across * 0.7
	if id == "tailwind":
		# (one behind him, for the wind at his back)
		pack[3].world = home - face * 1.0
	if id == "windward" and side == "front":
		pack[1].world = home + across * 0.9
	if id == "sunder":
		# (its twist waits on one stunned)
		for m in pack:
			m.stun_t = 3.0
	if id in ["siphon"]:
		for m in pack:
			m.poison_t = 5.0
			m.poison_dps = 4.0
			m.poison_n = 2
	if id in ["rapier", "siphon", "transfusion"] and side == "behind":
		pack[0].life = 1.0
	if id in ["delirium", "doom", "evileye", "grudge"]:
		for m in pack:
			m.hex_t = 6.0
			m.hex_more = 0.2
	if id in ["blight", "canker", "fever", "hourglass"]:
		for m in pack:
			m.poison_t = 5.0
			m.poison_dps = 4.0
			m.poison_n = 2
	if id == "hourglass":
		for m in pack:
			m.burn_t = 5.0
			m.burn_dps = 4.0
	if id in ["evileye", "lancet"] or id == "ambush" and side == "behind":
		h.stats["crit_chance"] = 100.0
	if id in ["blight", "fervor", "fever"] and side == "front" or id in ["fervor", "fever", "fury", "berserk"] and side == "behind":
		pack[0].life = 1.0
	if id == "duelist" and side == "front":
		# (one alone: the rest drawn off)
		for k in range(1, pack.size()):
			pack[k].world = home + Vector2(7.0, 7.0) + across * k
	if id == "glide" and side == "behind":
		pack[1].world = home + across * 0.7
	if id == "haymaker" and side == "behind":
		h.might = h.m52.might_most(0)
	if id == "haymaker" and side == "front":
		# (one behind what it hits, to be thrown into)
		pack[2].world = home + face * 3.0


## What its new moment waits on, after the first Strike.
func _after(id: String, side: String) -> void:
	var pack: Array = M._w_pack
	if side == "behind" and id in DIE_IN:
		# (once its ground is laid, those in it brought low: the next Strike's kills die in it)
		for m in pack:
			if not m.dead:
				m.life = 1.0
	if id == "grudge" and side == "behind":
		# (those in its circle walk out of it)
		await M._wait(0.2)
		for m in pack:
			if not m.dead:
				m.world += M._w_face * 2.4
	if id == "haymaker" and side == "behind":
		h.might = h.m52.might_most(0)
	if id == "momentum" and side == "behind":
		h.might = h.m52.might_most(0)
	if id == "riposte":
		# (his shield up, and a blow on him)
		h.shield = maxf(h.shield, 50.0)
		var src = pack[1] if not pack[1].dead else pack[2]
		h.blow_by = src
		h.hurt_by(10.0, "phys", [], {}, src, src.world)
		h.blow_by = null


## One meld on one side of the Strike: its setup, the Strike (twice, thrice for those that wait on a third), what it waits on, and
## its new moment watched for.
func _case(id: String, side: String, snap: bool) -> String:
	_fresh()
	var r: Dictionary = M._w_set(h, 0, side, [id])
	setup(id, side)
	await M._w_strike(h)
	await _after(id, side)
	await M._wait(0.35)
	await M._w_strike(h)
	if side == "front" and id in THIRD or side == "behind" and id in THIRD_B:
		await M._wait(0.35)
		await M._w_strike(h)
	var t := 0.0
	var seen := ""
	var most: float = 4.5 if id == "eternity" else 3.4
	while t < most and seen == "":
		await M._wait(0.1)
		t += 0.1
		h.world = M._w_home
		_nudge()
		seen = _own(id, side)
	if snap and dir != "":
		await M._snap("%s/redo_%s_%s.png" % [dir, id, side])
	if seen == "":
		print("REDO   %s %s: named '%s', told %s" % [id, side, r.get("name", ""), str(h.m52.told.keys())])
	return seen


func _nudge() -> void:
	var t: float = Time.get_ticks_msec() / 1000.0
	for k in M._w_pack.size():
		var m = M._w_pack[k]
		if not m.dead and m.bind_t <= 0.0 and m.stun_t <= 0.0:
			var a: float = t * 3.0 + k
			m.world += Vector2(-sin(a), cos(a)) * 0.09


func _own(id: String, side := "") -> String:
	var want: Array = EXPECT.get(id, {}).get(side, [])
	for k in h.m52.told.keys():
		var s := str(k)
		if s.begins_with(id + ":") and want.has(s.trim_prefix(id + ":")):
			return s
	return ""


## A monster carrying `id` set up as its new moment on him waits on (also used by the films): a kin near it, him poisoned or
## burning or cursed as it needs, it hurt, or alone with him.
func foe_setup(id: String, m) -> void:
	var face: Vector2 = M._w_face
	if M._w_pack.size() > 1:
		var kin = M._w_pack[1]
		kin.world = m.world + Vector2(-face.y, face.x) * 1.0
		kin.max_life = 600.0
		kin.life = 300.0
	if id in ["ambush", "bulwark", "delirium", "duelist", "fury", "onrush", "quickdraw", "timeslip", "rapier", "tailwind"]:
		m.world = h.world + face * 2.6
	if id == "quickening":
		m.life = m.max_life * 0.5
	if id == "rapier":
		m.life = m.max_life * 0.4
	if id in ["riposte", "windward"]:
		m.shield = 50.0
	if id == "siphon":
		h.poison_t = 4.0
		h.poison_dps = 2.0
	if id == "duelist":
		for k in range(1, M._w_pack.size()):
			M._w_pack[k].world = h.world + Vector2(8.0, 8.0) + Vector2(k, 0)
	if id in ["berserk", "fury"]:
		m.life = m.max_life * 0.4
	if id == "fever":
		m.life = m.max_life * 0.5
	if id == "bulwark":
		m.shield = 50.0
	if id == "delirium":
		h.hex_t = 5.0
		h.hex_more = 0.15
	if id in ["blight", "hourglass"]:
		h.poison_t = 4.0
		h.poison_dps = 2.0
	if id == "hourglass":
		h.burn_t = 4.0
		h.burn_dps = 2.0


## One carried by a monster: its blows on him (three), its turns, a kin dying near it, and its new moment watched for.
func _foe(id: String, snap: bool) -> String:
	_fresh()
	M._w_put(h, 0, "front", [])
	var o: Array = of(id)
	var m = M._w_pack[0]
	m.words = [id] + o
	m.max_life = 600.0
	m.life = 600.0
	m.world = h.world + M._w_face * 1.2
	foe_setup(id, m)
	if id in STRUCK_FIRST:
		# (he strikes it first: it remembers; its shield answers)
		if id == "riposte":
			m.world = h.world + M._w_face * 1.2
		await M._w_strike(h)
		await M._wait(0.2)
	var by: Dictionary = m.blow()
	for _j in 3:
		await M._wait(0.25)
		if m.dead:
			break
		h.blow_by = m
		h.hurt_by(20.0, str(by.get("el", "phys")), m.words, {}, m, m.world)
		h.blow_by = null
	if id == "fervor" and M._w_pack.size() > 1:
		var kin = M._w_pack[1]
		kin.damage(kin.life + kin.shield + 10.0, "phys", false, false, [], false, false, -1)
	var t := 0.0
	var seen := ""
	var want: Array = EXPECT.get(id, {}).get("foe", [])
	while t < 3.0 and seen == "":
		await M._wait(0.1)
		t += 0.1
		for kk in h.m52.told.keys():
			if str(kk).begins_with(id + ":") and want.has(str(kk).trim_prefix(id + ":")):
				seen = str(kk)
	if snap and dir != "":
		await M._snap("%s/redo_%s_foe.png" % [dir, id])
	if seen == "":
		print("REDO   %s foe: told %s" % [id, str(h.m52.told.keys())])
	h.life = h.max_life
	return seen
