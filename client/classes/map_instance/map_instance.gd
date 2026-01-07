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
	
	_ui.setChatPlayers(_players)
	# Primeiro pede para entrar na instância correta (usa Session.instancePath atualizado)
	_join_instance()
	# Depois adiciona o player local usando os dados da Session
	_add_player(Session.getCharacter())


func _join_instance() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	var data := _dtos.JoinInstanceRequest.new()
	
	data.instancePath = Session.getCharacter().instancePath
	
	message.type = _ws_utils.WebsocketEvents.JOIN_INSTANCE
	message.data = data
	
	WS.send(message)


func _add_player(character: _dtos.ClientCharacter) -> void:
	if _players.has(character.id):
		return
	
	var is_player := Session.getCharacter().id == character.id
	var player: Player = Player.instantiate(character, is_player)
	
	_players[player.player_id] = player
	
	_world.add_child(player)
	_ui.setChatPlayers(_players)
	
	if is_player:
		player.update_camera_limits()
		# Envia uma atualização inicial de posição após o JOIN para fixar o spawn no servidor
		player.send_update_position_message()


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
	
	_ui.setChatPlayers(_players)


# Handlers
func _main_handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.UPDATE_POSITION:
		_update_player(_dtos.ClientCharacter.from(message.data))
	elif message.type == _ws_utils.WebsocketEvents.INSTANCE_LEFT:
		_remove_player(_dtos.ClientCharacter.from(message.data))
	else:
		_handle_ws_message_received(message)

@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	pass
