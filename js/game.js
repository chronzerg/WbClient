define(['client2Server', 'logging'], function gameModule (client2Server, logging) {
	var url = 'ws://192.168.0.13:3456';
	var logging = logging('client2Server');
	var log = logging.log;

	return function Game (name, onMatched, onCountDown, onPlaying, onGameOver) {
		var thisGame = this;
		var playing = true;
		var state = 0;

		var C2S = new client2Server(url);

		function changeState(newState) {
			if (newState - state === 1) {
				state = newState;
				log('Game state changed: ' + state);
				return true;
			}

			log ('Invalid state change requested: ' + state + ' to ' + newState, logging.WARNING);
			return false;
		}

		C2S.onClose = function () {
			playing = false;
		};

		C2S.onNamePlease = function () {
			if (changeState(1)) {
				C2S.name(name);
			}
		};

		C2S.onMatched = function (opponentName) {
			if (changeState(2)) {
				onMatched(opponentName);
			}
		};

		C2S.onCountDown = function (value) {
			if (state !== 2) {
				log('Received countdown message during state ' + state, logging.WARNING);
			}

			if (value > 0) {
				onCountDown(value);
			}
			else if (changeState(3)) {
				onPlaying();
			}
		};

		C2S.onGameOver = function (youWon) {
			if (changeState(4)) {
				onGameOver(youWon);
				thisGame.quit();
			}
		};

		this.playing = function () {
			return playing;
		};

		this.squeeze = C2S.squeeze;

		this.quit = function () {
			if (playing) {
				C2S.close();
			}
		};
	};
});