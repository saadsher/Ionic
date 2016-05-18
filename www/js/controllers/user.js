Spasey.controller('UserCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, GoogleMaps) {

  console.warn("User");

  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

  $ionicModal.fromTemplateUrl('templates/base-list.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalR = modal;
  });

  $scope.clickCounterHide = function() {
    GoogleMaps.clickCounterClose();
  }

  $scope.setCenter = function() {
    GoogleMaps.setCenter();
  }

  $scope.listMarkers = function() {
    GoogleMaps.listMarkers();
  }

  $scope.clickMap = function() {
    GoogleMaps.clickMap();
  }

  $scope.updateCounter = function(update) {
    GoogleMaps.updateCounter(update).then(function() {
      var confirmPopup = $ionicPopup.alert({
        title: 'Thank you',
        template: 'Counter updated',
        okType: 'button-dark'
      });

      confirmPopup.then(function(res) {
        if(res) {
          GoogleMaps.clickCounterClose();
        }
      });
    });
  }

  $scope.counterUp = function(num) {
    GoogleMaps.clickCounterUp(num);
  };
  $scope.counterDown = function(num) {
    GoogleMaps.clickCounterDown(num);
  };
});
