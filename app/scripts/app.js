'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('SENativ',
['ionic', 'ngCordova',
'ui.bootstrap',
'ngAnimate',
'ngCookies',
'ngRoute',
'ngSanitize',
'angularPayments',
'uiGmapgoogle-maps',
'google.places'])
// .constant('apiUrl', 'https://tructrac.herokuapp.com')
// .constant('clientTokenPath', 'https://tructrac.herokuapp.com/clientToken')
// .constant('apiUrl', 'https://tructracstage.herokuapp.com')
// .constant('clientTokenPath', 'https://tructracstage.herokuapp.com/clientToken')
.constant('apiUrl', 'http://localhost:9000')
.constant('clientTokenPath', 'http://localhost:9000/clientToken')
.constant('spreedlyAPIUrl', "https://core.spreedly.com/v1/")
.constant('version', '1.2.3')
.config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider.state('home', {
    url: '/home',
    templateUrl: './views/home.html',
    controller: 'HomeCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: './views/register.html',
    controller: 'RegisterCtrl'
  })
  .state('card', {
    url: '/card',
    templateUrl: './views/card.html',
    controller: 'CardCtrl'
  })
  .state('wallet', {
    url: '/wallet',
    templateUrl: './views/wallet.html',
    controller: 'WalletCtrl'
  })
  .state('account', {
    url: '/account',
    templateUrl: './views/account.html',
    controller: 'AccountCtrl'
  })
  .state('pwresetrequest', {
    url: '/pwresetrequest',
    templateUrl: './views/passwordresetrequest.html',
    controller: 'PwrdResetRequestCtrl'
  })
  .state('pwreset', {
    url: '/pwreset',
    templateUrl: './views/passwordreset.html',
    controller: 'PwrdResetCtrl'
  })
  .state('orders', {
    url: '/orders',
    templateUrl: './views/orders.html',
    controller: 'OrdersCtrl'
  })
  .state('pastorders', {
    url: '/history',
    templateUrl: './views/pastorders.html',
    controller: 'HistoryCtrl'
  })
  .state('menu', {
    url: '/menu/:truckId',
    templateUrl: './views/menu.html',
    controller: 'MenuCtrl'
  })
  .state('updates', {
    url: '/updates',
    templateUrl: './views/updates.html',
    controller: 'UpdatesCtrl'
  });

  $urlRouterProvider.otherwise('/home');

  $httpProvider.interceptors.push('sessionInjector');

})
.run(function($ionicPlatform, $rootScope, $localstorage, sfeAPI, notifications, $location, PushWoosh, deviceManager) {
  //SETTING UP GLOBALS
  $rootScope.mainScroll = false;
  $rootScope.messageQueue = [];
  $rootScope.messageInterval = null;
  $rootScope.updates = [];

  $rootScope.clearMessages = function(){
    notifications.clearMessages();
  }

  $rootScope.getMessageHeight = function(){
    if (ionic.Platform.isIOS()){
      return 64;
    }
    else {
      return 44;
    }
  }

  $rootScope.navTitle = "<img src='img/logo.png' id='logo' class='center' />";

  $rootScope.loggedIn = function(){
    return $rootScope.user != null && $rootScope.jwtToken != null;
  }

  $rootScope.getDeviceType = function(){
    if (ionic.Platform.isIOS()){
      return 'ios';
    }
    else if (ionic.Platform.isAndroid()){
      return 'android';
    }
    else {
      return null;
    }
  }

  //GRAB USER FROM LOCAL STORAGE IF LOGGED IN
    var user = $localstorage.getObject('user');
    var jwtToken = $localstorage.get('jwtToken');
    if (user != null && user.userId != undefined && jwtToken != undefined){
      $rootScope.user = user;
      $rootScope.jwtToken = jwtToken;
      sfeAPI.updateUser();
    }
    else {
      $rootScope.user = null;
      $rootScope.jwtToken = null;
    }
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    // ionic.Platform.fullScreen();
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      // StatusBar.hide();
    }

    if (typeof analytics !== 'undefined'){
     analytics.startTrackerWithId('UA-61105491-1');
     analytics.trackEvent('General', 'Startup', 'Running', true);
    }
    else
    {
      console.log("Google Analytics plugin could not be loaded.");
    }
    PushWoosh.initPushWoosh();
  });
  sfeAPI.getSpreedlyKey();
});
