'use strict';

angular.module('SENativ')
.controller('WalletCtrl', function($scope, $rootScope, sfeAPI, $location, $ionicPopup, analyticsService) {
  analyticsService.trackPage('Wallet Page');
  if (!$rootScope.loggedIn()){
    $location.path('/home');
  }

  $scope.getImageURL = function(cardType){
    var urlPrefix = 'img/';
    // if (cardType == "American Express"){
    //   return urlPrefix + "Amex.png";
    // }
    // else {
    //   return urlPrefix + cardType + ".png";
    // }
    if (cardType == "master"){
      return urlPrefix + "MasterCard.png";
    }
    else if (cardType == "visa" || cardType == "Visa"){
      return urlPrefix + "Visa.png";
    }
    else if (cardType == "american_express"){
      return urlPrefix + "Amex.png";
    }
    else if (cardType == "discover"){
      return urlPrefix + "Discover.png";
    }
    else {
      return urlPrefix + "secure-logos.png";
    }
  }

  $scope.deletePaymentMethod = function(token){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Payment Method',
        template: 'Are you sure you want to delete this payment method?',
        okType: 'button-greenbackground'
      });
      confirmPopup.then(function(res) {
        if(res) {
          sfeAPI.deleteUserPaymentMethod(token);
        }
      });
  }

  $scope.noPms = function(){
      return $rootScope.user && $rootScope.user.paymentMethods && $rootScope.user.paymentMethods.length < 1;
  }

  $scope.makeDefault = function(pm){
    if (!pm.defaultMethod){
      sfeAPI.makeDefaultPaymentMethod(pm.paymentMethodId);
    }
  }

});
