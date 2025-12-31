enum Direction {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3,
}

class LoginData:
    var username: String
    var password: String

    func _init(_username: String = "", _password: String = ""):
        username = _username
        password = _password

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["username"] = username
        d["password"] = password
        return d

    static func from(value: Variant) -> LoginData:
        if typeof(value) == TYPE_OBJECT and value is LoginData:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := LoginData.new()
            obj.username = raw.get("username", "")
            obj.password = raw.get("password", "")
            return obj
        return null

class RegisterData:
    var username: String
    var password: String
    var passwordConfirmation: String

    func _init(_username: String = "", _password: String = "", _passwordConfirmation: String = ""):
        username = _username
        password = _password
        passwordConfirmation = _passwordConfirmation

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["username"] = username
        d["password"] = password
        d["passwordConfirmation"] = passwordConfirmation
        return d

    static func from(value: Variant) -> RegisterData:
        if typeof(value) == TYPE_OBJECT and value is RegisterData:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := RegisterData.new()
            obj.username = raw.get("username", "")
            obj.password = raw.get("password", "")
            obj.passwordConfirmation = raw.get("passwordConfirmation", "")
            return obj
        return null

class BaseMessage:
    var message: Variant

    func _init(_message: Variant = null):
        message = _message

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["message"] = message
        return d

    static func from(value: Variant) -> BaseMessage:
        if typeof(value) == TYPE_OBJECT and value is BaseMessage:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := BaseMessage.new()
            obj.message = raw.get("message", null)
            return obj
        return null

class MeResponse:
    var id: String
    var username: String

    func _init(_id: String = "", _username: String = ""):
        id = _id
        username = _username

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["id"] = id
        d["username"] = username
        return d

    static func from(value: Variant) -> MeResponse:
        if typeof(value) == TYPE_OBJECT and value is MeResponse:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := MeResponse.new()
            obj.id = raw.get("id", "")
            obj.username = raw.get("username", "")
            return obj
        return null

class SessionData:
    var token: String

    func _init(_token: String = ""):
        token = _token

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["token"] = token
        return d

    static func from(value: Variant) -> SessionData:
        if typeof(value) == TYPE_OBJECT and value is SessionData:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := SessionData.new()
            obj.token = raw.get("token", "")
            return obj
        return null

class LoginRequest:
    var sid: String

    func _init(_sid: String = ""):
        sid = _sid

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["sid"] = sid
        return d

    static func from(value: Variant) -> LoginRequest:
        if typeof(value) == TYPE_OBJECT and value is LoginRequest:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := LoginRequest.new()
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

class UpdatePositionRequest:
    var x: float
    var y: float
    var direction: int
    var speed: float

    func _init(_x: float = 0.0, _y: float = 0.0, _direction: int = 0, _speed: float = 0.0):
        x = _x
        y = _y
        direction = _direction
        speed = _speed

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["x"] = x
        d["y"] = y
        d["direction"] = direction
        d["speed"] = speed
        return d

    static func from(value: Variant) -> UpdatePositionRequest:
        if typeof(value) == TYPE_OBJECT and value is UpdatePositionRequest:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := UpdatePositionRequest.new()
            obj.x = raw.get("x", 0.0)
            obj.y = raw.get("y", 0.0)
            obj.direction = raw.get("direction", 0)
            obj.speed = raw.get("speed", 0.0)
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

class UpdatePositionResponse:
    var characterId: String
    var characterName: String
    var x: float
    var y: float
    var direction: int
    var speed: float

    func _init(_characterId: String = "", _characterName: String = "", _x: float = 0.0, _y: float = 0.0, _direction: int = 0, _speed: float = 0.0):
        characterId = _characterId
        characterName = _characterName
        x = _x
        y = _y
        direction = _direction
        speed = _speed

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["characterId"] = characterId
        d["characterName"] = characterName
        d["x"] = x
        d["y"] = y
        d["direction"] = direction
        d["speed"] = speed
        return d

    static func from(value: Variant) -> UpdatePositionResponse:
        if typeof(value) == TYPE_OBJECT and value is UpdatePositionResponse:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := UpdatePositionResponse.new()
            obj.characterId = raw.get("characterId", "")
            obj.characterName = raw.get("characterName", "")
            obj.x = raw.get("x", 0.0)
            obj.y = raw.get("y", 0.0)
            obj.direction = raw.get("direction", 0)
            obj.speed = raw.get("speed", 0.0)
            return obj
        return null

class GameServerResponse:
    var name: String
    var location: String
    var url: String
    var status: Variant
    var clientsCount: float

    func _init(_name: String = "", _location: String = "", _url: String = "", _status: Variant = null, _clientsCount: float = 0.0):
        name = _name
        location = _location
        url = _url
        status = _status
        clientsCount = _clientsCount

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["name"] = name
        d["location"] = location
        d["url"] = url
        d["status"] = status
        d["clientsCount"] = clientsCount
        return d

    static func from(value: Variant) -> GameServerResponse:
        if typeof(value) == TYPE_OBJECT and value is GameServerResponse:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := GameServerResponse.new()
            obj.name = raw.get("name", "")
            obj.location = raw.get("location", "")
            obj.url = raw.get("url", "")
            obj.status = raw.get("status", null)
            obj.clientsCount = raw.get("clientsCount", 0.0)
            return obj
        return null

class CharactersListResponse:
    var characters: Array

    func _init(_characters: Array = []):
        characters = _characters

    func to_dict() -> Dictionary:
        var d: Dictionary = {}
        d["characters"] = characters
        return d

    static func from(value: Variant) -> CharactersListResponse:
        if typeof(value) == TYPE_OBJECT and value is CharactersListResponse:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := CharactersListResponse.new()
            obj.characters = []
            if raw.has("characters") and typeof(raw["characters"]) == TYPE_ARRAY:
                for it in raw["characters"]:
                    var conv = CharacterResponse.from(it)
                    if conv != null:
                        obj.characters.append(conv)
                    else:
                        obj.characters.append(it)
            return obj
        return null

class CharacterResponse:
    var id: String
    var createdAt: Variant
    var updatedAt: Variant
    var name: String
    var instancePath: String
    var x: float
    var y: float
    var direction: int
    var userId: String

    func _init(_id: String = "", _createdAt: Variant = null, _updatedAt: Variant = null, _name: String = "", _instancePath: String = "", _x: float = 0.0, _y: float = 0.0, _direction: int = 0, _userId: String = ""):
        id = _id
        createdAt = _createdAt
        updatedAt = _updatedAt
        name = _name
        instancePath = _instancePath
        x = _x
        y = _y
        direction = _direction
        userId = _userId

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
        return d

    static func from(value: Variant) -> CharacterResponse:
        if typeof(value) == TYPE_OBJECT and value is CharacterResponse:
            return value
        if typeof(value) == TYPE_DICTIONARY:
            var raw: Dictionary = value
            var obj := CharacterResponse.new()
            obj.id = raw.get("id", "")
            obj.createdAt = raw.get("createdAt", null)
            obj.updatedAt = raw.get("updatedAt", null)
            obj.name = raw.get("name", "")
            obj.instancePath = raw.get("instancePath", raw.get("instance", ""))
            obj.x = raw.get("x", 0.0)
            obj.y = raw.get("y", 0.0)
            obj.direction = raw.get("direction", 0)
            obj.userId = raw.get("userId", "")
            return obj
        return null
