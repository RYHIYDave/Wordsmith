## The floor's monsters, as game.ts spawned them (tools/godot_export.ts saved them: floor1/monsters.json), and what they
## share: the flow field toward the hero (nav.ts flowField: out to 28 tiles, made again every 0.25 s), who sees whom (over
## open ground: floor or pit), their arrows in flight, and their pack waking with one of them (game.ts wakeUp).
## And of what the hero's words do, what spans more than one of them: LIGHTNING's arcs from the one struck to those near it
## and on from each, a moment apart (`arcs`; game.ts hitMonster, ARC_CHAIN), and the clock by which burning and poison bite
## them all, twice a second (`_dots`; game.ts updateDots), and the hero too (hero.gd dots).
## And of THE MONSTERS' OWN WORDS, what spans more than one of them: the skeleton champion's RALLYING CRY, heard only by the
## minions of his pack that carry his words (`hears_cry`, `rally`; game.ts hearsCry, rally); their shots carrying their words
## to the hero (`shoot`, `throw_spear`); and which of a blue pack has its name over it (`speaks`; render.ts drawBars).
extends Node

const Iso := preload("res://scripts/iso.gd")
const FoeHigh := preload("res://scripts/foe_meldshigh.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const Monster := preload("res://scripts/monster.gd")
const Sfx := preload("res://scripts/sfx.gd")
const Arrow := preload("res://scripts/arrow.gd")
const MM := preload("res://scripts/monster_moves.gd")
const Perils := preload("res://scripts/perils.gd")
const Words := preload("res://scripts/words.gd")

const FLOW_REACH := 28
## (nav.ts: what a step to a side and to a corner cost; height.ts: the side steps a body may take from a tile, as bits)
const STEP_ORTH := 10
const STEP_DIAG := 14
const STEP_E := 1
const STEP_W := 2
const STEP_S := 4
const STEP_N := 8
const FAR := 1 << 30
const FLOW_EVERY := 0.25
const ARROW_R := 0.2
const HERO_R := 0.3

var map: FloorMap
var sfx: Sfx
var hero  # hero.gd
var stands: Node2D
var perils: Perils
## (what the fight shows of a blow and of a word: fx.gd; the rules tell it with fx.event)
var fx
var loot  # loot.gd
## THE DECOYS (game.ts decoys, decoyFor; state.ts Decoy): {x, y, t, r, size, golem}: for `t` seconds every monster within `r` of one
## goes after it in place of the hero (monster.gd _drawn_to_decoy). The Tinkerer's Lightning Rod (her Golem, heroes/tinkerer.gd)
## puts them; whoever puts one steps it.
var decoys: Array = []


## The decoy monster `m` goes after (the nearest of those whose reach it is within), or null: it goes after the hero.
func decoy_for(m):
	var best = null
	var bd := INF
	for d in decoys:
		var dist: float = m.world.distance_to(Vector2(d["x"], d["y"]))
		if float(d["t"]) > 0.0 and dist <= float(d["r"]) + m.r and dist < bd:
			best = d
			bd = dist
	return best
## (the game itself, main.gd: what of a floor's own a kind's rules reach for, the Masque's clock)
var main = null
var list: Array[Monster] = []
## (shot mode: how many times each move was made)
var used := {}
var _defs := {}
var _info := {}
var _figures_dir := ""
var _flow := PackedInt32Array()
var _flow_in := 0.0
var _arrows: Array = []  # {pos, dir, speed, left, dmg, node}
var _figures := {}
## (render.ts drawBars, `speaks`: a blue pack's name is written once, over the first of it still standing in sight: by pack)
var speaks := {}
## (defs.ts RALLY: how long the champion's cry makes his minions' words whole, and how far from him it is heard)
const RALLY := {"dur": 5.0, "reach": 8.0}
## (defs.ts MSG.foe: the colour of a line that names something dangerous)
const MSG_FOE := Color("#ff8a3a")
## (the floor's boss has fallen, and where: the ways on open clear of him, ways.gd)
var boss_fell := false
var boss_at := Vector2.ZERO
## (FLOOR 14, THE HOUSE OF QUIET: its ward beds, each where one lying in it lies and the way it faces, and its key (`bt`): where
## the Physician's rounds lay new patients, game/act1_rules/patient.ts bedPlace, freeBeds; monsters.json `beds`)
var beds: Array = []
## (FLOOR 15, THE GREAT LIBRARY: the Censor's ground (`ground`: its tiles) and the book of stolen words (`book`: where it lies, or
## null): monsters.json `censor`, game/act1_rules/censor.ts censorGround, STOLEN_BOOK)
var censor: Dictionary = {}
## (ACT 2, THE BELLS, floors 11 to 15: the plan, its numbers, its tough ones and what the Hush raises: act2/bells.gd)
var bells: Dictionary = {}
## A THING OF A QUEST TAKEN UP WHERE IT LAY (game.ts furnaceGearTaken, templeKeyTaken): what ("gear": the forge crank's, the
## Stoker's; "key": one of the temple door's, a keybearer's) and where. The monster's own script lays it down as it falls and
## says so when the hero takes it; the floor's quest scripts listen.
signal quest_item(what: String, at: Vector2)


## FLOOR 9'S TWO SIDE BOSSES' PICTURES TAKEN IN AS THEIR LAIRS ARE ENTERED, not as the floor begins (eight big sheets each: on a
## phone, held only once he goes their way): the figure, and the area of the floor's land it keeps (the Troll Chieftain's camp,
## the land's `lair`; the Mist Wolf's glade, its `side`). Asked for off the game's thread once he is within FETCH_INTO of the
## area's edge (blobDist under it) or FETCH_NEAR tiles of the boss, so that they are in hand by the time he sees it.
const FETCH_AT := {"warchief": "lair", "mistwolf": "side"}
const FETCH_INTO := 1.6
const FETCH_NEAR := 18.0


## EVERY FLOOR'S OWN MONSTERS' PICTURES HELD ONLY NEAR HIM (baked_figure.gd `near`): a figure's sheets asked for off the game's thread
## once one of its monsters is within NEAR_FETCH tiles of him (beyond what he can see: a monster is drawn from its pictures within
## monster.gd NEAR_SHOW), and let go of once none has been within NEAR_DROP for NEAR_KEEP seconds. Looked at NEAR_EVERY seconds.
const NEAR_FETCH := 40.0
const NEAR_DROP := 52.0
const NEAR_KEEP := 10.0
const NEAR_EVERY := 0.25
var _near_in := 0.0
## (the time gone since it was last looked at: the slower the frames, the more each look counts)
var _near_gone := 0.0
## (figure name -> how long none of its has been within NEAR_DROP)
var _far_for := {}


func _hold_near(dt: float) -> void:
	_near_in -= dt
	_near_gone += dt
	if _near_in > 0.0 or hero == null:
		return
	_near_in = NEAR_EVERY
	var gone := _near_gone
	_near_gone = 0.0
	var nearest := {}
	for m in list:
		if is_instance_valid(m) and m.art != null and (m.art.near or m.art.lazy or m.art.deferred):
			var d: float = m.world.distance_to(hero.world)
			nearest[m.art] = minf(float(nearest.get(m.art, INF)), d)
	for name in _figures:
		var art = _figures[name]
		if art == null or not (art.near or art.deferred or art.lazy):
			continue
		art.collect()
		var d: float = float(nearest.get(art, INF))
		# (floor 9's side bosses are fetched as their lairs are entered, _fetch_lairs; let go of as any other once he is far)
		if d <= NEAR_FETCH and not art.deferred:
			art.fetch()
		if d <= NEAR_DROP:
			_far_for[name] = 0.0
			continue
		_far_for[name] = float(_far_for.get(name, 0.0)) + gone
		if float(_far_for[name]) >= NEAR_KEEP and (art.fetched or art.held() > 0):
			art.let_go()


func _fetch_lairs() -> void:
	if hero == null or map == null:
		return
	for m in list:
		if not is_instance_valid(m) or m.art == null or not m.art.deferred or m.art.fetched:
			continue
		var area = map.area(str(FETCH_AT.get(m.kind, ""))) if FETCH_AT.has(m.kind) else null
		var into: bool = area != null and FloorMap.blob_dist(area["blob"], hero.world) < FETCH_INTO
		if into or m.world.distance_to(hero.world) <= FETCH_NEAR:
			m.art.fetch()


func load_floor(path: String, figures_dir: String, given := {}) -> void:
	var data: Dictionary = given if not given.is_empty() else JSON.parse_string(FileAccess.get_file_as_string(path))
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(figures_dir + "/lists.json"))
	_defs = data["defs"]
	_info = info
	beds = data.get("beds", [])
	censor = data.get("censor", {})
	bells = data.get("bells", {})
	_figures_dir = figures_dir
	for m in data["monsters"]:
		var figure: String = m["figure"]
		if not _figures.has(figure):
			_figures[figure] = BakedFigure.new(figures_dir, figure, info, FETCH_AT.has(figure), not FETCH_AT.has(figure))
		# (the first plain one of each kind, wordless, of no pack's rank: what a boss calls up of it is made as it is: call_up)
		if not _plain.has(m["kind"]) and not m["boss"] and not m["elite"] and not m["champion"] and (m["words"] as Array).is_empty() and m.get("rarity") == null:
			# (a copy without a royal's crest or a carried rune: one a royal touched made every split, risen and called-up one of its kind
			# a royal's too, each with its card: the bug hunt's second round, 25 Nov 2026)
			var t: Dictionary = m.duplicate(true)
			t.erase("royal")
			t["carries"] = []
			_plain[m["kind"]] = t
		var mon := Monster.new()
		mon.mgr = self
		mon.setup(m, data["defs"][m["kind"]], _figures[figure])
		stands.add_child(mon)
		list.append(mon)
	_flow.resize(map.w * map.h)


