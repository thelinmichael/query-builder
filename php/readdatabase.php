<?php

	/*
	 * Part of the PHP scripts run by the user interface.
	 * Queries the database for a certain data warehouse
	 * database name. Returns a JSON string with results.
	 */
	 
	 
	$search = $_POST['search'];

	$result = array();
	 
	// Some simple validation
	if (is_string($search) && strlen($search) > 2 && strlen($search) < 64)
	{
		$dbh = new PDO('mysql:host=localhost;dbname=theEbayDb', $user, $pass);

		// Building the query
		$stmt = $dbh->prepare("SELECT database_name FROM database_lookup WHERE database_name LIKE ?");
	 
		// The % as wildcard
		if ($stmt->execute(array($search . '%') ) )
		{
			// Filling the results with usernames
			while (($row = $stmt->fetch() ) )
			{
			   $result[] = $row['database_name'];
			}
		}
	}
	 
	// Finally the JSON, including the correct content-type
	header('Content-type: application/json');
	 
	echo json_encode($result);
 		
?>