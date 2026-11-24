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
##   THE FIFTEEN OF THE THREE DEFENCES (game/uniques.ts DEFENCE_DEFS; loot.gd DEFENCE_UNIQUES, off until his yes), the Godot game's
##     alone, each working with the defence its piece carries. ARMOUR: Anvilheart (his armour against Flame, Frost and Lightning
##     too), the Burr (what strikes him takes a share of his armour), Ballast (harder the more armour; slower), the Unbowed (no blow
##     more than a share of his life; he cannot dodge), Workhardened (more armour for each blow lately taken). BARRIER: Quickglass
##     (it fills sooner), the Decanter (a flask fills it), Shatterglass (breaking, it bursts), Halo (harder while it is full), the
##     Glazier's Ring (his gear's armour is barrier). DODGE: Feint (a blow dodged, harder a while), Afterimage (faster a while),
##     Featherweight (more dodge, no armour), Close Call (a blow dodged heals), Tailwind (his movement speed is dodge too).
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
	"arm_t": 0.0, "arm_m": null, "arm_at": -1e9, "talon_at": -1e9, "strikes": 0,
	"weight": 0, "weight_hit": 0, "weight_quake": false, "weight_at": -1e9,
	"tome_a": 0.0, "tome_at": {}, "streak": 0, "receipt_at": -1e9,
	# (THE FIFTEEN OF THE THREE DEFENCES: Workhardened's blows lately taken and how long they last; Feint's seconds left)
	"temper": 0, "temper_t": 0.0, "feint_t": 0.0,
}
## SET 1, GYRE: his axes spinning where their flight ended: {at, skill, dmg, t, tick, age}
var gyres: Array = []
## THE WINDCUTTER'S BLADES in flight: {at, v, r, left, hit: [monsters], age, words, el}
var blades: Array = []
## (defs.ts ALLY_DAMAGE: a hit of what fights beside him, the tentacle's or a bird's, made as hard as allies hit now)
const ALLY_MORE := 1.0
## THE FLESHMANCER'S BRAND (game.ts risen): the elite risen to fight for him, or null: {art, kind, champion, at, f, r, t, act, act_t,
## did, target, cd, walked, map}
var risen = null
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
	# (THE FIFTEEN OF THE THREE DEFENCES: Ballast's price, slower feet)
	if wears("ballast"):
		out.append(["moveSpeed", -float(ut["ballast"]["slow"])])
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
		r["element2"] = ""
		r["poison"] = 0.0
	# (TWELVE LEVELING WEAPONS: the Icicle, every hit frost and no other kind of damage, as the Kindling Rod's are fire)
	if wears("icicle"):
		r["element"] = "frost"
		r["element2"] = ""
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
	# (THE FIFTEEN OF THE THREE DEFENCES) BALLAST: harder for his armour; HALO: while his barrier is full; FEINT: a blow dodged lately
	if wears("ballast"):
		k *= 1.0 + minf(float(ut["ballast"]["most"]), float(hero.stats.get("armor", 0.0)) / float(ut["ballast"]["per"]) * float(ut["ballast"]["more"]))
	if wears("halo") and hero.max_barrier > 0.0 and hero.barrier >= hero.max_barrier - 0.01:
		k *= 1.0 + float(ut["halo"]["more"])
	if float(uq["feint_t"]) > 0.0 and wears("feint"):
		k *= 1.0 + float(ut["feint"]["more"])
	# THE LONG ODDS: elites and bosses harder, everything else softer
	if wears("longodds"):
		k *= 1.0 + float(ut["odds"]["more"]) if m.elite or m.boss or m.champion else 1.0 - float(ut["odds"]["less"])
	# THE MISER'S PURSE: the more gold he carries (on the Tinkerer it adds to her Fortune talent: one sum)
	if wears("miserspurse"):
		var fo: float = float(Talents.D["tinkerTalents"]["fortune"]) if hero.has("fortune") else 0.0
		k *= (1.0 + loot.gold * (fo + float(ut["purse"]["each"]))) / (1.0 + loot.gold * fo)
	# (SET 1) DEADWEIGHT: each Smash in a row harder than the last; RED TITHE: Cleave a little softer (its price)
	var sid: String = hero.loadout.id(i) if i >= 0 and i <= 2 else ""
	if sid == "smash" and int(uq["weight_hit"]) > 0 and wears("deadweight"):
		k *= 1.0 + float(ut["weight"]["more"]) * int(uq["weight_hit"])
	if sid == "cleave" and wears("redtithe"):
		k *= 1.0 - float(ut["tithe"]["cleave"])
	# THE LEDGER OF DEBTS: the Hellfire Bolt, for every cursed enemy near him
	if sid == "hellbolt" and wears("ledgerofdebts"):
		var n := 0
		for o in hero.monsters.list:
			if is_instance_valid(o) and not o.dead and o.curse_t > 0.0 and o.world.distance_to(hero.world) <= float(ut["ledger"]["near"]) + o.r:
				n += 1
		k *= 1.0 + minf(float(ut["ledger"]["most"]), float(ut["ledger"]["each"]) * n)
	# THE WINNING STREAK: every combo finished, unhit
	if int(uq["streak"]) > 0 and wears("winningstreak"):
		k *= 1.0 + minf(float(ut["streak"]["most"]), float(ut["streak"]["each"]) * int(uq["streak"]))
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


