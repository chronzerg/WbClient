define(['jquery'], function pagingModule ($) {
	'use strict';

	const BH = "pagingBeforeHideCallbacks",
		  BS = "pagingBeforeShowCallbacks",
		  AH = "pagingAfterHideCallbacks",
		  AS = "pagingAfterShowCallbacks",
		  CH = "pagingChildInstance",
		  OPEN = "pagingOpen",

		  FADE_TIME = 200;

	return function Paging ($pages) {
		var getPage = function (id) {
			return $pages.filter('div#' + id);
		};

		var getOpenPage = function () {
			return $pages.filter('div.' + OPEN);
		};

		var callCallbacks = function ($page, dataId) {
			var callbacks = $page.data(dataId);
			if (callbacks !== undefined) {
				for (var i = 0; i < callbacks.length; i++) {
					callbacks[i]();
				}
			}

			// Recursively call 'callCallbacks' on the child page.
			var childPagesInstance = $page.data(CH);
			if (childPagesInstance !== undefined) {
				var openChildPage = childPagesInstance._getOpenPage();
				childPagesInstance._callCallbacks(openChildPage, dataId);
			}
		};

		var switchToPage = function (id, immediately) {
			var $oldPage = getOpenPage(),
			    $newPage = getPage(id);

			if (immediately === undefined && $oldPage.is(':hidden')) {
				immediately = true;
			}

			$oldPage.removeClass(OPEN);
			$newPage.addClass(OPEN);

			callCallbacks($oldPage, BH);
			callCallbacks($newPage, BS);

			function showNewPage () {
				$newPage.show();

				callCallbacks($oldPage, AH);
				callCallbacks($newPage, AS);
			}

			// Stop any switch page animations that may be
			// happening now.
			$pages.stop();

			if (immediately) {
				$oldPage.hide();
				showNewPage();
			}
			else {
				$oldPage.fadeOut({
					complete: showNewPage,
					duration: FADE_TIME
				});
			}
		};

		var addPageCallback = function (id, dataId, cb) {
			var $thePage = $pages.filter('div#' + id),
				callbacks = $thePage.data(dataId);

			if (callbacks === undefined) {
				callbacks = [];
			}
			callbacks.push(cb);
			$thePage.data(dataId, callbacks);
		};

		var attachChildPaging = function (id, pagingInstance) {
			var $thePage = $pages.filter('div#' + id).data(CH, pagingInstance);
		};

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
			},
			attachChildPaging: attachChildPaging,

			// Internal use
			_getOpenPage: getOpenPage,
			_callCallbacks: callCallbacks
		};
	};
});