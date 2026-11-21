## ACT 2, THE HUSH: THE BELLS, the event of floors 11 to 15 (game/bells.ts BELLS_TUNE, makeBells, chipAt, gapAt, sizeAt, riseSpot;
## game.ts bellsMade, bellsStruck, bellsStart, bellRung, bellTough, bellsWon, bellsLost, updateBells; render/bells.ts the Hush over
## its ground and the arrows to the bells; ui/hud.ts drawBellsClock, bellsOnMap), as the game has it. His design, 18 Oct 2026:
## "you activate the hush somehow, then there are 4-7 bells that spawn around the map, you have a limited time to run around and
## activate those bells. Enemies constantly spawn in the hush, ramping up difficulty. They drop loot, but if you get all the bells
## before the time runs out you get a big loot explosion at the end."
##   ASLEEP: the Muffled Bell, off the main way, gagged by the Silent Order; a blow of his at it (any move's, within its reach and
##     0.55 more) starts it: the gag torn off, the Hush pours out of it over its fixed ground (a circle of the plan's), every bell
##     wakes, and the clock begins, 15 s a bell ("The Hush pours out of the Muffled Bell. Ring the n bells before it is too late!").
##   ON: a blow at a bell awake rings it: it knocks back what is near it (3.5 tiles, shoved 2.2 out, staggered a moment), chips the
##     Hush back round it (0.42 of its radius, at least 6 tiles), and calls the tough one (the k-th bell's, as the game makes it:
##     a yellow pack's leader of the floor's guard kind, tougher for each bell before it). All the while the Hush raises the
##     floor's own kinds round him in it, more and more often and more at once the longer it lasts (16 of its own at most).
##   WON, every bell rung in time: every bell peals at once, the Hush shatters (what it raised falls with it), and the big loot
##     explosion bursts out of the bell he rang last: runedust, gear (one a bell, the first two of the best), gold, a word at a
##     chance; the first time, THE CLAPPER (act2/quest1115.gd).
##   LOST, the clock run out: the Hush lifts, no explosion; what fell is kept, those still up fight on.
##   Four seconds after it ends the bells ring out and hang still.
##   SEEN: the bells by their states (the look's states `bell<k>`, `muffled`: tools/godot_rec/page.js); the Hush, a grey veil over
##   its ground thickening into a wall of mist at its edge, breathing, over what stands and under the dark; arrows at the screen's
##   edge to the bells still to ring, in the friend's cyan; the clock across the top (hud.gd); its ground and the bells on the maps
##   (minimap.gd).
extends Node

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")

const MSG_OMEN := Color("#ffc24a")
const MSG_WORD := Color("#7af8f0")
const MSG_GOOD := Color("#8af078")
const MSG_FOE := Color("#ff8a3a")
## (render/bells.ts: the Hush's picture, SC pixels a tile; its fog's colour and strength)
const SC := 2
const FOG := {"r": 176, "g": 172, "b": 190, "body": 0.42, "wall": 1.0, "alpha": 0.36}
const ARROW := {"fill": Color("#22d0e0"), "hi": Color("#b8fff8"), "ink": Color("#0c1018"), "inset": 14.0}

var main
var D := {}
var U := {}
## (game/bells.ts BellsState)
var phase := ""
var t := 0.0
var limit := 0.0
var rung: Array = []
var states: Array = []
var muffled := 0
var mask := PackedByteArray()
var first := 0
var left := 0
var version := 0
var next := 1.5
var risen := 0
var ids: Array = []
var since := 0.0
var _clock := 0.0
var _shown: Dictionary = {}
var _fog: Sprite2D
var _fog_v := -1
var _arrows: Node2D


