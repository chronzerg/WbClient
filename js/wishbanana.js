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

		(function initLoading () {
			$(function onDoneLoading () {
				mainPaging.switchToPage('menu');
			});
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
			var WIN_CLICKS = 1;

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
				updateYourClicks(g.count);
			};

			var initNewGame = function (name) {
				g = new Game(name);
				g.onConnected = function () {
					$('#matching > h2').html('matching...');
				};
				g.onWinCount = function (count) {
					WIN_CLICKS = count;
					if (WIN_CLICKS < 1) {
						WIN_CLICKS = 1;
					}
				};
				g.onMatched = function (opponentName) {
					$('.theirName').html(opponentName);
					gamePaging.switchToPage('counting');
				};
				g.onCountDown = function (value) {
					$('#count > h1').html(value);
				};
				g.onPlaying = function () {
					gamePaging.switchToPage('playing', true);
				};
				g.onClickCount = function (yourClicks, theirClicks) {
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
					$(document).off('mousedown', playingMouseDown);
				};
			};

			mainPaging.addBeforeShowCallback('game', function gameBeforeShow () {
				gamePaging.switchToPage('naming');
			});
			mainPaging.attachChildPaging('game', gamePaging);

			gamePaging.addAfterShowCallback('naming', function namingAfterShowCallback () {
				$('input#name').focus();
			});
			gamePaging.addBeforeShowCallback('matching', function matchingBeforeShow () {
				$('#matching > h2').html('connecting...');
			});
			gamePaging.addBeforeShowCallback('counting', function countingBeforeShow () {
				$('#count > h1').html('');
			});
			gamePaging.addBeforeShowCallback('playing', function playingBeforeShow () {
				$(document).on('mousedown', playingMouseDown);

				$('#youWin').hide();
				$('#youLose').hide();
				$('#gameOverBanner').hide();

				animations.reset();
				animations.attachResizeHandler();
			});
			gamePaging.addBeforeHideCallback('playing', function playingBeforeHide () {
				$(document).off('mousedown', playingMouseDown);
				animations.detachResizeHandler();

				if (g !== null) {
					g.quit();
					g = null;
				}
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
				gamePaging.switchToPage('naming');
			});
		})();
	});
});