Spasey.service('FeedbackService', function($http) {
  return {
    create: function(content) {
      return $http.post(
        host + "/feedbacks",
        { feedback: { content: content } }
      )
    }
  }
});