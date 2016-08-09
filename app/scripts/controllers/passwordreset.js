'use strict';

angular.module('SENativ')
.controller('PwrdResetCtrl', function($scope, $rootScope, $location, sfeAPI, notifications, analyticsService) {
  analyticsService.trackPage('Password Reset');
  // if ($rootScope.loggedIn()){
  //   $location.path('/home');
  // }

  $scope.params = {
    resetToken: "",
    newPassword: ""
  }

  $scope.resetPassword = function(){
    notifications.clearMessages();
    if ($scope.params.resetToken.length != 6){
      notifications.addMessage("Invalid token. Must be a six character code.", 'alert-danger');
    }
    else if ($scope.params.newPassword.length < 6) {
      notifications.addMessage("Please include a password no less than six characters in length.\n", 'alert-danger');
    }
    else {
      sfeAPI.resetPassword($scope.params.resetToken, $scope.params.newPassword);
    }
  }
});
