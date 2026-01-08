class_name MapInstance
extends Node2D

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

var _ui: UI
var _world: Node2D
var _players: Dictionary[String, Player] = {}


# Functions
func set_ui_node(ui: UI) -> void:
	_ui = ui


func set_world_node(world: Node2D) -> void:
	_world = world


func init_instance() -> void:
	WS.message_received.connect(_main_handle_ws_message_received)
	
	_join_instance()
	_init_player_character()


func _join_instance() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	var data := _dtos.JoinInstanceRequest.new()
	var current := GameManager.get_player_character()
	
	if current == null or not is_instance_valid(current):
		return
	
	data.instancePath = current.instancePath
	data.x = current.x
	data.y = current.y
	data.direction = current.direction
	
	message.type = _ws_utils.WebsocketEvents.JOIN_INSTANCE
	message.data = data
	
	WS.send(message)


func _init_player_character() -> void:
	var player = GameManager.get_player_character()
	
	if player == null or not is_instance_valid(player):
		return
	
	var parent := player.get_parent()
	if parent != null:
		parent.remove_child(player)
	
	_world.add_child(player)
	_players[player.player_id] = player
	player.update_camera_limits()
	player.send_update_position_message()


func _add_player(character: _dtos.ClientCharacter) -> void:
	if _players.has(character.id):
		return
	
	var player: Player = Player.instantiate(character, false)
	
	_players[player.player_id] = player
	_world.add_child(player)


func _update_player(character: _dtos.ClientCharacter) -> void:
	var player: Player = _players.get(character.id)
	
	if player == null:
		_add_player(character)
	else:
		player.apply_remote_update(character)


func _remove_player(character: _dtos.ClientCharacter) -> void:
	var player: Player = _players.get(character.id)
	
	if player != null:
		_players.erase(player.player_id)
		player.queue_free()


# Handlers
func _main_handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.UPDATE_POSITION:
		_update_player(_dtos.ClientCharacter.from(message.data))
	elif message.type == _ws_utils.WebsocketEvents.JOIN_INSTANCE:
		_add_player(_dtos.ClientCharacter.from(message.data))
	elif message.type == _ws_utils.WebsocketEvents.INSTANCE_LEFT:
		_remove_player(_dtos.ClientCharacter.from(message.data))
	else:
		_handle_ws_message_received(message)

@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	pass
