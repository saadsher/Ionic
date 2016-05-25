Spasey.controller('MessagesCtrl', function($scope, MessagingService) {

  $scope.$on('messagesUpdate', function(event, messages) {
    MessagingService.getAll().then(function(response) {
      $scope.messages = response.data;
    })
  });

  $scope.send = function() {
    var chatLoader = angular.element(document.querySelectorAll(".chat-loader"));
    chatLoader.css("opacity", "1");
    return MessagingService.create($scope.now.message).then(function(resolve) {
      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      return MessagingService.getAll().then(function(response) {
        chatLoader.css("opacity", "0");
        $scope.now.message = "";
        $scope.messages = response.data;
      })
    });
  };
});
