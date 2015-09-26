define(['client2Server'], function (client2Server) {
	var url = 'ws://localhost:8080';

	return {
		Game: function () {
			var playing = true;
			var C2S = new client2Server.C2SWrapper(url);

			this.playing = function () {
				return playing;
			};

			this.quit = function () {
				if (playing) {
					C2S.close();
				}
			};
		}
	};
});