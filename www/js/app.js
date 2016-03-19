angular.module('Spasey', ['ionic', 'ngCordova'])

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

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");

})

.factory('Markers', function($http) {

  return {
    getMarkers: function(params) {

      return $http.get("http://localhost:8000/markers.php",{params:params}).then(function(response){
          var markers = response;
          // console.info(markers);
          return markers;
      });

    },
    createMarker: function(newMarker) {

      console.info(newMarker);
    },
    updateMarker: function(thisMarker) {

      console.info(thisMarker);
    },
    deleteMarker: function(thisMarker) {

      console.info(thisMarker);
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

.factory('GoogleMaps', function($cordovaGeolocation, $ionicLoading, $rootScope, $cordovaNetwork, Markers, ConnectivityMonitor){

  var markerCache = [];
  var loadCache = [];
  var apiKey = false;
  var map = null;
  var gLoc;

  function initMap(){

    var options = {timeout: 10000, enableHighAccuracy: true};

      // console.info(gLoc);
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      gLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
      };

      var mapOptions = {
        center: latLng,
        zoom: 16,
        zoomControl: false,
        fullscreenControl: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){

        //Load the markers
        loadMarkers();

        //Show infowindow on every click/tap
        google.maps.event.addListener(map, 'click', function(){
          // console.log("click = info pop");
          infoPop();
        });

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

    }, function(error){

        $('.ion-ios-paper-outline').disable();

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

    //Convert objects returned by Google to be more readable
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

    var markers = Markers.getMarkers(params).then(function(markers){

      var records = markers.data.markers;

      for (var i = 0; i < records.length; i++) {

        var record = records[i];

        // Check if the marker has already been added
        if (!markerExists(record.lat, record.lng)) {

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

            // // Marker Label Overlay
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

            var markerPos = new google.maps.LatLng(record.lat, record.lng);

            // add the marker
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
                map_icon_label: '<span class="map-icon map-icon-parking"></span><span class="map-icon-label-ticker">'+record.count+'</span>',
                position: markerPos
            });

            // Add the marker to the markerCache so we know not to add it again later
            var markerData = {
              lat: record.lat,
              lng: record.lng,
              marker: marker
            };

            markerCache.push(markerData);

            loadCache.push(record);

            var infoWindowContent =
                    "<h4><small>Road: </small>" + record.road +
                    "</h4><p>Point: " + record.point +
                    "</p><p>Free space: " + record.count +
                    "</p><p>Road infomation: " + record.dict + "</p>";

            addInfoWindow(marker, infoWindowContent, record);
        }

      }

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

  function addInfoWindow(marker, message, record) {

    var infoWindow = new google.maps.InfoWindow({
        content: message
    });

    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
    });
  }

  function infoPop() {
    console.log('INFOPOP');
    // var infoWindowContent =
    //         "<h4><small>Road: </small>" + record.road +
    //         "</h4><p>Point: " + record.point +
    //         "</p><p>Free space: " + record.count +
    //         "</p><p>Road infomation: " + record.dict + "</p>";
    //
    // addInfoWindow(marker, infoWindowContent, record);
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

  function setCenter() {
    map.setCenter(gLoc);
  }

  function addMarker() { // TODO: Yet to complete

    var newMarkers = {
      "roads": formA.rd.value,
      "points": formA.pt.value,
      "latitude": formA.lat.value,
      "longitude": formA.lng.value,
      "capactiy": formA.cap.value,
      "counter": formA.ctr.value,
      "dictionary": formA.dic.value
    };

    Markers.postMarkers(newMarkers);
  }

  function editMarker() { // TODO: Yet to complete
    // console.log();
  }

  function dropMarker() { // TODO: Yet to complete
    // console.log();
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
      }
      else {
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
    setCenter: function() {
      setCenter();
    },
    listMarkers: function(){
      $rootScope.loadCache = loadCache;
    },
    addMarker: function(){
      Markers.createMarker();
    },
    editMarker: function() {
      Markers.updateMarker();
    },
    delMarker: function() {
      Markers.deleteMarker();
    }
  }

})

// .factory('AddMarker', function($rootScope){
//
//   return {
//
//     add: function addMarker(){
//
//       console.log("addMarker");
//
//       // var center = map.getCenter();
//       //
//       // //Convert objects returned by Google to be more readable
//       // var centerNorm = {
//       //     lat: center.lat(),
//       //     lng: center.lng()
//       // };
//
//       var params = {
//         // "lat": centerNorm.lat,
//         // "lng": centerNorm.lng
//         "lat": $rootScope.lat,
//         "lng": $rootScope.lng
//       };
//
//       console.info(params);
//
//       // Markers.postMarkers(params);
//     }
//   }
// })

.controller('MapCtrl', function($scope, $state, $ionicModal, GoogleMaps) {

  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");

  $ionicModal.fromTemplateUrl('templates/data.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.modalC = modal;

    $scope.mkr = {
      lng: "",
      lat: "",
      cap: "",
      ctr: "",
      dic: "",
      rd: "",
      pt: ""
    };
  });

  $ionicModal.fromTemplateUrl('templates/list.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalRUD = modal;
    GoogleMaps.listMarkers();
  });

  $scope.setCenter = function() {
    GoogleMaps.setCenter();
  }

  $scope.listMarkers = function() {
    GoogleMaps.listMarkers();
  }

  $scope.addMarker = function() {
    GoogleMaps.addMarker();
  };

  $scope.editMarker = function() {
    GoogleMaps.editMarker();
  };

  $scope.deleteMarker = function() {
    GoogleMaps.delMarker();
  };
});
