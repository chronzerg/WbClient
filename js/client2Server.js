define(['messages', 'logging'], function (messages, logging) {
	var logging = logging('client2Server');
	var log = logging.log;

	return {
		C2SWrapper: function (url) {
			if (!window.WebSocket) {
				log('WebSockets are not supported.', logging.ERROR);
				throw new Error('WebSockets are not supported.');
			}

			var conn = new WebSocket(url, ['wishbanana']);
			var thisWrapper = this;

			function callIfDefined (fnName) {
				if (thisWrapper[fnName] !== undefined) {
					thisWrapper[fnName].apply(this, arguments.slice(1));
				}
			}

			function sendMessage (msg) {
				log('Sent message: ' + msg);
				conn.send(JSON.stringify(msg));
			}

			conn.onmessage = function (rawMsg) {
				var msg;

				// We only accept messages of utf8 type because we only accept JSON message.
				if (rawMsg.data instanceof String) {
					try {
						msg = JSON.parse(rawMsg.data);
					}
					catch (err) {
						log('Failed to parse message JSON: ' + rawMsg.data, LOGGING.WARNING);
						callIfDefined('onError', err, rawMsg.data);
						return;
					}

					var id = msg.id;
					if (id == messages.MESSAGE_ID.NamePlease) {
						log('Received "NamePlease" message.');
						callIfDefined('onNamePlease');
					}
					else if (id == messages.MESSAGE_ID.Matched) {
						log('Received "Matched" message: ' + msg.opponentName);
						callIfDefined('onMatched', msg.opponentName);
					}
					else if (id == messages.MESSAGE_ID.CountDown) {
						log('Received "CountDown" message: ' + msg.value);
						callIfDefined('onCountDown', msg.value);
					}
					else if (id == messages.MESSAGE_ID.GameOver) {
						log('Received "GameOver" message: ' + msg.won);
						callIfDefined('onGameOver', msg.won);
					}
					else {
						log('Received invalid message type: ' + rawMsg.data);
						callIfDefined('onError', 'Invalid message type.', rawMsg.data);
					}
				}
				else {
					log('Received invalid rawMsg datatype: ' + rawMsg.data, LOGGING.WARNING);
					callIfDefined('onError', 'Invalid rawMsg datatype: ' + (typeof rawMsg.data) + '.', '');
				}
			};

			conn.onclose = function onClose () {
				log('Websocket closed.');
				callIfDefined('onClose');
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
		}
	};
});