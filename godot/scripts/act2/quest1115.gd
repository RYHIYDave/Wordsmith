## THE QUEST LINE OF FLOORS 11 TO 15 (game/quests1115.ts QUESTS1115, PAGES, CLAPPER_REWARD, QUEST1115_TEXT; game.ts jarDue,
## clapperDue, handIn1115, campBellHung, layOut, laidOutAgain, pickTaken, wantsPage, dropPage, pageBossDown, questThingTaken,
## quests1115Made, jarTick, pageReady, layPage; render.ts the camp's bell, the quest drops), as the game has it. What the hero has
## done of it is his, and outlasts the place (save.gd).
##   THE UNSTRUCK PAGES (the mystic):
##   1. HER ASK ("Mystic: a task"), once floor 11 is cleared: the Crier's voice, bottled by the Silent Order.
##   2. THE JAR in the Rat King's nest, floor 12 (the layout's `jar`): walked up to within 1.2 tiles, it is his, asked for or not
##      ("You take the CRIER'S VOICE."); gone from the nest (the look's state `jar<i>`) and its tile free.
##   3. THE JAR BROUGHT ("Mystic: the Crier's voice"): she uncorks it, and the Crier tells of the three pages; her reward, one of the
##      city's five words at random (the main chat's pick).
##   4. THE PAGES, the jar brought, each once: the last of floor 13's pair to fall drops the oldest; the Physician (14) a page of
##      his ledger; the third lies chained in the library's stacks (15), the side area furthest from where he comes in. Walked to,
##      taken ("UNSTRUCK PAGE (k of 3).").
##   5. IN THE CENSOR'S FIGHT, with 4 or more tiles under his ink and a page in hand, E lays it down ("E: Unstruck page: wipe away
##      the ink (n left)") and ALL HIS INK ON THE FLOOR DRIES AWAY AT ONCE (act2/censor.gd dry_all), the friend's cyan ringing out
##      from him as a bell's ring does. A page laid is spent for that floor; come again, he has them all again.
##   THE STOLEN CLAPPER (the armourer):
##   1. HIS ASK ("Armourer: a task"), once floor 10 is cleared, after the furnace's quest.
##   2. THE CLAPPER falls with the first Bells won on floors 11 to 15 (`bells_won`), asked for or not ("You take the CLAPPER.").
##   3. BROUGHT ("Armourer: the clapper"): he hangs it in the camp's bell (floor 11's wayside shrine's bell, two or three tiles from
##      his forge, swinging a moment as it rings), and lays out three fully modded rares, gloves, boots and a helm (tools/
##      godot_loot.ts fullRares, rolled by the game itself at the level it rolls them at): he takes one, the others go back. Until
##      one is taken they are kept for him (`laid_out`), and laid out again each time he comes into the camp.
extends Node

const Iso := preload("res://scripts/iso.gd")
const Loot := preload("res://scripts/loot.gd")
const Censor := preload("res://scripts/act2/censor.gd")
const Words := preload("res://scripts/words.gd")

const MSG_QUEST := Color("#7af8f0")
const PIECE := Color("#e8dcc0")
## (the quest drops: as loot.gd takes what lies, PULL, TAKE, FLY, WAIT)
const PULL := 3.2
const TAKE := 0.75
const FLY := 9.0
const WAIT := 0.4
## (render.ts the camp's bell: how long it swings once rung, and how fast)
const SWING := 2.4

var main  # main.gd
var Q := {}
var T := {}
## WHAT HE HAS DONE OF IT (game.ts Hero: jar, pages (a bit each: 1 the pair's, 2 the Physician's, 4 the stacks'), clapper,
## laidOut.armourer)
var jar := ""
var pages := 0
var clapper := ""
var laid_out: Array = []
## THIS FLOOR'S: the pages laid here (game.ts Level.pagesUsed); the jar while it lies untaken (the layout's `jar`); what lies
## ({what ("page", "clapper"), n, at, node, age}); the camp's bell ({at, rung})
var pages_used := 0
var _jar = null
var _things: Array = []
var bell := {}
var _bell_pic
var _clock := 0.0
var _prompt := ["", ""]


func _ready() -> void:
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act2/quest1115.json"))
	T = Q["text"]


func on() -> bool:
	return bool(Q.get("on", false))


