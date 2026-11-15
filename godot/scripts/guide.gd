## THE GUIDE for a new player (game.ts guideStep; its words ui/guide.ts guideBanner, as with a mouse and keys): which prompt
## shows now, in the order the game has them:
##   USE    his first word is on a move: what to press, the move's name with its words, and the word's own plain line (for
##          a while after it is put there)
##   SMITH  his first word in hand, whichever it is: put it on Strike (in a fight: when the fight is over)
##   TAKE   a word lying near, before he has set one: walk over it
##   CARRY / RING  the stone in hand: for a few seconds on finding it, and on coming into town with it
##   in town before the ring is lit: MOVE (till 3 tiles walked), then QUEST (talk to the wordsmith), then STAIRS (go down)
##   BODY   the fallen wordsmith in sight and close
##   MOVE   till 3 tiles walked
## The first word's prompts are a new player's lesson: once a word has been set in a move they are over (game.ts endGuide;
## loot.gd `taught`), and a word come by after that is only announced (hud.gd WORD FOUND).
## `point`: what the prompt points at on the screen, an attack's plate (0, 1) or the Lunge's button (2); -1 nothing.
##
## THE QUEST'S LINE (ui/guide.ts questBanner; game.ts updateSpeak, questGivers, turnInFor; game/quest_marks.ts), when the
## guide has nothing to say: "Speak to the ARMOURER" the moment he has a quest to give (the ring lit), and "Return to the
## ARMOURER" the moment the furnace is out and as the hero comes into a place with that done; the same for the wordsmith
## and his stone. Under it, where they are (in town) or the way back to them (on a floor). It goes when it has been seen 6 s,
## or they have been seen to. (The rune that floats over the one it names is the game's art, not brought over.)
extends RefCounted

const Words := preload("res://scripts/words.gd")

const STEPS := 3.0
## (defs.ts GUIDE.sight: the body, or a word on the floor, is pointed out from this far off)
const SIGHT := 9.0
## (ui/guide.ts pressName, with a mouse: what makes the quick attack, the slow one, the evasive move)
const PRESS := ["LEFT CLICK", "HOLD RIGHT CLICK", "SPACE"]

var main  # main.gd
var use_t := 0.0
## (game.ts guide.set: the move his word was last set on, the one the USE prompt is about)
var at := 0
var point := -1
## (the quest's line: who it names, how long it has yet to be seen, whether it says "Return to"; who had something for him
## a moment ago, whom he was bringing something back for, and the place he was in)
var _speak := {}
var _givers: Array = []
var _back := ""
var _place := ""
var _clock := 0.0


## The prompt for this moment: {caption, text, sub}, or empty. `seen`: it is on the screen (the boss's bar, or the news of a
## word, may be in its place): the quest's line counts only the time it is seen.
func banner(seen := true) -> Dictionary:
	var now := Time.get_ticks_msec() / 1000.0
	var dt := clampf(now - _clock, 0.0, 0.1)
	_clock = now
	point = -1
	_speak_step()
	var b := _lesson()
	if not b.is_empty():
		return b
	if _speak.is_empty():
		return {}
	if seen and not main.get_tree().paused:
		_speak["t"] -= dt
	var who: String = _speak["who"]
	var where: String = main.loot.quest_text["speakWhere"].get(who, "") if main.place == "town" else main.loot.quest_text["speakBack"]
	return {"caption": "QUEST", "text": "%s the %s" % ["Return to" if _speak["back"] else "Speak to", who.to_upper()], "sub": where}