## THE FLOOR COME INTO (game.ts bellsMade): its Bells asleep, where its map-maker and dresser laid them; none: no Bells here.
func enter(where: String) -> void:
	phase = ""
	_shown = {}
	_fog = null
	_fog_v = -1
	ids = []
	if _arrows != null and is_instance_valid(_arrows):
		_arrows.queue_free()
	_arrows = null
	if main.is_home(where) or main._monsters == null or main._monsters.bells.is_empty():
		return
	D = main._monsters.bells
	U = D["tune"]
	var plan: Dictionary = D["plan"]
	var M = main.map
	mask = PackedByteArray()
	mask.resize(M.w * M.h)
	first = 0
	var hx: float = plan["hush"]["x"]
	var hy: float = plan["hush"]["y"]
	var hr: float = plan["hush"]["r"]
	var r := ceili(hr) + 1
	for ty in range(maxi(0, floori(hy - r)), mini(M.h - 1, floori(hy + r)) + 1):
		for tx in range(maxi(0, floori(hx - r)), mini(M.w - 1, floori(hx + r)) + 1):
			var i: int = ty * M.w + tx
			if M.tiles[i] != FloorMap.FLOOR or Vector2(tx + 0.5 - hx, ty + 0.5 - hy).length() > hr:
				continue
			mask[i] = 1
			first += 1
	left = first
	version = 0
	phase = "asleep"
	t = 0.0
	limit = float(D["limit"])
	rung = []
	states = []
	for b in plan["bells"]:
		rung.append(false)
		states.append(0)
	muffled = 0
	next = 1.5
	risen = 0
	since = 0.0
	# (the Hush over its ground: over what stands, under the dark)
	_fog = Sprite2D.new()
	_fog.centered = false
	_fog.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_fog.z_index = 47
	_fog.visible = false
	var o := Iso.to_screen(0.0, 0.0)
	_fog.transform = Transform2D(Vector2(Iso.HW / SC, Iso.HH / SC), Vector2(-Iso.HW / SC, Iso.HH / SC), o)
	main._place.add_child(_fog)
	_arrows = _Arrows.new()
	_arrows.b = self
	var layer := CanvasLayer.new()
	layer.layer = 9
	layer.add_child(_arrows)
	main._place.add_child(layer)
	main.hero.bells = self
	_show_bells()


func on() -> bool:
	return phase != ""


func bells_n() -> int:
	return rung.size()


func rung_n() -> int:
	var k := 0
	for r in rung:
		if r:
			k += 1
	return k


## Is world (x, y) in the Hush now?
func in_hush(x: float, y: float) -> bool:
	if phase != "on":
		return false
	var M = main.map
	var tx := floori(x)
	var ty := floori(y)
	return tx >= 0 and ty >= 0 and tx < M.w and ty < M.h and mask[ty * M.w + tx] == 1


# --- his blows (game.ts bellsStruck, from breakProps: hero.gd _break_props) ---

## A blow of his at `at`, `rad` its reach: struck, the Muffled Bell starts the Hush; a bell awake rings.
func struck(at: Vector2, rad: float) -> void:
	if phase != "asleep" and phase != "on":
		return
	var plan: Dictionary = D["plan"]
	var reach := rad + float(U["strike"])
	if phase == "asleep":
		if Vector2(plan["muffled"]["x"], plan["muffled"]["y"]).distance_to(at) <= reach:
			start()
		return
	for i in rung.size():
		var b: Dictionary = plan["bells"][i]
		if not rung[i] and Vector2(b["x"], b["y"]).distance_to(at) <= reach:
			ring(i)


## (game.ts bellsStart) The Muffled Bell struck: its gag torn off, the Hush pours out of it, and every bell wakes. The clock begins.
func start() -> void:
	if phase != "asleep":
		return
	phase = "on"
	t = 0.0
	next = 1.5
	muffled = 1
	for i in states.size():
		states[i] = 1
	var m: Dictionary = D["plan"]["muffled"]
	var n := rung.size()
	main.fx.event({"t": "bells", "what": "start", "x": m["x"], "y": m["y"], "n": n})
	main.sfx.play("boss_roar", linear_to_db(0.5))
	main.sfx.play("bell_muffled")
	main.loot.say("The Hush pours out of the Muffled Bell. Ring the %d bells before it is too late!" % n, MSG_OMEN)
	_show_bells()


## (game.ts bellRung) Bell `i` rung: it knocks back what is near it, chips the Hush back round it, and the tough one comes at it (or,
## the last, the Hush shatters).
func ring(i: int) -> void:
	if phase != "on" or rung[i]:
		return
	rung[i] = true
	states[i] = 2
	var b: Dictionary = D["plan"]["bells"][i]
	var at := Vector2(b["x"], b["y"])
	var k := rung_n()
	var n := rung.size()
	for m in main._monsters.list:
		if not is_instance_valid(m) or m.dead or m.boss:
			continue
		var d: Vector2 = m.world - at
		if d.length() > float(U["knockR"]):
			continue
		var u: Vector2 = d.normalized() if d.length() > 0.01 else Vector2(1, 0)
		main.hero.melds._slide(m, u * float(U["knock"]), 6)
		m.stagger_t = maxf(m.stagger_t, 0.45)
	_chip(at)
	main.fx.event({"t": "bells", "what": "ring", "x": at.x, "y": at.y, "k": k, "n": n})
	main.sfx.play("bell_ring", linear_to_db(0.9))
	_show_bells()
	if k >= n:
		_won(at)
		return
	main.loot.say("A bell rings: %d of %d." % [k, n], MSG_WORD)
	_tough(at, k)


