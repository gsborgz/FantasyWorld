class_name UI
extends CanvasLayer

const _dtos := preload("res://shared/dtos.gd")

@onready var _back_to_char_screen_button: Button = $Menu/BackToCharScreenButton
@onready var _menu: VBoxContainer = $Menu

func _ready() -> void:
	_menu.visible = false
	_back_to_char_screen_button.pressed.connect(_handle_back_to_char_screen_button_pressed)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("esc"):
		_handle_esc_pressed()


func _send_left_instance_message() -> void:
	var message = _dtos.WebsocketMessage.new()
	var client_char = GameManager.get_client_character()
	
	message.type = _dtos.WebsocketEvents.LEFT_INSTANCE
	message.data = client_char
	
	WS.send(message)


func _handle_back_to_char_screen_button_pressed() -> void:
	_send_left_instance_message()
	GameManager.set_scene("character_selection")


func _handle_esc_pressed() -> void:
	var player = GameManager.get_player_character()
	
	if _menu.visible:
		player.set_movement_enabled(true)
		_menu.visible = false
	else:
		player.set_movement_enabled(false)
		_menu.visible = true
