## ENDLESS MODE'S FINAL BOSS: THE WARPED WORDSMITH ON HIS BOAR (game/act1_rules/wsboss.ts, wsboss2.ts; art/endless_boss.ts, every move
## the art chat's with his yes; the fight's flow his, FIGHT_FLOW.md, with his one change: “i dont like that something is going to pop
## every fourth hit.  having them in catagories is fine but i dont want a move to be gaurenteed to happen.”). His words for him: “the
## biggest, baddest boss in the game ... a well geared, well rounded character to deafeat.  The fight needs to be fun and engaging and
## tough as nails.  I want it to be something you have to prep for or he’ll wipe the floor with you.  Not unfair or gimmicky, just
## hard”. Only ever made in his arena, the bottom of the shaft (final_arena.gd).
##   PHASE 1, IN THE SADDLE (full life to half). Never more than two things at once: the boar's moves and his words take turns, each
##     drawn at random from those that fit, never the same twice running; every warning before it can hurt; each turned straight at
##     the hero as it begins (his pick, “Straight at me (Recommended)”).
##     THE BOAR   THE CHARGE: two or three runs down a lane, wheeling round between, each faster; struck, thrown aside. Then WINDED,
##                an opening. THE GORE (only if he is close): its tusks hooked up through the 90 degrees before it; thrown. THE REAR UP
##                AND STOMP: three shock rings roll out from its forefeet.
##     HIS WORDS  POWER: a great hammer crushed down three times on his shadow, which chases him a beat behind. FLAME: meteors over the
##                arena, each onto its mark; where each fell burns a while. FROST: five lines of ice spikes racing out at him in a fan;
##                the floor frozen behind them, chilling. LIGHTNING: one great orb drifting after him, its zaps finding him wherever he
##                is; its burst at the last. POISON: spore traps over the floor about him; come near one and it snaps into a cloud.
##                Never two of his words' floors at once.
##   AT HALF HIS LIFE THE BOAR DIES: held at half until it is done; on its next charge, flat out down its lane, it is killed ("Rest,
##     old friend. Your fury lives in me."); he is thrown clear, lands on his feet, his slam ("You will pay for this!"). Nothing hurts
##     the hero and nothing hurts him the while.
##   PHASE 2, ON FOOT: a meld at a time (ten, the art's: wsboss2.ts MELDS), its line as it begins; THE SLAM, a small ring over the
##     whole floor that cannot be dodged, and the meld's own move (ws_marks.gd). Half to a quarter: SPENT 3 s after each (an opening),
##     the next once its floor is gone; below a quarter no rest. Never the same twice running; a floor meld never after another.
##   HIS DEATH when his life runs out, whatever he is doing: he implodes in pink and his runes blink out until nothing is left; held
##     at 1 while it plays; killed as the last goes out.
## His numbers, the art's times and tables: assets/act3/wsboss.json (tools/godot_wsboss.ts).
extends "res://scripts/act3/hc.gd"

const DIR := "res://assets/act3/"
## (his own lines, said over him and aloud: no generic call-outs: act1.gd start_act)
const CALLS := {}
## HIS WORDS' LINES, each said as its move begins so it is heard coming (his words, 13 Nov 2026: “The attack lines are too long
## winded.  One to two word lines.”; the lines, docs/mockups/endless_tablet/README.md, HIS LINES)
const WORD_LINES := {"power": "Kneel!", "flame": "Burn!", "frost": "Be still.", "lightning": "Storm, come!", "poison": "Rot."}
const BODY := ["charge", "gore", "stomp"]
const WORDS := ["power", "flame", "frost", "lightning", "poison"]
const FLOORS := ["flame", "poison"]
const EL := {"power": "phys", "flame": "fire", "frost": "frost", "lightning": "lightning", "poison": "phys"}

static var _D := {}
static var _acts_list: Array = []


static func D() -> Dictionary:
	if _D.is_empty():
		_D = JSON.parse_string(FileAccess.get_file_as_string(DIR + "wsboss.json"))
	return _D


## One of the art's tables (CHARGE, FALL, MELD...).
static func A(k: String):
	return D()["art"][k]


static func TU(k: String):
	return D()["tune"][k]


static func TU2(k: String):
	return D()["tune2"][k]


static func tile() -> float:
	return float(D()["tile"])


static func place() -> Dictionary:
	return D()["place"]


func gait() -> Dictionary:
	return {"pace": 1.0, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 999.0, "slack": 1.0, "trueBack": true}


func acts() -> Array:
	if _acts_list.is_empty():
		_acts_list = D()["acts"]
	return _acts_list


static func ix(id: String) -> int:
	var L: Array = D()["acts"]
	for i in L.size():
		if str(L[i]["id"]) == "wsboss:" + id:
			return i
	return -1