## (game/bells.ts chipAt) A bell rung chips the Hush back round it: a share of its radius, at least a few tiles.
func _chip(at: Vector2) -> void:
	var M = main.map
	var r := maxf(float(U["chipMin"]), float(D["plan"]["hush"]["r"]) * float(U["chip"]))
	for ty in range(maxi(0, floori(at.y - r)), mini(M.h - 1, floori(at.y + r)) + 1):
		for tx in range(maxi(0, floori(at.x - r)), mini(M.w - 1, floori(at.x + r)) + 1):
			var i: int = ty * M.w + tx
			if mask[i] == 1 and Vector2(tx + 0.5 - at.x, ty + 0.5 - at.y).length() <= r:
				mask[i] = 0
				left -= 1
	version += 1


## (game.ts bellTough) The tough one the k-th bell's ringing calls, as the game makes it on this floor (with what comes with it),
## beside the bell.
func _tough(at: Vector2, k: int) -> void:
	var list: Array = D["tough"]
	if k - 1 >= list.size():
		return
	# (the leader first, and what comes with it where the game put it beside him: the Hushed Watch's sergeant his brace of hounds)
	var spot: Vector2 = main.loot.floor_near(at + Vector2(0, 1))
	for d in list[k - 1]:
		var p: Vector2 = spot if d == list[k - 1][0] else main.loot.floor_near(spot + Vector2(float(d.get("dx", 0.0)), float(d.get("dy", 0.0))))
		var m = main._monsters.call_up_as(d, p, 8900 + k, main.hero.world - p)
		if m == null:
			continue
		ids.append(m)
		main.fx.event({"t": "bells", "what": "rise", "x": m.world.x, "y": m.world.y})


## (game.ts bellsWon) All rung in time: every bell peals at once, the Hush shatters (what it raised falls), and the big loot
## explosion bursts out of `last`, the bell he rang last.
func _won(last: Vector2) -> void:
	phase = "won"
	since = 0.0
	for i in states.size():
		states[i] = 2
	for m in ids:
		if is_instance_valid(m) and not m.dead:
			# (its life and shield and one more, as the game's: what its armour keeps off it, below)
			m.damage(m.life + m.shield + 1.0, "phys", false, false, [], false, false, -1)
			# (one that nothing reaches just now, a pool of ink or one rising: it goes down all the same)
			if is_instance_valid(m) and not m.dead:
				m._die()
	ids = []
	var loot = main.loot
	var at: Vector2 = loot.floor_near(last)
	var n := rung.size()
	var power := maxi(1, int(main.map.depth))
	# (runedust: two and one for every two bells, half again as much (LOOT2); gear, one a bell, the first two of the best; gold,
	# by the floor, twice (LOOT2); a word at a chance, the likelier the deeper)
	main.quest610.drop_dust(at, roundi((float(U["dust"]) + floori(n / 2.0)) * 1.5))
	for i in n:
		loot._item(at, 4 if i < 2 else 2)
	loot._gold(at, randi_range(int(U["gold"]), int(U["gold"]) * 2) * power * n * 2)
	if loot.words_fall() and randf() < float(U["word"]) * loot._growth():
		loot._word(at, loot._found())
	# (QUESTS1115: the first time, the clapper falls with it)
	if main.quest1115 != null:
		main.quest1115.bells_won(at)
	main.fx.event({"t": "bells", "what": "won", "x": last.x, "y": last.y, "n": n})
	main.sfx.play("rare")
	loot.say("Every bell peals at once. The Hush shatters!", MSG_GOOD)
	_show_bells()


## (game.ts bellsLost) The clock run out: the Hush lifts with no explosion; what the enemies dropped is kept, those up fight on.
func _lost() -> void:
	phase = "lost"
	since = 0.0
	for i in states.size():
		if not rung[i]:
			states[i] = 0
	var m: Dictionary = D["plan"]["muffled"]
	main.fx.event({"t": "bells", "what": "lost", "x": m["x"], "y": m["y"]})
	main.loot.say("The Hush lifts. The bells fall silent.", MSG_FOE)
	_show_bells()


# --- each frame (game.ts updateBells) ---

