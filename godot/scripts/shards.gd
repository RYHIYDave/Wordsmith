## THE TABLET'S SHARDS (game/endless_key.ts; game.ts quarterBossDown, quarterTaken; render.ts its picture as it lies). His idea, 7
## Nov 2026: in endless mode the bosses of floors 5, 10, 15 and 20 each drop a quarter of a round stone tablet; the four, set into
## the wordsmith's bench, open a portal to a final boss. His picks: a quarter drops “Always, if you lack it (Recommended)”; the
## tablet is “Used up, collect again (Recommended)”; a fallen hero's are “Kept in the shared stash”; their name “Tablet Shard”.
##   THE DROP   the boss of an endless level on floor 5, 10, 15 or 20 fallen: if the account lacks that one (main.gd quarters) and
##              none lies there already, it lies a little nearer the eye than where he fell, its item picture (art/endless_tablet.ts
##              paintQuarter, tools/godot_rim.ts `quarter|k`) bobbing, its name over it in the uniques' orange.
##   TAKEN      by walking up to it, as the quests' pieces are: the account's from then ("A Tablet Shard. 2 of 4 (kept with the
##              stash)."; "SHARD 2 / 4" over him).
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Loot := preload("res://scripts/loot.gd")
const DIR := "res://assets/rim/"
## (render.ts RARITY_COLOR[QUARTER_RARITY]: a unique's)
const ORANGE := Color("#ff8a3a")
const WAIT := 0.5
const PULL := 1.6
const TAKE := 0.5
const FLY := 6.0

var main
var P: Dictionary = {}
var _sheet: Texture2D
var _things: Array = []


func _ready() -> void:
	P = JSON.parse_string(FileAccess.get_file_as_string(DIR + "pics.json"))
	_sheet = load(DIR + "pics.png")


## A place come into: what lay on the last is gone with it.
func enter() -> void:
	_things = []


## (game.ts quarterBossDown) The boss of an endless level fallen: his shard, if it is his floor's and the account lacks it.
func boss_down(m) -> void:
	if not main.in_endless or not m.boss or main.map == null:
		return
	var k := -1
	var floors: Array = P["key"]["floors"]
	# (only the bosses of floors 5, 10, 15 and 20: his word, 25 Nov 2026, of any boss dropping one: “Wait no I want that to stay on
	# just the 5,10,15, and 20 bosses”)
	for i in floors.size():
		if int(floors[i]) == int(main.map.depth):
			k = i
	if k < 0 or (int(main.quarters) & (1 << k)) != 0 or not _things.is_empty():
		return
	var at: Vector2 = main._free_near(m.world + Vector2(0.8, 0.8))
	lay(k, at)


func lay(k: int, at: Vector2) -> void:
	var node := Node2D.new()
	node.position = Iso.to_screen(at.x, at.y)
	var s := Sprite2D.new()
	s.texture = _sheet
	s.region_enabled = true
	s.centered = false
	var q: Array = P["pics"]["quarter|%d" % k]
	s.region_rect = Rect2(q[0], q[1], q[2], q[3])
	s.offset = -Vector2(q[4], q[5]) + Vector2(0, -8)
	node.add_child(s)
	var label = Loot._Tag.new()
	label.text = str(P["key"]["text"]["label"])
	label.color = ORANGE
	label.z_index = 60
	node.add_child(label)
	main.hero.get_parent().add_child(node)
	_things.append({"k": k, "at": at, "node": node, "pic": s, "age": 0.0})


func _process(dt: float) -> void:
	if main == null or main.hero == null:
		return
	var h = main.hero
	var keep: Array = []
	for t in _things:
		if not is_instance_valid(t["node"]):
			continue
		t["age"] = float(t["age"]) + dt
		# (it bobs as it lies: render.ts `bob`)
		t["pic"].position.y = -roundf(sin(float(t["age"]) * 3.0) * 2.0)
		var took := false
		if h.alive and float(t["age"]) >= WAIT:
			if t["at"].distance_to(h.world) <= PULL:
				t["at"] = t["at"].move_toward(h.world, FLY * dt)
				t["node"].position = Iso.to_screen(t["at"].x, t["at"].y)
			took = t["at"].distance_to(h.world) <= TAKE
		if took:
			t["node"].queue_free()
			taken(int(t["k"]))
		else:
			keep.append(t)
	_things = keep


## (game.ts quarterTaken) A shard taken: the account's from now (kept with the stash).
func taken(k: int) -> void:
	main.quarters = (int(main.quarters) | (1 << k)) & 15
	var n := 0
	for i in 4:
		if (int(main.quarters) & (1 << i)) != 0:
			n += 1
	main.sfx.play("rare")
	main.loot.say("A Tablet Shard. %d of 4 (kept with the stash)." % n, Loot.MSG_QUEST)
	main.fx.float_text(main.hero.world.x, main.hero.world.y, "SHARD %d / 4" % n, ORANGE)
