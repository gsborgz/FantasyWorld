extends Node2D
class_name Character

const _dtos := preload("res://shared/dtos.gd")

const CharacterScene := preload("res://prefabs/character/character.tscn")

@onready var _collision_shape: CircleShape2D = $CharacterBody2D/CollisionShape2D.shape
@onready var _nameplate: Label = $CharacterBody2D/Nameplate
@onready var _camera: Camera2D = $CharacterBody2D/Camera
@onready var _body: CharacterBody2D = $CharacterBody2D


var props := _dtos.ClientCharacter.new()

var is_running: bool = false
var movement_enabled: bool = true
var is_player: bool
var radius: float:
	set(new_radius):
		radius = new_radius
		_collision_shape.radius = new_radius
		queue_redraw()

# Throttling de envio de posição
const SEND_INTERVAL: float = 0.05
var _send_accum: float = 0.0
var _was_moving: bool = false
var _last_direction: _dtos.Direction = _dtos.Direction.DOWN
 
# Suavização de players remotos
var _remote_target: Vector2 = Vector2.ZERO
var _remote_has_target: bool = false


static func instantiate(user_char: _dtos.ClientCharacter) -> Character:
	var isPlayer = user_char.id == GameManager.get_client_character().id
	var character := CharacterScene.instantiate() as Character
	
	character.props = user_char
	character.is_player = isPlayer
	
	return character


func _ready():
	position = Vector2(props.x, props.y)
	_camera.enabled = is_player
	
	if (!is_player):
		_nameplate.text = props.name


func update_camera_limits() -> void:
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
		is_running = true
	elif event.is_action_released("run"):
		is_running = false


func get_input():
	if !is_player:
		return
	
	var input_direction = Input.get_vector("left", "right", "up", "down")
	var speed = props.speed
	
	if is_running:
		speed += 200
	
	_body.velocity = input_direction * speed


func _physics_process(delta: float) -> void:
	if not movement_enabled:
		return
	
	get_input()
	_body.move_and_slide()
	queue_redraw()
	
	_send_accum += delta
	
	var moving := _body.velocity != Vector2.ZERO

	if is_player:
		if moving and _send_accum >= SEND_INTERVAL:
			send_update_position_message()
			_send_accum = 0.0
		elif !moving and _was_moving:
			send_update_position_message()
		_was_moving = moving
	
	if !is_player and _remote_has_target:
		var step: float = max(50.0, props.speed) * delta
		var new_pos: Vector2 = _body.global_position.move_toward(_remote_target, step)
		
		_body.global_position = new_pos
		
		if new_pos.distance_to(_remote_target) < 1.0:
			_remote_has_target = false


func _draw() -> void:
	if _body:
		draw_circle(_body.position, _collision_shape.radius, Color.DARK_ORCHID)


func send_update_position_message():
	props.x = _body.global_position.x
	props.y = _body.global_position.y
	
	if !is_player:
		return
	
	var message := _dtos.WebsocketMessage.new()
	var data := _dtos.CharacterPosition.new()
	
	var v := _body.velocity
	if v != Vector2.ZERO:
		if v.x > 0:
			props.direction = _dtos.Direction.RIGHT
		elif v.x < 0:
			props.direction = _dtos.Direction.LEFT
		elif v.y < 0:
			props.direction = _dtos.Direction.UP
		elif v.y > 0:
			props.direction = _dtos.Direction.DOWN
		_last_direction = props.direction
	else:
		props.direction = _last_direction
	
	data.direction = props.direction
	data.x = props.x
	data.y = props.y
	data.speed = 0.0 if v == Vector2.ZERO else props.speed
	
	message.type = _dtos.WebsocketEvents.UPDATE_POSITION
	message.data = data
	
	var clientCharacter = GameManager.get_client_character()
	
	clientCharacter.direction = data.direction
	clientCharacter.x = data.x
	clientCharacter.y = data.y
	clientCharacter.speed = data.speed
	
	GameManager.set_client_character(clientCharacter)
	
	WS.send(message)


func apply_remote_update(character: _dtos.ClientCharacter) -> void:
	props.x = character.x
	props.y = character.y
	props.direction = character.direction
	props.speed = character.speed
	
	_remote_target = Vector2(character.x, character.y)
	_remote_has_target = true
	
	queue_redraw()


func set_movement_enabled(enabled: bool):
	movement_enabled = enabled


# Handlers
func _handle_area_entered(area: Area2D) -> void:
	print(area)
