## (THE ANDROID BUILD'S CHECK, .github/workflows/android.yml: with Google's billing plugin in godot/addons/, play_shop.gd is read
## and must load; run as `godot --headless --path godot --script res://scripts/ci_play_shop.gd`.)
extends SceneTree


func _init() -> void:
	var s = load("res://scripts/play_shop.gd")
	var ok: bool = s != null and s.can_instantiate()
	print("PLAY_SHOP loads: %s" % ok)
	if ok:
		var p = s.new()
		print("PLAY_SHOP made: %s" % (p != null))
	quit(0 if ok else 1)
