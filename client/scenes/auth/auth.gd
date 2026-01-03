extends Node

const _dtos := preload("res://shared/dtos.gd")

@onready var _username_field: LineEdit = $UI/VBoxContainer/Username
@onready var _password_field: LineEdit = $UI/VBoxContainer/Password
@onready var _login_button: Button = $UI/VBoxContainer/HBoxContainer/LoginButton
@onready var _register_button: Button = $UI/VBoxContainer/HBoxContainer/RegisterButton
@onready var _log: Log = $UI/VBoxContainer/Log


func _ready() -> void:
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
	var data := {
		"username": _username_field.text,
		"password": _password_field.text,
		"passwordConfirmation": _password_field.text
	}
	
	Api.post_data("/v1/auth/signup", data, _on_register_request_completed)


func _on_login_request_completed(response: Api.ResponseData) -> void:
	if response.ok():
		Session.setSid(response.get_body().token)
		GameManager.set_scene("server_list")
	else:
		_log.error(response.get_body().message)


func _on_register_request_completed(response: Api.ResponseData) -> void:
	_log.info(response.get_body().message)
