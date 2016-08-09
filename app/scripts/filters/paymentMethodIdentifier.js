angular.module("SENativ").filter('getPPId', function () {
  // function that's invoked each time Angular runs $digest()
  // pass in `item` which is the single Object we'll manipulate
  return function (item) {
    var ind = item.indexOf('@');
    if (ind == -1){
      return item;
    }
    else{
      return item.substr(0, ind);
    }
  };
});
