## THE CHECK OF THE START SCREEN (--only=title; title.gd, title_ring.gd; ui/panels.ts drawTitle, drawSmithMenu; main.ts mode
## 'title', pickClass, continueRun), a line a step (OK or WRONG), pictured as it goes:
##   NO HERO SAVED: the screen up over the game held behind it, its theme playing: the ring on the hill, alive; the name over it;
##   along the foot NEW GAME (pink), LEXICON, OPTIONS. The surge: the picture's big moment, its flash over the screen. OPTIONS:
##   SOUND, PROMPTS, BACK, each doing what it says. THE LEXICON over the menu: its pages' tabs, the words found and not, a word's
##   page, the words kept; a tab pressed opens its page; a press outside it closes it. NEW GAME: the class cards over the picture
##   put back into the dark, BACK at their foot; BACK, the menu again.
##   A HERO SAVED: CONTINUE (pink) and its line ("Warrior, level 3, dungeon 2"). NEW GAME, a card, CONFIRM: the warning that the
##   saved hero will be lost, and no one begins; CONFIRM again: the hero picked makes ready, and the run begins with them.
##   CONTINUE: the screen gone, the game going on, "Welcome back. The gate leads to dungeon N."
## AS IN PLAY (--only=title_live, the game saving, in four runs of it as if the app were started again each time): no hero saved, a
## Ranger made and saved; started again, CONTINUE offered for him; a Mage picked over him, warned, picked again: the game begins
## again from its save with the Mage in town, warping in, the Ranger gone; started again, CONTINUE carries the Mage on. Then the
## save is deleted, as the check's own.
## THE LEVEL SELECT (--only=trial, in four runs of the game as it begins again): OPTIONS, LEVEL SELECT: the floors' page, a row
## for each part of the way down; floor 6 pressed: the class cards with no mode, their BACK back to the floors; floor 6 again, the
## Ranger: the game begun again with a test hero on floor 6, the game's own (level, gear, words: assets/loot/trials.json), told so,
## never saved; fallen, he wakes in town a test hero still, from what was kept in memory; the pause panel's "Leave": the game begun
## again with no test hero.
## THE PRACTICE ROOM (--only=practice, in three runs of the game): OPTIONS, PRACTICE ROOM: the class cards with no mode, BACK to the
## options; the Mage: the game begun again in the arena with the game's practice hero (level 10, every word slot open, every word),
## told so; a pack comes up out of its rifts and fights; struck down, he is UP AGAIN at once; what he kills gives no experience;
## three or fewer left, the next pack comes; "Leave": the game begun again with no practice room.
## ABILITIES: COOLDOWNS or MANA (--only=mana; main.ts flipLimit, defs.ts MANA_MODE, game/words.ts resolveSkill, game.ts useSkill,
## manaToBegin, updateChannel, endChannel, useEvasive, noMana; ui/hud.ts, render.ts): the switch on the start screen's options and
## the pause panel; mana the limit, each move that waits costs mana (its listed mana x1.4, less what would have shortened its wait;
## the evasive move 6) and needs only a moment between uses; the Warrior's Whirlwind refused without the mana to begin it ("No
## mana"), going on while he has it, paid as it goes; the Lunge paid for; a roll one charge; the HUD's mana globe; back to cooldowns.
## A line a thing; then the sum, TITLE.
extends RefCounted

## (title_live: which run of the app this is)
static var stage := 0

const Save := preload("res://scripts/save.gd")

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var shot := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("TITLE %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/t%02d_%s.png" % [dir, shot, name])


func _frames(k: int) -> void:
	for i in k:
		await M.get_tree().process_frame


## The middle of the start screen's button `id`, game pixels (null: none such).
func _at(ts, id: String):
	var items: Array = ts._items()
	var L: Dictionary = ts.layout()
	for i in items.size():
		if items[i][0] == id:
			return (L["rects"][i] as Rect2).get_center()
	return null


func _press(ts, id: String) -> bool:
	var p = _at(ts, id)
	if p == null:
		return false
	ts.press_at(p)
	await _frames(3)
	return true


