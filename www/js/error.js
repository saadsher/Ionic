Spasey.controller('ErrCtrl', function($scope, $ionicHistory) {
  console.warn("WTF");
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
});
