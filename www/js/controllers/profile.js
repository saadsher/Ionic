Spasey.controller('ProfileCtrl', function($scope, $timeout) {

  $scope.editActive = false;

  var initGet = {
    username: "dev@spasey.com",
    password: "zaxscdvf",
    apartment: "A1234",
    vehicle: "none"
  }

  $scope.profile = {
    username: "dev@spasey.com",
    password: "zaxscdvf",
    apartment: "A1234",
    vehicle: "none"
  }

  $scope.unchanged = function() {
    if ($scope.profile.username === initGet.username && $scope.profile.password === initGet.password && $scope.profile.vehicle === initGet.vehicle && $scope.profile.apartment === initGet.apartment) {
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
        password: "zaxscdvf",
        apartment: "A1234",
        vehicle: "none"
      }
      $scope.click = false;
      $scope.button = false;
    }, 300);
  });

  $scope.update = function(profile) {
    console.log(profile)
  }

});