func _process(dt: float) -> void:
	_run_later(dt)
	_fetch_lairs()
	_hold_near(dt)
	_flow_in -= dt
	if _flow_in <= 0.0:
		_flow_in = FLOW_EVERY
		_make_flow()
	var standing: Array[Monster] = []
	# (BINDING: what is held stands where it stood, whatever its own steps, a charge or a leap would have done; it strikes still)
	var pins: Array = []
	for m in list:
		if is_instance_valid(m) and not m.dead and m.bind_t > 0.0:
			pins.append([m, m.world])
	var dark = perils.look if perils != null else null
	for m in list:
		if is_instance_valid(m):
			m.step(dt, hero)
			standing.append(m)
			# (what its picture gives off lights the floor round it: render.ts light, monsterLit)
			m.cut_lights(dark)
	list = standing
	for q in pins:
		if is_instance_valid(q[0]):
			q[0].world = q[1]
	speaks.clear()
	for m in list:
		if not m.dead and m.seen and m.rarity == "blue" and not speaks.has(m.pack_id):
			speaks[m.pack_id] = m
	_part()
	_fly(dt)
	_dots(dt)


# --- what the hero's words do, across them ---

## (game.ts after, runLater) What is to be done a moment from now: {t: seconds left, fn}.
var _later: Array = []
## (game.ts dotT: seconds to the next bite of what burns and poisons)
var _dot_t := 0.0


## Do `fn` in `t` seconds (game.ts after).
func after(t: float, fn: Callable) -> void:
	_later.append({"t": t, "fn": fn})


func _run_later(dt: float) -> void:
	if _later.is_empty():
		return
	var due: Array = []
	for l in _later:
		l["t"] -= dt
		if l["t"] <= 0.0:
			due.append(l["fn"])
	if due.is_empty():
		return
	_later = _later.filter(func(l): return l["t"] > 0.0)
	for fn in due:
		fn.call()


## What the hero's words had begun among them is dropped (the hero fallen and come back; a check beginning afresh).
func forget() -> void:
	_later.clear()
	for m in list:
		if is_instance_valid(m):
			m.clear_afflictions()


## LIGHTNING in front (game.ts hitMonster, `r.arcs`): the hit on `m` jumps to the nearest `n` others within 3.5 tiles of it,
## each for `dmg` (plain lightning harm: no word of the hit goes with it). ARCS KEEP JUMPING (ARC_CHAIN): each arc jumps on
## from the one it struck to the nearest within 3.5 tiles that this hit has not struck, enemy to enemy, as many jumps in all
## as the hit had arcs, each 0.07 s after the last, so that the eye can follow it. How many it jumped to at once.
## (`skill`: the hero's move whose hit it is, which each it strikes is struck by last: monster.gd last_skill)
## (WORDMELDING: `meld`, the melded word in front of the move: each arc told as its, and what it carries to those it first
## strikes, Wildfire's burning, Contagion's poison, Hailstorm's chill: melds.gd arc)
func arcs(m: Monster, n: int, dmg: float, skill := -1, meld := "") -> int:
	var chain: Dictionary = Words.data()["arcChain"]
	# (THE MAGE'S TREE: Forking, lightning arcs to two more enemies)
	if hero != null and is_instance_valid(hero) and hero.has("forking"):
		n += int(preload("res://scripts/talents.gd").D["tune"]["forking"])
	var from := m.world
	var near: Array = []
	for o in list:
		if is_instance_valid(o) and not o.dead and o.state != "rise" and o.chained != 1 and o != m and o.world.distance_to(from) <= 3.5:
			near.append(o)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(from) < b.world.distance_to(from))
	# (THE 52 DESIGNED MELDS: Seeker's lightning to the weakest, and to the one it marked first: melds52_rules.gd)
	if hero != null and is_instance_valid(hero):
		near = hero.m52.arc_pick(near, skill)
	if near.size() > n:
		near.resize(n)
	for o in near:
		_tell(_melded({"t": "arc", "x0": from.x, "y0": from.y, "x1": o.world.x, "y1": o.world.y}, meld))
		o.shock_t = float(preload("res://scripts/talents.gd").D["tune"]["shockSecs"])
		o.damage(dmg, "lightning", false, false, [], false, false, skill)
		# (Conduit: each one an arc strikes heals him)
		if hero != null and is_instance_valid(hero):
			hero.m52.arc_struck(o, skill, from)
		if meld != "" and hero != null and is_instance_valid(hero):
			hero.melds.arc(o, m, skill, dmg, near)
	if near.is_empty():
		return 0
	sfx.play("zap", linear_to_db(0.6))
	if chain["on"]:
		var struck := {m: true}
		for o in near:
			struck[o] = true
		for o in near:
			_jump(o, near.size() - 1, 1, struck, dmg, float(chain["reach"]), float(chain["gap"]), skill, meld)
	return near.size()


