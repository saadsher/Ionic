var Spasey = angular.module('Spasey', ['ionic', 'ngCordova', 'ngOpenFB']);
var host = 'http://spasey-service.herokuapp.com';
//var host = 'http://localhost:8000';

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

// ROUTE

// AUTH

// MAP

// CONCIERGE

// USER CONTROLLERS

// Left Menu Controllers

// Right Menu Controllers

// ERROR HANDLER


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
