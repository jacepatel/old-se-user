angular.module('SENativ').factory('spreedlyService', function($http, $location, sfeAPI, $rootScope, $window, clientTokenPath, spreedlyAPIUrl, notifications, $ionicLoading) {
  var client = null;

  function initSdk(ccForm){
  }

  function addCard(userId, card){
    $ionicLoading.show({
      template: 'Adding card...'
    });
    var spreedlyCard = JSON.stringify({
          "payment_method":{
              "credit_card":{
                "first_name": $rootScope.user.firstName,
                "last_name": $rootScope.user.lastName,
                "number": card.number,
                "verification_value": card.cvc,
                "month": card.expiry.substr(0, 2),
                "year": card.expiry.substr(3, 4),
                "email": $rootScope.user.email
              },
              "data": {
                "user_id": $rootScope.user.userId
              }
        }
    });

    var domain = spreedlyAPIUrl + "payment_methods.json?environment_key=" + $rootScope.spreedlyKey;

    $http.post(domain, spreedlyCard).success(function(data){
      if (data.transaction.succeeded == true){
        sfeAPI.addSpreedlyCardToCustomer(
          data.transaction.payment_method.token);
      }
      else {
        notifications.addMessage(data.transaction.message, 'alert-danger');
      }
    }).error(function(data){
      notifications.addMessage(data.transaction.message, 'alert-danger');
    });
  }

  return {
    initSdk: initSdk,
    addCard: addCard
  }
});