## (a telling marked with the melded word it is of)
static func _melded(e: Dictionary, meld: String) -> Dictionary:
	if meld != "":
		e["meld"] = meld
	return e


## WORDMELDING: is he hidden, standing in Scald's steam (game.ts updateMonsters `hidden`)? Nothing sees him to attack.
func hero_hidden() -> bool:
	if hero == null or not is_instance_valid(hero) or hero.wakes == null or not is_instance_valid(hero.wakes):
		return false
	for z in hero.wakes.list:
		if z["kind"] == "steam" and hero.world.distance_to(Vector2(z["x"], z["y"])) <= float(z["r"]):
			return true
	return false


## An arc jumps on from `from`, `left` jumps more, in `gap` x `k` seconds: to the nearest within `reach` that the hit has not
## struck (`struck`, shared by all the hit's arcs); from there on again, a gap later.
func _jump(from: Monster, left: int, k: int, struck: Dictionary, dmg: float, reach: float, gap: float, skill := -1, meld := "") -> void:
	if left <= 0:
		return
	var on := func() -> void:
		if not is_instance_valid(from):
			return
		var next: Monster = null
		var best := INF
		for o in list:
			if not is_instance_valid(o) or o.dead or o.state == "rise" or o.chained == 1 or struck.has(o):
				continue
			var d: float = o.world.distance_to(from.world)
			if d <= reach and d < best:
				best = d
				next = o
		if next == null:
			return
		struck[next] = true
		_tell(_melded({"t": "arc", "x0": from.world.x, "y0": from.world.y, "x1": next.world.x, "y1": next.world.y}, meld))
		next.damage(dmg, "lightning", false, false, [], false, false, skill)
		_jump(next, left - 1, 1, struck, dmg, reach, gap, skill, meld)
	after(gap * k, on)


## BURNING AND POISON BITE, twice a second (game.ts updateDots): what burns takes half its burning a second, what is poisoned
## half its poison a second; neither flashes it.
func _dots(dt: float) -> void:
	_dot_t -= dt
	if _dot_t > 0.0:
		return
	_dot_t += 0.5
	for m in list:
		if not is_instance_valid(m) or m.dead:
			continue
		if m.burn_t > 0.0:
			m.damage(maxf(1.0, roundf(m.burn_dps * 0.5)), "fire", false, false, [], false, true)
		if not m.dead and m.poison_t > 0.0 and m.poison_dps > 0.0:
			var tick := maxf(1.0, roundf(m.poison_dps * 0.5))
			m.damage(tick, "phys", false, false, [], true)
			# (WORDMELDING, SIPHON: the poison of an attack carrying it heals him as it eats: melds.gd)
			if hero != null and is_instance_valid(hero):
				hero.melds.siphon(m, tick)
		# (WORDMELDING, FROSTBITE in front: a chilled enemy loses life, a frozen one twice as fast)
		if not m.dead and m.bite_dps > 0.0 and (m.chill_t > 0.0 or m.frozen_t > 0.0):
			m.damage(maxf(1.0, roundf(m.bite_dps * 0.5 * (2.0 if m.frozen_t > 0.0 else 1.0))), "frost", false, false, [], false, true)
		# (THE LAST WORDS: Bleeding's, more while it walks)
		if not m.dead and m.bleed_t > 0.0 and m.bleed_dps > 0.0:
			var moved: bool = m.bleed_at != Vector2.INF and m.world.distance_to(m.bleed_at) > 0.15
			m.bleed_at = m.world
			# (THE HIGH CITY'S RUNES MELDED: each meld's own wound: mh_bleed.gd)
			var bite: float = m.bleed_dps * 0.5 * ((m.bleed_move if m.bleed_move > 0.0 else 1.0) if moved else 1.0)
			if hero != null and is_instance_valid(hero):
				bite = hero.last.high.bleed.tick(m, bite, moved)
			if bite > 0.0:
				m.damage(maxf(1.0, roundf(bite)), "phys", false, false, [], false, true, m.last_skill)
		# (THE WARLOCK: his hellfire, and the curse's smoulder)
		if not m.dead and m.hell_t > 0.0 and m.hell_dps > 0.0:
			m.damage(maxf(1.0, roundf(m.hell_dps * 0.5)), "fire", false, false, [], false, true, m.last_skill)
		if not m.dead and m.curse_t > 0.0 and m.curse_dps > 0.0:
			m.damage(maxf(1.0, roundf(m.curse_dps * 0.5)), "phys", false, false, [], false, true, m.last_skill)
	# (and what burns and poisons the hero, on the same clock)
	if hero != null and is_instance_valid(hero):
		hero.dots()


