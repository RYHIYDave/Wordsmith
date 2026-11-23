## WHAT THE FIGHT SHOWS OF A BLOW AND OF A WORD (render/fx.ts): the game's rules do not draw; they TELL what happened
## (game.ts `emit`), and its renderer makes of each telling what is seen: the swing's streak, the sparks and the number of a
## hit, a burst, flames catching, ice, an arc of lightning, a stun's stars. Here the same: the rules call `event` with the
## game's own telling (its `t` the game's name for it, its other keys the game's), and this node draws it, as the game's
## effects class does (render/fx.ts Fx: `handle`, its makers, `update`, `drawGround`, `drawAir`, `drawText`), with the same
## counts, speeds, lifetimes, sizes and colours, in the same order.
##
## THE TELLINGS THE WORDS' RULES SEND (game.ts), each with the game's own keys (x, y: tiles on the floor):
##   swing     {x, y, dx, dy, reach, el, words, n, echo}     a blade swung from (x, y) the way (dx, dy), so far; its element
##             and the words in front of the move (what colours it); `combo` 1 if it is the second swing of his two (the game
##             reads that off the hero: without the key, off his `_combo_next`)
##   hit       {x, y, amount, crit, el, heavy, words, poison} a blow landed on a monster at (x, y) for `amount`
##   burst     {x, y, r, el, style, words, n, echo}           an area struck: `style` "shock" (Power's splash, a shock through
##             the ground), "blast" (an explosion: Flame's and Frost's splash), "land" (a leap landing), "whirl" (one turn of
##             the Whirlwind)
##   ignite    {x, y}                 a monster catches fire
##   freeze    {x, y}                 a chilled monster struck again freezes
##   arc       {x0, y0, x1, y1, sky}  lightning: down out of the sky on the one struck (`sky`), then from it to another
##   poisoned  {x, y}                 the poison takes hold of a monster
##   stun      {id, x, y, secs}       a monster stunned (`id`: the monster, or its instance id; failing both, the one at x, y)
##   stagger   {id, x, y, fromX, fromY}   a monster staggered by cracked ground
##   heavy     {x, y, r, big}         a Heavy blow's weight coming down
##   buff      {kind, x, y, stacks}   the hero's own: "might" (Power behind, so many stacks), "haste" (Swift behind; `secs` how
##             long it lasts, 3 without)
## Also taken, should the rules send them as the game does: `zone` {kind, x, y, r} (ground laid: else seen in the wakes'
## list), `shatter` {x, y} (ice breaking: else seen as a frozen monster thaws), `channel` and `channelEnd` {kind: "whirl", x, y}
## (the Whirlwind begun and ended: else its first turn begins it, and 0.45 s with no turn ends it), `cast` {x, y, behind,
## echo} (a move used with words on it: each word behind it stirs at his feet; nothing shows of it without the telling).
##
## WHAT IS DRAWN FROM THE STATE ITSELF, every frame, not from a telling (`ambient`, fx_figures.gd): a monster burning,
## chilled, frozen, poisoned, stunned, staggered (monster.gd burn_t, chill_t, frozen_t, poison_t, poison_n, stun_t, stagger_t:
## each above 0 while it lasts; one monster.gd does not keep is not shown); a guardian smouldering in the colour of its
## first word (monster.gd champion, words); and THE GROUND A MOVE LEFT (fx_wakes.gd): the rules' node hands each of its
## patches {kind, x, y, r, t, dur} to `draw_wake(self, patch)` from its own _draw, on the floor; what a patch sends up,
## its cloud over the dark and its light are tended here from the patches handed over (or from `wakes.list`, if this is
## given the node).
##
## WHERE IT IS DRAWN: this node lies on the floor, over its marks and under what stands (render.ts: fx.drawGround); its
## layers over the figures (the ice round the frozen), over the dark (fx.drawAir: "drawn over the characters and over the
## darkness so they glow") and over that (fx.drawText: the numbers). In game pixels, two picture pixels to one, each dot
## where the game rounds it to. ITS LIGHT in the dark (the game's `glows`, cut by render.ts light) is asked of look.gd
## `spot`, afresh every frame.
##
## WHAT IS LEFT OUT (each said again where it would be): the looks of melded words (`e.meld`), of unique items, of the
## skill trees and of the other classes (the Mage's beams, orbs and arcs of power, the Ranger's arrows, volleys and traps,
## the Brawler's, the Warlock's, the Tinkerer's); of the city's and the last words (FLOORS 6 TO 10'S words: Twin's mirror and
## phantoms, Leeching's blood and wisps, Volatile's violet, Precise's, Frenzied's and Guarding's, are fx_words610.gd's; Lasting's,
## Fleeting's and Vast's own, render/words10.ts, fx_words10.gd's; both handed on from here); a word
## joining a move, dropping and being taken up; the fallen, and the lines said over heads (monster.gd's and the HUD's); the
## thrust's take-off and flight (wild.ts ongoing: from the hero's own move, which no telling carries).
## THE SOUNDS the game's `handle` makes with these tellings are not made here (this is what is SEEN): `poisoned` "leech"
## 0.35, a `buff` of haste "gust" 0.6, of might "might" 0.35 + 0.08 a stack.
## THE HOLD (fx.ts `freeze`: "the instant of a heavy hit ... the game holds almost still"): the game's frame loop runs at
## 0.06 of its pace while a hold lasts; here Engine.time_scale is set so for as long, and set back (`holds` false: never).
extends Node2D

const PF := preload("res://scripts/pixel_font.gd")
const L := preload("res://scripts/fx_looks.gd")
const Wild := preload("res://scripts/fx_wild.gd")
const WildMage := preload("res://scripts/fx_wild_mage.gd")
const WildRanger := preload("res://scripts/fx_wild_ranger.gd")
const Words3 := preload("res://scripts/fx_words3.gd")
const Wakes := preload("res://scripts/fx_wakes.gd")
const Figures := preload("res://scripts/fx_figures.gd")
const UFx := preload("res://scripts/fx_uniques.gd")
const Monster := preload("res://scripts/monster.gd")
## (floors 6 to 10's words at work: Twin's, Leech's, Volatile's, Precise's, Frenzied's and Guarding's looks: fx_words610.gd)
const Words610 := preload("res://scripts/fx_words610.gd")
## (THE 52 DESIGNED MELDS' OWN LOOKS: fx_melds52.gd)
const Melds52Fx := preload("res://scripts/fx_melds52.gd")
var m52fx: Melds52Fx
## (the city's five words at work, their looks: Pulling's, Splitting's, Hexing's, Stilling's and Binding's: fx_city3.gd)
const City3 := preload("res://scripts/fx_city3.gd")
var city3: City3
var w610: Words610
## (LASTING'S, FLEETING'S AND VAST'S OWN LOOKS, render/words10.ts: fx_words10.gd, handed on from its own lines below, each marked w10)
const Words10 := preload("res://scripts/fx_words10.gd")
var w10: Words10
## (THE SEVEN LAST WORDS' OWN LOOKS, render/words7.ts: fx_words7.gd, handed on from its own lines below, each marked w7)
const Words7 := preload("res://scripts/fx_words7.gd")
var w7: Words7
## (THE TEN MELDED WORDS' OWN LOOKS, render/melds3.ts: fx_melds3.gd, handed on from its own lines below, each marked m3)
const Melds3 := preload("res://scripts/fx_melds3.gd")
var m3: Melds3
## (VOLATILE'S FIVE MELDS' OWN LOOKS, render/volatile3.ts: fx_volatile3.gd, each line below marked v3; THE EIGHT MELDS ACROSS
## THE GROUPS', render/melds8.ts: fx_melds8.gd, each marked m8)
const Volatile3 := preload("res://scripts/fx_volatile3.gd")
var v3: Volatile3
const Melds8 := preload("res://scripts/fx_melds8.gd")
var m8: Melds8
## (UNIQUE ITEMS: what the uniques show in play: fx_uniques.gd)
var uq: UFx

## (main.ts: `gdt = fx.freeze > 0 ? dt * 0.06 : dt`)
const HOLD_PACE := 0.06
## (the words whose stir at his feet is shown as a move is used with one behind: `_cast`)
const CAST_WORDS: Array[String] = ["power", "poison", "frost", "fire", "lightning", "swift", "heavy"]
## (how often the monsters' whole list is gone through for those near him, seconds, and how near, tiles: the screen is 15
## tiles from corner to corner of the floor, and he may lunge 6 in a blink)
const SCAN_EVERY := 0.25
const SCAN_REACH := 24.0
## (the layers' places among what is drawn: perils.gd's air 40, look.gd's dark 50 and its glows 51, perils.gd's glow 52)
const Z_OVER := 41
const Z_AIR := 53
const Z_TEXT := 54

## The place's dark, to cut lights in (look.gd; null where a place has none), and its monsters (monsters.gd: their list,
## the hero, the map, what stands): main.gd gives both as the place is laid out.
var look
var monsters
## The rules' node of the ground a move left (its `list` of patches), if it is given: see fx_wakes.gd.
var wakes
## Whether a heavy blow holds the game still (the check turns it off, to picture each look at its own moment).
var holds := true

## How many of each telling there have been (by its `t`): for the checks.
var seen := {}
## The last of each telling, as it was sent.
var last := {}

# --- the lists (fx.ts Fx) ---
## THE PARTICLES (fx.ts Particle), side by side in packed lists, `pn` of them alive: where (tiles) and how high (game
## pixels), how fast, how long left, colour, size, weight; `ramp` its colours over its life (first to last) with `life0`
## the life it began with; `streak` drawn as a line so long back along its way.
var pn := 0
var _px := PackedFloat32Array()
var _py := PackedFloat32Array()
var _pz := PackedFloat32Array()
var _pvx := PackedFloat32Array()
var _pvy := PackedFloat32Array()
var _pvz := PackedFloat32Array()
var _plife := PackedFloat32Array()
var _plife0 := PackedFloat32Array()
var _pgrav := PackedFloat32Array()
var _psize := PackedFloat32Array()
var _pstreak := PackedFloat32Array()
var _pcol := PackedColorArray()
var _pramp: Array = []
## The numbers and other text that rises (fx.ts Floater): {x, y, z, text, color, t, big, drift}.
var floaters: Array = []
## Shockwave rings on the floor (Ring): {x, y, r, t, dur, colors, fill, heavy, delay, closing, jag, double, swirl}.
var rings: Array = []
## A blade's cuts (Slash): {x, y, a, reach, t, dur, colors, heavy, fast, rev, jag, faint}.
var slashes: Array = []
## Turns of a whirlwind (Whirl): {x, y, r, t, dur, colors, heavy, jag, faint, rev}.
var whirls: Array = []
## Cracks a Power hit leaves in the floor (Crack): {pts, t, dur, hot}.
var cracks: Array = []
## Marks left on the floor, fire's scorch and frost's rime (Decal): {x, y, r, t, dur, kind, seed}.
var decals: Array = []
## ARRIVALS (render/arrivals.ts Rift): the rifts in the floor that the enemies coming in come up out of: {x, y, t, out, dur, r, seed}.
var rifts: Array = []
## Spikes of ice lying out from a frost burst (Spike): {x0, y0, x1, y1, tall, t, dur}.
var spikes: Array = []
## Bursts of light at an impact (Flash): {x, y, z, r, t, dur, colors}.
var flashes: Array = []
## Lightning along the ground (Bolt): {pts, t, colors}; and down from above (SkyBolt): {x, y, top, offs, fork, t, dur}.
var bolts: Array = []
var sky_bolts: Array = []
## Moments of light that push the dark back (Glow): {x, y, r, t, dur}.
var glows: Array = []
## Things that happen a moment after the telling that asked for them: {t, fn}.
var later: Array = []
## "of Power": how many stacks of might the hero holds, and the seconds they have left.
var might_stacks := 0
var might_t := 0.0
## "of Swiftness": the seconds of haste left, and where he last left an afterimage (render.ts blurAt).
var haste_t := 0.0
var _blur_at := Vector2.INF
## The line that last told of might gained ("MIGHT 2"): counted up in place while it is fresh.
var _might_note = null
var clock := 0.0
## Seconds the game is to hold almost still (fx.ts freeze), and real seconds since the last hold was asked.
var freeze := 0.0
var _since_hold := 1.0
var _held := false
var _held_tick := 0

var wild: Wild
## (big and wild, the Mage's: her crystal's crackle, the Wave, the Orb, the Warp: fx_wild_mage.gd)
var wild_mage
## (big and wild, the Ranger's: wind: fx_wild_ranger.gd)
var wild_ranger
var words3: Words3
var ground: Wakes
var figures: Figures
var _over: _Layer
var _air: _Layer
var _text: _Layer
var _alive_was := false
## (what its update and its drawing cost, microseconds, summed while `timing`: the check's measure)
var timing := false
var cost_update := 0
var cost_draw := 0
var cost_frames := 0
var _lifted := false
var _lift_of = null
var _lit := true
var _near: Array = []
var _scan_in := 0.0
var _scan_n := -1


## One of this node's layers: drawn over the figures, over the dark, or over that.
class _Layer extends Node2D:
	var fx
	var pass_id := 0

	func _draw() -> void:
		fx._paint(self, pass_id)


## The helper that goes last of all in a frame, once the monsters have taken their step (see _late).
class _Late extends Node:
	var fx

	func _process(dt: float) -> void:
		fx._late(dt)


func _init() -> void:
	L.ready_up()
	var most := L.MAX_PARTICLES
	_px.resize(most)
	_py.resize(most)
	_pz.resize(most)
	_pvx.resize(most)
	_pvy.resize(most)
	_pvz.resize(most)
	_plife.resize(most)
	_plife0.resize(most)
	_pgrav.resize(most)
	_psize.resize(most)
	_pstreak.resize(most)
	_pcol.resize(most)
	_pramp.resize(most)
	wild = Wild.new()
	wild.fx = self
	wild_mage = WildMage.new()
	wild_mage.fx = self
	wild_ranger = WildRanger.new()
	wild_ranger.fx = self
	words3 = Words3.new()
	words3.fx = self
	ground = Wakes.new()
	ground.fx = self
	figures = Figures.new()
	figures.fx = self
	city3 = City3.new()
	city3.fx = self
	w610 = Words610.new()
	m52fx = Melds52Fx.new()
	m52fx.fx = self
	w610.fx = self
	w10 = Words10.new()
	w10.fx = self
	w7 = Words7.new()
	w7.fx = self
	m3 = Melds3.new()
	m3.fx = self
	v3 = Volatile3.new()
	v3.fx = self
	m8 = Melds8.new()
	m8.fx = self
	uq = UFx.new()
	uq.fx = self


func _ready() -> void:
	_over = _layer(1, Z_OVER)
	_air = _layer(2, Z_AIR)
	_text = _layer(3, Z_TEXT)
	var late := _Late.new()
	late.fx = self
	late.process_priority = 100
	add_child(late)


func _layer(pass_id: int, z: int) -> _Layer:
	var n := _Layer.new()
	n.fx = self
	n.pass_id = pass_id
	n.z_index = z
	add_child(n)
	return n


func _exit_tree() -> void:
	_let_go()
	# (nothing of it is left waiting once its place is gone)
	later = []
	wild.clear()
	wild_mage.clear()
	wild_ranger.clear()
	words3.clear()
	figures.clear()
	w610.clear()
	m52fx.clear()
	city3.clear()
	w10.clear()
	w7.clear()
	m3.clear()
	v3.clear()
	m8.clear()
	uq.clear()


