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

// ROUTE

.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {

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

})

// AUTH

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
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
})

// MAP

.factory('Markers', function($q, $http, $ionicLoading) {

  return {
    getMarkers: function(params) {

      var loader = angular.element(document.querySelector('.customLoader'));

      loader.addClass("show");

      return $http.get(host + "/markers",{params:params}).then(function(response){
        loader.removeClass("show");
        return response;
      });
    },
    createMarker: function(newMarker) {

      $ionicLoading.show({
        template: '<ion-spinner icon="ripple"></ion-spinner>'
      });

      return $http.post(host + "/markers", {marker:newMarker}).then(function(resolve) {
        $ionicLoading.hide();
        // console.info("<<NEW MARKER ADDED>>");
        // console.log(newMarker);
      });
    },
    updateMarker: function(thisMarker) {

      $ionicLoading.show({
        template: '<ion-spinner icon="ripple"></ion-spinner>'
      });

      return $http.put(host + "/markers/" + thisMarker.id,{marker:thisMarker}).then(function(resolve) {
        $ionicLoading.hide();
        // console.info("<<MARKER UPDATED>>");
        // console.log(thismarker);
      });
    },
    deleteMarker: function(thisMarker) {

      $ionicLoading.show({
        template: '<ion-spinner icon="ripple"></ion-spinner>'
      });

      return $http.delete(host + "/markers/" + thisMarker.id,{marker:thisMarker}).then(function(resolve) {
        $ionicLoading.hide();
        // console.info("<<MARKER DELETED>>");
        // console.log(thisMarker);
      });
    }
  };

})

.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){

  return {
    isOnline: function(){

      if(ionic.Platform.isWebView()){
        // console.info("web online");
        return $cordovaNetwork.isOnline();
      } else {
        // console.info("device online");
        return navigator.onLine;
      }

    },
    isOffline: function(){

      if(ionic.Platform.isWebView()){
        // console.warn("web offline");
        return !$cordovaNetwork.isOnline();
      } else {
        // console.warn("device offline");
        return !navigator.onLine;
      }

    }
  }
})

