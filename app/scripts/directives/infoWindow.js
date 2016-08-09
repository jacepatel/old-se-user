angular.module('SENativ')
.directive("infoWindow", function($parse, $location) {
  return {
    restrict: "E",
    scope: {
      iwTruck: "=",
      iwClose: "&",
      goToMenu: "&"
    },
    templateUrl: 'templates/infowindow.html',
    controller: function($scope, $location){
      $scope.goToMenu = function(truck){
        if (truck.activeSession.isUsed){
            var path = '/menu/' + truck.truckId;
            $location.path(path);
        }
      }
    },
    link: function(scope){
      scope.displayDirections = function(){
        if (scope.iwTruck.activeSession.locationDirections == "undefined"){
          return false;
        }
        else if (scope.iwTruck.activeSession.locationDirections == ""){
          return false;
        }
        else {
          return true;
        }
      }
    }
  }
});
