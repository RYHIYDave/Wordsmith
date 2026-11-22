## UNIQUE ITEMS IN PLAY: what the uniques he wears do (game.ts “UNIQUE ITEMS”: wears, wornRoll, bendCtx, uniqueMods, uniqueHitMult,
## handPace, hitInMove, rooted, updateUniques, uniqueHurt, uniqueKill, hushNear, keysOpen; game/uniques.ts bendWords, rolledTune,
## wornUniques, damageWordsASide). Which drop where, and their cards, are loot.gd's and inventory.gd's; the numbers, items.json
## `uniques` (tools/godot_loot.ts: UNIQUE_TUNE, each piece's own rolls).
##   WHICH WORK FOR HIM (wornUniques): every unique he wears, a hero's own only on that hero.
##   ITS NUMBERS ROLL (rolledTune): each number of a worn piece's at its roll (0.8 to 1.2 times the tune's); a leveling unique's
##     own numbers as it rolled them (wornRoll).
##   THE ONES THAT BEND WORDSMITHING (bendWords), what each of his three moves works with: the Moth's Wing's dark word; the
##     Censor's Seal and the Quill's Band, a move that takes no words; the words added with no slot used (the Headsman's Hood's
##     CULLING, the Queen's Glass's MIRRORING, the Cantor's Echo's TWIN, the Undertow's PULLING, the Hollow Crown's BINDING, the
##     Long Echo's LASTING); the King's Knot's borrowed word; the Two-Faced Mask's first word behind as well; the Ghostwriter's tap
##     words on the swipe; the Amalgam's Heart's meld; and how much stronger (the Seal, the Band, the Songbird while his life is
##     full, the Nettle Shirt's Vow, the Last Word; the Alloy Band for melded words). The Dog-Eared Page opens every slot, the
##     Third Word a third in front of the tap, the Polyglot's Mantle two damage words a side.
##   HIS OWN RULES: Bloodprice (a flask heals nothing and makes him hit harder a while), the Long Odds, the Miser's Purse (harder
##     the more gold he carries; each hit he takes spills some), the Press, the Half-Carved Hand (below half his life, faster),
##     the Standing Stone (stood still, less harm and no shove), the Moth's Wing (less harm), Broken Shackles (the swipe with no
##     cooldown, and he can be hit in it), the Dancing Shoes (nothing slows him or holds him), the Physician's Coat (flasks from
##     his hits on elites and bosses, none from kills), the Warden's Keys (sealed doors open to him; a chest one more piece), the
##     Crier's Hush (a monster close to him has its words darkened), the Free Hand, the Sure Thing (every hit a critical one, no
##     harder), the Kindling Rod (every hit fire), the Rot Axe (poison in place of a physical hit), the Packstrap (Guarding's
##     shield always on him).
extends Node

const Words := preload("res://scripts/words.gd")
const Talents := preload("res://scripts/talents.gd")
const WHOLE := ["coat.hits"]

var main
var hero
var loot
## (items.json `uniques`: defs, tune)
var D := {}
## The uniques he wears whose rules work for him, by id (game.ts worn).
var worn: Array = []
## The tune as the pieces he wears rolled it, and each “half as strong again” by its id (game.ts ut, halves).
var ut := {}
var halves := {}
## (game.ts uq) What the uniques keep between moments.
var uq := {
	"full": true, "vow_t": 0.0, "vow": 0.0, "dark": null, "dark_t": 0.0, "borrowed": null, "borrowed_t": 0.0,
	"blood_t": 0.0, "coat_hits": 0, "still": 0.0, "hurt_at": -1e9,
}
## (what happened, oldest first, for the checks and the looks: {id, what, ...})
var told: Array = []
var _clock := 0.0
var _was := Vector2.INF


func _ready() -> void:
	D = loot._uniques if loot != null else {}
	ut = (D.get("tune", {}) as Dictionary).duplicate(true)


func wears(id: String) -> bool:
	return worn.has(id)


## (game.ts wornRoll) What the piece of that id he wears rolled for one of its own numbers (a leveling unique's).
func worn_roll(id: String, key: String) -> float:
	for s in loot.EQUIP:
		var it = loot.gear[s]
		if it != null and it.get("unique") == id:
			return float((it.get("uroll", {}) as Dictionary).get(key, 0.0))
	return 0.0