# --- THE FIFTEEN OF THE THREE DEFENCES ---

## ANVILHEART: the share of his armour's strength that works against Flame, Frost and Lightning (0: none).
func armour_on_elements() -> float:
	return float(ut["anvil"]["share"]) if wears("anvilheart") else 0.0


## WORKHARDENED: how much more his armour is now, for the blows he has lately taken (1: no more).
func armour_k() -> float:
	return 1.0 + float(ut["temper"]["each"]) * int(uq["temper"]) if wears("workhardened") else 1.0


## THE UNBOWED: he cannot dodge (its price).
func no_dodge() -> bool:
	return wears("unbowed")


## THE UNBOWED: a blow of `dmg`, no more than its share of his life.
func cap_blow(dmg: float) -> float:
	return minf(dmg, maxf(1.0, roundf(hero.max_life * float(ut["unbowed"]["most"])))) if wears("unbowed") else dmg


## A blow struck him (not dodged, not blocked), whatever took it: THE BURR, the monster whose blow it is takes a share of his
## armour; WORKHARDENED, his armour more for a while.
func struck(src) -> void:
	if wears("workhardened"):
		uq["temper"] = mini(int(ut["temper"]["most"]), int(uq["temper"]) + 1)
		uq["temper_t"] = float(ut["temper"]["secs"])
		_say({"id": "workhardened", "what": "harder", "n": uq["temper"]})
	if wears("theburr") and _fine(src) and src.has_method("damage"):
		var d: float = roundf(float(hero.stats.get("armor", 0.0)) * armour_k() * float(ut["burr"]["share"]))
		if d >= 1.0:
			src.damage(d, "phys", false, false, [], false, false, -1)
			_say({"id": "theburr", "what": "pricked", "dmg": d})


## A blow missed him altogether: FEINT, harder for a while; AFTERIMAGE, faster for a while (Swift's haste); CLOSE CALL, healed.
func dodged() -> void:
	if wears("feint"):
		uq["feint_t"] = float(ut["feint"]["secs"])
		_say({"id": "feint", "what": "edge"})
	if wears("afterimage"):
		hero.haste = maxf(hero.haste if hero.haste_t > 0.0 else 0.0, float(ut["after"]["haste"]))
		hero.haste_t = maxf(hero.haste_t, float(ut["after"]["secs"]))
		hero._tell({"t": "buff", "kind": "haste", "x": hero.world.x, "y": hero.world.y, "stacks": 1, "secs": hero.haste_t})
		_say({"id": "afterimage", "what": "haste"})
	if wears("closecall") and hero.life < hero.max_life:
		hero.heal(float(ut["close"]["heal"]))
		_say({"id": "closecall", "what": "healed", "share": ut["close"]["heal"]})


## QUICKGLASS: how long after a hit his barrier begins to fill (`usual` without it).
func barrier_wait(usual: float) -> float:
	return minf(usual, float(ut["quick"]["wait"])) if wears("quickglass") else usual


## SHATTERGLASS: his barrier has broken: it bursts, striking all near him for a share of his full barrier.
func barrier_broke() -> void:
	if not wears("shatterglass") or hero.max_barrier <= 0.0 or hero.monsters == null:
		return
	var S: Dictionary = ut["shatter"]
	var d: float = maxf(1.0, roundf(hero.max_barrier * float(S["share"])))
	hero._tell({"t": "burst", "x": hero.world.x, "y": hero.world.y, "r": S["r"], "el": "phys", "style": "shock"})
	hero.sfx.play("slam", linear_to_db(0.7))
	var n := 0
	for m in hero.monsters.list:
		if not _fine(m) or m.world.distance_to(hero.world) > float(S["r"]) + m.r:
			continue
		m.damage(d, "phys", false, false, [], false, false, -1)
		n += 1
	_say({"id": "shatterglass", "what": "burst", "dmg": d, "hit": n})


## THE DECANTER: a flask drunk fills his barrier.
func flask_drunk() -> void:
	if wears("decanter") and hero.max_barrier > 0.0:
		hero.barrier = hero.max_barrier
		_say({"id": "decanter", "what": "filled"})


