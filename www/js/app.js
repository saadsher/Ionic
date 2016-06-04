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

.run(function($ionicPlatform) {
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
