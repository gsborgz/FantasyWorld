extends Area2D
class_name Teleport

const _dtos := preload("res://shared/dtos.gd")

@export var tp_scale: Vector2:
	set(new_scale):
		tp_scale = new_scale
		scale = tp_scale
@export var direction: _dtos.Direction
@export var to: String
@export var new_x: float
@export var new_y: float


func _ready() -> void:
	if not body_entered.is_connected(_on_body_entered):
		body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node2D) -> void:
	if body.get_parent() is Player:
		var player := body.get_parent() as Player
		
		if not player.is_player:
			return
		
		var player_char = GameManager.get_player_character()
		
		if direction == _dtos.Direction.UP or direction == _dtos.Direction.DOWN:
			var diffX = player.x - position.x
			
			new_x += diffX
		elif direction == _dtos.Direction.LEFT or direction == _dtos.Direction.RIGHT:
			var diffY = player.y - position.y
			
			new_y += diffY
		
		player_char.instancePath = to
		player_char.x = new_x
		player_char.y = new_y
		
		GameManager.set_player_character(player_char)
		GameManager.call_deferred("set_scene", "map_instances/" + to)


func has_overlaps() -> bool:
	return get_overlapping_bodies().size() > 0 or get_overlapping_areas().size() > 0
