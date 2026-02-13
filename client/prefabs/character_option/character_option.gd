extends VBoxContainer

const _dtos := preload("res://shared/dtos.gd")
const Scene := preload("res://prefabs/character_option/character_option.tscn")
const CharacterOption := preload("res://prefabs/character_option/character_option.gd")

@onready var _name: Label = $Name
@onready var _select_character: Button = $HBoxContainer/Select
@onready var _delete_character: Button = $HBoxContainer/Delete

var character_id: String
var character_name: String


static func instantiate(character: _dtos.ClientCharacter) -> CharacterOption:
	var character_option := Scene.instantiate()
	
	character_option.character_id = character.id
	character_option.character_name = character.name
	
	return character_option


func _ready() -> void:
	_name.text = character_name
	
	_select_character.pressed.connect(_on_character_select)
	_delete_character.pressed.connect(_on_character_delete)


func _on_character_select() -> void:
	var message := _dtos.WebsocketMessage.new()
	var data := _dtos.SelectCharacterRequest.new()
	
	data.characterId = character_id
	
	message.type = _dtos.WebsocketEvents.SELECT_CHARACTER
	message.data = data
	
	WS.send(message)


func _on_character_delete() -> void:
	var message := _dtos.WebsocketMessage.new()
	var data := _dtos.DeleteCharacterRequest.new()
	
	data.characterId = character_id
	
	message.type = _dtos.WebsocketEvents.DELETE_CHARACTER
	message.data = data
	
	WS.send(message)