.factory('GoogleMaps', function($cordovaGeolocation, $ionicLoading, $rootScope, $cordovaNetwork, $timeout, Markers, ConnectivityMonitor){

  var markerCache = [];
  var listCache = [];
  var editCache = [];
  var newCache = [];
  var tempCache = {};
  var apiKey = false;
  var map = null;
  var markerClick;
  var gLoc;
  // MVP
  var npw = {lat: 51.5060752, lng: -0.0047033};

  // actionable content boxes
  var actiboxNew = angular.element(document.querySelector('.actibox-new'));
  var actiboxEdit = angular.element(document.querySelector('.actibox-edit'));
  var actiboxCounter = angular.element(document.querySelector('.actibox-counter'));

  // togglers for map interaction
  var markerClickToggle = false;
  var accBasic = true;
  var accAdmin = false;
  var full = false;
  var noAnim = false;

  function initMap(){

    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      // var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      gLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
      };

      // console.info(gLoc);

      var latLng = new google.maps.LatLng(npw.lat, npw.lng);

      var mapOptions = {
        center: latLng,
        zoom: 16,
        zoomControl: false,
        fullscreenControl: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"administrative","elementType":"labels.text","stylers":[{"gamma":"1.00"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#7d8be9"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#28292d"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#28292d"},{"lightness":"0"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"visibility":"off"},{"saturation":"0"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"saturation":"0"},{"gamma":"1"},{"color":"#c4c8de"},{"weight":"1"},{"lightness":"0"}]},{"featureType":"landscape.natural.landcover","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural.terrain","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#28292d"},{"lightness":"0"},{"saturation":"0"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#e9d07d"},{"visibility":"on"},{"weight":"0.49"},{"gamma":"1."}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#bcc0a7"},{"weight":"1.00"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"weight":"1.10"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"weight":"0.01"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"weight":"1.00"},{"lightness":"12"},{"saturation":"-53"},{"gamma":"0.91"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"weight":"0.01"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#323029"},{"lightness":"-6"},{"visibility":"on"},{"gamma":"1.98"},{"weight":"0.65"},{"saturation":"-19"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"weight":"0.01"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#28292d"},{"lightness":"8"},{"visibility":"on"}]}]
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){

        //Load the markers
        loadMarkers();

        //Reload markers every time the map moves
        google.maps.event.addListener(map, 'dragend', function(){
          // console.log("drag = reload map");
          loadMarkers();
        });

        //Reload markers every time the zoom changes
        google.maps.event.addListener(map, 'zoom_changed', function(){
          // console.log("zoom = reload map");
          loadMarkers();
        });

        enableMap();

      });

      addListeners();

    }, function(error){

        // angular.element(document.querySelector('.ion-ios-paper-outline')).disable();

        console.warn("Could not get location");

        //Load the markers
        loadMarkers();
    });

  }

  function enableMap(){
    $ionicLoading.hide();
  }

  function disableMap(){
    console.warn("map disabled");
    $ionicLoading.show({
      template: 'You must be connected to the Internet to view this map.'
    });
  }

  function loadGoogleMaps(){

    $ionicLoading.show({
      template: 'Loading Google Maps'
    });

    //This function will be called once the SDK has been loaded
    window.mapInit = function(){
      initMap();
    };

    //Create a script element to insert into the page
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "googleMaps";

    //Note the callback function in the URL is the one we created above
    if(apiKey){
      script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey + '&callback=mapInit';
    }
    else {
      console.warn("no API key found");
      script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
    }

    document.body.appendChild(script);

  }

  function checkLoaded(){

    console.log("checking if loaded");

    if(typeof google == "undefined" || typeof google.maps == "undefined"){
      loadGoogleMaps();
    } else {
      enableMap();
    }
  }

  function loadMarkers(){

    var center = map.getCenter();
    var bounds = map.getBounds();
    var zoom = map.getZoom();

    // Convert objects returned by Google to be more readable
    var centerNorm = {
        lat: center.lat(),
        lng: center.lng()
    };

    var boundsNorm = {
        northeast: {
            lat: bounds.getNorthEast().lat(),
            lng: bounds.getNorthEast().lng()
        },
        southwest: {
            lat: bounds.getSouthWest().lat(),
            lng: bounds.getSouthWest().lng()
        }
    };

    var boundingRadius = getBoundingRadius(centerNorm, boundsNorm);

    var params = {
      "centre": centerNorm,
      "bounds": boundsNorm,
      "zoom": zoom,
      "boundingRadius": boundingRadius
    };

    // var params = {
    //   "centre": {
    //     lat: 51.5060752,
    //     lng: -0.0047033
    //   },
    //   "bounds": {
    //     northest: {
    //       lat: 51.511196912922415,
    //       lng: -0.00007917165828530415
    //     },
    //     southwest: {
    //       lat: 51.500952911311614,
    //       lng: -0.009327428341634914
    //     }
    //   },
    //   "zoom": 16,
    //   "boundingRadius": 0.4059245377416782
    // };
    //
    // console.log(params)

    var markers = Markers.getMarkers(params).then(function(markers){

      /**
       * Map Icons created by Scott de Jonge
       *
       * @version 3.0.0
       * @url http://map-icons.com
       *
       */
      // Define Marker Shapes
      var MAP_PIN = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
      var SQUARE_PIN = 'M22-48h-44v43h16l6 5 6-5h16z';
      var SHIELD = 'M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z';
      var ROUTE = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
      var SQUARE = 'M-24-48h48v48h-48z';
      var SQUARE_ROUNDED = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';


      // Function to do the inheritance properly
      // Inspired by: http://stackoverflow.com/questions/9812783/cannot-inherit-google-maps-map-v3-in-my-custom-class-javascript
      var inherits = function(childCtor, parentCtor) {
        /** @constructor */
        function tempCtor() {};
        tempCtor.prototype = parentCtor.prototype;
        childCtor.superClass_ = parentCtor.prototype;
        childCtor.prototype = new tempCtor();
        childCtor.prototype.constructor = childCtor;
      };

      function Marker(options){
        google.maps.Marker.apply(this, arguments);

        if (options.map_icon_label) {
          this.MarkerLabel = new MarkerLabel({
            map: this.map,
            marker: this,
            text: options.map_icon_label
          });
          this.MarkerLabel.bindTo('position', this, 'position');
        }
      }

      // Apply the inheritance
      inherits(Marker, google.maps.Marker);

      // Custom Marker SetMap
      Marker.prototype.setMap = function() {
        google.maps.Marker.prototype.setMap.apply(this, arguments);
        (this.MarkerLabel) && this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
      };

      // Marker Label Overlay
      var MarkerLabel = function(options) {
        var self = this;
        this.setValues(options);

        // Create the label container
        this.div = document.createElement('div');
        this.div.className = 'map-icon-label';

        // Trigger the marker click handler if clicking on the label
        google.maps.event.addDomListener(this.div, 'click', function(e){
          (e.stopPropagation) && e.stopPropagation();
          google.maps.event.trigger(self.marker, 'click');
        });
      };

      // Create MarkerLabel Object
      MarkerLabel.prototype = new google.maps.OverlayView;

      // Marker Label onAdd
      MarkerLabel.prototype.onAdd = function() {
        var pane = this.getPanes().overlayImage.appendChild(this.div);
        var self = this;

        this.listeners = [
          google.maps.event.addListener(this, 'position_changed', function() { self.draw(); }),
          google.maps.event.addListener(this, 'text_changed', function() { self.draw(); }),
          google.maps.event.addListener(this, 'zindex_changed', function() { self.draw(); })
        ];
      };

      // Marker Label onRemove
      MarkerLabel.prototype.onRemove = function() {
        this.div.parentNode.removeChild(this.div);

        for (var i = 0, I = this.listeners.length; i < I; ++i) {
          google.maps.event.removeListener(this.listeners[i]);
        }
      };

      // Implement draw
      MarkerLabel.prototype.draw = function() {
        var projection = this.getProjection();
        var position = projection.fromLatLngToDivPixel(this.get('position'));
        var div = this.div;

        this.div.innerHTML = this.get('text').toString();

        div.style.zIndex = this.get('zIndex'); // Allow label to overlay marker
        div.style.position = 'absolute';
        div.style.display = 'block';
        div.style.left = (position.x - (div.offsetWidth / 2)) + 'px';
        div.style.top = (position.y - div.offsetHeight) + 'px';

      };

      /**
       * Map Icons End
       */



      var records = markers.data.markers;

      for (var i = 0; i < records.length; i++) {

        var record = records[i];

        // Check if the marker has already been added
        if (!markerExists(record.latitude, record.longitude)) {

            var markerPos = new google.maps.LatLng(record.latitude, record.longitude);

            if(noAnim) {
              // Don't animate and add the marker
              var marker = new Marker({
                  map: map,
                  icon: {
                    path: MAP_PIN,
                    fillcolor: '#FFC900',
                    fillOpacity: 0.5,
                    strokeColor: '#FFC900',
                    strokeWeight: 2
                  },
                  map_icon_label: '<span class="map-icon-label-ticker">'+record.counter+'</span>',
                  position: markerPos
              });
            } else {
              // add the marker with animation drop
              var marker = new Marker({
                  map: map,
                  animation: google.maps.Animation.DROP,
                  icon: {
                    path: MAP_PIN,
                    fillcolor: '#FFC900',
                    fillOpacity: 0.5,
                    strokeColor: '#FFC900',
                    strokeWeight: 2
                  },
                  map_icon_label: '<span class="map-icon-label-ticker">'+record.counter+'</span>',
                  position: markerPos
              });
            }

            // Add the marker to the markerCache so we know not to add it again later
            var markerData = {
              lat: record.latitude,
              lng: record.longitude,
              marker: marker
            };

            markerCache.push(markerData);

            listCache.push(record);

            cacheEditActibox(marker, record);

        }
      }
    }).then(function() {
        return cacheLoad(); //Prepare the list cache
    });
  }

  function markerExists(lat, lng){

    var exists = false;
    var cache = markerCache;

    for(var i = 0; i < cache.length; i++){
      if(cache[i].lat === lat && cache[i].lng === lng){
        exists = true;
      }
    }

    return exists;
  }

  function getBoundingRadius(center, bounds){
    return getDistanceBetweenPoints(center, bounds.northeast, 'miles');
  }

  function getDistanceBetweenPoints(pos1, pos2, units){

    var earthRadius = {
        miles: 3958.8,
        km: 6371
    };

    var R = earthRadius[units || 'miles'];
    var lat1 = pos1.lat;
    var lon1 = pos1.lng;
    var lat2 = pos2.lat;
    var lon2 = pos2.lng;

    var dLat = toRad((lat2 - lat1));
    var dLon = toRad((lon2 - lon1));
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;

  }

  function toRad(x){
    return x * Math.PI / 180;
  }

  function clickNew() {
    full = false;
    if (accAdmin) {
      $timeout(function () {
        markerClickToggle = false;
        actiboxEdit.removeClass('active');
        actiboxCounter.removeClass('active');
        actiboxNew.addClass('active');
      }, 300);
    }
  }
  function clickNewHide() {
    actiboxNew.removeClass('active');
  }

  function clickEdit() {
    full = true;
    if (accAdmin) {
      markerClickToggle = true;
      actiboxNew.removeClass('active');
      actiboxCounter.removeClass('active');
      actiboxEdit.addClass('active');
    }
  }
  function clickEditHide() {
    angular.element(document.querySelector('.map-icon-label-ticker.active')).removeClass('active');
    actiboxEdit.removeClass('active');
  }

  function clickCounter() {
    // if (accBasic) {
      markerClickToggle = true;
      actiboxNew.removeClass('active');
      actiboxEdit.removeClass('active');
      actiboxCounter.addClass('active');
    // }
  }
  function clickCounterHide() {
    angular.element(document.querySelector('.map-icon-label-ticker.active')).removeClass('active');
    actiboxCounter.removeClass('active');
  }

  function addConnectivityListeners(){

    // console.log("addConnectivityListeners");

    if(ionic.Platform.isWebView){

      // Check if the map is already loaded when the user comes online, if not, load it
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        checkLoaded();
        console.info("device online");
      });

      // Disable the map when the user goes offline
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        disableMap();
        console.warn("device offline");
      });

    }
    else {

      //Same as above but for when we are not running on a device
      window.addEventListener("online", function(e) {
        checkLoaded();
        console.log("browser online");
      }, false);

      window.addEventListener("offline", function(e) {
        disableMap();
        console.log("browser offline");
      }, false);
    }

  }

  function addListeners(){

    if (accAdmin) {
      console.warn("ADMIN");
      google.maps.event.addListener(map, 'click', function(event){
        cacheNew(event);
        clickNew();
      });
    }

    if (accBasic) {
      console.warn("BASIC");
      cacheNew();
    }

  }

  function cacheLoad() {
    $rootScope.listCache = listCache;
    // console.table(listCache);
  }

  function cacheNew(event) {
    if (event) {
      var eLat = event.latLng.lat().toString();
      var eLng  = event.latLng.lng().toString();
      // console.log(eLat,eLng);
      newCache = [{
        capacity: "",
        counter: "",
        dictionary: "",
        latitude: eLat,
        longitude: eLng,
        points: "",
        roads: ""
      }];
    } else {
      newCache = [{
        capacity: "",
        counter: "",
        dictionary: "",
        latitude: "",
        longitude: "",
        points: "",
        roads: ""
      }];
    }
    $rootScope.newCache = newCache;
    // console.table($rootScope.newCache);
  }

  function cacheTemp(ne) {
    tempCache = {
      capacity: ne.capacity,
      counter: ne.counter,
      dictionary: ne.dictionary,
      latitude: ne.latitude,
      longitude: ne.longitude,
      points: ne.points,
      roads: ne.roads,
      id: ne.id
    };
    $rootScope.tempCache = tempCache;
    // console.table($rootScope.tempCache);
  }

  function cacheEdit(event) {
    if (event) {
      // var eLat = event.latLng.lat().toString();
      // var eLng  = event.latLng.lng().toString();
      full = true;
      editCache = [{
        _capacity: event.capacity,
        capacity: event.capacity,
        _counter: event.counter,
        counter: event.counter,
        _dictionary: event.dictionary,
        dictionary: event.dictionary,
        // latitude: eLat,
        // longitude: eLng,
        latitude: event.latitude.toString(),
        longitude: event.longitude.toString(),
        _points: event.points,
        points: event.points,
        _roads: event.roads,
        roads: event.roads,
        _id: event.id,
        id: event.id
      }];
      // console.log(event)
    } else {
      editCache = [{
        capacity: "",
        counter: "",
        dictionary: "",
        latitude: "",
        longitude: "",
        points: "",
        roads: "",
        id: ""
      }];
    }
    $rootScope.editCache = editCache;
    // console.table($rootScope.editCache);
  }

  function cacheEditPlus(event) {
    if (event.counter < 9) {
      editCache[0].counter++;
    }
  }

  function cacheEditMinus(event) {
    if (event.counter > 0) {
      editCache[0].counter--;
    }
  }

  function cacheEditActibox(marker, record) {
    google.maps.event.addListener(marker, 'click', function() {
      cacheEdit(record);
      angular.element(document.querySelector('.map-icon-label-ticker.active')).removeClass('active');
      markerClick = angular.element(this.MarkerLabel.div.children[0]);
      markerClick.addClass('active');
      if (accAdmin) {
        clickEdit();
      } else {
        clickCounter();
      }
    });
  }

  function setCenter() {
    map.panTo(gLoc);
  }

  function refreshData() {
    for (var i = 0; i < markerCache.length; i++) {
      markerCache[i].marker.setMap(null);
    }
    listCache = [];
    markerCache = [];
    noAnim = true;
    loadMarkers();
  }

  return {
    init: function(key){

      if(typeof key != "undefined"){
        apiKey = key;
        // console.log(apiKey);
      }

      if(typeof google == "undefined" || typeof google.maps == "undefined"){

        if(ConnectivityMonitor.isOnline()){
          loadGoogleMaps();
        } else {
          disableMap();
          console.warn("google is undefined");
          console.warn("Google Maps SDK needs to be loaded");
        }
      } else {

        if(ConnectivityMonitor.isOnline()){
          markerCache = [];
          initMap();
          enableMap();
        } else {
          disableMap();
        }
      }

      addConnectivityListeners();
    },
    clickMap: function() {
      if (accBasic && markerClickToggle) {
        clickCounter();
        markerClickToggle = false;
      } else if (accAdmin && markerClickToggle) {
        clickEdit();
        markerClickToggle = false;
      } else if (accAdmin && !markerClickToggle) {
        clickNew();
        markerClickToggle = false;
      }
    },
    clickNewClose: function() {
      clickNewHide();
    },
    clickEditClose: function() {
      clickEditHide();
    },
    clickCounterClose: function() {
      clickCounterHide();
    },
    clickCounterUp: function(c) {
      cacheEditPlus(c);
    },
    clickCounterDown: function(c) {
      cacheEditMinus(c);
    },
    setCenter: function() {
      setCenter();
    },
    listMarkers: function(){
      cacheLoad();
    },
    newMarker: function(n){
      if (accAdmin) {
        if (n) {
          cacheTemp(n);
          return Markers.createMarker(tempCache).then(function(){
            refreshData();
          });
        } else {
          cacheNew();
        }
      }
    },
    editMarker: function(e){
      if (accAdmin) {
        // console.log(e);
        if (e) {
          cacheEdit(e);
        } else {
          cacheEdit();
        }
      }
    },
    editOnce: function() {
      return full;
    },
    updateMarker: function(u){
      if (accAdmin) {
        if(u) {
          cacheTemp(u);
          return Markers.updateMarker(tempCache).then(function(){
            refreshData();
          });
        }
      }
    },
    updateCounter: function(u){
      if(u) {
        cacheTemp(u);
        return Markers.updateMarker(tempCache).then(function(){
          refreshData();
        });
      }
    },
    deleteMarker: function(d) {
      if (accAdmin) {
        if(d) {
          cacheTemp(d);
          return Markers.deleteMarker(tempCache).then(function(){
            refreshData();
          });
        }
      }
    },
    setAdmin: function(o) {
      if (o) {
        accBasic = false;
        accAdmin = true;
      } else {
        accBasic = true;
        accAdmin = false;
      }
      addListeners();
    }
  }

})

