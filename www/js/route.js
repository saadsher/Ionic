Spasey.config(function($stateProvider, $ionicConfigProvider, authProvider, $httpProvider, jwtInterceptorProvider, $urlRouterProvider) {

  $urlRouterProvider.when('', '/dev');

  $ionicConfigProvider.tabs.position('top');

  $stateProvider

  .state('login', { 
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
  })

  .state('dev', {
    url: '/dev',
    templateUrl: 'templates/dev-map.html',
    controller: 'DevCtrl',
    data: {
      requiresLogin: true
    }
  })

  .state('error', {
    url: '/error',
    templateUrl: 'templates/error.html',
    controller: 'ErrCtrl'
  });

  authProvider.init({
    domain: 'spasey.eu.auth0.com',
    clientID: 'lqghCxSv23etUvv2KBZvCI7MzJKpqJKR',
    loginState: 'login' // This is the name of the state where you'll show the login, which is defined above...
  });

  jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    var idToken = store.get('token');
    var refreshToken = store.get('refreshToken');
    // If no token return null
    if (!idToken || !refreshToken) {
      return null;
    }
    // If token is expired, get a new one
    if (jwtHelper.isTokenExpired(idToken)) {
      return auth.refreshIdToken(refreshToken).then(function(idToken) {
        store.set('token', idToken);
        return idToken;
      });
    } else {
      return idToken;
    }
  }

  $httpProvider.interceptors.push('jwtInterceptor');
})

.controller('AppCtrl', function($q, $scope) {
})
.run(function(auth) {
  // This hooks all auth events to check everything as soon as the app starts
  auth.hookEvents();
});
