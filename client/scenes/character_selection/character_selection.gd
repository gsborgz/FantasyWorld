extends Node

const _dtos := preload("res://shared/dtos.gd")

const CharacterOption := preload("res://prefabs/character_option/character_option.gd")

@onready var h_box_container: HBoxContainer = $UI/HBoxContainer
@onready var _new_character_button: Button = $UI/Buttons/NewCharacterButton
@onready var _exit_button: Button = $UI/Buttons/ExitButton


func _ready() -> void:
	WS.message_received.connect(_handle_ws_message_received)
	_new_character_button.pressed.connect(_handle_new_character_button_pressed)
	_exit_button.pressed.connect(_handle_exit_button_pressed)
	_get_characters()


func _get_characters() -> void:
	var message := _dtos.WebsocketMessage.new()
	
	message.type = _dtos.WebsocketEvents.LIST_CHARACTERS
	
	WS.send(message)


func _list_characters(data: Array[_dtos.ClientCharacter]) -> void:
	for child in h_box_container.get_children():
		h_box_container.remove_child(child)
	
	for character in data:
		var option := CharacterOption.instantiate(character)
		h_box_container.add_child(option)


func _on_character_selected(character: _dtos.ClientCharacter) -> void:
	GameManager.set_client_character(character)
	GameManager.set_scene("map_instances/" + character.instancePath)


# Handlers
func _handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	if message.type == _dtos.WebsocketEvents.CHARACTERS_LISTED:
		var list: Array[_dtos.ClientCharacter] = [];
		
		for character in message.data:
			var newCharacter = _dtos.ClientCharacter.from(character);
			
			list.append(newCharacter);
		
		_list_characters(list)
	elif message.type == _dtos.WebsocketEvents.CHARACTER_DELETED:
		_get_characters()
	elif message.type == _dtos.WebsocketEvents.CHARACTER_SELECTED:
		_on_character_selected(_dtos.ClientCharacter.from(message.data))
	elif message.type == _dtos.WebsocketEvents.DENY_RESPONSE:
		pass


func _handle_new_character_button_pressed() -> void:
	GameManager.set_scene("character_creation")


func _handle_exit_button_pressed() -> void:
	WS.close()
	GameManager.set_scene("server_list")
