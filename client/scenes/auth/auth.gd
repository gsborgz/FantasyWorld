extends Node

const _dtos := preload("res://shared/dtos.gd")
const _start_theme := preload("res://assets/music/Track_#1.wav")

@onready var _username_field: LineEdit = $UI/VBoxContainer/Username
@onready var _password_field: LineEdit = $UI/VBoxContainer/Password
@onready var _password_confirmation_field: LineEdit = $UI/VBoxContainer/PasswordConfirmation
@onready var _buttons_layout: VBoxContainer = $UI/VBoxContainer/ButtonsLayout
@onready var _login_button: Button = $UI/VBoxContainer/ButtonsLayout/LoginButton
@onready var _register_button: Button = $UI/VBoxContainer/ButtonsLayout/RegisterButton
@onready var _or_label: Label = $UI/VBoxContainer/ButtonsLayout/OrLabel
@onready var _info_label: Label = $UI/VBoxContainer/Info

enum AuthLayout {
	Signin,
	Signup
}

var _current_layout: AuthLayout = AuthLayout.Signin

func _ready() -> void:
	GameManager.set_theme_and_play(_start_theme)
	
	_username_field.placeholder_text = "Usuário"
	_password_field.placeholder_text = "Senha"
	_password_confirmation_field.placeholder_text = "Confirmar Senha"
	_or_label.text = "Ou"
	
	_reset_form()
	
	_login_button.pressed.connect(_on_login_button_pressed)
	_register_button.pressed.connect(_on_register_button_pressed)
	_password_field.secret = true
	_password_confirmation_field.secret = true
	_password_confirmation_field.visible = _current_layout == AuthLayout.Signup


func _on_login_button_pressed() -> void:
	if _current_layout == AuthLayout.Signin:
		var data := {
			"username": _username_field.text,
			"password": _password_field.text
		}
		
		Api.post_data("/v1/auth/signin", data, _on_login_request_completed)
	else:
		_set_current_layout(AuthLayout.Signin)
		_info_label.text = ""


func _on_register_button_pressed() -> void:
	if _current_layout == AuthLayout.Signup:
		var data := {
			"username": _username_field.text,
			"password": _password_field.text,
			"passwordConfirmation": _password_confirmation_field.text
		}
		
		Api.post_data("/v1/auth/signup", data, _on_register_request_completed)
	else:
		_set_current_layout(AuthLayout.Signup)
		_info_label.text = ""


func _on_login_request_completed(response: Api.ResponseData) -> void:
	if response.ok():
		GameManager.set_session_sid(response.get_body().token)
		GameManager.set_scene("server_list")
	else:
		_info_label.text = response.get_body().message


func _on_register_request_completed(response: Api.ResponseData) -> void:
	_info_label.text = response.get_body().message
	
	if response.ok():
		_set_current_layout(AuthLayout.Signin)


func _reset_form() -> void:
	_username_field.text = ""
	_password_field.text = ""
	_password_confirmation_field.text = ""


func _set_current_layout(layout: AuthLayout):
	_current_layout = layout
	_password_confirmation_field.visible = _current_layout == AuthLayout.Signup
	
	_reset_form()
	
	var children = _buttons_layout.get_children()
	
	for child in children:
		_buttons_layout.move_child(child, 0)
