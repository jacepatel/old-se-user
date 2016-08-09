angular.module('SENativ').factory('PushWoosh', ['$window', '$rootScope', 'deviceManager', '$location', function($window, $rootScope, deviceManager, $location) {

  function initPushWoosh(){
    if (window.cordova){
      var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
      var currentDevice = deviceManager.getCurrentDevice();
      if (!currentDevice){
        var deviceType = $rootScope.getDeviceType();
        if (deviceType == 'android'){
          initAndroid();
        }
        else if (deviceType == 'ios'){
          initApple();
        }
      }
      else {
        document.addEventListener('push-notification', function(event) {
          var title = event.notification.title;
          var userData = event.notification.userdata;
          handlePushNotification(notification);
        });
      }
    }
  }

  function resetBadge(){
    if (window.cordova){
      var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
      pushNotification.setApplicationIconBadgeNumber(0);
    }
  }

  function initAndroid(){
    if (window.cordova){
      var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");

      //set push notifications handler
      document.addEventListener('push-notification', function(event) {
        var title = event.notification.title;
        var userData = event.notification.userdata;
        handlePushNotification(notification);
      });

      //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_NUMBER", pw_appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
      pushNotification.onDeviceReady({ projectid: "699766287372", pw_appid : "0D74B-00E31" });

      var setDevice = deviceManager.setCurrentDevice;
      //register for pushes
      pushNotification.registerDevice(
        function(status) {
          var pushToken = status;
          setDevice(pushToken);
          console.warn('push token: ' + pushToken);
        },
        function(status) {
          console.warn(JSON.stringify(['failed to register ', status]));
        }
      );
    }
  }

  function initApple() {
    if (window.cordova){
      var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");

      //set push notification callback before we initialize the plugin
      document.addEventListener('push-notification', function(event) {
        //get the notification payload
        var notification = event.notification;
        handlePushNotification(notification);

        //clear the app badge
        pushNotification.setApplicationIconBadgeNumber(0);
      });

      //initialize the plugin
      pushNotification.onDeviceReady({pw_appid:"0D74B-00E31"});
      var setDevice = deviceManager.setCurrentDevice;
      //register for pushes
      pushNotification.registerDevice(
        function(status) {
          var deviceToken = status['deviceToken'];
          setDevice(deviceToken);
          console.warn('registerDevice: ' + deviceToken);
        },
        function(status) {
          console.warn('failed to register : ' + JSON.stringify(status));
        }
      );

      //reset badges on app start
      pushNotification.setApplicationIconBadgeNumber(0);
    }
  }

  function handlePushNotification(notification){
    $location.path('/orders');
  }

  return {
    initPushWoosh: initPushWoosh,
    resetBadge: resetBadge
  }
}]);
