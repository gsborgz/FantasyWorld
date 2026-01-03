extends Node

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

@onready var _line_edit: LineEdit = $UI/VBoxContainer/LineEdit
@onready var _log: Log = $UI/VBoxContainer/Log
@onready var _world: Node2D = $World

var _players: Dictionary[String, Player] = {}
var _client_to_player_id: Dictionary[String, String] = {}

func _ready() -> void:
	_add_player(Session.getCharacter())
	WS.message_received.connect(_on_ws_message_received)
	_line_edit.text_submitted.connect(_on_line_edit_text_submitted)
	_line_edit.focus_entered.connect(_disable_player_movement)
	_line_edit.focus_exited.connect(_enable_player_movement)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("enter") and not _line_edit.has_focus():
		_line_edit.grab_focus()


func _disable_player_movement():
	var player = _players[Session.getCharacter().id]
	
	player.set_movement_enabled(false)


func _enable_player_movement():
	var player = _players[Session.getCharacter().id]
	
	player.set_movement_enabled(true)


func _on_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.UPDATE_POSITION:
		_update_player(message)
	elif message.type == _ws_utils.WebsocketEvents.INSTANCE_LEFT:
		_remove_player(message)
	elif message.type == _ws_utils.WebsocketEvents.JOIN_INSTANCE:
		_join_instance(message)
	elif message.type == _ws_utils.WebsocketEvents.INSTANCE_CHAT_MESSAGE:
		_on_instance_chat_message_received(message)


func _add_player(character: _dtos.CharacterResponse) -> void:
	var is_player := Session.getCharacter().id == character.id
	var player: Player = Player.instantiate(character, is_player)
	
	_players[player.player_id] = player
	_world.add_child(player)


func _remove_player(message: _ws_utils.WebsocketMessage) -> void:
	var left_client_id: String = (message.data.get("clientId", "") if typeof(message.data) == TYPE_DICTIONARY else "")
	var left_character_id: String = _client_to_player_id.get(left_client_id)
	
	if left_character_id != null:
		var player: Player = _players.get(left_character_id)
		
		if player != null:
			_players.erase(player.player_id)
			player.queue_free()
		
	_client_to_player_id.erase(left_client_id)


func _update_player(message: _ws_utils.WebsocketMessage) -> void:
	var client_id: String = (message.data.get("clientId", "") if typeof(message.data) == TYPE_DICTIONARY else "")
	var data = _dtos.UpdatePositionResponse.from(message.data)
	var character_id = data.characterId
	var character_name = data.characterName
	var x = data.x
	var y = data.y
	var direction = data.direction
	var speed = data.speed
	
	if client_id != null and client_id != "":
		_client_to_player_id[client_id] = character_id
	
	var player: Player = _players.get(character_id)
	
	if player == null:
		var character := _dtos.CharacterResponse.new()
		
		character.id = character_id
		character.name = character_name
		character.x = x
		character.y = y
		character.direction = direction
		
		var is_player = Session.getCharacter().id == character_id
		
		player = Player.instantiate(character, is_player)
		
		_players[character_id] = player
		_world.add_child(player)
	else:
		player.apply_remote_update(x, y, direction, speed)


func _join_instance(message: _ws_utils.WebsocketMessage) -> void:
	if typeof(message.data) != TYPE_DICTIONARY:
		return
	var data: Dictionary = message.data
	var client_id: String = data.get("clientId", "")
	var character_id: String = str(data.get("characterId", ""))
	var character_name: String = str(data.get("characterName", character_id))
	var x: float = float(data.get("x", 0.0))
	var y: float = float(data.get("y", 0.0))
	var direction: _dtos.Direction = data.get("direction", _dtos.Direction.DOWN)
	var speed: float = float(data.get("speed", 200.0))

	if client_id != "":
		_client_to_player_id[client_id] = character_id

	# Não cria se já existe
	if _players.has(character_id):
		return

	var character := _dtos.CharacterResponse.new()
	character.id = character_id
	character.name = character_name
	character.x = x
	character.y = y
	character.direction = direction
	character.speed = speed

	var is_player := Session.getCharacter().id == character_id
	var player: Player = Player.instantiate(character, is_player)
	_players[character_id] = player
	_world.add_child(player)


func _on_line_edit_text_submitted(new_text: String) -> void:
	if not new_text:
		return
	
	var message = _ws_utils.WebsocketMessage.new()
	var data = _dtos.ChatMessage.new()
	
	data.text = new_text
	
	message.type = _ws_utils.WebsocketEvents.INSTANCE_CHAT_MESSAGE
	message.data = data
	
	_log.chat("You", new_text)
	
	WS.send(message)
	
	_line_edit.clear()
	_line_edit.release_focus()


func _on_instance_chat_message_received(message: _ws_utils.WebsocketMessage) -> void:
	var chat_message = _dtos.ChatMessage.from(message.data)
	
	_log.chat(chat_message.senderName, chat_message.text)
