'use strict';

angular.module('SENativ').factory('geolocation', function(notifications, $ionicLoading, $cordovaGeolocation) {
    function getLocation(onSuccess, onFail) {
      $ionicLoading.show({
        template: 'Loading...'
      });
      $cordovaGeolocation
       .getCurrentPosition()
       .then(function (position) {
         onSuccess(position);
       }, function(err) {
         onFail();
       });
    }
  	return {
  		getLocation: getLocation
  	}
});