## THE GLAZIER'S RING: how much barrier each point of his gear's armour is in place of armour (0: it stays armour).
func armour_as_barrier() -> float:
	return float(ut["glazier"]["per"]) if wears("glaziersring") else 0.0


## FEATHERWEIGHT: he has no armour (its price); how much more his dodge is (1: no more).
func no_armour() -> bool:
	return wears("featherweight")


func dodge_more() -> float:
	return 1.0 + float(ut["feather"]["more"]) if wears("featherweight") else 1.0


## TAILWIND: the dodge his movement speed (`speed`, %) is too.
func speed_as_dodge(speed: float) -> float:
	return maxf(0.0, speed) * float(ut["tail"]["per"]) if wears("tailwind") else 0.0


## (game.ts hurtHero, the Packstrap) A blow reached him, shield or none.
func blow_came() -> void:
	uq["hurt_at"] = _clock


## (game.ts uniqueHurt) What a blow that took life from him does with the uniques worn (`src`: the monster that struck it).
func hurt(src) -> void:
	if worn.is_empty():
		return
	var again := false
	# THE WINNING STREAK: getting hit ends the streak
	uq["streak"] = 0
	# THE RECEIPT: a blow he takes from in front is answered at once with a free punch
	if src != null and is_instance_valid(src) and not src.dead and wears("receipt") and _clock - float(uq["receipt_at"]) >= float(ut["receipt"]["gap"]):
		var R: Dictionary = ut["receipt"]
		var dv: Vector2 = src.world - hero.world
		var d := dv.length()
		if d - src.r <= float(R["reach"]) and (d < 0.01 or dv.dot(hero.face) / d >= float(R["cos"])):
			uq["receipt_at"] = _clock
			var f: Vector2 = dv / d if d > 0.01 else hero.face
			hero._tell({"t": "unique", "id": "receipt", "what": "answer", "x": hero.world.x, "y": hero.world.y, "x1": src.world.x, "y1": src.world.y, "mid": src.id})
			hero._tell({"t": "swing", "x": hero.world.x, "y": hero.world.y, "dx": f.x, "dy": f.y, "reach": R["reach"], "el": hero.loadout.r(0)["element"]})
			hero.sfx.play("haymaker", linear_to_db(0.7))
			hero.hit_monster(src, 0, float(R["share"]), false)
			_say({"id": "receipt", "what": "answer"})
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
	# THE FLESHMANCER'S BRAND: an elite he kills rises and fights for him
	if wears("fleshmancersbrand") and m.elite and not m.boss:
		_raise(m)
	# (SET 1) RED TITHE: one that dies bleeding throws its blood to the nearest other, which starts bleeding too
	if m.bleed_t > 0.0 and m.bleed_dps > 0.0 and wears("redtithe"):
		_tithe(m)


## (game.ts kill) THE PHYSICIAN'S COAT: no flask refills from kills.
func flasks_from_kills() -> bool:
	return not wears("physicianscoat")


## (game.ts hitMonster) A hit he landed on `m` (`crit`, a critical one; `quiet`, a splash's): the Physician's Coat counts it on an elite
## or a boss.
func landed(m, crit: bool, quiet: bool) -> void:
	# (THE QUEEN'S TALONS: each critical hit calls a bird; THE DROWNED ARM: the enemy he is fighting is the one he last struck)
	if crit and wears("queenstalons"):
		_call_bird()
	if not quiet and wears("drownedarm"):
		uq["arm_m"] = m
		uq["arm_at"] = _clock
	# (SET 1: Death Knell, struck while it rings, it peals)
	if m.knell_t > 0.0 and wears("deathknell"):
		_peal(m)
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


## A weapon that can deal no other type of damage (the Kindling Rod's fire, the Icicle's frost): no flat damage of another element
## rides its hits (hero.gd _flat_extras).
func one_element() -> bool:
	return wears("kindlingrod") or wears("icicle")


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
	# (THE FIFTEEN OF THE THREE DEFENCES: Workhardened's hardening and Feint's edge run out)
	if float(uq["temper_t"]) > 0.0:
		uq["temper_t"] = float(uq["temper_t"]) - dt
		if float(uq["temper_t"]) <= 0.0:
			uq["temper"] = 0
	if float(uq["feint_t"]) > 0.0:
		uq["feint_t"] = float(uq["feint_t"]) - dt
	if risen != null:
		_step_risen(dt)
	if not blades.is_empty():
		_step_blades(dt)
	if not gyres.is_empty():
		_step_gyres(dt)
	# (SET 1) DEATH KNELL: the rings die away; DEADWEIGHT: stopped swinging, the weight drains away, a blow's worth at a time
	if wears("deathknell"):
		for m in hero.monsters.list:
			if is_instance_valid(m) and m.knell_t > 0.0:
				m.knell_t = maxf(0.0, m.knell_t - dt)
	if int(uq["weight"]) > 0 and _clock - float(uq["weight_at"]) > float(ut["weight"]["keep"]):
		uq["weight"] = int(uq["weight"]) - 1
		uq["weight_at"] = _clock - float(ut["weight"]["keep"]) + float(ut["weight"]["drain"])
		hero._tell({"t": "unique", "id": "deadweight", "what": "weight", "x": hero.world.x, "y": hero.world.y, "r": uq["weight"]})
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
		if wears("drownedarm"):
			_step_arm(dt)
		if wears("restlesstome"):
			_step_tome(dt)
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


