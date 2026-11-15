## THE WORDS ON A MOVE (game/words.ts resolveSkill; game/defs.ts WORDS, SKILLS, SLOT_OPENS, MOVE_OPENS). One rule covers every
## pairing: A WORD IN FRONT OF A MOVE CHANGES THE HIT; A WORD BEHIND IT CHANGES WHAT THE MOVE LEAVES BEHIND.
##
## The words here are those a Warrior can come by on floors 1 to 5: the prison's six (Power, Poison, Frost, Flame, Lightning,
## Swift) and Heavy, the armourer's reward. The game's other words are found from floor 6 down, and its melded and ranked
## words are made at the wordsmith after the Meldstone: none of those is here yet.
##
## Every table and number is the game's own, taken out of it by tools/godot_words.ts into assets/words/words.json: the words
## (their names in front and behind, the attribute each grows with, its element), his three moves (Strike, Whirlwind, Lunge),
## Heavy's and the poison's numbers, when a move and its slots open. What is written here is only the rule itself, word by
## word as resolveSkill has it, in its order. `godot --headless --path godot -s res://checks/words_check.gd` holds it
## against what the game's own resolveSkill makes of 1671 loadouts (tools/godot_words.ts check): every number, name and
## line of text the same.
##
## WHAT A MOVE WITH ITS WORDS COMES TO (`resolve`; the game's Resolved), the keys the fight reads:
##   id, name      the move, and its name with its words ("Flame Strike of Venom")
##   element       "phys", "fire", "frost" or "lightning": the element word in front decides, failing that the one behind
##   dmg_mult      one hit's share of the weapon's damage (the move's own, his Strength, the words)
##   size          how many times as far it reaches and as wide it lands
##   rate          blows a second, for a move that has no wait (Strike)
##   cooldown      its wait, seconds (Whirlwind, Lunge)
##   splash, splash_dmg   a one-enemy move's splash round what it strikes (tiles, before `size`), and its share of the hit
##   pierce        (a shot's: it goes on through; set by an element behind)
##   ignite        FLAME in front: what it strikes burns for this share of the hit more, over 3 s
##   chill         FROST in front: what it strikes is slowed by this share; a second hit on a chilled one freezes it
##   arcs, arc_dmg LIGHTNING in front: so many more enemies the hit jumps to, each for this share of it
##   poison        POISON in front: each hit adds a dose of this share of the hit a second
##   stun          HEAVY in front: seconds what it strikes is stunned
##   might         POWER behind: each hit that lands adds so many % damage for 5 s (five times at most)
##   haste         SWIFT behind: so many % faster on his feet for 3 s after each use
##   zone          an element behind: the ground it leaves, {kind: "burn" | "ice" | "storm", element, dps, slow, dur}; null
##   cloud         POISON behind: a cloud left that poisons for this share of the hit a second
##   cracks        HEAVY behind: seconds of cracked ground left; an enemy walking onto it is staggered
##   lines         what it does, in the game's own words, for its card
extends RefCounted

const FILE := "res://assets/words/words.json"

static var _data := {}


## The game's tables (assets/words/words.json).
static func data() -> Dictionary:
	if _data.is_empty():
		_data = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	return _data


## The words there are, in the game's order.
static func ids() -> Array:
	return data()["ids"]


## A word as the game has it: {name, front, behind, attr, element, kind, about, frontText, behindText, monsterText}.
static func word(w: String) -> Dictionary:
	return data()["words"][w]


## One of his moves as the game has it (defs.ts SKILLS): by its id ("strike", "whirlwind", "leap").
static func skill(id: String) -> Dictionary:
	return data()["skills"][id]


## His three moves' ids: the quick attack, the slow one, the evasive one.
static func moves() -> Array:
	return data()["moves"]


## A damage word (Power, Poison, Frost, Flame, Lightning): one of them to a side (melds.ts isDamageWord).
static func is_damage(w: String) -> bool:
	return word(w)["kind"] == "damage"


## Whether move `i` (0, 1, 2) is open at a level (defs.ts MOVE_OPENS: the quick attack at once, the slow one at 2, the evasive
## one at 5).
static func move_open(i: int, level: int) -> bool:
	return level >= int(data()["moveOpens"][i])


## How many slots a move has in front and behind at a level (defs.ts socketCount, SLOT_OPENS as the first levels set them:
## one in front at once, one behind at 4, the second in front at 15, the second behind at 20).
static func socket_count(level: int) -> Array:
	var n := [0, 0]
	for lv in data()["slotOpens"]["front"]:
		if level >= int(lv):
			n[0] += 1
	for lv in data()["slotOpens"]["behind"]:
		if level >= int(lv):
			n[1] += 1
	return n


