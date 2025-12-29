class LoginData:
    var username: String
    var password: String

    func _init(_username: String = "", _password: String = ""):
        username = _username
        password = _password

class RegisterData:
    var username: String
    var password: String
    var passwordConfirmation: String

    func _init(_username: String = "", _password: String = "", _passwordConfirmation: String = ""):
        username = _username
        password = _password
        passwordConfirmation = _passwordConfirmation

class BaseMessage:
    var message: Variant

    func _init(_message: Variant = null):
        message = _message

class MeResponse:
    var id: String
    var username: String

    func _init(_id: String = "", _username: String = ""):
        id = _id
        username = _username

class SessionData:
    var token: String

    func _init(_token: String = ""):
        token = _token

class GameServerInfo:
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