func in_saddle() -> bool:
	return int(a1.get("foot", 0)) == 0


## The meld he is making, or made last.
func meld_of() -> String:
	if not a1.has("meld"):
		return ""
	var ids: Array = D()["meldIds"]
	var k := int(a1["meld"])
	return str(ids[k]) if k >= 0 and k < ids.size() else ""


# --- the arena (art/final_arena.ts onArena, toEdge) ---

static func on_arena(x: float, y: float, r: float) -> bool:
	var P := place()
	return Vector2(x - float(P["cx"]), y - float(P["cy"])).length() <= float(P["floor"]) - r


static func to_edge(x: float, y: float, dx: float, dy: float, r: float) -> float:
	var P := place()
	var ox := x - float(P["cx"])
	var oy := y - float(P["cy"])
	var R := float(P["floor"]) - r
	var b := ox * dx + oy * dy
	var c := ox * ox + oy * oy - R * R
	var disc := b * b - c
	if disc < 0.0:
		return 0.0
	return maxf(0.0, -b + sqrt(disc))


## A point of the art's own (forward, to its left, in its lengths) on the floor, from (x, y) facing (fx, fy).
static func art_at(x: float, y: float, fx: float, fy: float, a: float, b: float) -> Vector2:
	var T := tile()
	return Vector2(x + (fx * a + fy * b) / T, y + (fy * a - fx * b) / T)


## Where (px, py) is from (x, y) facing (fx, fy): tiles before it, and to its left.
static func rel_of(x: float, y: float, fx: float, fy: float, px: float, py: float) -> Vector2:
	var dx := px - x
	var dy := py - y
	return Vector2(dx * fx + dy * fy, dx * fy - dy * fx)


## The charge's carry down its lane `t` seconds into a run (sampled at every 30th of a second), times `scale`.
static func _sampled(list: Array, t: float) -> float:
	var f := clampf(t * 30.0, 0.0, float(list.size() - 1))
	var i := floori(f)
	var j := mini(i + 1, list.size() - 1)
	return lerpf(float(list[i]), float(list[j]), f - i)


static func carried(t: float, scale: float) -> float:
	return _sampled(D()["carry"]["charge"], t) * scale


static func carry_all() -> float:
	return _sampled(D()["carry"]["charge"], float(A("CHARGE")["long"]))


static func fall_carry(t: float) -> float:
	return _sampled(D()["carry"]["fall"], t)


## Where he lands, thrown clear, from the boar's floor point facing (fx, fy) at the end of its death.
static func fall_landing(x: float, y: float, fx: float, fy: float) -> Vector2:
	var L: Array = D()["landed"]
	return art_at(x, y, fx, fy, float(L[0]), float(L[1]))


## How far the stomp's ring `j` has rolled out `u` seconds after it struck (tiles; -1 not yet or gone).
static func ring_at(j: int, u: float) -> float:
	var S: Dictionary = A("STOMP")
	var s := u - float(S["rings"][j])
	if s < 0.0 or s > float(S["ringLong"]):
		return -1.0
	var k := s / float(S["ringLong"])
	return 0.6 + (float(TU("stomp")["reach"]) - 0.6) * (1.0 - (1.0 - k) * (1.0 - k))


## How swollen the orb is `u` seconds into its life (0 ... 1, before it bursts).
static func orb_swell(u: float) -> float:
	var B: Dictionary = TU("bolt")
	return clampf((u - (float(B["life"]) - float(B["swell"]))) / float(B["swell"]), 0.0, 1.0)


## The hammer's shadow: where it will come down.
func hammer_at(m) -> Vector2:
	return Vector2(float(a1.get("hx", m.world.x)), float(a1.get("hy", m.world.y)))


## His words' floors still lying (the meteors' burning, the traps).
static func floor_lying(m) -> bool:
	for p in m.mgr.perils.list:
		if p.get("kind") == "a1" and (str(p["a1"]) == "wsboss:meteor" or str(p["a1"]) == "wsboss:trap") and float(p["t"]) < float(p["dur"]) - 0.5:
			return true
	return false


## One of `list` ([name, weight]...), at random, weighted.
static func _draw(list: Array) -> String:
	var sum := 0.0
	for q in list:
		sum += float(q[1])
	if sum <= 0.0:
		return ""
	var r := randf_range(0.0, sum)
	for q in list:
		r -= float(q[1])
		if r <= 0.0:
			return str(q[0])
	return str(list[list.size() - 1][0])


## His line, said over him (game.ts emit 'bossSay').
static func say(m, text: String, secs := 2.6) -> void:
	m.say(text, secs)


