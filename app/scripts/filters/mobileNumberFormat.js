angular.module("SENativ").filter('mobNumFormat', function () {
  // function that's invoked each time Angular runs $digest()
  // pass in `item` which is the single Object we'll manipulate
  return function (item) {
      return "0" + item.slice(3);
  };
});
