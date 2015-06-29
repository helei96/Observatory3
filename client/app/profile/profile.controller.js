'use strict';

angular.module('observatory3App')
.controller('ProfileCtrl', function ($scope, $stateParams, $http, Auth, $location) {
    function updateUser(){
        var loggedInUser = Auth.getCurrentUser();
        if (Auth.isLoggedIn() && loggedInUser.github.login == $stateParams.userUrl){
            $http.get('/api/users/me').success(function(user){
                $http.get('/api/commits/user/' + user.github.login).success(function(commits){
                    $scope.user.commits = commits;
                });
                $http.get('/api/projects/author/' + user._id).success(function(projects){
                    $scope.user.projects = projects;
                });

                $scope.isuser = loggedInUser._id == user._id;
                $scope.user = user;

            })
            .error(function(data, status, headers, config){
                // Redirect bad user names
                if(status === 404 && data === "User not found"){
                    $location.path('/users');
                }
                if(status === 500){
                    $location.path('/users');
                }
            });
        }
        else{
            $http.get('/api/users/profile/' + $stateParams.userUrl).success(function(user){
                $http.get('/api/commits/user/' + user.github.login).success(function(commits){
                    $scope.user.commits = commits;
                });
                $http.get('/api/projects/author/' + user._id).success(function(projects){
                    $scope.user.projects = projects;
                });

                $scope.isuser = false;

                $scope.user = user;

            })
            .error(function(data, status, headers, config){
                // Redirect bad user names
                if(status === 404 && data === "User not found"){
                    $location.path('/users');
                }
                if(status === 500){
                    $location.path('/users');
                }
            });
        }

    }

    $scope.edittingBio = false;

    $scope.editBio = function(){
        $scope.edittingBio = !$scope.edittingBio;
    };

    $scope.saveBio = function(){
        $scope.edittingBio = false;
        $http.put("/api/users/" + $scope.user._id + "/bio", {
            "bio": $scope.user.bio
        }).success(function(){
            alert("Bio updated!");
            $http.get('/api/users/profile/' + $scope.user._id).success(function(user){
                $scope.user.bio = user.bio;
            });
        }).error(function(err){
            alert("Could not update bio!");
        });
    };

    $scope.addTech = function(){
        if($scope.insertTechContent){
            $http.put("/api/users/" + $scope.user._id + "/addTech", {
                "tech": $scope.insertTechContent
            }).success(function(){
                $scope.user.tech.push($scope.insertTechContent);
                $scope.insertTechContent = "";
            }).error(function(){
                alert("Could not add tech!");
            });
        }
    };

    $scope.removeTech = function(tech){
        $http.put("/api/users/" + $scope.user._id + "/removeTech", {
            "tech": tech
        }).success(function(){
            $scope.user.tech.splice($scope.user.tech.indexOf(tech),1);
        }).error(function(){
            alert("Could not remove tech!");
        });
    };

    $scope.markAttendance = function(code){
        $http.put("/api/users/" +  $scope.user._id + "/attendance", {
            "code": code
        }).success(function(res){
            if (!res.success){
                alert("Could not add attendance");
            } else{
              alert("Added attendance!");
              updateUser();
            }
        }).error(function(data){
            alert("Invalid Attendance Code!");
        });
    };

    $scope.currentPage = 0;
    $scope.pageSize = 5;

    $scope.numberOfPages=function(){
        if ($scope.user && $scope.user.commits && $scope.pageSize){
            return Math.ceil($scope.user.commits.length/$scope.pageSize);

        }
        return 1;
    }

    $scope.increment = function(){
        if ($scope.currentPage < $scope.numberOfPages()-1){
            $scope.currentPage += 1;
        }
    }

    $scope.decrement = function(){
        if ($scope.currentPage > 0){
            $scope.currentPage -= 1;
        }
    }

    updateUser();
})
.directive("bio", function(){

    return {
        restrict:'E',
        template: "<div ng-show='!edittingBio' style='white-space:pre;'>{{user.bio}}</div> \
        <textarea ng-show='edittingBio' ng-model='user.bio' ></textarea>"
    }
});