func _notification(what: int) -> void:
	# (the game held under a panel while a hold lasts: the panels keep their own pace)
	if what == NOTIFICATION_PAUSED:
		_let_go()
	elif what == NOTIFICATION_UNPAUSED and freeze > 0.0 and holds:
		_hold_on()


# =====================================================================================================================
# What it is told

## The rules say what happened (game.ts emit): counted, kept, and shown.
## (THE WARRIOR'S EARTHQUAKE: whether a slam ring at (x, y) is a quake of his just begun, whose ground is drawn in its place:
## heroes/warrior_arms_look.gd claims)
var claims_slam := Callable()


func event(e: Dictionary) -> void:
	var t: String = e.get("t", "")
	seen[t] = int(seen.get(t, 0)) + 1
	last[t] = e
	# (and the last hit that carried its move's words: a splash's and an area's fourth and later carry none, game.ts hitMonster)
	if t == "hit" and e.has("words"):
		last["hit_words"] = e
	# (m3: the melded words' looks, called up by what the rules said happened, before the effects take it: main.ts eventsM3)
	m3.event(e)
	# (v3: Volatile's five melds' looks, called up as the ten's are: main.ts eventsV3; m8: the eight's moments, fx.ts handle)
	v3.event(e)
	m8.handle(e)
	uq.handle(e)
	# (m3, v3, m8: a melded word's own bolts, blasts and patches are its look's, not the effects': fx.ts handle, meldOwnsEvent,
	# ownsEventV3; Implode's burst and Forking's arc are melds8.ts's)
	# (w7: the seven last words' events are their looks' own: fx.ts handle, ownsEventW7; their zones too: ownsZoneW7)
	if not (Melds3.owns_event(e) or Volatile3.owns_event(e) or _m8_owns(e) or Words7.owns_event(e)):
		_handle(e)
	# (w10: what the rules said happened, as render/words10.ts eventsW10 reads it)
	w10.event(e)
	# (w7: as render/words7.ts eventsW7 reads it)
	w7.event(e)
	_redraw()


## (fx.ts handle: IMPLODE's burst and FORKING's arc, with their own looks on, are drawn by render/melds8.ts)
static func _m8_owns(e: Dictionary) -> bool:
	var t = e.get("t")
	# (with the switch on, Forking's bolt is Lightning's own, as every bolt bouncing from one to the next is: fx_looks.gd same)
	return (t == "burst" and e.get("meld") == "implode") or (t == "arc" and e.get("meld") == "forking" and not L.same())


## Several at once (fx.ts handle).
func handle(events: Array) -> void:
	for e in events:
		event(e)


func _process(dt: float) -> void:
	advance(dt)


## A frame of `dt` seconds: its effects moved on, what the state shows thrown up, its lights asked for, its layers
## drawn again. (The check stops this node's own _process and calls this itself, a sixtieth at a time; `lights` false for
## a step that no frame is drawn after, so that its lights are not asked for twice.)
func advance(dt: float, lights := true) -> void:
	var t0 := Time.get_ticks_usec() if timing else 0
	# (`real`: the true frame time; `dt` is shorter while the game is holding still: then it is read off the clock)
	var real := dt
	if _held:
		var now := Time.get_ticks_usec()
		real = minf(0.1, (now - _held_tick) / 1000000.0)
		_held_tick = now
	if freeze > 0.0:
		freeze = maxf(0.0, freeze - real)
		if freeze <= 0.0:
			_let_go()
	_find()
	_lit = lights
	update(dt, real)
	uq.update(dt)
	ambient(monsters.list if monsters != null and is_instance_valid(monsters) else [], dt)
	ground.tend(dt)
	if lights:
		_spots()
	_redraw()
	if timing:
		cost_update += Time.get_ticks_usec() - t0
		cost_frames += 1


## After everything else in the frame: what is laid over the figures' own pictures follows them where they now are.
func _late(_dt: float) -> void:
	var t0 := Time.get_ticks_usec() if timing else 0
	figures.follow()
	uq.follow()
	# (w10: his after-images, where he now is)
	w10.follow()
	# (w7: his reflection in glass, the rules' spirits, where they now are: render/words7.ts heroW7, spiritsW7)
	w7.follow()
	# (m3: he is drawn fainter while Scald's steam hides him: render.ts heroAlphaM3)
	m3.follow()
	if timing:
		cost_update += Time.get_ticks_usec() - t0


## (fx.ts follow) What the hero's own shots shed as they fly, by the words in front of them: Power's embers, wind peeling off a Swift
## shot, the mirror's teal off a Twin pair, flames, snow, lightning off an element's, blood off Leeching's, Volatile's crackle,
## Poison's drips. `pace`: the step's length in sixtieths of a second. (A hero's kit calls it each frame with his shots in flight.)
func follow_shots(shots: Array, pace := 1.0) -> void:
	var k := pace * room()
	if k <= 0.0:
		return
	var roll := func(p: float) -> bool: return randf() < p * k
	for p in shots:
		var w: Array = p.get("words", [])
		var x: float = p["x"]
		var y: float = p["y"]
		if w.has("power"):
			for i in 2:
				if roll.call(1.0):
					add(x + L.rnd(-0.12, 0.12), y + L.rnd(-0.12, 0.12), 10.0 + L.rnd(-2, 2), L.rnd(-0.7, 0.7), L.rnd(-0.7, 0.7), L.rnd(-12, 26), L.rnd(0.16, 0.38), L.POWER_HOT[randi() % 4], 2.0 if randf() < 0.35 else 1.0, 60.0)
		# wind peels off a swift shot, straight back along its path
		if w.has("swift") and roll.call(0.8):
			streaks(x, y, 1, L.WIND, 1.5, 5.0, {"dx": -float(p["vx"]), "dy": -float(p["vy"]), "spread": 0.25, "life": 0.16, "z": 10.0, "r": 0.15})
		if w.has("twin") and roll.call(0.9 if int(p.get("n", 0)) > 0 else 0.4):
			add(x + L.rnd(-0.08, 0.08), y + L.rnd(-0.08, 0.08), 10.0, 0.0, 0.0, 0.0, L.rnd(0.2, 0.34), L.pick(L.MIRROR), 2.0 if int(p.get("n", 0)) > 0 and randf() < 0.5 else 1.0, 0.0)
		var el := str(p.get("element", "phys"))
		if el == "fire" and roll.call(0.85):
			flames(x, y, 0.12, 1, 0.6)
			if randf() < 0.2:
				smoke(x, y, 0.1, 1)
		if el == "frost" and roll.call(0.7):
			snow(x, y, 0.2, 1)
		if el == "lightning" and roll.call(0.3):
			var a := randf() * TAU
			ground_bolt(x, y, x + cos(a) * 0.7, y + sin(a) * 0.7)
		if w.has("leech") and roll.call(0.5):
			add(x + L.rnd(-0.1, 0.1), y + L.rnd(-0.1, 0.1), 9.0, 0.0, 0.0, 0.0, L.rnd(0.25, 0.45), L.pick(L.BLOOD), 2.0 if randf() < 0.3 else 1.0, 220.0)
		if w.has("volatile") and roll.call(0.45):
			w610.crackle(x, y, 0.25, 1)
		# a poisoned shot drips as it flies
		if w.has("poison") and roll.call(0.7):
			add(x + L.rnd(-0.1, 0.1), y + L.rnd(-0.1, 0.1), 9.0, 0.0, 0.0, L.rnd(-6, 6), L.rnd(0.3, 0.55), L.pick(L.BUBBLE), 2.0 if randf() < 0.4 else 1.0, 170.0)


## The hero (through the monsters' node), or null.
func hero():
	if monsters == null or not is_instance_valid(monsters):
		return null
	var h = monsters.get("hero")
	return h if h != null and is_instance_valid(h) else null


## Where the hero stands, tiles (fx.ts `hero`); far off if there is none.
func hero_at() -> Vector2:
	var h = hero()
	return h.world if h != null else Vector2(-999, -999)


## What is looked up once the place has given this its monsters: the floor's heights (fx.ts Cam.lift: "whatever is placed
## on the screen through `wy` is lifted with the ground it stands on").
func _find() -> void:
	if _lift_of != null or monsters == null or not is_instance_valid(monsters):
		return
	var map = monsters.get("map")
	if map == null:
		return
	_lift_of = map
	_lifted = false
	for v in map.height:
		if v != 0:
			_lifted = true
			break
	for v in map.stair:
		if v != 0:
			_lifted = true
			break


## Forget everything (fx.ts clear).
func clear() -> void:
	pn = 0
	rifts = []
	floaters = []
	_might_note = null
	rings = []
	slashes = []
	bolts = []
	sky_bolts = []
	whirls = []
	cracks = []
	decals = []
	spikes = []
	flashes = []
	glows = []
	later = []
	freeze = 0.0
	_let_go()
	might_stacks = 0
	might_t = 0.0
	haste_t = 0.0
	_scan_in = 0.0
	wild.clear()
	wild_mage.clear()
	wild_ranger.clear()
	words3.clear()
	ground.clear()
	figures.clear()
	w610.clear()
	m52fx.clear()
	city3.clear()
	w10.clear()
	w7.clear()
	m3.clear()
	v3.clear()
	m8.clear()
	uq.clear()
	_redraw()


## How many of each thing are alive (the check says so beside each picture).
func counts() -> Dictionary:
	return {
		"particles": pn, "rings": rings.size(), "bolts": bolts.size() + sky_bolts.size(), "numbers": floaters.size(),
		"flashes": flashes.size(), "slashes": slashes.size(), "whirls": whirls.size(), "cracks": cracks.size() + words3.patches.size(),
		"decals": decals.size(), "spikes": spikes.size(), "glows": glows.size(), "winds": wild.vortices.size(), "phantoms": figures.ghosts.size(),
	}


# =====================================================================================================================
# Building blocks (fx.ts)

## One more particle, if there is room (fx.ts add: "past it, new ones are simply not made").
func add(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, col: Color, size: float, grav: float, ramp = null, streak := 0.0) -> void:
	if pn >= L.MAX_PARTICLES:
		return
	var i := pn
	pn += 1
	_px[i] = x
	_py[i] = y
	_pz[i] = z
	_pvx[i] = vx
	_pvy[i] = vy
	_pvz[i] = vz
	_plife[i] = life
	_plife0[i] = life
	_pcol[i] = col
	_psize[i] = size
	_pgrav[i] = grav
	_pramp[i] = ramp
	_pstreak[i] = streak


## How much room is left in the air for what only dresses the scene: 1 (plenty) down to 0 (none) (fx.ts room).
func room() -> float:
	return 1.0 if pn <= L.AMBIENT_EASY else maxf(0.0, 1.0 - float(pn - L.AMBIENT_EASY) / float(L.AMBIENT_FULL - L.AMBIENT_EASY))


## Ask for the game to hold still for a moment, at most a few times a second (fx.ts hold).
func hold(sec: float) -> void:
	if _since_hold < 0.2:
		return
	_since_hold = 0.0
	hold_for(sec)


## The game holds still so long, whatever was asked before (wild.ts: `fx.freeze = Math.max(fx.freeze, 0.1)`).
func hold_for(sec: float) -> void:
	freeze = maxf(freeze, sec)
	if holds and freeze > 0.0:
		_hold_on()


func _hold_on() -> void:
	if not _held:
		_held = true
		_held_tick = Time.get_ticks_usec()
		Engine.time_scale = HOLD_PACE


func _let_go() -> void:
	if _held:
		_held = false
		Engine.time_scale = 1.0


## The screen kicked so many game pixels (fx.ts `shake = Math.max(shake, amount)`: the hero's camera carries it, hero.gd kick).
func kick(amount: float) -> void:
	var h = hero()
	if h != null and h.has_method("kick"):
		h.kick(amount)


## A moment of light in the dark (fx.ts glow: no more than 24 of its own; wild.ts adds up to 40).
func glow(x: float, y: float, r: float, dur: float, most := 24) -> void:
	if glows.size() < most:
		glows.append({"x": x, "y": y, "r": r, "t": 0.0, "dur": dur})


func flash(x: float, y: float, z: float, r: float, dur: float, colors: PackedColorArray) -> void:
	flashes.append({"x": x, "y": y, "z": z, "r": r, "t": 0.0, "dur": dur, "colors": colors})


## A ring on the floor; `o`: heavy, delay, closing, jag, double, swirl (fx.ts Ring).
func ring(x: float, y: float, r: float, dur: float, colors: PackedColorArray, fill: bool, o := {}) -> void:
	rings.append({"x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "colors": colors, "fill": fill, "heavy": o.get("heavy", false),
		"delay": o.get("delay", 0.0), "closing": o.get("closing", false), "jag": o.get("jag", false), "double": o.get("double", false),
		"swirl": o.get("swirl", false)})


## A cut; `o`: fast, rev, jag, faint (fx.ts Slash).
func slash(x: float, y: float, a: float, reach: float, dur: float, colors: PackedColorArray, heavy: bool, o := {}) -> void:
	slashes.append({"x": x, "y": y, "a": a, "reach": reach, "t": 0.0, "dur": dur, "colors": colors, "heavy": heavy,
		"fast": o.get("fast", false), "rev": o.get("rev", false), "jag": o.get("jag", false), "faint": o.get("faint", false)})


func after(t: float, fn: Callable) -> void:
	later.append({"t": t, "fn": fn})


## Sparks thrown out all round (fx.ts spray).
func spray(x: float, y: float, n: int, colors: PackedColorArray, speed: float, up: float, z := 8.0) -> void:
	for i in n:
		var a := randf() * TAU
		var s := L.rnd(0.3, 1.0) * speed
		add(x, y, z + L.rnd(-3, 3), cos(a) * s, sin(a) * s, L.rnd(0.4, 1.0) * up, L.rnd(0.25, 0.6), L.pick(colors), 2.0 if randf() < 0.3 else 1.0, 140.0)


## A slow rising mote: embers over fire, sparkles over magic (fx.ts mote).
func mote(x: float, y: float, colors: PackedColorArray) -> void:
	add(x + L.rnd(-0.4, 0.4), y + L.rnd(-0.4, 0.4), L.rnd(0, 6), L.rnd(-0.2, 0.2), L.rnd(-0.2, 0.2), L.rnd(14, 30), L.rnd(0.4, 0.9), L.pick(colors), 1.0, 0.0)


## A number, or a word, that rises (fx.ts float).
func float_text(x: float, y: float, text: String, color: Color, big := false, z := 26.0) -> void:
	# (what rises from the hero begins above the bar of life over their head, not on it)
	var h := hero_at()
	if absf(x - h.x) < 0.3 and absf(y - h.y) < 0.3:
		z = maxf(z, figures.headroom() + (18.0 if big else 15.0))
	# (numbers that rise from the same spot at the same moment are stacked one above another)
	var lift := 0.0
	for f: Dictionary in floaters:
		if f["t"] < 0.3 and absf(f["x"] - x) < 0.45 and absf(f["y"] - y) < 0.45:
			lift += 10.0 if f["big"] else 7.0
	floaters.append({"x": x, "y": y, "z": z + minf(lift, 42.0), "text": text, "color": color, "t": 0.0, "big": big,
		"drift": L.rnd(-3, 3) if lift > 0.0 else L.rnd(-6, 6)})
	if floaters.size() > 60:
		floaters.pop_front()["gone"] = true


