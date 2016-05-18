Spasey.controller('ProfileCtrl', function($scope, $timeout) {
  // console.warn("PROFILE");

  $scope.editActive = false;

  var initGet = {
    username: "dev@spasey.com",
    password: "zaxscdvf"
  }

  $scope.profile = {
    username: "dev@spasey.com",
    password: "zaxscdvf"
  }

  $scope.unchanged = function() {
    if ($scope.profile.username === initGet.username && $scope.profile.password === initGet.password) {
      return true
    } else {
      return false
    }
  }

  // reset
  $scope.$on('modal.hidden', function() {
    $timeout(function() {
      $scope.editActive = false;
      $scope.profile = {
        username: "dev@spasey.com",
        password: "zaxscdvf"
      }
      $scope.click = false;
      $scope.button = false;
    }, 300);
  });

  $scope.update = function(profile) {
    console.log(profile)
  }

});
