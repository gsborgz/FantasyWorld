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


@warning_ignore("unused_parameter")
func _on_login_request_completed(result, response_code, headers, body) -> void:
	print(response_code)
	var parsed = JSON.parse_string(body.get_string_from_utf8())

	if parsed == null:
		print("falha ao interpretar resposta")
		return
	
	if response_code == 201:
		Session.setSid(parsed.token)
		GameManager.set_scene("server_list")
	else:
		if parsed.message:
			_log.error(parsed.message)
		else:
			_log.error("Falha ao realizar login")


@warning_ignore("unused_parameter")
func _on_register_request_completed(result, response_code, headers, body) -> void:
	print(result)
	var parsed = JSON.parse_string(body.get_string_from_utf8())

	if parsed == null:
		print("falha ao interpretar resposta")
		return

	if parsed.message:
		if response_code == 201:
			_log.info(parsed.message)
		else:
			_log.error(parsed.message)
