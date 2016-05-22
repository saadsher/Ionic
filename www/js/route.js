Spasey.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, USER_ROLES) {

  $ionicConfigProvider.tabs.position('top');

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  }).state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  }).state('dev', {
    url: '/dev',
    templateUrl: 'templates/dev-map.html',
    controller: 'DevCtrl',
    data: {
      authorizedRoles: [USER_ROLES.dev]
    }
  }).state('admin', {
    url: '/admin',
    templateUrl: 'templates/admin-map.html',
    controller: 'AdminCtrl',
    data: {
      authorizedRoles: [USER_ROLES.admin]
    }
  }).state('public', {
    url: '/public',
    templateUrl: 'templates/base-map.html',
    controller: 'PublicCtrl',
    data: {
      authorizedRoles: [USER_ROLES.public]
    }
  }).state('concierge', {
    url: '/concierge',
    templateUrl: 'templates/concierge-map.html',
    controller: 'CncrgCtrl',
    data: {
      authorizedRoles: [USER_ROLES.concierge]
    }
  }).state('resident', {
    url: '/resident',
    templateUrl: 'templates/resident-map.html',
    controller: 'ResCtrl',
    data: {
      authorizedRoles: [USER_ROLES.resident]
    }
  }).state('error', {
    url: '/error',
    templateUrl: 'templates/error.html',
    controller: 'ErrCtrl'
  });

  // $urlRouterProvider.otherwise("/login");
  $urlRouterProvider.otherwise(function ($injector, $location) {
   var $state = $injector.get("$state");

   if (!$state.current.name || $state.current.name === "login") {
     $state.go("login");
   } else if ($state.current.name === "register") {
     $state.go("register");
   } else if ($state.current.name === "dev") {
     $state.go("dev");
   } else if ($state.current.name === "admin") {
     $state.go("admin");
   } else if ($state.current.name === "public") {
     $state.go("public");
   } else if ($state.current.name === "concierge") {
     $state.go("concierge");
   } else if ($state.current.name === "resident") {
     $state.go("resident");
   } else {
     $state.go("error");
   }

 });

})

.controller('AppCtrl', function($q, $scope, $state, $ionicSideMenuDelegate, $ionicPopup, $timeout, AuthService, AUTH_EVENTS) {
  console.log('AppCtrl');
  $scope.username = AuthService.username();

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'UNAUTHORISED  ACCESS',
      template: 'You are not allowed to access this resource.',
      okType: 'button-assertive'
    });
  });

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'SESSION LOST',
      template: 'Sorry, Your session has expired, please login again.',
      okType: 'button-dark'
    });
  });

  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };

  $scope.logout = function() {

    var deferred = $q.defer();

    $ionicSideMenuDelegate.toggleLeft();

    $timeout(function() {
      AuthService.logout();
      $state.go('login');
      deferred.resolve();
    }, 300);

    return deferred.promise;
  };

});
