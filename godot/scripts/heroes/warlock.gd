## THE WARLOCK (game/warlock.ts: "A demon inside. It wants out."; Strength and Intelligence his two, each a little less: words.gd), his
## moves as the game makes them (game.ts deliver, curseAll, damningAll, spreadBurns (monsters.gd), smokeThrough, smokeEcho, demonLands,
## warlockHit, hellOnIt, curseOne, stepPact, beginChange, stepChange; WARLOCK_TUNE), on what every hero's moves have in common
## (heroes/kit.gd), his words in them as for every hero.
## AS A MAN:
##   HELLFIRE BOLT (left button): a bolt of his hellfire at one enemy, 14 tiles a second, 9 at most; what it hits burns in his
##     hellfire, half the hit again each second for 4 s ("a relatively strong DOT").
##   CURSE (right button; 5 s): chains of smoke curse every enemy within 4.5 tiles that he can see: each struck a little, and it
##     smoulders (four tenths of that a second, 6 s); when a cursed one dies, every burn on it (his hellfire, the curse, fire, poison,
##     bleeding) leaps to the enemies within 3.5 tiles of it (monsters.gd spread_burns).
##   SMOKE STEP (Space; 4 s): he streaks to a spot as smoke (6 tiles at most, as near there as he can see; 0.28 s); nothing can hit
##     him, and whoever he passes through is struck and cursed, each once.
##   THE PACT: each hit of his fills it a thirtieth; full, his arm blazes, and R changes him: 2.4 s of the change, nothing harming
##     him, and the demon roars out of him, throwing back what is within 2.6 tiles.
## AS THE DEMON (its three in the places of his, his words in them: game/warlock.ts DEMON_KIT): CLAW RAKE (one claw, then the other,
##   2 tiles; what it tears is cursed), DAMNING (6 s: the ground erupts under every enemy within 6 tiles cursed or burning, it is
##   struck, every burn on it paid out at once, and it is thrown), SMOKE STEP (the violent one: it rakes, curses and knocks aside
##   whoever it passes through, and bursts out where it stops). Its pact runs dry in 18 s (each of its hits putting a little back);
##   empty, the demon burns out (2 s) and he is a man again.
## Left out: his tree (the talents: the game's switch for them is off).
extends "res://scripts/heroes/kit.gd"

const PF := preload("res://scripts/pixel_font.gd")

## THE DEMON MADE TERRIBLE (his words of 22 Nov 2026: “The warlock's demon form is one of the weaker character identities in terms of
## performance, impact, and fun.  Love his look, but something about his attacks don't give off massive threatening menacing demon.
## That and the skill tree need work.”). His look kept, every picture of it; what it does and how it lands made far heavier. Behind
## this switch, off till he has seen it and said yes (PICTURES FIRST); `--demon2=1` turns it on for a run (the checks, the film).
##   CLAW RAKE: a sweep of both claws through everything in a wide arc before it (2.6 tiles), harder (1.7 of a hit, from 1.3); what it
##     tears is cursed AND set burning in his hellfire; each rake that lands shakes the screen and stops the world a breath (HIT_STOP).
##   DAMNING (4.5 s, from 6): the ground erupts under EVERY enemy near it, not only the cursed and burning; those cursed or burning pay
##     every burn on them at once and half as much again; each thrown half as far again and stunned a moment.
##   DEMON STEP: lands with a blast half as wide again and as hard as a hit, stunning, and leaves the ground burning where it lands.
##   DREAD: while he is the demon every enemy within DREAD.r of him moves and strikes slower and takes more from him; and he takes less.
##   THE CHANGE: its roar reaches 4 tiles, strikes everything there with a rake's weight, and stuns all but a boss; the screen shakes
##     twice as hard. Its sounds and the rakes' a little deeper.
##   HIS TREE: BOUND DEMON no longer keeps him a man: when the demon burns out it tears free of him and fights at his side, roaring,
##     for BOUND_SECS more; TERRIBLE ROAR's roar half as wide again.
const DEMON2 := false
## HIS CURSE THROWN (his words, 22 Nov 2026: “Oh, the curse attack for the warlock.  I need it to be a ranged ability.  I think
## now it's just an aoe around him? / That should make cursing everything much easier and thus make his burns last forever
## easier as well”): his Curse thrown where he aims, CURSE_REACH tiles at most (as near there as he can see), a streak of smoke
## to it, and every enemy within CURSE_RAD of where it lands that it can see struck and cursed, chains of smoke to each. On at
## his “That's fine.” to its pictures (docs/mockups/warlock_curse). Off (`--curse=round`): every enemy within 4.5 tiles of him,
## as the game has it.
static var CURSE_RANGED := true
const CURSE_REACH := 9.0
const CURSE_RAD := 3.5
## (its flight: a ball of his hellfire arcing from his claw to the spot, then the ring of where it lands, and the chains)
const CURSE_FLY := 0.25
const CURSE_CARD := "Throw chains of smoke where you aim: every enemy near where they land is cursed. The cursed smoulder, and when one dies every burn on it spreads to those near it."
const D2 := {
	"rake": {"range": 2.6, "arcCos": -0.15, "dmg": 1.7},
	"damning": {"cooldown": 4.5, "pay": 1.5, "throw": 2.4, "stun": 0.6},
	"step": {"burst": 2.4, "burstShare": 1.0, "stun": 0.5, "burnR": 2.0, "burnSecs": 3.0, "burnShare": 0.35},
	"dread": {"r": 4.0, "pace": 0.75, "more": 0.2, "less": 0.3},
	"roar": {"r": 4.0, "share": 1.0, "stun": 1.0, "kick": 8.0, "wide": 1.5},
	"hitStop": 0.05, "rakeKick": 2.5, "deep": 0.8, "boundSecs": 8.0,
	# HIS TREE'S NUMBERS: Hunger 3 s a kill (from 2); Bloodlust 15% a kill (from 10%); Hellwave every other rake, harder (every third,
	# 0.8); Damned Souls' souls half as hard again; Hex Chain's leaps and Pyre's bursts as hard as the hit (0.7, 0.6); Soul Debt a
	# sixth of his pact a death (a tenth)
	"tree": {"hunger": {"secs": 3}, "bloodlust": {"each": 0.15}, "hellwave": {"every": 2, "share": 1.2}, "souls": {"share": 1.5},
		"hexChain": {"share": 1.0}, "pyre": {"share": 1.0}, "soulDebt": {"share": 0.16}},
	"texts": {
		"hunger": "Every kill the demon makes puts three seconds back on its pact.",
		"bloodlust": "Every kill makes the demon’s rakes quicker, up to twice as quick, until it burns out.",
		"hellwave": "Every other rake throws a wave of hellfire on ahead, through everything in its way.",
		"soulDebt": "Every cursed enemy that dies fills a sixth of his pact.",
		"souldebt": "Every cursed enemy that dies fills a sixth of his pact.",
	},
}


static func demon2() -> bool:
	return DEMON2 or OS.get_cmdline_user_args().has("--demon2=1")


## (the bug hunt's fourth round: no R: CHANGE or TAP HIM over his full pact in a town, where he does not change; off till his yes)
static var HINT_TOWN_OFF := false

const W := {
	"hell": {"share": 0.5, "secs": 4.0},
	"curse": {"share": 0.4, "secs": 6.0},
	"pact": {"full": 30.0, "hit": 1.0, "demonSecs": 18.0, "demonHit": 0.2},
	"change": {"secs": 2.4, "roar": 2.6},
	"burnOut": {"secs": 2.0},
	"damning": {"pay": 1.0, "throw": 1.6},
	"step": {"secs": 0.28, "demonSecs": 0.3, "aside": 1.2, "burst": 1.6, "burstShare": 0.6},
}

