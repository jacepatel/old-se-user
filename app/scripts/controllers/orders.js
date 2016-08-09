'use strict';

angular.module('SENativ')
.controller('OrdersCtrl', function($scope, $rootScope, $timeout, sfeAPI, $location, analyticsService, PushWoosh) {
  PushWoosh.resetBadge();
  analyticsService.trackPage('Orders Page');
  $scope.timer = null;
  if (!$rootScope.loggedIn()){
    $location.path('/home');
  }

  sfeAPI.getCurrentOrders($scope, true);

  $scope.cancelOrder = function(orderId){
    sfeAPI.cancelPendingOrder(orderId, $scope);
  }

  var poll = function() {
    $scope.timer = $timeout(function() {
      sfeAPI.getCurrentOrders($scope, false);
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
