$('document').ready(function onDocumentReady () {
	function switchToPage(id, complete) {
		var $pages = $('body > div');
		var $thePage = $pages.filter('#' + id);

		var callbacks = $thePage.data('wbBeforeShowCallbacks');
		if (callbacks !== undefined) {
			for (var i = 0; i < callbacks.length; i++) {
				callbacks[i]();
			}
		}

		$pages.fadeOut({
			complete: function pageFadeOutComplete () {
				$thePage.show();
				if (complete !== undefined) {
					complete();
				}
			}
		});
	}

	function addBeforeShowCallback (id, cb) {
		var $thePage = $('body > div').filter('#' + id);
		var callbacks = $thePage.data('wbBeforeShowCallbacks');
		if (callbacks === undefined) {
			callbacks = [];
		}
		callbacks.push(cb);
		$thePage.data('wbBeforeShowCallbacks', callbacks);
	}

	(function initAll () {
		// Hide all the pages except the menu
		$('body > div').hide();
		$('#menu').show();
	})();

	(function initMainMenu () {
		$("#play").click(function onClickPlay () {
			switchToPage('game');
		});
	})();

	(function initGame () {
		addBeforeShowCallback('game', function scheduleBackToMenu () {
			setTimeout(function backToMenu () {
				switchToPage('menu');
			}, 2000);
		});
	})();
});