## HIS VOICE (his pick, 25 Nov 2026: real speech, “I’d like him to sound crazed.  Not cold.” ... “let’s say Scottish.  With some phaser
## distortion from the magic”; “Take 1, use it (Recommended)”): his line said over him and aloud, in his own voice (monsters.gd speak,
## assets/voices/wsboss, tools/godot_wsboss_voice.sh). How long it is heard (0: not aloud).
static func say_aloud(m, text: String, secs := 2.6) -> float:
	m.say(text, secs)
	return float(m.mgr.speak("wsboss", text))


## His line said a little later, over him and aloud (the slam's line, once the boar's is done).
static func say_later(m, text: String, secs: float, wait: float) -> void:
	if wait <= 0.0:
		say_aloud(m, text, secs)
		return
	m.get_tree().create_timer(wait).timeout.connect(func() -> void:
		if is_instance_valid(m) and not m.dead:
			say_aloud(m, text, secs))


# --- his rules (game/act1_rules/wsboss.ts RULES) ---

func spawned(_m) -> void:
	a1["wait"] = 1.6
	a1["body"] = 0


## (in the saddle, held at half until the boar is dead; on foot, at 1 while his death plays: it kills him at its end)
func life_floor(m) -> float:
	return ceilf(m.max_life * 0.5) if in_saddle() else 1.0


## (the boar's death, and his own: he cannot be hit)
func invulnerable(_m) -> bool:
	var id := _id()
	return id == "wsboss:fall" or id == "wsboss:death"


func _id() -> String:
	return str(acts()[act["i"]]["id"]) if act != null else ""


func tick(m, dt: float, _dist: float, hero) -> bool:
	a1["clock"] = float(a1.get("clock", 0.0)) + dt
	if act == null:
		a1["wait"] = maxf(0.0, float(a1.get("wait", 0.0)) - dt)
	# (brought to half his life in the saddle: the boar's death is due, on its next charge)
	if in_saddle() and int(a1.get("fallDue", 0)) == 0 and m.life <= ceilf(m.max_life * 0.5):
		a1["fallDue"] = 1
	# (on foot, his life run out: his death, whatever he is doing; what of his is on the floor harms nothing more)
	if not in_saddle() and int(a1.get("dying", 0)) == 0 and m.life <= 1.0 and _id() != "wsboss:fall":
		a1["dying"] = 1
		for p in m.mgr.perils.list:
			if p.get("kind") == "a1" and str(p["a1"]).begins_with("wsboss:") and str(p["a1"]) != "wsboss:scorch":
				p["dur"] = minf(float(p["dur"]), float(p["t"]) + 0.4)
		start_act(m, acts(), ix("death"), hero)
		return true
	# (mid-charge, between its runs and its wheel, it keeps the way it faces down its lane)
	if act == null and int(a1.get("runs", 0)) > 0:
		m.face = Vector2(float(a1.get("fx", m.face.x)), float(a1.get("fy", m.face.y)))
	return false


func forced(m) -> int:
	if float(a1.get("wait", 0.0)) > 0.0:
		return -1
	var h = m.mgr.hero
	var dist: float = h.world.distance_to(m.world)
	if not in_saddle():
		return _foot_beat(m)
	# (the boar's death due: its next charge, one run, is its last)
	if int(a1.get("fallDue", 0)) != 0 and not int(a1.get("runs", 0)) > 0:
		a1["windNext"] = 0
		a1["runs"] = 1
		a1["run"] = 0
		a1["wheel"] = 0
		return ix("charge")
	# (a charge going on: the next run, wheeling round first; when its runs are done, winded)
	if int(a1.get("runs", 0)) > 0:
		return ix("wheel") if int(a1.get("wheel", 0)) != 0 else ix("charge")
	if int(a1.get("windNext", 0)) != 0:
		a1["windNext"] = 0
		return ix("winded")
	# (the beats take turns: the boar, then his word)
	if int(a1.get("body", 0)) != 0:
		var lw := int(a1.get("lastWord", -1))
		var last: String = WORDS[lw] if lw >= 0 else ""
		var fl := floor_lying(m)
		var fits: Array = []
		for w in WORDS:
			if w != last and not (FLOORS.has(w) and fl):
				fits.append([w, 1.0])
		var w := _draw(fits)
		if w == "":
			return -1
		a1["lastWord"] = WORDS.find(w)
		a1["body"] = 0
		return ix(w)
	var lb := int(a1.get("lastBody", -1))
	var lastb: String = BODY[lb] if lb >= 0 else ""
	var fits2: Array = []
	if lastb != "charge":
		fits2.append(["charge", 1.2])
	if lastb != "gore" and dist <= float(TU("gore")["near"]):
		fits2.append(["gore", 1.6])
	if lastb != "stomp" and dist <= float(TU("stomp")["near"]):
		fits2.append(["stomp", 1.0])
	var b := _draw(fits2 if not fits2.is_empty() else [["charge", 1.0]])
	if b == "":
		b = "charge"
	a1["lastBody"] = BODY.find(b)
	a1["body"] = 1
	if b == "charge":
		var R: Array = TU("charge")["runs"]
		a1["runs"] = randi_range(int(R[0]), int(R[1]))
		a1["run"] = 0
		a1["wheel"] = 0
		return ix("charge")
	return ix(b)