## "man" or "demon"; his pact (0 to 30); the change he is in the middle of ({to, t, dur}, empty when none)
var form := "man"
var pact := 0.0
## (HIS TREE: Bloodlust, the demon's kills since it came out; what a hit of his came by: "" his own, "chain" a Hex Chain's leap,
## "blaze" his Blazing Arm's burst: game.ts warlockBy)
var lust := 0
var _by := ""


func _T() -> Dictionary:
	return Talents.D["warlockTalents"]
var change := {}
var _deny := 0.0


func _init(hero) -> void:
	super(hero, "warlock")
	if demon2():
		_demon2_data()
	curse_card()


## (CURSE_RANGED) His Curse's card as the switch has it.
static func curse_card() -> void:
	if CURSE_RANGED:
		Words.data()["skills"]["curse"]["desc"] = CURSE_CARD


## (THE DEMON MADE TERRIBLE) The demon's three as the switch has them, and his tree's two talents' words.
static func _demon2_data() -> void:
	var S: Dictionary = Words.data()["skills"]
	var R: Dictionary = D2["rake"]
	S["rake"]["range"] = R["range"]
	S["rake"]["arc"] = true
	S["rake"]["arcCos"] = R["arcCos"]
	S["rake"]["dmg"] = R["dmg"]
	S["rake"]["desc"] = "Sweep both claws through everything before you. What they tear is cursed and burns in your hellfire."
	S["damning"]["cooldown"] = D2["damning"]["cooldown"]
	S["damning"]["desc"] = "Tear up the floor: the ground erupts under every enemy near you, throwing and stunning it; the cursed and burning pay every burn at once, and half as much again."
	S["demonstep"]["desc"] = "Smash through them as smoke: what you pass through is raked, cursed and knocked aside, and you land in a blast that stuns and leaves the ground burning."
	# (his tree's numbers: what leads to the demon and what it does, harder and sooner)
	var WT: Dictionary = Talents.D["warlockTalents"]
	for k in D2["tree"]:
		for n in D2["tree"][k]:
			WT[k][n] = D2["tree"][k][n]
	for t in Talents.tree("warlock")["talents"]:
		if D2["texts"].has(t["id"]):
			t["text"] = D2["texts"][t["id"]]
		if t["id"] == "bounddemon":
			t["text"] = "When the demon burns out it tears free of him and fights at his side, roaring, for eight seconds more."
		elif t["id"] == "terribleroar":
			t["text"] = "The change’s roar reaches half as far again, curses everything it throws back, and they run from him for two seconds."


## (the look the hero's pictures are taken from: render.ts, the demon's while he is it, his arm blazing while his pact is full)
func look_key() -> String:
	if form == "demon":
		return "demon"
	return "blaze" if pact >= float(W["pact"]["full"]) and change.is_empty() else "dungeon"


func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_deny = maxf(0.0, _deny - dt)
	_tick(dt)
	# (nothing harms him while he changes; he does nothing else: game.ts updateHero, `if (h.change) return`)
	if not change.is_empty():
		_step_change(dt)
		return true
	_step_pact(dt)
	if not change.is_empty():
		return true
	return _act(dt, way, hooked)


# =====================================================================================================================
# WHAT HIS MOVES SEND (game.ts deliver: the bolt, the curse; the demon's rakes and Damning)

func _release_sound(def: Dictionary) -> void:
	var id: String = h.loadout.id(0)
	if def["kind"] == "melee":
		h.sfx.play("rake" if id == "rake" else "swing", linear_to_db(0.8))
	elif def["kind"] == "projectile":
		h.sfx.play("hellbolt" if id == "hellbolt" else "shot", linear_to_db(0.8))
	else:
		super(def)


func _deliver(i: int, from: Vector2, to: Vector2, frac: float, primary: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var way := to - from
	way = way / way.length() if way.length() >= 0.01 else h.face
	var each: float = frac * float(r["count_dmg"])
	var words: Array = h.loadout.wfronts(i)
	var echo := not primary
	var kind := str(def["kind"])
	h._cast(i, kind, from, way, echo)
	if primary:
		h._time_word_sound(i)
	if kind == "projectile":
		var base := atan2(way.y, way.x)
		var hit: Array = []
		var n: int = r["count"]
		for k in n:
			var a := base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 0.16)
			var u := Vector2(cos(a), sin(a))
			shots.append({"x": from.x + u.x * 0.4, "y": from.y + u.y * 0.4, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
				"r": minf(0.6, float(def["radius"]) * float(r["size"]) * (1.5 if float(r["splash"]) >= 1.5 else 1.0)), "dist": float(def["range"]),
				"dmg": each, "element": r["element"], "pierce": bool(r["pierce"]), "hit": hit, "volley": n > 1, "skill": i, "trail": 0.0,
				"words": words, "age": 0.0, "n": k, "flown": 0.0, "look": "hellbolt"})
	elif kind == "curse":
		# (every enemy near him struck and cursed; Twin, a second a moment later)
		if primary:
			h.sfx.play("curse", linear_to_db(0.8))
		var rad: float = float(def["radius"]) * float(r["size"])
		# (CURSE_RANGED: thrown where he aims, a streak of smoke to the spot; Twin's second there too)
		var at: Vector2 = from
		if CURSE_RANGED:
			# (its echo, from where he threw it, as far as he could see from there: it went through walls, cursing and waking what was
			# behind them: the bug hunt's third round, 25 Nov 2026)
			at = _reach_point(to, CURSE_REACH) if primary else _reach_point(to, CURSE_REACH, from)
			rad = CURSE_RAD * float(r["size"])
			_say({"t": "curseThrow", "x0": from.x, "y0": from.y, "x1": at.x, "y1": at.y, "r": rad, "fly": CURSE_FLY})
		var count: int = r["count"]
		var land := func() -> void:
			for k in count:
				if k == 0:
					_curse_all(i, at, rad, each, 0, echo)
				else:
					_after(0.28 * k, func() -> void: _curse_all(i, at if CURSE_RANGED else h.world, rad, each, k, echo))
		if CURSE_RANGED:
			_after(CURSE_FLY, land)
		else:
			land.call()
	elif kind == "melee":
		# (the demon's rake: one claw, then the other; Twin, a second blow a moment after)
		for k in int(r["count"]):
			if k == 0:
				h._strike(i, from, way, each, 0, echo, float(def["range"]))
			else:
				_after(0.13 * k, func() -> void: h._strike(i, from if echo else h.world, way, each, k, echo, float(def["range"])))
		# (HIS TREE: Hellwave, every third rake throws a wave of hellfire on ahead: game.ts release, rakeDone)
		if primary and h.loadout.id(i) == "rake":
			_rake_done(h.world, h.face, 1.0)
	elif kind == "damning":
		# (every cursed or burning enemy near it struck, and all its burns paid out at once; Twin, a second eruption a moment later)
		if primary:
			h.sfx.play("damning", linear_to_db(0.9))
		var rad: float = float(def["radius"]) * float(r["size"])
		for k in int(r["count"]):
			if k == 0:
				_damning_all(i, from, rad, each, 0, echo)
			else:
				_after(0.28 * k, func() -> void: _damning_all(i, h.world, rad, each, k, echo))
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, kind, from, way, again)
	# (its boons and the last words': kit.gd _used)
	if primary:
		_used(i, from, way, frac, true)