func _ids(ts) -> Array:
	return ts._items().map(func(m): return m[0])


## The class cards' card for `cls`, its middle; and CONFIRM's.
func _card(cc, cls: String) -> Vector2:
	var L: Dictionary = cc._layout()
	return (L["cards"][(cc.K["order"] as Array).find(cls)] as Rect2).get_center()


func _confirm(cc) -> Vector2:
	return (cc._layout()["confirm"] as Rect2).get_center()


## Waits for a hero picked on the cards to make ready and the run to begin (the start screen gone).
func _begun(secs: float) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += 1.0 / 60.0
		if M._title == null:
			return true
	return false


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	var loot = M.loot
	# NO HERO SAVED: the screen up
	var ts = M.title_up(M.place)
	ts.pointer = Vector2(-50, -50)
	await M._wait(0.6)
	await _snap("menu_new_game")
	var L: Dictionary = ts.layout()
	_line(M.get_tree().paused and _ids(ts) == ["new", "lexicon", "options"] and ts._items()[0][4] and M.music.title_playing(),
		"no hero saved: the screen up over the game held behind it (%s), its theme playing (%s); along the foot %s, NEW GAME the pink one" % [M.get_tree().paused, M.music.title_playing(), ", ".join(ts._items().map(func(m): return m[1]))])
	var R: Dictionary = ts.K["ring"]
	# (sideways at the picture's own lift; upright, higher, a column of buttons under it: smithLayout)
	_line(ts._pic.position == Vector2(L["ox"], L["oy"]) * 2.0 and float(L["oy"]) == ts._H() - float(L["lift"]) - float(R["lip"]) and (ts._W() < 400.0 or float(L["lift"]) == float(R["lift"])),
		"the ring on the hill where smithLayout puts it: its foot's row %d above the screen's foot (at %s, game pixels); the name at row %d, %d times its size" % [L["lift"], Vector2(L["ox"], L["oy"]), L["nameY"], L["big"]])
	# (the surge: the first SURGE_FIRST seconds in, its light up the column; its flash as it breaks into the sky)
	var S: Dictionary = ts._pic.D["surge"]
	while ts.t < float(S["first"]) + float(S["up"]) + 0.05:
		await M.get_tree().process_frame
	await _snap("the_surge")
	var fl: Array = ts._pic.flash(ts.t)
	_line(float(fl[1]) > 0.0, "the surge, %.2f s in: the column's light broken into the sky, a flash over the whole screen (%.3f)" % [ts.t, fl[1]])
	# OPTIONS
	await _press(ts, "options")
	await _snap("options")
	_line(ts.page == "options" and _ids(ts) == ["mute", "limit", "guide", "practice", "floors", "back"], "OPTIONS: %s" % ", ".join(ts._items().map(func(m): return m[1])))
	var taught0: bool = loot.taught
	await _press(ts, "guide")
	var flipped: bool = loot.taught != taught0
	await _press(ts, "guide")
	var muted0 := AudioServer.is_bus_mute(0)
	await _press(ts, "mute")
	var muted: bool = AudioServer.is_bus_mute(0) != muted0
	await _press(ts, "mute")
	_line(flipped and loot.taught == taught0 and muted and AudioServer.is_bus_mute(0) == muted0, "PROMPTS pressed turns the first dungeon's prompts off and on again; SOUND, the sound")
	await _press(ts, "back")
	_line(ts.page == "menu", "BACK: the menu again")
	# THE LEXICON: two words found (POWER known in front, FIRE in front and behind), POWER kept twice in the book
	var known0: Dictionary = loot.known.duplicate(true)
	var lex0: Dictionary = loot.lexicon.duplicate()
	loot._know("power")["found"] = true
	loot._know("power")["front"] = true
	loot._know("fire")["found"] = true
	loot._know("fire")["front"] = true
	loot._know("fire")["behind"] = true
	loot._know("frost")["found"] = false
	loot.lexicon["power"] = 2
	await _press(ts, "lexicon")
	await _frames(2)
	await _snap("lexicon")
	var LL: Dictionary = ts._lex_layout()
	_line(ts.lex_open and LL["open"] == "power" and (LL["chips"] as Array).size() == 1 and int(LL["at"]) == 0,
		"LEXICON: over the menu, %d of %d words found; its %d tabs, the first page open at POWER, its page written; POWER kept, x2" % [(LL["found"] as Array).size(), (LL["ids"] as Array).size(), (LL["tabs"] as Array).size()])
	ts.press_at((LL["tabs"][2] as Rect2).get_center())
	await _frames(3)
	await _snap("lexicon_page_3")
	var L3: Dictionary = ts._lex_layout()
	_line(int(L3["at"]) == 2, "a tab pressed: its page, %s (%s)" % [L3["pages"][2]["name"], ", ".join(L3["pages"][2]["words"])])
	# (upright it fills the screen: its close button)
	ts.press_at((ts._lex_layout()["close"] as Rect2).get_center() if ts._W() < 400.0 else Vector2(4, 4))
	await _frames(3)
	_line(not ts.lex_open, "a press outside it (upright, on its close button) closes it")
	loot.known = known0
	loot.lexicon = lex0
	# NEW GAME: the class cards, BACK
	await _press(ts, "new")
	await M._wait(0.6)
	await _snap("new_game_cards")
	var cc = ts.cards
	_line(cc != null and cc.over_pic and ts.page == "class", "NEW GAME: the class cards over the living picture put back into the dark, BACK at their foot's left")
	cc.press_at((cc._layout()["back"] as Rect2).get_center())
	await _frames(3)
	_line(ts.cards == null and ts.page == "menu", "their BACK: the menu again")
	# A HERO SAVED (as the screen is told of him): CONTINUE and its line
	ts.resume = "Warrior, level 3, dungeon 2"
	ts.saved_cls = "warrior"
	await _frames(2)
	await _snap("menu_continue")
	_line(_ids(ts) == ["resume", "new", "lexicon", "options"] and ts._items()[0][4] and not ts._items()[1][4],
		"a hero saved: %s, CONTINUE the pink one, its line over it: \"%s\"" % [", ".join(ts._items().map(func(m): return m[1])), ts.resume])
	await _press(ts, "new")
	await M._wait(0.3)
	cc = ts.cards
	cc.press_at(_card(cc, "mage"))
	await _frames(3)
	cc.press_at(_confirm(cc))
	await _frames(3)
	await _snap("confirm_warning")
	_line(cc.entering.is_empty() and cc.note.begins_with("Press CONFIRM again to start over. Your saved Warrior will be lost."), "the Mage chosen, CONFIRM: no one begins; the warning: \"%s\"" % cc.note)
	cc.press_at(_confirm(cc))
	await _frames(3)
	_line(not cc.entering.is_empty() and cc.entering["cls"] == "mage", "CONFIRM again: the Mage makes ready on his card")
	var begun: bool = await _begun(4.0)
	await M._wait(0.4)
	await _snap("mage_begins")
	_line(begun and M.hero.cls == "mage" and not M.get_tree().paused and not M.music.title_playing(), "the run begun with the Mage, warping in; the game going on, the theme let go of")
	# CONTINUE
	ts = M.title_up(M.place)
	ts.resume = "Mage, level 1, dungeon 1"
	ts.saved_cls = "mage"
	await _frames(3)
	await _press(ts, "resume")
	await _frames(2)
	var said: String = str(loot.msgs.back()["text"]) if not loot.msgs.is_empty() else ""
	_line(M._title == null and not M.get_tree().paused and said.begins_with("Welcome back. The gate leads to dungeon"), "CONTINUE: the screen gone, the game going on: \"%s\"" % said)
	print("TITLE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## AS IN PLAY: the game saving, begun again (as the app is started again) between the steps.
func live(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	shot = 10 + stage * 2
	n = stage * 10
	await _frames(10)
	var ts = M._title.get_child(0) if M._title != null else null
	match stage:
		0:
			_line(ts != null and ts.resume == "", "as in play, no hero saved: the start screen first, nothing to continue")
			await _press(ts, "new")
			await M._wait(0.3)
			var cc = ts.cards
			cc.press_at(_card(cc, "ranger"))
			await _frames(3)
			cc.press_at(_confirm(cc))
			var begun: bool = await _begun(4.0)
			await M._wait(0.3)
			var file := Save.read()
			_line(begun and M.hero.cls == "ranger" and file.get("run") is Dictionary and file["run"]["cls"] == "ranger", "a Ranger picked and confirmed: the run begun with him, and saved")
			stage = 1
			M.get_tree().reload_current_scene()
		1:
			await _snap("live_continue_offered")
			_line(ts != null and ts.resume.begins_with("Ranger, level 1, dungeon 1") and ts.saved_cls == "ranger", "begun again: CONTINUE offered for him: \"%s\"" % (ts.resume if ts != null else ""))
			M.loot.lexicon["fire"] = 1
			await _press(ts, "new")
			await M._wait(0.3)
			var cc = ts.cards
			cc.press_at(_card(cc, "mage"))
			await _frames(3)
			cc.press_at(_confirm(cc))
			await _frames(3)
			var warned: bool = cc.note != "" and cc.entering.is_empty()
			cc.press_at(_confirm(cc))
			await _frames(3)
			_line(warned and not cc.entering.is_empty(), "a Mage over him: warned first; CONFIRM again, he makes ready")
			stage = 2
			# (as he warps away, the game begins again from its save)
		2:
			await M._wait(0.5)
			await _snap("live_new_mage")
			var file := Save.read()
			_line(M._title == null and M.hero.cls == "mage" and M.is_home(M.place) and file.get("run") is Dictionary and file["run"]["cls"] == "mage",
				"the game begun again from its save with the Mage in %s, warping in, no start screen; the save his (%s)" % [M.place, file.get("run", {}).get("cls", "none")])
			_line(int(M.loot.lexicon.get("fire", 0)) == 1 and file.get("meta") is Dictionary and int(file["meta"]["lexicon"].get("fire", 0)) == 1,
				"the Lexicon kept (FIRE, put in the book before, still there), and the stash")
			stage = 3
			M.get_tree().reload_current_scene()
		3:
			_line(ts != null and ts.resume.begins_with("Mage, level 1"), "begun again: CONTINUE offered for the Mage: \"%s\"" % (ts.resume if ts != null else ""))
			await _press(ts, "resume")
			await _frames(3)
			await _snap("live_continued")
			_line(M._title == null and M.hero.cls == "mage" and not M.get_tree().paused, "CONTINUE: the Mage carries on from his town")
			DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.PATH))
			print("TITLE LIVE: done")
			M.get_tree().quit()


