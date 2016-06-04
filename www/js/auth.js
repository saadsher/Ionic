Spasey

.controller('LoginCtrl', function(store, $scope, $location, auth) {
  $scope.login = function() {
    auth.signin({
      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      }
    }, function(profile, token, accessToken, state, refreshToken) {
      // Success callback
      store.set('profile', profile);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      $location.path('/dev');
    }, function() {
      // Error callback
    });
  }
})

.controller('UserInfoCtrl', function($scope, auth) {
  $scope.auth = auth;
});