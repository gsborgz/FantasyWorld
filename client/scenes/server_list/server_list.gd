extends Node

const _gs := preload("res://shared/game-server.gd")
const ServerOption := preload("res://prefabs/server_option/server_option.gd")

@onready var _v_box_container: VBoxContainer = $UI/VBoxContainer


func _ready() -> void:
	HTTP.get_data("http://localhost:3000/v1/game-servers", _on_game_servers_request_completed)


@warning_ignore("unused_parameter")
func _on_game_servers_request_completed(result, response_code, headers, body) -> void:
	var parsed = JSON.parse_string(body.get_string_from_utf8())

	if parsed == null:
		print("falha ao interpretar resposta de servidores")
		return

	if response_code == 200 and typeof(parsed) == TYPE_ARRAY:
		var servers: Array[_gs.GameServerInfo] = []
		for item in parsed:
			if typeof(item) == TYPE_DICTIONARY:
				var info := _gs.GameServerInfo.new(
					item.get("name", ""),
					item.get("location", ""),
					item.get("url", ""),
					item.get("status", null)
				)
				servers.append(info)
		_create_server_list(servers)
	else:
		print("falha ao buscar servidores")


func _create_server_list(servers: Array[_gs.GameServerInfo]) -> void:
	for server in servers:
		var serverOption := ServerOption.instantiate(server.name, server.location, server.status, server.url)
		
		_v_box_container.add_child(serverOption)
