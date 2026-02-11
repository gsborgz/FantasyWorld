enum WebsocketEvents {
	NONE = 0,
	SELECT_CHARACTER = 1,
	UPDATE_POSITION = 2,
	JOIN_INSTANCE = 3,
	LOGIN = 4,
	PING = 5,
	ADD_CHARACTER = 6,
	LIST_CHARACTERS = 7,
	DELETE_CHARACTER = 8,
	POSITION_UPDATED = 9,
	CHARACTER_ADDED = 10,
	CHARACTERS_LISTED = 11,
	CHARACTER_SELECTED = 12,
	CHARACTER_DELETED = 13,
	INSTANCE_LEFT = 14,
	INSTANCE_JOINED = 15,
	PONG = 16,
	OK_RESPONSE = 17,
	DENY_RESPONSE = 18,
	GLOBAL_CHAT_MESSAGE = 19,
	INSTANCE_CHAT_MESSAGE = 20,
}

const WorldInstance = {
	"Forest": "forest",
	"Village": "village",
}

enum Direction {
	UP = 0,
	DOWN = 1,
	LEFT = 2,
	RIGHT = 3,
}

class WebsocketMessage:
	var type: int
	var data: Variant

	func _init(_type: int = 0, _data: Variant = null):
		type = _type
		data = _data

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["type"] = type
		var payload = data
		if typeof(payload) == TYPE_OBJECT and payload != null and payload.has_method("to_dict"):
			payload = payload.to_dict()
		d["data"] = payload
		return d

	func _to_string() -> String:
		var payload_data = data
		if typeof(payload_data) == TYPE_OBJECT and payload_data != null and payload_data.has_method("to_dict"):
			payload_data = payload_data.to_dict()
		var json_obj := {
			"type": type,
			"data": payload_data,
		}
		return JSON.stringify(json_obj)

class ChatMessage:
	var text: String
	var senderName: String

	func _init(_text: String = "", _senderName: String = ""):
		text = _text
		senderName = _senderName

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["text"] = text
		d["senderName"] = senderName
		return d

	static func from(value: Variant) -> ChatMessage:
		if typeof(value) == TYPE_OBJECT and value is ChatMessage:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := ChatMessage.new()
			obj.text = raw.get("text", "")
			obj.senderName = raw.get("senderName", "")
			return obj
		return null

class CharacterPosition:
	var characterId: String
	var x: float
	var y: float
	var direction: int
	var speed: float

	func _init(_characterId: String = "", _x: float = 0.0, _y: float = 0.0, _direction: int = 0, _speed: float = 0.0):
		characterId = _characterId
		x = _x
		y = _y
		direction = _direction
		speed = _speed

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["characterId"] = characterId
		d["x"] = x
		d["y"] = y
		d["direction"] = direction
		d["speed"] = speed
		return d

	static func from(value: Variant) -> CharacterPosition:
		if typeof(value) == TYPE_OBJECT and value is CharacterPosition:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := CharacterPosition.new()
			obj.characterId = raw.get("characterId", "")
			obj.x = raw.get("x", 0.0)
			obj.y = raw.get("y", 0.0)
			obj.direction = raw.get("direction", 0)
			obj.speed = raw.get("speed", 0.0)
			return obj
		return null

class AuthenticationRequest:
	var sid: String

	func _init(_sid: String = ""):
		sid = _sid

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["sid"] = sid
		return d

	static func from(value: Variant) -> AuthenticationRequest:
		if typeof(value) == TYPE_OBJECT and value is AuthenticationRequest:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := AuthenticationRequest.new()
			obj.sid = raw.get("sid", "")
			return obj
		return null

class SelectCharacterRequest:
	var characterId: String

	func _init(_characterId: String = ""):
		characterId = _characterId

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["characterId"] = characterId
		return d

	static func from(value: Variant) -> SelectCharacterRequest:
		if typeof(value) == TYPE_OBJECT and value is SelectCharacterRequest:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := SelectCharacterRequest.new()
			obj.characterId = raw.get("characterId", "")
			return obj
		return null

