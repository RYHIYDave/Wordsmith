## THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES (his process, 23 Nov 2026: “Create the melds, name them, figure out what they do
## front, back, crafting, and on enemies, then design the rune, then the animations”; “Let's start with 6-10 words melding with 1-5
## words”; “I also want all level 1 runes to meld with themselves to level 2”). Each approved by him in turn: the effects, Twin's
## Melds and the Floor 6–10 Melds (“Good”, “Good”); the stones (“Good”, docs/mockups/meld_runes); the animations, Twin's Meld
## Animations and the Floor 6–10 Meld Animations (“Okay sounds good”, “Good”).
##   THE MELDS: Twin with each floor 1–5 rune (Onslaught, Viper, Flash Freeze, Rekindle, Flurry, Aftershock); each of the eight
##     floor 6–10 runes with each floor 1–5 rune that has no meld with it yet (46). Each does the work of both its runes, as every
##     melded word does (words.gd resolve), and has a twist of its own, in front, behind and on a monster that carries it (this
##     file's rules; their numbers assets/words/melds52.json `tune`, made by tools/melds52/make.py from tools/melds52/tune.json).
##   THE LEVEL 2 RUNES: two of Twin, Leech, Volatile, Precise, Frenzied, Guarding, Lasting, Fleeting, Vast, Swift or Heavy meld into
##     its level 2, as two of a damage rune make its Rank II: its rune, stronger, as each one's doc line says.
##   ON GEAR: one property of each of its two runes, each a quarter weaker than alone (loot.gd melds52_options); a level 2 rune's
##     rune's own, half as strong again.
##   THE STONES: the approved pictures, baked into assets/words/melds52.png (24 x 24 each), put under the loot's and the HUD's sheets.
## ON: whether the wordsmith makes them (words.gd meld_of, meld_problem). The words themselves, their names and stones are always
## known, so a save that holds one always reads. ON at his yes to the films of all 98 at work, checked against his Art Rulebook,
## 23 Nov 2026: “Get those melds in”.
extends RefCounted
const DoorWords := preload("res://scripts/door_words.gd")