## THE LEVEL SELECT, as it is played: the game begun again between the steps.
func trial_run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	shot = 20 + stage * 2
	n = 40 + stage * 10
	await _frames(10)
	match stage:
		0:
			var ts = M.title_up(M.place)
			ts.pointer = Vector2(-50, -50)
			await _frames(3)
			await _press(ts, "options")
			await _press(ts, "floors")
			await _frames(2)
			await _snap("level_select")
			var L: Dictionary = ts._floors_layout()
			_line(ts.page == "floors" and (L["floors"] as Array).size() == ts._last_floor() and (L["heads"] as Array).size() == 4,
				"OPTIONS, LEVEL SELECT: the floors' page, %d floors in %d rows (%s)" % [(L["floors"] as Array).size(), (L["heads"] as Array).size(), ", ".join((L["heads"] as Array).map(func(x): return x[0]))])
			var six: Vector2 = (L["floors"][5][1] as Rect2).get_center()
			ts.press_at(six)
			await M._wait(0.4)
			await _snap("test_hero_cards")
			var cc = ts.cards
			_line(cc != null and cc.no_mode and ts.trial == 6, "floor 6 pressed: the class cards for a test hero there, with no mode")
			cc.press_at((cc._layout()["back"] as Rect2).get_center())
			await _frames(3)
			_line(ts.cards == null and ts.page == "floors", "their BACK: the floors again")
			ts.press_at(six)
			await M._wait(0.3)
			cc = ts.cards
			cc.press_at(_card(cc, "ranger"))
			await _frames(3)
			stage = 1
			cc.press_at(_confirm(cc))
			# (he makes ready and warps away; the game begins again with him)
		1:
			await M._wait(0.6)
			await _snap("test_hero_floor6")
			var T: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/loot/trials.json"))["trials"]["ranger"]["6"]
			var worn: int = M.loot.gear.values().filter(func(it): return it is Dictionary).size()
			var said: bool = M.loot.msgs.any(func(m): return str(m["text"]).begins_with("Test hero, level %d. Not saved." % int(T["level"])))
			_line(M.trial == 6 and M.place == "floor6" and M.hero.cls == "ranger" and M.loot.level == int(T["level"]) and worn == 10 and M.loot.ring_lit and not M.saving and said,
				"the game begun again with a test hero on floor 6: a Ranger, level %d, %d pieces worn, the ring lit, %d words in his pouch; told so; not saved (%s)" % [M.loot.level, worn, M.loot.words.size(), not M.saving])
			M.hero.life = 0.0
			M.hero._fall()
			var t := 0.0
			while t < 4.0 and M._mini.open != "death":
				await M.get_tree().process_frame
				t += 1.0 / 60.0
			_line(M._mini.open == "death" and M.death_info()["title"] == "YOU FELL" and not M.trial_file.is_empty(), "fallen: YOU FELL; as he will wake kept in memory, not in the save")
			stage = 2
			M._mini._press("death")
		2:
			await M._wait(0.6)
			await _snap("test_hero_woke")
			_line(M.trial == 6 and M.is_home(M.place) and M.hero.alive and M.hero.cls == "ranger" and M._title == null and not M.saving,
				"he wakes in %s, a test hero still (floor %d), never saved" % [M.place, M.trial])
			M._mini.show_panel("pause")
			await _frames(3)
			await _snap("test_hero_pause")
			var quit: Array = M._mini._hits.filter(func(x): return x[1] == "quit")
			_line(not quit.is_empty(), "paused: its third button, \"Leave\"")
			stage = 3
			M._mini._press("quit")
		3:
			_line(M.trial == 0 and M.trial_file.is_empty(), "Leave: the game begun again, no test hero")
			print("TITLE TRIAL: done")
			M.get_tree().quit()


