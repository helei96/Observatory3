'use strict';

angular.module('observatory3App')
  .controller('AttendCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    $scope.submitDayCode = function(){
      var user = Auth.getCurrentUser();
      $http.put('/api/users/' + user._id + '/attend', {
        dayCode: $scope.userDayCode
      }).success(function(info){
        if (info.unverified){
          $scope.unverified = true;
        }else{
          notify("Day code submitted successfully!");
        }
      }).error(function(err){
        notify({ message: "Error: " + err, classes: ["alert-danger"] });
      });
    };
  });
