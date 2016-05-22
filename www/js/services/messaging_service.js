Spasey.service('MessagingService', function($http) {
  return {
    create: function(content) {
      return $http.post(
        host + "/messages",
        { messages: { content: content } }
      )
    }
  }
});
