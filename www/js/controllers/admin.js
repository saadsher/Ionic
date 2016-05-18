Spasey.controller('AdminCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, GoogleMaps) {

  console.warn("Admin");

  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

  $ionicModal.fromTemplateUrl('templates/new.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.modalC = modal;
    GoogleMaps.newMarker();
  });

  $ionicModal.fromTemplateUrl('templates/admin-list.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalR = modal;
  });

  $ionicModal.fromTemplateUrl('templates/edit.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalUD = modal;
  });

  $scope.empty = true;

  $scope.clickMap = function() {
    GoogleMaps.clickMap();
    if (GoogleMaps.editOnce()) {
      $scope.empty = false;
    }
  }

  $scope.clickNewHide = function() {
    GoogleMaps.clickNewClose();
  }
  $scope.clickEditHide = function() {
    GoogleMaps.clickEditClose();
  }
  $scope.clickCounterHide = function() {
    GoogleMaps.clickCounterClose();
  }

  $scope.setCenter = function() {
    GoogleMaps.setCenter();
  }

  $scope.listMarkers = function() {
    GoogleMaps.listMarkers();
  }

  $scope.addMarker = function(add) {
    GoogleMaps.newMarker(add).then(function() {
      var alertAdd = $ionicPopup.alert({
        title: 'Thank you',
        template: 'Marker added',
        okType: 'button-dark'
      });

      alertAdd.then(function(res) {
        if(res) {
          GoogleMaps.clickNewClose();
          $scope.modalC.hide();
          GoogleMaps.newMarker();
        }
      });
    });
  }

  $scope.editMarker = function(edit) {
    // console.log(edit);
    $scope.empty = false;
    GoogleMaps.editMarker(edit);
    $ionicListDelegate.closeOptionButtons();
    $scope.modalUD.show();
    $scope.modalR.hide();
  }

  $scope.updateMarker = function(update) {
    $scope.empty = true;
    GoogleMaps.updateMarker(update).then(function() {
      var alertUpdate = $ionicPopup.alert({
        title: 'Thank you',
        template: 'Marker updated',
        okType: 'button-dark'
      });

      alertUpdate.then(function(res) {
        if(res) {
          GoogleMaps.clickEditClose();
          $scope.modalUD.hide();
          GoogleMaps.editMarker();
        }
      });
    })
  }

  $scope.deleteMarker = function(del) {
    var alertDelete = $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Are you sure you want to delete this marker?',
      okText: 'Delete',
      okType: 'button-assertive'
    });

    alertDelete.then(function(res) {
      if(res) {
        GoogleMaps.deleteMarker(del).then(function() {
          var alertDeleted = $ionicPopup.alert({
            title: 'Thank you',
            template: 'Marker deleted',
            okType: 'button-dark'
          });

          alertDeleted.then(function(res) {
            if(res) {
              GoogleMaps.clickEditClose();
              $ionicListDelegate.closeOptionButtons();
              $scope.modalR.hide();
            }
          });
        });
      }
    });
  }

  $scope.updateCounter = function(update) {
    $scope.empty = true;
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

  $scope.setAdmin = function(option) {
    GoogleMaps.clickNewClose();
    GoogleMaps.clickEditClose();
    GoogleMaps.clickCounterClose();

    if (option == true) {
      GoogleMaps.setAdmin(option);
    } else {
      GoogleMaps.setAdmin();
    }
  };

  var toggle = false;
  $scope.basic = true;
  $scope.toggleAdmin = function(option) {
    if(toggle) {
      toggle = false;
      $scope.basic = true;
      angular.element(document.querySelector('.btn-list')).addClass('basic');
      return $scope.setAdmin();
    }
    $scope.setAdmin(option);
    toggle = true;
    angular.element(document.querySelector('.btn-list')).removeClass('basic');
    $scope.basic = false;
  };
});
