requirejs.config({
	baseurl: 'js'
});

define(['jquery', 'game', 'paging'], function wishbanana ($, game, paging) {
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
			var gamePaging = paging($('div#game > div.state'));
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
		})();
	});
});