## (THE WARLOCK, game.ts spreadBurns) A cursed one has died: every burn on it leaps to each enemy within 3.5 tiles, and burns there as
## on it (a stronger one taking the place of a weaker; the longer time kept).
func spread_burns(d) -> void:
	var to: Array = []
	for m in list:
		if not is_instance_valid(m) or m == d or m.dead or shut_in(m) or m.world.distance_to(d.world) > 3.5 + m.r:
			continue
		to.append({"id": m.id, "x": m.world.x, "y": m.world.y})
		for pair in [["hell_t", "hell_dps"], ["curse_t", "curse_dps"], ["burn_t", "burn_dps"], ["poison_t", "poison_dps"], ["bleed_t", "bleed_dps"]]:
			var t: float = d.get(pair[0])
			var dps: float = d.get(pair[1])
			if t <= 0.0 or dps <= 0.0:
				continue
			var have: float = m.get(pair[0])
			var have_dps: float = m.get(pair[1])
			# (its burn passed on as its own fire, without the melds' heat on it, and its poison with its doses, so that neither grows from
			# one to the next without end: a line of them passed Brand's double on and doubled it again, 200 a second to 6,400 in six;
			# a poison passed on took eight more doses on top. The bug hunt's third round, 25 Nov 2026: monster.gd burn_base)
			if pair[0] == "burn_t":
				m.burn_t = maxf(t, have)
				if have <= 0.0:
					m._burn_out()
					m.burn_dps = d.burn_base()
				elif d.burn_base() > m.burn_base():
					m.burn_dps = d.burn_base() * m.burn_k
				continue
			m.set(pair[0], maxf(t, have))
			if have <= 0.0 or dps > have_dps:
				m.set(pair[1], dps)
				if pair[0] == "poison_t":
					m.poison_n = maxi(int(m.poison_n), int(d.poison_n))
		if m.last_skill < 0:
			m.last_skill = d.last_skill
	if not to.is_empty():
		_tell({"t": "spread", "x": d.world.x, "y": d.world.y, "to": to})
		sfx.play("fire", linear_to_db(0.7))


func _tell(e: Dictionary) -> void:
	if fx != null:
		fx.event(e)


## (the count of blows by which a hurt voice is heard now and then: game.ts hurtTick)
var hurt_tick := 0
## (ENDLESS MODE: on an endless level what its monsters are made stronger by, against the floor's own, main.gd endless_strength
## {life, boss, dmg, xp, words}; {} anywhere else: monster.gd setup)
var strength := {}
var _voiced := {}


## A voice heard no oftener than every `gap` seconds (game.ts enemyRec).
## THE BOSSES' CALLED LINES IN THEIR OWN VOICES (engine/audio.ts speakBoss, BOSS_VOICES: a mumble in a voice of his own, made in code
## by the game; here the game's own voices' takes of every line, tools/godot_voices.mjs, assets/voices): what each boss's big moves
## call out (BOSS_CALL_LINES), the takes of each line, how long a line stays up and how often (BOSS_CALLS).
const VOICES_DIR := "res://assets/voices/"
static var _voices = null


static func voices() -> Dictionary:
	if _voices == null:
		_voices = JSON.parse_string(FileAccess.get_file_as_string(VOICES_DIR + "voices.json")) if FileAccess.file_exists(VOICES_DIR + "voices.json") else {"calls": {}, "voices": {}, "tune": {"sayFor": 1.8, "gap": 5.0, "basicGap": 20.0}}
		# (THE WARPED WORDSMITH SPEAKS, in a real voice, his pick: his lines' takes, tools/godot_wsboss_voice.sh)
		if FileAccess.file_exists(VOICES_DIR + "wsboss/voices.json"):
			_voices["voices"]["wsboss"] = JSON.parse_string(FileAccess.get_file_as_string(VOICES_DIR + "wsboss/voices.json"))
	return _voices


## (the game's main.ts: a bossSay with his voice, speakBoss(kind, text)) A line said in a boss's own voice: one of its two takes. How
## long it is heard, in seconds (0: he has no voice for it).
func speak(kind: String, text: String) -> float:
	var takes: Array = voices()["voices"].get(kind, {}).get(text, [])
	if takes.is_empty():
		return 0.0
	var path: String = VOICES_DIR + str(takes.pick_random())
	sfx.play_path(path)
	said_aloud.append([kind, text])
	var st = load(path) if ResourceLoader.exists(path) else null
	return float(st.get_length()) if st != null else 0.0


## (for the checks: each line said aloud, [kind, text])
var said_aloud: Array = []


func voice(name: String, gap: float, db: float, keep := 1) -> void:
	var now := Time.get_ticks_msec() / 1000.0
	if now - float(_voiced.get(name, -1000.0)) < gap:
		return
	_voiced[name] = now
	if keep > 1 and not kept_cry(name, keep):
		return
	sfx.play(name, db)


## THE ENEMIES' GRUNT AND DEATH CRY A THIRD AS OFTEN, BY A COUNT (game.ts keptCry, sound_families.ts ENEMY_KEEP: the sound chat's
## fourteenth batch, his picks “Enemies' grunts” and “Rarer, and more takes (Recommended)”): where a family's grunt would be heard
## it is on that family's 1st, 4th, 7th … time; its 1st, 4th, 7th … death cries out, its others die with the plain sound of one
## with no voice. A count, not the dice. Champions always cry; the bosses and the cry on seeing him are as they were.
const ENEMY_KEEP := {"hurt": 3, "death": 3}
var cry_count := {}
func kept_cry(name: String, keep: int) -> bool:
	var n: int = cry_count.get(name, 0)
	cry_count[name] = n + 1
	return n % keep == 0


## THE SKELETON CHAMPION'S CRY (game.ts hearsCry): whether one of his minions would hear it: one of his pack that carries his
## words at half, within RALLY.reach of him, and not rallied but now (more than a second of it left).
func hears_cry(m: Monster) -> bool:
	for o in list:
		if is_instance_valid(o) and not o.dead and o != m and o.pack_id == m.pack_id and o.rarity == "minion" and not o.half.is_empty() and o.rally_t <= 1.0 and o.world.distance_to(m.world) <= RALLY["reach"]:
			return true
	return false


## HE CRIES OUT (game.ts rally): his minions within RALLY.reach of him have his words whole for RALLY.dur seconds; the roar,
## the screen kicked, and the line that says so.
func rally(m: Monster) -> void:
	for o in list:
		if not is_instance_valid(o) or o.dead or o == m or o.pack_id != m.pack_id or o.rarity != "minion":
			continue
		if o.world.distance_to(m.world) <= RALLY["reach"]:
			o.rally_t = RALLY["dur"]
	used["rallied"] = used.get("rallied", 0) + 1
	sfx.play("boss_roar", linear_to_db(0.5))
	if hero != null:
		hero.kick(1.0)
	if loot != null:
		loot.say("%s rallies his pack" % m.title, MSG_FOE)


## Pack-mates within 14 tiles wake with it; a boss roars, the others call out.
func wake(m: Monster) -> void:
	# (THE CHAINED RARE: nothing wakes him while his chains hold: chained_rare.gd)
	if m.chained == 1:
		return
	var voice: String = Monster.VOICE.get(m.kind, "")
	if m.boss and Monster.BOSS_VOICE.has(m.kind):
		# (a boss who roars: his own roar as the fight begins: game.ts wakeUp)
		sfx.play(str(Monster.BOSS_VOICE[m.kind]) + "_roar")
	elif voice != "":
		sfx.play(voice + "_aggro", -4.0)
	elif m.boss:
		sfx.play("boss_roar")
	m.wake_up()
	if m.pack_id < 0:
		return
	for o in list:
		if is_instance_valid(o) and o != m and o.pack_id == m.pack_id and o.world.distance_to(m.world) <= Monster.WAKE_PACK:
			o.wake_up()