func _t(key: String, n := -1, w := "") -> String:
	var s := str(T[key])
	return s.replace("{n}", str(n)).replace("{w}", w)


# --- a place come into (main.gd _build) ---

## (game.ts quests1115Made; enterTown: campBellHung, laidOutAgain) What of the Hush's quests is in this place: the Crier's jar on
## 12, the line that a page is here, the stacks' page on 15; in the camp, the bell hung and the armourer's pick laid out again.
func enter(where: String) -> void:
	_things = []
	_jar = null
	bell = {}
	_bell_pic = null
	pages_used = 0
	if not on():
		return
	if main.is_home(where):
		if where == "camp":
			if clapper == "given":
				_hang_bell(false)
			if not laid_out.is_empty():
				_lay_out()
				main.loot.say(_t("offerAgainArmourer"), MSG_QUEST)
		return
	var depth: int = main.map.depth
	# (floor 12's second jar is floors 16 to 20's, not here: game.ts quests1620Made lays it only with their quests on)
	if main.look != null:
		for k in main.look.data.get("variants", {}):
			var v: Dictionary = main.look.data["variants"][k]
			if str(v.get("kind", "")) == "jar" and int(v.get("at", {}).get("variant", 0)) != 0:
				main.look.show_variant(k, 1.0)
	if depth == 12 and jar != "got" and jar != "given" and main.map.jar != null:
		_jar = main.map.jar
		if jar == "asked":
			main.loot.say(_t("jarHere"), MSG_QUEST)
	if (depth == 13 and wants_page(0)) or (depth == 14 and wants_page(1)):
		main.loot.say(_t("pagesHere"), MSG_QUEST)
	if depth == 15 and wants_page(2) and main.map.land != null:
		# (the third, chained in the stacks: in a side area of the library, the one furthest from where he comes in)
		var best = null
		var far := -1.0
		for a in main.map.land.get("areas", []):
			if a["role"] != "side":
				continue
			var b := Vector2(float(a["blob"]["x"]), float(a["blob"]["y"]))
			if b.distance_to(main.hero.world) > far:
				far = b.distance_to(main.hero.world)
				best = b
		if best != null:
			_drop_page(2, best)
			main.loot.say(_t("pagesHere"), MSG_QUEST)


# --- the mystic and the armourer (game.ts jarDue, clapperDue, handIn1115) ---

## What the mystic has for this hero of these: her ask for a bottled voice (floor 11 cleared), or the jar taken from him; "".
func jar_due() -> String:
	if not on():
		return ""
	if jar == "got":
		return "jarGive"
	if jar == "" and int(main.loot.cleared) >= 11:
		return "jarAsk"
	return ""


## What the armourer has for this hero of these: his ask for a clapper (floor 10 cleared), or the clapper taken from him; "".
func clapper_due() -> String:
	if not on():
		return ""
	if clapper == "got":
		return "clapperGive"
	if clapper == "" and int(main.loot.cleared) >= 10:
		return "clapperAsk"
	return ""


func prompt_of(due: String) -> String:
	match due:
		"jarAsk":
			return _t("jarAskPrompt")
		"jarGive":
			return _t("jarGivePrompt")
		"clapperAsk":
			return _t("clapperAskPrompt")
		"clapperGive":
			return _t("clapperGivePrompt")
	return ""


## The mystic or the armourer, at `at`: asks, or takes what was asked for and rewards it.
func hand_in(due: String, at: Vector2) -> void:
	var loot = main.loot
	if due == "jarAsk" or due == "clapperAsk":
		if due == "jarAsk":
			jar = "asked"
		else:
			clapper = "asked"
		main.sfx.play("power", linear_to_db(0.6))
		loot.say(_t(due), MSG_QUEST)
		return
	if due == "jarGive":
		# (her reward: one of the city's words, at random: the main chat's pick, his to change)
		jar = "given"
		var list: Array = Q["jarWords"]
		var w: String = list[randi() % list.size()]
		loot._know(w)["found"] = true
		loot.gain_word(w)
		main.sfx.play("rare")
		loot.say(_t("jarGiven", -1, str(Words.word(w)["name"]).to_upper()), MSG_QUEST)
		return
	if due != "clapperGive":
		return
	# (the clapper: hung in the camp's bell; his pick of three fully modded rares laid out before the armourer, rolled at the level
	# the game rolls them at, max(1, power, min(15, floors cleared)): the game's own, for each of the levels the city may give)
	clapper = "given"
	var lv := clampi(maxi(maxi(1, int(main.last_floor)), mini(15, int(loot.cleared))), 10, 15)
	var R: Dictionary = loot._full_rares.get(str(lv), {})
	laid_out = []
	for sl in Q["clapper"]["slots"]:
		var pool: Array = R.get(sl, [])
		if not pool.is_empty():
			laid_out.append(pool[randi() % pool.size()].duplicate(true))
	main.sfx.play("rare")
	loot.say(_t("clapperGiven"), MSG_QUEST)
	_hang_bell(true)
	_lay_out()


