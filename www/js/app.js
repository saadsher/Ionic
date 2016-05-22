var Spasey = angular.module('Spasey', ['ionic', 'ngCordova', 'ngOpenFB', 'monospaced.elastic']);
var host = 'http://spasey-service.herokuapp.com';

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

.run(function($ionicPlatform, ngFB) {
  ngFB.init({appId: '2050092375216849'});

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
