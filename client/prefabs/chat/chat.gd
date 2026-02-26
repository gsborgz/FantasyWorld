class_name Chat
extends VBoxContainer

const _dtos := preload("res://shared/dtos.gd")

@onready var _log: Log = $Log
@onready var _line_edit: LineEdit = $LineEdit

var _enabled = true


func _ready() -> void:
	WS.message_received.connect(_handle_ws_message_received)
	
	_line_edit.text_submitted.connect(_handle_line_edit_text_submitted)
	_line_edit.focus_entered.connect(_handle_line_edit_focus_entered)
	_line_edit.focus_exited.connect(_handle_line_edit_focus_exited)


func _process(delta: float) -> void:
	_enabled = !GameManager.get_menu_opened()
	_line_edit.editable = !GameManager.get_menu_opened()
	_line_edit.visible = !GameManager.get_menu_opened()
	_log.visible = !GameManager.get_menu_opened()


func _unhandled_input(event: InputEvent) -> void:
	if _enabled && event.is_action_pressed("enter") && !_line_edit.has_focus():
		_line_edit.grab_focus()


# Handlers
func _handle_ws_message_received(message: _dtos.WebsocketMessage) -> void:
	if message.type == _dtos.WebsocketEvents.INSTANCE_CHAT_MESSAGE:
		_handle_instance_chat_message_received(_dtos.ChatMessage.from(message.data))


func _handle_instance_chat_message_received(chat_message: _dtos.ChatMessage) -> void:
	_log.chat(chat_message.senderName, chat_message.text)


func _handle_line_edit_text_submitted(new_text: String) -> void:
	if not new_text:
		return
	
	var message = _dtos.WebsocketMessage.new()
	var data = _dtos.ChatMessage.new()
	
	data.text = new_text
	
	message.type = _dtos.WebsocketEvents.INSTANCE_CHAT_MESSAGE
	message.data = data
	
	_log.chat("You", new_text)
	
	WS.send(message)
	
	_line_edit.clear()
	_line_edit.release_focus()


func _handle_line_edit_focus_entered():
	GameManager.set_chat_activated(true)


func _handle_line_edit_focus_exited():
	GameManager.set_chat_activated(false)
