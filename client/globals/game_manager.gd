extends Node

var client_id: int
var _current_scene_root: Node


func set_scene(scenePath: String) -> void:
	if _current_scene_root != null:
		_current_scene_root.queue_free()
	
	var sceneName := scenePath.split("/")
	var fileName := sceneName[sceneName.size() - 1]
	var scene: PackedScene = load("res://scenes/" + scenePath + "/" + fileName + ".tscn")
	
	if scene != null:
		_current_scene_root = scene.instantiate()
		
		add_child(_current_scene_root)
	else:
		print("failed to load scene: %s" % scenePath)
