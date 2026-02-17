extends Node

const _dtos := preload("res://shared/dtos.gd")

var client_id: int
var _current_scene_root: Node
var _session_sid: String
var _session_client_id: String
var _client_character: _dtos.ClientCharacter
var _user_character: Character

func set_session_sid(sid: String) -> void:
	_session_sid = sid


func get_session_sid() -> String:
	return _session_sid


func set_session_client_id(id: String) -> void:
	_session_client_id = id


func get_session_client_id() -> String:
	return _session_client_id


func set_client_character(character: _dtos.ClientCharacter) -> void:
	_client_character = character


func update_client_character_position() -> void:
	_client_character.x = _user_character.x
	_client_character.y = _user_character.y
	_client_character.speed = _user_character.speed


func get_client_character() -> _dtos.ClientCharacter:
	return _client_character


func set_user_character(character: Character) -> void:
	_user_character = character


func get_user_character() -> Character:
	return _user_character


func set_scene(scenePath: String) -> void:
	if _current_scene_root != null:
		_current_scene_root.queue_free()
	
	var sceneName := scenePath.split("/")
	var fileName := sceneName[sceneName.size() - 1]
	var sceneFullPath = "res://scenes/" + scenePath + "/" + fileName + ".tscn"
	
	get_tree().call_deferred("change_scene_to_file", sceneFullPath)


func _is_map_scene(scenePath: String) -> bool:
	return scenePath.begins_with("map_instances/")
