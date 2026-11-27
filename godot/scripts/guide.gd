## THE GUIDE for a new player (game.ts guideStep; its words ui/guide.ts guideBanner, as with a mouse and keys): which prompt
## shows now, in the order the game has them:
##   USE    his first word is on a move: what to press, the move's name with its words, and the word's own plain line (for
##          a while after it is put there)
##   FIGHT  in a fight, till each is done: a line for each move open (TAP to STRIKE, TAP + HOLD to SLAM, SWIPE to LUNGE, or with a
##          mouse LEFT CLICK, RIGHT CLICK, SPACE) and, once his life has fallen under 40% with a flask in hand, TAP THE FLASK (Q)
##          to HEAL; each ticked as it is done (game.ts guideRows, updateGuide: `met` once an enemy awake is near him first)
##   SMITH  his first word in hand, whichever it is: put it on Strike (in a fight: when the fight is over)
##   TAKE   a word lying near, before he has set one: walk over it
##   CARRY / RING  the stone in hand: for a few seconds on finding it, and on coming into town with it
##   in town before the ring is lit: MOVE (till 3 tiles walked), then QUEST (talk to the wordsmith), then STAIRS (go down)
##   BODY   the fallen wordsmith in sight and close
##   MOVE   till 3 tiles walked
## The first word's prompts are a new player's lesson: once a word has been set in a move they are over (game.ts endGuide;
## loot.gd `taught`), and a word come by after that is only announced (hud.gd WORD FOUND).
## `point`: what the prompt points at on the screen, an attack's plate (0, 1), the Lunge's button (2) or the flask (3); -1 nothing.
## `gesture`: with a finger, the gesture the prompt asks for, drawn as a ghost where it should be made (main.ts hudIn.gesture;
## touch.gd draws it): {kind: stick|tap|hold|flick, at (game pixels on the screen, a tap's or a hold's), dir (the stick's)}.
##
## THE QUEST'S LINE (ui/guide.ts questBanner; game.ts updateSpeak, questGivers, turnInFor; game/quest_marks.ts), when the
## guide has nothing to say: "Speak to the ARMOURER" the moment he has a quest to give (the ring lit), and "Return to the
## ARMOURER" the moment the furnace is out and as the hero comes into a place with that done; the same for the wordsmith
## and his stone. Under it, where they are (in town) or the way back to them (on a floor). It goes when it has been seen 6 s,
## or they have been seen to. (The rune that floats over the one it names: act1/quest610.gd _Marks.)
extends RefCounted

const Words := preload("res://scripts/words.gd")

const STEPS := 3.0
## (defs.ts GUIDE.sight: the body, or a word on the floor, is pointed out from this far off)
const SIGHT := 9.0
## (ui/guide.ts pressName, with a mouse: what makes the quick attack, the slow one, the evasive move)
const PRESS := ["LEFT CLICK", "HOLD RIGHT CLICK", "SPACE"]
## (ui/guide.ts pressName, with a finger)
const TOUCH_PRESS := ["TAP", "TAP + HOLD", "SWIPE"]

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
var _frame := -1
## THE FIGHT'S LESSON (game.ts newGuide: met, low, quick, slow, evade, flask), kept in the save
var met := false
var low := false
var quick := false
var slow := false
var evade := false
var flask := false
## (defs.ts GUIDE: the flask is pointed out when his life first falls below this share; monsters this near, and awake, are a
## fight; TUNE.aggroRadius + 1.5, an enemy this near and seen: met)
const LOW_LIFE := 0.4
const MET := 9.0 + 1.5
## (ui/guide.ts pressName, with a finger and with a mouse, the flask's)
const FLASK_PRESS := ["Q", "TAP THE FLASK"]
var gesture := {}
## (ui/guide.ts guideAttack) The attack the prompt asks a word onto just now, out of a fight, or -1: a controller's Y opens the
## inventory there.
var ask_at := -1