## The first dungeon's own prompts.
func _lesson() -> Dictionary:
	var hero = main.hero
	var loot = main.loot
	var town: bool = main.place == "town"
	var L = hero.loadout
	if use_t > 0.0 and (not L.fronts(at).is_empty() or not L.behinds(at).is_empty()):
		# (what the word is doing there, in the word's own plain line)
		var f: Array = L.fronts(at)
		var says: String = Words.word(f[0])["frontText"] if not f.is_empty() else Words.word(L.behinds(at)[0])["behindText"]
		point = at
		return {"caption": "WORDSMITHING", "text": "%s: %s" % [PRESS[at], str(L.r(at)["name"]).to_upper()], "sub": says}
	if loot.lesson():
		var held: String = loot.first_spare()
		var strike: String = str(Words.skill(Words.moves()[0])["name"]).to_upper()
		if held != "":
			var name: String = str(Words.word(held)["name"]).to_upper()
			if main._in_fight():
				return {"caption": "WORDSMITHING", "text": "You hold a word: %s" % name, "sub": "When the fight is over, it goes on %s." % strike}
			point = 0
			return {"caption": "WORDSMITHING", "text": "Put %s on %s" % [name, strike], "sub": "Click %s at the bottom of the screen." % strike}
		var lying: String = _word_near(hero.world)
		if lying != "":
			return {"caption": "WORDSMITHING", "text": "A power word: %s" % str(Words.word(lying)["name"]).to_upper(), "sub": "Walk over it to take it."}
	if loot.quest != "":
		if loot.prompt_t > 0.0:
			if town:
				return {"caption": "WORDSMITHING", "text": "Bring the MASTER RUNE-STONE to the wordsmith", "sub": "He stands in the ring of stones. Go up to him and press E."}
			return {"caption": "WORDSMITHING", "text": "You carry the MASTER RUNE-STONE", "sub": "Take it to the wordsmith in town."}
		return {}
	if town and not loot.ring_lit:
		if hero.walked < STEPS:
			return {"caption": "HOW TO PLAY", "text": "W A S D to MOVE", "sub": ""}
		if loot.quest_given:
			return {"caption": "WORDSMITHING", "text": "Take the STAIRS down", "sub": "Find the fallen wordsmith, and bring back the stone."}
		return {"caption": "WORDSMITHING", "text": "Talk to the WORDSMITH", "sub": "He stands in the ring of stones. Go up to him and press E."}
	var b = loot._body
	if not town and b != null and not b["searched"] and b["node"] != null and hero.world.distance_to(b["at"]) < SIGHT and main.sees(hero.world, b["at"]):
		return {"caption": "WORDSMITHING", "text": "Someone fell here", "sub": "Walk up to the body to search it."}
	if hero.walked < STEPS:
		return {"caption": "HOW TO PLAY", "text": "W A S D to MOVE", "sub": ""}
	return {}


## The word lying nearest him on the floor, within sight (ui/guide.ts guideWord), or "".
func _word_near(from: Vector2) -> String:
	var best := ""
	var best_d := SIGHT
	for d in main.loot._drops:
		if d["kind"] == "word" and d["at"].distance_to(from) < best_d:
			best_d = d["at"].distance_to(from)
			best = d["word"]
	return best


## Who in town has a quest for this hero now, to give it or to take what it asked for (game.ts questGivers): the wordsmith
## (his first quest; the stone), the armourer (the furnace; its reward).
func _givers_now() -> Array:
	var loot = main.loot
	var out: Array = []
	if loot.quest != "" or (not loot.ring_lit and not loot.quest_given):
		out.append("wordsmith")
	if loot.armourer_due() != "":
		out.append("armourer")
	return out


## Whom the hero brings something back for, or has done something for (game.ts turnInFor), or "".
func _back_now() -> String:
	var loot = main.loot
	if loot.quest != "":
		return "wordsmith"
	if loot.ring_lit and loot.furnace == "out":
		return "armourer"
	return ""


## (game.ts updateSpeak, with SPEAK_NEW and SPEAK_RETURN) Whoever has something for him now: the moment one of them is new,
## the line; on coming into town, whoever waits there, what he brings back first; on coming into a floor, what he brings
## back; and the moment he has something to bring back that he had not a moment before.
func _speak_step() -> void:
	var due := _givers_now()
	var back := _back_now()
	var secs: float = main.loot.quest_text["speakSecs"]
	if _place != main.place:
		var who: String = back if back != "" else (due[0] if main.place == "town" and not due.is_empty() else "")
		if who != "":
			_speak = {"who": who, "t": secs, "back": who == back}
	elif back != "" and back != _back:
		_speak = {"who": back, "t": secs, "back": true}
	else:
		for w in due:
			if not _givers.has(w):
				_speak = {"who": w, "t": secs, "back": w == back}
				break
	_givers = due
	_back = back
	_place = main.place
	if not _speak.is_empty() and (_speak["t"] <= 0.0 or not due.has(_speak["who"])):
		_speak = {}
