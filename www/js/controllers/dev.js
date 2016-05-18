Spasey.controller('DevCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, $timeout, GoogleMaps) {

  ionic.Platform.ready(function() {

    // console.warn("Developer CTRL");

    // $scope.toggleLeft = function() {
    //   $ionicSideMenuDelegate.toggleLeft();
    // };

    GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

    $ionicModal.fromTemplateUrl('templates/new.html', {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function(modal) {
      $scope.modalC = modal;
    });

    $ionicModal.fromTemplateUrl('templates/admin-list.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalR = modal;
    });

    $ionicModal.fromTemplateUrl('templates/edit.html', {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function(modal) {
      $scope.modalUD = modal;
    });

    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function(modal) {
      $scope.modalProfile = modal;
    });

    $ionicModal.fromTemplateUrl('templates/settings.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function(modal) {
      $scope.modalSettings = modal;
    });

    $ionicModal.fromTemplateUrl('templates/feedback.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function(modal) {
      $scope.modalFeedback = modal;
    });

    $ionicModal.fromTemplateUrl('templates/messages.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalMessages = modal;
    });

    $ionicModal.fromTemplateUrl('templates/inbox.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalInbox = modal;
    });

    $ionicModal.fromTemplateUrl('templates/postbox.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalPostbox = modal;
    });

    $ionicModal.fromTemplateUrl('templates/postal.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalPostal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/valet.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalValet = modal;
    });

    $ionicModal.fromTemplateUrl('templates/history.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function(modal) {
      $scope.modalHistory = modal;
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

    $scope.listItem = function() { // TODO
      // Click on list item that shows more info about marker
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
      $scope.modalR.hide().then(function() {
        $scope.modalUD.show();
      });
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
      $ionicListDelegate.closeOptionButtons();

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

    // NAV
    $scope.goProfile = function() {
      $scope.modalProfile.show();
    }
    $scope.goSettings = function() {
      $scope.modalSettings.show();
    }
    $scope.goFeedback = function() {
      $scope.modalFeedback.show();
    }
    $scope.goPostbox = function() {
      $scope.modalPostbox.show();
    }
    $scope.goInbox = function() {
      $scope.modalInbox.show();
    }
    $scope.goMessages = function() {
      $scope.modalMessages.show();
    }
    $scope.goPostal = function() {
      $scope.modalPostal.show();
    }
    $scope.goValet = function() {
      $scope.modalValet.show();
    }

  });
});















// -----------------------------------------------------------------------------
// NOTE
// -----------------------------------------------------------------------------

// INFO

// User: Counters, Leftside
// Admin: CRUD, Toggle views, Leftside
// Concierge: Counters, Leftside, Rightside
// Resident: Counters, Leftside, Rightside
// Dev: *

// -----------------------------------------------------------------------------
// IMPROVE

// $cordovaGeolocation.getCurrentPosition() not working in ionic lab
// Routing of paths
// Add error popups
// login loader
// Complete form validations
// GET call single marker for edits

// -----------------------------------------------------------------------------
// BACKEND

// Complete tests with real endpoint

// -----------------------------------------------------------------------------
// TODO

// Complete basic registration
// Add social login providers
// Add Push notification
// Add Restrictions information on list item click / tap

// -----------------------------------------------------------------------------
// IN PROGRESS

// Profile    <-- Base
// Settings   <-- Base
// Feedback   <-- Base
// History    <-- Resident / Concierge
// Valet park <-- Resident
// Valet out  <-- Resident
// Postbox    <-- Resident
// Messages   <-- Resident / Concierge
// Livetask   <-- Concierge
// Postal     <-- Concierge
// Search     <-- Concierge
// -----------------------------------------------------------------------------
