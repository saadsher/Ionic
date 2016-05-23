Spasey.service('MessagesPollingService', function($rootScope, $timeout, MessagingService) {
  function fetchMessages() {
    MessagingService.getAll().then(function(response) {
      $rootScope.$broadcast('messagesUpdate', response.data);
    });
  };

  function startPolling() {
    $timeout(function() {
      fetchMessages();
      startPolling();
    }, 5000);
  };

  return {
    run: function() {
      fetchMessages();
      startPolling();
    },
    fetchMessages: fetchMessages
  }
});
