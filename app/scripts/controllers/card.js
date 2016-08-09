'use strict';

angular.module('SENativ')
.controller('CardCtrl', function($scope, $rootScope, $location, $ionicScrollDelegate, spreedlyService, notifications, analyticsService) {
  analyticsService.trackPage('Card Page');
  if (!$rootScope.loggedIn()){
    $location.path('/home');
  }
  $scope.cardForm = null;

  $scope.card = {
    number: "",
    expiry: "",
    cvc: "",
    type: ""
  }

  // $scope.cardForm = null;
  //
  // braintreeService.initSdk('ccForm');

  $scope.checkCardNo = function(){
    notifications.clearMessages();
    if ($scope.cardForm.cardNo.$pristine || $scope.cardForm.cardNo.$invalid || $scope.card.number.length < 1){
      notifications.addMessage("Please include a valid credit card number.\n", 'alert-danger');
    }
  }

  $scope.checkExp = function(){
    notifications.clearMessages();
    if ($scope.cardForm.cardExp.$pristine || $scope.cardForm.cardExp.$invalid || $scope.card.expiry.length < 1){
      notifications.addMessage("Please include a valid expiry.\n", 'alert-danger');
    }
  }

  $scope.checkCVC = function(){
    notifications.clearMessages();
    if ($scope.cardForm.cardCVC.$pristine || $scope.cardForm.cardCVC.$invalid || $scope.card.cvc.length < 1){
      notifications.addMessage("Please include a valid CVC.\n", 'alert-danger');
    }
  }

  $scope.addPaymentMethod = function(){
      spreedlyService.addCard($rootScope.user.userId, $scope.card);
  }

  $scope.submittable = function(){
    if ($scope.cardForm){
      if ($scope.cardForm.cardNo.$pristine || $scope.cardForm.cardNo.$invalid || $scope.card.number.length < 1){
        return true;
      }
      else if ($scope.cardForm.cardExp.$pristine || $scope.cardForm.cardExp.$invalid || $scope.card.expiry.length < 1){
        return true;
      }
      else if ($scope.cardForm.cardCVC.$pristine || $scope.cardForm.cardCVC.$invalid || $scope.card.cvc.length < 1){
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
});