## (game.ts curseAll) Every enemy within `rad` that he can see struck and cursed, chains of smoke to each.
func _curse_all(i: int, at: Vector2, rad: float, frac: float, n := 0, echo := false) -> void:
	var to: Array = []
	var them: Array = []
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m) or m.world.distance_to(at) > rad + m.r or not h.monsters.sees(at, m.world):
				continue
			to.append({"id": m.id, "x": m.world.x, "y": m.world.y})
			them.append(m)
	_say({"t": "curse", "x": at.x, "y": at.y, "r": rad, "to": to, "n": n, "echo": echo})
	h.sfx.play("rune", linear_to_db(0.5 if n > 0 or echo else 0.8))
	var words: Array = h.loadout.wfronts(i)
	if words.has("power"):
		h.sfx.play("power", linear_to_db(0.9))
	if words.has("heavy"):
		h._tell({"t": "heavy", "x": at.x, "y": at.y, "r": rad, "big": true})
	var hits := 0
	for m in them:
		if is_instance_valid(m) and not m.dead:
			h.hit_monster(m, i, frac, hits >= 3)
			hits += 1
	if hits > 0:
		h._landed_on(i)
		if float(h.loadout.r(i)["pull"]) > 0.0:
			h.city.pull_in(i, at, rad, false)
	if n == 0:
		h._wake(i, at, rad, frac)


## (game.ts damningAll) Every enemy within `rad` cursed or burning: the ground erupts under it, it is struck, every burn on it is paid
## out at once, and it is thrown.
func _damning_all(i: int, at: Vector2, rad: float, frac: float, n := 0, echo := false) -> void:
	var D: Dictionary = W["damning"]
	var spots: Array = []
	var them: Array = []
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m) or m.world.distance_to(at) > rad + m.r:
				continue
			if m.curse_t > 0.0 or m.hell_t > 0.0 or m.burn_t > 0.0 or (demon2() and h.loadout.id(i) == "damning"):
				spots.append({"id": m.id, "x": m.world.x, "y": m.world.y})
				them.append(m)
	_say({"t": "damning", "x": at.x, "y": at.y, "at": spots, "n": n, "echo": echo})
	if h.loadout.wfronts(i).has("heavy"):
		h._tell({"t": "heavy", "x": at.x, "y": at.y, "r": rad, "big": true})
	h.kick(2.0 if n > 0 or echo else 4.0)
	h.sfx.play("slam", linear_to_db(0.6 if n > 0 or echo else 1.0))
	var hits := 0
	for m in them:
		if not is_instance_valid(m) or m.dead:
			continue
		# every burn still to come, paid now
		var owed: float = (m.hell_dps * m.hell_t if m.hell_t > 0.0 else 0.0) + (m.curse_dps * m.curse_t if m.curse_t > 0.0 else 0.0) \
			+ (m.burn_dps * m.burn_t if m.burn_t > 0.0 else 0.0) + (m.poison_dps * m.poison_t if m.poison_t > 0.0 else 0.0) \
			+ (m.bleed_dps * m.bleed_t if m.bleed_t > 0.0 else 0.0)
		m.hell_t = 0.0
		m.curse_t = 0.0
		m.burn_t = 0.0
		m.poison_t = 0.0
		m.bleed_t = 0.0
		h.hit_monster(m, i, frac, hits >= 3)
		hits += 1
		var big := demon2()
		var pay: float = float(D2["damning"]["pay"]) if big else float(D["pay"])
		if not m.dead and owed * pay >= 1.0:
			m.damage(h.side(m, roundf(owed * pay), i), "fire", false, false, [], false, true, i)
		if big and not m.dead:
			_say({"t": "burst", "x": m.world.x, "y": m.world.y, "r": 0.9, "el": "fire", "style": "blast"})
			if not m.boss:
				m.stun_for(float(D2["damning"]["stun"]))
		if not m.dead:
			m.throw_from(at, float(D2["damning"]["throw"]) if big else float(D["throw"]), 0.25)
	if hits > 0:
		h._landed_on(i)
		if float(h.loadout.r(i)["pull"]) > 0.0:
			h.city.pull_in(i, at, rad, false)
	if n == 0:
		h._wake(i, at, rad, frac)


## (game.ts warlockHit) What a hit of his sets going: his hellfire (the bolt), the curse (the Curse, the smoke steps, the rakes); and
## his pact, filled by his hits as a man, a little put back by the demon's.
func on_hit(m, i: int, dmg: float) -> void:
	var id: String = h.loadout.id(i)
	# (HIS TREE: the Bound Demon's rakes are struck as the hits of his first place, and curse as the demon's do; a Hellwave burns)
	var bolt: bool = id == "hellbolt" and _by != "bound"
	var was_cursed: bool = m.curse_t > 0.0
	if not m.dead and (bolt or _by == "wave" or (demon2() and id == "rake" and form == "demon")):
		_hell_on(m, dmg)
	# (THE DEMON MADE TERRIBLE: a rake that lands shakes the screen and stops the world a breath, once a rake)
	if demon2() and id == "rake" and form == "demon" and _by == "":
		_rake_landed()
	if not m.dead and (_by == "bound" or id in ["curse", "smokestep", "rake", "demonstep"]):
		_curse_one(m, dmg)
	# (HIS TREE: Branded, every Hellfire Bolt curses what it hits)
	if not m.dead and bolt and h.has("branded"):
		_curse_one(m, dmg)
	# (HIS TREE: Hex Chain, a bolt on one cursed leaps on to the next; Blazing Arm, with his pact full his bolt bursts. Each only from
	# the one the bolt itself struck: not from every one its fire's burst caught round it (each of them setting off a chain and a
	# burst of its own was a bolt in a pack some forty bolts' worth: the damage check, 22 Nov 2026))
	if bolt and _by == "" and not splashing and was_cursed and h.has("hexchain"):
		_hex_chain(m, i)
	if bolt and (_by == "" or _by == "chain") and not splashing and form != "demon" and bound.is_empty() and pact >= float(W["pact"]["full"]) and h.has("blazingarm"):
		_blaze(m, i, dmg)
	var full: float = W["pact"]["full"]
	var was := pact
	if form == "demon" or _by == "bound":
		pact = minf(full, was + float(W["pact"]["demonHit"]))
	elif change.is_empty() and bound.is_empty():
		pact = minf(full, was + float(W["pact"]["hit"]))
		if was < full and pact >= full:
			_say({"t": "pactFull", "x": h.world.x, "y": h.world.y})
			h.sfx.play("power", linear_to_db(0.8))


## (game.ts hellOnIt) It burns in his hellfire: half the hit each second for 4 s, a stronger taking the place of a weaker.
func _hell_on(m, dmg: float) -> void:
	var dps := dmg * float(W["hell"]["share"])
	if m.hell_t <= 0.0:
		_say({"t": "hellOn", "id": m.id, "x": m.world.x, "y": m.world.y})
	if m.hell_t <= 0.0 or dps > m.hell_dps:
		m.hell_dps = dps
	m.hell_t = W["hell"]["secs"]


## (game.ts curseOne) Cursed: it smoulders, four tenths of the hit that cursed it each second, 6 s; a stronger curse takes the place of
## a weaker.
func _curse_one(m, dmg: float) -> void:
	var dps := dmg * float(W["curse"]["share"])
	if m.curse_t <= 0.0 or dps > m.curse_dps:
		m.curse_dps = dps
	m.curse_t = W["curse"]["secs"]


# =====================================================================================================================
# THE SMOKE STEP (game.ts useEvasive, kind smoke; smokeThrough; smokeEcho; demonLands)

