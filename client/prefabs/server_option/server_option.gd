extends BoxContainer

const _dtos := preload("res://shared/dtos.gd")

const ServerOption := preload("res://prefabs/server_option/server_option.gd")
const Scene := preload("res://prefabs/server_option/server_option.tscn")

@onready var _name: Label = $Name
@onready var _region: Label = $Region
@onready var _enter_button: Button = $EnterButton

var server_name: String
var server_region: String
var server_url: String
var on_button_pressed: Callable

static func instantiate(server: _dtos.GameServerResponse, on_pressed: Callable) -> ServerOption:
	var server_option := Scene.instantiate()
	
	server_option.server_name = server.name
	server_option.server_region = server.region
	server_option.server_url = server.url
	server_option.on_button_pressed = on_pressed
	
	return server_option


func _ready() -> void:
	_name.text = server_name
	_region.text = server_region
	
	_enter_button.pressed.connect(on_button_pressed)