const FILE := "res://assets/words/melds52.json"
const SHEET := "res://assets/words/melds52.png"
## (ON at his yes to the films: “Get those melds in”, 23 Nov 2026)
static var ON := true
## THE CITY'S MELDS (his doc Floor 11–15 Melds, their runes and their animations: “Good”, “Yep good”, “Good to go”, 24 Nov 2026): the
## city's five runes (Pulling, Splitting, Hexing, Stilling, Binding) with the floor 1–5 runes and with each other, 45, and their five
## level 2 runes, in the same table (`city`); their twists meldscity_rules.gd, on monsters foe_meldscity.gd, their looks
## fx_m52p_city.gd. ON at his yes to their films (City Meld Films, https://claude.ai/artifact/C6a3KHBrT98YMvi4YpKAD9), asked
## “Want me to switch them on?”: “Yes”, 24 Nov 2026. Off, the wordsmith does not make them (`makes`); known, as all words are.
static var CITY_ON := true
## THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES (his “Then finish the melds”, 24 Nov 2026, the next group his Floor 11–15 doc named):
## 44, in the same table (`city2`); their text tools/meldscity/docs_city2.txt, their stones docs/mockups/meld_runes4, their twists
## meldscity2_rules.gd, on monsters foe_meldscity2.gd, their looks fx_m52p_city2.gd. ON at his yes to their page (City and Wilds
## Melds, https://claude.ai/artifact/9u1bUEVM4YdrjRZq5SHHeG), asked “Want me to switch these 44 on?”: “Switch them on.”, 24 Nov 2026.
## Off, the wordsmith does not make them (`makes`); known, as all words are.
static var CITY2_ON := true
## REAPING WITH THE DAMAGE RUNES (his words, 24 Nov 2026: “Like reaping and fire makes little imps that throw fireballs instead of
## the shades.  What would the others be?”; offered the five, “Yes and work on reaping”): Cinderbrood, Wintergrave, Stormwake,
## Bogborn and Charnel, Reaping with Flame, Frost, Lightning, Poison and Power, in the same table (`reap`); their text
## tools/meldsreap/docs_reap.txt, their stones docs/mockups/meld_runes5, their creatures' pictures tools/reap5 (assets/words/
## reap5_*.png), their rules meldsreap_rules.gd, their looks fx_m52p_reap.gd. ON at his yes to their third pass (the page Reaping
## Creatures, https://claude.ai/artifact/KjN5NDpT3Ck2y8Ezp9cDuS), asked “Should I switch them on, or keep working on one?”: “Better,
## yup switch on”, 24 Nov 2026. Off, the wordsmith does not make them (`makes`); known, as all words are.
static var REAP_ON := true
## THE HIGH CITY'S RUNES MELDED, the last group (his "Then we gotta get back to these melds.  I'd like to finish them today.", 24
## Nov 2026): Piercing, Bleeding, Reaping, Culling and Surging with every other rune and with each other (110), and each one's
## level 2, in the same table (`high`); their text tools/meldshigh/docs_high.txt, their stones docs/mockups/meld_runes6 (both from
## tools/meldshigh/design.py), their twists meldshigh_rules.gd, their looks fx_m52p_high.gd. OFF until his yes to their films (his
## pick, 24 Nov 2026: "Carriers on, melds off (Recommended)"): the wordsmith does not make them (`makes`); known, as all words are.
static var HIGH_ON := false
## ALL MELDS: THE LEAST EXCITING REDONE (his words, 24 Nov 2026: “Next I want you to look at the larger pool of all melds, and redo
## the 20 weakest.  Then do it again.  Then do it a third time.”; weakest read as least exciting, his pick the time before). All 325
## scored (tools/meldsredo/scores_all.py), the 20 lowest redone each round, each keeping its name, idea, stone and what it did, and
## gaining on each side a moment seen happen: their texts tools/meldsredo/redo.txt (melds52.json `redo`, `redoRounds`), their
## twists meldsredo_rules.gd, on a monster foe_meldsredo.gd, their looks fx_m52p_redo.gd. OFF until his yes to their films: the
## melds do as before, their texts as before.
static var REDO_ON := false
## (what each rune is worth inside one on gear: items.ts MELD_GEAR_STRENGTH; a level 2 rune's: RANK2's half again)
const GEAR := 0.75
const GEAR_RANK := 1.5

static var _t := {}


## Is `w` one of the melds redone, and the redone ones on (REDO_ON)?
static func is_redo(w) -> bool:
	return REDO_ON and w != null and T().get("redo", {}).has(str(w))


## The table (melds52.json).
static func T() -> Dictionary:
	if _t.is_empty():
		_t = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	return _t


## A twist's numbers.
static func tune(id: String) -> Dictionary:
	return T()["tune"].get(id, {})


## Is it one of the 63 (a meld or a level 2 rune of these)?
static func is_new(w) -> bool:
	return w is String and T()["words"].has(w)


static func is_new_rank(w) -> bool:
	return w is String and T()["rankOf"].has(w)


## What two words make, or "": one of the 52 made of them, or two of one of the eleven its level 2 (the city's, while CITY_ON).
static func makes(a: String, b: String) -> String:
	if a == b:
		var r: String = a + "2"
		return r if T()["rankOf"].has(r) and (CITY_ON or not is_city(r)) and (HIGH_ON or not is_high(r)) else ""
	for m in T()["melds"]:
		var of: Array = T()["of"][m]
		if (of[0] == a and of[1] == b) or (of[0] == b and of[1] == a):
			if is_city2(m):
				return m if CITY2_ON else ""
			if is_reap(m):
				return m if REAP_ON else ""
			if is_high(m):
				return m if HIGH_ON else ""
			return m if CITY_ON or not is_city(m) else ""
	return ""


## Is it one of the city's melds or level 2 runes?
static func is_city(w) -> bool:
	return w is String and T().get("city", []).has(w)


## Is it one of the city's runes with the floor 6–10 runes?
static func is_city2(w) -> bool:
	return w is String and T().get("city2", []).has(w)


## Is it one of the High City's runes melded (or its level 2)?
static func is_high(w) -> bool:
	return w is String and T().get("high", []).has(w)


