requirejs.config({
	baseurl: 'js',
	shim: { 'jquery.color': ['jquery'] }
});

define(['jquery', 'jquery.color', 'paging'], function wishbanana ($, jqueryColor, paging) {
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
				gamePaging.addAfterShowCallback('matching', function matchingAfterShow () {
					// TODO - Add real logic for waiting for match.
					$gamePage.one('click', function doneMatchingClick () {
						gamePaging.switchToPage('counting');
					});
				});
			})();

			(function initCounting () {
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
					}, 100);
				});

				gamePaging.addBeforeHideCallback('counting', function countingBeforeHide () {
					clearInterval(timerId);
				});
			})();

			(function initPlaying () {
				var WIN_CLICKS = 3;
				var FLASH_COLOR = '#ffffcc';
				var FLASH_DURATION = 100;

				var yourClicks;
				var theirClicks;
				var youWon = false;
				var theyWon = false;

				function updateYourFistLocation() {
					var distance;

					if (!theyWon) {
						var clickRatio = yourClicks / WIN_CLICKS;
						var totalDistance = $('#gameContainer').height() - $('#yourFist').height();
						distance = -totalDistance * clickRatio;
					}
					else {
						// Because the #gameContainer is 40vmax tall and centered, 30% of that
						// height plus the fist's height should get the fist off the screen.
						distance =  ($(window).height() * 0.30) + $('#yourFist').height();
					}

					$('#yourFist').css({ transform: 'translate(0, ' + distance + 'px)' });
				}

				function updateTheirFistLocation () {
					var MARGIN_BOTTOM = 0.25; //25%
					var distance;

					if (!youWon) {
						var clickRatio = theirClicks / WIN_CLICKS;
						var totalDistance = ($('#gameContainer').height() * (1-MARGIN_BOTTOM)) - $('#theirFist').height();
						distance = -totalDistance * clickRatio;
					}
					else {
						// Because the #gameContainer is 40vmax tall and centered, 30% of that
						// height plus the fist's height should get the fist off the screen.
						distance =  ($(window).height() * 0.30) + $('#theirFist').height();
					}

					$('#theirFist').css({ transform: 'translate(0, ' + distance + 'px)' });
				}

				function youWinAnimation () {
					updateTheirFistLocation();
					$('#theirFist').fadeOut();

					setTimeout(function youWinTimeout1 () {
						$('#yourFist').hide();
						$('#unsmashed').hide();

						$('#yourHand').show();
						$('#smashed').show();

						setTimeout(function youWinTimeout2 () {
							$('#youWin').show();
							$('#gameOverBanner').fadeIn();
						}, 500);
					}, 2000);
				}

				function theyWinAnimation () {
					updateYourFistLocation();
					$('#yourFist').fadeOut();

					setTimeout(function theyWinTimeout1 () {
						$('#theirFist').hide();
						$('#unsmashed').hide();

						$('#theirHand').show();
						$('#smashed').show();

						setTimeout(function youWinTimeout2 () {
							$('#youLoose').show();
							$('#gameOverBanner').fadeIn();
						}, 500);
					}, 2000);
				}

				function updateYourClicks (newYourClicks) {
					if (!theyWon) {
						if (newYourClicks >= 0) {
							yourClicks = newYourClicks;
						}
						else {
							yourClicks++;
						}

						if (yourClicks > WIN_CLICKS) {
							yourClicks = WIN_CLICKS;
						}

						// TODO - This flag should only be set by a game server msg.
						if (newYourClicks >= 0) {
							youWon = yourClicks === WIN_CLICKS;
						}

						updateYourFistLocation();
					}
				}

				function updateTheirClicks (newTheirClicks) {
					if (!youWon) {
						theirClicks = newTheirClicks;

						if (theirClicks > WIN_CLICKS) {
							theirClicks = WIN_CLICKS;
						}

						// TODO - This flag should only be set by the game server
						// msg.
						theyWon = theirClicks === WIN_CLICKS;

						updateTheirFistLocation();
					}
				}

				function playingMouseDown () {
					$gamePage.css({ backgroundColor: FLASH_COLOR });
					$gamePage.animate({ backgroundColor: '#ffffff' }, {
						duration: FLASH_DURATION,
						queue: false
					});

					updateYourClicks(-1);
					updateTheirClicks(theirClicks+1);

					if (youWon) {
						youWinAnimation();
						$(document).off('mousedown', playingMouseDown);
					}

					/*
					if (theyWon) {
						theyWinAnimation();
						$(document).off('mousedown', playingMouseDown);
					}
					*/
				}

				$('#playAgain').click(function onPlayAgainClick () {
					gamePaging.switchToPage('naming');
				});

				gamePaging.addBeforeShowCallback('playing', function playingBeforeShow () {
					$(document).on('mousedown', playingMouseDown);
					$(window).on('resize', updateYourFistLocation);
					$(window).on('resize', updateTheirFistLocation);

					yourClicks = 0;
					theirClicks = 0;
					youWon = false;
					theyWon = false;

					$('#yourFist').css({ transform: ''}).show();
					$('#theirFist').css({ transform: ''}).show();
					$('#unsmashed').show();

					$('#youWin').hide();
					$('#youLoose').hide();
					$('#gameOverBanner').hide();

					$('#smashed').hide();
					$('#yourHand').hide();
					$('#theirHand').hide();

					$gamePage.find('.clouds').hide();
					$gamePage.css({ backgroundColor: '#ffffff' });
				});

				gamePaging.addBeforeHideCallback('playing', function playingBeforeHide () {
					$(document).off('mousedown', playingMouseDown);
					$(window).off('resize', updateYourFistLocation);
					$(window).off('resize', updateTheirFistLocation);

					$gamePage.css({ backgroundColor: 'transparent' });
				});

				gamePaging.addAfterHideCallback('playing', function playingAfterHide () {
					$gamePage.find('.clouds').show();
				});
			})();
		})();
	});
});