func _use_evasive(at: Vector2, way: Vector2) -> void:
	var def := _def(2)
	at = _evasive_at(at, way)
	if charges[2] < 1:
		return
	# (ABILITIES: MANA: not without the mana for it: game.ts useEvasive, noMana)
	if h.mana < float(h.loadout.r(2)["mana"]):
		h.no_mana()
		return
	var land := _reach_point(at, float(def["range"]))
	if land.distance_to(h.world) < 0.5:
		if _deny <= 0.0:
			_deny = 0.8
			h.sfx.play("deny")
			h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "No room", "color": "#8c8090"})
		return
	_pay_evasive()
	_face(at)
	h.sfx.play("smokestep")
	var r: Dictionary = h.loadout.r(2)
	var x0: Vector2 = h.world
	var dir: Vector2 = (at - x0).normalized() if at.distance_to(x0) > 0.0 else h.face
	h._cast(2, "smoke", x0, dir)
	h._boons(2)
	h._time_word_sound(2)
	h.last.dodge_surge(x0)
	var demon: bool = h.loadout.id(2) == "demonstep"
	move = {"kind": "smoke", "from": x0, "to": land, "t": 0.0, "dur": float(W["step"]["demonSecs"] if demon else W["step"]["secs"]), "hit": [], "demon": demon}
	h._act = "lunge"
	if h.move_safe():
		h._invuln = maxf(h._invuln, 0.06)
	_say({"t": "smoke", "x0": x0.x, "y0": x0.y, "x1": land.x, "y1": land.y, "demon": demon})
	if demon:
		h.sfx.play("slam", linear_to_db(0.6))
	else:
		# behind: left where he went up in smoke
		h._wake(2, x0, float(def["radius"]) * float(r["size"]), float(r["count_dmg"]))
		# (HIS TREE: Phantom Step, his shadow left where he stood: the enemies near go after it, not him, a while: the decoys)
		if h.has("phantomstep") and h.monsters != null:
			var P: Dictionary = _T()["phantom"]
			var d := {"x": x0.x, "y": x0.y, "t": float(P["secs"]), "r": float(P["reach"]), "size": h.RADIUS}
			h.monsters.decoys.append(d)
			_say({"t": "phantom", "x": x0.x, "y": x0.y, "secs": P["secs"]})
			_shadow_of(d)
	# "of Echoes": a moment later the smoke streaks along the same way again, weaker
	if float(r["echo"]) > 0.0:
		var x1 := land
		var again := func() -> void: _smoke_echo(x0, x1, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]))
		h._echo_of(2, "smoke", x0, dir, again)


func _move_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
	if h.move_safe():
		h._invuln = maxf(h._invuln, 0.06)
	var k := clampf(float(move["t"]) / float(move["dur"]), 0.0, 1.0)
	h.world = (move["from"] as Vector2).lerp(move["to"], k)
	_anim_t += dt
	_smoke_through()
	if k >= 1.0:
		var demon: bool = move["demon"]
		move = {}
		h._act = ""
		_anim_t = 0.0
		if demon:
			_demon_lands()


## (game.ts smokeThrough) Whoever the smoke passes through is struck (the demon's rakes it and knocks it aside) and cursed, each once.
func _smoke_through() -> void:
	if h.monsters == null:
		return
	var def := _def(2)
	var r: Dictionary = h.loadout.r(2)
	var hit: Array = move["hit"]
	var reach: float = float(def["radius"]) * float(r["size"])
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or hit.has(m) or h.monsters.shut_in(m):
			continue
		if m.world.distance_to(h.world) > reach + m.r:
			continue
		hit.append(m)
		_say({"t": "smokeHit", "id": m.id, "x": m.world.x, "y": m.world.y, "n": 0, "echo": false})
		h.hit_monster(m, 2, float(r["count_dmg"]), hit.size() > 3)
		if hit.size() == 1:
			h._landed_on(2)
			if h.loadout.wfronts(2).has("heavy"):
				h._tell({"t": "heavy", "x": m.world.x, "y": m.world.y, "r": reach, "big": false})
			if float(r["pull"]) > 0.0:
				h.city.pull_in(2, m.world, reach * 2.0, false)
		# (Twin: each struck again a moment later)
		var id: String = h.loadout.id(2)
		for k in range(1, int(r["count"])):
			_after(0.13 * k, func() -> void:
				if not is_instance_valid(m) or m.dead or h.loadout.id(2) != id:
					return
				_say({"t": "smokeHit", "id": m.id, "x": m.world.x, "y": m.world.y, "n": k, "echo": false})
				h.hit_monster(m, 2, float(h.loadout.r(2)["count_dmg"]), true))
		if bool(move["demon"]) and not m.dead:
			# knocked aside, off its line
			var l: Vector2 = (move["to"] as Vector2) - (move["from"] as Vector2)
			var side := 1.0 if (m.world.x - h.world.x) * l.y - (m.world.y - h.world.y) * l.x >= 0.0 else -1.0
			var len := l.length() if l.length() > 0.0 else 1.0
			m.throw_from(m.world - Vector2(l.y / len * side, -l.x / len * side), float(W["step"]["aside"]), 0.2)


## (game.ts smokeEcho) "Of Echoes": the smoke streaks along its way again, striking and cursing whoever it passes through.
func _smoke_echo(x0: Vector2, x1: Vector2, frac: float) -> void:
	var def := _def(2)
	var r: Dictionary = h.loadout.r(2)
	var demon: bool = h.loadout.id(2) == "demonstep"
	_say({"t": "smoke", "x0": x0.x, "y0": x0.y, "x1": x1.x, "y1": x1.y, "demon": demon, "echo": true})
	var l := x1 - x0
	var l2 := l.length_squared() if l.length_squared() > 0.0 else 1.0
	var hits := 0
	if h.monsters == null:
		return
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m):
			continue
		var k := clampf(((m.world.x - x0.x) * l.x + (m.world.y - x0.y) * l.y) / l2, 0.0, 1.0)
		var reach: float = float(def["radius"]) * float(r["size"]) + (float(W["step"]["aside"]) if demon else 0.0)
		if m.world.distance_to(x0 + l * k) > reach + m.r:
			continue
		_say({"t": "smokeHit", "id": m.id, "x": m.world.x, "y": m.world.y, "n": 0, "echo": true})
		h.hit_monster(m, 2, frac, hits >= 3)
		hits += 1
	if hits > 0:
		h._landed_on(2)


## (game.ts demonLands) The demon's smoke step ends: it bursts out of the smoke, its claws slammed down, knocking back whoever is there.
func _demon_lands() -> void:
	var r: Dictionary = h.loadout.r(2)
	var S: Dictionary = D2["step"] if demon2() else W["step"]
	h.kick(5.0 if demon2() else 3.0)
	h._blast(2, h.world + h.face * 0.6, float(S["burst"]) * float(r["size"]), float(r["count_dmg"]) * float(S["burstShare"]), "land", false, linear_to_db(0.8))
	if h.monsters != null:
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) <= float(S["burst"]) + m.r:
				m.throw_from(h.world, 1.2, 0.2)
				if demon2() and not m.boss and not m.dead:
					m.stun_for(float(S["stun"]))
	# (THE DEMON MADE TERRIBLE: the ground burning where it lands)
	if demon2() and h.wakes != null and is_instance_valid(h.wakes):
		h.wakes.add_patch(2, "burn", h.world, float(S["burnR"]), float(S["burnSecs"]), h.avg_hit(2, float(S["burnShare"])), "fire")
		_say({"t": "burst", "x": h.world.x, "y": h.world.y, "r": float(S["burst"]), "el": "fire", "style": "blast"})
	# behind: left where it bursts out, as far as it throws them
	h._wake(2, h.world, float(S["burst"]) * float(r["size"]) + 1.2, float(r["count_dmg"]))


# =====================================================================================================================
# THE PACT AND THE CHANGE (game.ts stepPact, beginChange, stepChange)

## (UNIQUE ITEMS, the Unsigned Pact: the demon is staying on his life: game.ts uq.feeding)
var feeding := false


