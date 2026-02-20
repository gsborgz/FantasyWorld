extends Area2D
class_name Teleport

const _dtos := preload("res://shared/dtos.gd")

@export var tp_scale: Vector2:
	set(new_scale):
		tp_scale = new_scale
		scale = tp_scale
@export var direction: _dtos.Direction
@export var to: String
@export var new_position: Vector2

var _teleporting: bool = false


func _ready() -> void:
	if not body_entered.is_connected(_on_body_entered):
		body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node2D) -> void:
	if !_teleporting && body.name != "PlayerCharacter" || ((body as Character).char_id != GameManager.get_user_character().char_id):
		return
	
	_teleporting = true
	
	var character = GameManager.get_user_character()
	
	character.set_movement_enabled(false)
	
	_set_client_character_starting_position()
	
	GameManager.set_scene("map_instances/" + to)
	
	_teleporting = false


func _set_client_character_starting_position() -> void:
	var player_char = GameManager.get_user_character()
	var startPosition = new_position
	
	if direction == _dtos.Direction.UP or direction == _dtos.Direction.DOWN:
		var diffX = player_char.position.x - position.x
		
		startPosition.x += diffX
	elif direction == _dtos.Direction.LEFT or direction == _dtos.Direction.RIGHT:
		var diffY = player_char.position.y - position.y
		
		startPosition.y += diffY
	
	GameManager.update_client_character_position(startPosition)