## (game.ts refresh: worn, ut, halves) What he wears worked out again; true if which uniques work for him has changed.
func set_gear(gear: Dictionary, cls: String) -> bool:
	var was := worn.duplicate()
	worn = []
	var defs: Dictionary = D.get("defs", {})
	for s in loot.EQUIP:
		var it = gear.get(s)
		if it == null or it.get("unique") == null:
			continue
		var d: Dictionary = defs.get(str(it["unique"]), {})
		if d.is_empty() or (d["cls"] != null and d["cls"] != cls) or worn.has(it["unique"]):
			continue
		worn.append(str(it["unique"]))
	ut = (D.get("tune", {}) as Dictionary).duplicate(true)
	halves = {}
	for s in loot.EQUIP:
		var it = gear.get(s)
		if it == null or not worn.has(it.get("unique")):
			continue
		var d: Dictionary = defs[str(it["unique"])]
		for path in d.get("rolled", []):
			var f: float = float((it.get("uroll", {}) as Dictionary).get(path, 1.0))
			var ks: PackedStringArray = str(path).split(".")
			if ks.size() == 1:
				halves[str(it["unique"])] = float(D["tune"][ks[0]]) * f
			else:
				var v: float = float(D["tune"][ks[0]][ks[1]]) * f
				ut[ks[0]][ks[1]] = maxf(1.0, roundf(v)) if WHOLE.has(path) else v
	if worn.is_empty() and not was.is_empty():
		_let_go()
	return worn != was


## (game.ts uniqueMods) What the uniques add to his stats that is not written on them: THE FREE HAND, a wand or a tome and no focus.
func mods() -> Array:
	var out: Array = []
	if wears("freehand"):
		var w = loot.gear["mainhand"].get("weapon") if loot.gear["mainhand"] != null else null
		if (w == "wand" or w == "tome") and loot.gear["offhand"] == null:
			out.append(["atkSpeed", float(ut["freeHand"]["atkSpeed"])])
			out.append(["critMult", float(ut["freeHand"]["critMult"])])
	return out


## (game.ts slots, refresh) The slots a move has now: the Dog-Eared Page opens every one; the Third Word, a third in front of the tap.
func every_slot() -> bool:
	return wears("dogearedpage")


func third_word() -> bool:
	return wears("thirdword")


## (uniques.ts damageWordsASide) How many damage words a side may hold.
func damage_a_side() -> int:
	return 2 if wears("polyglotsmantle") else 1


# --- THE ONES THAT BEND WORDSMITHING ---

