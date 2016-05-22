Spasey.service('MessagingService', function($http) {
  return {
    create: function(content) {
      return $http.post(
        host + "/messages",
        { message: { content: content } }
      )
    },
    getAll: function() {
      return $http.get(host + "/messages")
    }
  }
});