# --- WHAT FIGHTS BESIDE HIM: the tentacle, her birds, the risen elite ---

## (game.ts uniqueHit) A hit his own gear makes by itself (a tentacle, a bird, a risen elite): `share` of his weapon hit, physical.
func _unique_hit(share: float) -> float:
	var b: Array = hero.base_for("phys")
	var st: Dictionary = hero.stats
	return maxf(1.0, roundf(randf_range(b[0], b[1]) * share * (1.0 + (float(st["dmg_pct"]) + float(st["phys_pct"]) + hero.might) / 100.0)))


## (game.ts allyDamage) A hit of what fights beside him.
func _ally(m, dmg: float) -> void:
	m.damage(hero.side(m, dmg * ALLY_MORE), "phys", false, false, [], false, false, -1)


func _fine(m) -> bool:
	return m != null and is_instance_valid(m) and not m.dead and not hero.monsters.shut_in(m)


## (game.ts stepArm) THE DROWNED ARM: every few seconds a tentacle bursts up under the enemy he is fighting and slams it, stunning
## what it slams.
func _step_arm(dt: float) -> void:
	var A: Dictionary = ut["arm"]
	uq["arm_t"] = float(uq["arm_t"]) - dt
	if float(uq["arm_t"]) > 0.0:
		return
	var m = uq["arm_m"]
	if not _fine(m) or _clock - float(uq["arm_at"]) > float(A["fresh"]) or m.world.distance_to(hero.world) > float(A["reach"]):
		uq["arm_t"] = 0.0
		return
	uq["arm_t"] = float(A["every"])
	var at: Vector2 = m.world
	hero._tell({"t": "unique", "id": "drownedarm", "what": "warn", "x": at.x, "y": at.y, "r": A["r"], "secs": A["lead"], "mid": m.id})
	_say({"id": "drownedarm", "what": "warn"})
	hero._after(float(A["lead"]), func() -> void:
		if not hero.alive:
			return
		hero._tell({"t": "unique", "id": "drownedarm", "what": "slam", "x": at.x, "y": at.y, "r": A["r"]})
		hero._tell({"t": "burst", "x": at.x, "y": at.y, "r": A["r"], "el": "phys", "style": "slam"})
		hero.kick(2.5)
		hero.sfx.play("slam", linear_to_db(0.7))
		var n := 0
		for o in hero.monsters.list:
			if not _fine(o) or o.world.distance_to(at) > float(A["r"]) + o.r:
				continue
			_ally(o, _unique_hit(float(A["share"])))
			o.stun_for(float(A["stun"]))
			n += 1
		_say({"id": "drownedarm", "what": "slam", "n": n}))


## (game.ts callBird) THE QUEEN'S TALONS: a critical hit calls one of her birds: it dives on the enemy nearest him.
func _call_bird() -> void:
	var B: Dictionary = ut["talons"]
	if _clock - float(uq["talon_at"]) < float(B["gap"]):
		return
	var best = null
	var bd: float = float(B["reach"])
	for m in hero.monsters.list:
		if not _fine(m) or m.state == "sleep":
			continue
		var d: float = m.world.distance_to(hero.world) - m.r
		if d < bd:
			bd = d
			best = m
	if best == null:
		return
	uq["talon_at"] = _clock
	var to = best
	hero._tell({"t": "unique", "id": "queenstalons", "what": "dive", "x": hero.world.x, "y": hero.world.y, "x1": to.world.x, "y1": to.world.y, "secs": B["dive"], "mid": to.id})
	_say({"id": "queenstalons", "what": "dive"})
	hero._after(float(B["dive"]), func() -> void:
		if not _fine(to) or not hero.alive:
			return
		hero._tell({"t": "spark", "x": to.world.x, "y": to.world.y, "el": "phys", "n": 6})
		hero.sfx.play("hit", linear_to_db(0.5))
		_ally(to, _unique_hit(float(B["share"])))
		_say({"id": "queenstalons", "what": "struck"}))


