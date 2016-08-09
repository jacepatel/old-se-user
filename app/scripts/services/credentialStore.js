'use strict';

angular.module('SENativ').factory('credStore', function($http, $location, $rootScope, $localstorage) {
  	function setAuthUser(data, token){
      $rootScope.user = data;
      $rootScope.jwtToken = token;
      $localstorage.set('jwtToken', token);
      $localstorage.setObject('user', data);
  	}
  	function logOut(){
			// $cookieStore.remove('user');
      // $cookieStore.remove('jwtToken');
      $localstorage.set('jwtToken', null);
      $localstorage.setObject('user', null);
			$rootScope.user = null;
      $rootScope.jwtToken = null;
      $location.path('/home');
  	}
  	return {
  		setCurrentUser: setAuthUser,
  		logOut: logOut
  	}
});
