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
    },
    concierge: {
      create: function(data) {
        return $http.post(
          host + "/concierge/users/" + data.userId + "/messages",
          { message: { content: data.content } }
        )
      },
      getConversations: function() {
        return $http.get(host + "/concierge/conversations")
      },
      getAll: function(userId) {
        return $http.get(host + "/concierge/users/" + userId + "/messages")
      }
    }
  }
});