## THE PRACTICE ROOM, as it is played: the game begun again between the steps.
func practice_check(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	shot = 30 + stage * 3
	n = 80 + stage * 10
	await _frames(10)
	match stage:
		0:
			var ts = M.title_up(M.place)
			ts.pointer = Vector2(-50, -50)
			await _frames(3)
			await _press(ts, "options")
			await _snap("options_all")
			_line(ts._items().map(func(m): return m[0]) == ["mute", "limit", "guide", "practice", "floors", "back"], "OPTIONS: %s" % ", ".join(ts._items().map(func(m): return m[1])))
			await _press(ts, "practice")
			await M._wait(0.3)
			var cc = ts.cards
			_line(cc != null and cc.no_mode and ts.practice, "PRACTICE ROOM: the class cards, with no mode")
			cc.press_at((cc._layout()["back"] as Rect2).get_center())
			await _frames(3)
			_line(ts.cards == null and ts.page == "options", "their BACK: the options again")
			await _press(ts, "practice")
			await M._wait(0.3)
			cc = ts.cards
			cc.press_at(_card(cc, "mage"))
			await _frames(3)
			stage = 1
			cc.press_at(_confirm(cc))
		1:
			var L = M.hero.loadout
			var all: Array = preload("res://scripts/words.gd").socket_count(999)
			var told: bool = M.loot.msgs.any(func(m): return str(m["text"]).begins_with("Practice room. Every word is yours"))
			_line(M.practice and M.place == "practice" and M.hero.cls == "mage" and M.loot.level == 10 and L.front[0].size() == int(all[0]) and L.behind[0].size() == int(all[1]) and M.loot.words.size() >= 28 and told and not M.saving,
				"the game begun again in the arena with the practice hero: a Mage, level 10, every slot open (%d in front, %d behind), %d words; told so; not saved" % [L.front[0].size(), L.behind[0].size(), M.loot.words.size()])
			var pr = null
			for c in M._place.get_children():
				if c.get_script() == preload("res://scripts/practice.gd"):
					pr = c
			var t := 0.0
			while t < 4.0 and (pr == null or pr._risers.is_empty() or float(pr._risers[0]["t"]) < 0.5):
				await M.get_tree().process_frame
				t += 1.0 / 60.0
			await _snap("practice_pack_rising")
			_line(pr != null and not pr._risers.is_empty(), "%.1f s in: a pack of %d coming up out of its rifts, %.1f to %.1f tiles from him" % [t, pr._risers.size() if pr != null else 0,
				pr._risers.map(func(r): return r["at"].distance_to(M.hero.world)).min() if pr != null and not pr._risers.is_empty() else 0.0, pr._risers.map(func(r): return r["at"].distance_to(M.hero.world)).max() if pr != null and not pr._risers.is_empty() else 0.0])
			t = 0.0
			while t < 4.0 and not pr._risers.is_empty():
				await M.get_tree().process_frame
				t += 1.0 / 60.0
			await M._wait(0.8)
			await _snap("practice_fight")
			var live: Array = M._monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead)
			_line(live.size() == 6 and live.all(func(m): return m.state != "sleep"), "the pack up, all six awake and coming: %s" % ", ".join(live.map(func(m): return m.kind)))
			M.hero.unhurt = false
			M.hero.life = 0.0
			M.hero._fall()
			await _frames(2)
			_line(M.hero.alive and M.hero.life == M.hero.max_life and M.hero._invuln > 1.0, "struck down: UP AGAIN at once, his life full (%d), a moment untouchable" % M.hero.life)
			var xp0: float = M.loot.xp
			var lv0: int = M.loot.level
			for m in live.slice(0, 4):
				m.damage(float(m.life) + 1000.0)
			await M._wait(0.3)
			_line(M.loot.xp == xp0 and M.loot.level == lv0, "four of them killed: no experience (%s)" % M.loot.xp)
			t = 0.0
			while t < 5.0 and pr._risers.is_empty():
				await M.get_tree().process_frame
				t += 1.0 / 60.0
			_line(not pr._risers.is_empty(), "two left: %.1f s later the next pack comes" % t)
			stage = 2
			M._mini._press("quit")
		2:
			_line(not M.practice and M.place != "practice", "\"Leave\": the game begun again, no practice room")
			print("TITLE PRACTICE: done")
			M.get_tree().quit()


