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

class ChatMessage:
  var text: String
  var senderName: String

class AuthenticationRequest:
  var sid: String

class SelectCharacterRequest:
  var characterId: String

class DeleteCharacterRequest:
  var characterId: String

class AddCharacterRequest:
  var name: String

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

class GameServerResponse:
  var name: String
  var region: String
  var url: String
