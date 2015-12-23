requirejs.config({
	baseurl: 'js',
	shim: { 'jquery.color': ['jquery'] },
	config: {
		moment: {
			noGlobal: true
		}
	}
});

define(['jquery', 'jquery.color', 'paging', 'logging'], function wishbanana ($, jqueryColor, paging, logging) {
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
					}, 100);
				});

				gamePaging.addBeforeHideCallback('counting', function countingBeforeHide () {
					clearInterval(timerId);
				});
			})();

			(function initPlaying () {
				log('Initializing game->playing');
				var WIN_CLICKS = 30;
				var FLASH_DURATION = 100;

				var FIST_STATE = {
					PLAYING: 0,
					LOOSING: 1,
					RAISING: 2,
					SMASHING: 3
				};

				var yourClicks;
				var theirClicks;
				var yourFistState = FIST_STATE.PLAYING;
				var theirFistState = FIST_STATE.PLAYING;

				function updateYourFistLocation() {
					var totalDistance;
					var x, y;

					switch(yourFistState) {
						case FIST_STATE.PLAYING:
							var clickRatio = yourClicks / WIN_CLICKS;
							totalDistance = $('#gameContainer').height() - $('#yourFist').height();
							y = -totalDistance * clickRatio;
							$('#yourFist').css({
								transform: 'translate(0, ' + y + 'px)',
								transition: 'transform 0.2s ease-in'
							});
							break;

						case FIST_STATE.LOOSING:
							// Because the #gameContainer is 40vmax tall and centered, 30% of the
							// window height plus the fist's height should get the fist off the
							// screen.
							y =  ($(window).height() * 0.30) + $('#yourFist').height();
							$('#yourFist').css({
								transform: 'translate(0, ' + y + 'px)',
								transition: 'transform 1s ease-out'
							});
							break;

						case FIST_STATE.RAISING:
							y = - ($('#gameContainer').height() - ($('#yourFist').height() / 2));
							x = - $('#yourFist').width() / 2;
							$('#yourFist').css({
								transform: 'translate(' + x + 'px, ' + y + 'px)',
								transition: 'transform 1.3s ease-in'
							});
							break;

						case FIST_STATE.SMASHING:
							y = - (($('#gameContainer').height() / 2) - ($('#yourFist').height() / 2));
							x = ($('#gameContainer').width() / 2) - ($('#yourFist').width() / 2);
							$('#yourFist').css({
								transform: 'translate(' + x + 'px, ' + y + 'px)',
								transition: 'transform 0.2s ease-out'
							});
							break;
					}
				}

				function updateTheirFistLocation () {
					var MARGIN_BOTTOM = 0.25; //25%
					var totalDistance;
					var x, y;

					switch (theirFistState) {
						case FIST_STATE.PLAYING:
							var clickRatio = theirClicks / WIN_CLICKS;
							totalDistance = ($('#gameContainer').height() * (1-MARGIN_BOTTOM)) - $('#theirFist').height();
							y = -totalDistance * clickRatio;
							$('#theirFist').css({
								transform: 'translate(0, ' + y + 'px)',
								transition: 'transform 0.2s ease-in'
							});
							break;

						case FIST_STATE.LOOSING:
							// Because the #gameContainer is 40vmax tall and centered, 30% of the
							// window height plus the fist's height should get the fist off the
							// screen.
							y =  ($(window).height() * 0.30) + $('#theirFist').height();
							$('#theirFist').css({
								transform: 'translate(0, ' + y + 'px)',
								transition: 'transform 1s ease-out'
							});
							break;

						case FIST_STATE.RAISING:
							y = - ($('#gameContainer').height() - ($('#theirFist').height() / 2));
							x = $('#theirFist').width() / 2;
							$('#theirFist').css({
								transform: 'translate(' + x + 'px, ' + y + 'px)',
								transition: 'transform 1.3s ease-in'
							});
							break;

						case FIST_STATE.SMASHING:
							y = - (($('#gameContainer').height() / 2) - ($('#gameContainer').height() * MARGIN_BOTTOM) - ($('#theirFist').height() / 2));
							x = - (($('#gameContainer').width() / 2) - ($('#theirFist').width() / 2));
							$('#theirFist').css({
								transform: 'translate(' + x + 'px, ' + y + 'px)',
								transition: 'transform 0.2s ease-out'
							});
							break;
					}
				}

				var flashTimeoutId = 0;
				function clickFlashAnimation () {
					clearTimeout(flashTimeoutId);
					$('#flash').show();
					flashTimeoutId = setTimeout(function flashTimeout () {
						$('#flash').hide();
					}, FLASH_DURATION);
				}

				function youWinAnimation () {
					theirFistState = FIST_STATE.LOOSING;
					yourFistState = FIST_STATE.RAISING;
					$('#theirFist').fadeOut();
					updateYourFistLocation();
					updateTheirFistLocation();

					setTimeout(function youWinTimeout2 () {
						$('.fist').removeClass('slow');
						yourFistState = FIST_STATE.SMASHING;
						updateYourFistLocation();
					}, 1300);

					setTimeout(function youWinTimeout3 () {
						$('#yourFist').hide();
						$('#unsmashed').hide();

						$('#yourHand').show();
						$('#smashed').show();

						$('#playingBackground').fadeOut();
					}, 1400);

					setTimeout(function youWinTimeout4 () {
						$('#youWin').show();
						$('#gameOverBanner').fadeIn();
					}, 1900);
				}

				function theyWinAnimation () {
					yourFistState = FIST_STATE.LOOSING;
					theirFistState = FIST_STATE.RAISING;
					$('#yourFist').fadeOut();
					updateYourFistLocation();
					updateTheirFistLocation();

					setTimeout(function theyWinTimeout1 () {
						$('.fist').removeClass('slow');
						theirFistState = FIST_STATE.SMASHING;
						updateTheirFistLocation();
					}, 1300);

					setTimeout(function theyWinTimeout2 () {
						$('#theirFist').hide();
						$('#unsmashed').hide();

						$('#theirHand').show();
						$('#smashed').show();

						$('#playingBackground').fadeOut();
					}, 1400);

					setTimeout(function youWinTimeout3 () {
						$('#youLoose').show();
						$('#gameOverBanner').fadeIn();
					}, 1900);
				}

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

					updateYourFistLocation();
				}

				function updateTheirClicks (newTheirClicks) {
					theirClicks = newTheirClicks;

					if (theirClicks > WIN_CLICKS) {
						theirClicks = WIN_CLICKS;
					}

					updateTheirFistLocation();
				}

				function playingMouseDown () {
					clickFlashAnimation();
					updateYourClicks();
					updateTheirClicks(theirClicks+1);

					// TODO - Remove the follow pseudo logic
					if (theirClicks === WIN_CLICKS) {
						$(document).off('mousedown', playingMouseDown);
						youWinAnimation();
					}
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
					yourFistState = FIST_STATE.PLAYING;
					theirFistState = FIST_STATE.PLAYING;

					$('.fist').css({ transform: ''}).removeClass('slow').show();
					$('#playingBackground').show().addClass('running');
					$('#unsmashed').show();

					$('#youWin').hide();
					$('#youLoose').hide();
					$('#gameOverBanner').hide();

					$('#smashed').hide();
					$('#yourHand').hide();
					$('#theirHand').hide();
				});

				gamePaging.addBeforeHideCallback('playing', function playingBeforeHide () {
					$(document).off('mousedown', playingMouseDown);
					$(window).off('resize', updateYourFistLocation);
					$(window).off('resize', updateTheirFistLocation);
				});
			})();
		})();
	});
});