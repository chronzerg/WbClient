requirejs.config({
	baseurl: 'js'
});

define(['jquery', 'paging', 'animations', 'logging'], function wishbananaModule ($, paging, animations, logging) {
	var logging = logging('wishbanana');
	var log = logging.log;

	logging.filter({
		level: logging.INFO
	});

	$('document').ready(function onDocumentReady () {
		var mainPaging;

		// Initialize Main Pages
		(function initAll () {
			log('Initializing paging');
			mainPaging = paging($('body > div.page'));
		})();

		(function initMenu () {
			log('Initializing menu');
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
			log('Initializing story');
			$('button#storyToMenu').click(function onStoryToMenuClick () {
				mainPaging.switchToPage('menu');
			});
		})();

		(function initGame () {
			log('Initializing game');
			var $gamePage = $('div#game');
			var gamePaging = paging($gamePage.find('div.state'));

			mainPaging.addBeforeShowCallback('game', function gameBeforeShow () {
				gamePaging.switchToPage('naming');
			});

			mainPaging.addAfterShowCallback('game', function gameAfterShow () {
				$('input#name').focus();
			});

			mainPaging.addAfterHideCallback('game', function gameAfterHide () {
				gamePaging.switchToPage('naming');
			});

			$('button#gameToMenu').click(function onGameToMenuClick (event) {
				mainPaging.switchToPage('menu');
				event.stopPropagation();
			});

			// Initialize Game Pages
			(function initNaming () {
				log('Initialize game->naming');
				$('input#name').keydown(function (e) {
					if (e.keyCode == 13) {
						$('button#namingDone').click();
					}
				});

				$('button#namingDone').click(function onNamingDoneClick () {
					gamePaging.switchToPage('matching');
				});
			})();

			(function initMatching () {
				log('Initializing game->matching');
				gamePaging.addAfterShowCallback('matching', function matchingAfterShow () {
					// TODO - Add real logic for waiting for match.
					$gamePage.one('click', function doneMatchingClick () {
						gamePaging.switchToPage('counting');
					});
				});
			})();

			(function initCounting () {
				log('Initializing game->counting');
				var $counting = gamePaging.getPage('counting');
				var countingPaging = paging($counting.find('div.count'));
				var timerId;

				gamePaging.addBeforeShowCallback('counting', function countingBeforeShow () {
					countingPaging.switchToPage('5', true);

					// TODO - Add real logic below for counting down.
					var count = 4; //Start with 4 because 5 is already being displayed.
					timerId = setInterval(function countDownTimer () {
						if (count > 0) {
							countingPaging.switchToPage(count.toString());
							count--;
						}
						else {
							clearInterval(timerId);
							gamePaging.switchToPage('playing', true);
						}
					}, 1000);
				});

				gamePaging.addBeforeHideCallback('counting', function countingBeforeHide () {
					clearInterval(timerId);
				});
			})();

			(function initPlaying () {
				log('Initializing game->playing');
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
					updateTheirClicks(theirClicks+1);

					if (theirClicks === WIN_CLICKS) {
						$(document).off('mousedown', playingMouseDown);
						animations.gameOver(false, function gameOverComplete () {
							$('#youLose').show();
							$('#gameOverBanner').fadeIn();
						});
					}
				}

				$('#playAgain').click(function onPlayAgainClick () {
					gamePaging.switchToPage('naming');
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
			})();
		})();
	});
});