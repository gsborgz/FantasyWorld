extends Node

var http_request: HTTPRequest
var _current_handler: Callable


func _ready() -> void:
	http_request = get_node_or_null("HTTPRequest")
	if http_request == null:
		http_request = HTTPRequest.new()
		http_request.name = "HTTPRequest"
		add_child(http_request)
	_current_handler = Callable()


func _prepare_request(on_complete: Callable) -> void:
	# Cancela qualquer requisição em andamento
	http_request.cancel_request()
	# Desconecta o handler anterior (se houver)
	if _current_handler != Callable():
		if http_request.request_completed.is_connected(_current_handler):
			http_request.request_completed.disconnect(_current_handler)
	# Conecta apenas o novo handler e registra como atual
	http_request.request_completed.connect(on_complete)
	_current_handler = on_complete


func get_data(url: String, on_complete: Callable) -> void:
	_prepare_request(on_complete)
	http_request.request(url)


func post_data(url: String, data: Variant, on_complete: Callable) -> void:
	var json = JSON.stringify(data)
	var headers = ["Content-Type: application/json"]
	_prepare_request(on_complete)
	http_request.request(url, headers, HTTPClient.METHOD_POST, json)
