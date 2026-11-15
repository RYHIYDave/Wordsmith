## THE GUIDE for a new player (game.ts guideStep; its words ui/guide.ts guideBanner, as on a keyboard): which prompt shows
## now, in the order the game has them:
##   USE    the word is on Strike: what to press, and the word's own plain line (for a while after it is put there)
##   SMITH  a word in hand: put it on Strike
##   CARRY / RING  the stone in hand: for a few seconds on finding it, and on coming into town with it
##   in town before the ring is lit: MOVE (till 3 tiles walked), then QUEST (talk to the wordsmith), then STAIRS (go down)
##   BODY   on floor 1, the fallen wordsmith in sight and close
##   MOVE   till 3 tiles walked
extends RefCounted

const STEPS := 3.0
const SIGHT := 8.0

var main  # main.gd
var use_t := 0.0


func banner() -> Dictionary:
	var hero = main.hero
	var loot = main.loot
	var town: bool = main.place == "town"
	if hero.strike_words["front"] != "" or hero.strike_words["behind"] != "":
		if use_t > 0.0:
			var line: String = loot.power_text["frontText"] if hero.strike_words["front"] == "power" else loot.power_text["behindText"]
			return {"caption": "WORDSMITHING", "text": "LEFT BUTTON: POWER STRIKE", "sub": line}
	elif loot.words.get("power", 0) > 0:
		# (the game: "Click STRIKE at the bottom of the screen."; here the word goes on from the gear screen)
		return {"caption": "WORDSMITHING", "text": "Put POWER on STRIKE", "sub": "Press I, then click STRIKE's FRONT slot."}
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
