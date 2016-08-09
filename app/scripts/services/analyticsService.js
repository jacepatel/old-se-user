'use strict';

angular.module('SENativ').factory('analyticsService', function($window) {
  	function trackPage(pageName){
      if ($window.analytics){
        $window.analytics.trackView(pageName);
      }
  	}
  	function trackEvent(category, action, label, value){
      if ($window.analytics){
        $window.analytics.trackEvent(category, action, label, value);
      }
  	}
    function trackException(description, fatal){
      if ($window.analytics){
        $window.analytics.trackException(description, fatal);
      }
    }
    function setUserId(userId){
      if ($window.analytics){
        $window.analytics.setUserId(userId);
      }
    }
  	return {
  		trackPage: trackPage,
  		trackEvent: trackEvent,
      trackException: trackException,
      setUserId: setUserId
  	}
});
