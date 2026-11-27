## THE MAP'S ICONS, PICTURED (minimap.gd MAP_ICONS; his pick, 27 Nov 2026: “Icons for what you find”): `--only=mapicons --shots=<dir>`.
## On floor 7 (its strongholds, chests, the waypoint) and floor 13 (the Bells), all of it seen, monsters awake about him: the small
## map and the large one with the switch off (as it is) and on. Pictures: map_<floor>_<off|on>_small.png, map_<floor>_<off|on>_large.png.
extends RefCounted

const Mini := preload("res://scripts/minimap.gd")


func run(M, h, dir: String) -> void:
	h.unhurt = true
	for f in [7, 13]:
		await M.go_to("floor%d" % f, "down")
		await M._wait(1.2)
		# (all of the floor's ground seen, and what stands about it, as a player who has walked it all sees it)
		var s = M.sight
		var mp = M.map
		if s != null:
			for ty in mp.h:
				for tx in mp.w:
					var near := false
					for dy in range(-2, 3):
						for dx in range(-2, 3):
							if mp.walkable(tx + dx, ty + dy):
								near = true
					if near:
						s.explored[ty * mp.w + tx] = 1
		# (stood by the first stronghold's gate, where there is one)
		if M.holds != null and not M.holds.data.get("holds", []).is_empty():
			var q: Dictionary = M.holds.data["holds"][0]
			h.world = Vector2(float(q["gx"]) + 0.5, float(q["gy"]) + 5.5)
			h._place()
			await M._wait(0.6)
		# (a boss and a rare one seen, near enough to show on the small map)
		var near := 0
		for m in M._monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) < 30.0:
				m.seen = true
				m.state = "hunt" if near < 6 else m.state
				near += 1
		for on in [false, true]:
			Mini.MAP_ICONS = on
			M._mini.show_panel("")
			await M._wait(0.4)
			M._snap(dir + "/map_%d_%s_small.png" % [f, "on" if on else "off"])
			await M._wait(0.2)
			M._mini.show_panel("map")
			await M._wait(0.4)
			M._snap(dir + "/map_%d_%s_large.png" % [f, "on" if on else "off"])
			await M._wait(0.2)
			M._mini.show_panel("")
	Mini.MAP_ICONS = true
	print("MAPICONS DONE")