# --- the camp's bell (game.ts campBellHung; render.ts L.campBell) ---

## The camp's bell, the clapper hung in it: on a tile of floor two or three from the armourer's forge, every tile round it floor too,
## the nearest the camp's middle; stood on no more. `rung`: it rings now (its swing, the bell's ring).
func _hang_bell(rung: bool) -> void:
	if main.town == null or main.map == null:
		return
	if bell.is_empty():
		var ar = null
		for s in main.town.data["stations"]:
			if s["kind"] == "armourer":
				ar = Vector2(float(s["x"]), float(s["y"]))
		if ar == null:
			return
		var M = main.map
		var best = null
		var bd := INF
		for ty in range(floori(ar.y) - 4, floori(ar.y) + 5):
			for tx in range(floori(ar.x) - 4, floori(ar.x) + 5):
				if tx < 1 or ty < 1 or tx >= M.w - 1 or ty >= M.h - 1 or M.walk[ty * M.w + tx] != 1:
					continue
				var d := Vector2(tx + 0.5, ty + 0.5).distance_to(ar)
				if d < 2.0 or d > 3.2:
					continue
				var open := 0
				for dy in range(-1, 2):
					for dx in range(-1, 2):
						if M.walk[(ty + dy) * M.w + tx + dx] == 1:
							open += 1
				if open < 9:
					continue
				var mid := Vector2(tx + 0.5, ty + 0.5).distance_to(M.start)
				if mid < bd:
					bd = mid
					best = Vector2(tx + 0.5, ty + 0.5)
		if best == null:
			return
		bell = {"at": best, "rung": -99.0}
		M.walk[floori(best.y) * M.w + floori(best.x)] = 0
		_bell_pic = Loot._FilmPic.new()
		main.hero.get_parent().add_child(_bell_pic)
	if rung:
		bell["rung"] = _clock
		main.fx.event({"t": "bells", "what": "ring", "x": bell["at"].x, "y": bell["at"].y, "k": 0, "n": 0})
		main.sfx.play("bell_ring", linear_to_db(0.9))


func _show_bell() -> void:
	if bell.is_empty() or _bell_pic == null or not is_instance_valid(_bell_pic):
		return
	var since: float = _clock - float(bell["rung"])
	var k := 1 + (floori(since * 5.0) % 2) if since >= 0.0 and since < SWING else 0
	var at: Vector2 = bell["at"]
	_bell_pic.put("q11_bell", k, Iso.to_screen(at.x, at.y), at.x + at.y)


# --- the armourer's pick (game.ts layOut, pickTaken) ---

## His pick of three laid out before the armourer, a piece on each of three tiles of floor apart, nearest the hero first.
func _lay_out() -> void:
	if laid_out.is_empty() or main.town == null:
		return
	var ar = null
	for s in main.town.data["stations"]:
		if s["kind"] == "armourer":
			ar = Vector2(float(s["x"]), float(s["y"]))
	if ar == null:
		return
	var C: Dictionary = Q["clapper"]
	var M = main.map
	var h: Vector2 = main.hero.world
	var spots: Array = []
	for ty in range(floori(ar.y) - 4, floori(ar.y) + 5):
		for tx in range(floori(ar.x) - 4, floori(ar.x) + 5):
			if not M.walkable(tx, ty) or M.walk[ty * M.w + tx] != 1:
				continue
			var p := Vector2(tx + 0.5, ty + 0.5)
			var from := p.distance_to(ar)
			if from < 1.2 or from > float(C["before"]) + 1.6:
				continue
			spots.append({"at": p, "d": p.distance_to(h) + 0.5 * absf(from - float(C["before"]))})
	spots.sort_custom(func(a, b): return a["d"] < b["d"])
	var chosen: Array = []
	for sp in spots:
		if chosen.size() >= laid_out.size():
			break
		var apart := true
		for c in chosen:
			if c.distance_to(sp["at"]) < float(C["apart"]):
				apart = false
		if apart:
			chosen.append(sp["at"])
	main.loot.take_back("armourer")
	for i in laid_out.size():
		var at: Vector2 = chosen[i] if i < chosen.size() else main.loot.floor_near(ar + Vector2((i - 1) * float(C["apart"]), float(C["before"])))
		main.loot.lay_pick(at, laid_out[i], "armourer")


