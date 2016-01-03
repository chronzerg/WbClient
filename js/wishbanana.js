requirejs.config({
	baseurl: 'js'
});

define(['jquery', 'paging', 'animations', 'game', 'logging'], function wishbananaModule ($, paging, animations, game, logging) {
	var logging = logging('wishbanana');
	var log = logging.log;

	logging.filter({
		level: logging.INFO
	});

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
			var g = null;
			var gamePaging = paging($('div#game').find('div.state'));
			var countingPaging = paging($('div#counting').find('div.count'));

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
				g = new game(
					name,
					function onMatched (opponentName) {
						$('.theirName').html(opponentName);
						gamePaging.switchToPage('counting');
					},
					function onCountDown (value) {
						countingPaging.switchToPage(value, true);
					},
					function onPlaying () {
						gamePaging.switchToPage('playing');
					},
					function onGameOver (youWon) {
						animations.gameOver(youWon, function gameOverComplete () {
							if (youWon) {
								$('#youWin').show();
							}
							else {
								$('#youLose').show();
							}
							$('#gameOverBanner').fadeIn();
						});
					}
				);
				gamePaging.switchToPage('matching');
			});

			var WIN_CLICKS = 30;

			var yourClicks;
			var theirClicks;

			function updateYourClicks (newYourClicks) {
				if (newYourClicks || newYourClicks === 0) {
					yourClicks = newYourClicks;
				}
				else {
					yourClicks++;
				}

				if (yourClicks > WIN_CLICKS) {
					yourClicks = WIN_CLICKS;
				}

				animations.updateYourProgress(yourClicks / WIN_CLICKS);
			}

			function updateTheirClicks (newTheirClicks) {
				theirClicks = newTheirClicks;

				if (theirClicks > WIN_CLICKS) {
					theirClicks = WIN_CLICKS;
				}

				animations.updateTheirProgress(theirClicks / WIN_CLICKS);
			}

			function playingMouseDown () {
				animations.flash();
				updateYourClicks();
				g.squeeze();
			}

			$('#playAgain').click(function onPlayAgainClick () {
				g.quit();
				g = null;
				gamePaging.switchToPage('naming');
			});
		})();
	});
});