## (uniques.ts bendWords) What move `i` works with, its slots being `front` and `behind` (for each move): {front, behind, boost,
## meld_boost, meld}.
func bend(i: int, front: Array, behind: Array) -> Dictionary:
	var f: Array = (front[i] as Array).duplicate()
	var b: Array = (behind[i] as Array).duplicate()
	var out := {"front": f, "behind": b, "boost": 1.0, "meld_boost": 1.0, "meld": null}
	if worn.is_empty():
		return out
	var two := wears("polyglotsmantle")
	var dark = uq["dark"]
	# THE MOTH'S WING: one word dark
	if dark != null and int(dark["skill"]) == i:
		var side: Array = f if dark["side"] == "front" else b
		if int(dark["idx"]) >= 0 and int(dark["idx"]) < side.size():
			side[int(dark["idx"])] = null
	# THE CENSOR'S SEAL: the hold attack takes no words. THE QUILL'S BAND: the tap attack takes none.
	if (i == 1 and wears("censorsseal")) or (i == 0 and wears("quillsband")):
		out["front"] = f.map(func(_w): return null)
		out["behind"] = b.map(func(_w): return null)
		return out
	var known: Dictionary = Words.data()["words"]
	var add := func(side: Array, w: String) -> void:
		if not known.has(w) or side.has(w):
			return
		if not two and Words.is_damage(w):
			for x in side:
				if x != null and Words.is_damage(x):
					return
		side.append(w)
	# WORDS ADDED, NO SLOT USED
	if i == 0 and wears("headsmanshood"):
		add.call(f, "culling")
	if i == 0 and wears("queensglass"):
		add.call(f, "mirroring")
	if i == 1 and wears("cantorsecho"):
		add.call(b, "twin")
	if i == 1 and wears("undertow"):
		add.call(f, "pulling")
	if i == 2 and wears("hollowcrown"):
		add.call(b, "binding")
	if wears("longecho"):
		add.call(f, "lasting")
	# THE KING'S KNOT: the word of the monster he killed, in front of the tap attack (lent, not set: a damage word too)
	var lent = uq["borrowed"]
	if i == 0 and wears("kingsknot") and lent != null and not f.has(lent):
		f.append(lent)
	# THE TWO-FACED MASK: the first word in front of the tap attack works behind it too
	if i == 0 and wears("twofacedmask"):
		for k in (front[0] as Array).size():
			var w = front[0][k]
			if w != null and not (dark != null and int(dark["skill"]) == 0 and dark["side"] == "front" and int(dark["idx"]) == k):
				add.call(b, w)
				break
	# THE GHOSTWRITER: the swipe carries every word set on the tap attack, on top of its own
	if i == 2 and wears("ghostwriter") and not wears("quillsband"):
		var d0 = dark if dark != null and int(dark["skill"]) == 0 else null
		for k in (front[0] as Array).size():
			var w = front[0][k]
			if w != null and not (d0 != null and d0["side"] == "front" and int(d0["idx"]) == k) and not f.has(w):
				f.append(w)
		for k in (behind[0] as Array).size():
			var w = behind[0][k]
			if w != null and not (d0 != null and d0["side"] == "behind" and int(d0["idx"]) == k) and not b.has(w):
				b.append(w)
	# THE AMALGAM'S HEART: the two words in front of the tap attack, if they meld, give their meld as well
	if i == 0 and wears("amalgamsheart") and not f.any(func(w): return w != null and Words.is_meld(w)):
		var ws: Array = f.filter(func(w): return w != null)
		for a in ws.size():
			var found := false
			for c in range(a + 1, ws.size()):
				var m := Words.meld_of(ws[a], ws[c])
				if m != "" and Words.is_meld(m):
					out["meld"] = m
					found = true
					break
			if found:
				break
	# HOW STRONG: each “half as strong again” adds its half; her Vow adds what it has grown to
	var more := 0.0
	var half := func(id: String) -> float: return float(halves.get(id, D["tune"]["half"]))
	if i == 0 and wears("censorsseal"):
		more += half.call("censorsseal")
	if i == 1 and wears("quillsband"):
		more += half.call("quillsband")
	if wears("clockworksongbird") and uq["full"]:
		more += half.call("clockworksongbird")
	if wears("nettleshirt"):
		more += clampf(float(uq["vow"]), 0.0, float(ut["nettle"]["most"]))
	# (THE LAST WORD, a leveling unique: every word of the tap and hold attacks, melded ones too)
	var last := worn_roll("lastword", "words") / 100.0 if i < 2 and wears("lastword") else 0.0
	out["boost"] = 1.0 + more + last
	out["meld_boost"] = (1.0 + half.call("alloyband") if wears("alloyband") else 1.0) + last
	return out


## (game.ts refresh, after resolveSkill) What the uniques make of move `i` once its words are worked out: the Kindling Rod's fire,
## the Last Word's longer cooldowns, Broken Shackles' swipe (and the Cloven Boots' Smoke Step as the demon) with none.
func after_resolve(i: int, r: Dictionary) -> void:
	if wears("kindlingrod"):
		r["element"] = "fire"
		r["poison"] = 0.0
	if wears("lastword"):
		r["cooldown"] = float(r["cooldown"]) * (1.0 + worn_roll("lastword", "cool") / 100.0)
	if i == 2 and (wears("brokenshackles") or (wears("clovenboots") and hero.kit != null and hero.kit.get("form") == "demon")):
		r["cooldown"] = 0.0


# --- HIS OWN RULES ---

## (game.ts uniqueHitMult) What the uniques make of his hit on `m` with move `i` (1: nothing).
func hit_mult(m, i: int) -> float:
	if worn.is_empty():
		return 1.0
	var k := 1.0
	# BLOODPRICE: a flask's fury
	if float(uq["blood_t"]) > 0.0 and wears("bloodprice"):
		k *= 1.0 + float(ut["bloodprice"]["more"])
	# THE LONG ODDS: elites and bosses harder, everything else softer
	if wears("longodds"):
		k *= 1.0 + float(ut["odds"]["more"]) if m.elite or m.boss or m.champion else 1.0 - float(ut["odds"]["less"])
	# THE MISER'S PURSE: the more gold he carries (on the Tinkerer it adds to her Fortune talent: one sum)
	if wears("miserspurse"):
		var fo: float = float(Talents.D["tinkerTalents"]["fortune"]) if hero.has("fortune") else 0.0
		k *= (1.0 + loot.gold * (fo + float(ut["purse"]["each"]))) / (1.0 + loot.gold * fo)
	# THE PRESS: the more enemies close round him
	if wears("press"):
		var n := 0
		for o in hero.monsters.list:
			if is_instance_valid(o) and not o.dead and o.state != "sleep" and o.world.distance_to(hero.world) <= float(ut["press"]["near"]) + o.r:
				n += 1
		k *= 1.0 + minf(float(ut["press"]["most"]), float(ut["press"]["each"]) * n)
	return k


