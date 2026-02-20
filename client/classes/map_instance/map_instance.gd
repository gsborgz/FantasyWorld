class_name MapInstance
extends Node2D

const _dtos := preload("res://shared/dtos.gd")

var _instance_name: String
var _ui: UI
var _world: Node2D
var _userCharacters: Dictionary[String, Character] = {}


func init_instance() -> void:
	assert(_instance_name, "You must set instance_name")
	assert(_ui and _world, "You must inform UI and World nodes in init_instance")
	
	WS.message_received.connect(_main_handle_ws_message_received)
	
	_send_join_instance_message()


func _main_handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	if message.type == _dtos.WebsocketEvents.UPDATE_POSITION:
		_handle_update_position(_dtos.ClientCharacter.from(message.data))
	elif message.type == _dtos.WebsocketEvents.JOIN_INSTANCE:
		_handle_join_instance(_dtos.ClientCharacter.from(message.data))
	elif message.type == _dtos.WebsocketEvents.LEFT_INSTANCE:
		_handle_instance_left(_dtos.ClientCharacter.from(message.data))
	else:
		_handle_ws_message_received(message)


func _handle_join_instance(character: _dtos.ClientCharacter) -> void:
	if _userCharacters.has(character.id):
		return
	
	_add_character(character)


func _handle_update_position(character: _dtos.ClientCharacter) -> void:
	if !_userCharacters.has(character.id) or character.id == GameManager.get_client_character().id:
		return
	
	_userCharacters[character.id].update_remote_position(character)


func _handle_instance_left(character: _dtos.ClientCharacter) -> void:
	if !_userCharacters.has(character.id):
		return
	
	_remove_character(character)


@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	pass


func _send_join_instance_message() -> void:
	var message = _dtos.WebsocketMessage.new()
	var client_char = GameManager.get_client_character()
	
	client_char.instancePath = _instance_name
	
	message.type = _dtos.WebsocketEvents.JOIN_INSTANCE
	message.data = client_char
	
	WS.send(message)


func _add_character(character: _dtos.ClientCharacter) -> void:
	var userChar = Character.instantiate(character)
	
	_userCharacters[character.id] = userChar
	_world.add_child(userChar)
	
	userChar.set_movement_enabled(true)


func _remove_character(character: _dtos.ClientCharacter) -> void:
	_world.remove_child(_userCharacters[character.id])
	_userCharacters[character.id].queue_free()
	_userCharacters.erase(character.id)
