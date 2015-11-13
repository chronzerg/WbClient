requirejs.config({
	baseurl: 'js',
	shim: {
		'jquery.color': ['jquery']
	}
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
			var game;

			mainPaging.addAfterHideCallback('game', function gameAfterHide () {
				$('#cloudContainer').show();
				gamePaging.switchToPage('naming');
			});

			$('button#gameToMenu').click(function onGameToMenuClick (event) {
				mainPaging.switchToPage('menu');
				event.stopPropagation();
			});

			// Initialize Game Pages
			(function initNaming () {
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
				countingPaging = paging($counting.find('div.count'));

				gamePaging.addBeforeShowCallback('counting', function countingBeforeShow () {
					countingPaging.switchToPage('5', true);
				});

				gamePaging.addBeforeShowCallback('counting', function countingAfterShow () {
					// TODO - Add real logic below for counting down.
					var count = 4; //Start with 4 because 5 is already being displayed.
					var timerId = setInterval(function countDownTimer () {
						if (count > 0) {
							countingPaging.switchToPage(count.toString());
							count--;
						}
						else {
							clearInterval(timerId);
							gamePaging.switchToPage('playing', true);
						}
					}, 200);
				});
			})();

			(function initPlaying () {
				var WIN_CLICKS = 25;
				var FLASH_COLOR = '#ffffcc';
				var FLASH_DURATION = 100;

				var yourClicks = 0;
				var theirClicks = 0;

				function translateYourFist() {
					var clickRatio = yourClicks / WIN_CLICKS;
					var totalDistance = $('#gameContainer').height() - $('#yourFist').width();
					var distance = -totalDistance * clickRatio;
					$('#yourFist').css({ transform: 'rotate(90deg) translate(' + distance + 'px, 30%)'});
				}

				function changeYourClicks (newYourClicks) {
					if (newYourClicks || newYourClicks === 0) {
						yourClicks = newYourClicks;
					}
					else {
						yourClicks++;
					}

					if (yourClicks > WIN_CLICKS) {
						yourClicks = WIN_CLICKS;
					}

					translateYourFist();
				}

				function translateTheirFist () {
					var clickRatio = theirClicks / WIN_CLICKS;
					var totalDistance = ($('#gameContainer').height() * 0.75) - $('#theirFist').width();
					var distance = totalDistance * clickRatio;
					$('#theirFist').css({ transform: 'rotate(-90deg) translate(' + distance + 'px, 30%)'});
				}

				function changeTheirClicks (newTheirClicks) {
					theirClicks = newTheirClicks;

					if (theirClicks > WIN_CLICKS) {
						theirClicks = WIN_CLICKS;
					}

					translateTheirFist();
				}

				function playingClick () {
					$gamePage.css({ backgroundColor: FLASH_COLOR });
					$gamePage.animate({ backgroundColor: '#ffffff' },
					{
						duration: FLASH_DURATION,
						queue: false,
						complete: function bgColorAnimationComplete () {
							$gamePage.css({ backgroundColor: 'transparent' });
						}
					});

					changeYourClicks();
					changeTheirClicks(theirClicks+1); // TODO - Remove this.
				}

				gamePaging.addBeforeShowCallback('playing', function playingBeforeShow () {
					$(document).on('click', playingClick);
					$(window).on('resize', translateYourFist);
					$(window).on('resize', translateTheirFist);

					yourClicks = 0;
					theirClicks = 0;
					$('#yourFist').css({ transform: 'rotate(90deg) translate(0, 30%)'});
					$('#theirFist').css({ transform: 'rotate(-90deg) translate(0, 30%)'});
					$('#cloudContainer').hide();
				});

				gamePaging.addBeforeHideCallback('playing', function playingBeforeHide () {
					$(document).off('click', playingClick);
					$(window).off('resize', translateYourFist);
					$(window).off('resize', translateTheirFist);
				});
			})();
		})();
	});
});