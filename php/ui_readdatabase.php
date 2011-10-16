<?php

	/*
	 * Part of the PHP scripts run by the user interface.
	 * Queries the database for a certain data warehouse
	 * database name. Returns a JSON string with results.
	 */
	 
	 /* Get database authentication details */
	require_once('auth_details.php');
	
	/* Retrieving the search string from the UI */
	$search = $_POST['search'];

	/* Results */
	$result = array();
	 
	/* Connect to db, perform query, and store the results. */
	if (is_string($search) && strlen($search) > 2 && strlen($search) < 64)
	{
		$dbh = new PDO('mysql:host=' . $hostname . ';dbname=' . $dbname, $user, $pass);

		/* Build query */
		$stmt = $dbh->prepare("SELECT table_name FROM table_lookup WHERE table_name LIKE ?");
	 
		/* Search for all databases beginning with the UI search string. */
		if ($stmt->execute(array($search . '%') ) )
		{
			/* Retrieve the rows */
			while (($row = $stmt->fetch() ) )
			{
				/* Store the rows */
			   $result[] = $row['database_name'];
			}
		}
	}
	 
	/* Set output header to JSON type */
	header('Content-type: application/json');
	
	/* Return a JSON encoded result */
	echo json_encode($result);
 		
?>