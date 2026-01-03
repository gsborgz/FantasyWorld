extends HTTPRequest

#const BASE_URL := "http://localhost:3000"
const BASE_URL := "https://animated-telegram-pgjwjjgrgp6c7rgq-3003.app.github.dev"
var _current_on_complete: Callable

class ResponseData:
	var _code: int
	var _body: Variant
	
	func _init(code: int = 0, body: Variant = null) -> void:
		_code = code
		_body = body
	
	func get_code() -> int:
		return _code
	
	func set_code(code: int) -> void:
		_code = code
	
	func get_body() -> Variant:
		return _body
	
	func set_body(body: Variant) -> void:
		_body = body
	
	func ok() -> bool:
		return _code >= 200 and _code <= 299

class GenericResponseBody:
	var message: String


func get_data(url: String, on_complete: Callable) -> void:
	_prepare_request(on_complete)
	
	var apiPath = BASE_URL + url
	
	self.request(apiPath)


func post_data(url: String, data: Variant, on_complete: Callable) -> void:
	_prepare_request(on_complete)
	
	var apiPath = BASE_URL + url
	var json = JSON.stringify(data)
	var headers = ["Content-Type: application/json"]
	
	self.request(apiPath, headers, HTTPClient.METHOD_POST, json)


func _ready() -> void:
	self.set_use_threads(true)
	self.request_completed.connect(_format_data_on_completed)


func _prepare_request(on_complete: Callable):
	self.cancel_request()
	self.set_use_threads(true)
	
	_current_on_complete = on_complete


@warning_ignore("unused_parameter")
func _format_data_on_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	var response = ResponseData.new(response_code)
	var parsed = JSON.parse_string(body.get_string_from_utf8())
	
	if parsed != null:
		response.set_body(parsed)
	else:
		var responseBody = GenericResponseBody.new()
		
		responseBody.message = "Falha ao transformar body"
		
		response.set_body(responseBody)
	
	_current_on_complete.call(response)
