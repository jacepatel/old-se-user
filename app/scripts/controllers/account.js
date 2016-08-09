'use strict';

angular.module('SENativ')
.controller('AccountCtrl', function($scope, $rootScope, sfeAPI,  $filter, notifications, analyticsService) {
  analyticsService.trackPage('Account Page');
  if (!$rootScope.loggedIn()){
    $location.path('/home');
  }

  $scope.accountForm = null;

  $scope.mobValidator = /[0][4]([0-9]){8}/;

  $scope.accountDetails = {
    firstName: $rootScope.user.firstName,
    lastName: $rootScope.user.lastName,
    mobileNumber:  $filter('mobNumFormat')($rootScope.user.mobNumber),
    password: "",
    locality: $rootScope.user.locality
  }

  $scope.updateUserDetails = function(){
    if ($scope.accountDetails.firstName.length < 2 || $scope.accountDetails.lastName.length < 2){
      notifications.addMessage("Please include valid first and last names.\n", 'alert-danger');
    }
    else if ($scope.accountForm.mobNum.$invalid || $scope.accountDetails.mobileNumber.length != 10){
      notifications.addMessage("Please include a valid Australian mobile phone number starting with '04'.\n", 'alert-danger');
    }
    else if ($scope.accountDetails.password < 1){
      notifications.addMessage("Please include your password for security purposes.", 'alert-danger');
    }
    else {
      var accountParams = JSON.stringify({
        "firstName": $scope.accountDetails.firstName,
        "lastName": $scope.accountDetails.lastName,
        "password": $scope.accountDetails.password,
        "mobileNumber": "+61" + $scope.accountDetails.mobileNumber.slice(1)
      });
      sfeAPI.updateAccountDetails(accountParams);
    }
  }

  $scope.placeOptions = {
    types: ['(cities)'],
    componentRestrictions: {country: 'au'}
  }

});
