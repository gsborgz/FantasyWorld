extends Node

const _dtos := preload("res://shared/dtos.gd")

@onready var _username_field: LineEdit = $UI/VBoxContainer/Username
@onready var _password_field: LineEdit = $UI/VBoxContainer/Password
@onready var _password_confirmation_field: LineEdit = $UI/VBoxContainer/PasswordConfirmation
@onready var _login_button: Button = $UI/VBoxContainer/LoginButton
@onready var _register_button: Button = $UI/VBoxContainer/RegisterButton
@onready var _or_label: Label = $UI/VBoxContainer/OrLabel
@onready var _log: Log = $UI/VBoxContainer/Log


func _ready() -> void:
	_username_field.placeholder_text = "Username"
	_password_field.placeholder_text = "Password"
	_password_confirmation_field.placeholder_text = "Confirm Password"
	_or_label.text = "Or"
	
	_login_button.pressed.connect(_on_login_button_pressed)
	_register_button.pressed.connect(_on_register_button_pressed)
	_password_field.secret = true


func _on_login_button_pressed() -> void:
	GameManager.set_scene("auth/signin")


func _on_register_button_pressed() -> void:
	var data := {
		"username": _username_field.text,
		"password": _password_field.text,
		"passwordConfirmation": _password_confirmation_field.text
	}
	
	Api.post_data("/v1/auth/signup", data, _on_register_request_completed)


func _on_register_request_completed(response: Api.ResponseData) -> void:
	_log.info(response.get_body().message)
	
	if response.ok():
		GameManager.set_scene("auth/signin")