func _step_pact(dt: float) -> void:
	var P: Dictionary = W["pact"]
	if form == "demon":
		pact = maxf(0.0, pact - float(P["full"]) / float(P["demonSecs"]) * dt)
		if pact <= 0.0:
			# (UNIQUE ITEMS: the Unsigned Pact, the pact dry, the demon stays for as long as he can pay: it feeds on his life, and lets
			# him go when he has little left, or at his word)
			var U = h.uniques
			var UP: Dictionary = U.ut["pact"] if U != null else {}
			# (what it takes this frame must leave him above the floor, else it lets him go: kept at the floor, his life's regen lifted
			# him just over it each frame and it fed for ever, the bug hunt's fourth round, 25 Nov 2026)
			var after: float = h.life - h.max_life * float(UP["drain"]) * dt if U != null and U.wears("unsignedpact") else 0.0
			var let_go: bool = Input.is_action_just_pressed("change") or h.get("auto_change") == true
			if U != null and U.wears("unsignedpact") and after > h.max_life * float(UP["floor"]) and not let_go:
				if not feeding:
					h._tell({"t": "unique", "id": "unsignedpact", "what": "feeds", "x": h.world.x, "y": h.world.y})
					U._say({"id": "unsignedpact", "what": "feeds"})
				feeding = true
				h.life = after
			else:
				feeding = false
				h.auto_change = false
				_begin_change("man")
		else:
			feeding = false
		return
	# (HIS TREE: Bound Demon, while it is out the pact runs dry as the demon's would; empty, it burns out)
	if not bound.is_empty():
		if bound["act"] != "out":
			pact = maxf(0.0, pact - float(P["full"]) / float(P["demonSecs"]) * dt)
			if pact <= 0.0:
				_bound_burns_out()
		return
	var asked: bool = Input.is_action_just_pressed("change") or h.get("auto_change") == true
	if h.get("auto_change") == true:
		h.auto_change = false
	# (no change in a town, the camp or the Rim: he is drawn there as the man, the demon's moves were on the HUD; the bug hunt's
	# fourth round, 25 Nov 2026. His full pact waits for the way out.)
	if asked and pact >= float(P["full"]) and move.is_empty() and not h.in_town:
		if h.has("bounddemon") and not demon2():
			_tear_out()
		else:
			_begin_change("demon")


## He begins to change, into the demon or back: whatever he was doing is broken off.
func _begin_change(to: String) -> void:
	windup = {}
	queued = {}
	attack = {}
	move = {}
	swing_step = {}
	combo = 0
	combo_t = 0.0
	var dur: float = W["change"]["secs"] if to == "demon" else W["burnOut"]["secs"]
	change = {"to": to, "t": 0.0, "dur": dur}
	h._invuln = maxf(h._invuln, dur)
	_anim_t = 0.0
	h._act = ""
	_say({"t": "change", "to": to, "x": h.world.x, "y": h.world.y})
	h.sfx.play("power" if to == "demon" else "deny", linear_to_db(0.9))


## The change goes on; at its end he is the demon (it roars, throwing back what is near) or a man again.
func _step_change(dt: float) -> void:
	change["t"] = float(change["t"]) + dt
	h._invuln = maxf(h._invuln, 0.06)
	if float(change["t"]) < float(change["dur"]):
		return
	var to: String = change["to"]
	change = {}
	_anim_t = 0.0
	if to == "demon":
		lust = 0
		_become("demon")
		pact = W["pact"]["full"]
		var R: float = W["change"]["roar"]
		if demon2():
			R = float(D2["roar"]["r"]) * (float(D2["roar"]["wide"]) if h.has("terribleroar") else 1.0)
		_say({"t": "roar", "x": h.world.x, "y": h.world.y, "r": R, "formed": true})
		h.kick(float(D2["roar"]["kick"]) if demon2() else 5.0)
		h.sfx.play("explode", linear_to_db(0.8))
		var struck := 0
		if h.monsters != null:
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) <= R + m.r:
					m.throw_from(h.world, 1.5, 0.25)
					# (THE DEMON MADE TERRIBLE: the roar strikes as a rake does, and stuns all but a boss)
					if demon2() and not m.dead and not h.monsters.shut_in(m):
						h.hit_monster(m, 0, float(D2["roar"]["share"]), struck >= 3)
						struck += 1
						if not m.dead and not m.boss:
							m.stun_for(float(D2["roar"]["stun"]))
		_terrible_roar(h.world, R)
	else:
		# (HIS TREE: Last Rites, as the demon burns out, Damning goes off by itself round him)
		if form == "demon" and h.has("lastrites"):
			var r1: Dictionary = h.loadout.r(1)
			_damning_all(1, h.world, float(Words.skill("damning")["radius"]) * float(r1["size"]), float(r1["count_dmg"]))
		lust = 0
		var was_demon := form == "demon"
		_become("man")
		pact = 0.0
		# (THE DEMON MADE TERRIBLE, BOUND DEMON: burnt out, it tears free of him and fights on beside him, its pact BOUND_SECS of the demon's)
		if demon2() and was_demon and h.has("bounddemon"):
			pact = float(W["pact"]["full"]) * float(D2["boundSecs"]) / float(W["pact"]["demonSecs"])
			_tear_out()


## The man again at once, his pact gone (game.ts die: the demon falls as the man it was): fallen, or come into a town, where he is
## drawn as the man (the demon's moves were on the HUD there, and it burned out: the bug hunt's third round, 25 Nov 2026).
func turn_man() -> void:
	change = {}
	feeding = false
	if form == "demon":
		lust = 0
		_become("man")
		pact = 0.0
	# (THE BOUND DEMON goes with the place, and does not follow him home or stand by him fallen: the bug hunt's fourth round)
	if not bound.is_empty():
		bound = {}
		pact = 0.0
		lust = 0
		rakes = 0


## (game.ts refresh) His three: the demon's in the places of his while he is it; his pictures' times with them.
func _become(f: String) -> void:
	form = f
	h.loadout.form_moves = Words.data()["demonKit"] if f == "demon" else []
	h.loadout.refresh()
	C = clips["warlock:demon"] if f == "demon" else clips["warlock"]


# =====================================================================================================================
# HIS PICTURES: the change (its own pictures, by how far through it he is), the smoke step (his run, twice as fast)

func _own_picture(side: int) -> Array:
	if not change.is_empty():
		var n: int = h.art.count(side, 56)
		if n > 0:
			return [56, clampi(floori(float(change["t"]) / float(change["dur"]) * n), 0, n - 1)]
		return [0, 0]
	if not move.is_empty():
		var n: int = h.art.count(side, 2)
		return [2, posmod(floori(_anim_t * 2.0 * float(C["walkFps"])), maxi(1, n))]
	return []


