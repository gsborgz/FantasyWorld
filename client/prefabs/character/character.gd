extends Node2D
class_name Character

const _dtos := preload("res://shared/dtos.gd")
const CharacterScene := preload("res://prefabs/character/character.tscn")

@onready var _body: CharacterBody2D = $CharacterBody2D
@onready var _collision_shape: CircleShape2D = $CharacterBody2D/CollisionShape2D.shape
@onready var _nameplate: Label = $CharacterBody2D/Nameplate
@onready var _camera: Camera2D = $CharacterBody2D/Camera

var char_name: String = ""
var x: float = 0
var y: float = 0
var speed: float = 50
var is_player: bool

var _movement_enabled: bool = true
var _is_running: bool = false
var _is_moving: bool = false
var _was_moving: bool = false


static func instantiate(user_char: _dtos.ClientCharacter) -> Character:
	var character := CharacterScene.instantiate() as Character
	
	character.x = user_char.x
	character.y = user_char.y
	character.char_name = user_char.name
	character.speed = user_char.speed
	character.is_player = user_char.id == GameManager.get_client_character().id
	
	if character.is_player:
		GameManager.set_user_character(character)
	
	return character


func set_movement_enabled(enabled: bool):
	_movement_enabled = enabled


func _ready():
	position = Vector2(x, y)
	_camera.enabled = is_player
	
	_update_camera_limits()
	
	if (!is_player):
		_nameplate.text = char_name


func _physics_process(delta: float) -> void:
	if !_movement_enabled:
		return
	
	_body.velocity = Vector2.ZERO
	
	_move_character()
	queue_redraw()
	
	#_send_update_position_message()
	
	_was_moving = _is_moving


func _draw() -> void:
	draw_circle(_body.position, _collision_shape.radius, Color.DARK_ORCHID)


func _update_camera_limits() -> void:
	if !is_player:
		return
	
	var tilemap: TileMapLayer
	var tilemaps := get_tree().get_nodes_in_group("main_layer")
	
	tilemap = tilemaps.get(0)
	
	if not tilemap:
		return
	
	var used_rect: Rect2i = tilemap.get_used_rect()
	var tile_map_size := tilemap.tile_set.get_tile_size()
	
	_camera.limit_left = used_rect.position.x * tile_map_size.x
	_camera.limit_top = used_rect.position.y * tile_map_size.y
	_camera.limit_right = (used_rect.position.x + used_rect.size.x) * tile_map_size.x
	_camera.limit_bottom = (used_rect.position.y + used_rect.size.y) * tile_map_size.y


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("run"):
		_is_running = true
	elif event.is_action_released("run"):
		_is_running = false


func _move_character() -> void:
	var direction := Input.get_vector("left", "right", "up", "down")
	
	_body.velocity = direction * (speed * (2 if _is_running else 1))
	
	_is_moving = direction != Vector2.ZERO
	
	_body.move_and_slide()
	
	if is_player:
		GameManager.update_client_character_position()


func _send_update_position_message() -> void:
	if !is_player || (!_is_moving and !_was_moving):
		return
	
	var message := _dtos.WebsocketMessage.new()
	
	message.type = _dtos.WebsocketEvents.UPDATE_POSITION
	message.data = GameManager.get_client_character()
	
	WS.send(message)