## The monsters a blow at (from, facing `way`) reaches: those within `reach` + their radius in front of him (dot at
## least 0.35), or within 0.9 + their radius whichever way; the one hit is the best of them, nearest and most in front
## (game.ts strike: score = dist - dot * 0.5).
func strike_target(from: Vector2, way: Vector2, reach: float, min_dot := 0.35) -> Monster:
	var best: Monster = null
	var best_score := INF
	for m in list:
		if not is_instance_valid(m) or m.dead or m.state == "rise" or shut_in(m):
			continue
		var to := m.world - from
		var dist := to.length()
		var dot := way.dot(to / dist) if dist > 0.001 else 1.0
		if not ((dist <= reach + m.r and dot >= min_dot) or dist <= 0.9 + m.r):
			continue
		var score := dist - dot * 0.5
		if score < best_score:
			best_score = score
			best = m
	return best


## A plain blow all round a point: every monster standing within `rad` + its own radius is struck, each by its own roll
## (`roll` gives one hit). How many were struck. (The hero's own moves do not strike through this any more: each of their
## hits carries its words, hero.gd _blast and hit_monster.)
func blast(at: Vector2, rad: float, roll: Callable, spare: Object = null) -> int:
	var n := 0
	for m in list:
		if not is_instance_valid(m) or m.dead or m.state == "rise" or m == spare or shut_in(m):
			continue
		if m.world.distance_to(at) <= rad + m.r:
			m.hurt(roll.call())
			n += 1
	return n


## The nearest monster still standing within `reach` tiles (to aim a blow made from the keys).
func nearest(from: Vector2, reach: float) -> Monster:
	var best: Monster = null
	var best_d := reach
	for m in list:
		if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.state != "rise" and m.world.distance_to(from) <= best_d and not shut_in(m):
			best_d = m.world.distance_to(from)
			best = m
	return best


func clear(x: float, y: float, r: float, fly := false) -> bool:
	# (game.ts free: a monster that walks goes by the walk grid, the rules of height and the slanting walls, and a shut door
	# holds it; one that flies, a bat, by the open grid alone: floor_map.gd free)
	if not fly:
		return map.fits(x, y, r, false, true)
	for ty in range(floori(y - r), floori(y + r) + 1):
		for tx in range(floori(x - r), floori(x + r) + 1):
			if not map.open_at(tx, ty):
				return false
	return true


## May a body step from tile (tx, ty) to the one (dx, dy) from it by the rules of height (height.ts: never over a ledge, a
## flight of stairs only at its ends; a corner only if both ways round are open)? Always, on a floor of one height.
func may_step(tx: int, ty: int, dx: int, dy: int) -> bool:
	return map.step.is_empty() or map.may_overlap(tx, ty, tx + dx, ty + dy)


## Whether `a` sees `b`: every tile on the line between them is open ground (not a shut door: game/doors.ts).
func sees(a: Vector2, b: Vector2) -> bool:
	var d := b - a
	var n := int(ceil(d.length() * 4.0))
	for i in range(1, n):
		var p := a + d * (float(i) / n)
		if not map.open_at(floori(p.x), floori(p.y)):
			return false
	return true


## (game.ts shutIn) What is in a room whose door is shut is out of the hero's reach altogether, awake or not, for as long as he
## is outside it: no blow, blast or shot of his reaches it, and it is no fight.
func shut_in(m) -> bool:
	# (THE CHAINED RARE, held by his chains: out of his reach as what is shut in is, until he breaks them: chained_rare.gd)
	if m is Object and m.get("chained") == 1:
		return true
	if map == null or map.doors.is_empty() or hero == null:
		return false
	for d in map.doors:
		# (a door that is shut; THE MIX: a lever's gate that is down; a sealed door. Not the boss's gate, nor a locking room's:
		# when those are down the hero is inside)
		if not (d["kind"] in ["door", "gate", "worddoor"]) or int(d["want"]) != 0:
			continue
		var r: Dictionary = map.room(int(d["room"]))
		if FloorMap.in_room(r, m.world) and not FloorMap.in_room(r, hero.world):
			return true
	return false


## The way down a flow field from where a body stands (nav.ts flowDir): toward the middle of the neighbouring tile that gives
## the shortest walk left (what is left from it and the step to it: 10 to a side, 14 to a corner), among those nearer than
## this one; a corner only where it is not cut. Nothing where no neighbour is nearer, or the tile was not reached.
func flow_dir(at: Vector2, field = null) -> Vector2:
	var f: PackedInt32Array = _flow if field == null else field
	var w := map.w
	var h := map.h
	var tx := floori(at.x)
	var ty := floori(at.y)
	if tx < 0 or ty < 0 or tx >= w or ty >= h:
		return Vector2.ZERO
	var i := ty * w + tx
	var here := f[i]
	if here <= 0:
		# (already on the tile, or one the field did not reach: steered to a neighbour it did, if there is one)
		if here == 0:
			return Vector2.ZERO
		here = FAR
	var steps := not map.step.is_empty()
	var st: int = map.step[i] if steps else 15
	var left := tx > 0 and _pass(i - 1) and (st & STEP_W) != 0
	var right := tx < w - 1 and _pass(i + 1) and (st & STEP_E) != 0
	var up := ty > 0 and _pass(i - w) and (st & STEP_N) != 0
	var down := ty < h - 1 and _pass(i + w) and (st & STEP_S) != 0
	var best := FAR + STEP_DIAG
	var b := Vector2i.ZERO
	# (side neighbours; the tile he stands on may not be walkable, so a neighbour at 0 always counts)
	for q in [[tx > 0 and (left or (f[i - 1] == 0 and (st & STEP_W) != 0)), i - 1, -1, 0], [tx < w - 1 and (right or (f[i + 1] == 0 and (st & STEP_E) != 0)), i + 1, 1, 0],
			[ty > 0 and (up or (f[i - w] == 0 and (st & STEP_N) != 0)), i - w, 0, -1], [ty < h - 1 and (down or (f[i + w] == 0 and (st & STEP_S) != 0)), i + w, 0, 1]]:
		if not q[0]:
			continue
		var d: int = f[q[1]]
		if d >= 0 and d < here and d + STEP_ORTH < best:
			best = d + STEP_ORTH
			b = Vector2i(q[2], q[3])
	# (corners, only where the corner is not cut; where there are ledges, only if it could be made either way round)
	for q in [[left and up and (not steps or ((map.step[i - 1] & STEP_N) != 0 and (map.step[i - w] & STEP_W) != 0)), i - w - 1, -1, -1],
			[right and up and (not steps or ((map.step[i + 1] & STEP_N) != 0 and (map.step[i - w] & STEP_E) != 0)), i - w + 1, 1, -1],
			[left and down and (not steps or ((map.step[i - 1] & STEP_S) != 0 and (map.step[i + w] & STEP_W) != 0)), i + w - 1, -1, 1],
			[right and down and (not steps or ((map.step[i + 1] & STEP_S) != 0 and (map.step[i + w] & STEP_E) != 0)), i + w + 1, 1, 1]]:
		if not q[0]:
			continue
		var d: int = f[q[1]]
		if d >= 0 and d < here and d + STEP_DIAG < best:
			best = d + STEP_DIAG
			b = Vector2i(q[2], q[3])
	if b == Vector2i.ZERO:
		return Vector2.ZERO
	var to := Vector2(tx + b.x + 0.5, ty + b.y + 0.5) - at
	return to.normalized() if to.length() > 1e-6 else Vector2.ZERO


