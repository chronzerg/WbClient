define(['messages', 'logging'], function client2ServerModule (messages, logging) {
	var logging = logging('client2Server');
	var log = logging.log;

	return function C2SWrapper (url) {
		if (!window.WebSocket) {
			log('WebSockets are not supported.', logging.ERROR);
			throw new Error('WebSockets are not supported.');
		}

		var conn = new WebSocket(url, ['wishbanana']);
		var thisWrapper = this;

		function sendMessage (msg) {
			var strMsg = JSON.stringify(msg);
			log('Sent message: ' + strMsg);
			conn.send(strMsg);
		}

		conn.onmessage = function (rawMsg) {
			var msg;

			// We only accept messages of utf8 type because we only accept JSON message.
			try {
				msg = JSON.parse(rawMsg.data);
			}
			catch (err) {
				log('Failed to parse message JSON: ' + rawMsg.data, logging.WARNING);
				if (this.onError !== undefined) {
					this.onError(err, rawMsg.data);
				}
				return;
			}

			var id = msg.id;
			if (id == messages.MESSAGE_ID.NamePlease) {
				log('Received "NamePlease" message.');
				if (this.onNamePlease !== undefined) {
					this.onNamePlease();
				}
			}
			else if (id == messages.MESSAGE_ID.Matched) {
				log('Received "Matched" message: ' + msg.opponentName);
				if (this.onMatched !== undefined) {
					this.onMatched(msg.opponentName);
				}
			}
			else if (id == messages.MESSAGE_ID.CountDown) {
				log('Received "CountDown" message: ' + msg.value);
				if (this.onCountDown !== undefined) {
					this.onCountDown(msg.value);
				}
			}
			else if (id == messages.MESSAGE_ID.GameOver) {
				log('Received "GameOver" message: ' + msg.won);
				if (this.onGameOver !== undefined) {
					this.onGameOver(msg.won);
				}
			}
			else {
				log('Received invalid message type: ' + rawMsg.data);
				if (this.onError !== undefined) {
					this.onError('Invalid message type.', rawMsg.data);
				}
			}
		};

		conn.onclose = function onClose () {
			log('Websocket closed.');
			if (this.onClose !== undefined) {
				this.onClose();
			}
		};

		this.name = function (name) {
			sendMessage(new messages.Name(name));
		};

		this.squeeze = function () {
			sendMessage(new messages.Squeeze());
		};

		this.onMessage = undefined;
		this.onNamePlease = undefined;
		this.onMatched = undefined;
		this.onOpponentName = undefined;
		this.onCountDown = undefined;
		this.onGameOver = undefined;
		this.onError = undefined;
		this.onClose = undefined;
	};
});