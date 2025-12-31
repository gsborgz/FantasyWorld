extends Node

const _dtos := preload("res://shared/dtos.gd")

var _sid: String
var _character: _dtos.CharacterResponse
var _client_id: String


func setSid(sid: String) -> void:
	_sid = sid


func getSid() -> String:
	return _sid


func setCharacter(character: _dtos.CharacterResponse) -> void:
	_character = character


func getCharacter() -> _dtos.CharacterResponse:
	return _character

func setClientId(client_id: String) -> void:
	_client_id = client_id

func getClientId() -> String:
	return _client_id
