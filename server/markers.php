<?php
  header('Access-Control-Allow-Origin: *');
	// header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	// header('Access-Control-Allow-Headers: Content-Type,x-prototype-version,x-requested-with');

	//Create a connection to the database
	$mysqli = new mysqli("127.0.0.1", "root", "#cgjHa>75tvC", "spasey");

	//The default result to be output to the browser
	$result = "{'success':false}";

	//Grab the extra params
	$centre = json_decode(stripslashes($_GET["centre"]), true);
	$bounds = json_decode(stripslashes($_GET["bounds"]), true);
	$boundingRadius = $_GET["boundingRadius"];

	//Select everything from the table containing the marker informaton
	$query = sprintf('SELECT *, ( 3959 * acos( cos( radians("%s") ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians("%s") ) + sin( radians("%s") ) * sin( radians( latitude ) ) ) ) AS distance FROM markers',
	$mysqli->real_escape_string($centre['lat']),
	$mysqli->real_escape_string($centre['lng']),
	$mysqli->real_escape_string($centre['lat']));

	//Restrict query to those within bounding radius
	$maxDistance = $mysqli->real_escape_string($boundingRadius);

	$query .= " HAVING distance < '".$maxDistance."'";
	$query .= " ORDER BY distance";
	$query .= " LIMIT 300";

	//Run the query
	$dbresult = $mysqli->query($query);

	//Build an array of markers from the result set
	$markers = array();

	while($row = $dbresult->fetch_array(MYSQLI_ASSOC)){

		$markers[] = array(
			'id' => $row['id'],
			'road' => $row['roads'],
			'point' => $row['points'],
			'lat' => $row['latitude'],
			'lng' => $row['longitude'],
			'cap' => $row['capacity'],
			'count' => $row['counter'],
			'dict' => $row['dictionary'],
		);
	}

	//If the query was executed successfully, create a JSON string containing the marker information
	if($dbresult){
		$result = '{"success":true, "markers":' . json_encode($markers) . '}';
	}
	else
	{
		$result = '{"success":false}';
	}

	//Set these headers to avoid any issues with cross origin resource sharing issues
	// header('Access-Control-Allow-Origin: *');
	// header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	// header('Access-Control-Allow-Headers: Content-Type,x-prototype-version,x-requested-with');

	//Output the result to the browser so that our Ionic application can see the data
	echo($result);

?>
