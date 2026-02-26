extends Node

const _dtos := preload("res://shared/dtos.gd")

var client_id: int
var _current_scene_root: Node
var _session_sid: String
var _session_client_id: String
var _client_character: _dtos.ClientCharacter
var _player_character: Character
var _menu_opened: bool = false
var _chat_activated: bool = false


func get_menu_opened() -> bool:
	return _menu_opened


func set_menu_opened(value: bool) -> void:
	_menu_opened = value


func get_chat_activated() -> bool:
	return _chat_activated


func set_chat_activated(value: bool) -> void:
	_chat_activated = value


func set_scene(scenePath: String) -> void:
	if _current_scene_root != null:
		_current_scene_root.queue_free()
	
	var sceneName := scenePath.split("/")
	var fileName := sceneName[sceneName.size() - 1]
	var sceneFullPath = "res://scenes/" + scenePath + "/" + fileName + ".tscn"
	
	get_tree().call_deferred("change_scene_to_file", sceneFullPath)


# Session Methods
func set_session_sid(sid: String) -> void:
	_session_sid = sid


func get_session_sid() -> String:
	return _session_sid


func set_session_client_id(id: String) -> void:
	_session_client_id = id


func get_session_client_id() -> String:
	return _session_client_id


# User Character Methods
func set_client_character(character: _dtos.ClientCharacter) -> void:
	_client_character = character


func get_client_character() -> _dtos.ClientCharacter:
	return _client_character


func set_player_character(character: Character) -> void:
	_player_character = character


func get_player_character() -> Character:
	return _player_character


func update_client_character_position(new_pos: Vector2, direction: _dtos.Direction, is_moving: bool, is_running: bool) -> void:
	var character = get_client_character()
	
	character.x = new_pos.x
	character.y = new_pos.y
	character.direction = direction
	character.is_moving = is_moving
	character.is_running = is_running
	
	set_client_character(character)


func set_player_movement_enabled(value: bool) -> void:
	_player_character.set_movement_enabled(value)
