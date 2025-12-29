extends BoxContainer

const ServerOption := preload("res://prefabs/server_option/server_option.gd")
const Scene := preload("res://prefabs/server_option/server_option.tscn")
const _ws_utils := preload("res://shared/ws-utils.gd")

@onready var _sever_name: Label = $SeverName
@onready var _enter_button: Button = $EnterButton
@onready var _server_status: Label = $ServerStatus

var server_name: String
var server_location: String
var server_url: String
var server_status: String


@warning_ignore("shadowed_variable")
static func instantiate(server_name: String, server_location: String, server_status: String, server_url: String) -> ServerOption:
	var server_option := Scene.instantiate()
	
	server_option.server_name = server_name
	server_option.server_location = server_location
	server_option.server_status = server_status
	server_option.server_url = server_url
	
	return server_option


func _ready() -> void:
	_sever_name.text = server_name
	_server_status.text = server_status
	
	if server_status == 'offline':
		_enter_button.disabled = true
	else:
		_enter_button.disabled = false
		_enter_button.pressed.connect(_on_enter_button_pressed)

	# Conecta sinais do WS apenas uma vez
	if not WS.connected_to_server.is_connected(_on_ws_connected_to_server):
		WS.connected_to_server.connect(_on_ws_connected_to_server)
	if not WS.connection_closed.is_connected(_on_ws_connection_closed):
		WS.connection_closed.connect(_on_ws_connection_closed)
	if not WS.message_received.is_connected(_on_ws_packet_received):
		WS.message_received.connect(_on_ws_packet_received)


func _on_enter_button_pressed() -> void:
	WS.connect_to_url("ws://localhost:8080/ws")


func _on_ws_packet_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.OK_RESPONSE:
		_on_ok_response_received()
	elif message.type == _ws_utils.WebsocketEvents.DENY_RESPONSE:
		_on_deny_response_received()


func _on_ok_response_received() -> void:
	GameManager.set_scene("character_selection")


func _on_deny_response_received() -> void:
	GameManager.set_scene("server_list")


func _on_ws_connected_to_server() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	
	message.type = _ws_utils.WebsocketEvents.LOGIN_REQUEST
	message.data = {
		"sid" = Session.getId()
	}
	
	WS.send(message)


func _on_ws_connection_closed() -> void:
	GameManager.set_scene("server_list")
	
