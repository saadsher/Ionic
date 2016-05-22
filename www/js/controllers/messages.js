Spasey.controller('MessagesCtrl', function($scope, Concierge, MessagingService, $timeout) {
  var poll = function() { $timeout(function() {
    $scope.updateMessages();
    poll();
  }, 20000) };
  poll(); 

  $scope.updateMessages = function() {
    MessagingService.getAll().then(function(response) {
      $scope.messages = response.data
    });
  }

  // fix this
  $scope.expandText = function() {
  	var element = document.getElementById("sendMsg");
  	element.style.height =  element.scrollHeight + "px";
  }

  $scope.send = function() {
    return MessagingService.create($scope.now.message).then(function(resolve) {
      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      $scope.now.message = "";
      return $scope.updateMessages();
    });
  }

  $scope.updateMessages();
});
