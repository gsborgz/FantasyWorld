extends BoxContainer

const ServerOption := preload("res://prefabs/server_option/server_option.gd")
const Scene := preload("res://prefabs/server_option/server_option.tscn")
const _ws_utils := preload("res://shared/ws-utils.gd")

@onready var _sever_name: Label = $SeverName
@onready var _enter_button: Button = $EnterButton
@onready var _server_status: Label = $ServerStatus

var server_name: String
var server_location: String
var server_url: String
var server_status: String


@warning_ignore("shadowed_variable")
static func instantiate(server_name: String, server_location: String, server_status: String, server_url: String) -> ServerOption:
	var server_option := Scene.instantiate()
	
	server_option.server_name = server_name
	server_option.server_location = server_location
	server_option.server_status = server_status
	server_option.server_url = server_url
	
	return server_option


func _ready() -> void:
	_sever_name.text = server_name
	_server_status.text = server_status
	
	if server_status == 'offline':
		_enter_button.disabled = true
	else:
		_enter_button.disabled = false
		_enter_button.pressed.connect(_on_enter_button_pressed)


func _on_enter_button_pressed() -> void:
	WS.clear()
	
	if not WS.connected_to_server.is_connected(_on_ws_connected_to_server_once):
		WS.connected_to_server.connect(_on_ws_connected_to_server_once)
	
	if server_url:
		var ws_url := _to_ws_url(server_url)
		print("Connecting to:", ws_url)
		WS.connect_to_url(ws_url)
	else:
		print("URL do servidor inválida")


func _on_ws_connected_to_server_once() -> void:
	var message := _ws_utils.WebsocketMessage.new()
	
	message.type = _ws_utils.WebsocketEvents.LOGIN_REQUEST
	message.data = {
		"sid" = Session.getId()
	}
	
	WS.send(message)
	
	if WS.connected_to_server.is_connected(_on_ws_connected_to_server_once):
		WS.connected_to_server.disconnect(_on_ws_connected_to_server_once)


# Converte http/https para ws/wss e garante path padrão /ws
func _to_ws_url(url: String) -> String:
	var u := url.strip_edges()
	if u.begins_with("ws://") or u.begins_with("wss://"):
		return _ensure_ws_path(u)
	if u.begins_with("http://"):
		return _ensure_ws_path("ws://" + u.substr(7))
	if u.begins_with("https://"):
		return _ensure_ws_path("wss://" + u.substr(8))
	# Sem esquema, assume ws://
	return _ensure_ws_path("ws://" + u)


func _ensure_ws_path(u: String) -> String:
	# Se já tiver um caminho ("/...") mantém; se não, adiciona /ws
	var idx := u.find("/", 6) # após esquema
	if idx == -1:
		return u + "/ws"
	# Se já inclui /ws em qualquer posição, mantém
	if u.find("/ws", 6) != -1:
		return u
	return u
