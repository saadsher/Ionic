Spasey.controller('ValetCtrl', function($scope, Concierge) {

  $scope.residents = [{
    id: 001,
    img: "http://placehold.it/40x40",
    user: "user1",
    apartment: "A1234",
    valet: {
      status: true,
      date: "Today, 12:00"
    },
    parcel: {
      id: 001,
      date: "Today, 12:00",
      alert: false
    }
  },{
    id: 002,
    img: "http://placehold.it/40x40",
    user: "user2",
    apartment: "B2134",
    valet: {
      status: true,
      date: "12/12/12, 12:00"
    },
    parcel: {
      id: 002,
      date: "12/12/12, 12:12",
      alert: true
    }
  },{
    id: 003,
    img: "http://placehold.it/40x40",
    user: "user3",
    apartment: "C3124",
    valet: {
      status: true,
      date: "11/11/11, 12:00"
    },
    parcel: {
      id: 003,
      date: "01/01/01, 01:01",
      alert: true
    }
  }];
});
