class_name MapInstance
extends Node2D

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

var _ui: UI
var _world: Node2D
var _players: Dictionary[String, Character] = {}


func init_instance(ui: UI, world: Node2D) -> void:
	assert(ui and world, "You must inform UI and World nodes in init_instance")
	
	_ui = ui
	_world = world
	
	WS.message_received.connect(_main_handle_ws_message_received)


# Handlers
func _main_handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.UPDATE_POSITION:
		_on_update_position(_dtos.ClientCharacter.from(message.data))
	elif message.type == _ws_utils.WebsocketEvents.JOIN_INSTANCE:
		_on_join_instance(_dtos.ClientCharacter.from(message.data))
	elif message.type == _ws_utils.WebsocketEvents.INSTANCE_LEFT:
		_on_instance_left(_dtos.ClientCharacter.from(message.data))
	else:
		_handle_ws_message_received(message)


@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	pass


func _on_update_position(character: _dtos.ClientCharacter) -> void:
	pass


func _on_join_instance(character: _dtos.ClientCharacter) -> void:
	pass


func _on_instance_left(character: _dtos.ClientCharacter) -> void:
	pass

