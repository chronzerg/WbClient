define(['messages'], function client2ServerModule (messages) {
	'use strict';

	return function Server (url) {
		if (!window.WebSocket) {
			log('WebSockets are not supported.', logging.ERROR);
			throw new Error('WebSockets are not supported.');
		}

		// 'thisServer' preserves the value of 'this' in the websocket's event handlers.
		var thisServer = this;
		var conn = new WebSocket(url, ['wishbanana']);

		var callIfDefined = function (functionName) {
			if (thisServer[functionName] !== undefined) {
				thisServer[functionName].call(this, Array.prototype.slice.call(arguments, 1));
			}
		};

		var sendMessage = function (message) {
			conn.send(JSON.stringify(message));
		};

		conn.onmessage = function (event) {
			var message;

			try {
				message = JSON.parse(event.data);
			}
			catch (err) {
				callIfDefined('onError', event.data);
				return;
			}

			var id = message.id;
			if (id == messages.ids.NamePlease) {
				callIfDefined('onNamePlease');
			}
			else if (id == messages.ids.Matched) {
				callIfDefined('onMatched', message.opponentName);
			}
			else if (id == messages.ids.CountDown) {
				callIfDefined('onCountDown', message.value);
			}
			// TODO - Update Clicks
			else if (id == messages.ids.GameOver) {
				callIfDefined('onGameOver', message.won);
			}
			else {
				callIfDefined('onError', event.data);
			}
		};

		conn.onclose = function onClose (event) {
			callIfDefined('onClose', event.code, event.reason);
		};

		this.name = function (name) {
			sendMessage(new messages.Name(name));
		};

		this.click = function () {
			sendMessage(new messages.Click());
		};

		this.close = function () {
			conn.close();
		};

		this.onMessage = undefined;
		this.onNamePlease = undefined;
		this.onMatched = undefined;
		this.onOpponentName = undefined;
		this.onCountDown = undefined;
		this.onUpdateClicks = undefined;
		this.onGameOver = undefined;
		this.onError = undefined;
		this.onClose = undefined;
	};
});