enum WebsocketEvents {
    NONE = 0,
    JOIN_INSTANCE = 1,
    GLOBAL_CHAT_MESSAGE = 2,
    INSTANCE_CHAT_MESSAGE = 3,
    LEAVE_INSTANCE = 4,
    LOGIN_REQUEST = 5,
    REGISTER_REQUEST = 6,
    OK_RESPONSE = 7,
    DENY_RESPONSE = 8,
    PING = 9,
    PONG = 10,
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
