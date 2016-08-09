'use strict';

/**
* @ngdoc function
* @name sfeUserApp.controller:MainCtrl
* @description
* # HomeCtrl
* Home Controller of the sfeUserApp
*/
angular.module('SENativ').controller('SideMenuCtrl', function($scope, $rootScope, $timeout, sfeAPI, apiUrl, $ionicLoading, $ionicModal, $location, analyticsService, $ionicSideMenuDelegate, credStore) {
  $scope.email = "";
  $scope.password = "";
  $scope.searchmodal = null;
  $scope.searchTerm = "";
  $scope.trucks = [];
  $scope.futureTrucks = [];

  $scope.getPadding = function(){
    var pl = $rootScope.getDeviceType();
    if (pl == "ios"){
      return 20;
    }
    else {
      return 0;
    }
  }

  $scope.todayOrTomorrow = function(date){
    var currentDate = new Date();
    var openTime = new Date(date);
    if (currentDate.getDate() == openTime.getDate()){
      return "TODAY";
    }
    else {
      return "TOMORROW";
    }
  }

  $scope.login = function(){
    var email = $scope.email;
    var password = $scope.password;
    // $ionicSideMenuDelegate.toggleLeft();
    sfeAPI.authenticate(email, password);
  }

  $scope.logout = function(){
    $ionicSideMenuDelegate.toggleLeft();
    credStore.logOut();
  }

  $scope.loggedIn = function(){
    return $rootScope.user != null;
  }

  $scope.goToFromMenu = function(path){
    $ionicSideMenuDelegate.toggleLeft();
    $timeout(function(){
      if (path != $location.path()){
        analyticsService.trackEvent("Go To From Menu", $location.path(), "Go to", path);
        $location.path(path);
      }
    }, 400);
  }

  $scope.goToMenu = function(truck){
    if (truck.activeSession.isUsed){
      $ionicSideMenuDelegate.toggleLeft();
      $scope.searchmodal.remove().then(function(){
        $scope.searchmodal = null;
        var path = '/menu/' + truck.truckId;
        $location.path(path);
      });
    }
  }

  $scope.addTrucksToScope = function(trucks){
    $scope.trucks = trucks;
  }

  $scope.addEventsToScope = function(events){
    events.forEach(function(event){
      event.trucks.forEach(function(truck){
        $scope.trucks.push(truck);
      });
    });
  }

  $scope.addEventsNoTrucksToScope = function(events){
    $scope.eventsNoTrucks = events;
  }

  $scope.addFutureTrucksToScope = function(trucks){
    $scope.futureTrucks = [];
    trucks.forEach(function(truck){
      if ($scope.futureTrucks.indexOf(truck) == -1){
        $scope.futureTrucks.push(truck);
      }
    });
  }

  $scope.addFutureEventsToScope = function(events){
    events.forEach(function(event){
      event.trucks.forEach(function(truck){
        if ($scope.futureTrucks.indexOf(truck) == -1){
          $scope.futureTrucks.push(truck);
        }
      });
    });
  }

  $scope.openSearch = function(){
    sfeAPI.getVendors($scope, true);
  }

  $scope.closeSearch = function(){
    $scope.searchmodal.remove();
    $scope.searchmodal = null;
  }

  $scope.init = function(){
      $ionicModal.fromTemplateUrl('templates/searchmodal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        if ($scope.searchmodal == null){
          $scope.searchmodal = modal;
          modal.show();
        }
      });
  }
});