## Is it one of Reaping's melds with the damage runes?
static func is_reap(w) -> bool:
	return w is String and T().get("reap", []).has(w)


## Into the words' tables (words.json): each one as a melded or ranked word, its parts, its attribute, its Lexicon page; and the
## order a hero's words are kept in. Always: a save that holds one reads, ON or not.
static func add_to(D: Dictionary) -> void:
	var t := T()
	var M: Dictionary = D["melds"]
	for id in t["order"]:
		D["words"][id] = t["words"][id]
		M["attr"][id] = t["attr"][id]
		if D.has("page"):
			D["page"][id] = t["page"][id]
	for id in t["of"]:
		M["of"][id] = t["of"][id]
	for id in t["rankOf"]:
		M["rankOf"][id] = t["rankOf"][id]
	# (ALL MELDS REDONE, ON: each redone one's own texts, the game's own melds among them)
	if REDO_ON:
		for id in t.get("redo", {}):
			if D["words"].has(id):
				D["words"][id] = (D["words"][id] as Dictionary).duplicate()
				D["words"][id].merge(t["redo"][id], true)
	# (GREED, the better-loot word: a plain word kept in this table for its stone and page, words.gd GREED)
	for id in t.get("extra", {}):
		D["words"][id] = t["extra"][id]
		M["attr"][id] = t["extra"][id]["attr"]
		if D.has("page") and t.get("extraPage", {}).has(id):
			D["page"][id] = t["extraPage"][id]
		# (THE DOOR WORDS, door_words.gd: known always, listed among the words to find only while it is ON)
		if bool(t["extra"][id].get("door", false)):
			if DoorWords.ON:
				list_door(D, id)
			continue
		if D.has("ids") and not (D["ids"] as Array).has(id):
			D["ids"].append(id)
			# (one more word to find, on the Lexicon's SPOILS page beside Plundering)
			if D.has("allWords"):
				D["allWords"] = int(D["allWords"]) + 1
			for pg in D.get("lexPages", []):
				if (pg["words"] as Array).has("plundering") and not (pg["words"] as Array).has(id):
					pg["words"].append(id)
	# (and Plundering's extra item, now Greed's: his yes to Greed, 24 Nov 2026)
	if D["words"].has("plundering") and t.get("extra", {}).has("greed"):
		D["words"]["plundering"]["frontText"] = "Kills drop more gold."
	M["d52"] = t["melds"]
	M["ranks52"] = t["ranks"]
	# (on a monster, a level 2 rune laid with its rune makes it half as strong again: monster.gd word_share, foe.rankBy)
	if D.has("foe") and D["foe"].has("rankBy"):
		for id in t["rankOf"]:
			D["foe"]["rankBy"][t["rankOf"][id]["word"]] = id


## A door word listed among the words to find (door_words.gd ON): the words' list, the count, the Lexicon's page THE DOOR.
static func list_door(D: Dictionary, id: String) -> void:
	if not D.has("ids") or (D["ids"] as Array).has(id):
		return
	D["ids"].append(id)
	if D.has("allWords"):
		D["allWords"] = int(D["allWords"]) + 1
	if D.has("lexPages"):
		var pg = null
		for q in D["lexPages"]:
			if str(q["name"]) == "THE DOOR":
				pg = q
		if pg == null:
			pg = {"name": "THE DOOR", "words": []}
			D["lexPages"].append(pg)
		pg["words"].append(id)


static func _attr_name(a: String) -> String:
	return {"str": "Strength", "dex": "Dexterity", "int": "Intelligence"}.get(a, "")


## Into the HUD's tables (hud.json): each one's colour, its names on a move, what it grows with.
static func add_hud(H: Dictionary) -> void:
	var t := T()
	for id in t.get("extra", {}):
		var we: Dictionary = t["extra"][id]
		H["word_color"][id] = t["color"][id]
		H["words"][id] = {"front": str(we["front"]).to_upper(), "behind": str(we["behind"]).trim_prefix("of ").to_upper(),
			"name": we["name"], "grows": "for the Rim's door" if bool(we.get("door", false)) else "grows with " + _attr_name(str(we["attr"]))}
	for id in t["order"]:
		var wd: Dictionary = t["words"][id]
		H["word_color"][id] = t["color"][id]
		H["words"][id] = {"front": str(wd["front"]).to_upper(), "behind": str(wd["behind"]).trim_prefix("of ").to_upper(),
			"name": wd["name"], "grows": "grows with " + _attr_name(str(wd["attr"]))}


