class_name UI
extends CanvasLayer

@onready var _back_to_char_screen_button: Button = $Menu/BackToCharScreenButton
@onready var _menu: VBoxContainer = $Menu

func _ready() -> void:
	_menu.visible = false
	_back_to_char_screen_button.pressed.connect(_handle_back_to_char_screen_button_pressed)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("esc"):
		_handle_esc_pressed()


# Handlers
func _handle_back_to_char_screen_button_pressed() -> void:
	GameManager.set_scene("character_selection")


func _handle_esc_pressed() -> void:
	var player = GameManager.get_player_character()
	
	if _menu.visible:
		player.set_movement_enabled(true)
		_menu.visible = false
	else:
		player.set_movement_enabled(false)
		_menu.visible = true
