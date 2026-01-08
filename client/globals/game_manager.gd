extends Node

var client_id: int
var _current_scene_root: Node
var _session_sid: String
var _session_client_id: String
var _player_character: Player

func set_session_sid(sid: String) -> void:
	_session_sid = sid


func get_session_sid() -> String:
	return _session_sid


func set_session_client_id(id: String) -> void:
	_session_client_id = id


func get_session_client_id() -> String:
	return _session_client_id


func set_player_character(player: Player) -> void:
	_player_character = player


func get_player_character() -> Player:
	return _player_character


func set_scene(scenePath: String) -> void:
	if _is_map_scene(scenePath):
		_preserve_player_character()
	else:
		_detach_player_character()

	if _current_scene_root != null:
		_current_scene_root.queue_free()
	
	var sceneName := scenePath.split("/")
	var fileName := sceneName[sceneName.size() - 1]
	var sceneFullPath = "res://scenes/" + scenePath + "/" + fileName + ".tscn"
	
	get_tree().change_scene_to_file(sceneFullPath)


func _preserve_player_character() -> void:
	if _player_character != null and is_instance_valid(_player_character):
		if _player_character.is_inside_tree():
			var parent := _player_character.get_parent()
			if parent != null:
				parent.remove_child(_player_character)
		add_child(_player_character)


func _detach_player_character() -> void:
	if _player_character != null and is_instance_valid(_player_character):
		if _player_character.is_inside_tree():
			var parent := _player_character.get_parent()
			if parent != null:
				parent.remove_child(_player_character)


func _is_map_scene(scenePath: String) -> bool:
	return scenePath.begins_with("map_instances/")
