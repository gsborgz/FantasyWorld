# This file is auto-generated. Do not edit by hand.
# Source: game-server/src/shared/dtos.ts

extends RefCounted

enum WebsocketEvents { NONE, SELECT_CHARACTER, UPDATE_POSITION, JOIN_INSTANCE, LOGIN, PING, ADD_CHARACTER, LIST_CHARACTERS, DELETE_CHARACTER, POSITION_UPDATED, CHARACTER_ADDED, CHARACTERS_LISTED, CHARACTER_SELECTED, CHARACTER_DELETED, INSTANCE_LEFT, INSTANCE_JOINED, PONG, OK_RESPONSE, DENY_RESPONSE, GLOBAL_CHAT_MESSAGE, INSTANCE_CHAT_MESSAGE }

const WorldInstance: Dictionary = {
  "Forest": 'forest',
  "Village": 'village'
}

enum Direction { UP, DOWN, LEFT, RIGHT }


class WebsocketMessage:
  var clientId: String = ""
  var type: Variant = null
  var data: Variant = null

  func to_dict() -> Dictionary:
    return {
      "clientId": clientId,
      "type": type,
      "data": data,
    }

  static func from_dict(d: Dictionary) -> WebsocketMessage:
    var o := WebsocketMessage.new()
    if d.has("clientId"): o.clientId = d["clientId"]
    if d.has("type"): o.type = d["type"]
    if d.has("data"): o.data = d["data"]
    return o

class ChatMessage:
  var text: String = ""
  var senderName: String = ""

  func to_dict() -> Dictionary:
    return {
      "text": text,
      "senderName": senderName,
    }

  static func from_dict(d: Dictionary) -> ChatMessage:
    var o := ChatMessage.new()
    if d.has("text"): o.text = d["text"]
    if d.has("senderName"): o.senderName = d["senderName"]
    return o

class CharacterPosition:
  var characterId: Variant = null
  var x: float = 0.0
  var y: float = 0.0
  var direction: Variant = null
  var speed: float = 0.0

  func to_dict() -> Dictionary:
    return {
      "characterId": characterId,
      "x": x,
      "y": y,
      "direction": direction,
      "speed": speed,
    }

  static func from_dict(d: Dictionary) -> CharacterPosition:
    var o := CharacterPosition.new()
    if d.has("characterId"): o.characterId = d["characterId"]
    if d.has("x"): o.x = d["x"]
    if d.has("y"): o.y = d["y"]
    if d.has("direction"): o.direction = d["direction"]
    if d.has("speed"): o.speed = d["speed"]
    return o

class AuthenticationRequest:
  var sid: String = ""

  func to_dict() -> Dictionary:
    return {
      "sid": sid,
    }

  static func from_dict(d: Dictionary) -> AuthenticationRequest:
    var o := AuthenticationRequest.new()
    if d.has("sid"): o.sid = d["sid"]
    return o

class SelectCharacterRequest:
  var characterId: String = ""

  func to_dict() -> Dictionary:
    return {
      "characterId": characterId,
    }

  static func from_dict(d: Dictionary) -> SelectCharacterRequest:
    var o := SelectCharacterRequest.new()
    if d.has("characterId"): o.characterId = d["characterId"]
    return o

class DeleteCharacterRequest:
  var characterId: String = ""

  func to_dict() -> Dictionary:
    return {
      "characterId": characterId,
    }

  static func from_dict(d: Dictionary) -> DeleteCharacterRequest:
    var o := DeleteCharacterRequest.new()
    if d.has("characterId"): o.characterId = d["characterId"]
    return o

class AddCharacterRequest:
  var name: String = ""

  func to_dict() -> Dictionary:
    return {
      "name": name,
    }

  static func from_dict(d: Dictionary) -> AddCharacterRequest:
    var o := AddCharacterRequest.new()
    if d.has("name"): o.name = d["name"]
    return o

class JoinInstanceRequest:
  var instancePath: String = ""
  var x: float = 0.0
  var y: float = 0.0
  var direction: Variant = null

  func to_dict() -> Dictionary:
    return {
      "instancePath": instancePath,
      "x": x,
      "y": y,
      "direction": direction,
    }

  static func from_dict(d: Dictionary) -> JoinInstanceRequest:
    var o := JoinInstanceRequest.new()
    if d.has("instancePath"): o.instancePath = d["instancePath"]
    if d.has("x"): o.x = d["x"]
    if d.has("y"): o.y = d["y"]
    if d.has("direction"): o.direction = d["direction"]
    return o

class GameServerResponse:
  var name: String = ""
  var region: String = ""
  var url: String = ""

  func to_dict() -> Dictionary:
    return {
      "name": name,
      "region": region,
      "url": url,
    }

  static func from_dict(d: Dictionary) -> GameServerResponse:
    var o := GameServerResponse.new()
    if d.has("name"): o.name = d["name"]
    if d.has("region"): o.region = d["region"]
    if d.has("url"): o.url = d["url"]
    return o

# --- Type aliases (best-effort) ---

# NOTE: 'ClientCharacter' was a TypeScript type alias; generated as a best-effort class.
class ClientCharacter:
  var speed: float = 0.0
  var lastPositionUpdate: int = 0

  func to_dict() -> Dictionary:
    return {
      "speed": speed,
      "lastPositionUpdate": lastPositionUpdate,
    }

  static func from_dict(d: Dictionary) -> ClientCharacter:
    var o := ClientCharacter.new()
    if d.has("speed"): o.speed = d["speed"]
    if d.has("lastPositionUpdate"): o.lastPositionUpdate = d["lastPositionUpdate"]
    return o