## (game.ts raise) THE FLESHMANCER'S BRAND: an elite he killed rises where it fell, to fight for him a while; one at a time.
func _raise(m) -> void:
	var B: Dictionary = ut["brand"]
	if risen != null:
		hero._tell({"t": "unique", "id": "fleshmancersbrand", "what": "fall", "x": risen["at"].x, "y": risen["at"].y})
	var at: Vector2 = m.world if hero.monsters.clear(m.world.x, m.world.y, 0.3) else hero.world
	risen = {"art": m.art, "kind": m.kind, "champion": m.champion, "at": at, "f": m.face if m.get("face") != null else Vector2(0.7, 0.7),
		"r": m.r, "t": float(B["secs"]), "act": "rise", "act_t": 0.0, "did": false, "target": null, "cd": 0.0, "walked": 0.0, "map": hero.map}
	hero._tell({"t": "unique", "id": "fleshmancersbrand", "what": "rise", "x": at.x, "y": at.y, "secs": B["secs"]})
	hero.sfx.play("power", linear_to_db(0.5))
	_say({"id": "fleshmancersbrand", "what": "rise", "kind": m.kind})


## (game.ts stepRisen) The risen elite, each step: it goes for the nearest enemy awake near him, strikes it, and falls when its time
## is up.
func _step_risen(dt: float) -> void:
	var p: Dictionary = risen
	var B: Dictionary = ut["brand"]
	p["t"] = float(p["t"]) - dt
	p["act_t"] = float(p["act_t"]) + dt
	p["cd"] = maxf(0.0, float(p["cd"]) - dt)
	var map = hero.map
	if float(p["t"]) <= 0.0 or map == null or int(map.depth) < 1 or p["map"] != map or not wears("fleshmancersbrand"):
		hero._tell({"t": "unique", "id": "fleshmancersbrand", "what": "fall", "x": p["at"].x, "y": p["at"].y})
		_say({"id": "fleshmancersbrand", "what": "fall"})
		risen = null
		return
	if p["act"] == "rise":
		if float(p["act_t"]) >= 0.6:
			p["act"] = "stand"
		return
	if p["act"] == "strike":
		if not p["did"] and float(p["act_t"]) >= 0.3:
			p["did"] = true
			var m = p["target"]
			if _fine(m) and m.world.distance_to(p["at"]) <= float(B["reach"]) + m.r + float(p["r"]) + 0.6:
				hero._tell({"t": "unique", "id": "fleshmancersbrand", "what": "strike", "x": p["at"].x, "y": p["at"].y, "x1": m.world.x, "y1": m.world.y, "mid": m.id})
				hero.sfx.play("hit", linear_to_db(0.5))
				m.damage(hero.side(m, _unique_hit(float(B["share"]))), "phys", false, false, [], false, false, -1)
				_say({"id": "fleshmancersbrand", "what": "strike"})
		if float(p["act_t"]) >= 0.6:
			p["act"] = "stand"
			p["act_t"] = 0.0
			p["cd"] = float(B["every"])
		return
	# (left far behind, or somewhere it may not stand: by him again)
	if p["at"].distance_to(hero.world) > 14.0 or not hero.monsters.clear(p["at"].x, p["at"].y, 0.3):
		p["at"] = hero.world
	var best = null
	var bd := 1e9
	for m in hero.monsters.list:
		if not _fine(m) or not m.seen or m.state == "sleep" or m.world.distance_to(hero.world) > float(B["leash"]):
			continue
		var d: float = m.world.distance_to(p["at"]) - m.r - float(p["r"])
		if d < bd and hero.monsters.sees(p["at"], m.world):
			bd = d
			best = m
	if best != null and bd <= float(B["reach"]) and float(p["cd"]) <= 0.0:
		p["f"] = (best.world - p["at"]).normalized()
		p["act"] = "strike"
		p["act_t"] = 0.0
		p["did"] = false
		p["target"] = best
		return
	var goal: Vector2 = best.world if best != null else hero.world - hero.face * 1.4
	var stop: float = float(B["reach"]) * 0.7 + best.r + float(p["r"]) if best != null else 0.4
	var d: float = goal.distance_to(p["at"])
	if d > stop:
		var to: Vector2 = p["at"] + (goal - p["at"]) / d * minf(d - stop, float(B["speed"]) * dt)
		var moved := 0.0
		if hero.monsters.clear(to.x, to.y, minf(0.42, float(p["r"]))):
			moved = to.distance_to(p["at"])
			if moved > 0.001:
				p["f"] = (to - p["at"]) / moved
			p["at"] = to
		p["walked"] = float(p["walked"]) + moved
		p["act"] = "walk" if moved > 0.001 else "stand"
	else:
		p["act"] = "stand"


