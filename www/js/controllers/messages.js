Spasey.controller('MessagesCtrl', function($scope, MessagingService, MessagesPollingService) {

  $scope.$on('messagesUpdate', function(event, messages) {
    $scope.messages = messages;
  });

  $scope.send = function() {
    var chatLoader = angular.element(document.querySelectorAll(".chat-loader"));
    chatLoader.css("opacity", "1");
    return MessagingService.create($scope.now.message).then(function(resolve) {
      chatLoader.css("opacity", "0");
      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      $scope.now.message = "";
      return MessagesPollingService.fetchMessages();
    });
  };
});
