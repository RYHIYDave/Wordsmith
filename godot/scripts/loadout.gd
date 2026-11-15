## THE WORDS SET IN HIS MOVES (game/state.ts SkillState `front`, `behind`; game.ts recompute): for each of his three moves
## (Strike, Whirlwind, Lunge: words.gd moves) the words in its slots in front and behind, and what the move comes to with
## them (words.gd resolve). The hero carries one of these (hero.gd `loadout`); the gear screen sets words in it (inventory.gd);
## the fight reads `r(i)`.
##
## THE SLOTS (defs.ts MOVE_OPENS, SLOT_OPENS as the first levels set them): none until the wordsmith's ring is lit; a move
## not yet open has none (the quick attack opens at once, the slow one at level 2, the evasive one at 5); an open move has
## one in front at once, one behind from level 4, a second in front from 15 and a second behind from 20. One damage word to
## a side (words.gd socket_problem).
extends RefCounted

const Words := preload("res://scripts/words.gd")

## (his level, and whether the wordsmith's ring is lit: what opens the slots)
var level := 1
var ring := false
## For each of his three moves: its slots in front and behind, a word's id or null where one is empty.
var front: Array = [[], [], []]
var behind: Array = [[], [], []]
## (his numbers the words read: stats.ts derive; set_stats)
var _d := {"str": 14.0, "dex": 8.0, "int": 6.0, "area": 1.0, "aps": 1.092, "cdr": 0.0}
var _r: Array = [null, null, null]


## His level, and whether the ring is lit: the slots there are now. A slot that opens is empty; none is ever taken away.
func set_level(lv: int, lit: bool) -> void:
	level = lv
	ring = lit
	var n: Array = Words.socket_count(lv) if lit else [0, 0]
	for i in 3:
		var open: bool = lit and Words.move_open(i, lv)
		while front[i].size() < (int(n[0]) if open else 0):
			front[i].append(null)
		while behind[i].size() < (int(n[1]) if open else 0):
			behind[i].append(null)
	_r = [null, null, null]


## His numbers, as his gear, his levels and his attributes make them: {str, dex, int, area, aps, cdr}.
func set_stats(d: Dictionary) -> void:
	for k in _d:
		if d.has(k):
			_d[k] = float(d[k])
	_r = [null, null, null]


## A side's slots of move `i` ("front" or "behind").
func slots(i: int, side: String) -> Array:
	return front[i] if side == "front" else behind[i]


## Why word `w` cannot go into a side of move `i`, or "" if it can (the game's own words: words.gd socket_problem).
func problem(i: int, side: String, w: String) -> String:
	var g := slots(i, side)
	if g.is_empty():
		return "No free socket"
	return Words.socket_problem(g, w)


## Word `w` set in the first empty slot of a side of move `i`: "" if it went in, else why not.
func put(i: int, side: String, w: String) -> String:
	var why := problem(i, side, w)
	if why != "":
		return why
	var g := slots(i, side)
	g[g.find(null)] = w
	_r[i] = null
	return ""


## The word in slot `k` of a side of move `i` taken out: its id, or "" if the slot was empty (or is not there).
func take(i: int, side: String, k: int) -> String:
	var g := slots(i, side)
	if k < 0 or k >= g.size() or g[k] == null:
		return ""
	var w: String = g[k]
	g[k] = null
	_r[i] = null
	return w


## The words in front of move `i` (game.ts fronts): what the blow itself carries.
func fronts(i: int) -> Array:
	return front[i].filter(func(w): return w != null)


## The words behind move `i`.
func behinds(i: int) -> Array:
	return behind[i].filter(func(w): return w != null)


## Whether move `i` carries word `w` on either side.
func has(i: int, w: String) -> bool:
	return front[i].has(w) or behind[i].has(w)


## Whether any of his moves carries a word at all.
func any() -> bool:
	for i in 3:
		if not fronts(i).is_empty() or not behinds(i).is_empty():
			return true
	return false


## MOVE `i` WITH ITS WORDS (words.gd resolve; the game's Resolved), as his numbers stand.
func r(i: int) -> Dictionary:
	if _r[i] == null:
		_r[i] = Words.resolve(Words.moves()[i], front[i], behind[i], _d)
	return _r[i]