# --- THE WARRIOR'S (his greatsword's) ---

## (game.ts useBasic) THE WINDCUTTER: a Strike begun; `recent`, it follows the last soon enough to be one more in a row.
func struck_on(recent: bool) -> void:
	if wears("windcutter"):
		uq["strikes"] = int(uq["strikes"]) + 1 if recent else 1


## (game.ts release) A Strike's blow landed: every third in a row sends a blade of wind on ahead.
func strike_landed() -> void:
	if int(uq["strikes"]) >= int(ut["windcutter"]["every"]) and wears("windcutter"):
		uq["strikes"] = 0
		_wind_blade()


## (game.ts windBlade) A blade of wind flies on ahead from his third Strike in a row, through everything in its line: it carries his
## Strike's words on what it hits, and leaves nothing behind it.
func _wind_blade() -> void:
	var W: Dictionary = ut["windcutter"]
	var r: Dictionary = hero.loadout.r(0)
	var f: Vector2 = hero.face
	blades.append({"at": hero.world + f * 0.6, "v": f * float(W["speed"]), "r": float(W["half"]) * float(r["size"]), "left": float(W["range"]),
		"hit": [], "age": 0.0, "el": r["element"]})
	hero._tell({"t": "unique", "id": "windcutter", "what": "blade", "x": hero.world.x, "y": hero.world.y, "x1": hero.world.x + f.x * float(W["range"]), "y1": hero.world.y + f.y * float(W["range"]), "r": float(W["half"]) * float(r["size"])})
	hero.sfx.play("wave", linear_to_db(0.8))
	_say({"id": "windcutter", "what": "blade"})


## The blades in flight, each step: on through everything in their line, each struck once for the Windcutter's share of a Strike.
func _step_blades(dt: float) -> void:
	var W: Dictionary = ut["windcutter"]
	for b in blades:
		var step: Vector2 = b["v"] * dt
		b["at"] += step
		b["left"] = float(b["left"]) - step.length()
		b["age"] = float(b["age"]) + dt
		if hero.map != null and not hero.map.walkable(floori(b["at"].x), floori(b["at"].y)):
			b["left"] = 0.0
		for m in hero.monsters.list:
			if not _fine(m) or (b["hit"] as Array).has(m) or m.world.distance_to(b["at"]) > float(b["r"]) + m.r:
				continue
			b["hit"].append(m)
			hero.hit_monster(m, 0, float(W["share"]), false)
			_say({"id": "windcutter", "what": "cut"})
	blades = blades.filter(func(b): return float(b["left"]) > 0.0)


# --- SET 1: THE BATTLE AXE'S AND THE WARHAMMER'S ---

## (game.ts parks) GYRE: his thrown axe at the end of its flight (or where a wall ends it) stops there and spins, and does not come
## back: whether it did. No more than so many spin at once: the oldest falls.
func park_axe(p: Dictionary) -> bool:
	if not wears("gyre"):
		return false
	var G: Dictionary = ut["gyre"]
	gyres.sort_custom(func(a, b): return float(a["t"]) < float(b["t"]))
	for k in range(0, gyres.size() - int(G["most"]) + 1):
		gyres[k]["t"] = 0.0
	var at := Vector2(float(p["x"]), float(p["y"]))
	gyres.append({"at": at, "skill": int(p["skill"]), "dmg": float(p["dmg"]), "t": float(G["secs"]), "tick": 0.0, "age": float(p["age"])})
	hero._tell({"t": "unique", "id": "gyre", "what": "spin", "x": at.x, "y": at.y, "r": G["r"], "secs": G["secs"]})
	_say({"id": "gyre", "what": "spin"})
	return true


## (game.ts stepGyre) An axe spinning where its flight ended cuts everything round it every so often, and falls when its seconds are out.
func _step_gyres(dt: float) -> void:
	var G: Dictionary = ut["gyre"]
	var keep: Array = []
	for q in gyres:
		q["t"] = float(q["t"]) - dt
		q["tick"] = float(q["tick"]) - dt
		q["age"] = float(q["age"]) + dt
		if float(q["t"]) <= 0.0:
			hero._tell({"t": "unique", "id": "gyre", "what": "fall", "x": q["at"].x, "y": q["at"].y})
			_say({"id": "gyre", "what": "fall"})
			continue
		keep.append(q)
		if float(q["tick"]) <= 0.0:
			q["tick"] = float(q["tick"]) + float(G["tick"])
			var any := false
			for m in hero.monsters.list:
				if not _fine(m) or m.world.distance_to(q["at"]) > float(G["r"]) + m.r:
					continue
				hero.hit_monster(m, int(q["skill"]), float(q["dmg"]) * float(G["share"]), true)
				any = true
			if any:
				hero.sfx.play("hit", linear_to_db(0.35))
				_say({"id": "gyre", "what": "cut"})
	gyres = keep