## THE PACT OVER HIS HEAD (render.ts, his pick of 28 Oct: "Bar over his head"): a thin cyan bar just under his life bar, filling as he
## hits; full, it blazes and says how he changes; as the demon, it runs down. There while the life bar is (`shown` 1), and always
## while it is full, he is the demon, or he changes. On `c` (hero.gd), `top` where his life bar is (picture pixels).
func draw_over(c: CanvasItem, top: float, shown: float) -> void:
	if not h.alive:
		return
	var full: float = W["pact"]["full"]
	var k := clampf(pact / full, 0.0, 1.0)
	var demon := form == "demon"
	var blaze := not demon and k >= 1.0 and change.is_empty()
	var a := maxf(shown, 1.0 if blaze or demon or not change.is_empty() else 0.0)
	if a <= 0.01:
		return
	var w := 44.0
	var x := -w / 2.0
	var y := top + 5.0 + 4.0
	var t := _clock
	var hot := blaze and floori(t * 6.0) % 2 == 0
	var ink := Color("#0e0c24")
	c.draw_rect(Rect2(x - 2, y - 2, w + 4, 8), Color(Color.WHITE if hot else Color("#22d0e0"), a) if blaze else Color(ink, a))
	c.draw_rect(Rect2(x, y, w, 4), Color(Color("#0a2630"), a))
	var fill := roundf(k * w / 2.0) * 2.0
	c.draw_rect(Rect2(x, y, fill, 4), Color(Color("#e8ffff") if hot else Color("#b8fff8"), a) if blaze else Color(Color("#22d0e0"), a))
	c.draw_rect(Rect2(x, y, fill, 2), Color(Color("#b8fff8"), a))
	if blaze:
		# (its fire licking up off it, and what to do)
		for i in 4:
			var fx0 := x + 4.0 + float((i * 7 + floori(t * 11.0)) % int(w / 2.0 - 3.0)) * 2.0
			var up := 1 + (i + floori(t * 9.0)) % 3
			c.draw_rect(Rect2(fx0, y - 2.0 - up * 2.0, 2.0, up * 2.0), Color("#e8ffff") if up > 2 else Color("#22d0e0"))
		# (over the life bar, clear of his head)
		# (main.ts pactHint: on a pad RB, on a touch screen TAP HIM, else R; with HINT_TOWN_OFF none in a town, where he does not
		# change: the bug hunt's fourth round, off till his yes)
		if HINT_TOWN_OFF and h.in_town:
			return
		# (main.ts pactHint: on a pad RB, on a touch screen TAP HIM, else R)
		var mm = h.monsters.main if h.monsters != null and is_instance_valid(h.monsters) else null
		var hint := "R: CHANGE"
		if mm != null and mm._pad != null and mm._pad.live():
			hint = "RB: CHANGE"
		elif mm != null and mm._touch != null and mm._touch.on:
			hint = "TAP HIM"
		PF.draw(c, hint, 0.0, top - 22.0, Color("#e8ffff") if hot else Color("#22d0e0"), {"align": "center", "font": "small", "shadow": ink, "scale": 2})


func readiness() -> Dictionary:
	var r := super()
	r["pact"] = pact / float(W["pact"]["full"])
	r["form"] = form
	return r


func _clear_own() -> void:
	for sh in _shadows:
		if is_instance_valid(sh["node"]):
			sh["node"].queue_free()
	_shadows.clear()
	# (HIS TREE: what he threw and raised is gone with the place; the Bound Demon is torn out beside him again where he arrives)
	hellwaves.clear()
	souls.clear()


## (Phantom Step) His shadows standing where he stepped from: {d: its decoy, node}.
var _shadows: Array = []
const FigureFx := preload("res://scripts/fx_figures.gd")


## (render.ts drawShadows) Him as he stood the moment he stepped away, gone dark as his smoke, an edge of the friend's cyan either
## side; among what stands, where he stood.
func _shadow_of(d: Dictionary) -> void:
	var holder = h.get_parent()
	if holder == null or h._sprite == null:
		return
	var node := Node2D.new()
	node.position = h.position
	for k in 3:
		var sp := Sprite2D.new()
		sp.texture = h._sprite.texture
		sp.centered = h._sprite.centered
		sp.offset = h._sprite.offset
		sp.scale = h._sprite.scale
		sp.position = h._sprite.position + Vector2([-2.0, 2.0, 0.0][k], 0.0)
		sp.material = FigureFx._flat_material()
		sp.modulate = Color("#22d0e0") if k < 2 else Color("#0c0e22")
		node.add_child(sp)
	holder.add_child(node)
	_shadows.append({"d": d, "node": node})


## His shadows: each flickering, fading as its time runs out, gone with it; his decoys (not a Golem's) run out.
func _step_own(dt: float) -> void:
	if not hellwaves.is_empty() or not souls.is_empty() or not bound.is_empty():
		_step_tree(dt)
	if h.monsters != null:
		for k in range(h.monsters.decoys.size() - 1, -1, -1):
			var d: Dictionary = h.monsters.decoys[k]
			if d.get("golem") != null:
				continue
			d["t"] = float(d["t"]) - dt
			if float(d["t"]) <= 0.0:
				h.monsters.decoys.remove_at(k)
	for k in range(_shadows.size() - 1, -1, -1):
		var sh: Dictionary = _shadows[k]
		var d: Dictionary = sh["d"]
		var node = sh["node"]
		if float(d["t"]) <= 0.0 or not is_instance_valid(node):
			if is_instance_valid(node):
				node.queue_free()
			_shadows.remove_at(k)
			continue
		var fade := minf(1.0, float(d["t"]) / 0.4) * (0.85 + 0.15 * sin(Time.get_ticks_msec() / 1000.0 * 23.0 + float(d["x"])))
		var kids: Array = node.get_children()
		for j in kids.size():
			var c: Color = kids[j].modulate
			c.a = (0.45 if j < 2 else 0.9) * fade
			kids[j].modulate = c


# =====================================================================================================================
# HIS TREE (game/talents.ts WARLOCK_TREE; game.ts warlockHit, warlockKill, hexChain, blaze, pyre, lastRites; WARLOCK_TUNE.talents)

## (Hex Chain) A bolt on one cursed leaps on to the next cursed one near it, up to three times, burning each.
func _hex_chain(from, i: int) -> void:
	var T: Dictionary = _T()["hexChain"]
	var hit: Array = [from]
	var at = from
	for k in int(T["leaps"]):
		var best = null
		var bd: float = T["reach"]
		for q in h.monsters.list:
			if not is_instance_valid(q) or q.dead or hit.has(q) or q.curse_t <= 0.0 or h.monsters.shut_in(q):
				continue
			var d: float = q.world.distance_to(at.world) - q.r
			if d < bd:
				bd = d
				best = q
		if best == null:
			return
		hit.append(best)
		var to = best
		var x0: Vector2 = at.world
		h._after(float(T["gap"]) * (k + 1), func() -> void:
			if not is_instance_valid(to) or to.dead or h.loadout.id(i) != "hellbolt":
				return
			_say({"t": "hexLeap", "x0": x0.x, "y0": x0.y, "x1": to.world.x, "y1": to.world.y})
			h.sfx.play("fire", linear_to_db(0.4))
			_by = "chain"
			h.hit_monster(to, i, float(T["share"]), true)
			_by = "")
		at = best


## (Blazing Arm) With his pact full, his bolt bursts: all near cursed and struck.
func _blaze(m, i: int, dmg: float) -> void:
	var T: Dictionary = _T()["blazing"]
	_say({"t": "blaze", "x": m.world.x, "y": m.world.y, "r": T["r"]})
	h.sfx.play("fire", linear_to_db(0.7))
	var was := _by
	_by = "blaze"
	var n := 0
	for o in h.monsters.list:
		if not is_instance_valid(o) or o == m or o.dead or h.monsters.shut_in(o) or o.world.distance_to(m.world) > float(T["r"]) + o.r:
			continue
		h.hit_monster(o, i, float(T["share"]), n >= 3)
		n += 1
		if not o.dead:
			_curse_one(o, dmg)
	_by = was


