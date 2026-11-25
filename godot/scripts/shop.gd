## THE HEROES FOR SALE (the app's in-app purchases): the Warlock, the Tinkerer and the Brawler, each bought once for $0.99 and
## kept for good, on every save. His words, 25 Nov 2026: “I want the sell the warlock, tinkerer and brawler for $0.99”; asked
## whether to start on them, his pick: “Yes, start them (Recommended)”.
##   PAID_HEROES: on at his yes to the pictures (docs/mockups/paid_heroes/), 25 Nov 2026: “Yes, that's good (Recommended)”, and
## to the price, “$0.99 each (Recommended)”. A hero for sale and not bought is locked on the class cards (class_cards.gd): a
## padlock and the price on its card, and, chosen, BUY in place of CONFIRM.
##   WHERE THEY ARE SOLD: in the Android app, through Google Play (Google's own purchase sheet; Google takes the payment, the game
## never sees it). Where there is no shop to buy them from (a build with no Google Play: the computer, the checks), nothing is
## locked, unless the stand-in shop is asked for (`--shop=fake`, for the checks and pictures: a purchase goes through at once).
##   WHAT IS OWNED is kept on the device (user://owned.cfg) and asked of Google Play again each time the game starts, so a hero
## bought on one phone is the player's on another, and a refund takes it back.
extends Node

## (what is owned, or the prices, changed: the cards drawn again)
signal changed
## (a purchase went through: the class bought)
signal bought(cls: String)

const PAID_HEROES := true
const FOR_SALE := ["warlock", "tinkerer", "brawler"]
## (the price shown until Google Play gives its own, in the player's money)
const PRICE := "$0.99"
const KEEP := "user://owned.cfg"

## (the shop is open: the switch on, and a shop to buy from)
var on := false
## class -> true, bought
var owned := {}
## class -> the price as Google Play shows it to this player ("$0.99", "0,99 €")
var prices := {}
## (the class whose purchase is under way, or "")
var busy := ""
## (the stand-in shop of the checks)
var fake := false
## (Google Play: play_shop.gd, on Android with the billing plugin; else null)
var play = null


## The Play product id of a class (as set up in the Play Console: Monetize, In-app products).
static func product(cls: String) -> String:
	return "hero_" + cls


static func class_of(product_id: String) -> String:
	return product_id.trim_prefix("hero_")


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_load()
	var main = get_parent()
	var want: bool = PAID_HEROES or (main != null and main.has_method("_arg") and main._arg("paid") == "1")
	fake = main != null and main.has_method("_arg") and str(main._arg("shop")) == "fake"
	if fake:
		on = want
		if main._arg("owned") != "":
			owned = {}
			for c in main._arg("owned").split(","):
				owned[c] = true
		return
	if want and OS.get_name() == "Android":
		var P = load("res://scripts/play_shop.gd")
		if P != null:
			play = P.new()
			if play.start(self):
				on = true
			else:
				play = null


## Whether a class is for sale and not yet bought (so locked on the cards).
func locked(cls: String) -> bool:
	return on and FOR_SALE.has(cls) and not owned.has(cls)


func price(cls: String) -> String:
	return str(prices.get(cls, PRICE))


## Buy a class: Google Play's purchase sheet comes up; the cards hear `bought` (or `changed`, if it was let go) when it is done.
func buy(cls: String) -> void:
	if not locked(cls) or busy != "":
		return
	busy = cls
	changed.emit()
	if fake:
		await get_tree().create_timer(0.4, true, false, true).timeout
		_grant(cls)
		return
	if play == null or not play.buy(cls):
		busy = ""
		changed.emit()


## (from Google Play: a purchase let go, or one that failed)
func let_go() -> void:
	busy = ""
	changed.emit()


## (from Google Play: a class is the player's)
func _grant(cls: String) -> void:
	var fresh := not owned.has(cls)
	owned[cls] = true
	if busy == cls:
		busy = ""
	_save()
	changed.emit()
	if fresh:
		bought.emit(cls)


## (from Google Play, as the game starts: what the player owns now; a class refunded is taken back)
func _owned_now(classes: Array) -> void:
	var now := {}
	for c in classes:
		now[c] = true
	if now != owned:
		owned = now
		_save()
		changed.emit()


func _load() -> void:
	var cf := ConfigFile.new()
	if cf.load(KEEP) == OK:
		for c in cf.get_value("owned", "classes", []):
			owned[str(c)] = true


func _save() -> void:
	if fake:
		return
	var cf := ConfigFile.new()
	cf.set_value("owned", "classes", owned.keys())
	cf.save(KEEP)
