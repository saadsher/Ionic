angular.module('Spasey.controllers', ['ngMap'])

// .controller('MapCtrl', function($scope, $ionicLoading, NgMap) {
//   $scope.mapCreated = function(map) {
//     $scope.map = map;
//   };
//
//   $scope.centerOnMe = function () {
//     console.log("Centering");
//     if (!$scope.map) {
//       return;
//     }
//
//     $scope.loading = $ionicLoading.show({
//       content: 'Getting current location...',
//       showBackdrop: false
//     });
//
//     navigator.geolocation.getCurrentPosition(function (pos) {
//       console.log('Got pos', pos);
//       $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
//       $scope.loading.hide();
//     }, function (error) {
//       alert('Unable to get location: ' + error.message);
//     });
//   };

// $scope.roadsAroudMe = function () {
//   console.log("Around Center");
//   if (!$scope.map) {
//     return;
//   }
//
//   $scope.loading = $ionicLoading.show({
//     content: 'Getting around current location...',
//     showBackdrop: false
//   });
//
//   navigator.geolocation.getNearbyRoads(function (pos) {
//     console.log('Got nearby pos', pos);
//
//     $scope.loading.hide();
//   }, function (error) {
//     alert('Unable to get nearby roads: ' + error.message);
//   });
// };

// .controller('MapCtrl', function(NgMap) {
//   var vm = this;
//   NgMap.getMap().then(function(map) {
//     vm.showCustomMarker= function(evt) {
//       map.customMarkers.foo.setVisible(true);
//       map.customMarkers.foo.setPosition(this.getPosition());
//     };
//     vm.closeCustomMarker= function(evt) {
//       this.style.display = 'none';
//     };
//   });
//
// });

.controller('MapCtrl', function(NgMap) {
  NgMap.getMap().then(function(map) {
    console.log(map.getCenter());
    console.log('markers', map.markers);
    console.log('shapes', map.shapes);
  });

// .controller('MapCtrl', function($scope, $ionicLoading) {
//   $scope.$on('mapInitialized', function(event, map) {
//     $scope.map = map;
//   });
//
//   $scope.centerOnMe= function() {
//
//     $scope.positions = [];
//
//     $ionicLoading.show( {
//       template: 'Loading...'
//     });
//
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//       $scope.positions.push({lat: pos.k,lng: pos.B});
//       console.log(pos);
//       $scope.map.setCenter(pos);
//       $ionicLoading.hide();
//     });
//   };
});
