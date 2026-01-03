extends Node2D
class_name Player

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

const Scene := preload("res://prefabs/player/player.tscn")

@onready var _collision_shape: CircleShape2D = $CharacterBody2D/CollisionShape2D.shape
@onready var _nameplate: Label = $CharacterBody2D/Nameplate
@onready var _camera: Camera2D = $CharacterBody2D/Camera2D
@onready var _body: CharacterBody2D = $CharacterBody2D

var player_id: String
var player_name: String
var x: float
var y: float
var speed: float
var direction: _dtos.Direction
var is_player: bool
var movement_enabled: bool

var velocity: Vector2
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


@warning_ignore("shadowed_variable")
static func instantiate(character: _dtos.ClientCharacter, is_player: bool) -> Player:
	var player := Scene.instantiate() as Player
	
	player.player_id = character.id
	player.player_name = character.name
	player.x = character.x
	player.y = character.y
	player.speed = character.speed
	@warning_ignore("int_as_enum_without_cast")
	player.direction = character.direction
	player.is_player = is_player

	return player


func _ready():
	position = Vector2(x, y)
	_nameplate.text = player_name
	_camera.enabled = is_player
	movement_enabled = true


func get_input():
	if !is_player:
		return
	var input_direction = Input.get_vector("left", "right", "up", "down")
	_body.velocity = input_direction * speed


func _physics_process(delta: float) -> void:
	if not movement_enabled:
		return
	
	get_input()
	_body.move_and_slide()
	queue_redraw()
	
	_send_accum += delta
	var moving := _body.velocity != Vector2.ZERO
	if is_player and moving and _send_accum >= SEND_INTERVAL:
		x = _body.global_position.x
		y = _body.global_position.y
		_send_update_position_message()
		_send_accum = 0.0
		_was_moving = true
	elif is_player and !moving and _was_moving:
		x = _body.global_position.x
		y = _body.global_position.y
		_send_update_position_message()
		_was_moving = false
	
	if !is_player and _remote_has_target:
		var step: float = max(50.0, speed) * delta
		var new_pos: Vector2 = _body.global_position.move_toward(_remote_target, step)
		_body.global_position = new_pos
		if new_pos.distance_to(_remote_target) < 1.0:
			_remote_has_target = false


func _draw() -> void:
	if _body:
		draw_circle(_body.position, _collision_shape.radius, Color.DARK_ORCHID)


func _send_update_position_message():
	if !is_player:
		return

	var message := _ws_utils.WebsocketMessage.new()
	var data := _dtos.UpdatePositionRequest.new()

	# Direção baseada no movimento atual
	var v := _body.velocity
	if v != Vector2.ZERO:
		if v.x > 0:
			direction = _dtos.Direction.RIGHT
		elif v.x < 0:
			direction = _dtos.Direction.LEFT
		elif v.y < 0:
			direction = _dtos.Direction.UP
		elif v.y > 0:
			direction = _dtos.Direction.DOWN
		_last_direction = direction
	else:
		direction = _last_direction

	data.direction = direction
	data.x = x
	data.y = y
	# Envia 0 quando parado, caso contrário velocidade configurada
	data.speed = 0.0 if v == Vector2.ZERO else speed

	message.type = _ws_utils.WebsocketEvents.UPDATE_POSITION
	message.data = data

	WS.send(message)


func apply_remote_update(character: _dtos.ClientCharacter) -> void:
	x = character.x
	y = character.y
	@warning_ignore("int_as_enum_without_cast")
	direction = character.direction
	speed = character.speed
	_remote_target = Vector2(character.x, character.y)
	_remote_has_target = true
	queue_redraw()


func set_movement_enabled(enabled: bool):
	movement_enabled = enabled
