extends Node

const _dtos := preload("res://shared/dtos.gd")
const ServerOption := preload("res://prefabs/server_option/server_option.gd")

@onready var _v_box_container: VBoxContainer = $UI/Container/VBoxContainer
@onready var _exit_button: Button = $UI/ExitButton


func _ready() -> void:
	if not GameManager.get_session_sid():
		GameManager.set_scene("auth")
	
	_get_game_servers()
	
	_exit_button.pressed.connect(_handle_exit_button_pressed)
	
	WS.message_received.connect(_handle_ws_message_received)
	WS.connection_closed.connect(_handle_ws_connection_closed)
	WS.connected_to_server.connect(_handle_ws_connected_to_server)


func _create_server_list(servers: Array[_dtos.GameServerResponse]) -> void:
	for child in _v_box_container.get_children():
		_v_box_container.remove_child(child)
	
	for server in servers:
		var serverOption := ServerOption.instantiate(server, _handle_enter_button_pressed.bind(server.url))
		
		_v_box_container.add_child(serverOption)


func _get_game_servers() -> void:
	Api.get_data("/v1/game-servers", _handle_game_servers_request_completed)


func _handle_game_servers_request_completed(response: Api.ResponseData) -> void:
	if response.ok() and typeof(response.get_body()) == TYPE_ARRAY:
		var servers: Array[_dtos.GameServerResponse] = []
		for item in response.get_body():
			servers.append(_dtos.GameServerResponse.from(item))
		_create_server_list(servers)
	else:
		print("falha ao buscar servidores")


func _handle_ws_connected_to_server() -> void:
	var message := _dtos.WebsocketMessage.new()
	
	message.type = _dtos.WebsocketEvents.LOGIN
	message.data = { "sid": GameManager.get_session_sid() }
	
	WS.send(message)


func _handle_ws_message_received(message: _dtos.WebsocketMessage):
	if message == null:
		return
	
	if message.type == _dtos.WebsocketEvents.OK_RESPONSE:
		var cid := ""
		
		if typeof(message.data) == TYPE_DICTIONARY:
			cid = message.data.get("clientId", "")
		
		GameManager.set_session_client_id(cid)
		GameManager.set_scene("character_selection")
	elif message.type == _dtos.WebsocketEvents.DENY_RESPONSE:
		GameManager.set_scene("server_list")


func _handle_ws_connection_closed() -> void:
	GameManager.set_scene("server_list")


func _handle_enter_button_pressed(url: String) -> void:
	WS.clear()
	WS.connect_to_url(url)


func _handle_exit_button_pressed() -> void:
	GameManager.set_session_sid("")
	GameManager.set_scene("auth")