## ABILITIES: COOLDOWNS or MANA, in shot mode on floor 1.
func mana_check(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	shot = 50
	n = 110
	var loot = M.loot
	await M._wait(0.5)
	var ts = M.title_up(M.place)
	ts.pointer = Vector2(-50, -50)
	await _frames(3)
	await _press(ts, "options")
	await _press(ts, "limit")
	await _frames(2)
	await _snap("options_mana")
	_line(loot.limit == "mana" and ts._items()[1][1] == "ABILITIES: MANA" and ts._items()[1][2] == "No cooldowns: use them until you run dry",
		"OPTIONS: ABILITIES pressed: %s, \"%s\"" % [ts._items()[1][1], ts._items()[1][2]])
	M._title_down()
	await _frames(3)
	var L = h.loadout
	var cdr: float = float(h.stats["cdr"])
	var MM: Dictionary = preload("res://scripts/words.gd").data()["manaMode"]
	var wm := floori(16.0 * float(MM["cost"]) * (1.0 - cdr) + 0.5)
	var lm := floori(float(MM["evade"]) * (1.0 - cdr) + 0.5)
	_line(int(L.r(1)["mana"]) == wm and is_equal_approx(float(L.r(1)["cooldown"]), float(MM["recover"])) and int(L.r(2)["mana"]) == lm and is_equal_approx(float(L.r(2)["cooldown"]), float(MM["evadeRecover"])),
		"the Warrior's Whirlwind costs %d mana (16 x 1.4, less his %.1f%% recovery), a moment of %.1f s between uses; his Lunge %d, %.1f s" % [L.r(1)["mana"], cdr * 100.0, L.r(1)["cooldown"], L.r(2)["mana"], L.r(2)["cooldown"]])
	var int_: float = float(loot.attrs["int"])
	_line(h.max_mana >= 40.0 + int_ * 3.0 - 0.5, "his mana: %d (a base of 40 and three for each of his %d Intelligence, and his gear's)" % [h.max_mana, int_])
	# (without the mana to begin it, his Whirlwind is refused)
	h.mana = 1.0
	h.auto_whirl = true
	await _frames(3)
	var refused: bool = h._act != "whirl" and h._deny_t > 0.0
	h.auto_whirl = false
	await _frames(2)
	_line(refused, "with 1 mana the Whirlwind is refused: \"No mana\"")
	h.mana = h.max_mana
	h.auto_whirl = true
	var t := 0.0
	while t < 1.2:
		await M.get_tree().process_frame
		t += 1.0 / 60.0
	var spinning: bool = h._act == "whirl" and h.mana < h.max_mana - 1.0
	await _snap("mana_hud_whirl")
	h.auto_whirl = false
	t = 0.0
	while t < 1.5 and h._act == "whirl":
		await M.get_tree().process_frame
		t += 1.0 / 60.0
	_line(spinning and is_equal_approx(h._whirl_full, float(MM["recover"])), "with mana it spins, paid as it goes (%d left); let go, it waits only %.1f s" % [h.mana, h._whirl_full])
	var m0: float = h.mana
	h.auto_lunge = h.world + h.face * 3.0
	await _frames(4)
	_line(absf((m0 - h.mana) - float(lm)) < 2.0, "the Lunge: %d mana paid" % roundi(m0 - h.mana))
	await M._wait(0.6)
	M._mini.show_panel("pause")
	await _frames(3)
	await _snap("pause_abilities")
	var row: Array = M._mini._hits.filter(func(x): return x[1] == "limit")
	_line(not row.is_empty(), "the pause panel: ABILITIES: MANA over its three buttons")
	M._mini.show_panel("")
	await _frames(3)
	# (the gear's wording under the limit: a piece with Max Mana built in, and SWIFT's page in the Lexicon)
	var items: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/loot/items.json"))
	var piece = null
	for it in items["pools"]["1"]:
		if it.get("implicitMana") is Array:
			piece = it
			break
	var page: Dictionary = preload("res://scripts/words.gd").data()["page"]["swift"]
	var said_mana: Array = loot.lines_of(piece, "implicit")
	var gear_mana: Array = page["gearMana"]
	_line(piece != null and str(said_mana[0]).ends_with("Max Mana") and str(gear_mana.back()).contains("Mana Cost"),
		"a %s reads \"%s\" (with cooldowns, \"%s\"); SWIFT on gear: \"%s\"" % [piece["name"], said_mana[0], piece["implicit"][0], gear_mana.back()])
	# (a Ranger: his roll one charge while mana is the limit, two with cooldowns)
	M.set_class("ranger", true)
	await _frames(3)
	var one: int = h.kit.max_charges[2]
	M.flip_limit()
	await _frames(2)
	var two: int = h.kit.max_charges[2]
	_line(one == 1 and two == 2 and loot.limit == "cooldown", "a Ranger's roll: %d charge with mana the limit, %d with cooldowns (the switch pressed again)" % [one, two])
	print("TITLE MANA: done")
	M.get_tree().quit()

