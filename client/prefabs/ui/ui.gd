class_name UI
extends CanvasLayer

@onready var _chat: Chat = $Chat


func setChatPlayers(players: Dictionary[String, Player]) -> void:
	_chat.players = players
