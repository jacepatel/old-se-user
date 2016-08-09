'use strict';

angular.module('SENativ')
.controller('PwrdResetRequestCtrl', function($scope, $rootScope, sfeAPI, $location, notifications, analyticsService) {
  analyticsService.trackPage('Password Reset Request');
  // if ($rootScope.loggedIn()){
  //   $location.path('/home');
  // }
  $scope.mobValidator = /[0][4]([0-9]){8}/;
  $scope.mobNum = "";

  $scope.requestReset = function(){
    if ($scope.mobNum.match($scope.mobValidator) == null){
      notifications.addMessage("Please include a valid Australian mobile phone number starting with '04'.\n", 'alert-danger');
    }
    else {
      var mob = "+61" + $scope.mobNum.slice(1);
      sfeAPI.requestPasswordResetToken(mob);
    }
  }
});
