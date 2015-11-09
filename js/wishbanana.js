requirejs.config({
	baseurl: 'js'
});

define(['jquery', 'game'], function ($, game) {
	function callCallbacks ($page, dataId) {
		var callbacks = $page.data(dataId);
		if (callbacks !== undefined) {
			for (var i = 0; i < callbacks.length; i++) {
				callbacks[i]();
			}
		}
	}

	function switchToPage(id) {
		var $oldPage = $('body > div.open');
		var $newPage = $('body > div#' + id);

		callCallbacks($oldPage, 'wbBeforeHideCallbacks');
		callCallbacks($newPage, 'wbBeforeShowCallbacks');

		$oldPage.fadeOut({
			complete: function pageFadeOutComplete () {
				$oldPage.removeClass('open');
				$newPage.show();
				$newPage.addClass('open');

				callCallbacks($oldPage, 'wbAfterHideCallbacks');
				callCallbacks($newPage, 'wbAfterShowCallbacks');
			}
		});
	}

	function addPageCallback (id, dataId, cb) {
		var $thePage = $('body > div#' + id);
		var callbacks = $thePage.data(dataId);
		if (callbacks === undefined) {
			callbacks = [];
		}
		callbacks.push(cb);
		$thePage.data(dataId, callbacks);
	}

	function addBeforeShowCallback (id, cb) {
		addPageCallback(id, 'wbBeforeShowCallbacks', cb);
	}

	function addAfterShowCallback (id, cb) {
		addPageCallback(id, 'wbAfterShowCallbacks', cb);
	}

	function addBeforeHideCallback (id, cb) {
		addPageCallback(id, 'wbBeforeHideCallbacks', cb);
	}

	function addAfterHideCallback (id, cb) {
		addPageCallback(id, 'wbAfterHideCallbacks', cb);
	}

	$('document').ready(function onDocumentReady () {
		(function initAll () {
			// Hide all the pages except the menu
			$('body > div').hide();
			$('#menu').show().addClass('open');
			$('#menu > .tint').hide();
			$('#helpModal').hide();
		})();

		(function initMenu () {
			$('#storyButton').click(function onClickStory () {
				switchToPage('story');
			});

			$('#playButton').click(function onClickPlay () {
				switchToPage('game');
			});

			$('#helpButton').click(function onClickHelp (event) {
				event.stopPropagation();
				$('#helpModal, #menu > .tint').fadeIn(200);

				$(document).one('click', function onDocumentClick () {
					$('#helpModal, #menu > .tint').fadeOut(200);
				});
			});
		})();

		(function initStory () {
			$('#storyToMenuButton').click(function onClickStoryBack () {
				switchToPage('menu');
			});
		})();

		(function initGame () {
			var g;

			function changeState (id) {
				$('#game > .state').hide();
				$('#game > .state#' + id).show();
			}

			function setupNewGame (name) {
				g = new game.Game();

				g.getName = function () {
					return name;
				};

				g.onCounting = function (opponentName) {
					$('#opponentName').html(opponentName);
					changeState('counting');
				};

				g.onCountDown = function (value) {
					$('#countDownNumber').html(value);
				};

				g.onPlaying = function () {
					changeState('playing');
					$(document).on('click', g.squeeze);
					g.onDone = function (won) {
						$(document).off('click', g.squeeze);
						g.quit();
						$('#playing').html(won);
					};
				};
			}

			function setupMatching () { }
			function setupCountDown () { }
			function setupPlaying () { }

			$('#opponentName').html('');
			$('#countDownNumber').html('');
			$('#game > .state').hide();
			$('#game > .state#naming').show();

			$('#naming > button').one('click', function onNameButtonClick () {
				var name = $('#naming > input').val();
				setupNewGame(name);
				changeState('matching');
			});
		})();
	});
});