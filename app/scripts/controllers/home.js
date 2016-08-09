'use strict';

/**
* @ngdoc function
* @name sfeUserApp.controller:MainCtrl
* @description
* # HomeCtrl
* Home Controller of the sfeUserApp
*/
angular.module('SENativ')
.controller('HomeCtrl', function($scope, $rootScope, $timeout, sfeAPI, apiUrl, $ionicLoading, $ionicModal, $location, analyticsService, $ionicPlatform, deviceManager) {
  if ($rootScope.user){
    analyticsService.setUserId($rootScope.user.userId);
  }

  if ($rootScope.loggedIn() && !deviceManager.isDeviceRegistered() && deviceManager.getCurrentDevice() != null){
    sfeAPI.registerDevice(deviceManager.getCurrentDevice().deviceToken);
  }

  $ionicPlatform.ready(function() {
    navigator.geolocation.getCurrentPosition(function(pos){
      $rootScope.coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }
      console.log("Got location!");
      sfeAPI.getVendors($scope, true);
      // Hide the splash screen
      if (window.navigator && window.navigator.splashscreen) {
        console.log('Hiding splash screen');
        window.navigator.splashscreen.hide();
      }
    }, function(error){
      $rootScope.coords = {
        lat: -27.470933100000000000,
        lng: 153.023502399999980000
      }
      console.log("Failed to get location.");
      sfeAPI.getVendors($scope, true);
      // Hide the splash screen
      if (window.navigator && window.navigator.splashscreen) {
        console.log('Hiding splash screen');
        window.navigator.splashscreen.hide();
      }
    },
    { enableHighAccuracy: true, timeout: 6000 });
  });

  analyticsService.trackPage('Home Page');

  $scope.timer = null;
  $scope.iwTruck = null;
  $scope.iwTruckFuture = null;
  $scope.iwSessionFuture = null;
  $scope.iwEvent = null;
  $scope.trucks = [];
  $scope.events = [];
  $scope.futureTrucks = [];
  $scope.futureEvents = [];
  $scope.eventsNoTrucks = [];
  $scope.searchTerm = "";

  $ionicModal.fromTemplateUrl('templates/eventmodal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.eventmodal = modal;
  });

  $ionicLoading.show({
    template: 'Loading...'
  });

  $scope.mapOptions = {
    panControl: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    overviewMapControl: false
  }

  $scope.mapEvents = {
    'click': function(maps, eventName, args){
      $scope.iwClose();
    },
    'drag': function(maps, eventName, args){
      $scope.iwClose();
    }
  }

  $scope.infoWindowOptions = {
    maxWidth: 120
  }

  sfeAPI.checkForUpdates();

  $scope.iwClose = function(){
    if ($scope.iwTruck != null){
      $scope.iwTruck = null;
    }
    if ($scope.iwTruckFuture != null){
      $scope.iwTruckFuture = null;
    }
    if ($scope.iwSessionFuture != null){
      $scope.iwSessionFuture = null;
    }
    if ($scope.iwEvent != null){
      $scope.iwEvent = null;
    }
  }

  $scope.iwOpen = function(truck){
    $scope.map.center = {
      latitude: truck.activeSession.latitude,
      longitude: truck.activeSession.longitude
    }
    $timeout(function(){
      $scope.iwTruck = truck;
    }, 100);
  }

  $scope.iwOpenFuture = function(futureSession, truck){
    $scope.map.center = {
      latitude: futureSession.latitude,
      longitude: futureSession.longitude
    }
    $timeout(function(){
      $scope.iwTruckFuture = truck;
      $scope.iwSessionFuture = futureSession;
    }, 100);
  }

  $scope.init = function(){
    // $rootScope.coords = {
    //   lat: -27.470933100000000000,
    //   lng: 153.023502399999980000
    // }
    $scope.map = { center: { latitude: $rootScope.coords.lat, longitude: $rootScope.coords.lng }, zoom: 14 };
    $ionicLoading.hide();
  }

  $scope.goToMenu = function(truck){
    if (truck.activeSession.isUsed && truck.activeSession.isActiveForOrders){
      $scope.eventmodal.remove().then(function(){
        $scope.openEventIndex = null;
        var path = '/menu/' + truck.truckId;
        $location.path(path);
      });
    }
  }

  var poll = function(){
    $scope.timer = $timeout(function() {
      sfeAPI.getVendors($scope, false);
      poll();
    }, 30000);
  }

  $scope.$on("$destroy", function( event ){
    $timeout.cancel($scope.timer);
  });

  $scope.getImgUrl = function(markerUrl){
    if (markerUrl != ""){
      return "http://www.streeteatsapp.co" + markerUrl;
    }
    else {
      return "http://www.streeteatsapp.co/assets/markers/bernies.png";
    }
  }

  $scope.getImgNotActiveUrl = function(markerUrl){
    if (markerUrl != ""){
      var insertPosition = markerUrl.length - 4;
      var output = "http://www.streeteatsapp.co" + markerUrl.substr(0, insertPosition) + "_inactive" + markerUrl.substr(insertPosition);
      return output;
    }
    else {
      return "http://www.streeteatsapp.co/assets/markers/bernies_inactive.png";
    }
  }

  function getFutureTruckUrl(markerUrl){
    if (markerUrl != ""){
      var insertPosition = markerUrl.length - 4;
      var output = "http://www.streeteatsapp.co" + markerUrl.substr(0, insertPosition) + "_future" + markerUrl.substr(insertPosition);
      return output;
    }
    else {
      return "http://www.streeteatsapp.co/assets/markers/bernies_future.png";
    }
  }

  $scope.openEvent = function(eventId){
    $scope.events.forEach(function(ev, index){
      if (ev.eventId == eventId){
        $scope.openEventIndex = index;
        $scope.eventmodal.show();
      }
    });
  }

  $scope.openFutureEvent = function(event){
    $scope.iwTruck = null;
    $scope.map.center = {
      latitude: event.latitude,
      longitude: event.longitude
    }
    $timeout(function(){
      $scope.iwEvent = event;
    }, 100);
  }

  $scope.closeEvent = function(){
    $scope.eventmodal.hide();
    $scope.openEventIndex = null;
  }

  $scope.displayDirections = function(session){
    if (session){
      return session.locationDirections != 'undefined';
    }
    else {
      return false;
    }
  }

  $scope.addTrucksToScope = function(trucks){
    trucks.forEach(function(truck){
      if (truck.activeSession.isActiveForOrders && truck.activeSession.isActive){
        truck.options = {
          icon: {
            url: $scope.getImgUrl(truck.markerUrl),
            scaledSize: new google.maps.Size(50, 72)
          },
          zIndex: 1
        }
      }
      else {
        truck.options = {
          icon: {
            url: $scope.getImgNotActiveUrl(truck.markerUrl),
            scaledSize: new google.maps.Size(50, 72)
          },
          zIndex: 1
        }
      }
      truck.iwOpen = function(){
        analyticsService.trackEvent("Marker", "Click", "Active", truck.truckId);
        bringMarkerToFront(truck);
        $scope.iwOpen(truck);
      }
    });
    $scope.trucks = trucks;
  }

  $scope.addEventsToScope = function(events){
    events.forEach(function(ev, index){
      if (ev.trucks.length > 0){
        ev.options = {
          icon: {
            url: $scope.getImgUrl(ev.markerUrl),
            scaledSize: new google.maps.Size(50, 72)
          },
          zIndex: 1
        }
        ev.openMarkerEvent = function(){
          analyticsService.trackEvent("Marker", "Click", "Event", ev.eventId);
          bringMarkerToFront(ev);
          $scope.openEvent(ev.eventId);
        }
      }
      else {
        ev.options = {
          icon: {
            url: $scope.getImgUrl(ev.markerUrl),
            scaledSize: new google.maps.Size(50, 72)
          },
          zIndex: 1
        }
        ev.openMarkerEvent = function(){
          analyticsService.trackEvent("Marker", "Click", "Event", ev.eventId);
          bringMarkerToFront(ev);
          $scope.openFutureEvent(ev);
        }
      }
    });
    $scope.events = events;
  }

  $scope.addFutureTrucksToScope = function(trucks){
    trucks.forEach(function(truck){
      truck.futureSessions.forEach(function(session){
        session.options = {
          icon: {
            url: getFutureTruckUrl(truck.markerUrl),
            scaledSize: new google.maps.Size(50, 72)
          },
          zIndex: 1
        }
        session.iwOpen = function(){
          analyticsService.trackEvent("Marker", "Click", "Future", truck.truckId);
          bringMarkerToFront(session);
          $scope.iwOpenFuture(session, truck);
        }
      });
    });
    $scope.futureTrucks = trucks;
  }

  $scope.todayOrTomorrow = function(date){
    var currentDate = new Date();
    var openTime = new Date(date);
    if (currentDate.getDate() == openTime.getDate() || openTime < currentDate){
      return "TODAY";
    }
    else {
      return "TOMORROW";
    }
  }

  $scope.addFutureEventsToScope = function(events){
    events.forEach(function(ev, index){
      ev.options = {
        icon: {
          url: getFutureTruckUrl(ev.markerUrl),
          scaledSize: new google.maps.Size(50, 72)
        },
        zIndex: 1
      }
      ev.openMarkerEvent = function(){
        analyticsService.trackEvent("Marker", "Click", "Event", ev.eventId);
        bringMarkerToFront(ev);
        $scope.openFutureEvent(ev);
      }
    });
    $scope.futureEvents = events;
  }

  function bringMarkerToFront(marker){
    $scope.trucks.forEach(function(tr){
      tr.options.zIndex = 1;
    });
    $scope.events.forEach(function(ev){
      ev.options.zIndex = 1;
    });
    $scope.futureTrucks.forEach(function(ft){
      ft.futureSessions.forEach(function(fs){
        fs.options.zIndex = 1;
      });
    });
    $scope.futureEvents.forEach(function(fe){
      fe.options.zIndex = 1;
    });
    $scope.eventsNoTrucks.forEach(function(ent){
      ent.options.zIndex = 1;
    });
    marker.options.zIndex = 2;
  }

  poll();

});
