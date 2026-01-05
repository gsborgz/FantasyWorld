extends MapInstance


func _ready() -> void:
	init_instance()


# Handlers
@warning_ignore("unused_parameter")
func _handle_ws_message_received(message: _ws_utils.WebsocketMessage) -> void:
	pass