## (game.ts handPace) THE HALF-CARVED HAND: how much faster his attacks are now (1: no faster).
func hand_pace() -> float:
	if wears("halfcarvedhand") and hero.life < hero.max_life * float(ut["halfHand"]["below"]):
		return 1.0 + float(ut["halfHand"]["attack"])
	return 1.0


## (game.ts walkPace) THE HALF-CARVED HAND: how much faster his feet are now.
func feet_pace() -> float:
	if wears("halfcarvedhand") and hero.life < hero.max_life * float(ut["halfHand"]["below"]):
		return 1.0 + float(ut["halfHand"]["move"])
	return 1.0


## (game.ts hitInMove) BROKEN SHACKLES: he can be hit during his swipe move (its price).
func hit_in_move() -> bool:
	return wears("brokenshackles")


## (game.ts rooted) THE STANDING STONE: is he standing still, as it counts it?
func rooted() -> bool:
	return wears("standingstone") and float(uq["still"]) >= float(ut["stone"]["after"]) and hero._act != "lunge"


## (game.ts hurtHero) How much of a blow reaches him, by what he wears: the Moth's Wing, the Standing Stone.
func hurt_k() -> float:
	var k := 1.0
	if wears("mothswing"):
		k *= 1.0 - float(ut["moth"]["less"])
	if rooted():
		k *= 1.0 - float(ut["stone"]["less"])
	return k


## (game.ts hurtHero, the Packstrap) A blow reached him, shield or none.
func blow_came() -> void:
	uq["hurt_at"] = _clock


## (game.ts uniqueHurt) What a blow that took life from him does with the uniques worn (`src`: the monster that struck it).
func hurt(_src) -> void:
	if worn.is_empty():
		return
	var again := false
	# THE NETTLE SHIRT: a hit breaks the vow, and it starts over
	if wears("nettleshirt"):
		uq["vow_t"] = 0.0
		if float(uq["vow"]) > 0.0:
			uq["vow"] = 0.0
			again = true
	# THE MOTH'S WING: each hit darkens one of his words (one word dark at a time: a new hit moves the dark to another)
	if wears("mothswing"):
		var set: Array = []
		for i in 3:
			for k in (hero.loadout.front[i] as Array).size():
				if hero.loadout.front[i][k] != null:
					set.append({"skill": i, "side": "front", "idx": k})
			for k in (hero.loadout.behind[i] as Array).size():
				if hero.loadout.behind[i][k] != null:
					set.append({"skill": i, "side": "behind", "idx": k})
		var d = uq["dark"]
		var others: Array = set.filter(func(q): return d == null or q != d)
		var pick = others.pick_random() if not others.is_empty() else (set[0] if not set.is_empty() else null)
		if pick != null:
			uq["dark"] = pick
			uq["dark_t"] = float(ut["moth"]["dark"])
			again = true
			var w = (hero.loadout.front if pick["side"] == "front" else hero.loadout.behind)[pick["skill"]][pick["idx"]]
			_say({"id": "mothswing", "what": "dark", "word": w, "skill": pick["skill"]})
			if w != null:
				hero._tell({"t": "text", "x": hero.world.x, "y": hero.world.y, "text": "%s dark" % Words.word(w)["name"], "color": "#b0a0c0"})
	# THE MISER'S PURSE: every hit spills some of his gold on the floor round him (it can be picked up again)
	if wears("miserspurse") and loot.gold > 0:
		var spill: int = mini(loot.gold, maxi(1, roundi(loot.gold * float(ut["purse"]["spill"]))))
		loot.gold -= spill
		var n := mini(3, spill)
		for k in n:
			var share: int = spill / n + (1 if k < spill % n else 0)
			if share > 0:
				loot.spill_gold(hero.world, share)
		_say({"id": "miserspurse", "what": "spill", "gold": spill})
	if again:
		hero.loadout.refresh()