## Why a word cannot go into a side's slots (`group`: its words, null where a slot is empty), or "" if it can (socketProblem):
## no free slot; there already; or a damage word where the side has its one (`most`: how many a side holds).
static func socket_problem(group: Array, w: String, most := 1) -> String:
	if not group.has(null):
		return "No free socket"
	if group.has(w):
		return "Already there"
	if is_damage(w):
		var n := 0
		for x in group:
			if x != null and is_damage(x):
				n += 1
		if n >= most:
			return "Two damage words per side" if most > 1 else "One damage word per side"
	return ""


## The move's name with its words (skillName): "Flame Strike of Venom and Swiftness".
static func skill_name(id: String, front: Array, behind: Array) -> String:
	var parts: Array = []
	for w in front:
		if w != null:
			parts.append(word(w)["front"])
	parts.append(skill(id)["name"])
	var name := " ".join(parts)
	var after: Array = []
	for w in behind:
		if w != null:
			after.append(str(word(w)["behind"]).trim_prefix("of "))
	if not after.is_empty():
		name += " of " + " and ".join(after)
	return name


## A share as the game writes it: a whole number of hundredths, a half rounded up ("17%").
static func _pct(n: float) -> String:
	return "%d%%" % int(floorf(n + 0.5))


## A number as the game writes it: whole where it is whole ("4"), else as short as it is ("0.8").
static func _num(n: float) -> String:
	if is_equal_approx(n, roundf(n)):
		return str(int(roundf(n)))
	return String.num(n, 3).rstrip("0").rstrip(".")


