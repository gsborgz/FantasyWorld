extends VBoxContainer

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

const Scene := preload("res://prefabs/character_option/character_option.tscn")
const CharacterOption := preload("res://prefabs/character_option/character_option.gd")

@onready var _name: Label = $Name
@onready var _select_character: Button = $HBoxContainer/Select
@onready var _delete_character: Button = $HBoxContainer/Delete

var character_id: String
var character_name: String


@warning_ignore("shadowed_variable")
static func instantiate(character_name: String, character_id: String) -> CharacterOption:
	var character_option := Scene.instantiate()
	
	character_option.character_id = character_id
	character_option.character_name = character_name
	
	return character_option


func _ready() -> void:
	_name.text = character_name
	
	WS.message_received.connect(_on_ws_message_received)
	_select_character.pressed.connect(_on_character_select)
	_delete_character.pressed.connect(_on_character_delete)


func _on_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.CHARACTER_SELECTED:
		_on_character_selected(_dtos.CharacterResponse.from(message.data))
	elif message.type == _ws_utils.WebsocketEvents.DENY_RESPONSE:
		pass


func _on_character_select() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	var data := _dtos.SelectCharacterRequest.new()
	
	data.characterId = character_id
	
	message.type = _ws_utils.WebsocketEvents.SELECT_CHARACTER
	message.data = data
	
	WS.send(message)


func _on_character_delete() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	var data := _dtos.DeleteCharacterRequest.new()
	
	data.characterId = character_id
	
	message.type = _ws_utils.WebsocketEvents.DELETE_CHARACTER
	message.data = data
	
	WS.send(message)


func _on_character_selected(data: _dtos.CharacterResponse) -> void:
	if data.id == character_id:
		Session.setCharacter(data)
		GameManager.set_scene("map_instances/" + data.instancePath)
