## THE HIGH CITY'S RUNES MELDED (meldshigh_rules.gd; behind melds52.gd HIGH_ON): `--only=words --cases=high --shots=<dir>` (or
## `--cases=high:<id>,<id>`), on floor 2's pack the words check gathers (main.gd _words_shots), the switch on for the check. Off, the
## bench makes none of them; on, each from its two runes, and each level 2 from two of one; each its stone and its gear. Then each of
## the 110 in front of the Strike and behind it, what its High City rune's act waits on made so (a kill, one brought low, a third use,
## a dodge): its name on the move, the blow landing, and its twist seen: the act carrying the other rune (its telling, "id:carry",
## or "id:self" where it gives him something). Each level 2 rune: its rune half as strong again on the move.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const M52 := preload("res://scripts/melds52.gd")

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
	h.last.reap.fresh_place()
	h.might = 0.0
	h.frenzy = 0
	h.shield = 0.0
	h.barrier = 0.0
	for m in M._w_pack:
		m.m52 = {}
		m.dead = false
		m._dead_for = 0.0
		m.modulate.a = 1.0
		m.visible = true
		m.risen = false
		for f in ["shock_t", "chill_t", "frozen_t", "freeze_immune", "stun_t", "burn_t", "poison_t", "bleed_t", "hex_t", "still_t", "bind_t"]:
			m.set(f, 0.0)
		m.words = []
	M._w_reset(h)


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
	# --- LEVEL 2: its rune half as strong again on the move
	var FIELDS := {"piercing2": ["through", "lance"], "bleeding2": ["bleed", "thorns"], "reaping2": ["reap", "spirit"], "culling2": ["cull", "cull_mark"], "surging2": ["surge", "dodge_surge"]}
	var lv: Array = []
	for id in ranks:
		var w: String = T["rankOf"][id]["word"]
		var f: Array = FIELDS[id]
		var a: Dictionary = M._w_set(h, 0, "front", [w])
		var a0: float = float(a[f[0]])
		var b: Dictionary = M._w_set(h, 0, "front", [id])
		var b0: float = float(b[f[0]])
		var c: Dictionary = M._w_set(h, 0, "behind", [w])
		var c1: float = float(c[f[1]])
		var d: Dictionary = M._w_set(h, 0, "behind", [id])
		var d1: float = float(d[f[1]])
		if b0 <= a0 * 1.2 or d1 <= c1 * 1.2:
			lv.append("%s (%.2f/%.2f, %.2f/%.2f)" % [id, a0, b0, c1, d1])
	_line(lv.is_empty(), "each level 2 rune its rune half as strong again, in front and behind%s" % ("" if lv.is_empty() else ": " + ", ".join(PackedStringArray(lv))))
	# --- AT WORK
	var ids: Array = melds
	if only != "":
		var some := only.split(",")
		ids = ids.filter(func(i): return some.has(i))
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	var fine := 0
	var cases := 0
	var missed: Array = []
	var shot := 0
	for id in ids:
		for side in ["front", "behind"]:
			cases += 1
			var ok := await _case(id, side, shot < 6)
			if ok:
				fine += 1
			else:
				missed.append("%s %s" % [id, side])
			shot += 1
	h.stats["life_regen"] = regen
	_line(fine == cases, "each in front of the Strike and behind it, %d cases: its act carried the other rune in %d%s" % [cases, fine, "" if missed.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(missed))])
	M52.HIGH_ON = was
	_fresh()
	print("HIGH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## One meld on one side of the Strike: what its High City act waits on made so, then the Strike (and what follows) watched for its
## carrying.
func _case(id: String, side: String, snap: bool) -> bool:
	_fresh()
	var of: Array = M52.T()["of"][id]
	var r: Dictionary = M._w_set(h, 0, side, [id])
	var hcs: Array = of.filter(func(w): return w in ["piercing", "bleeding", "reaping", "culling", "surging"])
	var pack: Array = M._w_pack
	for m in pack:
		m.max_life = 600.0
		m.life = 600.0
	# (what each act waits on)
	if hcs.has("reaping"):
		pack[0].life = 1.0
	if hcs.has("culling"):
		# (in front: left just over one Strike's worth, so that the Strike leaves it low and alive, and the cull takes it; behind:
		# low already, for the mark to take)
		var hit: float = float(M._w_hit(h, 0))
		for m in pack:
			if side == "front":
				m.max_life = 4000.0
				m.life = hit * 1.05 + m.max_life * 0.06
			else:
				# (enough to live through the Strike and what it leaves behind, Twin's echo, Volatile's runes, and be low still)
				m.max_life = 4000.0
				m.life = hit * 2.2 + m.max_life * 0.1
	if hcs.has("surging") and side == "front":
		h.uses[0] = 2
	await M._w_strike(h)
	if hcs.has("surging") and side == "behind":
		h.last.dodge_surge(h.world)
	var t := 0.0
	var seen := false
	while t < 2.6 and not seen:
		await M._wait(0.1)
		t += 0.1
		h.world = M._w_home
		var told: Dictionary = h.m52.told
		seen = int(told.get(id + ":carry", 0)) + int(told.get(id + ":self", 0)) + int(told.get(id + ":burst", 0)) > 0
	if snap and dir != "":
		await M._snap("%s/high_%s_%s.png" % [dir, id, side])
	if not seen:
		print("HIGH   %s %s: named '%s', told %s" % [id, side, r["name"], str(h.m52.told)])
	return seen
