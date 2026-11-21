## THE ROYAL CARDS, the High City's event (game/royal_cards.ts; floors 16 to 20). His idea, 28 Oct 2026: “I had an idea for the four
## bosses, that there would be enemies that were influenced by one of the bosses, then they would drop cards.  The cards would then
## be used at the gambler.  You hand in a pair or three of a kind and then you get loot based on the difficulty of the hand.
## Something like that.”
##   TOUCHED PACKS: on a floor of the High City a share of the packs is touched by a royal (game.ts spawns it: the floors' exports
##     carry each monster's `royal`); every one of the pack wears that royal's crest over its head (monster.gd).
##   THEIR CARDS: each touched one drops its royal's card as it dies, lying face up; walked over, it is his for good (loot.gd).
##   AT THE STRANGER, in town, a page of his cards: every hand they make and what it pays; one handed in, the cards are his no more
##   and the pieces are in his bag (inventory.gd, loot.gd hand_in).
## This holds the deck's own reckoning, as the game's: the hands his cards make, best first, and what each pays.
extends RefCounted

const ROYALS := ["princess", "prince", "queen", "king"]
const KINDS := ["pair", "twopair", "three", "fullhouse", "four"]


## How far up the deck a royal is (the Princess 0, the King 3) (rankOf).
static func rank_of(r: String) -> int:
	return ROYALS.find(r)


## The cards a hand takes (handCards). A hand: {kind, main, kicker}.
static func hand_cards(h: Dictionary) -> Array:
	var m: String = h["main"]
	var k: String = str(h.get("kicker", ""))
	match str(h["kind"]):
		"pair":
			return [m, m]
		"three":
			return [m, m, m]
		"four":
			return [m, m, m, m]
		"twopair":
			return [m, m, k, k]
		"fullhouse":
			return [m, m, m, k, k]
	return []


## What a hand pays: {n pieces, rarity (1 magic, 2 rare), plus levels over his own} (handPays).
static func hand_pays(h: Dictionary) -> Dictionary:
	var main_r := rank_of(h["main"])
	var top := maxi(main_r, rank_of(h["kicker"]) if h.get("kicker", "") != "" else 0)
	match str(h["kind"]):
		"pair":
			return {"n": 1, "rarity": 2 if main_r >= 2 else 1, "plus": main_r}
		"twopair":
			return {"n": 2, "rarity": 2, "plus": top}
		"three":
			return {"n": 3 if h["main"] == "king" else 2, "rarity": 2, "plus": main_r}
		"fullhouse":
			return {"n": 3, "rarity": 2, "plus": top + 1}
		"four":
			return {"n": 4, "rarity": 2, "plus": main_r + 2}
	return {"n": 0, "rarity": 1, "plus": 0}


## A hand's name, as the stranger's page says it (handName). `names` the royals' names (items.json royal.names).
static func hand_name(h: Dictionary, names: Dictionary) -> String:
	var m: String = names[h["main"]]["many"]
	var k: String = names[h["kicker"]]["many"] if h.get("kicker", "") != "" else ""
	match str(h["kind"]):
		"pair":
			return "A pair of %s" % m
		"three":
			return "Three %s" % m
		"four":
			return "Four %s" % m
		"twopair":
			return "Two pair: %s and %s" % [m, k]
		"fullhouse":
			return "Full house: %s over %s" % [m, k]
	return ""


## What a hand pays, in words (paysName).
static func pays_name(p: Dictionary) -> String:
	var what := "rare" if int(p["rarity"]) == 2 else "magic"
	var n: int = p["n"]
	var words := ["", "One", "Two", "Three", "Four"]
	var s := ("A %s piece" % what) if n == 1 else ("%s %s pieces" % [words[n] if n < words.size() else str(n), what])
	var plus: int = p["plus"]
	return ("%s, %d level%s above you" % [s, plus, "" if plus == 1 else "s"]) if plus > 0 else s


## How many of a royal's cards he holds (held).
static func held(cards: Dictionary, r: String) -> int:
	return maxi(0, int(floorf(float(cards.get(r, 0)))))


## Every hand his cards make, best first (by what it pays: pieces, then rarity, then levels) (handsFrom).
static func hands_from(cards: Dictionary) -> Array:
	var out: Array = []
	for a in ROYALS:
		if held(cards, a) >= 2:
			out.append({"kind": "pair", "main": a})
		if held(cards, a) >= 3:
			out.append({"kind": "three", "main": a})
		if held(cards, a) >= 4:
			out.append({"kind": "four", "main": a})
		for b in ROYALS:
			if b == a:
				continue
			# (two pair named high over low, once)
			if rank_of(a) > rank_of(b) and held(cards, a) >= 2 and held(cards, b) >= 2:
				out.append({"kind": "twopair", "main": a, "kicker": b})
			if held(cards, a) >= 3 and held(cards, b) >= 2:
				out.append({"kind": "fullhouse", "main": a, "kicker": b})
	var worth := func(h: Dictionary) -> int:
		var p := hand_pays(h)
		return int(p["n"]) * 100 + int(p["rarity"]) * 10 + int(p["plus"])
	# (the game's sort: by worth, best first, and as it stands where two are worth the same)
	var keyed: Array = []
	for i in out.size():
		keyed.append([worth.call(out[i]), i, out[i]])
	keyed.sort_custom(func(x, y): return x[0] > y[0] or (x[0] == y[0] and x[1] < y[1]))
	return keyed.map(func(q): return q[2])


## Whether his cards make hand `h` (canMake).
static func can_make(cards: Dictionary, h: Dictionary) -> bool:
	var need := {}
	for r in hand_cards(h):
		need[r] = int(need.get(r, 0)) + 1
	for r in need:
		if held(cards, r) < int(need[r]):
			return false
	return true


## A hand's own name, to keep it picked while the list changes (ui/royal_cards.ts keyOf).
static func key_of(h: Dictionary) -> String:
	return "hand:%s:%s:%s" % [h["kind"], h["main"], h.get("kicker", "")]


## What a save holds of the cards, made sound (cleanCards).
static func clean(v) -> Dictionary:
	var out := {}
	if not (v is Dictionary):
		return out
	for r in ROYALS:
		var k = v.get(r)
		if (k is float or k is int) and float(k) >= 1.0 and is_finite(float(k)):
			out[r] = mini(999, int(floorf(float(k))))
	return out