## A kill of his (game.ts warlockKill): the demon's (Hunger, Feast, Bloodlust); a cursed one's (Soul Debt, Pyre).
func on_kill(m) -> void:
	var T := _T()
	var P: Dictionary = W["pact"]
	# (the demon's kills: everything that dies while he is the demon, and what the Bound Demon's own rakes kill)
	if form == "demon" or _by == "bound":
		if h.has("hunger"):
			pact = minf(float(P["full"]), pact + float(T["hunger"]["secs"]) * (float(P["full"]) / float(P["demonSecs"])))
		if h.has("feast"):
			var n: float = h.max_life * float(T["feast"]["share"])
			h.heal_flat(n)
			_say({"t": "heal", "amount": roundi(n)})
		if h.has("bloodlust"):
			lust += 1
		if h.has("damnedsouls"):
			_raise_soul(m)
	if m.curse_t > 0.0:
		if h.has("souldebt"):
			pact = minf(float(P["full"]), pact + float(P["full"]) * float(T["soulDebt"]["share"]))
		if h.has("pyre"):
			var at: Vector2 = m.world
			h._after(0.05, func() -> void: _pyre(at))


## (Pyre) A cursed one bursts in his hellfire as it dies: everything near struck, as his Curse strikes.
func _pyre(at: Vector2) -> void:
	var T: Dictionary = _T()["pyre"]
	_say({"t": "pyre", "x": at.x, "y": at.y, "r": T["r"]})
	h.sfx.play("fire", linear_to_db(0.6))
	var n := 0
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead or h.monsters.shut_in(o) or o.world.distance_to(at) > float(T["r"]) + o.r:
			continue
		h.hit_monster(o, 1, float(T["share"]), n >= 3)
		n += 1


## (Bloodlust) Every kill the demon makes its rakes the quicker, up to twice as quick, till it burns out.
func rate_k() -> float:
	if form == "demon" and h.has("bloodlust"):
		var B: Dictionary = _T()["bloodlust"]
		return minf(float(B["most"]), 1.0 + lust * float(B["each"]))
	return 1.0


# --- HIS TREE: Terrible Roar, Hellwave, Damned Souls, the Bound Demon (game.ts terribleRoar, runFrom, rakeDone, raiseSoul, tearOut,
# boundBurnsOut, updateWarlockTree) ---

## (Hellwave: his rakes counted, the demon's and the Bound Demon's; its waves running on ahead; Damned Souls' souls flying to the ones
## they go for; THE BOUND DEMON out beside him: {x, y, fx, fy, act ("arrive", "stand", "walk", "rake", "out"), t, target, did, walked,
## rake_cd})
var rakes := 0
var hellwaves: Array = []
var souls: Array = []
var bound := {}


## (his first place's hit made the demon's rake's, as a man: for what the Bound Demon and the souls strike with)
func _rake_k() -> float:
	return 1.0 if form == "demon" else float(Words.skill("rake")["dmg"]) / float(Words.skill(h.loadout.id(0))["dmg"])


## TERRIBLE ROAR: the demon's roar (or the Bound Demon's, torn out) curses all it throws back, and they run from him two seconds.
func _terrible_roar(at: Vector2, rad: float) -> void:
	if not h.has("terribleroar") or h.monsters == null:
		return
	var dmg: float = h.avg_hit(0, _rake_k())
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or h.monsters.shut_in(m) or m.world.distance_to(at) > rad + m.r:
			continue
		_curse_one(m, dmg)
		if not m.boss:
			m.flee_t = float(_T()["roar"]["flee"])


## A rake of the demon's (or the Bound Demon's): every third, with Hellwave, throws a wave of hellfire on ahead.
func _rake_done(at: Vector2, way: Vector2, frac: float) -> void:
	rakes += 1
	var T: Dictionary = _T()["hellwave"]
	if not h.has("hellwave") or rakes % int(T["every"]) != 0:
		return
	var o: Vector2 = at + way * 0.6
	hellwaves.append({"x": o.x, "y": o.y, "dx": way.x, "dy": way.y, "left": float(T["far"]), "hit": [], "frac": frac * float(T["share"])})
	_say({"t": "hellwave", "x": o.x, "y": o.y, "dx": way.x, "dy": way.y, "far": T["far"], "speed": T["speed"]})
	h.sfx.play("fire", linear_to_db(0.8))


## DAMNED SOULS: one the demon killed rises as a burning soul, and goes for the nearest enemy left.
func _raise_soul(d) -> void:
	var T: Dictionary = _T()["souls"]
	var to = _nearest_to(d.world, float(T["reach"]), d)
	if to == null:
		return
	souls.append({"x": d.world.x, "y": d.world.y, "to": to, "t": 0.0, "dmg": h.avg_hit(0, _rake_k() * float(T["share"]))})
	_say({"t": "soul", "x": d.world.x, "y": d.world.y, "id": to.id})


## The nearest enemy to `at` within `reach` (to its edge), alive and not shut in; not `not_this`.
func _nearest_to(at: Vector2, reach: float, not_this = null):
	var best = null
	var bd := reach
	if h.monsters == null:
		return null
	for q in h.monsters.list:
		if not is_instance_valid(q) or q == not_this or q.dead or h.monsters.shut_in(q):
			continue
		var d: float = q.world.distance_to(at) - q.r
		if d < bd:
			bd = d
			best = q
	return best


## BOUND DEMON: with his pact full, a tap on him tears the demon out beside him, roaring; he stays a man.
func _tear_out() -> void:
	var T: Dictionary = _T()["bound"]
	var s: Vector2 = h.world + Vector2(h.face.y * 1.3 + h.face.x * 0.4, -h.face.x * 1.3 + h.face.y * 0.4)
	var p: Vector2 = s if _open(s) else h.world
	bound = {"x": p.x, "y": p.y, "fx": h.face.x, "fy": h.face.y, "act": "arrive", "t": 0.0, "target": null, "did": false, "walked": 0.0, "rake_cd": float(T["arrive"])}
	lust = 0
	rakes = 0
	_say({"t": "bound", "x": p.x, "y": p.y})
	var R: float = W["change"]["roar"]
	_say({"t": "roar", "x": p.x, "y": p.y, "r": R})
	h.kick(4.0)
	h.sfx.play("explode", linear_to_db(0.7))
	if h.monsters != null:
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(p) <= R + m.r:
				m.throw_from(p, 1.5, 0.25)
	_terrible_roar(p, R)


## The Bound Demon's pact run dry: it burns out where it stands (Last Rites: Damning goes off round it).
func _bound_burns_out() -> void:
	if bound.is_empty() or bound["act"] == "out":
		return
	bound["act"] = "out"
	bound["t"] = 0.0
	pact = 0.0
	var at := Vector2(bound["x"], bound["y"])
	_say({"t": "boundOut", "x": at.x, "y": at.y})
	h.sfx.play("deny", linear_to_db(0.8))
	if h.has("lastrites"):
		var r1: Dictionary = h.loadout.r(1)
		var k: float = float(Words.skill("damning")["dmg"]) / float(Words.skill(h.loadout.id(1))["dmg"])
		_damning_all(1, at, float(Words.skill("damning")["radius"]) * float(r1["size"]), float(r1["count_dmg"]) * k)
	lust = 0
	rakes = 0


