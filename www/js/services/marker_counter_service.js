var MarkerCounterService = {
  increase: function(marker, cache) {
  	if(marker.counter < 9) {
	  cache[0].counter = marker.counter + 1;
	}
  },
  decrease: function(marker, cache) {
  	if(marker.counter > 0) {
	  cache[0].counter = marker.counter - 1;
	}
  }
}