Spasey.controller('MessagesCtrl', function($scope, Concierge) {
  //console.warn("MESSAGES");
  $scope.recent = [{
    img: "",
    apartment: "A1234",
    user: "user1",
    message: "Can I request guest parking spots?"
  },{
    img: "",
    apartment: "B2134",
    user: "user2",
    message: "Can I request homie parking spots?"
  },{
    img: "",
    apartment: "C3124",
    user: "user3",
    message: "Can I request pal parking spots?"
  }];

  $scope.older = [{
    message: "Hello"
  },{
    message: "How may I help?"
  }];

  $scope.now = {
    user: "dev",
    message: ""
  };

  // fix this
  $scope.expandText = function() {
  	var element = document.getElementById("sendMsg");
  	element.style.height =  element.scrollHeight + "px";
  }

  $scope.send = function() {
    console.log($scope.now.message)
    $scope.now.message = "";

    return MessagingService.create($scope.now.message).then(function(resolve) {
      console.log('#TODO: we need some loaders, and confirmation message on failure and success');
      console.log('Message sent');
    });
  }
});