## HIS BEAT ON FOOT: a meld, then (half to a quarter) spent once what comes at you is done, and the next once its floor is gone;
## (below a quarter) the next as soon as what comes at you is done, its floor still standing.
func _foot_beat(m) -> int:
	var now := float(a1.get("clock", 0.0))
	var late: bool = m.life <= m.max_life * 0.25
	if now < float(a1.get("meldUntil", 0.0)):
		return -1
	if int(a1.get("spentNext", 0)) != 0:
		a1["spentNext"] = 0
		return ix("spent")
	if not late and now < float(a1.get("floorUntil", 0.0)) - 1.0:
		return -1
	var last := meld_of()
	var want := int(a1.get("want", 0))
	var ids: Array = D()["meldIds"]
	var next: String = str(ids[want - 1]) if want > 0 else draw_meld(last)
	a1["want"] = 0
	a1["meld"] = ids.find(next)
	a1["spentNext"] = 1 if not late and next != "frostbite" else 0
	return ix("meld")


## The next meld, drawn at random from those that fit (never the same twice running; a floor meld never straight after another).
static func draw_meld(last: String) -> String:
	var M: Dictionary = D()["melds"]
	var fits: Array = []
	for id in D()["meldIds"]:
		if id == last:
			continue
		if last != "" and bool(M[last]["floor"]) and bool(M[id]["floor"]):
			continue
		fits.append(id)
	return str(fits.pick_random())


func start(m, a: Dictionary, hero) -> void:
	var id := str(a["id"]).substr(7)
	# (turned to him; but the wheel spins round from the way it ran, a run after a wheel goes back down its lane the way it now
	# faces, and winded it stands where it stopped)
	var keep := id == "wheel" or id == "winded" or id == "fall" or id == "spent" or id == "death" or (id == "charge" and int(a1.get("run", 0)) > 0)
	var dh: float = hero.world.distance_to(m.world)
	if not keep and dh > 0.01:
		m.face = (hero.world - m.world) / dh
	elif keep:
		m.face = Vector2(float(a1.get("fx", m.face.x)), float(a1.get("fy", m.face.y)))
	a1["fx"] = m.face.x
	a1["fy"] = m.face.y
	a1["x0"] = m.world.x
	a1["y0"] = m.world.y
	a1["struck"] = 0
	match id:
		"charge":
			var n := int(a1.get("run", 0))
			act["rate"] = float(TU("charge")["rate"][mini(n, 2)])
			var room := to_edge(m.world.x, m.world.y, m.face.x, m.face.y, float(TU("charge")["wall"]))
			var all := carry_all()
			a1["scale"] = clampf(room / all, 0.15, 1.0)
			a1["lane"] = all * float(a1["scale"])
		"power":
			a1["hx"] = hero.world.x
			a1["hy"] = hero.world.y
		"lightning", "poison", "flame":
			a1["cx"] = hero.world.x
			a1["cy"] = hero.world.y
		"fall":
			for p in m.mgr.perils.list:
				if p.get("kind") == "a1" and str(p["a1"]).begins_with("wsboss:"):
					p["dur"] = minf(float(p["dur"]), float(p["t"]) + 0.4)
			var room := to_edge(m.world.x, m.world.y, m.face.x, m.face.y, float(TU("charge")["wall"]))
			var all := fall_carry(float(A("FALL")["long"]))
			a1["scale"] = clampf(room / all, 0.15, 1.0)
			a1["runs"] = 0
			a1["fallDue"] = 0
			sound(m, "boss_roar", 0.9)
			return
		"meld":
			var mi := meld_of()
			if mi != "":
				say_aloud(m, str(D()["lines"]["melds"][mi]), 1.8)
	if WORD_LINES.has(id):
		say_aloud(m, str(WORD_LINES[id]), 1.6)
	# (what the move shows while it plays: its warnings, his runes, the hammer, the spores in flight: ws_paint.gd)
	if id in ["charge", "gore", "stomp", "power", "flame", "frost", "lightning", "poison", "meld"]:
		peril(m, "wsboss:show", m.world, {"dur": 1e9, "act": act})
	sound(m, "boss_roar", 0.35)


