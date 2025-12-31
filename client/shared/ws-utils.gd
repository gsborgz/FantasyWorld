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
    PONG = 15,
    OK_RESPONSE = 16,
    DENY_RESPONSE = 17,
    GLOBAL_CHAT_MESSAGE = 18,
    INSTANCE_CHAT_MESSAGE = 19,
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
