define(function paging () {
	return function createPaging ($pages) {
		//Constants
		var BH = "pagingBeforeHideCallbacks";
		var BS = "pagingBeforeShowCallbacks";
		var AH = "pagingAfterHideCallbacks";
		var AS = "pagingAfterShowCallbacks";
		var OPEN = "pagingOpen";

		function callCallbacks ($page, dataId) {
			var callbacks = $page.data(dataId);
			if (callbacks !== undefined) {
				for (var i = 0; i < callbacks.length; i++) {
					callbacks[i]();
				}
			}
		}

		function switchToPage(id) {
			var $oldPage = $pages.filter('div.' + OPEN);
			var $newPage = $pages.filter('div#' + id);

			callCallbacks($oldPage, BH);
			callCallbacks($newPage, BS);

			$oldPage.fadeOut({
				complete: function pageFadeOutComplete () {
					$oldPage.removeClass(OPEN);
					$newPage.show();
					$newPage.addClass(OPEN);

					callCallbacks($oldPage, AH);
					callCallbacks($newPage, AS);
				}
			});
		}

		function addPageCallback (id, dataId, cb) {
			var $thePage = $pages.filter('div#' + id);
			var callbacks = $thePage.data(dataId);
			if (callbacks === undefined) {
				callbacks = [];
			}
			callbacks.push(cb);
			$thePage.data(dataId, callbacks);
		}

		$pages.hide();
		$pages.first().addClass(OPEN).show();

		return {
			switchToPage: switchToPage,
			addBeforeHideCallback: function (id, cb) {
				addPageCallback(id, BH, cb);
			},
			addBeforeShowCallback: function (id, cb) {
				addPageCallback(id, BS, cb);
			},
			addAfterHideCallback: function (id, cb) {
				addPageCallback(id, AH, cb);
			},
			addAfterShowCallback: function (id, cb) {
				addPageCallback(id, AS, cb);
			}
		};
	};
});