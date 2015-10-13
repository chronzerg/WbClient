define(['client2Server'], function (client2Server) {
	var url = 'ws://192.168.1.80:3456';

	return {
		Game: function () {
			var thisGame = this;
			var playing = true;
			var state = 0;

			var C2S = new client2Server.C2SWrapper(url);

			function callIfDefined(fnName) {
				if (thisGame[fnName] !== undefined) {
					thisGame[fnName].apply(this, arguments.slice(1));
				}
			}

			function changeState(newState) {
				if (newState - state === 1) {
					state = newState;
					return true;
				}

				return false;
			}

			C2S.onClose = function () {
				playing = false;
			};

			C2S.onNamePlease = function () {
				if (changeState(1)) {
					var name = thisGame.getName();
					C2S.name(name);
				}
			};

			C2S.onMatched = function (opponentName) {
				if (changeState(2)) {
					callIfDefined('onCounting', opponentName);
				}
			};

			C2S.onCountDown = function (value) {
				if (value > 0 && changeState(3)) {
					callIfDefined('onCountDown', value);
				}
				else if (changeState(4)) {
					callIfDefined('onPlaying');
				}
			};

			C2S.onGameOver = function (won) {
				if (changeState(4)) {
					callIfDefined('onDone', won);
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

			this.getName = undefined;
			this.onCounting = undefined;
			this.onCountDown = undefined;
			this.onPlaying = undefined;
			this.onDone = undefined;
		}
	};
});