// CONCIERGE

.factory('Concierge', function($q, $ionicLoading, $timeout) {
  return {
    parkVehicle: function() {

    },
    releaseVehicle: function() {

    },
    postBox: function() {

    },
    messageChat: function() {

    }
  }
})

// USER CONTROLLERS

.controller('DevCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, $timeout, GoogleMaps) {

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
})


.controller('AdminCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, GoogleMaps) {

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
})


.controller('UserCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, GoogleMaps) {

  console.warn("User");

  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

  $ionicModal.fromTemplateUrl('templates/base-list.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalR = modal;
  });

  $scope.clickCounterHide = function() {
    GoogleMaps.clickCounterClose();
  }

  $scope.setCenter = function() {
    GoogleMaps.setCenter();
  }

  $scope.listMarkers = function() {
    GoogleMaps.listMarkers();
  }

  $scope.clickMap = function() {
    GoogleMaps.clickMap();
  }

  $scope.updateCounter = function(update) {
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
})


.controller('CncrgCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, GoogleMaps) {

  console.warn("Concierge");

  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

  $ionicModal.fromTemplateUrl('templates/base-list.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalR = modal;
  });

  $scope.clickCounterHide = function() {
    GoogleMaps.clickCounterClose();
  }

  $scope.setCenter = function() {
    GoogleMaps.setCenter();
  }

  $scope.listMarkers = function() {
    GoogleMaps.listMarkers();
  }

  $scope.clickMap = function() {
    GoogleMaps.clickMap();
  }

  $scope.updateCounter = function(update) {
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
})