func _process(dt: float) -> void:
	_clock += dt
	if phase == "" or main == null or main.map == null or get_tree().paused:
		return
	_step(dt)
	_show_bells()
	_show_fog()


func _step(dt: float) -> void:
	if phase == "won" or phase == "lost":
		var was := since
		since += dt
		# (and a while after, the bells ring out and hang still)
		if was < float(U["ringOut"]) and since >= float(U["ringOut"]):
			for i in states.size():
				if states[i] == 2:
					states[i] = int(D["still"])
			if muffled == 1:
				muffled = int(D["still"])
		return
	if phase != "on" or not main.hero.alive:
		return
	t += dt
	if t >= limit:
		_lost()
		return
	if t < next:
		return
	next = t + maxf(float(U["gapMin"]), float(U["gap0"]) - float(U["gapFall"]) * t)
	ids = ids.filter(func(m): return is_instance_valid(m) and not m.dead)
	var room := int(U["most"]) - ids.size()
	if room <= 0:
		return
	var at = _rise_spot(main.hero.world)
	if at == null:
		return
	var want := mini(room, mini(int(U["sizeMost"]), int(U["size0"]) + floori(t / float(U["sizeEvery"]))))
	var kind := _kind()
	var more := 1.0 + float(U["lifeRamp"]) * t
	var pack := 8000 + (risen % 800)
	for s in _scatter(at, want):
		if not in_hush(s.x, s.y):
			continue
		var m = main._monsters.call_up_as(D["rise"][kind], s, pack, main.hero.world - s)
		if m == null:
			continue
		m.max_life = roundf(m.max_life * more)
		m.life = m.max_life
		ids.append(m)
		risen += 1
		main.fx.event({"t": "bells", "what": "rise", "x": s.x, "y": s.y})


## (act2_mobs.ts act2Pack 'normal') The floor's own kind the Hush raises this time, by their weights.
func _kind() -> String:
	var own: Array = D["own"]
	var sum := 0.0
	for o in own:
		sum += float(o["weight"])
	var r := randf() * sum
	for o in own:
		r -= float(o["weight"])
		if r <= 0.0:
			return str(o["kind"])
	return str(own[0]["kind"])


## (game/bells.ts riseSpot) Where the next of the Hush may rise: a tile of it, in reach of him but not on him; null: nowhere.
func _rise_spot(h: Vector2):
	var M = main.map
	for k in 40:
		var a := randf() * TAU
		var d := randf_range(float(U["near"]), float(U["far"]))
		var tx := floori(h.x + cos(a) * d)
		var ty := floori(h.y + sin(a) * d)
		if tx < 1 or ty < 1 or tx >= M.w - 1 or ty >= M.h - 1:
			continue
		var i: int = ty * M.w + tx
		if mask[i] != 1 or M.walk[i] != 1:
			continue
		return Vector2(tx + 0.5, ty + 0.5)
	return null


## (game.ts scatter) `n` tiles of walkable floor round `at`, the first on it.
func _scatter(at: Vector2, n: int) -> Array:
	var M = main.map
	var out: Array = [at]
	var tries := 0
	while out.size() < n and tries < 60:
		tries += 1
		var p := Vector2(floorf(at.x + randf_range(-1.6, 1.6)) + 0.5, floorf(at.y + randf_range(-1.6, 1.6)) + 0.5)
		if not M.walkable(floori(p.x), floori(p.y)) or out.has(p):
			continue
		out.append(p)
	return out


# --- seen ---

## The bells by their states (render/act1_pieces.ts bellFrame): a small bell asleep or hanging still its first frame, awake its
## second, ringing its third and fourth by turns, three a second; the Muffled Bell gagged, torn loose [1, 2, 1, 3] four a second,
## hanging still its second. Each its look's state, its steps as tools/godot_rec/page.js took them.
func _show_bells() -> void:
	var look = main.look
	if look == null:
		return
	for i in states.size():
		var s: int = states[i]
		var step := 0 if s <= 0 else (1 if s == 1 else (2 + (floori(_clock * 3.0) % 2) if s == 2 else 4))
		_put("bell%d" % i, step, 4)
	var mf: int = 0 if muffled <= 0 else (1 if muffled == 3 else int([1, 2, 1, 3][floori(_clock * 4.0) % 4]))
	_put("muffled", mf, 4)


func _put(name: String, step: int, last: int) -> void:
	if int(_shown.get(name, -1)) == step:
		return
	_shown[name] = step
	if step == 0:
		main.look.clear_variant(name)
	else:
		main.look.show_variant(name, float(step) / float(last))