## The prompt for this moment: {caption, text, sub}, or empty. `seen`: it is on the screen (the boss's bar, or the news of a
## word, may be in its place): the quest's line counts only the time it is seen.
func banner(seen := true) -> Dictionary:
	# (the game's own time, a frame's once however often it is asked in that frame: not the clock on the wall, so that a slow
	# machine or a held game does not run a line's time out unseen)
	var fr := Engine.get_process_frames()
	var dt := 0.0 if fr == _frame else clampf(main.get_process_delta_time(), 0.0, 0.1)
	_frame = fr
	point = -1
	gesture = {}
	ask_at = -1
	# (ENDLESS MODE, NO STORY: on an endless level no lesson, no "Speak to" or "Return to" line, no hunt: game.ts storyHere)
	if main.get("in_endless") == true:
		return {}
	_speak_step()
	_fight_step()
	var b := _lesson()
	if not b.is_empty():
		return b
	if _speak.is_empty():
		# (QUESTS610, F9_LAIRS: the ward-stone's hunt, DEFEAT each boss, when nothing else is to be said: ui/guide.ts huntBanner)
		return main.quest610.hunt_banner(seen and not main.get_tree().paused, dt) if main.quest610 != null else {}
	if seen and not main.get_tree().paused:
		_speak["t"] -= dt
	var who: String = _speak["who"]
	var where: String = main.loot.quest_text["speakWhere"].get(who, "") if main.is_home(main.place) else main.loot.quest_text["speakBack"]
	# (QUESTS1620: the knight-captain, where he stands: quests1620.ts CAPTAIN_WHERE)
	if who == "knight-captain" and main.quest1620 != null:
		where = str(main.quest1620.Q.get("captainWhere", ""))
	return {"caption": "QUEST", "text": "%s the %s" % ["Return to" if _speak["back"] else "Speak to", who.to_upper()], "sub": where}


## The first dungeon's own prompts. (None for a test hero: the game's forTrial makes its Game without a guide.)
func _lesson() -> Dictionary:
	if int(main.get("trial")) > 0 or main.get("practice") == true:
		return {}
	var hero = main.hero
	var loot = main.loot
	var town: bool = main.is_home(main.place)
	var L = hero.loadout
	# (and till the move is used, the armourer's task waiting on it: loot.gd word_tried)
	if (use_t > 0.0 or not loot.word_tried) and (not L.fronts(at).is_empty() or not L.behinds(at).is_empty()):
		# (what the word is doing there, in the word's own plain line)
		var f: Array = L.fronts(at)
		var says: String = Words.word(f[0])["frontText"] if not f.is_empty() else Words.word(L.behinds(at)[0])["behindText"]
		point = at
		# (the word may be on the swipe: the Ranger's first goes on Trap)
		if _touch():
			gesture = {"kind": "flick"} if at == 2 else _on_monster("tap" if at == 0 else "hold")
		return {"caption": "WORDSMITHING", "text": "%s: %s" % [press_name(at), str(L.r(at)["name"]).to_upper()], "sub": says}
	# FIGHT: in a fight, a line for each move open (and the flask once wanted) till each is done
	var fight: bool = not town and main._in_fight()
	var rows := rows_now()
	if fight and rows.any(func(r): return not r["done"]):
		return _fight_banner(rows)
	if loot.lesson():
		var held: String = loot.first_spare()
		var strike: String = str(Words.skill(main.hero.loadout.id(0))["name"]).to_upper()
		if held != "":
			var name: String = str(Words.word(held)["name"]).to_upper()
			if main._in_fight():
				return {"caption": "WORDSMITHING", "text": "You hold a word: %s" % name, "sub": "When the fight is over, it goes on %s." % strike}
			point = 0
			ask_at = 0
			# (with a controller: Y opens the inventory at that attack)
			return {"caption": "WORDSMITHING", "text": "Put %s on %s" % [name, strike], "sub": "Press Y to open your attacks." if _pad() else ("Tap %s at the bottom of the screen." if _touch() else "Click %s at the bottom of the screen.") % strike}
		var lying: String = _word_near(hero.world)
		if lying != "":
			return {"caption": "WORDSMITHING", "text": "A power word: %s" % str(Words.word(lying)["name"]).to_upper(), "sub": "Walk over it to take it."}
	if loot.quest != "":
		if loot.prompt_t > 0.0:
			if town:
				return {"caption": "WORDSMITHING", "text": "Bring the MASTER RUNE-STONE to the wordsmith", "sub": _go_up()}
			return {"caption": "WORDSMITHING", "text": "You carry the MASTER RUNE-STONE", "sub": "Take it to the wordsmith in town."}
		return {}
	if town and not loot.ring_lit:
		if hero.walked < STEPS:
			return _move_banner()
		if loot.quest_given:
			return {"caption": "WORDSMITHING", "text": "Take the STAIRS down", "sub": "Find the fallen wordsmith, and bring back the stone."}
		return {"caption": "WORDSMITHING", "text": "Talk to the WORDSMITH", "sub": _go_up()}
	var b = loot._body
	if not town and b != null and not b["searched"] and b["node"] != null and hero.world.distance_to(b["at"]) < SIGHT and main.sees(hero.world, b["at"]):
		if _touch():
			gesture = {"kind": "tap", "at": (main._touch.to_view(b["at"]) - Vector2(0, 4)).round()}
		return {"caption": "WORDSMITHING", "text": "Someone fell here", "sub": "Walk up to the body to search it, or tap it." if _touch() else "Walk up to the body to search it."}
	if hero.walked < STEPS:
		return _move_banner()
	return {}


