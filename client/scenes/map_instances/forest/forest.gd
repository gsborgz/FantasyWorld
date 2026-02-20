extends MapInstance

@onready var _world_node: Node2D = $World
@onready var _ui_node: UI = $Ui


func _ready() -> void:
	_instance_name = _dtos.WorldInstance.Forest
	_ui = _ui_node
	_world = _world_node
	
	init_instance()


#Handlers
@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	pass
