Spasey.controller('MessagesCtrl', function($scope, MessagingService, MessagesPollingService) {

  $scope.$on('messagesUpdate', function(event, messages) {
    $scope.messages = messages;
  });

  $scope.send = function() {
    return MessagingService.create($scope.now.message).then(function(resolve) {
      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      $scope.now.message = "";
      return MessagesPollingService.fetchMessages();
    });
  };
});
