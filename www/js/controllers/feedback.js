Spasey.controller('FeedbackCtrl', function($scope, $ionicContentBanner, FeedbackService) {

  var contentBannerInstance;

  $scope.feedback = {
    username: "dev@spasey.com",
    message: ""
  }

  $scope.send = function() {
    console.log($scope.feedback.message)
    $scope.feedback.message = "";

    if (contentBannerInstance) {
      contentBannerInstance();
      contentBannerInstance = null;
    }

    contentBannerInstance = $ionicContentBanner.show({
      text: ["SENDING"],
      icon: null
    });

    return FeedbackService.create($scope.feedback.message).then(function(resolve) {

      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }

      contentBannerInstance = $ionicContentBanner.show({
        text: ["FEEDBACK SENT"],
        autoClose: 7000
      });

      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      console.log('Feedback sent');
    });
  }
})
