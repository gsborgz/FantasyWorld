extends Node

const _dtos := preload("res://shared/dtos.gd")
const ServerOption := preload("res://prefabs/server_option/server_option.gd")
const _ws_utils := preload("res://shared/ws-utils.gd")

@onready var _v_box_container: VBoxContainer = $UI/VBoxContainer


func _ready() -> void:
	Api.get_data("/v1/game-servers", _on_game_servers_request_completed)

	# Conecta sinais globais do WS apenas uma vez por cena
	if not WS.message_received.is_connected(_on_ws_packet_received):
		WS.message_received.connect(_on_ws_packet_received)
	if not WS.connection_closed.is_connected(_on_ws_connection_closed):
		WS.connection_closed.connect(_on_ws_connection_closed)


func _on_game_servers_request_completed(response: Api.ResponseData) -> void:
	if response.ok() and typeof(response.get_body()) == TYPE_ARRAY:
		var servers: Array[_dtos.GameServerResponse] = []
		
		for item in response.get_body():
			if typeof(item) == TYPE_DICTIONARY:
				var info := _dtos.GameServerResponse.new(
					item.get("name", ""),
					item.get("location", ""),
					item.get("url", ""),
					item.get("status", null)
				)
				servers.append(info)
		_create_server_list(servers)
	else:
		print("falha ao buscar servidores")


func _create_server_list(servers: Array[_dtos.GameServerResponse]) -> void:
	for server in servers:
		var serverOption := ServerOption.instantiate(server.name, server.location, server.status, server.url)
		
		_v_box_container.add_child(serverOption)


func _on_ws_packet_received(message: _ws_utils.WebsocketMessage):
	if message == null:
		return
	if message.type == _ws_utils.WebsocketEvents.OK_RESPONSE:
		var cid := ""
		if typeof(message.data) == TYPE_DICTIONARY:
			cid = message.data.get("clientId", "")
		Session.setClientId(cid)
		GameManager.set_scene("character_selection")
	elif message.type == _ws_utils.WebsocketEvents.DENY_RESPONSE:
		GameManager.set_scene("server_list")


func _on_ws_connection_closed() -> void:
	GameManager.set_scene("server_list")
