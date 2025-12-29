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
