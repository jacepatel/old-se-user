angular.module('SENativ')
.directive("ionContentForm", function($timeout) {
  return {
    restrict: "A",
    scope: {
      parentobj: "@",
      submitFunction: "&submit"
    },
    link: function(scope, elem, attrs) {
      var parentFormObjectName = attrs.name;
      scope.$watchCollection(function(){
        return scope.$parent.$eval(attrs.name);
      },
      function(newVal, oldVal){
        var sc = $('ion-view').scope();
        sc[attrs.parentobj] = newVal;
      });

      var $form = $(elem);
      $(elem).find('input').each(function( index ) {
        $(this).keypress(function(ev){
          if (ev.keyCode == 13){
            var nextInput = $(this).parent().next().find('input')[0];
            if (nextInput != null){
                nextInput.focus();
            }
            else {
              scope.submitFunction();
            }
          }
        });
      });
    }
  }
});
