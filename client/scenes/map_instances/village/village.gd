extends MapInstance

@onready var _world_node: Node2D = $World
@onready var _ui_node: UI = $Ui


func _ready() -> void:
	set_ui_node(_ui_node)
	set_world_node(_world_node)
	init_instance()


#Handlers
@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	pass
