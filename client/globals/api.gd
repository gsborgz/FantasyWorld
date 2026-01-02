extends Node

#const BASE_URL := "https://fw-auth-8am6scgs1-gabriel-da-silva-borges-projects.vercel.app"
const BASE_URL := "http://localhost:3000"

var http_request: HTTPRequest
var _current_handler: Callable
var _original_handler: Callable
var _last_url: String = ""
var _last_headers: Array = []
var _last_method: int = HTTPClient.METHOD_GET
var _last_body: String = ""
var _redirect_count: int = 0
var _max_redirects: int = 5


func _ready() -> void:
	http_request = get_node_or_null("HTTPRequest")
	if http_request == null:
		http_request = HTTPRequest.new()
		http_request.name = "HTTPRequest"
		add_child(http_request)
	_current_handler = Callable()
	_original_handler = Callable()


func _prepare_request(on_complete: Callable) -> void:
	# Cancela qualquer requisição em andamento
	http_request.cancel_request()
	# Desconecta o handler anterior (se houver)
	if _current_handler != Callable():
		if http_request.request_completed.is_connected(_current_handler):
			http_request.request_completed.disconnect(_current_handler)
	# Conecta o handler interno que trata redirects e registra handler original
	_original_handler = on_complete
	http_request.request_completed.connect(_on_request_completed)
	_current_handler = _on_request_completed
	_redirect_count = 0

func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	# Trata redirecionamentos 3xx (inclui 308 Permanent Redirect)
	if response_code == 301 or response_code == 302 or response_code == 303 or response_code == 307 or response_code == 308:
		if _redirect_count >= _max_redirects:
			# Estoura limite de redirects: retorna para o handler original
			if _original_handler != Callable():
				_original_handler.call(result, response_code, headers, body)
			return

		var location := _extract_location(headers)
		if location == "":
			# Sem Location: não há o que seguir
			if _original_handler != Callable():
				_original_handler.call(result, response_code, headers, body)
			return

		# Monta URL absoluta se vier relativa
		var next_url := location
		if not next_url.begins_with("http://") and not next_url.begins_with("https://"):
			if next_url.begins_with("/"):
				next_url = BASE_URL + next_url
			else:
				next_url = BASE_URL + "/" + next_url

		_redirect_count += 1
		_last_url = next_url
		# Reenvia requisição com mesmo método/headers/body
		http_request.request(_last_url, _last_headers, _last_method, _last_body)
		return

	# Resposta final (não-redirect): encaminha para o handler original
	if _original_handler != Callable():
		_original_handler.call(result, response_code, headers, body)

func _extract_location(headers: PackedStringArray) -> String:
	for h in headers:
		# Headers vêm no formato "Chave: Valor"
		var sep := h.find(":")
		if sep == -1:
			continue
		var key := h.substr(0, sep).strip_edges().to_lower()
		var value := h.substr(sep + 1).strip_edges()
		if key == "location":
			return value
	return ""


func get_data(url: String, on_complete: Callable) -> void:
	var apiPath = BASE_URL + url
	
	_prepare_request(on_complete)
	_last_url = apiPath
	_last_headers = []
	_last_method = HTTPClient.METHOD_GET
	_last_body = ""
	http_request.request(_last_url)


func post_data(url: String, data: Variant, on_complete: Callable) -> void:
	var apiPath = BASE_URL + url
	var json = JSON.stringify(data)
	var headers = ["Content-Type: application/json"]
	
	print(apiPath)
	
	_prepare_request(on_complete)
	_last_url = apiPath
	_last_headers = headers
	_last_method = HTTPClient.METHOD_POST
	_last_body = json
	http_request.request(_last_url, _last_headers, _last_method, _last_body)