## Ground the flow goes over: the walk grid, less a shut door.
func _pass(i: int) -> bool:
	return map.walk[i] != 0 and map.shut[i] == 0


## Something loosed at the hero from monster `from`, the way `dir` on the floor: an arrow (0.2 round), one of the Warden's
## bolts, or the marksman's great arrow (`pierce`: it goes through whoever it meets, and on to its end). It carries its
## monster's words as they were as it was loosed (game.ts shootAt: `element`, `words`, `half`).
func shoot(from: Monster, dir: Vector2, speed: float, reach: float, dmg: float, look := "arrow", r := ARROW_R, pierce := false, el := "") -> void:
	var node := Arrow.new()
	node.dir = dir
	node.look = look
	# (`el`: an element of its own in place of its monster's: Shatter's shards are Frost, game.ts shootAt)
	var by: Dictionary = from.blow()
	if el != "":
		by = by.duplicate()
		by["el"] = el
	node.el = str(by.get("el", "phys"))
	node.r = r
	stands.add_child(node)
	# (THE LAST WORDS: PIERCING, on it, its shots fly on through walls, to the map's edge)
	_arrows.append({"pos": from.world + dir * (from.r + 0.1), "dir": dir, "speed": speed, "left": reach, "dmg": dmg, "node": node, "r": r, "pierce": pierce, "hit": false, "by": by, "walls": from.words.has("piercing"), "src": from})
	# (THE HIGH CITY'S RUNES MELDED: each meld's own shots: foe_meldshigh.gd)
	FoeHigh.shot(self, from, _arrows.back())


## (THE HIGH CITY'S RUNES MELDED: Pitchfork's second shot beside its first; Barrage's and Trident's turned a little. `_copying`
## while one is loosed, so it makes no copies of its own)
var _copying := false
func _shot_beside(m, a: Dictionary, side: Vector2) -> void:
	if not is_instance_valid(m) or m.dead:
		return
	# (a copy is no new shot of its own: it does not make copies again)
	_copying = true
	shoot(m, a["dir"], float(a["speed"]), float(a["left"]), float(a["dmg"]), "arrow", float(a["r"]))
	_copying = false
	var b: Dictionary = _arrows.back()
	b["pos"] = a["pos"] + side
	b["copy"] = true
	b["walls"] = a.get("walls", false)


func _shot_turned(m, a: Dictionary, t: float) -> void:
	if m == null or not is_instance_valid(m) or m.dead:
		return
	_copying = true
	shoot(m, (a["dir"] as Vector2).rotated(t), float(a["speed"]), maxf(1.0, float(a["left"])), float(a["dmg"]), "arrow", float(a["r"]))
	_copying = false
	var b: Dictionary = _arrows.back()
	b["pos"] = a["pos"]
	b["copy"] = true
	b["walls"] = a.get("walls", false)


## THE BONEWARD'S SPEAR (game.ts throwSpear): from its hand `at`, the way `dir`, as far as `reach` (where the hero stood); where
## it comes down (on the hero, at a wall, or where it was aimed) it lies until its Boneward picks it up (laySpear).
func throw_spear(from: Monster, at: Vector2, dir: Vector2, reach: float, dmg: float) -> void:
	var node := Arrow.new()
	node.dir = dir
	node.look = "spear"
	stands.add_child(node)
	_arrows.append({"pos": at, "dir": dir, "speed": MM.SPEAR["speed"], "left": reach, "dmg": dmg, "node": node, "r": MM.SPEAR["r"], "pierce": false, "hit": false, "spear": from, "way": reach, "by": from.blow()})


## A spear has come down at `p`: it lies there, on the nearest floor one could walk to, till its Boneward picks it up.
func _lay_spear(a: Dictionary) -> void:
	var owner = a["spear"]
	if not is_instance_valid(owner) or owner.dead:
		return
	var p: Vector2 = a["pos"]
	var at := p
	if not map.walkable(floori(p.x), floori(p.y)):
		var best := INF
		for rr in [1, 2]:
			if best < INF:
				break
			for oy in range(-rr, rr + 1):
				for ox in range(-rr, rr + 1):
					var c := Vector2(floorf(p.x) + ox + 0.5, floorf(p.y) + oy + 0.5)
					var d := c.distance_to(p)
					if d < best and map.walkable(floori(c.x), floori(c.y)):
						best = d
						at = c
	owner.spear_lies(at, a["dir"], flow_to(at))
	perils.spear(at, a["dir"], owner)


## One of a kind called up into the fight by a boss (game.ts spawn, plain: no words, no rank), as the floor's own plain one of it is
## made (its life, its blows, its pace), at `at`, of pack `pack`, facing `face`; awake and coming on at once, its first blow a
## moment off (cd 0.4 to 0.9 s); giving nothing as it falls (xp 0). Its look by its number, as the game gives the Hushed theirs
## (hushed.ts: Monster.form = id % 3). null where the floor has no plain one of the kind.
var _plain := {}
var _called := 0
func call_up(kind: String, at: Vector2, pack: int, face: Vector2, a1 := {}) -> Monster:
	if not _plain.has(kind):
		return null
	var d: Dictionary = _plain[kind].duplicate(true)
	# (`a1`: what its kind's rules keep about it as it comes: one laid in a ward bed, lying there: act2/physician.gd rounds)
	d["a1"] = a1 if not a1.is_empty() else null
	d.erase("xp")
	if kind == "hushed":
		var form := (_called + 1) % 3
		d["figure"] = "hushed" if form == 0 else "hushed_%d" % form
	return call_up_as(d, at, pack, face)


## A baked figure by its name (loaded the first time it is wanted), or null: the King's Hush at his side, drawn by its mark.
func figure_of(figure: String):
	if not _figures.has(figure):
		if not FileAccess.file_exists("%s/%s.json" % [_figures_dir, figure]):
			return null
		_figures[figure] = BakedFigure.new(_figures_dir, figure, _info)
	return _figures[figure]