## His tree's things that go on by themselves: Hellwave's waves, Damned Souls' souls, the Bound Demon.
func _step_tree(dt: float) -> void:
	var T := _T()
	# (HELLWAVE: each wave's front goes on, striking and setting burning what it comes to, each once, till a wall or its end)
	for k in range(hellwaves.size() - 1, -1, -1):
		var w: Dictionary = hellwaves[k]
		var stp: float = minf(float(w["left"]), float(T["hellwave"]["speed"]) * dt)
		w["x"] = float(w["x"]) + float(w["dx"]) * stp
		w["y"] = float(w["y"]) + float(w["dy"]) * stp
		w["left"] = float(w["left"]) - stp
		var at := Vector2(w["x"], w["y"])
		_by = "wave"
		if h.monsters != null:
			for m in h.monsters.list:
				if not is_instance_valid(m) or m.dead or (w["hit"] as Array).has(m) or h.monsters.shut_in(m):
					continue
				if m.world.distance_to(at) > float(T["hellwave"]["width"]) + m.r:
					continue
				(w["hit"] as Array).append(m)
				h.hit_monster(m, 0, float(w["frac"]), (w["hit"] as Array).size() > 3)
		_by = ""
		if float(w["left"]) <= 0.0 or not _open(at):
			hellwaves.remove_at(k)
	# (DAMNED SOULS: each flies to the one it goes for; if that one is gone, to the nearest left; in, it curses it and sets it burning)
	for k in range(souls.size() - 1, -1, -1):
		var s: Dictionary = souls[k]
		s["t"] = float(s["t"]) + dt
		var to = s["to"]
		var here := Vector2(s["x"], s["y"])
		if not is_instance_valid(to) or to.dead:
			to = _nearest_to(here, float(T["souls"]["reach"]))
			if to == null or float(s["t"]) > 4.0:
				souls.remove_at(k)
				continue
			s["to"] = to
		var d: float = to.world.distance_to(here)
		var stp: float = float(T["souls"]["speed"]) * dt
		if d <= stp + to.r * 0.5:
			souls.remove_at(k)
			_say({"t": "soulIn", "x": to.world.x, "y": to.world.y})
			h.sfx.play("fire", linear_to_db(0.5))
			_curse_one(to, float(s["dmg"]))
			_hell_on(to, float(s["dmg"]))
			continue
		var u: Vector2 = (to.world - here) / d
		s["x"] = here.x + u.x * stp
		s["y"] = here.y + u.y * stp
	_step_bound(dt)


## (THE BOUND DEMON, game.ts updateWarlockTree) It arrives; stands by him; goes for the nearest awake enemy near him that it can see,
## and rakes it (the quicker for his kills with Bloodlust); left far behind, or in another place, it is torn out beside him again.
func _step_bound(dt: float) -> void:
	var b := bound
	if b.is_empty():
		return
	var B: Dictionary = _T()["bound"]
	b["t"] = float(b["t"]) + dt
	var lk: float = minf(float(_T()["bloodlust"]["most"]), 1.0 + lust * float(_T()["bloodlust"]["each"])) if h.has("bloodlust") else 1.0
	b["rake_cd"] = float(b["rake_cd"]) - dt * lk
	if b["act"] == "out":
		if float(b["t"]) >= float(B["out"]):
			bound = {}
		return
	if b["act"] == "arrive":
		if float(b["t"]) >= float(B["arrive"]):
			b["act"] = "stand"
			b["t"] = 0.0
		return
	var at := Vector2(b["x"], b["y"])
	if at.distance_to(h.world) > 12.0 or not _open(at):
		var p := Vector2(h.world.x + h.face.y * 1.3, h.world.y - h.face.x * 1.3)
		if not _open(p):
			p = h.world
		b["x"] = p.x
		b["y"] = p.y
		b["act"] = "arrive"
		b["t"] = float(B["arrive"]) * 0.5
		_say({"t": "bound", "x": p.x, "y": p.y})
		return
	if b["act"] == "rake":
		if not b["did"] and float(b["t"]) >= float(B["hit"]) / lk:
			b["did"] = true
			var m = b["target"]
			if m != null and is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(B["reach"]) + m.r + 0.6:
				var frac: float = float(Words.skill("rake")["dmg"]) / float(Words.skill(h.loadout.id(0))["dmg"])
				_say({"t": "boundRake", "x": m.world.x, "y": m.world.y, "dx": b["fx"], "dy": b["fy"]})
				h.sfx.play("swing", linear_to_db(0.8))
				_by = "bound"
				h.hit_monster(m, 0, frac, false)
				_by = ""
				_rake_done(at, Vector2(b["fx"], b["fy"]), frac)
		if float(b["t"]) >= (float(B["hit"]) + 0.35) / lk:
			b["act"] = "stand"
			b["t"] = 0.0
		return
	# (what to go for: the nearest awake enemy near him that it can see)
	var best = null
	var bd := 1e9
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead or not m.seen or m.state == "sleep" or h.monsters.shut_in(m):
				continue
			if m.world.distance_to(h.world) > float(B["hunt"]):
				continue
			var d: float = m.world.distance_to(at) - m.r
			if d < bd and h.monsters.sees(at, m.world):
				bd = d
				best = m
	var face_to := func(p: Vector2) -> void:
		var dd: float = p.distance_to(Vector2(b["x"], b["y"]))
		if dd > 0.05:
			b["fx"] = (p.x - float(b["x"])) / dd
			b["fy"] = (p.y - float(b["y"])) / dd
	if best != null and bd <= float(B["reach"]) and float(b["rake_cd"]) <= 0.0:
		face_to.call(best.world)
		b["act"] = "rake"
		b["t"] = 0.0
		b["did"] = false
		b["target"] = best
		b["rake_cd"] = float(B["every"])
		return
	var goal: Vector2
	var stop: float
	if best != null and bd > float(B["reach"]) * 0.8:
		goal = best.world
		stop = float(B["reach"]) * 0.7 + best.r
	elif best != null:
		face_to.call(best.world)
		goal = at
		stop = 1.0
	else:
		goal = Vector2(h.world.x + h.face.y * float(B["near"]) - h.face.x * 0.4, h.world.y - h.face.x * float(B["near"]) - h.face.y * 0.4)
		stop = 0.5
	var dist: float = goal.distance_to(at)
	if dist > stop:
		var stp: float = minf(dist - stop, float(B["speed"]) * dt)
		var mv: Vector2 = (goal - at) / dist * stp
		var was := at
		if h.monsters.clear(at.x + mv.x, at.y, 0.45):
			b["x"] = at.x + mv.x
		if h.monsters.clear(float(b["x"]), at.y + mv.y, 0.45):
			b["y"] = at.y + mv.y
		var went: float = Vector2(b["x"], b["y"]).distance_to(was)
		b["walked"] = float(b["walked"]) + went
		if went > 1e-4:
			face_to.call(goal)
		if b["act"] != "walk":
			b["act"] = "walk"
			b["t"] = 0.0
	elif b["act"] != "stand":
		b["act"] = "stand"
		b["t"] = 0.0


# =====================================================================================================================
# THE DEMON MADE TERRIBLE (DEMON2): its dread, its toughness, the weight of its rakes

## DREAD: an enemy within DREAD.r of the demon takes this much more from him (hero.gd _talent_hit_mult); 1 otherwise.
func dread_k(m) -> float:
	if not demon2() or form != "demon" or m == null or m.world.distance_to(h.world) > float(D2["dread"]["r"]) + m.r:
		return 1.0
	return 1.0 + float(D2["dread"]["more"])


## DREAD: an enemy within DREAD.r of the demon moves and strikes this much as fast (monster.gd rage); 1 otherwise.
func dread_pace(m) -> float:
	if not demon2() or form != "demon" or m.boss or m.world.distance_to(h.world) > float(D2["dread"]["r"]) + m.r:
		return 1.0
	return float(D2["dread"]["pace"])


## What a blow on him comes to while he is the demon (hero.gd _talent_guard).
func demon_guard() -> float:
	return 1.0 - float(D2["dread"]["less"]) if demon2() and form == "demon" else 1.0


## A rake landed: the screen shakes and the world stops a breath (real time, whatever the game's own pace), and the claws' fire
## bursts where it tore; the rake's sound deeper.
var _stopped := false
func _rake_landed() -> void:
	h.kick(float(D2["rakeKick"]))
	if _stopped or Engine.time_scale < 1.0:
		return
	_stopped = true
	Engine.time_scale = 0.08
	h.get_tree().create_timer(float(D2["hitStop"]), true, false, true).timeout.connect(func() -> void:
		Engine.time_scale = 1.0
		_stopped = false)
