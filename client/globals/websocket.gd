class_name WebSocketClient
extends Node

const _dtos := preload("res://shared/dtos.gd")

@export var handshake_headers: PackedStringArray
@export var supported_protocols: PackedStringArray

var tls_options: TLSOptions = null
var socket := WebSocketPeer.new()
var last_state := WebSocketPeer.STATE_CLOSED

signal connected_to_server()
signal connection_closed()
signal message_received(message: _dtos.WebsocketMessage)


func connect_to_url(url: String) -> int:
	socket.supported_protocols = supported_protocols
	socket.handshake_headers = handshake_headers

	var err := socket.connect_to_url(url, tls_options)
	if err != OK:
		return err

	last_state = socket.get_ready_state()
	return OK


func send(msg: _dtos.WebsocketMessage) -> int:
	var payload_data = msg.data
	if typeof(payload_data) == TYPE_OBJECT and payload_data != null and payload_data.has_method("to_dict"):
		payload_data = payload_data.to_dict()
	
	var json_obj := {
		"clientId": GameManager.get_session_client_id(),
		"type": msg.type,
		"data": payload_data,
	}
	
	var json_str = JSON.stringify(json_obj)
	
	return socket.send_text(json_str)


func get_message() -> Variant:
	if socket.get_available_packet_count() < 1:
		return null

	var data := socket.get_packet()
	if socket.was_string_packet():
		var json = JSON.new()
		var err = json.parse(data.get_string_from_utf8())

		if err == OK:
			if typeof(json.data) == TYPE_DICTIONARY:
				var dict: Dictionary = json.data
				var msg := _dtos.WebsocketMessage.new()
				msg.type = dict.get("type", _dtos.WebsocketEvents.NONE)
				var payload = dict.get("data", null)
				if typeof(payload) == TYPE_DICTIONARY:
					payload["clientId"] = dict.get("clientId", "")
				msg.data = payload
				return msg
			return null
		return null
	return null


func close(code: int = 1000, reason: String = "") -> void:
	socket.close(code, reason)
	last_state = socket.get_ready_state()


func clear() -> void:
	socket = WebSocketPeer.new()
	last_state = socket.get_ready_state()


func poll() -> void:
	if socket.get_ready_state() != socket.STATE_CLOSED:
		socket.poll()

	var state := socket.get_ready_state()

	if last_state != state:
		last_state = state
		if state == socket.STATE_OPEN:
			connected_to_server.emit()
		elif state == socket.STATE_CLOSED:
			connection_closed.emit()
	while socket.get_ready_state() == socket.STATE_OPEN and socket.get_available_packet_count():
		var msg = get_message()
		if msg != null:
			message_received.emit(msg)


func _process(_delta: float) -> void:
	poll()