func end(m, a: Dictionary, _hero) -> void:
	var id := str(a["id"]).substr(7)
	var P: Array = TU("pause")
	a1["wait"] = randf_range(float(P[0]), float(P[1]))
	match id:
		"fall":
			# (thrown clear, risen: on foot where he landed; the boar is ash)
			var L := fall_landing(m.world.x, m.world.y, float(a1.get("fx", m.face.x)), float(a1.get("fy", m.face.y)))
			var C := Vector2(float(place()["cx"]), float(place()["cy"]))
			m.world = L if on_arena(L.x, L.y, 0.8) else (L + C) / 2.0
			a1["foot"] = 1
			a1["clock"] = 0.0
			a1["wait"] = 0.6
			a1["meldUntil"] = 0.0
			a1["floorUntil"] = 0.0
		"meld", "spent":
			a1["wait"] = 0.25
		"death":
			# (the last of his runes gone out: nothing is left of him)
			m.life = 0.0
			m._die()
		"charge":
			a1["run"] = int(a1.get("run", 0)) + 1
			a1["runs"] = maxi(0, int(a1.get("runs", 0)) - 1)
			if int(a1["runs"]) > 0:
				a1["wheel"] = 1
				a1["wait"] = 0.0
			else:
				a1["windNext"] = 1
		"wheel":
			a1["wheel"] = 0
			a1["wait"] = 0.0
			m.face = -Vector2(float(a1.get("fx", m.face.x)), float(a1.get("fy", m.face.y)))
			a1["fx"] = m.face.x
			a1["fy"] = m.face.y


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var fx := float(a1.get("fx", m.face.x))
	var fy := float(a1.get("fy", m.face.y))
	var roll: float = m._roll()
	var at := func(T0: float) -> bool: return t0 < T0 and t1 >= T0
	match str(a["id"]):
		"wsboss:charge":
			var F: Dictionary = A("FALL")
			# (the boar's death due: flat out down its lane, it is killed)
			if int(a1.get("fallDue", 0)) != 0 and t0 < float(F["from"]) and t1 >= float(F["from"]):
				start_act(m, acts(), ix("fall"), hero)
				return
			var d := carried(t1, float(a1.get("scale", 1.0)))
			var n := Vector2(float(a1.get("x0", m.world.x)) + fx * d, float(a1.get("y0", m.world.y)) + fy * d)
			if on_arena(n.x, n.y, 0.6):
				m.world = n
			var CS: Array = A("CHARGE_STRIKE")
			var SK: Array = A("CHARGE_SKID")
			if at.call(float(CS[1])):
				sound(m, "slam", 0.7)
				hero.kick(4.0)
			if t1 > float(CS[0]) and t1 < float(SK[1]) and int(a1.get("struck", 0)) == 0 and open_to(hero):
				var r := rel_of(m.world.x, m.world.y, fx, fy, hero.world.x, hero.world.y)
				if r.x > -1.4 and r.x < 1.9 and absf(r.y) < float(TU("charge")["half"]):
					a1["struck"] = 1
					blow(m, hero, float(a["dmg"]))
					var side := 1.0 if r.y >= 0.0 else -1.0
					knock(hero, Vector2(hero.world.x - fy * side, hero.world.y + fx * side), float(TU("charge")["throw"]))
			if at.call(float(SK[0])):
				sound(m, "slam", 0.4)
		"wsboss:fall":
			var F: Dictionary = A("FALL")
			var d := fall_carry(t1) * float(a1.get("scale", 1.0))
			var n := Vector2(float(a1.get("x0", m.world.x)) + fx * d, float(a1.get("y0", m.world.y)) + fy * d)
			if on_arena(n.x, n.y, 0.6):
				m.world = n
			if at.call(float(F["kill"])):
				sound(m, "slam", 1.0)
				hero.kick(6.0)
				# (his word for it, aloud from the moment it is killed; the slam's line waits until it is done)
				a1["quietAt"] = float(F["kill"]) + say_aloud(m, str(D()["lines"]["fall"]), 3.0)
			if at.call(float(F["slam"])):
				sound(m, "slam", 1.0)
				hero.kick(9.0)
				say_later(m, str(D()["lines"]["rise"]), 2.0, float(a1.get("quietAt", 0.0)) + 0.05 - float(F["slam"]))
				var L := fall_landing(m.world.x, m.world.y, fx, fy)
				peril(m, "wsboss:fallring", L, {"dur": float(F["ring"]["long"]) * 1.2})
				peril(m, "wsboss:scorch", m.world, {"dur": 40.0, "b": L.x, "c": L.y})
		"wsboss:meld":
			var M: Dictionary = A("MELD")
			if not at.call(float(M["slam"])):
				return
			var mi := meld_of()
			if mi == "":
				return
			sound(m, "slam", 1.0)
			hero.kick(7.0)
			meld_begins(m, mi, fx, fy, hero)
			var now := float(a1.get("clock", 0.0))
			a1["meldUntil"] = now + float(D()["melds"][mi]["dodge"])
			a1["floorUntil"] = now + float(D()["melds"][mi]["end"])
		"wsboss:death":
			var DE: Dictionary = A("DEATH")
			if at.call(float(DE["struck"])):
				# (a scream, cut short as he implodes: his pick, “A scream cut short”; his roar where he has no voice)
				if float(m.mgr.speak("wsboss", "~death")) <= 0.0:
					sound(m, "boss_roar", 1.0)
				hero.kick(5.0)
			if at.call(float(DE["implode"][1])):
				sound(m, "slam", 1.0)
				hero.kick(10.0)
			if at.call(float(DE["burst"])):
				sound(m, "rare", 0.6)
				peril(m, "wsboss:deathring", m.world, {"dur": 0.8})
		"wsboss:gore":
			var G: Dictionary = A("GORE")
			if not at.call(float(G["hit"])):
				return
			hero.kick(4.0)
			sound(m, "slam", 0.6)
			if not open_to(hero):
				return
			var r := rel_of(m.world.x, m.world.y, fx, fy, hero.world.x, hero.world.y)
			var d := r.length()
			if d <= float(TU("gore")["reach"]) and (d < 1.2 or absf(atan2(r.y, r.x)) <= float(TU("gore")["half"])):
				blow(m, hero, float(a["dmg"]))
				knock(hero, m.world, float(TU("gore")["throw"]))
		"wsboss:stomp":
			if not at.call(float(A("STOMP")["hit"])):
				return
			sound(m, "slam", 1.0)
			hero.kick(8.0)
			var foot: Vector2 = m.world + Vector2(fx, fy) * float(TU("stomp")["foot"])
			var S: Dictionary = A("STOMP")
			peril(m, "wsboss:rings", foot, {"fx": fx, "fy": fy, "dur": float(S["rings"][2]) + float(S["ringLong"]) + 0.1, "dmg": roll, "el": "phys"})
		"wsboss:power":
			var PW: Dictionary = A("POWER")
			var slams: Array = D()["slams"]
			var lock := false
			for s in slams:
				if t1 > float(s) - float(TU("power")["lock"]) and t1 <= float(s) + 0.25:
					lock = true
			if not lock and t1 > float(PW["cast"]):
				var f := minf(1.0, (t1 - t0) * float(TU("power")["lag"]))
				var hx := float(a1.get("hx", hero.world.x))
				var hy := float(a1.get("hy", hero.world.y))
				a1["hx"] = hx + (hero.world.x - hx) * f
				a1["hy"] = hy + (hero.world.y - hy) * f
			for s in slams:
				if not at.call(float(s)):
					continue
				sound(m, "slam", 0.9)
				hero.kick(6.0)
				var c := hammer_at(m)
				peril(m, "wsboss:crater", c, {"dur": 1.6})
				if open_to(hero) and hero.world.distance_to(c) <= float(TU("power")["reach"]):
					m.harm_hero(hero, roll * float(a["dmg"]))
					knock(hero, c, 1.0)
		"wsboss:flame":
			var FI: Dictionary = A("FIRE")
			if not at.call(float(FI["burst"])):
				return
			sound(m, "fire", 0.9)
			var P := place()
			for d in A("FIRE_DROPS"):
				var spot = null
				for tries in 12:
					var ang := randf_range(0.0, TAU)
					var r := sqrt(randf()) * (float(P["floor"]) - 0.6)
					var q := Vector2(float(P["cx"]) + cos(ang) * r, float(P["cy"]) + sin(ang) * r)
					if q.distance_to(m.world) >= float(TU("flame")["keep"]):
						spot = q
						break
				if spot == null:
					continue
				peril(m, "wsboss:meteor", spot, {"t": -(float(d["t"]) - float(FI["burst"])), "dur": float(TU("flame")["burn"]["long"]), "dmg": roll, "el": "fire", "a": float(randi_range(0, 3))})
		"wsboss:frost":
			var FR: Dictionary = A("FROST")
			if not at.call(float(FR["hit"])):
				return
			sound(m, "frost", 0.9)
			hero.kick(4.0)
			var s: Vector2 = m.world + Vector2(fx, fy) * float(D()["ice"]["from"])
			peril(m, "wsboss:ice", s, {"fx": fx, "fy": fy, "t": float(FR["hit"]), "dur": float(FR["hit"]) + float(TU("frost")["rime"]["long"]), "dmg": roll, "el": "frost"})
		"wsboss:lightning":
			if not at.call(float(A("BOLT")["crack"])):
				return
			sound(m, "zap", 0.9)
			hero.kick(3.0)
			var c: Vector2 = (m.world + hero.world) / 2.0
			var B: Dictionary = TU("bolt")
			peril(m, "wsboss:orb", c, {"dur": float(B["life"]) + 0.5, "dmg": roll, "el": "lightning", "a": float(B["zap"]["from"])})
		"wsboss:poison":
			var SP: Dictionary = A("SPORE")
			if not at.call(float(SP["burst"])):
				return
			sound(m, "poison", 0.8)
			var c := Vector2(float(a1.get("cx", hero.world.x)), float(a1.get("cy", hero.world.y)))
			for pod in A("SPORE_PODS"):
				var q := c + Vector2(float(pod["at"][0]), float(pod["at"][1])) / tile()
				if not on_arena(q.x, q.y, 0.4):
					continue
				peril(m, "wsboss:trap", q, {"t": -(float(pod["land"]) - float(SP["burst"])), "dur": float(TU("spore")["lie"]), "dmg": roll, "el": "phys", "b": c.x, "c": c.y})


