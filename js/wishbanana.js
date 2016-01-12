requirejs.config({
	baseurl: 'js'
});

define(['jquery', 'paging', 'animations', 'game', 'logging'], function wishbananaModule ($, paging, animations, Game, logging) {
	'use strict';

	logging = logging('wishbanana');
	var log = logging.log;

	$('document').ready(function onDocumentReady () {
		var mainPaging;

		// Initialize Main Pages
		(function initAll () {
			mainPaging = paging($('body > div.page'));
		})();

		(function initMenu () {
			$('button#menuToStory').click(function onMenuToStoryClick () {
				mainPaging.switchToPage('story');
			});

			$('button#menuToGame').click(function onMenuToGameClick () {
				mainPaging.switchToPage('game');
			});

			$('button#openHelp').click(function onOpenHelpClick (event) {
				event.stopPropagation();
				$('#helpModal, #menu > .tint').show();

				$(document).one('click', function onHelpModalClick () {
					$('#helpModal, #menu > .tint').hide();
				});
			});
		})();

		(function initStory () {
			$('button#storyToMenu').click(function onStoryToMenuClick () {
				mainPaging.switchToPage('menu');
			});
		})();

		(function initGame () {
			const WIN_CLICKS = 50;

			var gamePaging = paging($('div#game').find('div.state')),
			    countingPaging = paging($('div#counting').find('div.count')),
			    g = null;

			var updateYourClicks = function (yourClicks) {
				animations.updateYourProgress(yourClicks / WIN_CLICKS);
			};

			var updateTheirClicks = function (theirClicks) {
				animations.updateTheirProgress(theirClicks / WIN_CLICKS);
			};

			var playingMouseDown = function () {
				g.click();
				animations.flash();
				updateYourClicks(g.clickCount);
			};

			var initNewGame = function (name) {
				g = new Game(name);
				g.onMatched = function (opponentName) {
					$('.theirName').html(opponentName);
					gamePaging.switchToPage('counting');
				};
				g.onCountDown = function (value) {
					countingPaging.switchToPage(value, true);
				};
				g.onPlaying = function () {
					gamePaging.switchToPage('playing');
				};
				g.onUpdateClicks = function (yourClicks, theirClicks) {
					updateYourClicks(yourClicks);
					updateTheirClicks(theirClicks);
				};
				g.onGameOver = function (youWon) {
					animations.gameOver(youWon, function gameOverComplete () {
						if (youWon) {
							$('#youWin').show();
						}
						else {
							$('#youLose').show();
						}
						$('#gameOverBanner').fadeIn();
					});
				};
			};

			mainPaging.addBeforeShowCallback('game', function gameBeforeShow () {
				gamePaging.switchToPage('naming');
			});
			mainPaging.addAfterShowCallback('game', function gameAfterShow () {
				$('input#name').focus();
			});
			mainPaging.addBeforeHideCallback('game', function gameBeforeHide () {
				if (g) {
					g.quit();
					g = null;
				}
			});

			gamePaging.addBeforeShowCallback('counting', function countingBeforeShow () {
				countingPaging.switchToPage('blank', true);
			});
			gamePaging.addBeforeShowCallback('playing', function playingBeforeShow () {
				$(document).on('mousedown', playingMouseDown);

				yourClicks = 0;
				theirClicks = 0;

				$('#youWin').hide();
				$('#youLose').hide();
				$('#gameOverBanner').hide();

				animations.reset();
				animations.attachResizeHandler();
			});
			gamePaging.addBeforeHideCallback('playing', function playingBeforeHide () {
				$(document).off('mousedown', playingMouseDown);
				animations.detachResizeHandler();
			});

			$('button#gameToMenu').click(function onGameToMenuClick (event) {
				mainPaging.switchToPage('menu');
				event.stopPropagation();
			});
			$('input#name').keydown(function nameInputEnterKey (e) {
				if (e.keyCode == 13) {
					$('button#namingDone').click();
				}
			});
			$('button#namingDone').click(function startNewGame () {
				var name = $('input#name').val();
				$('.yourName').html(name);

				initNewGame(name);

				gamePaging.switchToPage('matching');
			});
			$('#playAgain').click(function onPlayAgainClick () {
				g.quit();
				g = null;
				gamePaging.switchToPage('naming');
			});
		})();
	});
});