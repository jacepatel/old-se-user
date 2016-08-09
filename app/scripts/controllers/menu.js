'use strict';

/**
* @ngdoc function
* @name sfeUserApp.controller:MainCtrl
* @description
* # HomeCtrl
* Home Controller of the sfeUserApp
*/
angular.module('SENativ')
.controller('MenuCtrl', function($scope, $rootScope, $timeout, sfeAPI, $stateParams, $ionicModal, $http, notifications, apiUrl, analyticsService, $ionicSideMenuDelegate, deviceManager) {
  $scope.timer = null;
  $scope.truck = null;
  $scope.truckId = $stateParams.truckId;
  var pageName = 'Menu Page: ' + $scope.truckId;
  analyticsService.trackPage(pageName);
  $scope.items = [];
  $scope.activeForOrders = false;
  $scope.loaded = false;
  $scope.itemToAdd = null;
  $scope.itemToEditIndex = null;
  $scope.currentItems = [];
  sfeAPI.getMenu($scope.truckId, $scope);

  $scope.getOrderTotal = function(){
    var total = 0.00;
    $scope.currentItems.forEach(function(item){
      total += $scope.getItemTotal(item) * item.qty;
    });
    return total;
  }

  $scope.getItemTotal = function(item){
    var total = item.price;
    item.itemOptions.forEach(function(itemOption){
      if (itemOption.type == "Boolean" && itemOption.added){
        total += itemOption.cost;
      }
      else if (itemOption.type == "Select" && itemOption.selectedId != null){
        itemOption.itemOptionSelects.forEach(function(selected){
          if (selected.itemOptionSelectId == itemOption.selectedId){
            total += selected.cost;
          }
        });
      }
    });
    return total;
  }

  $scope.openConfirm = function(){
    $ionicModal.fromTemplateUrl('templates/confirmmodal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.confirmmodal = modal;
      modal.show();
    });
  }

  $scope.closeConfirm = function(){
    $scope.confirmmodal.remove();
  }

  $scope.removeFromCart = function(index){
    if ($scope.currentItems[index].qty > 1){
      $scope.currentItems[index].qty -= 1;
    }
    else {
      $scope.currentItems.splice(index, 1);
    }
  }

  $scope.openOptions = function(index){
    if ($rootScope.loggedIn() && $rootScope.user.paymentMethods.length > 0){
      if (!$scope.queueFull()){
        if ($scope.items[index].itemOptions.length < 1){
          $scope.addItem($scope.items[index]);
        }
        else {
          $ionicModal.fromTemplateUrl('templates/optionsmodal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function (modal) {
            $scope.optionsmodal = modal;
            $scope.itemToAdd = angular.copy($scope.items[index]);
            $scope.itemToAdd.itemOptions.forEach(function(option){
              if (option.type == "Select"){
                  option.itemOptionSelects.forEach(function(select){
                  if (select.isDefault){
                    option.selectedId = select.itemOptionSelectId;
                    return;
                  }
                });
              }
            });
            modal.show();
          });
        }
      }
    }
    else {
      $ionicSideMenuDelegate.toggleLeft();
    }
  }

  $scope.closeOptions = function(){
    $scope.itemToAdd = null;
    $scope.optionsmodal.remove();
  }

  function compileOrderPayload(){
    var orderItems = new Array();
    $scope.currentItems.forEach(function(cItem){
      var itemData = {
        itemId: cItem.itemId,
        itemOptions: cItem.itemOptions,
        qty: cItem.qty
      }
      orderItems.push(itemData);
    });
    return JSON.stringify({
      truckId: $scope.truckId,
      items: orderItems,
      deviceId: deviceManager.getDeviceId()
    });
  }

  $scope.placeOrder = function(){
    $scope.confirmmodal.hide();
    if (!$rootScope.user){
      notifications.addMessage("Please create an account to place an order.", 'alert-danger');
    }
    else if (!$rootScope.user.paymentMethods || $rootScope.user.paymentMethods.length < 1){
      notifications.addMessage("Please attach a payment method to your account.", 'alert-danger');
    }
    else {
      var orderItems = new Array();
        sfeAPI.submitOrder(compileOrderPayload(), $scope.truckId);
      }
    }

    $scope.showFooter = function(){
        return (!$rootScope.loggedIn() || $rootScope.user.paymentMethods.length < 1 || $scope.getOrderTotal() > 0 || !$scope.activeForOrders);
    }

    $scope.getFooterDimension = function(){
      if(!$scope.activeForOrders){
        return 30;
      }
      else if (!$rootScope.loggedIn() || $rootScope.user.paymentMethods.length < 1){
        return 80;
      }
      else if ($scope.queueFull()){
        return 50;
      }
      else {
        if ($scope.getOrderTotal() > 0){
          return 128;
        }
        else {
          return 0;
        }
      }
    }

    $scope.canOrder = function(){
      return ($rootScope.loggedIn() && $rootScope.user.paymentMethods.length > 0 && $scope.activeForOrders);
    }

    $scope.queueFull = function(){
      if ($scope.truck && $scope.truck.queueSize >= $scope.truck.activeSession.maximumOrders && $scope.truck.queueSize > 0){
        return true;
      }
      else {
        return false;
      }
    }

    $scope.addItem = function(item){
      $scope.itemToAdd = null;
      var added = false;
      $scope.currentItems.forEach(function(cItem){
        if (cItem.itemId == item.itemId){
          if (compareItems(cItem.itemOptions, item.itemOptions)){
            cItem.qty += 1;
            added = true;
            return;
          }
        }
      });
      if (!added){
        var itemCpy = angular.copy(item);
        itemCpy.qty = 1;
        $scope.currentItems.push(itemCpy);
      }
      if ($scope.optionsmodal){
        $scope.optionsmodal.hide();
      }
    }

    function getIds(items, idFieldName){
      var itemIds = new Array();
      items.forEach(function(item){
        itemIds.push(item[idFieldName]);
      });
      return itemIds;
    }

    function compareItems(items, otherItems){
      if (angular.toJson(items) != angular.toJson(otherItems)){
        return false;
      }
      return true;
    }

    function reconcileMenuItems(payloadItems){
      if (!compareItems(payloadItems, $scope.items)){
        if ($scope.optionsmodal && $scope.optionsmodal.isShown()){
          $scope.closeOptions();
        }
        if ($scope.confirmmodal && $scope.confirmmodal.isShown()){
          $scope.closeConfirm();
        }
        $scope.currentItems = [];
        $scope.items = payloadItems;
        notifications.addMessage("The vendor has changed the menu. Please add your items again.", "alert-warning");
      }
    }

    $scope.selectOption = function(option, selectedOption){
      option.selectedId = null
      option.itemOptionSelects.forEach(function(possibleChoice){
        if (possibleChoice.itemOptionSelectId == selectedOption.itemOptionSelectId){
          option.selectedId = selectedOption.itemOptionSelectId;
          return;
        }
      });
    }

    var poll = function() {
      $scope.timer = $timeout(function() {
        var url = apiUrl + '/trucks/' + $scope.truckId + "/menu";
        $http.get(url).success(function(data){
          $scope.truck = data.truck;
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
          reconcileMenuItems(items);
          $scope.activeForOrders = data.truck.activeSession.isActiveForOrders;
        });
        poll();
      }, 15000);
    };

    poll();

    $scope.$on(
      "$destroy",
      function( event ) {
        $timeout.cancel( $scope.timer );
      }
    );
});
