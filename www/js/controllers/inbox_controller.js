Spasey.controller('InboxCtrl', function($scope, MessagingService) {

  $scope.$on('conciergeConversationsUpdate', function(event, messages) {
    MessagingService.concierge.getConversations().then(function(response) {
      $scope.conversations = response.data;
    })
  });
});
