## THE BOTTOM OF THE SHAFT: THE WARPED WORDSMITH'S ARENA (game/final_arena.ts; game.ts enterArena, updateArena): endless mode's final
## boss, below the landing at the Shaft's Rim once the four shards are set in the bench. Its layout and the boss as the game spawns
## him there assets/final (tools/godot_final.ts), its look recorded whole (tools/godot_record.mjs final).
##   COMING DOWN   in the portal's light at its near side ("The Bottom of the Shaft", ENDLESS N, HARDCORE); the boss waits on his
##                 boar across the floor, facing him: he wakes as the hero comes near, or FINAL_WAKE (2.5 s) after he has come down.
##   AN ENDLESS LEVEL to the rest of the game: the boss as strong as the level reached (main.gd endless_strength); a death the hero's
##                 end. Walkable to its edge, held off the rubble by its round.
##   WON           "The Warped Wordsmith is undone."; the landing above closes behind him (the tablet used up: his pick, “Used up,
##                 collect again (Recommended)”). FINAL_WAY_UP (2 s) after: "The light above is open: stand in it to go back up.";
##                 stood in it FINAL_UP_HOLD (0.8 s) (one only walking through it as he gathers what was left stays), back at the Rim.
extends Node

var main
var hero
var monsters
var D: Dictionary = {}
var t := 0.0
var won := false
var won_t := 0.0
var _armed := false
var _up := 0.0
var _gone := false
const NEAR := 0.7


func _process(dt: float) -> void:
	if main == null or hero == null or monsters == null:
		return
	t += dt
	var boss = null
	for m in monsters.list:
		if is_instance_valid(m) and m.kind == "wsboss":
			boss = m
	if boss != null and not boss.dead and boss.state == "sleep" and t >= float(D.get("wake", 2.5)):
		monsters.wake(boss)
	var alive: bool = boss != null and not boss.dead
	if not alive and not won:
		won = true
		won_t = 0.0
		_armed = false
		_up = 0.0
		main.final_open = false
		main.loot.say(str(D["text"]["won"]), Color("#8af078"))
	if not won or _gone:
		return
	var was := won_t
	won_t += dt
	var up: float = float(D.get("wayUp", 2.0))
	if was < up and won_t >= up:
		main.loot.say(str(D["text"]["up"]), main.loot.MSG_QUEST)
		main.sfx.play("portal")
	var at := Vector2(float(D["arrive"]["x"]), float(D["arrive"]["y"]))
	if hero.world.distance_to(at) >= NEAR:
		_armed = true
		_up = 0.0
	elif won_t >= up and _armed:
		_up += dt
	if _up >= float(D.get("upHold", 0.8)) and hero.alive and not main._going:
		_gone = true
		main.go_to(main.home_place(), "start")
