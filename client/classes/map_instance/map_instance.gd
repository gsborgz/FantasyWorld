class_name MapInstance
extends Node2D

const _dtos := preload("res://shared/dtos.gd")

var _ui: UI
var _world: Node2D
var _players: Dictionary[String, Character] = {}


func init_instance(ui: UI, world: Node2D) -> void:
	assert(ui and world, "You must inform UI and World nodes in init_instance")
	
	_ui = ui
	_world = world
	
	WS.message_received.connect(_main_handle_ws_message_received)
	
	_send_join_instance_message()


# Handlers
func _main_handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	if message.type == _dtos.WebsocketEvents.UPDATE_POSITION:
		_on_update_position(_dtos.ClientCharacter.from(message.data))
	elif message.type == _dtos.WebsocketEvents.JOIN_INSTANCE:
		_on_join_instance(_dtos.ClientCharacter.from(message.data))
	elif message.type == _dtos.WebsocketEvents.INSTANCE_LEFT:
		_on_instance_left(_dtos.ClientCharacter.from(message.data))
	else:
		_handle_ws_message_received(message)


func _handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	pass


func _send_join_instance_message() -> void:
	var message = _dtos.WebsocketMessage.new()
	
	message.type = _dtos.WebsocketEvents.JOIN_INSTANCE
	message.data = GameManager.get_client_character()
	
	WS.send(message)


func _on_update_position(character: _dtos.ClientCharacter) -> void:
	pass


func _on_join_instance(character: _dtos.ClientCharacter) -> void:
	print(character.id)
	print(GameManager.get_client_character().id)
	pass


func _on_instance_left(character: _dtos.ClientCharacter) -> void:
	pass