class DeleteCharacterRequest:
	var characterId: String

	func _init(_characterId: String = ""):
		characterId = _characterId

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["characterId"] = characterId
		return d

	static func from(value: Variant) -> DeleteCharacterRequest:
		if typeof(value) == TYPE_OBJECT and value is DeleteCharacterRequest:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := DeleteCharacterRequest.new()
			obj.characterId = raw.get("characterId", "")
			return obj
		return null

class AddCharacterRequest:
	var name: String

	func _init(_name: String = ""):
		name = _name

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["name"] = name
		return d

	static func from(value: Variant) -> AddCharacterRequest:
		if typeof(value) == TYPE_OBJECT and value is AddCharacterRequest:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := AddCharacterRequest.new()
			obj.name = raw.get("name", "")
			return obj
		return null

class JoinInstanceRequest:
	var instancePath: String
	var x: float
	var y: float
	var direction: int

	func _init(_instancePath: String = "", _x: float = 0.0, _y: float = 0.0, _direction: int = 0):
		instancePath = _instancePath
		x = _x
		y = _y
		direction = _direction

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["instancePath"] = instancePath
		d["x"] = x
		d["y"] = y
		d["direction"] = direction
		return d

	static func from(value: Variant) -> JoinInstanceRequest:
		if typeof(value) == TYPE_OBJECT and value is JoinInstanceRequest:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := JoinInstanceRequest.new()
			obj.instancePath = raw.get("instancePath", "")
			obj.x = raw.get("x", 0.0)
			obj.y = raw.get("y", 0.0)
			obj.direction = raw.get("direction", 0)
			return obj
		return null

class GameServerResponse:
	var name: String
	var region: String
	var url: String

	func _init(_name: String = "", _region: String = "", _url: String = ""):
		name = _name
		region = _region
		url = _url

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["name"] = name
		d["region"] = region
		d["url"] = url
		return d

	static func from(value: Variant) -> GameServerResponse:
		if typeof(value) == TYPE_OBJECT and value is GameServerResponse:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := GameServerResponse.new()
			obj.name = raw.get("name", "")
			obj.region = raw.get("region", "")
			obj.url = raw.get("url", "")
			return obj
		return null

class ClientCharacter:
	var id: String
	var createdAt: Variant
	var updatedAt: Variant
	var name: String
	var instancePath: String
	var x: float
	var y: float
	var direction: int
	var userId: String
	var speed: float
	var lastPositionUpdate: int

	func _init(_id: String = "", _createdAt: Variant = null, _updatedAt: Variant = null, _name: String = "", _instancePath: String = "", _x: float = 0.0, _y: float = 0.0, _direction: int = 0, _userId: String = "", _speed: float = 0.0, _lastPositionUpdate: int = 0):
		id = _id
		createdAt = _createdAt
		updatedAt = _updatedAt
		name = _name
		instancePath = _instancePath
		x = _x
		y = _y
		direction = _direction
		userId = _userId
		speed = _speed
		lastPositionUpdate = _lastPositionUpdate

	func to_dict() -> Dictionary:
		var d: Dictionary = {}
		d["id"] = id
		d["createdAt"] = createdAt
		d["updatedAt"] = updatedAt
		d["name"] = name
		d["instancePath"] = instancePath
		d["x"] = x
		d["y"] = y
		d["direction"] = direction
		d["userId"] = userId
		d["speed"] = speed
		d["lastPositionUpdate"] = lastPositionUpdate
		return d

	static func from(value: Variant) -> ClientCharacter:
		if typeof(value) == TYPE_OBJECT and value is ClientCharacter:
			return value
		if typeof(value) == TYPE_DICTIONARY:
			var raw: Dictionary = value
			var obj := ClientCharacter.new()
			obj.id = raw.get("id", "")
			obj.createdAt = raw.get("createdAt", null)
			obj.updatedAt = raw.get("updatedAt", null)
			obj.name = raw.get("name", "")
			obj.instancePath = raw.get("instancePath", "")
			obj.x = raw.get("x", 0.0)
			obj.y = raw.get("y", 0.0)
			obj.direction = raw.get("direction", 0)
			obj.userId = raw.get("userId", "")
			obj.speed = raw.get("speed", 0.0)
			obj.lastPositionUpdate = raw.get("lastPositionUpdate", 0)
			return obj
		return null
