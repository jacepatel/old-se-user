angular.module('SENativ').factory('sessionInjector', function($rootScope, spreedlyAPIUrl, analyticsService) {
  var sessionInjector = {
    request: function(config) {
      if ($rootScope.loggedIn()) {
        if (config.url.indexOf(spreedlyAPIUrl) == -1){
          config.headers['JWT-Token'] = $rootScope.jwtToken;
        }
      }
      return config;
    },
    response: function (response) {
        // console.log(response); // Contains the data from the response.
        if (response.data.error !== undefined){
          analyticsService.trackException(response.data.error, false);
        }
        // Return the response or promise.
      return response || $q.when(response);
    }
  };
  return sessionInjector;
});