## (loot.gd, as he takes one of the pick: already in his bag) The others laid with it go back.
func pick_taken(by: String) -> void:
	if by != "armourer":
		return
	laid_out = []
	main.loot.say(_t("offerTakenArmourer"), MSG_QUEST)


# --- the pages (game.ts wantsPage, dropPage, pageBossDown) ---

func taken() -> int:
	return (pages & 1) + ((pages >> 1) & 1) + ((pages >> 2) & 1)


func in_hand() -> int:
	return maxi(0, taken() - pages_used)


## Is the hero after the unstruck pages (the jar brought), and has he not yet page `n`?
func wants_page(n: int) -> bool:
	return on() and jar == "given" and (pages & (1 << n)) == 0


func _drop_page(n: int, at: Vector2) -> void:
	if not wants_page(n):
		return
	for t in _things:
		if t["what"] == "page" and int(t["n"]) == n:
			return
	_thing("page", main.loot.floor_near(at), n)


## (loot.gd on_kill) A boss fallen: floor 13's page (the oldest, as the last of its pair falls), the Physician's (from his ledger).
func killed(m) -> void:
	if not on() or not m.boss:
		return
	if m.kind in ["palimpsest", "scraper", "quill"] and main.loot._partner_of(m) == null:
		_drop_page(0, m.world)
	elif m.kind == "physician":
		_drop_page(1, m.world)


# --- the clapper (game.ts updateBells: the first Bells won) ---

## The Bells won on one of floors 11 to 15, the explosion at `at`: the first time, the clapper falls with it (asked for or not).
func bells_won(at: Vector2) -> void:
	if not on() or clapper == "got" or clapper == "given":
		return
	for t in _things:
		if t["what"] == "clapper":
			return
	_thing("clapper", main.loot.floor_near(at), 0)


# --- what lies (render.ts drops: 'quest') ---

func _thing(what: String, at: Vector2, n: int) -> void:
	var node := _Thing.new()
	node.q = self
	node.what = what
	node.at = at
	node.position = Iso.to_screen(at.x, at.y)
	main.hero.get_parent().add_child(node)
	var label := Loot._Tag.new()
	label.text = _t("clapperLabel") if what == "clapper" else _t("pageLabel")
	label.color = PIECE
	label.z_index = 60
	node.add_child(label)
	_things.append({"what": what, "at": at, "node": node, "age": 0.0, "n": n})


func _took(t: Dictionary) -> void:
	var h = main.hero
	main.sfx.play("rare")
	if t["what"] == "clapper":
		clapper = "got"
		main.loot.say(_t("clapperGot"), MSG_QUEST)
		main.fx.float_text(h.world.x, h.world.y, "CLAPPER", PIECE)
		return
	pages |= 1 << int(t["n"])
	var k := taken()
	main.loot.say(_t("pageGot", k), MSG_QUEST)
	main.fx.float_text(h.world.x, h.world.y, "UNSTRUCK PAGE %d / 3" % k, PIECE)


# --- each frame ---

func _process(dt: float) -> void:
	_clock += dt
	_prompt = ["", ""]
	if main == null or main.hero == null or not on():
		return
	_show_bell()
	_jar_tick()
	_take_things(dt)
	if page_ready():
		_prompt = ["E: " + _t("pagePrompt", in_hand()), "page"]
		if Input.is_action_just_pressed("interact") and main.hero.alive and not main._inv.visible:
			lay_page()


## What E would do here, of these: [shown, what].
func prompt() -> Array:
	return _prompt


