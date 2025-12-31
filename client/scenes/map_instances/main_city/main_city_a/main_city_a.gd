extends Node

const _ws_utils := preload("res://shared/ws-utils.gd")
const _dtos := preload("res://shared/dtos.gd")

const Player := preload("res://prefabs/player/player.gd")

@onready var _world: Node2D = $World

var _players: Dictionary[String, Player] = {}
var _client_to_player_id: Dictionary[String, String] = {}

func _ready() -> void:
	_add_player(Session.getCharacter())
	WS.message_received.connect(_on_ws_message_received)


func _on_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	if message.type == _ws_utils.WebsocketEvents.UPDATE_POSITION:
		_update_player(message)
	elif message.type == _ws_utils.WebsocketEvents.INSTANCE_LEFT:
		_remove_player(message)
	elif message.type == _ws_utils.WebsocketEvents.JOIN_INSTANCE:
		# Criação adiada para o primeiro UPDATE_POSITION recebido
		pass


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
