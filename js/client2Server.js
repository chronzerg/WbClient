define(['messages'], function (messages) {
	return {
		C2SWrapper: function (url) {
			if (!window.WebSocket) {
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
						callIfDefined('onError', err, rawMsg.data);
						return;
					}

					var id = msg.id;
					if (id == messages.MESSAGE_ID.NamePlease) {
						callIfDefined('onNamePlease');
					}
					else if (id == messages.MESSAGE_ID.Matched) {
						callIfDefined('onMatched', msg.opponentName);
					}
					else if (id == messages.MESSAGE_ID.CountDown) {
						callIfDefined('onCountDown', msg.value);
					}
					else if (id == messages.MESSAGE_ID.GameOver) {
						callIfDefined('onGameOver', msg.won);
					}
					else {
						callIfDefined('onError', 'Invalid message type.', rawMsg.data);
					}
				}
				else {
					callIfDefined('onError', 'Invalid rawMsg type: ' + (typeof rawMsg.data) + '.', '');
				}
			};

			conn.onclose = function onClose () {
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