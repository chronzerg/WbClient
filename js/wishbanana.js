requirejs.config({
	baseurl: 'js'
});

define(['jquery', 'paging'], function wishbanana ($, paging) {
	$('document').ready(function onDocumentReady () {
		var mainPaging;

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

			mainPaging.addBeforeShowCallback('game', function gameBeforeShow () {
				gamePaging.switchToPage('naming');
			});

			$('button#gameToMenu').click(function onGameToMenuClick () {
				mainPaging.switchToPage('menu');
			});

			$('button#namingDone').click(function onNamingDoneClick () {
				gamePaging.switchToPage('matching');
			});

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

				gamePaging.addAfterShowCallback('counting', function countingAfterShow () {
					// TODO - Add real logic below for counting down.
					var count = 4; //Start with 4 because 5 is already being displayed.
					var timerId = setInterval(function countDownTimer () {
						if (count > 0) {
							countingPaging.switchToPage(count.toString());
							count--;
						}
						else {
							clearInterval(timerId);
							gamePaging.switchToPage('playing');
						}
					}, 1000);
				});
			})();

			(function initPlaying () {
				// TODO
			})();
		})();
	});
});