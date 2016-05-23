Spasey.controller('FeedbackCtrl', function($scope, FeedbackService) {

  $scope.feedback = {
    username: "dev@spasey.com",
    message: ""
  }

  $scope.send = function() {
    console.log($scope.feedback.message)
    $scope.feedback.message = "";

    return FeedbackService.create($scope.feedback.message).then(function(resolve) {
      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      console.log('Feedback sent');
    });
  }
})
