'use strict';

angular.module('SENativ').factory('deviceManager', function($rootScope, $localstorage) {
  	function setCurrentDevice(deviceToken){
      var device = {
        deviceToken: deviceToken,
        deviceType: $rootScope.getDeviceType()
      }
      $localstorage.setObject('device', device);
  	}

  	function getCurrentDevice(){
			return $localstorage.getObject('device');
  	}

    function getDeviceId(){
      return $localstorage.get("deviceId");
    }

    function isDeviceRegistered(){
      var deviceId = getDeviceId();
      return (deviceId != null);
    }

  	return {
  		setCurrentDevice: setCurrentDevice,
      getCurrentDevice: getCurrentDevice,
      getDeviceId: getDeviceId,
      isDeviceRegistered: isDeviceRegistered
  	}
});
