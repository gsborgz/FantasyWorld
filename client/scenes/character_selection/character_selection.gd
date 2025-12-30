extends Node

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

const CharacterOption := preload("res://prefabs/character_option/character_option.gd")

@onready var h_box_container: HBoxContainer = $UI/HBoxContainer
@onready var _new_character_button: Button = $UI/NewCharacterButton


func _ready() -> void:
	WS.message_received.connect(_on_ws_message_received)
	_new_character_button.pressed.connect(_on_new_character_button_pressed)
	_get_characters()


func _on_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.CHARACTERS_LISTED:
		var data := _dtos.CharactersListResponse.from(message.data)
		_list_characters(data)
	elif message.type == _ws_utils.WebsocketEvents.CHARACTER_DELETED:
		_get_characters()
	elif message.type == _ws_utils.WebsocketEvents.DENY_RESPONSE:
		pass


func _get_characters() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	
	message.type = _ws_utils.WebsocketEvents.LIST_CHARACTERS
	
	WS.send(message)


func _list_characters(data: _dtos.CharactersListResponse) -> void:
	for child in h_box_container.get_children():
		h_box_container.remove_child(child)
	
	for character in data.characters:
		var option := CharacterOption.instantiate(character.name, character.id)
		h_box_container.add_child(option)


func _on_new_character_button_pressed():
	GameManager.set_scene("character_creation")
