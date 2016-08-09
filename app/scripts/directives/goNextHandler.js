angular.module('SENativ')
.directive("goNextHandler", function() {
  return {
    restrict: "A",
    scope: {
      submitFunction: "&submit"
    },
    link: function(scope, elem, attrs) {
      var $form = $(elem);
      $(elem).find('input').each(function(){
        $(this).keypress(function(ev){
          if (ev.keyCode == 13){
            var $inputs = $form.find('input');
            var indexOfElem = $inputs.index(elem);
            if ($inputs.length > (indexOfElem + 1)){
              $inputs[indexOfElem + 1].focus();
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
