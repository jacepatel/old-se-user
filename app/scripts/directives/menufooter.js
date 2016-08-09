angular.module('SENativ')
.directive("menuFooter", function($rootScope) {
  return {
    restrict: "E",
    scope: {
      currentItems: "=items",
      orderTotal: "=total",
      footerHeight: "@height",
      activeForOrders: "@active",
      openConfirm: "&confirm",
      isCustom: "&custom",
      minimum: "@minimum",
      queuefull: "&queuefull"
    },
    link: function(scope, element, attrs) {
        function showCreateAccount(){
          return (!$rootScope.loggedIn());
        }

        function showCurrentOrder(){
          return (!showCreateAccount() && $rootScope.user.paymentMethods.length > 0 && scope.activeForOrders);
        }

        function showAddPaymentMethod(){
          return (!showCreateAccount() && $rootScope.user.paymentMethods.length < 1  && scope.activeForOrders);
        }

        function showNotOpen(){
          return scope.activeForOrders == "false";
        }

        function overQueueMax(){
          return (scope.queuefull());
        }

        scope.overMinimumOrder = function(){
          if (scope.orderTotal >= parseFloat(scope.minimum)){
            return true;
          }
          else {
            return false;
          }
        }

        scope.buttonText = function(){
          if (!scope.overMinimumOrder()){
            return "Minimum Order: $" + scope.minimum;
          }
          else {
            return "Place Order";
          }
        }

        scope.showWhich = function(){
          if (showNotOpen()){
            return 'notopen';
          }
          else if (showCreateAccount()){
            return 'createaccount';
          }
          else if (showAddPaymentMethod()){
            return 'addpaymethod';
          }
          else if (overQueueMax()){
            return 'queuefull';
          }
          else if (showCurrentOrder()){
            return 'currentorder';
          }
        }

        scope.openEditItem = function(index){
          scope.$parent.removeFromCart(index);
        }

        scope.isCustom = function(item){
          var custom = false;
          item.itemOptions.forEach(function(itemOption){
            if (itemOption.type == 'Boolean' && itemOption.added){
              custom = true;
              return;
            }
            else if (itemOption.type == 'Select' && itemOption.selectedId != null){
              custom = true;
              return;
            }
          });
          return custom;
        }
    },
    templateUrl: 'templates/menufooter.html'
  }
});