## A MOVE WITH ITS WORDS (resolveSkill), for a hero whose numbers are `d`: {str, dex, int, area, aps, cdr} (stats.ts derive).
## `front`, `behind`: the words in its slots, null where one is empty.
static func resolve(id: String, front: Array, behind: Array, d: Dictionary) -> Dictionary:
	var D := data()
	var def: Dictionary = D["skills"][id]
	# (one enemy at a time: a blade. A word that makes "the hit" bigger gives these a splash.)
	var single: bool = def["kind"] in ["melee", "projectile", "summon"]
	var lines: Array = [def["desc"]]
	# (the damage's element: the element word in front decides; failing that, the one behind)
	var element := "phys"
	for w in front + behind:
		if w != null and D["words"][w]["element"] != null:
			element = D["words"][w]["element"]
			break
	# (what the move grows with: the Warrior's own attribute, his Strength)
	var attr: String = D["grows"]
	var prim: float = d[attr]
	# (HOW MUCH A WORD HERE GROWS, defs.ts ATTR_SPLIT: fire, frost and lightning by the move's own attribute; any other word by
	# its own)
	var grows_by := func(w: String) -> float:
		return float(d[attr if D["byWeapon"].has(w) else str(D["words"][w]["attr"])])
	var has := func(side: Array, w: String) -> bool: return side.has(w)
	var dmg_mult: float = float(def["dmg"]) * (1.0 + prim * float(D["primaryDmg"]) / 100.0)
	var size: float = d["area"]
	var rate: float = d["aps"]
	var cooldown: float = float(def["cooldown"]) * (1.0 - float(d["cdr"]))
	var waits: bool = float(def["cooldown"]) > 0.0
	var heavy: Dictionary = D["heavy"]
	var r := {
		"id": id, "name": skill_name(id, front, behind), "element": element, "dmg_mult": 0.0, "size": 1.0, "rate": 0.0, "cooldown": 0.0,
		"splash": 0.0, "splash_dmg": 0.0, "pierce": false,
		"ignite": 0.0, "chill": 0.0, "arcs": 0, "arc_dmg": 0.0, "poison": 0.0, "stun": 0.0,
		"might": 0.0, "haste": 0.0, "zone": null, "cloud": 0.0, "cracks": 0.0, "lines": lines,
	}

	# ----- in front: the hit -----
	if has.call(front, "power"):
		var a: float = grows_by.call("power")
		var dmg := 25.0 + 0.6 * a
		var big := 20.0 + 0.3 * a
		dmg_mult *= 1.0 + dmg / 100.0
		size *= 1.0 + big / 100.0
		if single:
			r["splash"] = maxf(r["splash"], 1.2)
			r["splash_dmg"] = maxf(r["splash_dmg"], 0.5)
		lines.append("Power: +%s damage, +%s size%s." % [_pct(dmg), _pct(big), ", splashes nearby enemies" if single else ""])
	if has.call(front, "swift"):
		var a: float = grows_by.call("swift")
		if waits:
			var cut := minf(60.0, 20.0 + 0.3 * a)
			cooldown *= 1.0 - cut / 100.0
			lines.append("Swift: %s shorter cooldown." % _pct(cut))
		else:
			var fast := 25.0 + 0.5 * a
			rate *= 1.0 + fast / 100.0
			lines.append("Swift: +%s attack speed." % _pct(fast))
	if has.call(front, "fire"):
		var burn: float = 30.0 + 0.8 * grows_by.call("fire")
		r["ignite"] = burn / 100.0
		if single:
			r["splash"] = maxf(r["splash"], 1.5)
			r["splash_dmg"] = 1.0
		lines.append("Flame: fire damage%s, burns for %s more over 3 s." % [", explodes on contact" if single else "", _pct(burn)])
	if has.call(front, "frost"):
		var slow: float = minf(70.0, 30.0 + 0.3 * grows_by.call("frost"))
		r["chill"] = slow / 100.0
		if single:
			r["splash"] = maxf(r["splash"], 1.5)
			r["splash_dmg"] = 1.0
		lines.append("Frost: frost damage%s, slows by %s; a second hit freezes." % [", bursts on contact" if single else "", _pct(slow)])
	if has.call(front, "lightning"):
		var a: float = grows_by.call("lightning")
		var arc := 40.0 + 0.5 * a
		r["arcs"] = 2 + floori(a / 40.0)
		r["arc_dmg"] = arc / 100.0
		lines.append("Lightning: lightning damage, arcs to %d more enemies for %s." % [r["arcs"], _pct(arc)])
	if has.call(front, "poison"):
		# (a weaker hit, and the poison does the work: every hit adds a dose)
		var dose: float = 20.0 + 0.4 * grows_by.call("poison")
		r["poison"] = dose / 100.0
		dmg_mult *= 0.8
		lines.append("Poison: hits 20%% softer; poisons for %s of the hit a second for %s s. Up to %s doses add up." % [_pct(dose), _num(D["poison"]["time"]), _num(D["poison"]["stacks"])])
	if has.call(front, "heavy"):
		# (slower, much harder, and it stuns)
		var more: float = 50.0 + 0.5 * grows_by.call("heavy")
		dmg_mult *= 1.0 + more / 100.0
		if waits:
			cooldown *= float(heavy["slower"])
		else:
			rate /= float(heavy["slower"])
		r["stun"] = float(heavy["stun"])
		lines.append("Heavy: +%s damage, %s slower; stuns for %s s." % [_pct(more), _pct((float(heavy["slower"]) - 1.0) * 100.0), _num(heavy["stun"])])

	# ----- behind: the wake -----
	var softer := false
	if has.call(behind, "power"):
		r["might"] = 6.0 + 0.1 * grows_by.call("power")
		lines.append("of Power: each hit that lands adds +%s damage for 5 s (up to 5 times)." % _pct(r["might"]))
	if has.call(behind, "swift"):
		r["haste"] = 15.0 + 0.2 * grows_by.call("swift")
		lines.append("of Swiftness: +%s movement speed for 3 s after each use." % _pct(r["haste"]))
	for w in behind:
		if w != "fire" and w != "frost" and w != "lightning":
			continue
		var a: float = grows_by.call(w)
		softer = true
		r["pierce"] = true
		if w == "fire":
			var dps := 25.0 + 0.6 * a
			r["zone"] = {"kind": "burn", "element": "fire", "dps": dps / 100.0, "slow": 0.0, "dur": 4.0}
			lines.append("of Flame: passes through, leaves ground that burns for %s a second." % _pct(dps))
		elif w == "frost":
			var slow := minf(75.0, 40.0 + 0.3 * a)
			var dps := 10.0 + 0.2 * a
			r["zone"] = {"kind": "ice", "element": "frost", "dps": dps / 100.0, "slow": slow / 100.0, "dur": 4.0}
			lines.append("of Frost: passes through, leaves ice that slows by %s." % _pct(slow))
		else:
			var zap := 30.0 + 0.6 * a
			r["zone"] = {"kind": "storm", "element": "lightning", "dps": zap / 100.0, "slow": 0.0, "dur": 4.0}
			lines.append("of Lightning: passes through, leaves a storm that strikes for %s." % _pct(zap))
		# (one element behind)
		break
	if has.call(behind, "poison"):
		var dose: float = 25.0 + 0.5 * grows_by.call("poison")
		r["cloud"] = dose / 100.0
		lines.append("of Venom: leaves a cloud that poisons for %s of the hit a second." % _pct(dose))
	if has.call(behind, "heavy"):
		r["cracks"] = float(heavy["cracks"])
		lines.append("of Quakes: leaves cracked ground for %s s; an enemy walking onto it is staggered." % _num(r["cracks"]))
	# (an element behind: it passes through, and hits softer)
	if softer:
		dmg_mult *= 0.7

	r["dmg_mult"] = dmg_mult
	r["size"] = size
	r["rate"] = rate
	r["cooldown"] = cooldown
	return r