## (game.ts jarTick) The Crier's jar on floor 12, walked up to: it is his.
func _jar_tick() -> void:
	if _jar == null or main.is_home(main.place):
		return
	var h = main.hero
	var at := Vector2(float(_jar["x"]), float(_jar["y"]))
	if not h.alive or at.distance_to(h.world) > float(Q["pages"]["jarReach"]):
		return
	var M = main.map
	M.walk[int(_jar["ty"]) * M.w + int(_jar["tx"])] = 1
	if main.look != null:
		for k in main.look.data.get("variants", {}):
			var v: Dictionary = main.look.data["variants"][k]
			if str(v.get("kind", "")) == "jar" and int(v["at"]["tx"]) == int(_jar["tx"]) and int(v["at"]["ty"]) == int(_jar["ty"]):
				main.look.show_variant(k, 1.0)
	_jar = null
	jar = "got"
	main.sfx.play("rare")
	main.loot.say(_t("jarGot"), MSG_QUEST)
	main.fx.float_text(h.world.x, h.world.y, "THE CRIER'S VOICE", PIECE)


## (game.ts pageReady) Whether an unstruck page may be laid down now: in the Censor's fight, his ink lying on 4 tiles or more, a
## page in hand.
func page_ready() -> bool:
	if main.map == null or int(main.map.depth) != 15 or main.is_home(main.place) or in_hand() <= 0:
		return false
	var fight := false
	for m in main._monsters.list:
		if is_instance_valid(m) and m.boss and m.kind == "censor" and not m.dead:
			fight = true
	return fight and Censor.inked_count(main.map) >= int(Q["pages"]["least"])


## (game.ts layPage) An unstruck page laid down: all the Censor's ink lying on the floor dries away at once; the friend's cyan rings
## out from him, as a bell's ring does, and sparks.
func lay_page() -> void:
	var h = main.hero
	pages_used += 1
	Censor.dry_all(main.map)
	main.fx.event({"t": "bells", "what": "ring", "x": h.world.x, "y": h.world.y, "k": 0, "n": 0})
	main.fx.event({"t": "spark", "x": h.world.x, "y": h.world.y, "el": "frost", "n": 24})
	main.sfx.play("power", linear_to_db(0.8))
	main.loot.say(_t("pageLaid", in_hand()), MSG_QUEST)


func _take_things(dt: float) -> void:
	var h = main.hero
	var keep: Array = []
	for t in _things:
		if not is_instance_valid(t["node"]):
			continue
		t["age"] = float(t["age"]) + dt
		t["node"].age = t["age"]
		var took := false
		if h.alive and float(t["age"]) >= WAIT:
			if t["at"].distance_to(h.world) <= PULL:
				t["at"] = t["at"].move_toward(h.world, FLY * dt)
				t["node"].at = t["at"]
				t["node"].position = Iso.to_screen(t["at"].x, t["at"].y)
			if t["at"].distance_to(h.world) <= TAKE:
				took = true
		if took:
			t["node"].queue_free()
			_took(t)
		else:
			keep.append(t)
	_things = keep


## A PAGE OR THE CLAPPER LYING (render.ts drops, 'quest'; art/quest1115.ts pageSprite, clapperSprite): hopping as it lands (9 game
## pixels over 0.4 s), named over it, motes of the friend's cyan rising off it now and then; the page's light on the floor round it.
class _Thing extends Node2D:
	var q
	var what := ""
	var at := Vector2.ZERO
	var age := 0.0
	var _pic
	var _mote := 0.0

	func _ready() -> void:
		_pic = Loot._FilmPic.new()
		get_parent().add_child.call_deferred(_pic)

	func _exit_tree() -> void:
		if _pic != null and is_instance_valid(_pic):
			_pic.queue_free()

	func _process(dt: float) -> void:
		if _pic == null or not _pic.is_inside_tree():
			return
		var d := position.y / 16.0
		var pop := sin(age / 0.4 * PI) * 9.0 if age < 0.4 else 0.0
		_pic.put("q11_clapper" if what == "clapper" else "q11_page", 0, position, d - 0.2, pop * 2.0)
		var w := at
		if what == "page" and q.main.look != null:
			q.main.look.spot(position / 2.0 + Vector2(0, -2), 12.0, 0.3)
		# (render.ts: Math.random() < 0.3 * amb a frame, a mote of '#7fe8ff' and white)
		_mote += dt
		if _mote >= 0.1:
			_mote = 0.0
			if randf() < 0.3:
				q.main.fx.mote(w.x, w.y, PackedColorArray([Color("#7fe8ff"), Color.WHITE]))
