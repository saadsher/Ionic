Spasey.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
 $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
   if ('data' in next && 'authorizedRoles' in next.data) {
     var authorizedRoles = next.data.authorizedRoles;
     if (!AuthService.isAuthorized(authorizedRoles)) {
       event.preventDefault();
       $state.go($state.current, {}, {reload: true});
       $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
     }
   }

   if (!AuthService.isAuthenticated()) {
     if (next.name === 'error') {
       event.preventDefault();
       $state.go('login');
     }
   }
 });
})

.service('AuthService', function($q, $http, USER_ROLES) {
  var CURRENT_USER = {};
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;

  function loadUserCredentials() {
    var user = window.localStorage.getItem(CURRENT_USER);
    if (user) {
      useCredentials(user);
    }
  }

  function storeUserCredentials(user) {
    window.localStorage.setItem(CURRENT_USER, user);
    useCredentials(user);
  }

  function useCredentials(user) {
    isAuthenticated = true;
    role = USER_ROLES[user.role];

    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = user.token;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(CURRENT_USER);
  }

  var login = function(user) {
    storeUserCredentials(user);
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;}
  };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, ngFB) {
  console.log('LoginCtrl');
  $scope.data = {};
  var user = {};

  $scope.fbLogin = function() {
    ngFB.login({scope: 'email,publish_actions'}).then(
      function (response) {
        if (response.status === 'connected') {
          user.role = 'dev',
          user.token = response.authResponse.accessToken;
          AuthService.login(user);
          $state.go('dev', {}, {reload: true});
        } else {
          var alertPopup = $ionicPopup.alert({
            title: 'LOGIN FAILED',
            template: 'Please check your credentials',
            okType: 'button-assertive'
          });
        }
      }
    );
  };
})

.controller('RegisterCtrl', function($scope, $state, $ionicPopup) {
  $scope.data = {};

  $scope.register = function(data) {
    console.log(data)
  };
});
