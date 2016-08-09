'use strict';

angular.module('SENativ')
.controller('HistoryCtrl', function($scope, $rootScope, $timeout, sfeAPI, $location, analyticsService) {
  analyticsService.trackPage('History Page');
  $scope.timer = null;
  if (!$rootScope.loggedIn()){
    $location.path('/home');
  }

  sfeAPI.getCompletedOrders($scope, true);

  var poll = function() {
    $scope.timer = $timeout(function() {
      sfeAPI.getCompletedOrders($scope, false);
      poll();
    }, 10000);
  };

  poll();

  $scope.$on(
    "$destroy",
    function( event ) {
      $timeout.cancel( $scope.timer );
    }
  );

});
