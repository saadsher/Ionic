angular.module('Spasey', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    console.log("--run");

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  })
})

.config(function($stateProvider, $urlRouterProvider) {

  console.log("--config");

  $stateProvider.state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  console.log("cMap");

  // $stateProvider.state('data', {
  //   url: '/data',
  //   templateUrl: 'templates/data.html',
  //   controller: 'DataCtrl'
  // });
  //
  // console.log("cData");

  $urlRouterProvider.otherwise("/");

})

.factory('Markers', function($http) {

  console.log("--factory");
  console.log("Markers");

  var markers = [];

  return {
    getMarkers: function(params) {

      return $http.get("http://localhost:8000/markers.php",{params:params}).then(function(response){
          markers = response;
          return markers;
      });

    },
    sendMarkers: function(params) {

      // return $http.post().then(function(response){
      //
      // });
    }
  }

})

.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){

  console.log("ConnectivityMonitor");

  return {
    isOnline: function(){

      console.log("isOnline");

      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();
        console.log("web online");
      } else {
        return navigator.onLine;
        console.log("device online");
      }

    },
    isOffline: function(){

      console.log("isOffline");

      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();
        console.log("web offline");
      } else {
        return !navigator.onLine;
        console.log("device offline");
      }

    }
  }
})

.factory('GoogleMaps', function($cordovaGeolocation, $ionicLoading, $rootScope, $cordovaNetwork, Markers, ConnectivityMonitor){

  var markerCache = [];
  var apiKey = false;
  var map = null;

  console.log("GoogleMaps");

  function initMap(){

    console.warn("geting into initMap");

    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var mapOptions = {
        center: latLng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){

        console.warn("once -- loadMarkers()");

        //Load the markers
        loadMarkers();

        //Reload markers every time the map moves
        google.maps.event.addListener(map, 'dragend', function(){
          console.log("moved!");
          loadMarkers();
        });

        //Reload markers every time the zoom changes
        google.maps.event.addListener(map, 'zoom_changed', function(){
          console.log("zoomed!");
          loadMarkers();
        });

        console.warn("once -- enableMap()");

        enableMap();

      });

    }, function(error){
      console.log("Could not get location");

        //Load the markers
        loadMarkers();
    });

  }

  function enableMap(){
    console.log("enableMap");
    $ionicLoading.hide();
  }

  function disableMap(){
    console.log("disableMap");
    $ionicLoading.show({
      template: 'You must be connected to the Internet to view this map.'
    });
  }

  function loadGoogleMaps(){

    console.log("loadGoogleMaps");

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
      script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
    }

    document.body.appendChild(script);

  }

  function checkLoaded(){

    console.log("checkLoaded");

    if(typeof google == "undefined" || typeof google.maps == "undefined"){
      loadGoogleMaps();
    } else {
      enableMap();
    }
  }

  function loadMarkers(){

    console.log("loadMarkers");

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
        console.log("Markers: ", markers);
        var records = markers.data.markers;

        for (var i = 0; i < records.length; i++) {

          var record = records[i];

          // Check if the marker has already been added
          if (!markerExists(record.lat, record.lng)) {

              var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

              var markerPos = new google.maps.LatLng(record.lat, record.lng);
              // add the marker
              var marker = new google.maps.Marker({
                  map: map,
                  animation: google.maps.Animation.DROP,
                  icon: iconBase + 'schools_maps.png',
                  position: markerPos
              });

              // Add the marker to the markerCache so we know not to add it again later
              var markerData = {
                lat: record.lat,
                lng: record.lng,
                marker: marker
              };


              markerCache.push(markerData);

              var infoWindowContent = "<h4><small>Road: </small>" +
                        record.road + "</h4><p>Point: " +
                        record.point + "</p><p>Free space: " +
                        record.count + "</p><p>Road infomation: " +
                        record.dict + "</p>";

              addInfoWindow(marker, infoWindowContent, record);
          }

        }

      });
  }

  function markerExists(lat, lng){

    console.log("markerExists");

      console.log("Not yet");
      var exists = false;
      var cache = markerCache;
      for(var i = 0; i < cache.length; i++){
        if(cache[i].lat === lat && cache[i].lng === lng){
          exists = true;
          console.log("Yes");
        }
      }

      return exists;
  }

  function getBoundingRadius(center, bounds){

    console.log("getBoundingRadius");

    return getDistanceBetweenPoints(center, bounds.northeast, 'miles');
  }

  function getDistanceBetweenPoints(pos1, pos2, units){

    console.log("getDistanceBetweenPoints");

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

    console.log("toRad");

      return x * Math.PI / 180;
  }

  function addInfoWindow(marker, message, record) {

    console.log("addInfoWindow");

      var infoWindow = new google.maps.InfoWindow({
          content: message
      });

      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open(map, marker);
      });

  }

  function addConnectivityListeners(){

    console.log("addConnectivityListeners");

    if(ionic.Platform.isWebView){

      // Check if the map is already loaded when the user comes online, if not, load it
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        checkLoaded();
        console.log("device online");
      });

      // Disable the map when the user goes offline
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        disableMap();
        console.log("device offline");
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

  return {
    init: function(key){

      console.log("init");

      if(typeof key != "undefined"){
        apiKey = key;
        console.log(apiKey);
      }

      if(typeof google == "undefined" || typeof google.maps == "undefined"){

        console.warn("google undefined");

        console.warn("Google Maps SDK needs to be loaded");

        disableMap();

        if(ConnectivityMonitor.isOnline()){
          loadGoogleMaps();
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

    }
  }

})

.controller('MapCtrl', function($scope, $state, $ionicModal, GoogleMaps) {
  console.log("--controller");
  console.log("Map");
  GoogleMaps.init("AIzaSyDt1Hn4Nag4LRzZY-b6Jn0leKDc2ZMwXns");
  $ionicModal.fromTemplateUrl('templates/data.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
})

.controller('DataCtrl', function($scope, $state) {
  console.log("Data");
});