func died(m) -> void:
	# (his words' perils harm nothing more once he is dead: they are left to fade)
	for p in m.mgr.perils.list:
		if p.get("kind") == "a1" and str(p["a1"]).begins_with("wsboss:"):
			p["dur"] = minf(float(p["dur"]), float(p["t"]) + 0.4)


## His picture making no act: his stand (in the saddle) or his stand on foot, by his own clock; struck, his reel.
func shown(m) -> Dictionary:
	if m.dead or m.state == "act":
		return {}
	var list := "idle" if in_saddle() else "foot"
	if not m.art.has(list):
		list = "idle"
	return {"list": list, "i": floori(float(a1.get("clock", 0.0)) * m.art.fps(list))}


# --- HIS MELDS (game/act1_rules/wsboss2.ts meldBegins): a meld begins at his slam: its peril and its lay ---

static func own(x: float, y: float, fx: float, fy: float, a: float, b: float) -> Vector2:
	return art_at(x, y, fx, fy, a, b)


func meld_begins(m, id: String, fx: float, fy: float, hero) -> void:
	var roll: float = m._roll()
	var M: Dictionary = D()["melds"][id]
	var el := "fire" if id in ["eruption", "scald", "wildfire", "fumes"] else ("frost" if id in ["hailstorm", "avalanche", "frostbite"] else ("lightning" if id in ["thunder", "contagion"] else "phys"))
	var lay := {"spots": []}
	var P := place()
	var C := Vector2(float(P["cx"]), float(P["cy"]))
	var S := float(A("MELD")["slam"])
	var fits := func(q: Vector2, r: float) -> bool: return on_arena(q.x, q.y, r)
	match id:
		"eruption":
			for v in A("ERUPT_VENTS"):
				var w := own(m.world.x, m.world.y, fx, fy, float(v["at"][0]), float(v["at"][1]))
				if fits.call(w, 0.4):
					lay["spots"].append({"x": w.x, "y": w.y, "t": float(v["t"]) - S, "k": float(v["fan"]) * 10.0 + float(v["j"])})
		"hailstorm":
			var H: Dictionary = A("HAIL")
			var rain: Array = H["rain"]
			for i in int(H["stones"]):
				var t := float(rain[0]) + (float(rain[1]) - float(rain[0])) * (float(i) / float(H["stones"])) + randf_range(-0.05, 0.05)
				var ang := randf_range(0.0, TAU)
				var r := sqrt(randf()) * (float(P["floor"]) - 0.5)
				lay["spots"].append({"x": C.x + cos(ang) * r, "y": C.y + sin(ang) * r, "t": t, "k": i, "r": 1 if randf() < float(TU2("hail")["aim"]) else 0})
			for i in int(H["bolts"]):
				lay["spots"].append({"x": hero.world.x, "y": hero.world.y, "t": float(rain[0]) + 0.3 + ((float(rain[1]) - float(rain[0]) - 0.3) * (i + 0.5)) / float(H["bolts"]), "k": -1 - i, "r": 2})
		"thunder":
			var TH: Dictionary = A("THUNDER")
			var t := float(TH["first"])
			var i := 0
			for s in TH["strikes"]:
				lay["spots"].append({"x": hero.world.x, "y": hero.world.y, "t": t, "k": i, "r": float(s["warn"])})
				t += float(s["warn"]) + float(TH["gap"])
				i += 1
		"avalanche":
			lay["side"] = 1 if randf() < 0.5 else -1
		"contagion":
			_contagion(lay, m, hero, C, P)
		"blight":
			for tr in A("BLIGHT_TREES"):
				var w := own(m.world.x, m.world.y, fx, fy, float(tr["at"][0]), float(tr["at"][1]))
				if fits.call(w, 0.4):
					lay["spots"].append({"x": w.x, "y": w.y, "t": float(tr["t"]) - S, "k": int(tr["seed"]), "r": float(tr["size"])})
		"fumes":
			var i := 0
			for c in A("FUMES_CLOUDS"):
				var w := own(m.world.x, m.world.y, fx, fy, float(c["at"][0]), float(c["at"][1]))
				var R := float(c["R"]) / tile()
				var d := w.distance_to(C)
				var most := float(P["floor"]) - R * 0.6
				if d > most:
					w = C + (w - C) / d * most
				lay["spots"].append({"x": w.x, "y": w.y, "t": float(c["vent"]) - S, "k": i, "r": R, "done": float(c["boom"]) - S})
				i += 1
		"wildfire":
			var WF: Dictionary = A("WILDFIRE")
			var i := 0
			var tries := 0
			while i < int(WF["spots"]) and tries < 400:
				tries += 1
				var ang := randf_range(0.0, TAU)
				var r := sqrt(randf()) * (float(P["floor"]) - 0.7)
				var q := C + Vector2(cos(ang), sin(ang)) * r
				if q.distance_to(m.world) < 1.6 or (lay["spots"] as Array).any(func(o): return Vector2(o["x"], o["y"]).distance_to(q) < 2.2):
					continue
				lay["spots"].append({"x": q.x, "y": q.y, "t": float(WF["first"]) + float(WF["over"]) * i / float(WF["spots"]), "k": i})
				i += 1
			var links: Array = []
			var sp: Array = lay["spots"]
			for a in sp.size():
				for b in range(a + 1, sp.size()):
					if Vector2(sp[a]["x"], sp[a]["y"]).distance_to(Vector2(sp[b]["x"], sp[b]["y"])) <= float(TU2("wildfire")["link"]):
						links.append([a, b])
			lay["links"] = links
	peril(m, "wsboss:" + id, m.world, {"fx": fx, "fy": fy, "dur": float(M["end"]), "dmg": roll, "el": el, "lay": lay})
	# (THE SLAM'S RING, rolling out over the whole floor from him: it cannot be dodged)
	peril(m, "wsboss:slamring", m.world, {"dur": float(P["floor"]) * 2.0 / float(TU2("ring")["pace"]), "dmg": roll})