## THE HUSH OVER ITS GROUND (render/bells.ts fog): its picture made again as a bell chips it; coming in over 0.8 s, breathing, gone
## in a moment as it shatters, lifting slowly as the clock runs out.
func _show_fog() -> void:
	if _fog == null or not is_instance_valid(_fog):
		return
	var k := 0.0
	if phase == "on":
		k = minf(1.0, t / 0.8)
	elif phase == "won":
		k = maxf(0.0, 1.0 - since / 0.6)
	elif phase == "lost":
		k = maxf(0.0, 1.0 - since / 2.5)
	_fog.visible = k > 0.0
	if not _fog.visible:
		return
	if _fog_v != version:
		_fog_v = version
		_fog.texture = _picture()
	_fog.modulate.a = k * (float(FOG["alpha"]) + 0.05 * sin(_clock * 1.3))


func _picture() -> ImageTexture:
	var M = main.map
	var w: int = M.w * SC
	var h: int = M.h * SC
	var a := PackedFloat32Array()
	a.resize(w * h)
	for ty in M.h:
		for tx in M.w:
			if mask[ty * M.w + tx] != 1:
				continue
			for j in SC:
				for i in SC:
					a[(ty * SC + j) * w + tx * SC + i] = 1.0
	a = _blur(_blur(a, w, h, 2), w, h, 2)
	var bytes := PackedByteArray()
	bytes.resize(w * h * 4)
	for p in w * h:
		var v := a[p]
		if v <= 0.003:
			continue
		var al := minf(1.0, float(FOG["body"]) * v + float(FOG["wall"]) * 4.0 * v * (1.0 - v) * 0.6)
		bytes[p * 4] = FOG["r"]
		bytes[p * 4 + 1] = FOG["g"]
		bytes[p * 4 + 2] = FOG["b"]
		bytes[p * 4 + 3] = int(roundf(al * 255.0))
	return ImageTexture.create_from_image(Image.create_from_data(w, h, false, Image.FORMAT_RGBA8, bytes))


static func _blur(src: PackedFloat32Array, w: int, h: int, r: int) -> PackedFloat32Array:
	var tmp := PackedFloat32Array()
	tmp.resize(w * h)
	var out := PackedFloat32Array()
	out.resize(w * h)
	for y in h:
		var s := 0.0
		for x in range(-r, r + 1):
			s += src[y * w + clampi(x, 0, w - 1)]
		for x in w:
			tmp[y * w + x] = s / (2 * r + 1)
			s += src[y * w + mini(w - 1, x + r + 1)] - src[y * w + maxi(0, x - r)]
	for x in w:
		var s := 0.0
		for y in range(-r, r + 1):
			s += tmp[clampi(y, 0, h - 1) * w + x]
		for y in h:
			out[y * w + x] = s / (2 * r + 1)
			s += tmp[mini(h - 1, y + r + 1) * w + x] - tmp[maxi(0, y - r) * w + x]
	return out


## THE BELLS' CLOCK (ui/hud.ts drawBellsClock: hud.gd draws it at `y`, game pixels): while the Hush is on, the bells rung of all
## of them in the friend's cyan and a bar running down with the clock, flashing in its last five seconds; a moment as it ends,
## what came of it. Whether it is drawn.
func clock(hud, W: float, y: float, ink: Color, edge: Color) -> bool:
	if phase == "won" or phase == "lost":
		if since > 3.0:
			return false
		var a := minf(1.0, 3.0 - since)
		hud._text("EVERY BELL PEALS" if phase == "won" else "THE HUSH LIFTS", floorf(W / 2.0), y, Color(Color("#b8fff8") if phase == "won" else Color("#b8b4c6"), a), {"align": "center", "shadow": Color(ink, a)})
		return true
	if phase != "on":
		return false
	var cx := floorf(W / 2.0)
	var rest := maxf(0.0, limit - t)
	var secs := ceili(rest)
	hud._text("RING THE BELLS  %d / %d   %d:%02d" % [rung_n(), rung.size(), secs / 60, secs % 60], cx, y, Color("#b8fff8"), {"align": "center", "shadow": ink})
	var bw := minf(150.0, W - 160.0)
	var x := floorf(cx - bw / 2.0)
	hud._rect(x - 1, y + 10, bw + 2, 6, edge)
	hud._rect(x, y + 11, bw, 4, Color("#0c3a48"))
	hud._rect(x, y + 11, roundf(bw * rest / limit), 4, Color("#b8fff8") if rest < 5.0 and floori(_clock * 4.0) % 2 == 0 else Color("#22d0e0"))
	return true