## (game.ts updateGuide) What the fight's lesson has seen done, and whether it has begun: a move once used, the flask once drunk
## (loot.gd drink), his life once low with a flask in hand, an enemy awake and near once seen. A test hero has no lessons.
func _fight_step() -> void:
	if int(main.get("trial")) > 0 or main.get("practice") == true or main.loot.taught:
		return
	var h = main.hero
	if h == null:
		return
	quick = quick or int(h.uses[0]) > 0
	slow = slow or int(h.uses[1]) > 0
	evade = evade or int(h.uses[2]) > 0
	if not low and h.life < h.max_life * LOW_LIFE and main.loot.potions > 0:
		low = true
	if not met and main._monsters != null:
		for m in main._monsters.list:
			if is_instance_valid(m) and not m.dead and m.seen and m.world.distance_to(h.world) < MET:
				met = true
				break


## (game.ts guideRows, with FIRST_LEVELS) The lines of the fight's lesson showing, each with whether it is done: only the moves
## open, each as it opens; the flask once wanted.
func rows_now() -> Array:
	if not met or main.loot.taught:
		return []
	var h = main.hero
	var out: Array = [{"id": "quick", "done": quick}]
	if h.move_open(1):
		out.append({"id": "slow", "done": slow})
	if h.move_open(2):
		out.append({"id": "evade", "done": evade})
	if low:
		out.append({"id": "flask", "done": flask})
	return out


## (ui/guide.ts guideBanner 'fight'; main.ts hudIn.gesture) The fight's lesson as the prompt draws it, a line for each; what it
## points at (the dodge, the flask: the newest not done); and with a finger the gesture the next line asks for.
func _fight_banner(rows: Array) -> Dictionary:
	var h = main.hero
	var t: bool = _touch()
	var skills: Array = main._hud._skills() if main._hud != null else []
	var how := {}
	var what := {}
	for i in 3:
		var id: String = ["quick", "slow", "evade"][i]
		how[id] = press_name(i)
		var sk: Dictionary = Words.skill(h.loadout.id(i))
		what[id] = "to %s" % str(sk.get("verb", sk.get("name", ""))).to_upper()
	how["flask"] = "X" if _pad() else (FLASK_PRESS[1] if t else FLASK_PRESS[0])
	what["flask"] = "to HEAL"
	var lines: Array = []
	var open: Array = []
	for r in rows:
		lines.append({"id": r["id"], "how": how[r["id"]], "what": what[r["id"]], "done": r["done"]})
		if not r["done"]:
			open.append(r["id"])
	point = 3 if open.has("flask") else (2 if open.has("evade") else -1)
	if t and not open.is_empty():
		match open[0]:
			"quick":
				gesture = _on_monster("tap")
			"slow":
				gesture = _on_monster("hold")
			"evade":
				gesture = {"kind": "flick"}
	return {"caption": "HOW TO PLAY", "text": "", "sub": "", "lines": lines}


## (main.ts, the 'move' step) The walking thumb's ghost, pushed the way the dungeon goes: toward the nearest enemy (in town, with
## none, a step up and to the right of him), as it lies on the screen.
func _stick_ghost() -> void:
	if not _touch():
		return
	var h = main.hero
	var to: Vector2 = h.world + Vector2(1, -1)
	var best := INF
	if main._monsters != null:
		for m in main._monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) < best:
				best = m.world.distance_to(h.world)
				to = m.world
	gesture = {"kind": "stick", "dir": main._touch.to_view(to) - main._touch.to_view(h.world)}


