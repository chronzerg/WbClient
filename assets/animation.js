function framesFromSingleImage (image, frameCoords) {
	var frames = function (frameNdx, canvas, x, y) {
		var ctx = canvas.getContext('2d');

		var sx = frameCoords[frameNdx].x;
		var sy = frameCoords[frameNdx].y;
		var w = frameCoords[frameNdx].w;
		var h = frameCoords[frameNdx].h;

		var scale = frameCoords[frameNdx].scale;

		// (x,y) is the center point of this frame. we need to convert this to
		// the (dx,dy) which is the upper left corner of the frame.
		var dx = x - ((w / 2) * scale);
		var dy = y - ((h / 2) * scale);

		ctx.drawImage(image, sx, sy, w, h, dx, dy, round(w*scale), round(h*scale));
	};
	frames.length = frameCoords.length;
	return frames;
}

function Animation (frames, time, x, y, scale, looping, done) {
	if (scale === undefined) {
		scale = 1;
	}

	if (looping === undefined) {
		looping = false;
	}

	var updatePeriod = time / frames.length;
	var frameNdx = 0;
	var playing = false;
	var callbackId;

	function updateState () {
		frameNdx++;
		if (frameNdx >= frames.length) {
			if (looping) {
				frameNdx = 0;
			}
			else {
				playing = false;

				if (done !== undefined) {
					done();
				}
			}
		}
	}

	this.play = function () {
		playing = true;
		frameNdx = 0;
		callbackId = setInterval(updateState, updatePeriod);
	};

	this.stop = function () {
		playing = false;
		clearInterval(callbackId);
	};

	this.draw = function (canvas) {
		if (playing) {
			frames(frameNdx, canvas, x, y);
		}
	};
 }

 function AnimationEngine (canvas) {
 	var nextId = 0;
 	var animations = {};
 	var playing = true;

 	function renderFrame () {
 		for (var a in animations) {
 			a.draw(canvas);
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
 			for (var a in animations) {
 				a.play();
 			}
 		}

 		window.requestAnimationFrame(renderFrame);
 	};

 	this.stop = function () {
 		playing = false;

 		for (var a in animations) {
 			a.stop();
 		}
 	};
 }