## Lines that fly: wind, sparks, shards. Straight out from (x, y); or along `dx`, `dy` if `o` has them. `o`: dx, dy, spread,
## z, up, grav, life, r (fx.ts streaks).
func streaks(x: float, y: float, n: int, colors: PackedColorArray, speed: float, length: float, o := {}) -> void:
	var along: bool = o.has("dx") and o.has("dy")
	var base := atan2(float(o["dy"]), float(o["dx"])) if along else 0.0
	var spread: float = o.get("spread", 0.4)
	var z0: float = o.get("z", 9.0)
	var up: float = o.get("up", 0.0)
	var grav: float = o.get("grav", 0.0)
	var life: float = o.get("life", 0.22)
	var r: float = o.get("r", 0.2)
	for i in n:
		var a := base + L.rnd(-1, 1) * spread if along else randf() * TAU
		var s := L.rnd(0.6, 1.0) * speed
		var d := L.rnd(0.0, r)
		add(x + cos(a) * d, y + sin(a) * d, z0 + L.rnd(-3, 3), cos(a) * s, sin(a) * s, L.rnd(0.3, 1.0) * up, L.rnd(0.6, 1.0) * life, L.pick(colors), 1.0, grav, null, length)


# =====================================================================================================================
# The words' own parts (fx.ts)

## Flames: they rise, cool from white through orange to red, and end as a wisp of smoke (fx.ts flames).
func flames(x: float, y: float, r: float, n: int, up := 1.0) -> void:
	for i in n:
		var a := randf() * TAU
		var d := sqrt(randf()) * r
		add(x + cos(a) * d, y + sin(a) * d, L.rnd(0, 5), L.rnd(-0.3, 0.3), L.rnd(-0.3, 0.3), L.rnd(26, 62) * up, L.rnd(0.32, 0.7), L.P["fr5"], 3.0 if randf() < 0.4 else 2.0, -40.0, L.FLAME)


func smoke(x: float, y: float, r: float, n: int) -> void:
	for i in n:
		var a := randf() * TAU
		var d := sqrt(randf()) * r
		add(x + cos(a) * d, y + sin(a) * d, L.rnd(8, 16), L.rnd(-0.3, 0.3), L.rnd(-0.3, 0.3), L.rnd(16, 34), L.rnd(0.6, 1.2), L.P["st4"], 3.0 if randf() < 0.5 else 2.0, -6.0, L.SMOKE)


## Fire lands: a flash, flames over the whole area, embers, smoke, and the floor is left scorched (fx.ts fireball).
func fireball(x: float, y: float, r: float, big: bool) -> void:
	flash(x, y, 6.0, minf(1.5, r * 0.5), 0.12, PackedColorArray([L.P["white"], L.P["fr6"], L.P["fr5"]]))
	# (a wide blast needs more fire to look as fierce as a small one)
	flames(x, y, r * 0.75, mini(44, _round(10.0 + r * r * 3.6)) if big else 11)
	# a wall of flame round the edge of a big one
	if big:
		var n := mini(34, _round(r * 10.0))
		for i in n:
			var a := float(i) / n * TAU + L.rnd(-0.1, 0.1)
			flames(x + cos(a) * r * 0.92, y + sin(a) * r * 0.92, 0.12, 1, 1.25)
	streaks(x, y, 12 if big else 7, L.EMBER, 4.5, 2.0, {"up": 90.0, "grav": 180.0, "life": 0.5, "r": r * 0.4})
	smoke(x, y, r * 0.5, 6 if big else 3)
	scorch(x, y, r * 0.9)
	glow(x, y, 30.0 + r * 22.0, 0.3)


func scorch(x: float, y: float, r: float) -> void:
	_decal("scorch", x, y, r, 4.5)


## The floor rimed (fx.ts rime).
func rime(x: float, y: float, r: float, dur := 3.4) -> void:
	_decal("frost", x, y, r, dur)