.controller('ResCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicListDelegate, GoogleMaps) {

  console.warn("Resident");

  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

  $ionicModal.fromTemplateUrl('templates/base-list.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalR = modal;
  });

  $scope.clickCounterHide = function() {
    GoogleMaps.clickCounterClose();
  }

  $scope.setCenter = function() {
    GoogleMaps.setCenter();
  }

  $scope.listMarkers = function() {
    GoogleMaps.listMarkers();
  }

  $scope.clickMap = function() {
    GoogleMaps.clickMap();
  }

  $scope.updateCounter = function(update) {
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
})

// Left Menu Controllers

.controller('ProfileCtrl', function($scope, $timeout) {
  // console.warn("PROFILE");

  $scope.editActive = false;

  var initGet = {
    username: "dev@spasey.com",
    password: "zaxscdvf"
  }

  $scope.profile = {
    username: "dev@spasey.com",
    password: "zaxscdvf"
  }

  $scope.unchanged = function() {
    if ($scope.profile.username === initGet.username && $scope.profile.password === initGet.password) {
      return true
    } else {
      return false
    }
  }

  // reset
  $scope.$on('modal.hidden', function() {
    $timeout(function() {
      $scope.editActive = false;
      $scope.profile = {
        username: "dev@spasey.com",
        password: "zaxscdvf"
      }
      $scope.click = false;
      $scope.button = false;
    }, 300);
  });

  $scope.update = function(profile) {
    console.log(profile)
  }

})

.controller('SettingsCtrl', function($scope) {
  // console.warn("SETTINGS");
})

// Right Menu Controllers

.controller('ValetCtrl', function($scope, Concierge) {
  // console.warn("VALET");
})

.controller('PostboxCtrl', function($scope, Concierge) {
  // console.warn("POSTBOX");
})

.controller('MessagesCtrl', function($scope, Concierge) {
  // console.warn("MESSAGES");
})

// ERROR HANDLER

.controller('ErrCtrl', function($scope, $ionicHistory) {
  console.warn("WTF");
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }
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
