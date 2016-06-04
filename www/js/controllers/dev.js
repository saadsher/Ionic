Spasey.controller('DevCtrl', function(
  $scope,
  $rootScope, //
  $state,
  $ionicSideMenuDelegate,
  $ionicModal,
  $ionicContentBanner,
  $ionicPopup,
  $ionicListDelegate,
  $ionicUser, //
  $ionicPush, //
  $timeout,
  GoogleMaps,
  SyncService){

  var contentBannerInstance;

  $scope.resident = {};
  $scope.concierge = {};

  $scope.$on('sync', function(event, syncData) {
    $scope.resident.newMessagesCount = syncData.resident.newMessagesCount;
    $scope.concierge.newMessagesCount = syncData.concierge.newMessagesCount;
  });

  ionic.Platform.ready(function() {

    // console.warn("Developer CTRL");

    SyncService.run();

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

    $ionicModal.fromTemplateUrl('templates/concierge_messages.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $scope.modalConciergeMessages = modal;
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


    /* PUSH */

      $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        alert("Successfully registered token " + data.token);
        console.log('Ionic Push: Got token ', data.token, data.platform);
        $scope.token = data.token;
      });

      $scope.identifyUser = function() {
      	var user = $ionicUser.get();
      	if(!user.user_id) {
      		// Set your user_id here, or generate a random one.
      		user.user_id = $ionicUser.generateGUID();
      	};

      	// Metadata
      	angular.extend(user, {
      		name: 'Simon',
      		bio: 'Author of Devdactic'
      	});

        $scope.identified = true;

      	// Identify your user with the Ionic User Service
      	$ionicUser.identify(user).then(function(){
      		$scope.identified = true;
      		console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
      	});
      };

      // Registers a device for push notifications
      $scope.pushRegister = function() {
       console.log('Ionic Push: Registering user');

       // Register with the Ionic Push service.  All parameters are optional.
       $ionicPush.register({
         canShowAlert: true, //Can pushes show an alert on your screen?
         canSetBadge: true, //Can pushes update app icon badges?
         canPlaySound: true, //Can notifications play a sound?
         canRunActionsOnWake: true, //Can run actions outside the app,
         onNotification: function(notification) {
           // Handle new push notifications here
           return true;
         }
       });
      };

    /* END PUSH */

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

      GoogleMaps.clickNewClose();
      $scope.modalC.hide();
      GoogleMaps.newMarker();

      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }

      contentBannerInstance = $ionicContentBanner.show({
        text: ["CREATING"],
        icon: null
      });

      GoogleMaps.newMarker(add).then(function() {

        if (contentBannerInstance) {
          contentBannerInstance();
          contentBannerInstance = null;
        }

        contentBannerInstance = $ionicContentBanner.show({
          text: ["MARKER CREATED"],
          autoClose: 7000
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

      GoogleMaps.clickEditClose();
      $scope.modalUD.hide();
      GoogleMaps.editMarker();

      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }

      contentBannerInstance = $ionicContentBanner.show({
        text: ["UPDATING"],
        icon: null
      });

      GoogleMaps.updateMarker(update).then(function() {

        if (contentBannerInstance) {
          contentBannerInstance();
          contentBannerInstance = null;
        }

        contentBannerInstance = $ionicContentBanner.show({
          text: ["MARKER UPDATED"],
          icon: null
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

          GoogleMaps.clickEditClose();
          $ionicListDelegate.closeOptionButtons();
          $scope.modalR.hide();

          if (contentBannerInstance) {
            contentBannerInstance();
            contentBannerInstance = null;
          }

          contentBannerInstance = $ionicContentBanner.show({
            text: ["DELETING"],
            icon: null
          });

          GoogleMaps.deleteMarker(del).then(function() {

            if (contentBannerInstance) {
              contentBannerInstance();
              contentBannerInstance = null;
            }

            contentBannerInstance = $ionicContentBanner.show({
              text: ["MARKER DELETED"],
              autoClose: 7000
            });
          });
        }
      });
    }

    $scope.updateCounter = function(update) {

      $scope.empty = true;
      GoogleMaps.clickCounterClose();

      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }

      contentBannerInstance = $ionicContentBanner.show({
        text: ["MODIFYING"],
        icon: null
      });

      GoogleMaps.updateCounter(update).then(function() {

        if (contentBannerInstance) {
          contentBannerInstance();
          contentBannerInstance = null;
        }

        contentBannerInstance = $ionicContentBanner.show({
          text: ["COUNTER MODIFIED"],
          autoClose: 7000
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

        if (contentBannerInstance) {
          contentBannerInstance();
          contentBannerInstance = null;
        }

        contentBannerInstance = $ionicContentBanner.show({
          text: ["BASIC MODE"],
          autoClose: 7000
        });

        return $scope.setAdmin();
      }
      $scope.setAdmin(option);
      toggle = true;
      angular.element(document.querySelector('.btn-list')).removeClass('basic');

      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }

      contentBannerInstance = $ionicContentBanner.show({
        text: ["ADMIN MODE"],
        autoClose: 7000
      });

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
      $scope.$broadcast('conciergeConversationsUpdate');
      $scope.modalInbox.show();
    }
    $scope.goMessages = function() {
      $scope.$broadcast('messagesUpdate');
      $scope.modalMessages.show();
    }
    $scope.goConciergeMessages = function(user_id) {
      $scope.$broadcast('conciergeMessagesUpdate', { user_id: user_id });
      $scope.concierge.inboxUserId = user_id;
      $scope.modalConciergeMessages.show();
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
// Providence: Counters, Leftside, Rightside[Providence]
// Concierge: Counters, Leftside, Rightside[Concierge]
// Resident: Counters, Leftside, Rightside[Residential]
// Dev: *

// -----------------------------------------------------------------------------
// TODO

// $cordovaGeolocation.getCurrentPosition() not working in ionic lab
// Routing of paths
// Add error popups
// login loader
// GET call single marker for edits
// Show Edit / Delete / Add notifications
