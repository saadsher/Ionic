Spasey.controller('conciergeMessagesCtrl', function($scope, MessagingService) {

  $scope.$on('conciergeMessagesUpdate', function(event, messages) {
    MessagingService.concierge.getAll(messages.user_id).then(function(response) {
      $scope.messages = response.data;
    })
  });

  $scope.send = function() {
    var chatLoader = angular.element(document.querySelectorAll(".chat-loader"));
    var userId = $scope.concierge.inboxUserId;
    chatLoader.css("opacity", "1");
    return MessagingService.concierge.create({ userId: userId, content: $scope.now.message }).then(function(resolve) {
      return MessagingService.concierge.getAll(userId).then(function(response) {
        chatLoader.css("opacity", "0");
        $scope.now.message = "";
        $scope.messages = response.data;
      })
    });
  };
});