## (game.ts uniqueKill) What a kill does with the uniques worn.
func killed(m) -> void:
	if worn.is_empty():
		return
	# THE KING'S KNOT: a monster that carried a word: his tap attack carries it too for a while (a word it has in front already is
	# not borrowed)
	if wears("kingsknot"):
		var theirs: Array = m.dark_words if m.get("dark_words") != null and not (m.dark_words as Array).is_empty() else m.words
		var front: Array = Words.with_parts(hero.loadout.front[0])
		var w = null
		for q in theirs:
			if not front.has(q):
				w = q
				break
		if w != null:
			var was = uq["borrowed"]
			uq["borrowed"] = w
			uq["borrowed_t"] = float(ut["knot"]["secs"])
			_say({"id": "kingsknot", "what": "borrow", "word": w})
			if was != w:
				hero._tell({"t": "text", "x": hero.world.x, "y": hero.world.y, "text": str(Words.word(w)["name"]).to_upper(), "color": "#7af8f0"})
				hero.loadout.refresh()


## (game.ts kill) THE PHYSICIAN'S COAT: no flask refills from kills.
func flasks_from_kills() -> bool:
	return not wears("physicianscoat")


## (game.ts hitMonster) A hit he landed on `m` (`crit`, a critical one; `quiet`, a splash's): the Physician's Coat counts it on an elite
## or a boss.
func landed(m, _crit: bool, _quiet: bool) -> void:
	if (m.elite or m.boss) and wears("physicianscoat"):
		uq["coat_hits"] = int(uq["coat_hits"]) + 1
		if int(uq["coat_hits"]) >= int(ut["coat"]["hits"]):
			uq["coat_hits"] = 0
			if loot.potions < loot.POTIONS:
				loot.potions += 1
				_say({"id": "physicianscoat", "what": "flask"})


## (game.ts usePotion) BLOODPRICE: a flask heals nothing; it makes him hit harder for a while (and may be drunk at full life). True
## if it was so.
func blood_flask() -> bool:
	if not wears("bloodprice"):
		return false
	uq["blood_t"] = float(ut["bloodprice"]["secs"])
	_say({"id": "bloodprice", "what": "fury", "secs": uq["blood_t"]})
	hero._tell({"t": "buff", "kind": "might", "x": hero.world.x, "y": hero.world.y, "stacks": 5})
	return true


## (game.ts updateProps) THE WARDEN'S KEYS: how many more pieces a chest holds.
func chest_more() -> int:
	return int(ut["keys"]["more"]) if wears("wardenskeys") else 0


## (game.ts hitMonster) THE SURE THING: every hit a critical one, and a critical hit no harder.
func sure_thing() -> bool:
	return wears("surething")


## (game.ts hitMonster) THE ROT AXE: a physical hit does no harm of its own: it poisons instead, this share of it.
func rot(el: String) -> float:
	return worn_roll("rotaxe", "rot") / 100.0 if el == "phys" and wears("rotaxe") else 0.0


# --- each moment ---

