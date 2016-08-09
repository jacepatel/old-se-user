angular.module('SENativ')
.directive("infoWindowFuture", function($parse) {
  return {
    restrict: "E",
    scope: {
      iwTruck: "=",
      iwSession: "=",
      iwClose: "&"
    },
    templateUrl: 'templates/infowindowfuture.html',
    link: function(scope){
      scope.displayDirections = function(){
        if (scope.iwSession.locationDirections == "undefined"){
          return false;
        }
        else if (scope.iwSession.locationDirections == ""){
          return false;
        }
        else {
          return true;
        }
      }

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
