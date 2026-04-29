extends Node

const _dtos := preload("res://shared/dtos.gd")

@onready var _name: LineEdit = $UI/VBoxContainer/Name
@onready var _create_button: Button = $UI/VBoxContainer/HBoxContainer/Create
@onready var _cancel_button: Button = $UI/VBoxContainer/HBoxContainer/Cancel


func _ready() -> void:
	_name.text = ""
	
	WS.message_received.connect(_on_ws_message_received)
	_create_button.pressed.connect(_on_create_button_pressed)
	_cancel_button.pressed.connect(_on_cancel_button_pressed)


func _on_ws_message_received(message: _dtos.WebsocketMessage):
	if message.type == _dtos.WebsocketEvents.CHARACTER_ADDED:
		GameManager.set_scene("character_selection")
	elif message.type == _dtos.WebsocketEvents.DENY_RESPONSE:
		pass


func _on_create_button_pressed():
	if _name.text != null:
		var message := _dtos.WebsocketMessage.new()
		var data := _dtos.AddCharacterRequest.new()
		
		data.name = _name.text
		message.type = _dtos.WebsocketEvents.ADD_CHARACTER
		message.data = data as _dtos.AddCharacterRequest
		
		WS.send(message)


func _on_cancel_button_pressed():
	GameManager.set_scene("character_selection")
