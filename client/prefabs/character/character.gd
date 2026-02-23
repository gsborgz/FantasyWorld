extends CharacterBody2D
class_name Character

const _dtos := preload("res://shared/dtos.gd")
const CharacterScene := preload("res://prefabs/character/character.tscn")

@onready var _collision_shape: CircleShape2D = $CollisionShape2D.shape
@onready var _nameplate: Label = $Nameplate
@onready var _camera: Camera2D = $Camera

var char_id = ""
var char_name = ""
var x = 0.0
var y = 0.0
var is_player = false
var input_direction = Vector2(0,0)

var _walk_speed = 100
var _run_speed = 220
var _movement_enabled: bool = true
var _is_running: bool = false
var _is_moving: bool = false


static func instantiate(user_char: _dtos.ClientCharacter) -> Character:
	var character := CharacterScene.instantiate() as Character
	
	character.char_id = user_char.id
	character.x = user_char.x
	character.y = user_char.y
	character.char_name = user_char.name
	character.is_player = user_char.id == GameManager.get_client_character().id
	character.z_index = 5
	character._movement_enabled = false
	
	if character.is_player:
		GameManager.set_player_character(character)
	
	return character


func set_movement_enabled(enabled: bool):
	_movement_enabled = enabled


func update_remote_position(user_char: _dtos.ClientCharacter) -> void:
	position.x = user_char.x
	position.y = user_char.y


func _ready():
	position = Vector2(x, y)
	
	_set_camera()


@warning_ignore("unused_parameter")
func _mouse_shape_enter(shape_idx: int) -> void:
	if !is_player:
		_nameplate.text = char_name


@warning_ignore("unused_parameter")
func _mouse_shape_exit(shape_idx: int) -> void:
	if _nameplate.text:
		_nameplate.text = ""


@warning_ignore("unused_parameter")
func _physics_process(delta: float) -> void:
	if !_movement_enabled:
		return
	
	_move_character()
	queue_redraw()


func _draw() -> void:
	draw_circle(Vector2.ZERO, _collision_shape.radius, Color.DARK_ORCHID)


func _unhandled_input(event: InputEvent) -> void:
	_listen_run_input(event)


func _set_camera() -> void:
	_camera.enabled = is_player
	
	if is_player:
		_camera.make_current()
		_update_camera_limits()


func _update_camera_limits() -> void:
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


func _listen_run_input(event: InputEvent) -> void:
	if event.is_action_pressed("run"):
		_is_running = true
	elif event.is_action_released("run"):
		_is_running = false


func _move_character() -> void:
	if !is_player:
		return
	
	var direction := Input.get_vector("left", "right", "up", "down")
	var speed = _run_speed if _is_running else _walk_speed
	
	velocity = direction * speed
	
	_is_moving = direction != Vector2.ZERO
	
	move_and_slide()
	
	if _is_moving:
		GameManager.update_client_character_position(position)
		_send_update_position_message()


func _send_update_position_message() -> void:
	var message := _dtos.WebsocketMessage.new()
	
	message.type = _dtos.WebsocketEvents.UPDATE_POSITION
	message.data = GameManager.get_client_character()
	
	WS.send(message)