## One of its kind's other looks, its pictures with it (game.ts Monster.form; art/bestiary.ts figureOf): `figure` the baked figure's
## name (the palace guard's partisan thrown, his sword drawn: pguard_2).
func look_to(m: Monster, figure: String) -> void:
	if not _figures.has(figure):
		if not FileAccess.file_exists("%s/%s.json" % [_figures_dir, figure]):
			return
		_figures[figure] = BakedFigure.new(_figures_dir, figure, _info)
	m.art = _figures[figure]


## ARRIVALS (game.ts arriveFrom; game/arrivals.ts): `m`, just come into the world, comes in up out of a rift in the floor: its
## rift opening a little after the last of those still to open (0.12 s apart), the rift's size by its own (small, medium, large).
func arrive(m: Monster) -> void:
	var waiting := 0
	for o in list:
		if is_instance_valid(o) and o != m and not o._arrive.is_empty() and float(o._arrive["age"]) <= 0.0:
			waiting += 1
	var delay := waiting * 0.12
	m.arrive(delay, 1.0)
	var r: float = {"small": 0.45, "medium": 0.6, "large": 0.85, "boss": 1.1}.get(str(m.def.get("size", "small")), 0.45)
	_tell({"t": "arrive", "what": "open", "x": m.world.x, "y": m.world.y, "delay": delay, "secs": 1.0, "r": r})


## One as the game made it (`d`, a monster of the export's: act2/bells.gd's tough ones and what the Hush raises), come into the
## world now at `at`, awake and at him.
func call_up_as(d: Dictionary, at: Vector2, pack: int, face: Vector2) -> Monster:
	var kind: String = d["kind"]
	if not _defs.has(kind):
		return null
	d = d.duplicate(true)
	_called += 1
	d["id"] = 100000 + _called
	d["x"] = at.x
	d["y"] = at.y
	var f := face.normalized() if face.length() > 0.001 else Vector2(1, 0)
	d["fx"] = f.x
	d["fy"] = f.y
	d["packId"] = pack
	d["state"] = "chase"
	var figure: String = d["figure"]
	if not _figures.has(figure):
		_figures[figure] = BakedFigure.new(_figures_dir, figure, _info)
	var m := Monster.new()
	m.mgr = self
	m.setup(d, _defs[kind], _figures[figure])
	m.state = "chase"
	m._cd = randf_range(0.4, 0.9)
	stands.add_child(m)
	list.append(m)
	return m


## THE WARDEN CALLS THE DEAD (game.ts callDead): four skeletons crawl up out of the ground on open floor round him, a little
## after one another; till each is out it is only a picture (not to be hit, doing nothing); then it joins the fight.
func summon(w: Monster) -> void:
	var spots: Array[Vector2] = []
	var tries := 0
	while spots.size() < MM.SUMMON["count"] and tries < 200:
		tries += 1
		var p := w.world + Vector2(randf_range(-4.0, 4.0), randf_range(-4.0, 4.0))
		p = Vector2(floorf(p.x) + 0.5, floorf(p.y) + 0.5)
		if p.distance_to(w.world) < 1.5 or not map.walkable(floori(p.x), floori(p.y)) or not sees(w.world, p):
			continue
		var apart := true
		for s in spots:
			if s.distance_to(p) < 1.0:
				apart = false
		if apart:
			spots.append(p)
	for k in spots.size():
		var m := Monster.new()
		m.mgr = self
		var to: Vector2 = hero.world - spots[k]
		var d := {"kind": "skeleton", "x": spots[k].x, "y": spots[k].y, "fx": to.normalized().x, "fy": to.normalized().y, "r": float(_defs["skeleton"]["radius"]),
			"life": float(_defs["skeleton"]["life"]), "maxLife": float(_defs["skeleton"]["life"]), "dmgMin": float(_defs["skeleton"]["dmgMin"]),
			"dmgMax": float(_defs["skeleton"]["dmgMax"]), "speed": float(_defs["skeleton"]["speed"]), "packId": w.pack_id, "boss": false, "champion": false}
		if not _figures.has("skeleton"):
			_figures["skeleton"] = BakedFigure.new(_figures_dir, "skeleton", _info)
		m.setup(d, _defs["skeleton"], _figures["skeleton"])
		m.rise(MM.SUMMON["rise"] + k * MM.SUMMON["apart"])
		stands.add_child(m)
		list.append(m)
	sfx.play("boss_roar")


## How many of the dead the Warden has called still stand, or are coming up out of the ground.
func called(w: Monster) -> int:
	var n := 0
	for o in list:
		if is_instance_valid(o) and o != w and not o.dead and o.pack_id == w.pack_id and o.kind == "skeleton":
			n += 1
	return n


func _fly(dt: float) -> void:
	var keep: Array = []
	var bubbles: bool = hero != null and hero.wakes != null and is_instance_valid(hero.wakes) and not hero.wakes.list.is_empty()
	for a in _arrows:
		var step: float = a["speed"] * dt
		# (THE CITY'S WORDS: STILLING behind, a shot in a bubble crawls: game.ts updateProjectiles)
		if bubbles:
			var z = hero.wakes.patch_at("bubble", a["pos"])
			if z != null:
				step *= 1.0 - float(z["dmg"])
		var p0: Vector2 = a["pos"]
		a["pos"] += a["dir"] * step
		a["left"] -= step
		var p: Vector2 = a["pos"]
		# (THE HIGH CITY'S RUNES MELDED: Spearwall's wall of light stops it: mh_pierce.gd)
		if hero != null and hero.last != null and not hero.last.high.pierce.walls.is_empty() and hero.last.high.pierce.blocks(p0, p):
			a["left"] = 0.0
		FoeHigh.fly(self, a, p0, p)
		var walls: bool = a.get("walls", false) and p.x >= 0.0 and p.y >= 0.0 and p.x < map.w and p.y < map.h
		var gone: bool = a["left"] <= 0.0 or (not map.open_at(floori(p.x), floori(p.y)) and not walls)
		if not gone and not a["hit"] and hero.alive and p.distance_to(hero.world) <= a["r"] + HERO_R:
			# (with its monster's words, from a second back along its flight: game.ts updateProjectiles, hurtHero's (ox, oy))
			var by: Dictionary = a["by"]
			hero.blow_by = a.get("src")
			hero.hurt_by(float(a["dmg"]) * FoeHigh.hit_k(self, a), by["el"], by["words"], by["half"], null, p - a["dir"] * float(a["speed"]), FoeHigh.bare(a))
			hero.blow_by = null
			a["hit"] = true
			gone = not a["pierce"]
		if gone:
			FoeHigh.gone(self, a, p)
			if a.has("spear"):
				# (a spear that met a wall lies before it: back to the last open ground it flew over)
				if not map.open_at(floori(p.x), floori(p.y)):
					a["pos"] = p - a["dir"] * step
				_lay_spear(a)
			a["node"].queue_free()
		else:
			a["node"].position = Iso.to_screen(p.x, p.y)
			if a.has("way"):
				# (a spear's height: from the hand's down to the floor where it comes down, a little arc over the way:
				# render/mob_world.ts spearHeight, z0 21, its arc 7)
				var k := clampf(1.0 - float(a["left"]) / maxf(0.01, float(a["way"])), 0.0, 1.0)
				a["node"].high = 21.0 * (1.0 - k) + 4.0 * 7.0 * k * (1.0 - k)
				a["node"].queue_redraw()
			keep.append(a)
	_arrows = keep