## THE BELLS ON A MAP (ui/hud.ts bellsOnMap): within `R` tiles of him, the veil on every tile of the Hush, its edge pulsing (`veil`:
## tx, ty, colour, strength); the marks (as minimap.gd's: [tx, ty, colour, small, big, down]): each bell still to ring in the
## friend's cyan, blinking; before it is begun, the Muffled Bell once seen.
func on_map(hx: int, hy: int, R: int, veil: Callable, seen: Callable) -> Array:
	var out: Array = []
	if phase == "on":
		var M = main.map
		var pulse := 0.55 + 0.35 * sin(_clock * 4.0)
		for ty in range(maxi(1, hy - R), mini(M.h - 2, hy + R) + 1):
			for tx in range(maxi(1, hx - R), mini(M.w - 2, hx + R) + 1):
				var i: int = ty * M.w + tx
				if mask[i] != 1:
					continue
				var edge := mask[i - 1] == 0 or mask[i + 1] == 0 or mask[i - M.w] == 0 or mask[i + M.w] == 0
				veil.call(tx, ty, Color("#e2dfe8") if edge else Color("#9a96aa"), pulse if edge else 0.4)
		var lit := floori(_clock * 3.0) % 2 == 0
		for i in rung.size():
			if not rung[i]:
				var b: Dictionary = D["plan"]["bells"][i]
				out.append([floori(b["x"]), floori(b["y"]), Color("#22d0e0") if lit else Color("#b8fff8"), 2, 4, false])
	elif phase == "asleep":
		var m: Dictionary = D["plan"]["muffled"]
		if seen.call(floori(m["x"]), floori(m["y"])):
			out.append([floori(m["x"]), floori(m["y"]), Color("#b8b4c6"), 2, 4, false])
	return out


## THE BELLS STILL TO RING, OFF THE SCREEN (render/bells.ts arrows): an arrow at the screen's edge pointing to each, in the friend's
## cyan, blinking and bobbing; clear of the clock at the top and of the moves at the foot.
class _Arrows extends Node2D:
	var b

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		if b.phase != "on" or b.main.hero == null:
			return
		var size: Vector2 = get_viewport().get_visible_rect().size
		var W := size.x / 2.0
		var H := size.y / 2.0
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var x0: float = b.ARROW["inset"]
		var x1: float = W - b.ARROW["inset"]
		var y0 := 36.0
		var y1 := H - 48.0
		var cx := W / 2.0
		var cy := (y0 + y1) / 2.0
		var bob := sin(b._clock * 6.0) * 1.5
		var cam: Transform2D = get_viewport().get_canvas_transform()
		for i in b.rung.size():
			if b.rung[i]:
				continue
			var bl: Dictionary = b.D["plan"]["bells"][i]
			var sp: Vector2 = (cam * Iso.to_screen(float(bl["x"]), float(bl["y"]))) / 2.0 - Vector2(0, 14)
			if sp.x >= x0 and sp.x <= x1 and sp.y >= y0 - 20.0 and sp.y <= H - 8.0:
				continue
			var dx := sp.x - cx
			var dy := sp.y - cy
			var kx := (x1 - cx) / dx if dx > 0.0 else ((x0 - cx) / dx if dx < 0.0 else INF)
			var ky := (y1 - cy) / dy if dy > 0.0 else ((y0 - cy) / dy if dy < 0.0 else INF)
			var s := minf(kx, ky)
			var ang := atan2(dy, dx)
			var at := Vector2(roundf(cx + dx * s + cos(ang) * bob), roundf(cy + dy * s + sin(ang) * bob))
			_tri(at, ang, 8.0, b.ARROW["ink"])
			_tri(at, ang, 6.0, b.ARROW["fill"] if floori(b._clock * 3.0) % 2 == 0 else b.ARROW["hi"])
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	func _tri(at: Vector2, ang: float, r: float, c: Color) -> void:
		var pts := PackedVector2Array([Vector2(r, 0), Vector2(-r * 0.75, -r * 0.7), Vector2(-r * 0.4, 0), Vector2(-r * 0.75, r * 0.7)])
		var out := PackedVector2Array()
		for p in pts:
			out.append(at + p.rotated(ang))
		draw_colored_polygon(out, c)