## (main.ts onMonster) A tap's or a hold's ghost: on the nearest enemy seen if the right thumb can reach it there (the screen's right
## half, clear of its edges); otherwise out on the right, where a tap aims itself. Empty with none seen.
func _on_monster(kind: String) -> Dictionary:
	var h = main.hero
	var near = null
	for m in main._monsters.list:
		if is_instance_valid(m) and not m.dead and m.seen and (near == null or m.world.distance_to(h.world) < near.world.distance_to(h.world)):
			near = m
	if near == null:
		return {}
	var s: Vector2 = main._touch.to_view(near.world) - Vector2(0, 10)
	var v: Vector2 = main._touch.view_size()
	var reach: bool = s.x >= v.x * 0.45 and s.x <= v.x - 12.0 and s.y >= 60.0 and s.y <= v.y - 50.0
	return {"kind": kind, "at": s.round() if reach else Vector2(roundf(v.x * 0.72), roundf(v.y * 0.56))}


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
	# (QUESTS610: the mystic, her ask for the Queen's feather and the feather brought: act1/quest610.gd)
	if main.quest610 != null and main.quest610.mystic_due() != "":
		out.append("mystic")
	# (QUESTS1115: the armourer's clapper, the mystic's jar: act2/quest1115.gd)
	var q11 = main.quest1115
	if q11 != null and q11.clapper_due() != "" and not out.has("armourer"):
		out.append("armourer")
	if q11 != null and q11.jar_due() != "" and not out.has("mystic"):
		out.append("mystic")
	# (QUESTS1620: the armourer's songbird, the stranger's whole court: act3/quest1620.gd)
	var q16 = main.quest1620
	if q16 != null and q16.bird_due() != "" and not out.has("armourer"):
		out.append("armourer")
	if q16 != null and q16.court_due() != "":
		out.append("stranger")
	return out


## Whom the hero brings something back for, or has done something for (game.ts turnInFor), or "".
func _back_now() -> String:
	var loot = main.loot
	if loot.quest != "":
		return "wordsmith"
	if loot.ring_lit and loot.furnace == "out":
		return "armourer"
	if main.quest610 != null and main.quest610.on() and main.quest610.feather == "got":
		return "mystic"
	# (QUESTS1115)
	if main.quest1115 != null and main.quest1115.on():
		if main.quest1115.jar == "got":
			return "mystic"
		if main.quest1115.clapper == "got":
			return "armourer"
	# (QUESTS1620)
	var q16 = main.quest1620
	if q16 != null and q16.on():
		if q16.bird != "mended" and q16.bird_parts == int(q16.Q["bits"]["all"]):
			return "armourer"
		if q16.court_due() == "courtGive":
			return "stranger"
	return ""


## (game.ts updateSpeak, with SPEAK_NEW and SPEAK_RETURN) Whoever has something for him now: the moment one of them is new,
## the line; on coming into town, whoever waits there, what he brings back first; on coming into a floor, what he brings
## back; and the moment he has something to bring back that he had not a moment before.
func _speak_step() -> void:
	var due := _givers_now()
	var back := _back_now()
	var secs: float = main.loot.quest_text["speakSecs"]
	if _place != main.place:
		var who: String = back if back != "" else (due[0] if main.is_home(main.place) and not due.is_empty() else "")
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
	# (QUESTS1620: the knight-captain's line stays while his voice is in hand: game.ts updateSpeak)
	var kept: bool = not _speak.is_empty() and _speak["who"] == "knight-captain" and main.quest1620 != null and main.quest1620.captain_jar == "got" and not main.is_home(main.place)
	if not _speak.is_empty() and (_speak["t"] <= 0.0 or (not due.has(_speak["who"]) and not kept)):
		_speak = {}


## (ui/guide.ts: `touch`) Whether he is playing with fingers.
## (ui/guide.ts pressName, padPress) What makes move `i`: with a controller RT, LT (HOLD LT for one that goes on while held), A;
## with a finger TAP, TAP + HOLD, SWIPE; with a mouse LEFT CLICK, RIGHT CLICK (HOLD RIGHT CLICK), SPACE.
func press_name(i: int) -> String:
	var channel := false
	if i == 1:
		var skills: Array = main._hud._skills() if main._hud != null else []
		channel = skills.size() > 1 and str(skills[1].get("key", "")).begins_with("HOLD")
	if _pad():
		return ["RT", "HOLD LT" if channel else "LT", "A"][i]
	if _touch():
		return TOUCH_PRESS[i]
	return ["LEFT CLICK", "HOLD RIGHT CLICK" if channel else "RIGHT CLICK", "SPACE"][i]


## (ui/guide.ts 'move') The first prompt: how to walk.
func _move_banner() -> Dictionary:
	_stick_ghost()
	if _pad():
		return {"caption": "HOW TO PLAY", "text": "LEFT STICK to MOVE", "sub": "The right stick aims."}
	return {"caption": "HOW TO PLAY", "text": "LEFT THUMB to MOVE" if _touch() else "W A S D to MOVE", "sub": "Put your thumb down anywhere on the left and push." if _touch() else ""}


func _go_up() -> String:
	return "He stands in the ring of stones. Go up to him and press B." if _pad() else ("He stands in the ring of stones. Tap him." if _touch() else "He stands in the ring of stones. Go up to him and press E.")


func _pad() -> bool:
	return main != null and main.pad_live


func _touch() -> bool:
	return main != null and main._touch != null and main._touch.on

