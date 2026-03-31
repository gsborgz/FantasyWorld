extends Node

const _dtos := preload("res://shared/dtos.gd")

@onready var _username_field: LineEdit = $UI/VBoxContainer/Username
@onready var _password_field: LineEdit = $UI/VBoxContainer/Password
@onready var _login_button: Button = $UI/VBoxContainer/LoginButton
@onready var _register_button: Button = $UI/VBoxContainer/RegisterButton
@onready var _or_label: Label = $UI/VBoxContainer/OrLabel
@onready var _log: Log = $UI/VBoxContainer/Log


func _ready() -> void:
	_username_field.placeholder_text = "Username"
	_password_field.placeholder_text = "Password"
	_or_label.text = "Or"
	
	_login_button.pressed.connect(_on_login_button_pressed)
	_register_button.pressed.connect(_on_register_button_pressed)
	_password_field.secret = true


func _on_login_button_pressed() -> void:
	var data := {
		"username": _username_field.text,
		"password": _password_field.text
	}
	
	Api.post_data("/v1/auth/signin", data, _on_login_request_completed)


func _on_register_button_pressed() -> void:
	GameManager.set_scene("auth/signup")


func _on_login_request_completed(response: Api.ResponseData) -> void:
	if response.ok():
		GameManager.set_session_sid(response.get_body().token)
		GameManager.set_scene("server_list")
	else:
		_log.error(response.get_body().message)
