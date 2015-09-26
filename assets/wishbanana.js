function switchToPage(id) {
	var $oldPage = $('body > div:visible');
	var $newPage = $('body > div#' + id);
	var callbacks;

	callbacks = $newPage.data('wbBeforeShowCallbacks');
	if (callbacks !== undefined) {
		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i]();
		}
	}

	$oldPage.fadeOut({
		complete: function pagesFadeOutComplete () {
			$newPage.show();

			callbacks = $newPage.data('wbAfterShowCallbacks');
			if (callbacks !== undefined) {
				for (var i = 0; i < callbacks.length; i++) {
					callbacks[i]();
				}
			}
		}
	});
}

function addPageCallback (id, dataId, cb) {
	var $thePage = $('body > div').filter('#' + id);
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

$('document').ready(function onDocumentReady () {
	(function initAll () {
		// Hide all the pages except the menu
		$('body > div').hide();
		$('#menu').show();
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
		// TODO
	})();
});