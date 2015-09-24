function NumberAnimation (value, x, y) {
	var startTime;
	var playing = false;

	this.play = function () {
		startTime = new Date();
		playing = true;
	};

	this.stop = function () {
		playing = false;
	};

	this.draw = function (canvas, x, y) {
		if (playing) {
			var time = (new Date()).getTime() - startTime.getTime();

			if (time < 1000) {
				var progress;
				var ctx = canvas.getContext('2d');

				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				// First half of a second
				if (time < 500) {
					// percentage of progress for the first half of the animation
					progress = time / 500;

					ctx.font = '50% sans-serif';
					ctx.fillText(value, x, y);
				}
				else {
					// percentage of progress for the second half of the animation
					progress = (time - 500) / 500;
					var size = 50 * (1 - progress);

					ctx.font = size + '% sans-serif';
					ctx.fillText(value, x, y);
				}
			}
			else {
				playing = false;
			}
		}
	};
}

function AnimationEngine (canvas) {
 	var nextId = 0;
 	var animations = {};
 	var playing = true;

 	function renderFrame () {
 		for (var id in animations) {
 			animations[id].draw(canvas);
 		}

 		if (playing) {
 			window.requestAnimationFrame(renderFrame);
 		}
 	}

 	this.addAnimation = function (a, startAnimation) {
 		if (startAnimation === undefined) {
 			startAnimation = true;
 		}

 		var id = nextId;
 		nextId++;
 		animations[id] = a;
 		if (playing && startAnimation) {
 			a.play();
 		}
 		return id;
 	};

 	this.removeAnimation = function (id) {
 		animations[id].stop();
 		delete animations[id];
 	};

 	this.play = function (startAnimations) {
 		if (startAnimations === undefined) {
 			startAnimations = true;
 		}

 		playing = true;

 		if (startAnimations) {
 			for (var id in animations) {
 				animations[id].play();
 			}
 		}

 		window.requestAnimationFrame(renderFrame);
 	};

 	this.stop = function () {
 		playing = false;

 		for (var id in animations) {
 			animations[id].stop();
 		}
 	};
}