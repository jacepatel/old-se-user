angular.module('SENativ')
.controller('RegisterCtrl', function($scope, $ionicSlideBoxDelegate, $rootScope, $location, notifications, sfeAPI, analyticsService, $ionicModal){
  analyticsService.trackPage('Register');
  if ($rootScope.loggedIn()){
    $location.path('/home');
  }
  $scope.emailValidator = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
  $scope.mobValidator = /[0][4]([0-9]){8}/;

  $scope.agreeToTos = false;
  $scope.registerForm = null;

  $scope.accountDetails = {
      firstName: "",
      lastName: "",
      email: "",
      mobNum: "",
      password: "",
      locality: ""
  }

  $scope.formInvalid = function(){
    return !(
      $scope.registerForm &&
      $scope.registerForm.email.$valid &&
      $scope.registerForm.mobNum.$valid &&
      $scope.registerForm.password.$valid &&
      $scope.accountDetails.email.length > 0 &&
      $scope.accountDetails.password.length > 0 &&
      $scope.accountDetails.mobNum.length > 0 &&
      $scope.accountDetails.firstName.length > 2 &&
      $scope.accountDetails.lastName.length > 2 &&
      $scope.agreeToTos == true);
  }

  $scope.toggleTos = function(){
    $scope.agreeToTos = !$scope.agreeToTos;
  }

  $scope.backBtnAction = function(){
      analyticsService.trackEvent("Registration", "Leave", "Completed Registration", 0);
      $location.path('/home');
  }

  $scope.nextBtnAction = function(){
    if (!$scope.formInvalid()){
      $scope.createAccount();
    }
  }

  $scope.checkEmail = function(email){
    notifications.clearMessages();
    if(!$scope.emailValidator.test(email) || email.length < 1){
      notifications.addMessage("Please include a valid email address.", 'alert-danger');
    }
  }

  $scope.checkMob = function(mob){
    notifications.clearMessages();
    if (!$scope.mobValidator.test(mob) || mob.length < 1){
      notifications.addMessage("Please include a valid mobile number starting with '04'.",  'alert-danger');
    }
  }

  $scope.checkPass = function(pass){
    notifications.clearMessages();
    if (!pass || pass.length < 6){
      notifications.addMessage("Please include a valid password of 6 or more characters.",  'alert-danger');
    }
  }

  $scope.checkName = function(name){
    notifications.clearMessages();
    if (!name || name.length < 2){
      notifications.addMessage("Please include valid first and last names.",  'alert-danger');
    }
  }

  $scope.createAccount = function(){
      var accountParams = JSON.stringify({
        "firstName": $scope.accountDetails.firstName,
        "lastName": $scope.accountDetails.lastName,
        "email": $scope.accountDetails.email.toLowerCase(),
        "password": $scope.accountDetails.password,
        "mobileNumber": "+61" + $scope.accountDetails.mobNum.slice(1)
      });

        sfeAPI.register(accountParams, $scope);
  }

  $scope.openTos = function(){
    $ionicModal.fromTemplateUrl('templates/tosmodal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      if ($scope.tosmodal == null){
        $scope.tosmodal = modal;
        modal.show();
      }
    });
  }

  $scope.closeTos = function(){
    $scope.tosmodal.remove();
    $scope.tosmodal = null;
  }

  $scope.openPP = function(){
    $ionicModal.fromTemplateUrl('templates/ppmodal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      if ($scope.tosmodal == null){
        $scope.ppmodal = modal;
        modal.show();
      }
    });
  }

  $scope.closePP = function(){
    $scope.ppmodal.remove();
    $scope.ppmodal = null;
  }
});
