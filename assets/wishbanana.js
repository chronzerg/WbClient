function switchToPage(id) {
	var $pages = $('body > div');
	var $thePage = $pages.filter('#' + id);
	var callbacks;

	callbacks = $thePage.data('wbBeforeShowCallbacks');
	if (callbacks !== undefined) {
		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i]();
		}
	}

	$pages.fadeOut({
		complete: function pagesFadeOutComplete () {
			$thePage.show();

			callbacks = $thePage.data('wbAfterShowCallbacks');
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
	})();

	(function initMenu () {
		$('#storyButton').click(function onClickStory () {
			switchToPage('story');
		});

		$('#playButton').click(function onClickPlay () {
			switchToPage('game');
		});

		$('#helpButton').click(function onClickHelp () {
			// TODO
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