## THE STONES INTO A SHEET: `tex` a sheet of the words' stones (two picture pixels to a game pixel); `put` called with each one's id
## and its place in the sheet returned (Rect2). The sheet returned is `tex` with the stones' own sheet under it.
static func stones(tex: Texture2D, put: Callable) -> Texture2D:
	if tex == null:
		return tex
	var src: Image = tex.get_image()
	if src.is_compressed():
		src.decompress()
	src.convert(Image.FORMAT_RGBA8)
	var add: Image = (load(SHEET) as Texture2D).get_image()
	if add.is_compressed():
		add.decompress()
	add.convert(Image.FORMAT_RGBA8)
	var w := maxi(src.get_width(), add.get_width())
	var img := Image.create(w, src.get_height() + 1 + add.get_height(), false, Image.FORMAT_RGBA8)
	img.blit_rect(src, Rect2i(0, 0, src.get_width(), src.get_height()), Vector2i.ZERO)
	var y0: int = src.get_height() + 1
	img.blit_rect(add, Rect2i(0, 0, add.get_width(), add.get_height()), Vector2i(0, y0))
	var at: Dictionary = T()["stones"]
	for id in at:
		put.call(id, Rect2(float(at[id][0]), float(at[id][1] + y0), 24.0, 24.0))
	return ImageTexture.create_from_image(img)


## WHAT EACH ONE MAKES OF A MOVE'S NUMBERS (words.gd resolve, after every word's own and the 23 melds' twists): `r` the move as
## resolved so far; `loc` its figures still being made {dmg_mult, size, cooldown, rate, waits}, given back changed; its line on
## the move's page, the doc's own words. The rest of each twist is at work in the fight (melds52_rules.gd).
static func resolve(r: Dictionary, loc: Dictionary, front: Array, behind: Array, lines: Array) -> void:
	var f = r["meld"]
	var b = r["meld_behind"]
	var ranks_f: Array = front.filter(func(w): return w != null and is_new_rank(w))
	var ranks_b: Array = behind.filter(func(w): return w != null and is_new_rank(w))
	if f != null and is_new(f) and not is_new_rank(f):
		_front(str(f), r, loc)
		lines.append("%s: %s" % [T()["words"][f]["name"], T()["words"][f]["frontText"]])
	if b != null and is_new(b) and not is_new_rank(b):
		_behind(str(b), r, loc)
		lines.append("%s: %s" % [T()["words"][b]["behind"], T()["words"][b]["behindText"]])
	for w in ranks_f:
		_rank(str(w), true, r, loc)
		lines.append("%s: %s" % [T()["words"][w]["name"], T()["words"][w]["frontText"]])
	for w in ranks_b:
		_rank(str(w), false, r, loc)
		lines.append("%s: %s" % [T()["words"][w]["behind"], T()["words"][w]["behindText"]])


static func _wider(loc: Dictionary, r: Dictionary, k: float) -> void:
	loc["size"] = float(loc["size"]) * (1.0 + k)
	r["wide"] = float(r["wide"]) * (1.0 + k)


static func _front(id: String, r: Dictionary, loc: Dictionary) -> void:
	var t := tune(id)
	match id:
		"viper":
			# (two doses at once, eating twice as fast: the same poison in half the time)
			r["poison_k"] = float(t["doses"]) * float(t["pace"])
			r["poison_t"] = 1.0 / float(t["pace"])
		"canker":
			r["poison_t"] = float(t["longer"])
		"bloat":
			r["poison_k"] = float(t["faster"])
			r["poison_t"] = 1.0 / float(t["faster"])
		"smoulder":
			r["burn_t"] = float(t["burn"])
		"flashfire":
			r["burn_k"] = float(t["faster"])
			r["burn_t"] = 1.0 / float(t["faster"])
		"bedrock":
			r["stun"] = float(r["stun"]) * float(t["stun"])
		"daze":
			r["stun"] = float(r["stun"]) * float(t["stun"])
		"cataclysm", "miasma", "glacier", "inferno", "stormfront", "gale", "earthquake", "bloodtide", "blastwave", "bullseye", "aftermath", "whipcrack":
			_wider(loc, r, float(t["wider"]))


