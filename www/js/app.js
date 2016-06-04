// MODULES
var Spasey = angular.module('Spasey', [
  'ionic',
  'ngOpenFB',
  'ngCordova',
  'ionic.service.core',
  'ionic.service.push',
  'jett.ionic.content.banner', // banner notifications
  'monospaced.elastic', // auto expanding of the chat textbox
  'auth0',
  'angular-storage',
  'angular-jwt'
]);

// API
// var host = 'http://spasey-service.herokuapp.com';
var host = 'http://localhost:3000';

// CONSTANTS

Spasey.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  dev: 'dev_role',
  admin: 'admin_role',
  public: 'public_role',
  concierge: 'concierge_role',
  resident: 'resident_role'
})

// RUN

.run(function($ionicPlatform, $rootScope, auth, store, jwtHelper, $location) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

  });

  auth.hookEvents();
  //This event gets triggered on URL change
  var refreshingToken = null;
  $rootScope.$on('$locationChangeStart', function() {
    var token = store.get('token');
    var refreshToken = store.get('refreshToken');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        if (refreshToken) {
          if (refreshingToken === null) {
            refreshingToken = auth.refreshIdToken(refreshToken).then(function(idToken) {
              store.set('token', idToken);
              auth.authenticate(store.get('profile'), idToken);
            }).finally(function() {
              refreshingToken = null;
            });
          }
          return refreshingToken;
        } else {
          $location.path('/login');// Notice: this url must be the one defined
        }                          // in your login state. Refer to step 5.
      }
    }
  });
})

.config(['$ionicAppProvider', function($ionicAppProvider) {
  $ionicAppProvider.identify({
    app_id: 'a839f0c4',
    api_key: '710ee48c4d4a9fd7bd0d6a5b3fd6b740d527cba82a98e405',
    dev_push: true
  });
}])

// DIRECTIVES

.directive('toggleClass',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      element.bind('click',function(){
        element.toggleClass(attrs.toggleClass);
      });
    }
  };
});