## (game.ts tithe) RED TITHE: `m` died bleeding: its blood flies to the nearest other enemy within reach, which bleeds as hard.
func _tithe(m) -> void:
	var R: Dictionary = ut["tithe"]
	var best = null
	var bd: float = float(R["reach"])
	for o in hero.monsters.list:
		if o == m or not _fine(o):
			continue
		var d: float = o.world.distance_to(m.world) - o.r
		if d < bd:
			bd = d
			best = o
	if best == null:
		return
	var dps: float = m.bleed_dps
	var to = best
	hero._tell({"t": "unique", "id": "redtithe", "what": "throw", "x": m.world.x, "y": m.world.y, "x1": to.world.x, "y1": to.world.y, "secs": R["fly"], "mid": to.id})
	_say({"id": "redtithe", "what": "throw"})
	hero._after(float(R["fly"]), func() -> void:
		if not _fine(to):
			return
		var fresh: bool = to.bleed_t < 0.5
		to.bleed_dps = maxf(to.bleed_dps if to.bleed_t > 0.0 else 0.0, dps)
		to.bleed_t = maxf(to.bleed_t, float(R["secs"]))
		if fresh:
			hero._tell({"t": "bleedOn", "id": to.id, "m": to, "x": to.world.x, "y": to.world.y, "secs": R["secs"]})
		hero._tell({"t": "spark", "x": to.world.x, "y": to.world.y, "el": "phys", "n": 3})
		_say({"id": "redtithe", "what": "bleeds"}))


## (game.ts hammerStun) A stun of his hammer's: with Death Knell each shorter (its price), and what it stuns rings like a bell.
func hammer_stun(m, secs: float) -> void:
	var knell := wears("deathknell")
	var K: Dictionary = ut["knell"]
	m.stun_for(secs * (1.0 - float(K["shorter"])) if knell else secs)
	if not knell or m.dead or m.boss or m.stun_t <= 0.0:
		return
	var fresh: bool = m.knell_t <= 0.0
	m.knell_t = float(K["secs"])
	if fresh:
		hero._tell({"t": "unique", "id": "deathknell", "what": "ring", "x": m.world.x, "y": m.world.y, "mid": m.id, "secs": K["secs"]})
		_say({"id": "deathknell", "what": "ring"})


## (game.ts peal) DEATH KNELL: struck while it rings, `m` peals: a shockwave stuns everything round it, and those ring too.
func _peal(m) -> void:
	var K: Dictionary = ut["knell"]
	m.knell_t = 0.0
	hero._tell({"t": "unique", "id": "deathknell", "what": "peal", "x": m.world.x, "y": m.world.y, "r": K["r"], "mid": m.id})
	hero.sfx.play("slam", linear_to_db(0.5))
	var n := 0
	for o in hero.monsters.list:
		if o == m or not _fine(o) or o.world.distance_to(m.world) > float(K["r"]) + o.r:
			continue
		hammer_stun(o, float(K["stun"]))
		n += 1
	_say({"id": "deathknell", "what": "peal", "n": n})


## (game.ts useBasic) DEADWEIGHT: a Smash begun, the weight it carries; the slower its swing for it (1: as ever).
func weight_swing() -> float:
	if not wears("deadweight"):
		uq["weight_hit"] = 0
		return 1.0
	var W: Dictionary = ut["weight"]
	uq["weight_hit"] = uq["weight"]
	var slower: float = 1.0 + float(W["slower"]) * int(uq["weight"])
	uq["weight"] = int(uq["weight"]) + 1
	uq["weight_quake"] = int(uq["weight"]) >= int(W["every"])
	if uq["weight_quake"]:
		uq["weight"] = 0
	uq["weight_at"] = _clock
	hero._tell({"t": "unique", "id": "deadweight", "what": "weight", "x": hero.world.x, "y": hero.world.y, "r": int(W["every"]) if uq["weight_quake"] else uq["weight"]})
	_say({"id": "deadweight", "what": "weight", "n": uq["weight"], "quake": uq["weight_quake"]})
	return slower


## (game.ts weightQuake) The weight's last Smash, move `i`, lands at `at` as an Earthquake of its own: the ground quakes, and what
## stands on it is struck and stunned.
func weight_quake(i: int, at: Vector2, way: Vector2, frac: float) -> void:
	uq["weight_quake"] = false
	var W: Dictionary = ut["weight"]
	hero._tell({"t": "unique", "id": "deadweight", "what": "quake", "x": at.x, "y": at.y, "r": W["r"]})
	hero._tell({"t": "quake", "x": at.x, "y": at.y, "q": 0, "fx": way.x, "fy": way.y})
	hero.kick(3.0)
	hero.sfx.play("slam")
	hero._blast(i, at, float(W["r"]), frac * float(W["quake"]), "slam", false, 0.0)
	var stun: float = float(Words.skill("quake").get("stun", 0.6))
	for m in hero.monsters.list:
		if _fine(m) and m.world.distance_to(at) <= float(W["r"]) + m.r:
			hammer_stun(m, stun)
	_say({"id": "deadweight", "what": "quake"})