func _decal(kind: String, x: float, y: float, r: float, dur: float) -> void:
	# one mark where several overlap: refresh the biggest
	for d: Dictionary in decals:
		if d["kind"] == kind and Vector2(d["x"] - x, d["y"] - y).length() < 0.5 and d["r"] >= r - 0.2:
			d["t"] = minf(d["t"], 0.02)
			return
	decals.append({"x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "kind": kind, "seed": randi() % 1000000})
	if decals.size() > 36:
		decals.pop_front()


func snow(x: float, y: float, r: float, n: int) -> void:
	for i in n:
		var a := randf() * TAU
		var d := sqrt(randf()) * r
		add(x + cos(a) * d, y + sin(a) * d, L.rnd(12, 30), L.rnd(-0.5, 0.5), L.rnd(-0.5, 0.5), L.rnd(-22, -8), L.rnd(0.7, 1.4), L.pick(L.SNOW), 2.0 if randf() < 0.25 else 1.0, 0.0)


## Splinters of ice thrown out and falling (fx.ts shards).
func shards(x: float, y: float, n: int, speed: float) -> void:
	streaks(x, y, n, L.ICE, speed, 3.0, {"up": 110.0, "grav": 380.0, "life": 0.55, "r": 0.25, "z": 10.0})


## Frost lands: spikes of ice shoot out along the floor from the middle, each ending in an icicle that stands for a moment
## and breaks; snow drifts down; the floor is left rimed (fx.ts iceBurst).
func ice_burst(x: float, y: float, r: float, big: bool) -> void:
	var n := mini(14, _round(6.0 + r * 3.0)) if big else 7
	var a0 := randf() * TAU
	for i in n:
		var a := a0 + float(i) / n * TAU + L.rnd(-0.18, 0.18)
		var r0 := r * (0.45 if big else 0.15)
		var r1 := r * L.rnd(0.82, 1.08)
		spikes.append({"x0": x + cos(a) * r0, "y0": y + sin(a) * r0, "x1": x + cos(a) * r1, "y1": y + sin(a) * r1,
			"tall": L.rnd(4, 10 if big else 7), "t": 0.0, "dur": L.rnd(0.5, 0.8)})
	while spikes.size() > 90:
		spikes.pop_front()
	flash(x, y, 6.0, minf(1.2, r * 0.4), 0.1, PackedColorArray([L.P["white"], L.P["bu5"], L.P["bu4"]]))
	shards(x, y, 10 if big else 6, 5.0 if big else 3.5)
	snow(x, y, r * 0.9, 14 if big else 7)
	rime(x, y, r * 0.95)


## The ice breaks: shards and a puff of snow (fx.ts shatter).
func shatter(x: float, y: float) -> void:
	flash(x, y, 12.0, 0.45, 0.08, PackedColorArray([L.P["white"], L.P["bu5"]]))
	shards(x, y, 12, 4.5)
	snow(x, y, 0.5, 6)


## A bolt from above onto (x, y): a jagged white line, a fork, a flash where it lands (fx.ts skyBolt).
func sky_bolt(x: float, y: float, big: bool) -> void:
	var offs := PackedFloat32Array()
	var drift := 0.0
	for i in 7:
		drift += L.rnd(-7, 7)
		drift *= 0.8
		offs.append(drift)
	var fork := PackedFloat32Array()
	var at := 2 + randi() % 3
	var fx0 := offs[at]
	var side := -1.0 if randf() < 0.5 else 1.0
	for i in 3:
		fx0 += side * L.rnd(4, 9)
		fork.append(at)
		fork.append(fx0)
	sky_bolts.append({"x": x, "y": y, "top": 150.0 if big else 120.0, "offs": offs, "fork": fork, "t": 0.0, "dur": 0.2 if big else 0.16})
	if sky_bolts.size() > 14:
		sky_bolts.pop_front()
	flash(x, y, 6.0, 0.7 if big else 0.45, 0.1, L.VOLT)
	streaks(x, y, 9 if big else 5, L.VOLT, 5.0, 2.0, {"up": 40.0, "grav": 160.0, "life": 0.28, "z": 6.0})
	glow(x, y, 70.0 if big else 46.0, 0.18)


## Lightning along the ground between two points (fx.ts groundBolt).
func ground_bolt(x0: float, y0: float, x1: float, y1: float, colors = null) -> void:
	var pts := PackedFloat32Array([x0, y0])
	var segs := maxi(3, mini(7, _round(Vector2(x1 - x0, y1 - y0).length() * 1.6)))
	for i in range(1, segs):
		var k := float(i) / segs
		pts.append(x0 + (x1 - x0) * k + L.rnd(-0.32, 0.32))
		pts.append(y0 + (y1 - y0) * k + L.rnd(-0.32, 0.32))
	pts.append(x1)
	pts.append(y1)
	bolts.append({"pts": pts, "t": 0.0, "colors": colors if colors != null else L.VOLT})
	if bolts.size() > 40:
		bolts.pop_front()


## Poison: bubbles of it rise from (x, y), swell and are gone (fx.ts bubbles).
func bubbles(x: float, y: float, r: float, n: int) -> void:
	for i in n:
		var a := randf() * TAU
		var d := sqrt(randf()) * r
		add(x + cos(a) * d, y + sin(a) * d, L.rnd(2, 12), L.rnd(-0.25, 0.25), L.rnd(-0.25, 0.25), L.rnd(9, 24), L.rnd(0.45, 0.95), L.P["vn4"], 3.0 if randf() < 0.35 else 2.0, -8.0, L.BUBBLE)


## Poison lands: it spatters out low over the floor, a ring of it runs to the edge, and the place bubbles (fx.ts venomSplash).
func venom_splash(x: float, y: float, r: float, big: bool) -> void:
	flash(x, y, 5.0, minf(1.2, r * 0.4), 0.12, PackedColorArray([L.P["white"], L.P["vn5"], L.P["vn4"]]))
	ring(x, y, r, 0.34, L.VENOM, true, {"heavy": big})
	ring(x, y, r * 0.7, 0.3, L.VENOM, false, {"delay": 0.08})
	# droplets thrown out low, that fall and stick
	var n := mini(30, _round(10.0 + r * 7.0)) if big else 9
	var drops := L.rest(L.VENOM)
	for i in n:
		var a := randf() * TAU
		var s := L.rnd(1.2, 5.0 if big else 3.2)
		add(x + cos(a) * 0.15, y + sin(a) * 0.15, L.rnd(3, 8), cos(a) * s, sin(a) * s, L.rnd(30, 90), L.rnd(0.4, 0.8), L.pick(drops), 3.0 if randf() < 0.4 else 2.0, 330.0)
	bubbles(x, y, r * 0.8, mini(18, _round(6.0 + r * 4.0)) if big else 5)
	# it goes on bubbling for a moment after
	for k in range(1, 4):
		after(0.16 * k, func(): bubbles(x, y, r * 0.8, 5 if big else 2))
	glow(x, y, 26.0 + r * 16.0, 0.3)


## A breath of wind round (x, y): Swift (fx.ts gust).
func gust(x: float, y: float, r: float) -> void:
	ring(x, y, r, 0.22, L.WIND, false, {"swirl": true, "heavy": true})
	ring(x, y, r * 0.7, 0.2, L.WIND, false, {"swirl": true, "delay": 0.04})
	streaks(x, y, 12, L.WIND, r / 0.14, 9.0, {"life": 0.18, "z": 3.0, "r": r * 0.25})


## The mark of the Power word where a hit lands: the floor cracks and glows, stone is thrown up, sparks fly, the screen
## kicks. `big` is an area ability (cracks out to its edge); otherwise the knock of a single hit (fx.ts powerImpact).
func power_impact(x: float, y: float, r: float, big: bool) -> void:
	var n := 7 if big else 4
	var a0 := randf() * TAU
	for k in n:
		var a := a0 + float(k) / n * TAU + L.rnd(-0.25, 0.25)
		var length := r * L.rnd(0.7, 1.1)
		var segs := 5 if big else 3
		var pts := PackedFloat32Array([x + cos(a) * r * 0.1, y + sin(a) * r * 0.1])
		for i in range(1, segs + 1):
			var d := length * i / segs
			var j := L.rnd(-0.2, 0.2) * (1.0 if i < segs else 0.4)
			pts.append(x + cos(a) * d - sin(a) * j)
			pts.append(y + sin(a) * d + cos(a) * j)
		cracks.append({"pts": pts, "t": 0.0, "dur": 2.4 if big else 1.5, "hot": 0.55 if big else 0.32})
		# a short fork off the middle of a long crack
		if big and randf() < 0.55:
			var m := 2 * (1 + segs / 2)
			var b := a + (0.8 if randf() < 0.5 else -0.8)
			var bl := length * L.rnd(0.25, 0.4)
			cracks.append({"pts": PackedFloat32Array([pts[m], pts[m + 1], pts[m] + cos(b) * bl * 0.5 + L.rnd(-0.08, 0.08), pts[m + 1] + sin(b) * bl * 0.5 + L.rnd(-0.08, 0.08), pts[m] + cos(b) * bl, pts[m + 1] + sin(b) * bl]),
				"t": 0.0, "dur": 2.0, "hot": 0.4})
	while cracks.size() > 70:
		cracks.pop_front()
	# stone thrown up: heavier and bigger than sparks, and it falls fast
	for i in (18 if big else 7):
		var a := randf() * TAU
		var d := L.rnd(0.1, 0.6) * r
		var sp := L.rnd(1.5, 5.0 if big else 3.5)
		add(x + cos(a) * d, y + sin(a) * d, 1.0, cos(a) * sp, sin(a) * sp, L.rnd(70, 190 if big else 130), L.rnd(0.45, 0.85), L.pick(L.STONE), 3.0 if randf() < 0.45 else 2.0, 430.0)
	spray(x, y, 16 if big else 9, L.POWER_HOT, 5.5 if big else 4.0, 100.0, 6.0)
	flash(x, y, 3.0 if big else 10.0, minf(1.6, r * 0.5) if big else 0.55, 0.11, L.POWER_HOT)
	kick(5.5 if big else 3.2)
	hold(0.07 if big else 0.045)


## "of Swiftness": wind streams off a hasted hero as they run (fx.ts hasteWake).
func haste_wake(x: float, y: float, dx: float, dy: float) -> void:
	streaks(x, y, 2, L.WIND, 3.0, 5.0, {"dx": -dx, "dy": -dy, "spread": 0.5, "life": 0.2, "z": 4.0, "r": 0.25})


# =====================================================================================================================
# The tellings (fx.ts handle: one `case` a telling)

## The game's Math.round (halves go up), as a whole number.
static func _round(v: float) -> int:
	return int(floorf(v + 0.5))


static func _has(w, id: String) -> bool:
	return w != null and id in w


## A number as the game writes it into a line (`${e.amount}`).
static func _num(v) -> String:
	var n := float(v)
	return str(int(n)) if n == floorf(n) else str(n)


## An element's colours, dark to light (fx.ts ramp; a Mage's untyped damage in arcane purple is the Mage's, left out).
## (fx.ts magic) The Mage's colours for an element, brightest first: her arcane violet where there is none.
func _magic(el: String) -> PackedColorArray:
	return L.turned(_ramp("arcane" if el == "phys" else el)) if L.EL.has("arcane" if el == "phys" else el) else _ramp(el)


func _ramp(el: String) -> PackedColorArray:
	return L.EL.get(el, L.EL["phys"])


func _handle(e: Dictionary) -> void:
	# (left out: what the other classes', the unique items' and the melded words' own effects make of a telling, and a
	# telling a melded word's own look takes for itself: fx.ts handle, its first lines)
	match str(e.get("t", "")):
		"hit":
			_hit(e)
		"poisoned":
			# poison takes hold: a sour puff closes on it
			ring(e["x"], e["y"], 0.7, 0.26, L.VENOM, true, {"closing": true})
			bubbles(e["x"], e["y"], 0.3, 6)
		"swing":
			_swing(e)
		"burst":
			_burst(e)
		"arc":
			# (left out: a melded word's arc, Forking's)
			if e.get("sky", false):
				sky_bolt(e["x1"], e["y1"], false)
			else:
				ground_bolt(e["x0"], e["y0"], e["x1"], e["y1"])
				flash(e["x1"], e["y1"], 10.0, 0.3, 0.08, L.VOLT)
				streaks(e["x1"], e["y1"], 4, L.VOLT, 4.0, 2.0, {"up": 30.0, "grav": 120.0, "life": 0.22, "z": 12.0})
		"buff":
			_buff(e)
		"ignite":
			flames(e["x"], e["y"], 0.3, 7)
			flash(e["x"], e["y"], 10.0, 0.3, 0.08, PackedColorArray([L.P["fr6"], L.P["fr5"]]))
		"freeze":
			# it freezes solid: ice bursts up round it
			ice_burst(e["x"], e["y"], 0.8, false)
		"shatter":
			# (ice breaking: also seen for itself as a frozen monster thaws or dies, fx_figures.gd; shown once)
			if not figures.broke_lately(e["x"], e["y"]):
				figures.broke(e["x"], e["y"])
				shatter(e["x"], e["y"])
		# (Heavy's weight, a stun and a stagger are the new words' looks: render/words3.ts events3)
		"heavy":
			words3.heavy_hit(e["x"], e["y"], e["r"], e.get("big", false))
		"stun":
			# (m3: a melded word's stun has a look of its own, fx_melds3.gd's: words3.ts events3)
			var m = _monster_of(e) if e.get("meld") == null else null
			if m != null:
				words3.stun(m, float(e.get("secs", 0.0)))
		"stagger":
			var m = _monster_of(e)
			if m != null:
				words3.stagger(m, float(e.get("fromX", m.world.x)), float(e.get("fromY", m.world.y)))
				words3.grit(m.world.x, m.world.y, 6)
		"zone":
			ground.laid(str(e.get("kind", "")), e["x"], e["y"], e["r"], true)
			if e.get("kind", "") == "rune":
				# a rune is written (a ward is the new words' look: fx_words610.gd draws it from the wakes' list)
				ring(e["x"], e["y"], 1.0, 0.22, L.VIOLET, false, {"closing": true})
				w610.crackle(e["x"], e["y"], 0.5, 4)
		"cast":
			_cast(e)
		"channel":
			if e.get("kind", "") == "whirl":
				wild.whirl_start(e["x"], e["y"])
		"channelEnd":
			if e.get("kind", "") == "whirl":
				wild.whirl_end(e["x"], e["y"])
		"bells":
			_bells(e)
		"arrive":
			# (ARRIVALS, render/arrivals.ts: a rift opening in the floor under one coming in)
			if e.get("what", "") == "open" and rifts.size() < 40:
				rifts.append({"x": e["x"], "y": e["y"], "t": -float(e.get("delay", 0.0)), "out": float(e["secs"]), "dur": float(e["secs"]) + 0.4, "r": float(e["r"]), "seed": randi() % 1000000})
		"spark":
			spray(e["x"], e["y"], int(e.get("n", 10)), _ramp(str(e.get("el", "phys"))), 2.4, 60.0, 10.0)
		"spread":
			# (THE WARLOCK: a cursed one's burns leaping to those near it: heroes/warlock_look.gd)
			var hw = hero()
			if hw != null and hw.get("kit") != null and hw.kit.look != null and is_instance_valid(hw.kit.look) and hw.kit.look.has_method("spread"):
				hw.kit.look.spread(e)
		"wave":
			# (THE MAGE: the staff is swung: a breath of light leaves it the way the wave goes; big and wild, let go with a blast)
			var cs := L.MIRROR if e.get("echo", false) else _magic(str(e["el"]))
			flash(float(e["x"]) + float(e["dx"]) * 0.5, float(e["y"]) + float(e["dy"]) * 0.5, 12.0, 0.4, 0.09, cs)
			streaks(float(e["x"]) + float(e["dx"]) * 0.4, float(e["y"]) + float(e["dy"]) * 0.4, 6, cs, 5.0, 6.0, {"dx": e["dx"], "dy": e["dy"], "spread": 0.9, "life": 0.18, "z": 10.0})
			wild_mage.cast(e["x"], e["y"], e["dx"], e["dy"], e.get("echo", false))
		"orbSet":
			# (the staff comes down: a pulse runs out round the caster, and the orb is there; big and wild, a great bolt to it)
			var cs := _magic(str(e["el"]))
			var hp := hero_at()
			ring(hp.x, hp.y, 1.25, 0.22, cs, false)
			spray(hp.x, hp.y, 6, cs, 2.2, 30.0, 2.0)
			flash(e["x"], e["y"], 13.0, 0.55, 0.12, cs)
			for i in 8:
				mote(e["x"], e["y"], cs)
			wild_mage.orb_set(e["x"], e["y"])
		"orbEnd":
			var cs := _magic(str(e["el"]))
			flash(e["x"], e["y"], 13.0, 0.3, 0.1, cs)
			for i in 6:
				mote(e["x"], e["y"], cs)
		_:
			# (floors 6 to 10's words' own tellings: echo, mark, leech, orb, markOn, markSpent, frenzy, frenzyFed, shield,
			# guarded, blocked)
			if str(e.get("t", "")) == "m52":
				m52fx.handle(e)
			elif not city3.handle(e):
				w610.handle(e)


## THE BELLS (fx.ts 'bells'; game/bells.ts): the Hush pouring out of the Muffled Bell (`start`); a bell's ring, the friend's cyan
## (his to ring), knocking back what is near it, its count over it (`ring`; an unstruck page laid rings so too, act2/quest1115.gd);
## one of the Hush rising out of its fog (`rise`); the Hush shattering in the explosion (`won`), or lifting as the clock runs out
## (`lost`).
const HUSH_GREY := ["#e2dfe8", "#b8b4c6", "#8e8aa0", "#6a6680"]
const BELL_CYAN := ["#22d0e0", "#b8fff8", "#0c6a80"]
const BELL_BURST := ["#ffffff", "#b8fff8", "#22d0e0"]


func _bells(e: Dictionary) -> void:
	var x: float = e["x"]
	var y: float = e["y"]
	var hush := PackedColorArray(HUSH_GREY.map(func(c): return Color(c)))
	var cyan := PackedColorArray(BELL_CYAN.map(func(c): return Color(c)))
	var burst := PackedColorArray(BELL_BURST.map(func(c): return Color(c)))
	match str(e.get("what", "")):
		"start":
			ring(x, y, 2.6, 0.7, hush, true, {"heavy": true})
			ring(x, y, 5.0, 1.1, hush, false, {"delay": 0.15})
			for i in 4:
				spray(x, y, 10, hush, 1.6 + i * 0.4, 40.0 + i * 20.0, 20.0)
			kick(3.0)
		"ring":
			ring(x, y, 1.4, 0.35, cyan, true, {"heavy": true})
			ring(x, y, 3.5, 0.55, cyan, false, {"delay": 0.05})
			ring(x, y, 5.5, 0.8, cyan, false, {"delay": 0.18})
			spray(x, y, 14, cyan, 3.0, 90.0, 22.0)
			if int(e.get("k", 0)) > 0 and int(e.get("n", 0)) > 0:
				float_text(x, y, "%d / %d" % [int(e["k"]), int(e["n"])], cyan[1], true, 40.0)
			kick(2.5)
		"rise":
			spray(x, y, 8, hush, 1.2, 60.0, 6.0)
		"won":
			ring(x, y, 3.0, 0.4, burst, true, {"heavy": true})
			ring(x, y, 7.0, 0.9, cyan, false, {"delay": 0.1})
			for i in 5:
				spray(x, y, 14, cyan if i % 2 == 1 else burst, 3.0 + i, 120.0 + i * 30.0, 26.0)
			kick(6.0)
			hold(0.08)
		"lost":
			ring(x, y, 4.0, 1.4, hush, false)


## The monster a telling is of: its `id` the monster itself or its instance id; failing both, the one nearest (x, y).
func _monster_of(e: Dictionary):
	var id = e.get("id")
	if id is Object and is_instance_valid(id):
		return id
	if id is int or id is float:
		var o = instance_from_id(int(id))
		if o != null and is_instance_valid(o) and o.get("world") != null:
			return o
	if monsters == null or not is_instance_valid(monsters) or not e.has("x"):
		return null
	var best = null
	var near := 0.6
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead:
			var d: float = m.world.distance_to(Vector2(e["x"], e["y"]))
			if d < near:
				near = d
				best = m
	return best


## A move used with words on it (fx.ts case 'cast'): every word behind it stirs at the hero's feet.
func _cast(e: Dictionary) -> void:
	# (left out: the launch of a shot, a wave or a volley, the other classes'; the gust heard with Swift in front)
	var x: float = e["x"]
	var y: float = e["y"]
	if e.get("echo", false):
		# the phantom lets go
		flash(x, y, 12.0, 0.5, 0.1, L.MIRROR)
		spray(x, y, 8, L.MIRROR, 2.4, 70.0, 10.0)
		return
	var white: Color = L.P["white"]
	for b in e.get("behind", []):
		# (left out: the words that are not a Warrior's of floors 1 to 10)
		if not str(b) in CAST_WORDS and not L.HUE.has(str(b)):
			continue
		var hue: Color = L.HUE[str(b)]
		# (Might, Swiftness and Echoes have their own sign round the hero; the others get a pulse)
		if b != "power" and b != "swift" and b != "twin":
			ring(x, y, 0.7, 0.2, PackedColorArray([white, hue, hue]), false)
		for i in 4:
			var a := randf() * TAU
			add(x + cos(a) * 0.35, y + sin(a) * 0.35, 1.0, cos(a) * 0.5, sin(a) * 0.5, L.rnd(30.0, 60.0), L.rnd(0.3, 0.55), white if i == 0 else hue, 1.0, 30.0)


## A blow landed (fx.ts case 'hit').
func _hit(e: Dictionary) -> void:
	var x: float = e["x"]
	var y: float = e["y"]
	var on_hero: bool = e.get("onHero", false)
	var amount := _num(e.get("amount", 0))
	if e.get("poison", false):
		# poison working: its own colour, a bubble, and no more than that (it ticks all the time)
		float_text(x, y, "-" + amount if on_hero else amount, L.P["vn4"] if on_hero else L.P["vn5"], false, 30.0 if on_hero else 22.0)
		if randf() < 0.6:
			bubbles(x, y, 0.2, 1)
		return
	var el: String = e.get("el", "phys")
	var ramp := _ramp(el)
	var crit: bool = e.get("crit", false)
	var heavy: bool = e.get("heavy", false)
	# (big and wild: what his blade hits is struck hard, and what it is made of flies off it)
	if not on_hero:
		if not wild_mage.hit(x, y) and not wild_ranger.hit(x, y):
			wild.hit(x, y)
	if on_hero:
		float_text(x, y, "-" + amount, L.P["bl4"], false, 30.0)
	else:
		float_text(x, y, amount + "!" if crit else amount, L.P["gd4"] if crit else (L.P["white"] if el == "phys" else ramp[ramp.size() - 2]), crit or heavy)
	spray(x, y, 5 if on_hero else 3, PackedColorArray([L.P["bl4"], L.P["bl3"]]) if on_hero else ramp, 2.2, 50.0, 12.0)
	# (m3: a melded word's own look stands in for its two words' marks, and for Power's weight: fx.ts meldLookWords)
	var w = Melds3.look_words(e.get("words"))
	if heavy and is_same(w, e.get("words")):
		# Power lands: a burst of light on the target, and the game holds its breath
		flash(x, y, 12.0, 0.5, 0.1, L.POWER_HOT)
		spray(x, y, 6, L.POWER_HOT, 3.5, 80.0, 12.0)
		kick(2.6)
		hold(0.045)
	# each word in front leaves its own mark on what it hits
	if _has(w, "swift"):
		streaks(x, y, 6, L.WIND, 9.0, 6.0, {"life": 0.13, "z": 12.0})
		ring(x, y, 0.62, 0.16, L.WIND, false, {"swirl": true})
	if _has(w, "twin"):
		spray(x, y, 4, L.MIRROR, 2.6, 60.0, 12.0)
	if _has(w, "leech"):
		streaks(x, y, 4, L.BLOOD, 2.4, 2.0, {"up": 60.0, "grav": 300.0, "life": 0.4, "z": 12.0})
	if _has(w, "volatile"):
		w610.pop(x, y)
	# (PRECISE, words3.ts events3: a hit that spends a mark shows the critical, not the plain Precise hit)
	if not on_hero and _has(w, "precise") and not w610.spent_here(x, y):
		var hh: Vector2 = hero_at()
		w610.precise_hit(x, y, x - hh.x, y - hh.y)
	if _has(w, "fire"):
		flames(x, y, 0.25, 3)
		streaks(x, y, 3, L.EMBER, 3.5, 2.0, {"up": 70.0, "grav": 180.0, "life": 0.4})
	if _has(w, "frost"):
		shards(x, y, 3, 3.0)
		snow(x, y, 0.3, 3)
	if _has(w, "lightning"):
		streaks(x, y, 5, L.VOLT, 5.0, 2.0, {"up": 30.0, "grav": 120.0, "life": 0.22, "z": 12.0})
	if _has(w, "poison"):
		streaks(x, y, 5, L.rest(L.VENOM), 2.6, 2.0, {"up": 70.0, "grav": 300.0, "life": 0.4, "z": 12.0})
		bubbles(x, y, 0.25, 3)


## A blade swung (fx.ts case 'swing').
func _swing(e: Dictionary) -> void:
	var x: float = e["x"]
	var y: float = e["y"]
	var dx: float = e["dx"]
	var dy: float = e["dy"]
	var reach: float = e["reach"]
	var el: String = e.get("el", "phys")
	var w = e.get("words")
	var heavy := _has(w, "power")
	var plain := PackedColorArray([L.P["sl5"], L.P["sl4"], L.P["sl3"]]) if el == "phys" else L.turned(_ramp(el))
	var a := atan2(dy, dx)
	# Power on a plain blade burns white-hot; on an element it keeps the element's colours
	var colors := L.POWER_HOT if heavy and el == "phys" else plain
	var fast := _has(w, "swift")
	var second := int(e.get("n", 0)) > 0
	var echo: bool = e.get("echo", false)
	if el == "phys" and not heavy:
		if fast:
			colors = L.WIND
		elif _has(w, "leech"):
			colors = PackedColorArray([L.P["white"], L.P["bl5"], L.P["bl4"]])
		elif _has(w, "volatile"):
			colors = PackedColorArray([L.P["white"], L.P["pu5"], L.P["pu4"]])
		elif _has(w, "poison"):
			colors = PackedColorArray([L.P["white"], L.P["vn5"], L.P["vn4"]])
	# (Twin's second cut and an echo's, in the mirror's teal)
	if second and el == "phys" and not heavy:
		colors = L.MIRROR
	if echo:
		colors = L.MIRROR
	# (big and wild: a crescent of the friend's light in place of the plain cut, with wind off its edge and dust: fx_wild.gd)
	var combo := int(e.get("combo", figures.hero_combo()))
	var drawn := wild.swing(x, y, dx, dy, reach, not heavy and not fast and not second and el == "phys", combo == 1, echo)
	if not drawn:
		slash(x, y, a, reach, 0.13 if fast else (0.24 if heavy else 0.16), colors, heavy, {"fast": fast, "rev": second, "jag": el == "lightning", "faint": echo})
	var tip_x := x + dx * reach * 0.85
	var tip_y := y + dy * reach * 0.85
	if fast:
		# wind thrown off the cut, and a blur of the hero behind it
		streaks(x + dx * reach * 0.4, y + dy * reach * 0.4, 11, L.WIND, 11.0, 11.0, {"dx": dx, "dy": dy, "spread": 0.9, "life": 0.16, "z": 10.0, "r": reach * 0.5})
		if not echo:
			figures.phantom(x - dx * 0.6, y - dy * 0.6, dx, dy, L.P["gn4"], 0.18, 0.0, 0.42)
			figures.phantom(x - dx * 1.2, y - dy * 1.2, dx, dy, L.P["gn3"], 0.26, 0.0, 0.24)
	if second and not echo:
		# the twin: a phantom beside the hero makes the second cut
		figures.phantom(x + dy * 0.7, y - dx * 0.7, dx, dy, L.P["tl4"], 0.32, 0.0, 0.85)
		spray(x + dy * 0.7, y - dx * 0.7, 8, L.MIRROR, 2.2, 70.0, 10.0)
		flash(x + dy * 0.7, y - dx * 0.7, 14.0, 0.3, 0.09, L.MIRROR)
	if el == "fire":
		# flames stand along the path of the blade
		for i in 6:
			var b := a + (i / 5.0 - 0.5) * 1.6
			flames(x + cos(b) * reach * 0.88, y + sin(b) * reach * 0.88, 0.1, 1)
		streaks(tip_x, tip_y, 4, L.EMBER, 4.0, 2.0, {"dx": dx, "dy": dy, "spread": 1.2, "up": 60.0, "grav": 160.0, "life": 0.4})
	elif el == "frost":
		for i in 5:
			var b := a + (i / 4.0 - 0.5) * 1.6
			shards(x + cos(b) * reach * 0.88, y + sin(b) * reach * 0.88, 1, 2.5)
		snow(tip_x, tip_y, 0.6, 4)
	elif el == "lightning":
		var b := a + L.rnd(-0.6, 0.6)
		ground_bolt(x + cos(a - 0.7) * reach * 0.9, y + sin(a - 0.7) * reach * 0.9, x + cos(a + 0.7) * reach * 0.9, y + sin(a + 0.7) * reach * 0.9)
		streaks(x + cos(b) * reach, y + sin(b) * reach, 4, L.VOLT, 4.0, 2.0, {"life": 0.2})
	if _has(w, "leech"):
		streaks(tip_x, tip_y, 5, L.BLOOD, 2.0, 2.0, {"dx": dx, "dy": dy, "spread": 1.4, "up": 20.0, "grav": 260.0, "life": 0.4, "z": 12.0, "r": 0.4})
	if _has(w, "volatile"):
		for i in 3:
			var b := a + L.rnd(-0.8, 0.8)
			w610.crackle(x + cos(b) * reach * 0.9, y + sin(b) * reach * 0.9, 0.15, 1)
	if _has(w, "poison"):
		# venom flies off the blade along its path
		var drops := L.rest(L.VENOM)
		for i in 5:
			var b := a + (i / 4.0 - 0.5) * 1.6
			streaks(x + cos(b) * reach * 0.88, y + sin(b) * reach * 0.88, 1, drops, 2.4, 2.0, {"dx": cos(b), "dy": sin(b), "spread": 0.5, "up": 30.0, "grav": 260.0, "life": 0.35, "z": 11.0})
		bubbles(tip_x, tip_y, 0.3, 2)


## An area struck (fx.ts case 'burst').
func _burst(e: Dictionary) -> void:
	var x: float = e["x"]
	var y: float = e["y"]
	var r: float = e["r"]
	var el: String = e.get("el", "phys")
	var style: String = e.get("style", "shock")
	# (THE TINKERER's vials, her Golem's pound and her bomb: drawn by heroes/tinkerer_look.gd, render/tinkerer_fx.ts)
	if style == "vial" or style == "pound" or style == "bomb":
		return
	# (THE WARRIOR'S EARTHQUAKE: its ground heaves in the floor's stone in place of the slam ring: heroes/warrior_arms_look.gd)
	if style == "slam" and claims_slam.is_valid() and claims_slam.call(x, y):
		return
	# (m3: as for a hit: fx.ts meldLookWords)
	var w = Melds3.look_words(e.get("words"))
	var ramp := _ramp(el)
	var power := _has(w, "power")
	var area := style != "shock"
	var P: Dictionary = L.P
	# (left out: the other classes' styles and their own looks: the Warrior's Earthquake,
	# a warp, an orb's wave, a comet; a melded word's burst)
	var second := int(e.get("n", 0)) > 0
	var echo: bool = e.get("echo", false)
	# (big and wild, fx_wild.gd: a whirlwind's turn, the thrust's landing, Volatile's blast; a trap going off in wind is the
	# Ranger's)
	if not echo:
		if style == "whirl":
			wild.whirl_turn(x, y, r)
		elif style == "land":
			wild.landing(x, y, r)
		elif style == "warp":
			wild_mage.warp(x, y)
		elif style == "nova":
			wild_mage.nova(x, y, r)
		elif style == "blast":
			wild_ranger.blast(x, y, r)
	if style == "ruin":
		# a rune goes off
		ring(x, y, r, 0.3, L.VIOLET, true, {"heavy": true})
		w610.ruin(x, y, r, true)
		return
	if style == "whirl":
		# One turn of a whirlwind: the path of the blade, in the colours a sword cut has, and a little of whatever the
		# blade carries thrown off round it. (It comes three times a second: no fireballs.)
		var quick := _has(w, "swift")
		var cs := L.POWER_HOT if power and el == "phys" else (PackedColorArray([P["sl5"], P["sl4"], P["sl3"]]) if el == "phys" else L.turned(ramp))
		if el == "phys" and not power:
			if quick:
				cs = L.WIND
			elif _has(w, "leech"):
				cs = PackedColorArray([P["white"], P["bl5"], P["bl4"]])
			elif _has(w, "volatile"):
				cs = PackedColorArray([P["white"], P["pu5"], P["pu4"]])
			elif _has(w, "poison"):
				cs = PackedColorArray([P["white"], P["vn5"], P["vn4"]])
		if echo or (second and el == "phys" and not power):
			cs = L.MIRROR
		whirls.append({"x": x, "y": y, "r": r, "t": 0.0, "dur": 0.22 if quick else 0.3, "colors": cs, "heavy": power, "jag": el == "lightning", "faint": echo, "rev": second})
		if power:
			kick(1.2)
		var bits := 2 if echo else 4
		var a0 := randf() * TAU
		for i in bits:
			var a := a0 + float(i) / bits * TAU
			var bx := x + cos(a) * r * 0.85
			var by := y + sin(a) * r * 0.85
			if el == "fire":
				flames(bx, by, 0.2, 1)
			elif el == "frost":
				snow(bx, by, 0.3, 2)
			elif el == "lightning":
				streaks(bx, by, 2, L.VOLT, 4.0, 2.0, {"life": 0.2})
			if quick:
				streaks(bx, by, 1, L.WIND, 9.0, 8.0, {"dx": -sin(a), "dy": cos(a), "spread": 0.2, "life": 0.15, "z": 10.0})
			if _has(w, "leech") and i % 2 == 0:
				streaks(bx, by, 1, L.BLOOD, 2.0, 2.0, {"up": 20.0, "grav": 240.0, "life": 0.4, "z": 10.0})
			if _has(w, "volatile") and i % 2 == 1:
				w610.crackle(bx, by, 0.15, 1)
			if _has(w, "poison") and i % 2 == 0:
				bubbles(bx, by, 0.2, 1)
		return
	var colors := (PackedColorArray([P["st7"], P["st6"], P["er5"]]) if el == "phys" else ramp) if style == "slam" or style == "land" else ramp
	var fast := _has(w, "swift")
	if el == "phys" and not power:
		if fast:
			colors = L.WIND
		elif _has(w, "leech"):
			colors = L.BLOOD
		elif _has(w, "volatile"):
			colors = L.VIOLET
		elif _has(w, "poison"):
			colors = L.VENOM
	if echo:
		colors = L.MIRROR
	elif second and el == "phys":
		colors = L.MIRROR
	if area:
		ring(x, y, r, 0.14 if fast else (0.32 if style == "nova" else 0.26), colors, style != "warp" and not echo, {"heavy": power, "jag": el == "lightning", "double": second or echo})
	if power:
		# Power's own mark, on top of whatever the ability does
		power_impact(x, y, r, area)
		ring(x, y, r * (1.12 if area else 1.0), 0.34 if area else 0.22, L.POWER_HOT if el == "phys" else ramp, false, {"heavy": area, "delay": 0.07 if area else 0.0})
	if not area:
		return
	if style == "warp":
		# (the Mage's warp: motes where she went from and where she came out)
		for i in 14:
			mote(x, y, PackedColorArray([P["tl5"], P["tl4"], P["white"]]))
		return
	# the element's body
	if el == "fire":
		fireball(x, y, r, r > 1.7)
	elif el == "frost":
		ice_burst(x, y, r, r > 1.7)
	elif el == "lightning":
		# bolts run out from the middle to the edge, and one comes down in the centre
		var n := mini(7, _round(3.0 + r))
		var a0 := randf() * TAU
		for i in n:
			var a := a0 + float(i) / n * TAU + L.rnd(-0.3, 0.3)
			ground_bolt(x, y, x + cos(a) * r * 0.95, y + sin(a) * r * 0.95)
		if r > 1.7:
			sky_bolt(x, y, true)
		streaks(x, y, 8, L.VOLT, r * 3.0, 2.0, {"life": 0.25, "r": r * 0.6})
	else:
		for i in mini(40, _round(8.0 + r * 9.0)):
			var a := randf() * TAU
			var d := L.rnd(0.2, 1.0) * r
			add(x + cos(a) * d, y + sin(a) * d, 1.0, cos(a) * L.rnd(1, 3), sin(a) * L.rnd(1, 3), L.rnd(30, 80), L.rnd(0.25, 0.55), L.pick(colors), 2.0 if randf() < 0.4 else 1.0, 160.0)
	# the other words, each in its own colour and shape
	if fast:
		# the blast is there at once, and a whirl of wind tears outward past its edge
		ring(x, y, r * 1.25, 0.24, L.WIND, false, {"swirl": true, "heavy": true})
		ring(x, y, r * 0.8, 0.2, L.WIND, false, {"swirl": true, "delay": 0.05})
		streaks(x, y, 20, L.WIND, r / 0.1, 12.0, {"life": 0.17, "z": 3.0, "r": r * 0.3})
		kick(1.4)
	if second and not echo:
		# the twin: a phantom of the hero on the far side of the blast brings down the second one
		var hh: Vector2 = hero_at()
		var px := 2.0 * x - hh.x
		var py := 2.0 * y - hh.y
		var far := Vector2(px, py).distance_to(hh) > 0.6
		var gxx := px if far else x + 0.8
		var gyy := py if far else y - 0.8
		var gl := maxf(0.0001, Vector2(x - gxx, y - gyy).length())
		figures.phantom(gxx, gyy, (x - gxx) / gl, (y - gyy) / gl, P["tl4"], 0.36, 0.0, 0.85)
		flash(gxx, gyy, 14.0, 0.32, 0.1, L.MIRROR)
		spray(gxx, gyy, 8, L.MIRROR, 2.2, 70.0, 8.0)
		ring(x, y, r * 0.9, 0.28, L.MIRROR, true, {"heavy": true, "delay": 0.03})
	elif echo and el != "phys":
		ring(x, y, r * 0.9, 0.24, L.MIRROR, false, {"delay": 0.04})
	if _has(w, "leech"):
		# the blast pulls back toward its middle
		ring(x, y, r, 0.3, L.BLOOD, false, {"closing": true, "delay": 0.08, "heavy": r > 1.7})
		streaks(x, y, mini(24, _round(6.0 + r * 5.0)), L.BLOOD, 2.5, 2.0, {"up": 70.0, "grav": 240.0, "life": 0.45, "r": r * 0.8})
	if _has(w, "poison"):
		venom_splash(x, y, r, r > 1.7)
	if _has(w, "volatile"):
		if style == "blast" and w is Array and (w as Array).size() == 1:
			# (what Volatile in front killed, going off)
			w610.ruin(x, y, r, false)
		else:
			w610.unstable(x, y, r)
			ring(x, y, r * 0.85, 0.24, L.VIOLET, false, {"jag": true, "heavy": true, "delay": 0.06})


## The hero's own (fx.ts case 'buff').
func _buff(e: Dictionary) -> void:
	var x: float = e["x"]
	var y: float = e["y"]
	if e.get("kind", "") == "haste":
		# Swift behind: a gust lifts round the hero
		gust(x, y, 1.3)
		streaks(x, y, 8, L.WIND, 0.6, 5.0, {"up": 150.0, "life": 0.3, "z": 2.0, "r": 0.5})
		# (and while it lasts he leaves afterimages and a wake of wind: render.ts, by his hasteT; game.ts boons: 3 s)
		haste_t = float(e.get("secs", 3.0))
		return
	# Power behind: strength is drawn in from all round and stacks up, an ember for each stack
	var stacks := int(e.get("stacks", 1))
	var full := stacks >= 5
	var grew := stacks > might_stacks
	might_stacks = stacks
	might_t = 5.0
	# (one that only keeps the might up is not shown again: the embers round the hero already say how much there is)
	if not grew:
		return
	var P: Dictionary = L.P
	ring(x, y, 1.3 + stacks * 0.12, 0.26, PackedColorArray([P["bl4"], P["fr4"], P["fr5"], P["white"]]), false, {"heavy": true, "closing": true})
	for i in 6 + stacks * 3:
		add(x + L.rnd(-0.3, 0.3), y + L.rnd(-0.3, 0.3), L.rnd(0, 8), 0.0, 0.0, L.rnd(60, 160), L.rnd(0.3, 0.6), P["fr5"], 3.0 if i % 3 == 0 else 2.0, -40.0, L.POWER_HOT)
	flash(x, y, 12.0, 0.35 + stacks * 0.07, 0.1, L.POWER_HOT)
	# (five stacks can come inside a second: the count is then one line that counts up, not five climbing over each other)
	var text := "FULL MIGHT" if full else "MIGHT %d" % stacks
	var note = _might_note
	if note != null and note["t"] < 0.45 and not note.get("gone", false):
		note["text"] = text
		note["color"] = P["fr6"] if full else P["fr4"]
		note["big"] = full
	else:
		float_text(x, y, text, P["fr6"] if full else P["fr4"], full, 40.0)
		_might_note = floaters[floaters.size() - 1] if not floaters.is_empty() else null
	kick(3.0 if full else 1.2)


# =====================================================================================================================
# What the state itself shows (render.ts drawWorld: the monsters' loop, and the hero's)

## What a burning, a chilled and a poisoned monster shed, and a guardian with a word, at the game's chances: `amb` is how
## much of a sixtieth of a second this frame stands for, thinned as the air fills (render.ts `amb = pace * fx.room()`); a
## burning one stands in its own light (render.ts light). Those it can see, on the screen or near it (render.ts drawWorld
## leaves out the rest). And what the hero sheds while his haste lasts.
func ambient(list: Array, dt: float) -> void:
	var amb := dt * 60.0 * room()
	var h = hero()
	var eye: Vector2 = h.world if h != null else Vector2.ZERO
	var lit: bool = _lit and look != null and is_instance_valid(look)
	# (the whole list is gone through four times a second, for those within a screen and more of him: a floor has some two
	# hundred, nearly all of them far off; the rest of the time only those)
	_scan_in -= dt
	if _scan_in <= 0.0 or list.size() != _scan_n:
		_scan_in = SCAN_EVERY
		_scan_n = list.size()
		_near.clear()
		for o in list:
			if not is_instance_valid(o):
				continue
			var q: Monster = o
			var w := q.world
			if not q.dead and (h == null or (absf(w.x - eye.x) < SCAN_REACH and absf(w.y - eye.y) < SCAN_REACH)):
				_near.append(q)
	figures.begin()
	var marked: bool = not words3.marks.is_empty()
	for o in _near:
		if not is_instance_valid(o):
			continue
		var m: Monster = o
		if m.dead or not m.visible:
			continue
		var at: Vector2 = m.world
		if h != null:
			# (off the screen by more than 60 game pixels to a side, 30 above, 80 below: the hero stands 12 below its middle)
			var across := (at.x - at.y - eye.x + eye.y) * 16.0
			var down := (at.x + at.y - eye.x - eye.y) * 8.0
			if across < -300.0 or across > 300.0 or down < -177.0 or down > 203.0:
				continue
		# a guardian smoulders in the colour of its first word (render.ts drawWorld, the same loop; every word has its
		# colour there: this is the guardian's look, not the look of what its word does)
		if m.champion and not m.words.is_empty() and randf() < 0.25 * amb:
			var hue = L.WORD.get(str(m.words[0]))
			if hue != null:
				mote(at.x + (randf() - 0.5) * 0.8, at.y + (randf() - 0.5) * 0.8, PackedColorArray([hue, L.P["white"]]))
		# (its states, read at once; most are in none)
		var bits := figures.read(m)
		# (m3: a melded word's mark on it lays a colour over it too: a crush, Thunder's stun, Frostbite's bite, Blight's rot)
		var m3t: bool = m3.tint(m).a > 0.0 or not v3.tint_of(m.id, v3.clock).is_empty()
		if bits == 0:
			if marked:
				words3.watch(m, false, false)
			if m3t:
				figures.touched(m, false, false, false, false)
			continue
		var frozen := bits & Figures.FROZEN != 0
		var chilled := bits & Figures.CHILLED != 0
		var burning := bits & Figures.BURNING != 0
		var poisoned := bits & Figures.POISONED != 0
		if frozen or chilled or burning or poisoned or m3t:
			figures.touched(m, frozen, chilled, burning, poisoned)
		# on fire: flames off it, and its light
		if burning:
			if randf() < 0.55 * amb:
				flames(at.x, at.y, 0.22, 1, 0.9)
			if lit:
				look.spot(Vector2(gx(at.x, at.y), gy(at.x, at.y) - 12.0), 56.0 if m.boss else (44.0 if m.champion else 26.0), 0.7)
		# chilled: motes of frost about it (not one frozen solid)
		if chilled and not frozen and randf() < 0.12 * amb:
			mote(at.x + (randf() - 0.5) * 0.5, at.y + (randf() - 0.5) * 0.5, PackedColorArray([L.P["white"], L.P["bu5"]]))
		# poisoned: it bubbles, the more the more doses it carries (m3: not one rotting with Blight: the rot is its sickness)
		if poisoned and not m3.rotting(m) and randf() < minf(0.5, 0.12 + figures.state(m, "poison_n") * 0.05) * amb:
			bubbles(at.x, at.y, 0.25, 1)
		if marked or bits & (Figures.STUNNED | Figures.STAGGERED) != 0:
			# (m3: Thunder's stun is its own look, not Heavy's sparks)
			words3.watch(m, bits & Figures.STUNNED != 0 and not m3.thunders(m), bits & Figures.STAGGERED != 0)
	figures.thaws()
	# the hero burning, from a monster's Flame: embers rise off him (render.ts; his tint, chilled or poisoned: fx_figures.gd)
	if h != null and float(h.get("burn_t")) > 0.0 and h.alive and randf() < 0.4 * amb:
		mote(h.world.x, h.world.y, L.EL["fire"])
	# "of Swiftness": while the haste lasts the hero leaves green afterimages and a wake of wind (render.ts)
	if haste_t > 0.0:
		haste_t -= dt
		if h != null and h.world.distance_to(_blur_at) > 0.32:
			_blur_at = h.world
			figures.afterimage(h, L.P["gn4"], 0.32, 0.45)
			haste_wake(h.world.x, h.world.y, h.face.x, h.face.y)


# =====================================================================================================================
# The ground a move left (fx_wakes.gd)

## One patch of the ground a move left, drawn on `canvas` (a node that lies on the floor): the rules' node calls this for
## each of its patches from its own _draw. {kind: "burn" | "ice" | "storm" | "venom" | "cracks", x, y, r, t, dur}.
func draw_wake(canvas: CanvasItem, patch: Dictionary) -> void:
	ground.draw(canvas, patch)


# =====================================================================================================================
# Time (fx.ts update)

## `real` is the true frame time: `dt` is shorter while the game is holding still.
func update(dt: float, real: float) -> void:
	clock += dt
	_since_hold += real
	# Nothing here may pile up without limit: when a list is over its length, the oldest things in it go.
	_trim(rings, 140)
	_trim(flashes, 120)
	_trim(slashes, 40)
	_trim(whirls, 16)
	_trim(sky_bolts, 30)
	_trim(glows, 60)
	_trim(later, 160)
	if not later.is_empty():
		for i in range(later.size() - 1, -1, -1):
			var q: Dictionary = later[i]
			q["t"] -= dt
			if q["t"] <= 0.0:
				later.remove_at(i)
				(q["fn"] as Callable).call()
	if might_t > 0.0:
		might_t -= dt
		if might_t <= 0.0:
			might_stacks = 0
		elif might_stacks >= 5 and randf() < 0.35 * dt * 60.0:
			var h := hero_at()
			flames(h.x, h.y, 0.22, 1, 1.1)
	# the particles: each falls, and bounces off the floor losing most of its way
	var n := pn
	var i := n - 1
	while i >= 0:
		var life := _plife[i] - dt
		if life <= 0.0:
			n -= 1
			if i != n:
				_px[i] = _px[n]
				_py[i] = _py[n]
				_pz[i] = _pz[n]
				_pvx[i] = _pvx[n]
				_pvy[i] = _pvy[n]
				_pvz[i] = _pvz[n]
				_plife[i] = _plife[n]
				_plife0[i] = _plife0[n]
				_pcol[i] = _pcol[n]
				_psize[i] = _psize[n]
				_pgrav[i] = _pgrav[n]
				_pramp[i] = _pramp[n]
				_pstreak[i] = _pstreak[n]
			i -= 1
			continue
		_plife[i] = life
		_px[i] += _pvx[i] * dt
		_py[i] += _pvy[i] * dt
		var vz := _pvz[i]
		var z := _pz[i] + vz * dt
		vz -= _pgrav[i] * dt
		if z < 0.0:
			z = 0.0
			vz = -vz * 0.35
			_pvx[i] *= 0.5
			_pvy[i] *= 0.5
		_pz[i] = z
		_pvz[i] = vz
		i -= 1
	pn = n
	for k in range(floaters.size() - 1, -1, -1):
		var f: Dictionary = floaters[k]
		f["t"] += dt
		f["z"] += (60.0 if f["t"] < 0.15 else 16.0) * dt
		if f["t"] > 0.8:
			f["gone"] = true
			floaters.remove_at(k)
	for k in range(rings.size() - 1, -1, -1):
		var r: Dictionary = rings[k]
		if r["delay"] > 0.0:
			r["delay"] -= dt
			continue
		r["t"] += dt
		if r["t"] >= r["dur"]:
			rings.remove_at(k)
	for k in range(rifts.size() - 1, -1, -1):
		rifts[k]["t"] = float(rifts[k]["t"]) + dt
		if float(rifts[k]["t"]) >= float(rifts[k]["dur"]):
			rifts.remove_at(k)
	_age(slashes, dt)
	_age(cracks, dt)
	_age(decals, dt)
	_age(spikes, dt)
	_age(flashes, dt)
	_age(sky_bolts, dt)
	_age(whirls, dt)
	_age(glows, dt)
	for k in range(bolts.size() - 1, -1, -1):
		bolts[k]["t"] += dt
		if bolts[k]["t"] >= 0.16:
			bolts.remove_at(k)
	wild.update(dt)
	wild_mage.update(dt)
	wild_ranger.update(dt)
	words3.tick(dt)
	city3.tick(dt)
	figures.tick(dt)
	w610.update(dt)
	m52fx.update(dt)
	w10.update(dt)
	# (w7: render.ts tickW7; and the sounds of moments only its pictures know, main.ts soundsW7)
	w7.update(dt)
	var h7 = hero()
	for snd in w7.take_sounds():
		if h7 != null:
			h7.last.rec(snd)
	# (m3: the melded words' looks age, and what they do all the time: render.ts tickM3)
	m3.update(dt)
	# (v3: Volatile's five melds' looks age, what they read of the rules first: render.ts tickV3; m8: the eight's, fx.ts update)
	v3.read()
	v3.tick(dt)
	m8.update(dt)


static func _trim(list: Array, most: int) -> void:
	while list.size() > most:
		list.pop_front()


static func _age(list: Array, dt: float) -> void:
	for k in range(list.size() - 1, -1, -1):
		var q: Dictionary = list[k]
		q["t"] += dt
		if q["t"] >= q["dur"]:
			list.remove_at(k)


## THE LIGHTS (render.ts light: "a burst of fire or a bolt of lightning lights up the room for a moment"; words3.ts
## lights3; the ground a move left; a burning monster's is asked for as it is read, in `ambient`): asked of the place's dark
## afresh every frame.
func _spots() -> void:
	if look == null or not is_instance_valid(look):
		return
	for l: Dictionary in glows:
		look.spot(Vector2(gx(l["x"], l["y"]), gy(l["x"], l["y"]) - 8.0), l["r"], 0.9 * (1.0 - l["t"] / l["dur"]))
	# (what a hero of another class sends and sets down lights the dark: render.ts spot, his projectiles, her orbs: heroes/<class>_look.gd)
	var h = hero()
	if h != null and h.get("kit") != null and h.kit.look != null and is_instance_valid(h.kit.look) and h.kit.look.has_method("lights"):
		h.kit.look.lights(func(x: float, y: float, r: float, a: float) -> void: look.spot(Vector2(x, y), r, a), self)
	words3.lights()
	city3.lights(wakes.list if wakes != null and is_instance_valid(wakes) else [])
	ground.lights()
	w10.lights()
	# (w7: render.ts lightsW7)
	w7.lights()
	# (m3: render.ts lightsM3)
	m3.lights()
	# (v3: render.ts lightsV3)
	v3.lights(func(x: float, y: float, r: float, a: float) -> void: look.spot(Vector2(x, y), r, a), v3.clock)


# =====================================================================================================================
# Drawing: in game pixels, each dot where the game rounds it to

## A place on the floor as the game's screen has it, game pixels (fx.ts wx, wy: lifted with the ground it stands on).
func gx(x: float, y: float) -> float:
	return (x - y) * 16.0


func gy(x: float, y: float) -> float:
	return (x + y) * 8.0 - (_lift_of.lift_at(x, y) * 0.5 if _lifted else 0.0)


## How far the ground at a place lifts what stands on it, picture pixels (floor_map.gd lift_at).
func lift_at(x: float, y: float) -> float:
	return _lift_of.lift_at(x, y) if _lifted else 0.0


## A block of the game's pixels (its fillRect).
static func rect(c: CanvasItem, x: float, y: float, w: float, h: float, col: Color) -> void:
	c.draw_rect(Rect2(x * 2.0, y * 2.0, w * 2.0, h * 2.0), col)


## A filled oval round (cx, cy), `rx` across its half and `ry` up and down (the game's g.ellipse and fill).
static func oval(c: CanvasItem, cx: float, cy: float, rx: float, ry: float, col: Color) -> void:
	if rx <= 0.0 or ry <= 0.0 or col.a <= 0.0:
		return
	c.draw_set_transform(Vector2(cx, cy) * 2.0, 0.0, Vector2(rx, ry) * 2.0)
	c.draw_circle(Vector2.ZERO, 1.0, col)
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## A circle of `r` tiles lying on the floor round a point of the screen, filled (render.ts ellipse: 22.6 by 11.3 a tile).
static func floor_oval(c: CanvasItem, cx: float, cy: float, r: float, col: Color, a: float) -> void:
	oval(c, cx, cy, r * 22.6, r * 11.3, Color(col, a))


## A line one game pixel thick, plotted as the game plots it (fx.ts pline), its runs along a row or a column each laid as
## one block.
static func pline(c: CanvasItem, x0f: float, y0f: float, x1f: float, y1f: float, col: Color) -> void:
	var x0 := int(floorf(x0f + 0.5))
	var y0 := int(floorf(y0f + 0.5))
	var x1 := int(floorf(x1f + 0.5))
	var y1 := int(floorf(y1f + 0.5))
	var dx := absi(x1 - x0)
	var dy := -absi(y1 - y0)
	var stx := 1 if x0 < x1 else -1
	var sty := 1 if y0 < y1 else -1
	var err := dx + dy
	# (the run being gathered: from (ax, ay), `n` long; `way` 1 along its row, 2 along its column, 0 one dot yet)
	var ax := x0
	var ay := y0
	var n := 1
	var way := 0
	for k in 400:
		if x0 == x1 and y0 == y1:
			break
		var e2 := 2 * err
		var mx := false
		var my := false
		if e2 >= dy:
			err += dy
			x0 += stx
			mx = true
		if e2 <= dx:
			err += dx
			y0 += sty
			my = true
		if mx and not my and way != 2:
			way = 1
			n += 1
		elif my and not mx and way != 1:
			way = 2
			n += 1
		else:
			if way == 1:
				c.draw_rect(Rect2((ax if stx > 0 else ax - n + 1) * 2.0, ay * 2.0, n * 2.0, 2.0), col)
			elif way == 2:
				c.draw_rect(Rect2(ax * 2.0, (ay if sty > 0 else ay - n + 1) * 2.0, 2.0, n * 2.0), col)
			else:
				c.draw_rect(Rect2(ax * 2.0, ay * 2.0, 2.0, 2.0), col)
			ax = x0
			ay = y0
			n = 1
			way = 0
	if way == 1:
		c.draw_rect(Rect2((ax if stx > 0 else ax - n + 1) * 2.0, ay * 2.0, n * 2.0, 2.0), col)
	elif way == 2:
		c.draw_rect(Rect2(ax * 2.0, (ay if sty > 0 else ay - n + 1) * 2.0, 2.0, n * 2.0), col)
	else:
		c.draw_rect(Rect2(ax * 2.0, ay * 2.0, 2.0, 2.0), col)


## Whether anything is alive to be drawn; the layers are drawn again while there is, and once more after.
func _alive() -> bool:
	return pn > 0 or not rifts.is_empty() or not (floaters.is_empty() and rings.is_empty() and slashes.is_empty() and whirls.is_empty() and cracks.is_empty() and decals.is_empty() and spikes.is_empty() and flashes.is_empty() and bolts.is_empty() and sky_bolts.is_empty()) or might_stacks > 0 or wild.alive() or wild_mage.alive() or wild_ranger.alive() or words3.alive() or ground.alive() or figures.alive() or w610.alive() or m52fx.alive() or city3.alive() or w10.alive() or w7.alive() or m3.alive() or v3.alive() or m8.alive()


func _redraw() -> void:
	var alive := _alive()
	if alive or _alive_was:
		queue_redraw()
		if _over != null:
			_over.queue_redraw()
			_air.queue_redraw()
			_text.queue_redraw()
	_alive_was = alive


func _draw() -> void:
	_paint(self, 0)


func _paint(c: CanvasItem, pass_id: int) -> void:
	var t0 := Time.get_ticks_usec() if timing else 0
	match pass_id:
		0:
			_paint_ground(c)
		1:
			figures.draw_over(c)
		2:
			_paint_air(c)
		3:
			_paint_text(c)
	if timing:
		cost_draw += Time.get_ticks_usec() - t0


## THE RIFT (render/arrivals.ts drawRift, riftOpen): a dark tear opening in the floor where one is coming, out fast and a little past,
## its ragged edge and the cracks running out from it the enemy's pink, flickering; the floor round it darkened, its inside a deep
## glow toward its back; it holds while its one comes up, and closes behind it.
const RIFT_VOID := Color("#0b0612")
const RIFT_DEEP := Color("#2a0c2c")
const RIFT_EDGE := [Color("#7a1058"), Color("#e0287a"), Color("#ff7aa8")]


static func _imul(a: int, b: int) -> int:
	return (a * b) & 0xFFFFFFFF


static func _rhash(a: int, b: int) -> float:
	var h := (_imul(a & 0xFFFFFFFF, 374761393) + _imul(b & 0xFFFFFFFF, 668265263)) & 0xFFFFFFFF
	h = _imul(h ^ (h >> 13), 1274126177)
	return float((h ^ (h >> 16)) & 0xFFFFFFFF) / 4294967296.0


static func rift_open(f: Dictionary) -> float:
	var t: float = f["t"]
	if t < 0.0:
		return 0.0
	var o := 0.3
	if t < o:
		var c := t / o - 1.0
		return maxf(0.0, 1.0 + 2.7 * c * c * c + 1.7 * c * c)
	if t < float(f["out"]):
		return 1.0
	return maxf(0.0, 1.0 - (t - float(f["out"])) / maxf(0.01, float(f["dur"]) - float(f["out"])))


func _rift(c: CanvasItem, f: Dictionary) -> void:
	var k := rift_open(f)
	if k <= 0.02:
		return
	var cx := gx(f["x"], f["y"])
	var cy := gy(f["x"], f["y"])
	var r: float = float(f["r"]) * k
	var flick := floori(clock * 14.0)
	var seed: int = f["seed"]
	oval(c, roundf(cx), roundf(cy), r * 26.0, r * 13.0, Color(RIFT_VOID, 0.35 * minf(1.0, k)))
	var n := 22
	var pts: Array = []
	var poly := PackedVector2Array()
	for i in n:
		var a := float(i) / n * TAU
		var rag := 0.72 + 0.38 * _rhash(seed + i, 3) + (-0.12 if i % 2 == 1 else 0.1)
		var p := Vector2(cx + cos(a) * r * 18.0 * rag, cy + sin(a) * r * 9.0 * rag)
		pts.append(p)
		poly.append(p.round() * 2.0)
	# (a rift only just opening rounds to a ragged edge that folds on itself: drawn only once it is a shape the triangulator takes)
	if not Geometry2D.triangulate_polygon(poly).is_empty():
		c.draw_colored_polygon(poly, RIFT_VOID)
	oval(c, roundf(cx), roundf(cy - r * 2.0), r * 10.0, r * 4.5, Color(RIFT_DEEP, 0.85))
	for i in n:
		var p0: Vector2 = pts[i]
		var p1: Vector2 = pts[(i + 1) % n]
		var steps := maxi(2, ceili(p0.distance_to(p1)))
		for st in steps:
			var u := float(st) / steps
			var hot := _rhash(seed + i * 31 + st, flick)
			var col: Color = RIFT_EDGE[2] if hot > 0.82 else (RIFT_EDGE[1] if hot > 0.3 else RIFT_EDGE[0])
			rect(c, roundf(p0.x + (p1.x - p0.x) * u), roundf(p0.y + (p1.y - p0.y) * u), 1, 1, col)
	for j in 5:
		var a := _rhash(seed, j + 40) * TAU
		var long := (0.5 + 0.7 * _rhash(seed, j + 60)) * r * minf(1.0, k * 1.2)
		var x := cx + cos(a) * r * 17.0
		var y := cy + sin(a) * r * 8.5
		var segs := 4
		for sg in segs:
			var bend := (_rhash(seed + j, sg) - 0.5) * 0.9
			var nx := x + cos(a + bend) * long * 6.0
			var ny := y + sin(a + bend) * long * 3.0
			var steps := maxi(2, ceili(Vector2(nx - x, ny - y).length()))
			for q in steps:
				var u := float(q) / steps
				var al := (1.0 - float(sg) / segs) * (1.0 if _rhash(j * 7 + q, flick) > 0.2 else 0.4)
				rect(c, roundf(x + (nx - x) * u), roundf(y + (ny - y) * u), 1, 1, Color(RIFT_EDGE[1] if sg == 0 else RIFT_EDGE[0], al))
			x = nx
			y = ny


## Flat effects on the floor: scorch and frost, cracks, ice, shockwave rings. Drawn under the characters (fx.ts drawGround;
## before it, what the new words leave on the floor: words3.ts floor3).
func _paint_ground(c: CanvasItem) -> void:
	var P: Dictionary = L.P
	words3.draw_floor(c)
	city3.draw_floor(c)
	# (m3: the melded words' patches, scars, Blight's brand and Eruption's heat, with the floor: render.ts floorM3)
	m3.paint(c, 0)
	# (v3: Volatile's five melds' runes, their marks and their ground, with the floor: render.ts floorV3; m8: the eight's, fx.ts drawGround)
	v3.draw_floor(c, v3.clock)
	m8.draw_ground(c)
	uq.draw_ground(c)
	w610.draw_floor(c)
	m52fx.draw_floor(c)
	w10.draw_floor(c)
	# (w7: render.ts floorW7)
	w7.draw_floor(c)
	# (ARRIVALS: the rifts of the enemies coming in, under every figure: render/arrivals.ts drawRift)
	for f: Dictionary in rifts:
		_rift(c, f)
	# (left out: the other classes' and the unique items' marks, a volley's arrows standing in the floor and their shadows)
	for d: Dictionary in decals:
		var cx := gx(d["x"], d["y"])
		var cy := gy(d["x"], d["y"])
		var age: float = d["t"] / d["dur"]
		var fade := 1.0 if age < 0.7 else maxf(0.0, 1.0 - (age - 0.7) / 0.3)
		var dr: float = d["r"]
		var seed: int = d["seed"]
		if d["kind"] == "scorch":
			oval(c, cx, cy, dr * 22.6, dr * 11.3, Color(P["black"], 0.26 * fade))
			oval(c, cx, cy, dr * 14.0, dr * 7.0, Color(P["black"], 0.2 * fade))
			# its edge glows while it is fresh, and cinders wink in it for a while
			if d["t"] < 0.7:
				var col: Color = P["fr5"] if d["t"] < 0.25 else (P["fr3"] if d["t"] < 0.5 else P["fr2"])
				var n := maxi(14, _round(dr * 30.0))
				for i in range(0, n, 2):
					var a := float(i) / n * TAU
					rect(c, floorf(cx + (cos(a) - sin(a)) * 16.0 * dr + 0.5), floorf(cy + (cos(a) + sin(a)) * 8.0 * dr + 0.5), 1, 1, col)
			if age < 0.6:
				for i in _round(dr * 7.0):
					if L.hash2(seed + i, floori(clock * 6.0)) > 0.35:
						continue
					var a := L.hash2(seed, i) * TAU
					var dd := L.hash2(seed + 7, i) * dr * 0.85
					var qx: float = d["x"] + cos(a) * dd
					var qy: float = d["y"] + sin(a) * dd
					rect(c, floorf(gx(qx, qy) + 0.5), floorf(gy(qx, qy) + 0.5), 1, 1, P["fr4"] if L.hash2(seed + 3, i) < 0.5 else P["fr2"])
		else:
			# rime: it spreads in its first moment, then lies pale with white flecks
			var grown := minf(1.0, d["t"] / 0.12)
			var r := dr * (0.5 + 0.5 * grown)
			oval(c, cx, cy, r * 22.6, r * 11.3, Color(P["bu5"], 0.3 * fade))
			for i in _round(dr * 12.0):
				var a := L.hash2(seed, i) * TAU
				var dd := sqrt(L.hash2(seed + 5, i)) * r * 0.95
				var qx: float = d["x"] + cos(a) * dd
				var qy: float = d["y"] + sin(a) * dd
				rect(c, floorf(gx(qx, qy) + 0.5), floorf(gy(qx, qy) + 0.5), 2 if L.hash2(seed + 11, i) < 0.3 else 1, 1, Color(P["white"] if L.hash2(seed + 9, i) < 0.4 else P["bu5"], fade))
	for k: Dictionary in cracks:
		# it tears open outward in its first instant, glows, cools, and fades at the end of its life
		var pts: PackedFloat32Array = k["pts"]
		var grown := minf(1.0, k["t"] / 0.06)
		var segs := pts.size() / 2 - 1
		var upto := maxi(1, ceili(segs * grown))
		var age: float = k["t"] / k["dur"]
		var hot: float = k["hot"]
		var lit: bool = k["t"] < hot
		var glow_col: Color = P["fr6"] if k["t"] < hot * 0.3 else (P["fr4"] if k["t"] < hot * 0.65 else P["fr2"])
		var al := 1.0 if age < 0.6 else maxf(0.0, 1.0 - (age - 0.6) / 0.4)
		for i in upto:
			var x0 := gx(pts[i * 2], pts[i * 2 + 1])
			var y0 := gy(pts[i * 2], pts[i * 2 + 1])
			var x1 := gx(pts[i * 2 + 2], pts[i * 2 + 3])
			var y1 := gy(pts[i * 2 + 2], pts[i * 2 + 3])
			pline(c, x0, y0 + 1.0, x1, y1 + 1.0, Color(P["black"], al))
			# wider near the middle of the impact
			if i < 2:
				pline(c, x0 + 1.0, y0, x1 + 1.0, y1, Color(P["fr3"] if lit else P["st1"], al))
			pline(c, x0, y0, x1, y1, Color(glow_col if lit else P["ink"], al))
	for s: Dictionary in spikes:
		# a blade of ice along the floor; it shoots out, stands, and fades as it breaks
		var k: float = s["t"] / s["dur"]
		var grown := minf(1.0, s["t"] / 0.05)
		var x0 := gx(s["x0"], s["y0"])
		var y0 := gy(s["x0"], s["y0"])
		var x1 := x0 + (gx(s["x1"], s["y1"]) - x0) * grown
		var y1 := y0 + (gy(s["x1"], s["y1"]) - y0) * grown
		var al := 1.0 if k < 0.6 else maxf(0.0, 1.0 - (k - 0.6) / 0.4)
		pline(c, x0, y0 + 1.0, x1, y1 + 1.0, Color(P["bu3"], al))
		pline(c, x0, y0, x1, y1, Color(P["white"] if k < 0.25 else P["bu5"], al))
		# the icicle at its end
		var tall := floorf(s["tall"] * grown + 0.5)
		var rx := floorf(x1 + 0.5)
		var ry := floorf(y1 + 0.5)
		rect(c, rx + 1.0, ry - tall + 1.0, 1, tall, Color(P["bu4"], al))
		rect(c, rx, ry - tall, 1, tall, Color(P["white"], al))
		var part := floorf(tall * 0.6 + 0.5)
		rect(c, rx - 1.0, ry - part, 1, part, Color(P["bu5"], al))
	if might_stacks > 0:
		# "of Power": the floor under the hero glows hotter with every stack
		var n := might_stacks
		var h := hero_at()
		var cx := gx(h.x, h.y)
		var cy := gy(h.x, h.y)
		var rad := 0.42 + n * 0.05 + 0.03 * sin(clock * 9.0)
		oval(c, cx, cy, rad * 22.6, rad * 11.3, Color(P["fr4"] if n >= 4 else P["fr3"], (0.1 + n * 0.05) * minf(might_t, 1.0)))
		var col: Color = P["fr6"] if n >= 5 else (P["fr5"] if n >= 3 else P["fr4"])
		for i in 30:
			if might_t < 1.0 and (i + floori(clock * 12.0)) % 2 == 0:
				continue
			var a := i / 30.0 * TAU
			rect(c, floorf(cx + (cos(a) - sin(a)) * 16.0 * rad + 0.5), floorf(cy + (cos(a) + sin(a)) * 8.0 * rad + 0.5), 1, 1, col)
	for r: Dictionary in rings:
		if r["delay"] > 0.0:
			continue
		var k: float = r["t"] / r["dur"]
		var closing: bool = r["closing"]
		var rr0: float = r["r"]
		var rad := rr0 * (1.0 - 0.82 * k) if closing else rr0 * (0.25 + 0.75 * sqrt(k))
		var cx := gx(r["x"], r["y"])
		var cy := gy(r["x"], r["y"])
		var cs: PackedColorArray = r["colors"]
		var col := cs[mini(cs.size() - 1, int((k if closing else 1.0 - k) * cs.size()))]
		if r["fill"] and k < 0.5:
			oval(c, cx, cy, rr0 * 22.6, rr0 * 11.3, Color(cs[cs.size() - 1], 0.35 * (1.0 - k * 2.0)))
		var n := maxi(20, _round(rad * 46.0))
		var swirl: bool = r["swirl"]
		var jag: bool = r["jag"]
		var heavy: bool = r["heavy"]
		var turn: float = k * 5.5 + float(r["x"])
		for pass_i in (2 if r["double"] else 1):
			var scale := 1.0 if pass_i == 0 else 0.84
			for i in n:
				var a := float(i) / n * TAU
				# (a ring of wind is three arcs that whirl round as they spread)
				if swirl and fmod(a + turn, 2.094) > 1.15:
					continue
				# a lightning ring is a zigzag: every few dots step in and out
				var rr := rad * scale * ((1.06 if (i >> 1) % 2 == 0 else 0.94) if jag else 1.0)
				var px := floorf(cx + (cos(a) - sin(a)) * 16.0 * rr + 0.5)
				var py := floorf(cy + (cos(a) + sin(a)) * 8.0 * rr + 0.5)
				if heavy:
					c.draw_rect(Rect2((px - 1.0) * 2.0, (py - 1.0) * 2.0, 6.0, 6.0 if k < 0.7 else 4.0), col)
				else:
					c.draw_rect(Rect2(px * 2.0, py * 2.0, 4.0 if k < 0.6 else 2.0, 2.0), col)


## Effects in the air, drawn over the characters and over the darkness so they glow (fx.ts drawAir; before it, the clouds
## over the ground a move left, render.ts, and what the new words show over heads, words3.ts air3).
func _paint_air(c: CanvasItem) -> void:
	var P: Dictionary = L.P
	var white: Color = P["white"]
	ground.draw_air(c)
	words3.draw_air(c)
	# (m3: the melded words' clouds, steam and fog, and what is over the monsters and him: render.ts airM3)
	m3.paint(c, 1)
	# (v3: Volatile's five melds' domes, pillars, spikes and what flies: render.ts airV3; m8: the eight's, fx.ts drawAir)
	v3.draw_air(c, v3.clock)
	m8.draw_air(c)
	uq.draw_air(c)
	# (w10: Lasting's, Fleeting's and Vast's, over the figures and the dark: render/words10.ts airW10, before fx.drawAir)
	w10.draw_air(c)
	# (w7: the seven last words', over the figures and the dark: render.ts airW7)
	w7.draw_air(c)
	for q: Dictionary in whirls:
		# A whirlwind's turn: two crescents, opposite each other, going round the hero. Each is thin at its tail and thick
		# at its leading edge, which is white. They go round with the clock and not from where each began, so one turn runs
		# into the next without a jump.
		var k: float = q["t"] / q["dur"]
		var dir := -1.0 if q["rev"] else 1.0
		var lead0 := clock * TAU * 2.6 * dir
		var heavy: bool = q["heavy"]
		var sweep := 2.3 if heavy else 1.9
		var fade := 1.0 if k < 0.6 else maxf(0.0, 1.0 - (k - 0.6) / 0.4)
		var cs: PackedColorArray = q["colors"]
		var al := (0.55 if q["faint"] else 1.0) * (0.35 + 0.65 * fade)
		var col := Color(cs[mini(cs.size() - 1, int(k * cs.size()))], al)
		var first := Color(cs[0], al)
		var tip := Color(white, al)
		var bands := 5 if heavy else 3
		var jag: bool = q["jag"]
		var qx: float = q["x"]
		var qy: float = q["y"]
		var qr: float = q["r"]
		for half in 2:
			var u := 0.0
			while u < 1.0:
				var a := lead0 + half * PI - sweep * (1.0 - u) * dir
				var ca := cos(a)
				var sa := sin(a)
				var wob := (1.04 if int(u * 40.0) % 2 == 0 else 0.96) if jag else 1.0
				for band in bands:
					# (fattest just behind the leading edge)
					if band > u * u * (bands - 0.3):
						continue
					var rr := qr * (1.0 - band * 0.07) * wob
					var x := qx + ca * rr
					var y := qy + sa * rr
					c.draw_rect(Rect2(floorf(gx(x, y) + 0.5) * 2.0, (floorf(gy(x, y) + 0.5) - 10.0) * 2.0, 4.0, 4.0 if band == 0 else 2.0),
						tip if band == 0 and u > 0.72 else (first if u > 0.5 else col))
				u += 0.016
	for s: Dictionary in slashes:
		_paint_slash(c, s)
	# (Volatile's rune's column of light, Leeching's wisps, Precise's pins and sights, Frenzied's sparks, Guarding's shell and the
	# motes of its ward: fx_words610.gd. Left out: the wand's beams, the Mage's)
	w610.draw_air(c, wakes.list if wakes != null and is_instance_valid(wakes) else [])
	m52fx.draw_air(c)
	city3.draw_air(c, wakes.list if wakes != null and is_instance_valid(wakes) else [])
	for f: Dictionary in flashes:
		# a burst of light: a bright core with four rays
		var k: float = f["t"] / f["dur"]
		var cx := floorf(gx(f["x"], f["y"]) + 0.5)
		var cy := floorf(gy(f["x"], f["y"]) - float(f["z"]) + 0.5)
		var rad: float = f["r"] * (0.7 + 0.5 * k)
		var al := 0.9 * (1.0 - k * 0.7)
		var cs: PackedColorArray = f["colors"]
		oval(c, cx, cy, rad * 15.0, rad * 9.0, Color(cs[mini(cs.size() - 1, int(k * cs.size()))], al))
		var ray := floorf(rad * 30.0 + 0.5)
		rect(c, cx - ray, cy, ray * 2.0, 1, Color(cs[0], al))
		rect(c, cx, cy - floorf(ray * 0.6 + 0.5), 1, floorf(ray * 1.2 + 0.5), Color(cs[0], al))
	for b: Dictionary in bolts:
		var cs: PackedColorArray = b["colors"]
		var bt: float = b["t"]
		var col := cs[0] if bt < 0.06 else (cs[2] if bt < 0.11 else cs[3])
		var pts: PackedFloat32Array = b["pts"]
		var i := 0
		while i + 3 < pts.size():
			var x0 := gx(pts[i], pts[i + 1])
			var y0 := gy(pts[i], pts[i + 1]) - 10.0
			var x1 := gx(pts[i + 2], pts[i + 3])
			var y1 := gy(pts[i + 2], pts[i + 3]) - 10.0
			# a glow either side of the white core while it is fresh
			if bt < 0.08:
				pline(c, x0, y0 + 1.0, x1, y1 + 1.0, cs[3])
			pline(c, x0, y0, x1, y1, col)
			i += 2
	for b: Dictionary in sky_bolts:
		var k: float = b["t"] / b["dur"]
		var bx := gx(b["x"], b["y"])
		var by := gy(b["x"], b["y"]) - 4.0
		var offs: PackedFloat32Array = b["offs"]
		var step: float = b["top"] / offs.size()
		var core: Color = white if k < 0.4 else (P["lt3"] if k < 0.7 else P["lt2"])
		var px := bx
		var py := by
		for i in offs.size():
			var nx := bx + offs[i]
			var ny := by - (i + 1) * step
			if k < 0.55:
				pline(c, px - 1.0, py, nx - 1.0, ny, P["lt3"])
				pline(c, px + 1.0, py, nx + 1.0, ny, P["lt2"])
			pline(c, px, py, nx, ny, core)
			px = nx
			py = ny
		# the fork leaves the main bolt part-way up and runs down beside it
		if k < 0.7:
			var fork: PackedFloat32Array = b["fork"]
			var i := 0
			while i + 1 < fork.size():
				var at := int(fork[i])
				var x0 := bx + offs[at] if i == 0 else bx + fork[i - 1]
				var y0 := by - (at + 1) * step + (i / 2) * step * 0.7
				pline(c, x0, y0, bx + fork[i + 1], y0 + step * 0.7, P["lt3"])
				i += 2
	# (left out: a volley's arrows coming down)
	for i in pn:
		var x := _px[i]
		var y := _py[i]
		var sx := floorf((x - y) * 16.0 + 0.5)
		var sy := floorf((x + y) * 8.0 - (_lift_of.lift_at(x, y) * 0.5 if _lifted else 0.0) - _pz[i] + 0.5)
		var col := _pcol[i]
		var ramp = _pramp[i]
		if ramp != null:
			var rp: PackedColorArray = ramp
			col = rp[mini(rp.size() - 1, int((1.0 - _plife[i] / _plife0[i]) * rp.size()))]
		var st := _pstreak[i]
		if st > 0.0:
			# a line back along its motion as it looks on screen
			var vx := _pvx[i]
			var vy := _pvy[i]
			var ax := (vx - vy) * 16.0
			var ay := (vx + vy) * 8.0 - _pvz[i]
			var length := sqrt(ax * ax + ay * ay)
			if length <= 0.0:
				length = 1.0
			pline(c, sx, sy, sx - ax / length * st, sy - ay / length * st, col)
		else:
			var size := _psize[i] * 2.0
			c.draw_rect(Rect2(sx * 2.0, sy * 2.0, size, size), col)
	# (big and wild: the rings of wind and of the blade's light, over the sparks; the Mage's arcs)
	wild.draw(c)
	wild_mage.draw(c)
	wild_ranger.draw(c)
	# "of Power": an ember circles the hero for every stack held: on a ring that is tilted, high behind the hero and low
	# in front; the ones on the far side drawn small and dull and the near ones big and bright; each drags a tail of where
	# it has just been; the more of them the faster the ring turns.
	if might_stacks > 0:
		var h := hero_at()
		var n := might_stacks
		var fading := might_t < 1.0
		var spin := clock * (3.4 + n * 0.5)
		for pass_i in 2:
			for i in n:
				var a := spin + float(i) / n * TAU
				# (beyond the hero: further up the screen than they stand)
				var far := cos(a) + sin(a) < 0.0
				if (pass_i == 0) != far:
					continue
				if fading and floori(clock * 12.0) % 2 == 0:
					continue
				var p := _ember_at(h, a)
				var from := p
				for k in range(1, (3 if far else 5) + 1):
					var q := _ember_at(h, a - k * 0.17)
					pline(c, from.x, from.y + 1.0, q.x, q.y + 1.0, P["fr3"] if far else (P["fr5"] if k <= 2 else (P["fr4"] if k <= 4 else P["fr3"])))
					if not far and k <= 2:
						pline(c, from.x, from.y, q.x, q.y, P["fr5"])
					from = q
				if far:
					rect(c, p.x - 1.0, p.y - 1.0, 3, 3, P["fr3"])
					rect(c, p.x, p.y, 1, 1, P["fr5"])
				else:
					rect(c, p.x - 2.0, p.y - 1.0, 5, 3, P["fr4"])
					rect(c, p.x - 1.0, p.y - 2.0, 3, 5, P["fr4"])
					rect(c, p.x - 1.0, p.y - 1.0, 3, 3, P["fr6"])
					rect(c, p.x, p.y, 1, 1, white)
	# (m3: over the effects' sparks, the melded words' jaws, columns, bombs, bolts and the screen's flash: render/melds3.ts overM3)
	m3.paint(c, 2)
	# (v3: over everything, Volatile's five melds' bolts and the screen's flash: render.ts overV3)
	v3.draw_over(c, v3.clock)


## Where one of the embers of his might is on the screen, `b` round its ring (fx.ts drawAir, `at`).
func _ember_at(h: Vector2, b: float) -> Vector2:
	var x := h.x + cos(b) * 0.62
	var y := h.y + sin(b) * 0.62
	# (the ring is tilted: highest up the screen, behind the hero; lowest in front)
	var z := 13.0 - (cos(b) + sin(b)) * 3.2
	return Vector2(floorf(gx(x, y) + 0.5), floorf(gy(x, y) - z + 0.5))


## One cut (fx.ts drawAir, its slashes).
func _paint_slash(c: CanvasItem, s: Dictionary) -> void:
	var white: Color = L.P["white"]
	var k: float = s["t"] / s["dur"]
	var cs: PackedColorArray = s["colors"]
	var al := 0.65 if s["faint"] else 1.0
	var col := Color(cs[mini(cs.size() - 1, int(k * cs.size()))], al)
	var first := Color(cs[0], al)
	var tip := Color(white, al)
	# which way the cut travels: the second swing of his two comes back the other way
	var dir := -1.0 if s["rev"] else 1.0
	# The mark of a cut lies on the floor round whoever made it, and is drawn after them. The part of it that is beyond
	# them (further up the screen) would be drawn across their body: their own cut over their own head. That part is left
	# out where they stand.
	var ox: float = s["x"]
	var oy: float = s["y"]
	var sx0 := gx(ox, oy)
	var sy0 := gy(ox, oy)
	var depth := ox + oy
	var reach: float = s["reach"]
	var sa: float = s["a"]
	var jag: bool = s["jag"]
	if s["heavy"]:
		# Power: a thick crescent, wider than a plain cut, bright at its leading edge
		var from := sa - 1.25 * dir
		var lead := minf(1.0, k * 2.2 + 0.2)
		var tail := maxf(0.0, k * 1.6 - 0.6)
		var u := tail
		while u < lead:
			var a := from + 2.5 * u * dir
			var ca := cos(a)
			var sn := sin(a)
			# 0 at the tail, 1 at the leading edge
			var edge := (u - tail) / maxf(0.01, lead - tail)
			# the crescent is fattest in the middle of the sweep
			var mid := 1.0 - absf(u - 0.5) * 2.0
			var wob := (1.035 if int(u * 40.0) % 2 == 0 else 0.965) if jag else 1.0
			for band in 5:
				if band > 1.0 + mid * 3.5:
					continue
				var rr := reach * (1.02 - band * 0.075) * wob
				var x := ox + ca * rr
				var y := oy + sn * rr
				var px := gx(x, y)
				var py := gy(x, y)
				if x + y < depth and absf(px - sx0) < 9.0 and py - 10.0 - sy0 > -38.0 and py - 10.0 - sy0 < 2.0:
					continue
				c.draw_rect(Rect2(floorf(px + 0.5) * 2.0, (floorf(py + 0.5) - 10.0) * 2.0, 4.0, 4.0 if band == 0 else 2.0),
					tip if band == 0 and edge > 0.55 else (first if edge > 0.8 else col))
			u += 0.014
		return
	if s["fast"]:
		# Swift: three hair-thin cuts over the whole sweep, all there in the first instant, then gone
		var from := sa - 1.1 * dir
		var alive := 1.0 - k
		var u := 0.0
		while u < 1.0:
			# it thins out from the tail as it fades
			if u >= k * 0.9:
				var a := from + 2.2 * u * dir
				var ca := cos(a)
				var sn := sin(a)
				var wob := (1.035 if int(u * 40.0) % 2 == 0 else 0.965) if jag else 1.0
				for b in 3:
					var rr := reach * (1.0 - b * 0.14) * wob
					var x := ox + ca * rr
					var y := oy + sn * rr
					var px := gx(x, y)
					var py := gy(x, y)
					if x + y < depth and absf(px - sx0) < 9.0 and py - 10.0 - sy0 > -38.0 and py - 10.0 - sy0 < 2.0:
						continue
					c.draw_rect(Rect2(floorf(px + 0.5) * 2.0, (floorf(py + 0.5) - 10.0) * 2.0, 4.0 if b == 0 else 2.0, 2.0),
						tip if u > 0.8 and alive > 0.5 else (first if b == 0 else col))
			u += 0.012
		return
	# A plain cut: a slim crescent that runs round the sweep and is gone, bright at the edge that leads and fattest in the
	# middle.
	var from := sa - 0.95 * dir
	var lead := minf(1.0, k * 1.8 + 0.3)
	var tail := maxf(0.0, k * 1.8 - 0.5)
	var u := tail
	while u < lead:
		var a := from + 1.9 * u * dir
		var ca := cos(a)
		var sn := sin(a)
		var wob := (1.05 if int(u * 38.0) % 2 == 0 else 0.95) if jag else 1.0
		var edge := (u - tail) / maxf(0.01, lead - tail)
		var mid := 1.0 - absf(u - 0.5) * 2.0
		for band in 3:
			if band > 0.6 + mid * 2.0:
				continue
			var rr := reach * (0.95 - band * 0.07) * wob
			var x := ox + ca * rr
			var y := oy + sn * rr
			var px := gx(x, y)
			var py := gy(x, y)
			if x + y < depth and absf(px - sx0) < 9.0 and py - 10.0 - sy0 > -38.0 and py - 10.0 - sy0 < 2.0:
				continue
			c.draw_rect(Rect2(floorf(px + 0.5) * 2.0, (floorf(py + 0.5) - 10.0) * 2.0, 4.0 if band == 0 else 2.0, 2.0),
				tip if band == 0 and edge > 0.6 else (first if edge > 0.85 else col))
		u += 0.012


## Damage numbers and other floating text (fx.ts drawText), in the game's own letters.
func _paint_text(c: CanvasItem) -> void:
	if floaters.is_empty():
		return
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	# (where the screen's left edge is in the place, game pixels, and how wide the screen is)
	var left := -c.get_canvas_transform().origin.x / 2.0
	var view_w := c.get_viewport_rect().size.x / 2.0
	var ink: Color = L.P["ink"]
	for f: Dictionary in floaters:
		var x := floorf(gx(f["x"], f["y"]) + f["drift"] * minf(1.0, f["t"] * 3.0) + 0.5)
		var y := floorf(gy(f["x"], f["y"]) - float(f["z"]) + 0.5)
		var big: bool = f["big"]
		if big:
			# (a wide one is kept on the screen, whichever side of it the thing happened on; left out: a name too wide for
			# the screen written on several lines, a word joining a move's)
			var half := PF.width(f["text"]) / 2.0 + 4.0
			if view_w > 2.0 * half:
				x = clampf(x, left + half, left + view_w - half)
		PF.draw(c, f["text"], x, y, f["color"], {"align": "center", "font": "normal" if big else "small", "shadow": ink})
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
