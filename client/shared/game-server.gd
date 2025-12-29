class GameServerInfo:
    var name: String
    var location: String
    var url: String
    var status: Variant

    func _init(_name: String = "", _location: String = "", _url: String = "", _status: Variant = null):
        name = _name
        location = _location
        url = _url
        status = _status