static func _behind(id: String, r: Dictionary, loc: Dictionary) -> void:
	var t := tune(id)
	match id:
		"onslaught":
			r["echo"] = float(t["echo"])
		"cataclysm":
			r["vast"] = float(r["vast"]) * float(t["splash"])


## A level 2 rune (`w`, in front or behind): its rune, stronger, as its doc line says.
static func _rank(w: String, front: bool, r: Dictionary, loc: Dictionary) -> void:
	var t := tune(w)
	match w:
		"twin2":
			if front:
				r["count"] = int(t["count"])
				r["count_dmg"] = float(r["count_dmg"]) * float(t["each"])
			else:
				r["echo_n"] = 2
		"leech2":
			if front:
				r["leech"] = float(r["leech"]) * float(t["k"])
			else:
				r["orb_chance"] = minf(0.95, float(r["orb_chance"]) * float(t["k"]))
		"volatile2":
			if front:
				r["volatile"] = float(r["volatile"]) * float(t["k"])
			else:
				r["rune"] = float(r["rune"]) * float(t["k"])
		"precise2":
			if front:
				loc["dmg_mult"] = float(loc["dmg_mult"]) * (1.0 + 0.3 * (float(t["more"]) - 1.0))
				loc["size"] = float(loc["size"]) * float(t["area"])
		"frenzied2":
			r["frenzy_k"] = float(t["k"])
		"guarding2":
			if front:
				r["shield"] = float(r["shield"]) * float(t["k"])
			else:
				r["ward"] = minf(0.7, float(r["ward"]) * float(t["k"]))
		"lasting2":
			r["last"] = float(r["last"]) * 1.33
		"fleeting2":
			var sh: float = float(Words_data()["fleeting"]["shorter"])
			var k: float = float(t["k"]) / maxf(0.05, 1.0 - sh)
			r["last"] = float(r["last"]) * k
			r["pace"] = float(r["pace"]) / k
		"vast2":
			if front:
				_wider(loc, r, 0.25)
				loc["dmg_mult"] = float(loc["dmg_mult"]) * (1.0 - float(t["softer"]))
			else:
				r["vast"] = float(r["vast"]) * 1.25
		"swift2":
			if front:
				if bool(loc["waits"]):
					loc["cooldown"] = float(loc["cooldown"]) * 0.85
				else:
					loc["rate"] = float(loc["rate"]) * 1.15
			else:
				r["haste"] = float(r["haste"]) * float(t["k"])
		# (THE HIGH CITY'S LEVEL 2 RUNES: its rune half as strong again, as its doc line says)
		"piercing2":
			if front:
				r["through"] = float(r["through"]) * 1.5
			else:
				r["lance"] = float(r["lance"]) * 1.5
		"bleeding2":
			if front:
				r["bleed"] = float(r["bleed"]) * 1.5
			else:
				r["thorns"] = float(r["thorns"]) * 1.5
		"reaping2":
			if front:
				r["reap"] = float(r["reap"]) * 1.5
			else:
				r["spirit"] = float(r["spirit"]) * 1.5
		"culling2":
			if front:
				r["cull"] = minf(0.4, float(r["cull"]) * 1.5)
			else:
				r["cull_mark"] = minf(0.6, float(r["cull_mark"]) * 1.5)
		"surging2":
			if front:
				r["surge"] = float(r["surge"]) * 1.5
			else:
				r["dodge_surge"] = float(r["dodge_surge"]) * 1.5
		"heavy2":
			if front:
				loc["dmg_mult"] = float(loc["dmg_mult"]) * float(t["more"])
				r["stun"] = float(r["stun"]) * float(t["stun"])
			else:
				r["cracks"] = float(r["cracks"]) * 1.5


static func Words_data() -> Dictionary:
	return preload("res://scripts/words.gd").data()
