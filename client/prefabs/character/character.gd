extends CharacterBody2D
class_name Character

const _dtos := preload("res://shared/dtos.gd")
const CharacterScene := preload("res://prefabs/character/character.tscn")

@onready var _nameplate: Label = $Nameplate
@onready var _camera: Camera2D = $Camera
@onready var _animation_player: AnimationPlayer = $Sprite/AnimationPlayer

var char_id = ""
var char_name = ""
var x = 0.0
var y = 0.0
var is_player = false
var current_direction = _dtos.Direction

var _walk_speed = 100
var _run_speed = 220
var _movement_enabled: bool = true
var _is_running: bool = false
var _is_moving: bool = false
var _preferred_direction = Vector2.ZERO
var _idle_animation_map = {
	_dtos.Direction.UP: "idle_up",
	_dtos.Direction.DOWN: "idle_down",
	_dtos.Direction.RIGHT: "idle_right",
	_dtos.Direction.LEFT: "idle_left"
}
var _walk_animation_map = {
	_dtos.Direction.UP: "walk_up",
	_dtos.Direction.DOWN: "walk_down",
	_dtos.Direction.RIGHT: "walk_right",
	_dtos.Direction.LEFT: "walk_left"
}

static func instantiate(user_char: _dtos.ClientCharacter) -> Character:
	var character := CharacterScene.instantiate() as Character
	
	character.char_id = user_char.id
	character.x = user_char.x
	character.y = user_char.y
	character.char_name = user_char.name
	character.is_player = user_char.id == GameManager.get_client_character().id
	character.current_direction = user_char.direction
	character.z_index = 5
	character._movement_enabled = false
	
	if character.is_player:
		GameManager.set_player_character(character)
	
	return character


func set_movement_enabled(enabled: bool):
	_movement_enabled = enabled


func update_remote_position(client_char: _dtos.ClientCharacter) -> void:
	position.x = client_char.x
	position.y = client_char.y
	current_direction = client_char.direction


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


func _unhandled_input(event: InputEvent) -> void:
	_listen_run_input(event)
	_listen_direction_input(event)


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


func _listen_direction_input(event: InputEvent) -> void:
	if event.is_action_pressed("left"):
		_preferred_direction = Vector2.LEFT
	elif event.is_action_pressed("right"):
		_preferred_direction = Vector2.RIGHT
	elif event.is_action_pressed("up"):
		_preferred_direction = Vector2.UP
	elif event.is_action_pressed("down"):
		_preferred_direction = Vector2.DOWN


func _move_character() -> void:
	if !is_player:
		return
	
	var direction := _get_direction()
	
	_set_current_direction(direction)
	
	var speed = _run_speed if _is_running else _walk_speed
	
	velocity = direction * speed
	
	_is_moving = direction != Vector2.ZERO
	
	move_and_slide()
	
	if _is_moving:
		GameManager.update_client_character_position(position, current_direction)
		_send_update_position_message()
		_play_walk_animation()
	else:
		_play_idle_animation()


func _send_update_position_message() -> void:
	var message := _dtos.WebsocketMessage.new()
	
	message.type = _dtos.WebsocketEvents.UPDATE_POSITION
	message.data = GameManager.get_client_character()
	
	WS.send(message)


func _get_direction() -> Vector2:
	var horizontal := Input.get_action_strength("right") - Input.get_action_strength("left")
	var vertical := Input.get_action_strength("down") - Input.get_action_strength("up")
	var direction := Vector2.ZERO
	
	if horizontal != 0.0 and vertical != 0.0:
		if _preferred_direction.y != 0.0:
			direction = Vector2(0.0, vertical)
		elif _preferred_direction.x != 0.0:
			direction = Vector2(horizontal, 0.0)
		else:
			direction = Vector2(horizontal, 0.0)
	elif horizontal != 0.0:
		direction = Vector2(horizontal, 0.0)
	elif vertical != 0.0:
		direction = Vector2(0.0, vertical)
	
	return direction


func _set_current_direction(direction: Vector2) -> void:
	if direction == Vector2.RIGHT:
		current_direction = _dtos.Direction.RIGHT
	elif direction == Vector2.LEFT:
		current_direction = _dtos.Direction.LEFT
	elif direction == Vector2.UP:
		current_direction = _dtos.Direction.UP
	elif direction == Vector2.DOWN:
		current_direction = _dtos.Direction.DOWN


func _play_walk_animation() -> void:
	var animation = _walk_animation_map[current_direction]
	var speed = 3 if _is_running else 1 
	
	_animation_player.play(animation, -1, speed)

func _play_idle_animation() -> void:
	var animation = _idle_animation_map[current_direction]
	
	_animation_player.play(animation)
