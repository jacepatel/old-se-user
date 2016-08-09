'use strict';

angular.module('SENativ').factory('sfeAPI', function($http, $location, credStore, $rootScope, $cookieStore, $route, $routeParams, $window, notifications, apiUrl, $ionicLoading, $ionicPopup, version, $ionicSlideBoxDelegate, analyticsService, $ionicSideMenuDelegate, $localstorage, PushWoosh, deviceManager) {
  // var domain = 'https://tructrac.herokuapp.com';
  // var domain = testUrl;
  var domain = apiUrl;
  // debugger;
  //Fetches a list of currently active vendors

  function getVendors(scope, init){
      var url = domain + '/mapData';
      $http.get(url).
        success(function(data) {
            scope.addTrucksToScope(data.trucks);
            scope.addEventsToScope(data.events);
            scope.addFutureTrucksToScope(data.futureTrucks);
            scope.addFutureEventsToScope(data.futureEvents);
        }).error(function(){
          notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
        }).finally(function(){
          if (init){
            scope.init();
          }
        });
  }

  //Authenticates user
  function authenticate(user, pass){
    $ionicLoading.show({
      template: 'Authenticating...'
    });
      var url = domain + '/usersession';
      var credentials = JSON.stringify(
        {
          "email": user.toLowerCase(),
          "password": pass
        }
      );
      $http.post(url, credentials).
      success(function(data, status, headers, config) {
      if (data.error == undefined){
        analyticsService.setUserId(data.userId);
        credStore.setCurrentUser(data, headers('JWT-Token'));
        $ionicSideMenuDelegate.toggleLeft();
        var device = deviceManager.getCurrentDevice();
        var deviceId = deviceManager.getDeviceId();
        if (deviceId != null){
          updateDevice(deviceId, deviceManager.getCurrentDevice().deviceToken);
        }
        else {
          if (device){
            registerDevice(deviceManager.getCurrentDevice().deviceToken);
          }
        }
      }
      else {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: data.error,
          cssClass: 'ionic-popup',
          okType: 'button-royal'
        });
      }
      if (data.truckId){
        credStore.logOut();
        // $window.location.href = "https://sfevendor.herokuapp.com";
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  //Registers new user
  function register(params, scope){
    notifications.clearMessages();
    $ionicLoading.show({
      template: 'Creating Account...'
    });
    var url = domain + '/users';
    $http.post(url, params).
    success(function(data, status, headers, config) {
      if (data.error === undefined){
        analyticsService.setUserId(data.user.userId);
        analyticsService.trackEvent("Registration", "Finish", "Completed Registration", 1);
        credStore.setCurrentUser(data.user, headers('JWT-Token'));
        $location.path('/card');
        notifications.addMessage("Your account has been created. Please add a valid payment method to order via StreetEats.\n", 'alert-success');
      }
      else {
        $ionicSlideBoxDelegate.slide(0);
        scope.step = 1;
        notifications.addMessage(data.error, 'alert-danger');
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  //Gets menu for a truck
  function getMenu(truckId, scope){
    $ionicLoading.show({
      template: 'Retrieving menu...'
    });
    var url = domain + '/trucks/' + truckId + "/menu";
    $http.get(url).success(function(data){
      scope.truck = data.truck;
      var items = data.items;
      items.forEach(function(item){
        item.qty = 0;
        if (item.itemOptions.length > 0){
          item.itemOptions.forEach(function(option){
            if (option.type == "Boolean"){
              option.added = false;
            }
            else if (option.type == "Select") {
              option.selectedId = null;
            }
          });
        }
      });
      scope.items = items;
      scope.activeForOrders = data.truck.activeSession.isActiveForOrders;
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      scope.loaded = true;
      $ionicLoading.hide();
    });
  }

  function submitOrder(params, truckId){
    notifications.clearMessages();
    $ionicLoading.show({
      template: 'Submitting order...'
    });
    var url = domain + '/users/' + truckId + '/orders';
    $http.post(url, params).success(function(data){
      if (data.error === undefined){
        analyticsService.trackEvent("Purchase", "Order", "Scheduled", 1);
        notifications.addMessage("Thanks for ordering! You will receive a text when you order is ready to collect.", 'alert-success');
        $location.path('/orders');
      }
      else {
        notifications.addMessage(data.error, 'alert-danger');
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function getCurrentOrders(scope, init){
    if (init){
      $ionicLoading.show({
        template: 'Retrieving orders...'
      });
    }
    var url = domain + '/users/orders';
    $http.get(url).success(function(data){
        scope.pendingOrders = [];
        scope.confirmedOrders = [];
        scope.readyOrders = [];
        scope.completeOrders = [];
        data.forEach(function(order){
          if (order.orderStatus == 1){
            scope.pendingOrders.push(order);
          }
          else if (order.orderStatus == 2){
            scope.confirmedOrders.push(order);
          }
          else if (order.orderStatus == 3){
            scope.readyOrders.push(order);
          }
        });
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function getCompletedOrders(scope, init){
    if (init){
      $ionicLoading.show({
        template: 'Retrieving orders...'
      });
    }
    var url = domain + '/users/orderhistory';
    $http.get(url).success(function(data){
      scope.orders = [];
      scope.cancelledOrders = [];
      data.forEach(function(order){
        if (order.orderStatus == 4){
          scope.orders.push(order);
        }
        else {
          scope.cancelledOrders.push(order);
        }
      });
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function cancelPendingOrder(orderId, scope){
    $ionicLoading.show({
      template: 'Cancelling order...'
    });
    var url = domain + '/users/orders/' + orderId + '/cancel';
    $http.get(url).success(function(data){
      if (data.error){
        notifications.addMessage(data.error, 'alert-danger');
      }
      else {
        notifications.addMessage("Your order has been cancelled.", 'alert-success');
        var indexOfCancelled;
        scope.pendingOrders.forEach(function(order, index){
          if (order.orderId == orderId){
            indexOfCancelled = index;
            return;
          }
        });
        scope.pendingOrders.splice(indexOfCancelled, 1);
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  //Store a payment method nonce from BrainTree against a customer
  function addCardToCustomer(nonce){
    $ionicLoading.show({
      template: 'Adding card...'
    });
      var url = domain + '/paymethods/add';
      var cardParams = JSON.stringify({
        "braintreeNonce": nonce
      });
      $http.post(url, cardParams).success(function(data){
        if (data.error){
          notifications.addMessage(data.error, 'alert-danger');
        } else {
          updateUser();
          notifications.addMessage("Card added.", 'alert-success');
          $location.path('/wallet');
        }
      }).error(function(){
        notifications.addMessage("Something went wrong. Your credit card has not been added.", 'alert-danger');
      }).finally(function(){
        $ionicLoading.hide();
      });
  }

  //Store a payment method nonce from Spreedly against a customer
  function addSpreedlyCardToCustomer(token){
    notifications.clearMessages();
      var url = domain + '/paymethods/add';
      var cardParams = JSON.stringify({
        "paymentMethodToken": token
      });
      $http.post(url, cardParams).success(function(data){
        if (data.error !== undefined){
          if (data.error != ""){
            notifications.addMessage(data.error, 'alert-danger');
          }
          else {
            notifications.addMessage(data.error, 'We could not verify your credit card. Please check the card details.');
          }
        } else {
          analyticsService.trackEvent("Wallet", "Add Card", "Verified", 1);
          updateUser();
          notifications.addMessage("Payment method added.", 'alert-success');
          $location.path('/home');
        }
      }).error(function(){
        notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
      }).finally(function(){
        $ionicLoading.hide();
      });
  }

  function getCustomerPaymentMethods(userId, scope){
    var url = domain + '/users/' + userId + '/paymethods';
    $http.get(url).success(function(data){
      scope.paymentMethods = data;
    });
  }

  function deleteUserPaymentMethod(token){
    $ionicLoading.show({
      template: 'Deleting...'
    });
    var url = domain + '/paymethods/' + token;
    $http.delete(url).success(function(data){
      if (data.error){
        notifications.addMessage("Something went wrong. Please try again.", 'alert-danger');
      }
      else {
        notifications.addMessage("Payment method has been deleted.", 'alert-success');
      }
      updateUser();
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function makeDefaultPaymentMethod(paymentMethodId){
    $ionicLoading.show({
      template: 'Changing...'
    });
    var url = domain + '/paymethods/' + paymentMethodId + '/makeDefault';
    $http.get(url).success(function(data){
      updateUser();
      notifications.addMessage("Default payment method changed.", 'alert-success');
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function updateUser(){
    var url = domain + '/users/updates';
    if (!$rootScope.user.userId){
      $rootScope.logOut();
    } else {
      $http.get(url).success(function(data){
        if (!data.error){
          credStore.setCurrentUser(data.user, $rootScope.jwtToken);
        } else {
          $rootScope.logOut();
          $location.path('/home');
        }
      });
    }
  }

  function updateAccountDetails(params){
    notifications.clearMessages();
    $ionicLoading.show({
      template: 'Updating Account...'
    });
    var url = domain + '/users/update';
    $http.post(url, params).success(function(data){
      if (!data.error){
        updateUser();
        notifications.addMessage('Account updated.', 'alert-success');
      } else {
        notifications.addMessage(data.error, 'alert-danger');
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function requestPasswordResetToken(mobNum){
    $ionicLoading.show({
      template: 'Requesting password reset...'
    });
    var params = JSON.stringify({
      mobileNumber: mobNum
    })
    var url = domain + '/createPasswordResetToken';
    $http.post(url, params).success(function(data){
      if (!data.error){
        $location.path('/pwreset');
      }
      else {
        notifications.addMessage(data.error, 'alert-danger');
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function resetPassword(token, newPass){
      $ionicLoading.show({
        template: 'Resetting password...'
      });
      var params = JSON.stringify({
        "newPassword": newPass
      });
      var url = domain + '/resetPassword/' + token;
      $http.post(url, params).success(function(data, status, headers, config){
        if (data.error == undefined){
          credStore.setCurrentUser(data, headers('JWT-Token'));
          notifications.addMessage("Your password has been reset and you have been logged in.\n", 'alert-success');
          $location.path('/home');
        }
        else {
          $location.path('/pwresetrequest');
          $ionicPopup.alert({
            title: data.error,
            cssClass: 'ionic-popup',
            okType: 'button-royal'
          });
        }
      }).error(function(){
        notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
      }).finally(function(){
        $ionicLoading.hide();
      });
  }

  function checkForUpdates(scope){
    var url = domain + '/checkForUpdates/' + version;
    $http.get(url).success(function(data){
      $rootScope.updates = data;
      if (data.length > 0){
        var critical = false;
        $rootScope.updates.forEach(function(update){
          if (update.isCritical == true){
            critical = true;
            return;
          }
        });
        if (critical){
          $location.path('/updates');
        }
        else {
          notifications.addMessage("There are updates available for StreetEats.", "alert-danger");
        }
      }
      else {
        $location.path('/home');
      }
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    });
  }

  function getSpreedlyKey(){
    var url = domain + '/spreedlyEnvironmentKey';
    $http.get(url).success(function(data){
      $rootScope.spreedlyKey = data.spreedlyKey;
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    });
  }

  function registerDevice(token){
    var url = domain + '/devices/register/' + $rootScope.getDeviceType() + '/' + token;
    $http.post(url).success(function(data){
      $localstorage.set('deviceId', data.deviceId);
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    });
  }

  function updateDevice(deviceId, token){
    var url = domain + '/devices/' + deviceId + '/update/' + token;
    $http.post(url).success(function(data){
      $localstorage.set('deviceId', data.deviceId);
    }).error(function(){
      notifications.addMessage("Network error. Please check your connection.\n", 'alert-danger');
    });
  }

  return {
    //Define API calls here.....
    authenticate: authenticate,
    getVendors: getVendors,
    register: register,
    getMenu: getMenu,
    submitOrder: submitOrder,
    getCurrentOrders: getCurrentOrders,
    addCardToCustomer: addCardToCustomer,
    getCustomerPaymentMethods: getCustomerPaymentMethods,
    deleteUserPaymentMethod: deleteUserPaymentMethod,
    addSpreedlyCardToCustomer: addSpreedlyCardToCustomer,
    updateUser: updateUser,
    makeDefaultPaymentMethod: makeDefaultPaymentMethod,
    updateAccountDetails: updateAccountDetails,
    requestPasswordResetToken: requestPasswordResetToken,
    resetPassword: resetPassword,
    checkForUpdates: checkForUpdates,
    getSpreedlyKey: getSpreedlyKey,
    getCompletedOrders: getCompletedOrders,
    cancelPendingOrder: cancelPendingOrder,
    registerDevice: registerDevice,
    updateDevice: updateDevice
  }
});
