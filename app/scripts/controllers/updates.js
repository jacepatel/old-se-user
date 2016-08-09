'use strict';

angular.module('SENativ')
.controller('UpdatesCtrl', function($scope, $rootScope, analyticsService) {
  analyticsService.trackPage('Updates Page');
  $scope.returnStoreType = function(){
    var deviceType = $rootScope.getDeviceType();
    if (deviceType == 'android'){
      return 'Play Store';
    }
    else if (deviceType == 'ios'){
      return 'App Store';
    }
  }
  $scope.appStoreLink = function(){
    var deviceType = $rootScope.getDeviceType();
    if (deviceType == 'android'){
      return 'https://play.google.com/store/apps/details?id=com.streeteatsapp.streeteats';
    }
    else if (deviceType == 'ios'){
      return 'https://itunes.apple.com/app/id975044491';
    }
  }
});
