<?php

	/*
	 * Part of the PHP scripts run by the user interface.
	 * Queries the database for a certain data warehouse
	 * data. Returns a JSON string with results.
	 */
	 
	/* Get database authentication details */
	require_once('auth_details.php');

	/* Handle data received by the user interface */
	if (isset($_POST['search']))   { $search   = $_POST['search']; }
	if (isset($_POST['database'])) { $database = $_POST['database']; }
	if (isset($_POST['table']))    { $table    = $_POST['table']; }
	if (isset($_POST['column']))   { $column   = $_POST['column']; }
	if (isset($_POST['type']))     { $type     = $_POST['type']; }
	if (isset($_POST['browse']))   { $browse   = $_POST['browse']; }

	/*
	 * Browse is either true or false.
	 * If browsing, the user is not typing data into the input fields at the 
	 * top of the UI. Instead, the user is using the links below the 
	 * input fields.
	 */ 
	if ($browse)
	{
		$search = "%";
		if (isset($database)) { $database = explode(",", $database); }
		if (isset($table))    { $table    = explode(",", $table); }
		if (isset($column))   { $column   = explode(",", $column); }
	}	

	/* Results (output) */
	$result = array();

	/* Retrieve data warehouse information from the MySQL database if..
	 * 1. The search string is more than 2 and less than 64 characters long.
	 * 2. User is browsing (see above comment for definition).
	 */
	if ($browse || is_string($search) && strlen($search) > 2 && strlen($search) < 64)
	{
		$dbh = new PDO('mysql:host=' . $hostname . ';dbname=' . $dbname, $user, $password);
		
		/* User wants to retrieve database names. */
		if ($type == "database")
		{	
			$queryString = "SELECT DISTINCT database_name FROM database_lookup WHERE database_name LIKE ?";
			$rowname     = "database_name";
		}
		
		/* User wants to retrieve table names. */
		else if ($type == "table") 
		{
			$rowname = "table_name"; 
			/* Database values have been set */
			if (isset($database) && sizeof($database) > 0 && strlen($database[0]) > 0)
			{				
				$queryString = "SELECT distinct d.database_name, t.table_name FROM table_lookup AS t, database_lookup AS d, column_fact AS f
				 				WHERE t.table_id = f.table_id AND t.table_name LIKE ? AND f.database_id = d.database_id AND d.database_name IN (";					
				for ($i = 0; $i < sizeof($database); $i++)
				{
					$queryString = $queryString . "'" . $database[$i] . "'";
					if (sizeof($database)-1 > $i)
						$queryString = $queryString . ", ";
					else if (sizeof($database)-1 == $i)
						$queryString = $queryString . ")";
				}
			}			
			/* No database is set */
			else
				$queryString = "SELECT distinct d.database_name, t.table_name FROM table_lookup AS t, database_lookup AS d, column_fact AS f
								WHERE t.table_id = f.table_id AND f.database_id = d.database_id AND t.table_name LIKE ?";
		}
		
		/* User wants to retrieve column names. */
		else if ($type == "column")
		{
			$rowname = "column_name";
			if (isset($database) && sizeof($database) > 0 && strlen($database[0] && isset($table) && sizeof($table) > 0 && strlen($table[0])))
			{
				$queryString = "SELECT DISTINCT d.database_name, t.table_name, f.column_name FROM column_fact AS f, table_lookup AS t, database_lookup AS d WHERE f.table_id = t.table_id AND t.table_name IN (";			

				for ($i = 0; $i < sizeof($table); $i++)
				{
					$queryString = $queryString . "'" . $table[$i] . "'";
					if (sizeof($table)-1 > $i)
						$queryString = $queryString . ", ";
					else if (sizeof($table)-1 == $i)
						$queryString = $queryString . ")";
				}	
				$queryString = $queryString . " AND f.database_id = d.database_id AND d.database_name IN (";
				for ($i = 0; $i < sizeof($database); $i++)
				{
					$queryString = $queryString . "'" . $database[$i] . "'";
					if (sizeof($database)-1 > $i)
						$queryString = $queryString . ", ";
					else if (sizeof($database)-1 == $i)
						$queryString = $queryString . ")";
				}	
			}
			else if (isset($database) && sizeof($database) > 0 && strlen($database[0])) 
			{
				$queryString = ("SELECT DISTINCT d.database_name, t.table_name, f.column_name 
								 FROM table_lookup AS t, database_lookup AS d, column_fact AS f 
								 WHERE d.database_id = f.database_id AND 
									   f.table_id = t.table_id AND  
									   f.column_name LIKE ? AND
									   d.database_name IN ("); 	
				
				for ($i = 0; $i < sizeof($database); $i++)
				{
					$queryString = $queryString . "'" . $database[$i] . "'";
					if (sizeof($database)-1 > $i)
						$queryString = $queryString . ", ";
					else if (sizeof($database)-1 == $i)
						$queryString = $queryString . ")";
				}	
			}
			else if (isset($table) && sizeof($table) > 0 && strlen($table[0]))
			{
				$queryString = ("SELECT DISTINCT d.database_name, t.table_name, f.column_name
								 FROM table_lookup AS t, database_lookup AS d, column_fact AS f
								 WHERE t.table_id = f.table_id
								 AND f.database_id = d.database_id
								 AND f.column_name LIKE ?
								 AND t.table_name IN ("); 	

				for ($i = 0; $i < sizeof($table); $i++)
				{
					$queryString = $queryString . "'" . $table[$i] . "'";
					if (sizeof($table)-1 > $i)
						$queryString = $queryString . ", ";
					else if (sizeof($table)-1 == $i)
						$queryString = $queryString . ")";
				}
			}
			else	
				$queryString = "SELECT distinct d.database_name, t.table_name, f.column_name FROM 
								table_lookup AS t, database_lookup AS d, column_fact AS f 
								WHERE t.table_id = f.table_id 
								AND f.database_id = d.database_id 
								AND f.column_name LIKE ?";					
		}
		else
			die("Could not read type.");
	
     	/* Prepare and execute the database query */	
		$stmt = $dbh->prepare($queryString);
		if ($stmt->execute(array($search . '%') ) )
		{
			/* Iterate through the resulting rows. */
			while (($row = $stmt->fetch()))
			{
				/* Put the results into the output */
				if ($type == "database") {					
					$result[] = $row['database_name'];
				}
				else if ($type == "table")
					$result[] = $row['database_name'] . "." . $row['table_name'];
				else if ($type == "column")
						$result[] = $row['database_name'] . "." . $row['table_name'] . "." . $row['column_name'];
			}
		}
	}
	 
	/* Set header to JSON and return the result as a JSON formatted string */
	header('Content-type: application/json');
	echo json_encode($result);
?>