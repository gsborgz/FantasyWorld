enum WebsocketEvents {
  NONE,
  SELECT_CHARACTER,
  UPDATE_POSITION,
  JOIN_INSTANCE,
  LOGIN,
  PING,
  ADD_CHARACTER,
  LIST_CHARACTERS,
  DELETE_CHARACTER,
  POSITION_UPDATED,
  CHARACTER_ADDED,
  CHARACTERS_LISTED,
  CHARACTER_SELECTED,
  CHARACTER_DELETED,
  LEFT_INSTANCE,
  PONG,
  OK_RESPONSE,
  DENY_RESPONSE,
  GLOBAL_CHAT_MESSAGE,
  INSTANCE_CHAT_MESSAGE
}

const WorldInstance = {
  "Forest": "forest",
  "Village": "village"
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

class WebsocketMessage:
  var clientId: String
  var type: WebsocketEvents
  var data: Variant

  func _init(dict: Dictionary = {}) -> void:
    clientId = dict.get("clientId", "")
    type = dict.get("type", 0)
    data = dict.get("data", null)

class ChatMessage:
  var text: String
  var senderName: String

  func _init(dict: Dictionary = {}) -> void:
    text = dict.get("text", "")
    senderName = dict.get("senderName", "")

class AuthenticationRequest:
  var sid: String

  func _init(dict: Dictionary = {}) -> void:
    sid = dict.get("sid", "")

class SelectCharacterRequest:
  var characterId: String

  func _init(dict: Dictionary = {}) -> void:
    characterId = dict.get("characterId", "")

class DeleteCharacterRequest:
  var characterId: String

  func _init(dict: Dictionary = {}) -> void:
    characterId = dict.get("characterId", "")

class AddCharacterRequest:
  var name: String

  func _init(dict: Dictionary = {}) -> void:
    name = dict.get("name", "")

class ClientCharacter:
  var id: String
  var name: String
  var instancePath: String
  var x: float
  var y: float
  var direction: Direction
  var userId: String
  var speed: float
  var lastPositionUpdate: float
  var is_moving: bool
  var is_running: bool

  func _init(dict: Dictionary = {}) -> void:
    id = dict.get("id", "")
    name = dict.get("name", "")
    instancePath = dict.get("instancePath", "")
    x = dict.get("x", 0.0)
    y = dict.get("y", 0.0)
    direction = dict.get("direction", 0)
    userId = dict.get("userId", "")
    speed = dict.get("speed", 0.0)
    lastPositionUpdate = dict.get("lastPositionUpdate", 0.0)
    is_moving = dict.get("is_moving", false)
    is_running = dict.get("is_running", false)

class GameServerResponse:
  var name: String
  var region: String
  var url: String

  func _init(dict: Dictionary = {}) -> void:
    name = dict.get("name", "")
    region = dict.get("region", "")
    url = dict.get("url", "")