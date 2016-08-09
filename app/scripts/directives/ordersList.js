angular.module('SENativ')
.directive("ordersList", function($parse) {
  return {
    restrict: "E",
    scope: {
      orders: "=",
      cancelOrder: "&cancel",
      textColor: "@"
    },
    templateUrl: 'templates/orderSummary.html',
    controller: function($scope){
      $scope.getOrderBy = function(order){
        return order.orderTime.toString();
      }
      $scope.cancel = function(orderId){
        $scope.cancelOrder()(orderId );
      }
    }
  }
});
