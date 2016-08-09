angular.module('SENativ')
.directive("infoWindowEvent", function($parse) {
  return {
    restrict: "E",
    scope: {
      iwEvent: "=",
      iwClose: "&"
    },
    templateUrl: 'templates/infowindowevent.html',
    link: function(scope){
      scope.todayOrTomorrow = function(date){
        var currentDate = new Date();
        var openTime = new Date(date);
        if (currentDate.getDate() == openTime.getDate()){
          return "TODAY";
        }
        else {
          return "TOMORROW";
        }
      }
    }
  }
});