## (game.ts updateUniques) The uniques' own clocks, each step: what comes and goes with time, and the words worked out again when
## one of them has changed.
func _process(dt: float) -> void:
	_clock += dt
	if hero == null or not hero.alive:
		return
	var walked: float = 0.0 if _was == Vector2.INF else hero.world.distance_to(_was)
	_was = hero.world
	if worn.is_empty():
		return
	var again := false
	# THE CLOCKWORK SONGBIRD: it sings while his life is full
	var full: bool = hero.life >= hero.max_life - 0.5
	if full != uq["full"]:
		uq["full"] = full
		if wears("clockworksongbird"):
			again = true
	# THE NETTLE SHIRT: her Vow grows while he goes unhit
	if wears("nettleshirt"):
		uq["vow_t"] = float(uq["vow_t"]) + dt
		var N: Dictionary = ut["nettle"]
		var vow: float = minf(float(N["most"]), floorf(float(uq["vow_t"]) / float(N["every"]) + 1e-9) * float(N["each"]))
		if vow != float(uq["vow"]):
			uq["vow"] = vow
			again = true
	elif float(uq["vow"]) > 0.0 or float(uq["vow_t"]) > 0.0:
		uq["vow"] = 0.0
		uq["vow_t"] = 0.0
		again = true
	# THE MOTH'S WING: the dark word comes back
	if uq["dark"] != null:
		uq["dark_t"] = float(uq["dark_t"]) - dt
		if float(uq["dark_t"]) <= 0.0 or not wears("mothswing"):
			uq["dark"] = null
			again = true
			_say({"id": "mothswing", "what": "light"})
	# THE KING'S KNOT: the borrowed word runs out
	if uq["borrowed"] != null:
		uq["borrowed_t"] = float(uq["borrowed_t"]) - dt
		if float(uq["borrowed_t"]) <= 0.0 or not wears("kingsknot"):
			uq["borrowed"] = null
			again = true
	if float(uq["blood_t"]) > 0.0:
		uq["blood_t"] = maxf(0.0, float(uq["blood_t"]) - dt)
	# THE STANDING STONE: how long he has stood still
	uq["still"] = 0.0 if walked > 0.001 or hero._act == "lunge" else float(uq["still"]) + dt
	# THE DANCING SHOES: nothing slows him or holds him in place
	if wears("dancingshoes"):
		hero.chill_t = 0.0
		hero.root_t = 0.0
		hero._slow_t = 0.0
		hero.held = 0.0
	# THE PACKSTRAP: Guarding's shield always on him; broken, back once no blow has reached him for a while
	if wears("packstrap") and hero.shield <= 0.0 and _clock - float(uq["hurt_at"]) >= worn_roll("packstrap", "back"):
		hero.shield = maxf(1.0, roundf(hero.max_life * worn_roll("packstrap", "size") / 100.0))
		hero.shield_t = 1e9
	var map = hero.map
	if map != null and int(map.depth) >= 1 and main != null and main.get("_going") != true:
		if wears("criershush") or _any_dark():
			_hush_near()
		if wears("wardenskeys"):
			_keys_open()
	if again:
		hero.loadout.refresh()


## (nothing worn: what a unique was keeping is let go)
func _let_go() -> void:
	uq["dark"] = null
	uq["borrowed"] = null
	uq["vow"] = 0.0
	uq["vow_t"] = 0.0
	uq["full"] = true
	_undarken()


# --- THE CRIER'S HUSH ---

func _any_dark() -> bool:
	for m in hero.monsters.list:
		if is_instance_valid(m) and m.get("dark_words") != null and not (m.dark_words as Array).is_empty():
			return true
	return false


## (game.ts hushNear) A monster standing close to him has its words darkened: kept off it until it steps away.
func _hush_near() -> void:
	var T: Dictionary = ut["hush"]
	var on := wears("criershush")
	for m in hero.monsters.list:
		if not is_instance_valid(m) or m.dead:
			continue
		var near: float = m.world.distance_to(hero.world) - m.r
		var dark: bool = not (m.dark_words as Array).is_empty()
		if on and not dark and not (m.words as Array).is_empty() and (not m.boss or T["bosses"]) and m.state != "sleep" and near <= float(T["reach"]):
			m.dark_words = m.words
			m.dark_half = m.half
			m.words = []
			m.half = []
			_say({"id": "criershush", "what": "dark", "m": m})
		elif dark and (not on or near > float(T["reach"]) + 0.4):
			m.words = m.dark_words
			m.half = m.dark_half
			m.dark_words = []
			m.dark_half = []
			_say({"id": "criershush", "what": "light", "m": m})


## (game.ts undarken) Every monster's darkened words given back (the Hush taken off).
func _undarken() -> void:
	if hero == null or hero.monsters == null:
		return
	for m in hero.monsters.list:
		if is_instance_valid(m) and not (m.dark_words as Array).is_empty():
			m.words = m.dark_words
			m.half = m.dark_half
			m.dark_words = []
			m.dark_half = []


# --- THE WARDEN'S KEYS ---

## (game.ts keysOpen) A sealed word door opens as he comes near it, without its word.
func _keys_open() -> void:
	var map = hero.map
	for d in map.doors:
		if d["kind"] != "worddoor" or int(d["want"]) != 0:
			continue
		var at := Vector2(d["middle"]["x"], d["middle"]["y"])
		if at.distance_to(hero.world) > float(ut["keys"]["reach"]):
			continue
		main._doors.open_seal(d)
		_say({"id": "wardenskeys", "what": "open"})
		loot.say("The seal opens to the Warden's keys.", loot.MSG_WORD)


func _say(e: Dictionary) -> void:
	told.append(e)
	if told.size() > 64:
		told.pop_front()
