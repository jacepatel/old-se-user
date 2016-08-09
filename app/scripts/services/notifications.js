angular.module('SENativ').factory('notifications', function($http, $location, $rootScope, $cookieStore, $timeout, $cordovaToast) {
  function addMessage(msg, type){
  //   var newmsg = {
  //     text: msg,
  //     type: type
  //   }
  //   $rootScope.messageQueue.push(newmsg);
  //   // $timeout.cancel($rootScope.messageInterval);
  //   removeMessage();
    if (window.cordova){
      $cordovaToast.show(msg, 'long', 'bottom');
    }
  }

  function clearMessages(){
    // $rootScope.messageQueue = [];
    // $rootScope.messageInterval = null;
  }

  function removeMessage() {
    $rootScope.messageInterval =
    $timeout(function() {
      if ($rootScope.messageQueue.length > 0){
        $rootScope.messageQueue.shift();
        if ($rootScope.messageQueue.length > 0){
          removeMessage();
        }
      }
    }, 10000);
  };

  return {
    addMessage: addMessage,
    removeMessage: removeMessage,
    clearMessages: clearMessages
  }
});