## CONTAGION's lay: the rune splits into sparks that leap to four spots, one near him; the sickness spreading out of each, patch
## by patch, ragged, each patch its own moment.
func _contagion(lay: Dictionary, m, hero, C: Vector2, P: Dictionary) -> void:
	var CO: Dictionary = A("CONTAGION")
	var size := float(TU2("contagion")["cell"])
	var R := float(P["floor"])
	var x0 := C.x - R
	var y0 := C.y - R
	var n := ceili(2.0 * R / size)
	var at := PackedFloat64Array()
	at.resize(n * n)
	at.fill(INF)
	var from := PackedInt32Array()
	from.resize(n * n)
	from.fill(-1)
	var open: Array = []
	var seeds: Array = []
	var i := 0
	for sd in CO["seeds"]:
		var st := float(sd[2])
		var s: Vector2 = hero.world
		if i > 0:
			for tries in 30:
				var a := randf_range(0.0, TAU)
				var r := randf_range(2.5, R - 0.8)
				s = C + Vector2(cos(a), sin(a)) * r
				if seeds.all(func(q): return Vector2(q[0], q[1]).distance_to(s) > 3.5):
					break
		else:
			s += Vector2(randf_range(-0.8, 0.8), randf_range(-0.8, 0.8))
		seeds.append([s.x, s.y, st])
		i += 1
	for sd in seeds:
		var ii := floori((float(sd[0]) - x0) / size)
		var jj := floori((float(sd[1]) - y0) / size)
		if ii < 0 or jj < 0 or ii >= n or jj >= n:
			continue
		var k := jj * n + ii
		at[k] = minf(at[k], float(sd[2]))
		open.append(k)
		lay["spots"].append({"x": sd[0], "y": sd[1], "t": sd[2], "k": lay["spots"].size()})
	var step: Array = CO["step"]
	while not open.is_empty():
		var bi := 0
		for q in range(1, open.size()):
			if at[open[q]] < at[open[bi]]:
				bi = q
		var k: int = open[bi]
		open.remove_at(bi)
		var ci := k % n
		var cj := k / n
		for dd in [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]:
			var i2: int = ci + dd[0]
			var j2: int = cj + dd[1]
			if i2 < 0 or j2 < 0 or i2 >= n or j2 >= n:
				continue
			var cx := x0 + (i2 + 0.5) * size
			var cy := y0 + (j2 + 0.5) * size
			if not on_arena(cx, cy, 0.0) or Vector2(cx, cy).distance_to(m.world) < 1.3:
				continue
			var kk := j2 * n + i2
			var d := (float(step[0]) + (float(step[1]) - float(step[0])) * randf()) * (1.41 if dd[0] != 0 and dd[1] != 0 else 1.0)
			if at[k] + d < at[kk]:
				if is_inf(at[kk]):
					open.append(kk)
				at[kk] = at[k] + d
				from[kk] = k
	lay["grid"] = {"x0": x0, "y0": y0, "n": n, "size": size, "at": at, "from": from}
