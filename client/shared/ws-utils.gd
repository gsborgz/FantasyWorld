enum WebsocketEvents {
    NONE = 0,
    JOIN_INSTANCE = 1,
    GLOBAL_CHAT_MESSAGE = 2,
    LEAVE_INSTANCE = 3,
    LOGIN_REQUEST = 4,
    REGISTER_REQUEST = 5,
    OK_RESPONSE = 6,
    DENY_RESPONSE = 7,
    PING = 8,
    PONG = 9,
}

class JoinInstanceData:
    var instance: String

    func _init(_instance: String = ""):
        instance = _instance

class WebsocketMessage:
    var client_sid: String
    var type: int
    var data: Variant

    func _init(_client_sid: String = "", _type: int = 0, _data: Variant = null):
        client_sid = _client_sid
        type = _type
        data = _data
