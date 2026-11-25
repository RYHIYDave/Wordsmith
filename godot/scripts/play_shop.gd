## GOOGLE PLAY, FOR THE HEROES FOR SALE (shop.gd): Google's billing library, through Godot's own plugin for it (godot-sdk-integrations
## godot-google-play-billing, 3.3.0: its BillingClient, a Node over the plugin's Android side, Google's billing-ktx 9.1.0), in
## the Android app only. The plugin is put into godot/addons/ by the
## Android build (.github/workflows/android.yml); this script is loaded only on Android, where it is there.
##   As the game starts: connect; ask the prices of the three heroes (one-time products hero_warlock, hero_tinkerer, hero_brawler)
## and what the player owns (a hero bought on another phone, or before a reinstall, is theirs again; a refund takes it back).
## BUY: Google Play's own purchase sheet; bought, the purchase is acknowledged (Google refunds one left unacknowledged three days)
## and the hero is the player's. A purchase still pending (paid in cash at a shop, say) unlocks once it goes through.
extends RefCounted

var shop  # shop.gd
var client  # BillingClient (addons/GodotGooglePlayBilling/BillingClient.gd)
## (BillingClient's own numbers: ProductType.INAPP, PurchaseState.PURCHASED, BillingResponseCode.OK)
const INAPP := 0
const PURCHASED := 1
const OK := 0
var _ready := false
## (product id -> its details, needed to buy it)
var _details := {}


## Connect to Google Play; false when the plugin is not in this build.
func start(s) -> bool:
	shop = s
	var BC = _client_script()
	if BC == null:
		return false
	client = BC.new()
	if client is Node:
		shop.add_child(client)
	client.connected.connect(_on_connected)
	client.disconnected.connect(func() -> void: _ready = false)
	client.connect_error.connect(func(_code, _msg) -> void: _ready = false)
	client.query_product_details_response.connect(_on_details)
	client.query_purchases_response.connect(_on_owned)
	client.on_purchase_updated.connect(_on_bought)
	client.acknowledge_purchase_response.connect(func(_r) -> void: pass)
	client.start_connection()
	return true


func _client_script():
	var p := "res://addons/GodotGooglePlayBilling/BillingClient.gd"
	return load(p) if ResourceLoader.exists(p) else null


func _products() -> PackedStringArray:
	return PackedStringArray(shop.FOR_SALE.map(func(c): return shop.product(c)))


func _ok(r: Dictionary) -> bool:
	return int(r.get("response_code", -1)) == OK


func _on_connected() -> void:
	_ready = true
	client.query_product_details(_products(), _inapp())
	client.query_purchases(_inapp())


func _inapp() -> int:
	return INAPP


## The prices, in the player's own money.
func _on_details(r: Dictionary) -> void:
	if not _ok(r):
		return
	for d in r.get("product_details", []):
		var id := str(d.get("product_id", ""))
		_details[id] = d
		var price := _price_in(d)
		if price != "":
			shop.prices[shop.class_of(id)] = price
	shop.changed.emit()


## (the product's price as Google Play shows it to this player, wherever in its details it is: its one-time offer's
## formatted_price)
func _price_in(v) -> String:
	if v is Dictionary:
		if v.has("formatted_price"):
			return str(v["formatted_price"])
		for k in v:
			var f := _price_in(v[k])
			if f != "":
				return f
	elif v is Array:
		for x in v:
			var f := _price_in(x)
			if f != "":
				return f
	return ""


## What the player owns now (as the game starts).
func _on_owned(r: Dictionary) -> void:
	if not _ok(r):
		return
	var mine: Array = []
	for p in r.get("purchases", []):
		for c in _take(p):
			mine.append(c)
	shop._owned_now(mine)


## A purchase made, let go, or failed.
func _on_bought(r: Dictionary) -> void:
	if not _ok(r):
		shop.let_go()
		return
	var got := false
	for p in r.get("purchases", []):
		for c in _take(p):
			shop._grant(c)
			got = true
	if not got:
		shop.let_go()


## The heroes a purchase gives, once paid (acknowledged if it was not yet).
func _take(p: Dictionary) -> Array:
	if int(p.get("purchase_state", 0)) != PURCHASED:
		return []
	if not bool(p.get("is_acknowledged", p.get("acknowledged", false))):
		client.acknowledge_purchase(str(p.get("purchase_token", "")))
	var out: Array = []
	var ids = p.get("product_ids", p.get("products", [p.get("product_id", "")]))
	for id in ids:
		var c: String = shop.class_of(str(id))
		if shop.FOR_SALE.has(c):
			out.append(c)
	return out


## Google Play's purchase sheet for a class; false if it cannot be brought up now.
func buy(cls: String) -> bool:
	var id: String = shop.product(cls)
	if not _ready or not _details.has(id):
		if _ready:
			client.query_product_details(_products(), _inapp())
		return false
	var r = client.purchase(id)
	return r is Dictionary and (r.is_empty() or _ok(r))
