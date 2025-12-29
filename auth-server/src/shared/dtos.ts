export class LoginData {
  username: string;
  password: string;
}

export class RegisterData {
  username: string;
  password: string;
  passwordConfirmation: string;
}

export class BaseMessage {

  message: string | { key: string; args?: Record<string, any> };

}

export class MeResponse {

  id: string;
  username: string;

}

export class SessionData {

  token: string;

}
