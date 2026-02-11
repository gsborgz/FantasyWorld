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
	pass