## (game.ts begin) STARBREAKER: an Earthquake begun calls a meteor down out of the sky over the spot the maul will come down on.
func star_fall(at: Vector2, wind: float) -> void:
	if not wears("starbreaker"):
		return
	hero._tell({"t": "unique", "id": "starbreaker", "what": "fall", "x": at.x, "y": at.y, "r": ut["star"]["r"], "secs": wind})
	_say({"id": "starbreaker", "what": "fall"})


## (game.ts meteorLands) STARBREAKER: the meteor lands as the hammer hits (`first`), and with Tremors its fire goes out again with each
## shake (`k` of it): its fire on all round it; the floor left burning.
func meteor_lands(i: int, at: Vector2, k: float, first: bool) -> void:
	var S: Dictionary = ut["star"]
	if not hero.alive:
		return
	hero._tell({"t": "unique", "id": "starbreaker", "what": "land" if first else "shake", "x": at.x, "y": at.y, "r": S["r"]})
	hero.sfx.play("fire", linear_to_db(0.9 if first else 0.6))
	if first:
		hero.kick(3.0)
	for m in hero.monsters.list:
		if _fine(m) and m.world.distance_to(at) <= float(S["r"]) + m.r:
			m.damage(hero.side(m, hero.talent_hit("fire", float(S["share"]) * k, i), i), "fire", false, false, [], false, false, i)
	if first and hero.wakes != null and is_instance_valid(hero.wakes):
		hero.wakes.add_patch(-1, "burn", at, float(S["burnR"]), float(S["burnSecs"]), hero.talent_hit("fire", float(S["burn"])), "fire")
	_say({"id": "starbreaker", "what": "land" if first else "shake"})


# --- THE RANGER'S, THE MAGE'S: what his shots cross ---

## (game.ts crossings) What a shot of his crosses on its way: THE HAIR TRIGGER, an arrow over one of his traps sets it off, harder;
## THE TUNING STAFF, a Wave through his Orb makes it pulse at once, harder (`kit`: his kit, which keeps his traps and orbs).
func crossings(p: Dictionary, kit) -> void:
	var at := Vector2(float(p["x"]), float(p["y"]))
	if p.get("look", "") == "arrow" and wears("hairtrigger") and kit.get("traps") != null:
		var G: Dictionary = ut["trigger"]
		for t in kit.traps:
			if t.has("shot") or Vector2(t["x"], t["y"]).distance_to(at) > float(G["near"]) + float(p["r"]):
				continue
			t["shot"] = float(G["mult"])
			hero._tell({"t": "unique", "id": "hairtrigger", "what": "shot", "x": t["x"], "y": t["y"]})
			_say({"id": "hairtrigger", "what": "shot"})
	if kit.has_method("tuning_cross"):
		kit.tuning_cross(p, self)


# --- THE WARLOCK'S ---

## (game.ts stepTome) THE RESTLESS TOME: it circles him, and puts his hellfire on any enemy it touches (the same not again for a moment).
func _step_tome(dt: float) -> void:
	var B: Dictionary = ut["tome"]
	var ch = hero.kit.get("change") if hero.kit != null else null
	if ch is Dictionary and not (ch as Dictionary).is_empty():
		return
	uq["tome_a"] = fmod(float(uq["tome_a"]) + TAU / float(B["turn"]) * dt, TAU)
	var at: Vector2 = hero.world + Vector2(cos(uq["tome_a"]), sin(uq["tome_a"])) * float(B["r"])
	var seen: Dictionary = uq["tome_at"]
	if seen.size() > 256:
		seen.clear()
	for m in hero.monsters.list:
		if not _fine(m) or m.world.distance_to(at) > float(B["touch"]) + m.r:
			continue
		if _clock - float(seen.get(m.id, -1e9)) < float(B["again"]):
			continue
		seen[m.id] = _clock
		if hero.kit != null and hero.kit.has_method("_hell_on"):
			hero.kit._hell_on(m, hero.talent_hit("fire", float(B["share"])))
		if m.state == "sleep":
			hero.monsters.wake(m)
		hero._tell({"t": "unique", "id": "restlesstome", "what": "touch", "x": m.world.x, "y": m.world.y, "mid": m.id})
		_say({"id": "restlesstome", "what": "touch"})
