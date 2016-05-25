Spasey.service('SyncService', function($rootScope, $http, $timeout, MessagingService) {
  function sync() {
    $http.get(host + "/sync").then(function(response) {
      var userRole = window.localStorage.getItem('userRole');
      $rootScope.$broadcast('sync', response.data);
    });
  };

  function startPolling() {
    $timeout(function() {
      sync();
      startPolling();
    }, 5000);
  };

  return {
    run: function() {
      sync();
      startPolling();
    },
    sync: sync
  }
});
