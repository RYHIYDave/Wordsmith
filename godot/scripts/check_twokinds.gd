## CHECKS: TWO KINDS IN ONE HIT (words.gd BOTH_KINDS, his find of 24 Nov 2026: a meld of two damage words made the whole attack one
## kind, while burned into gear it added both), `--only=twokinds`: Scald, Wildfire and Hailstorm in front of the Strike deal both
## their kinds, half of each, each half with what his gear adds to its own kind (flat and %); a meld of one kind, and Flame alone,
## as before; the attacks page's hit, and a hit landed on a monster.
extends RefCounted

const Words := preload("res://scripts/words.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("TWOKINDS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


## His numbers set as a check wants them: a weapon of 100 to 100, no other bonus but those given.
func _stats(more: Dictionary) -> void:
	for k in ["dmg_pct", "phys_pct", "fire_pct", "frost_pct", "light_pct", "fire_min", "fire_max", "frost_min", "frost_max", "light_min", "light_max"]:
		h.stats[k] = 0.0
	h.stats["dmg_min"] = 100.0
	h.stats["dmg_max"] = 100.0
	for k in more:
		h.stats[k] = float(more[k])
	h.might = 0.0


func _strike(words: Array) -> Dictionary:
	M._w_put(h, 0, "front", words)
	return h.loadout.r(0)


func run(main, hero, _dir: String) -> void:
	M = main
	h = hero
	var was: bool = Words.BOTH_KINDS
	Words.BOTH_KINDS = true
	# (the kinds each word's hit is of)
	var kinds := {}
	for w in ["scald", "wildfire", "hailstorm", "eruption", "fire"]:
		var r := _strike([w])
		kinds[w] = [r["element"], r.get("element2", "")]
	_line(kinds["scald"] == ["fire", "frost"] and kinds["wildfire"] == ["fire", "lightning"] and kinds["hailstorm"] == ["frost", "lightning"]
		and kinds["eruption"] == ["fire", ""] and kinds["fire"] == ["fire", ""],
		"the kinds of the hit: %s" % [kinds])
	# (Wildfire: +40% fire, +20% lightning, 10 flat fire, 30 flat lightning; the weapon 100: fire half (50 + 10) x 1.4 = 84,
	# lightning half (50 + 30) x 1.2 = 96, 180 in all, before the move's share)
	_stats({"fire_pct": 40, "light_pct": 20, "fire_min": 10, "fire_max": 10, "light_min": 30, "light_max": 30})
	var r := _strike(["wildfire"])
	var k: float = h.kinds_hit(r, 0.5)
	_line(absf(k - 180.0) < 0.01, "Wildfire, its two halves each with its own kind's gear: %.2f (expected 180)" % k)
	var was_r: Array = M._inv.hit_range(0)
	var want: int = maxi(1, roundi(180.0 * float(r["dmg_mult"])))
	_line(was_r == [want, want], "the attacks page's hit, Wildfire: %s (expected %d to %d)" % [was_r, want, want])
	_line(absf(h.avg_hit(0, 1.0) - 180.0 * float(r["dmg_mult"])) < 0.01, "its average hit (what its ground is sized by): %.2f" % h.avg_hit(0, 1.0))
	# (the lightning half's gear counts: taken away, the hit is less)
	_stats({"fire_pct": 40, "fire_min": 10, "fire_max": 10})
	var k2: float = h.kinds_hit(r, 0.5)
	_line(absf(k2 - (84.0 + 50.0)) < 0.01, "Wildfire with no lightning gear: %.2f (expected 134: the lightning on the gear was worth %.0f)" % [k2, k - k2])
	# (off: all fire, as the game has it: (100 + 10) x 1.4 = 154, the lightning gear worth nothing)
	Words.BOTH_KINDS = false
	_stats({"fire_pct": 40, "light_pct": 20, "fire_min": 10, "fire_max": 10, "light_min": 30, "light_max": 30})
	var r_off := _strike(["wildfire"])
	var k_off: float = h.kinds_hit(r_off, 0.5)
	_line(r_off.get("element2", "") == "" and absf(k_off - 154.0) < 0.01, "switched off, Wildfire all fire as before: %.2f (expected 154)" % k_off)
	Words.BOTH_KINDS = true
	# (Flame alone and Eruption: one kind, as before: (100 + 10) x 1.4 = 154)
	var one := []
	for w in ["fire", "eruption"]:
		one.append(snappedf(h.kinds_hit(_strike([w]), 0.5), 0.01))
	_line(one == [154.0, 154.0], "Flame and Eruption, one kind as before: %s (expected 154 each)" % [one])
	# (Scald and Hailstorm with the gear of their own kinds: frost +30% and 20 flat; Scald (50 + 10) x 1.4 + (50 + 20) x 1.3 = 175;
	# Hailstorm (50 + 20) x 1.3 + (50 + 30) x 1.2 = 187)
	_stats({"fire_pct": 40, "frost_pct": 30, "light_pct": 20, "fire_min": 10, "fire_max": 10, "frost_min": 20, "frost_max": 20, "light_min": 30, "light_max": 30})
	var sc: float = h.kinds_hit(_strike(["scald"]), 0.5)
	var hs: float = h.kinds_hit(_strike(["hailstorm"]), 0.5)
	_line(absf(sc - 175.0) < 0.01 and absf(hs - 187.0) < 0.01, "Scald %.2f (expected 175), Hailstorm %.2f (expected 187)" % [sc, hs])
	# (with no gear at all, a meld of two kinds hits as hard as one of one kind: nothing gained, nothing lost)
	_stats({})
	var plain := [snappedf(h.kinds_hit(_strike(["wildfire"]), 0.5), 0.01), snappedf(h.kinds_hit(_strike(["eruption"]), 0.5), 0.01)]
	_line(plain[0] == plain[1] and plain[0] == 100.0, "no gear: Wildfire %s, Eruption %s (both 100)" % plain)
	# (a hit landed: Wildfire's Strike on a monster takes life, and its look is fire, its first kind, as before)
	_stats({"fire_pct": 40, "light_pct": 20, "fire_min": 10, "fire_max": 10, "light_min": 30, "light_max": 30})
	r = _strike(["wildfire"])
	var m = null
	for x in M._monsters.list:
		if is_instance_valid(x) and not x.dead:
			m = x
			break
	if m == null:
		_line(true, "a hit landed: no monster here to strike (the numbers above are what it lands)")
	else:
		m.max_life = 1e9
		m.life = 1e9
		h.hit_monster(m, 0, 1.0, true)
		var lost: float = 1e9 - m.life
		_line(lost > 0.0, "a hit landed: Wildfire's Strike took %.0f of a monster's life (%s and %s)" % [lost, r["element"], r["element2"]])
	Words.BOTH_KINDS = was
	print("TWOKINDS: %d checks, %d wrong %s" % [n, bad.size(), bad if not bad.is_empty() else ""])