## Bodies that are awake keep apart: two that overlap are pushed apart, each half the way, where the floor lets them; and
## none stands in the hero: one that overlaps him is put back out of him (his own step into a swing included).
## (As game.ts updateMonsters has it, for a boss with small fry of his own and a move that drags the hero in to him, the Ossuary
## Amalgamation: a boss is not jostled by the small fry about him, the other gives way the whole way; and a monster is held off
## the hero by four fifths of its own radius and his, so that the hero can be dragged to a maw 1.15 before a body 1.1 round.)
func _part() -> void:
	for i in list.size():
		var a := list[i]
		# (nor one up in the air or under the lip, floors 6 to 8's: it neither jostles nor is jostled, nor is held off the hero)
		if a.dead or a.state == "sleep" or a.state == "rise" or Monster.Act1.away(a):
			continue
		if hero != null and hero.alive:
			var h: Vector2 = a.world - hero.world
			var hl := h.length()
			var hneed := a.r * 0.8 + HERO_R
			if hl < hneed:
				var out := (h / hl if hl > 0.0001 else Vector2(1, 0)) * (hneed - hl)
				if clear(a.world.x + out.x, a.world.y + out.y, minf(a.r, 0.42)):
					a.world += out
		for j in range(i + 1, list.size()):
			var b := list[j]
			if b.dead or b.state == "rise":
				continue
			var d := b.world - a.world
			var need := a.r + b.r
			var l := d.length()
			if l >= need or l < 0.0001 or Monster.Act1.away(b):
				continue
			# (how much of the way `a` gives: none if it is a boss and the other is not, all if the other is the boss, else half)
			var sa := 0.0 if a.boss and not b.boss else (1.0 if b.boss and not a.boss else 0.5)
			var push_a := d / l * (need - l) * sa
			var push_b := d / l * (need - l) * (1.0 - sa)
			if sa > 0.0 and clear(a.world.x - push_a.x, a.world.y - push_a.y, minf(a.r, 0.42)):
				a.world -= push_a
			if sa < 1.0 and b.state != "sleep" and clear(b.world.x + push_b.x, b.world.y + push_b.y, minf(b.r, 0.42)):
				b.world += push_b


## nav.ts flowField: every tile's walk to the hero's, out to 28 tiles (a step to a side 10, to a corner 14, no corner cut).
func _make_flow() -> void:
	if _flow.size() != map.w * map.h:
		_flow.resize(map.w * map.h)
	_flow.fill(-1)
	if hero == null or not hero.alive:
		return
	_fill_flow(_flow, hero.world)


## A flow field toward any spot on the floor (a Boneward's spear where it lies: game.ts laySpear).
func flow_to(at: Vector2) -> PackedInt32Array:
	var f := PackedInt32Array()
	f.resize(map.w * map.h)
	f.fill(-1)
	_fill_flow(f, at)
	return f


func _fill_flow(f: PackedInt32Array, from: Vector2) -> void:
	# (nav.ts flowField: every tile's walk to `from`, a step to a side 10 and to a corner 14, out to FLOW_REACH tiles; two
	# queues, the sides' and the corners', each in order of its cost, the cheaper front taken; a corner only where both tiles
	# beside it are walkable, and, where there are ledges, where it could be made either way round. -1: not reached.)
	var w := map.w
	var h := map.h
	var sx := floori(from.x)
	var sy := floori(from.y)
	if sx < 0 or sy < 0 or sx >= w or sy >= h:
		return
	var limit := FLOW_REACH * STEP_ORTH
	var steps := not map.step.is_empty()
	var o_t := PackedInt32Array()
	var o_c := PackedInt32Array()
	var d_t := PackedInt32Array()
	var d_c := PackedInt32Array()
	var o_head := 0
	var d_head := 0
	var target := sy * w + sx
	f[target] = 0
	o_t.append(target)
	o_c.append(0)
	while o_head < o_t.size() or d_head < d_t.size():
		var i: int
		var cost: int
		if d_head >= d_t.size() or (o_head < o_t.size() and o_c[o_head] <= d_c[d_head]):
			i = o_t[o_head]
			cost = o_c[o_head]
			o_head += 1
		else:
			i = d_t[d_head]
			cost = d_c[d_head]
			d_head += 1
		if cost != f[i]:
			continue
		var x := i % w
		var y := i / w
		var st: int = map.step[i] if steps else 15
		var left := x > 0 and _pass(i - 1) and (st & STEP_W) != 0
		var right := x < w - 1 and _pass(i + 1) and (st & STEP_E) != 0
		var up := y > 0 and _pass(i - w) and (st & STEP_N) != 0
		var down := y < h - 1 and _pass(i + w) and (st & STEP_S) != 0
		var c1 := cost + STEP_ORTH
		if c1 <= limit:
			for q in [[left, i - 1], [right, i + 1], [up, i - w], [down, i + w]]:
				var j: int = q[1]
				if q[0] and (f[j] < 0 or f[j] > c1):
					f[j] = c1
					o_t.append(j)
					o_c.append(c1)
		var c2 := cost + STEP_DIAG
		if c2 <= limit:
			for q in [[left and up and (not steps or ((map.step[i - 1] & STEP_N) != 0 and (map.step[i - w] & STEP_W) != 0)), i - w - 1],
					[right and up and (not steps or ((map.step[i + 1] & STEP_N) != 0 and (map.step[i - w] & STEP_E) != 0)), i - w + 1],
					[left and down and (not steps or ((map.step[i - 1] & STEP_S) != 0 and (map.step[i + w] & STEP_W) != 0)), i + w - 1],
					[right and down and (not steps or ((map.step[i + 1] & STEP_S) != 0 and (map.step[i + w] & STEP_E) != 0)), i + w + 1]]:
				var j: int = q[1]
				if q[0] and _pass(j) and (f[j] < 0 or f[j] > c2):
					f[j] = c2
					d_t.append(j)
					d_c.append(c2)