<?php

	/*
	 * Reads the flat file and updates the MySQL database according to the 
	 * flat file's contents. 
	 */
	 
	 require_once('auth_details.php');
	 
	 /* Name of flat file */
	 $filename = "..\data\columns.dat";
	 
	 /* Delimiter */
	 $delimiter = "|";

	 /* Connect to the MySQL database and select the database. */
	$connection = mysql_connect($hostname, $user, $password);
	if (!$connection) 
		die('Could not connect: ' . mysql_error());	
	mysql_select_db($dbname) or die('Cannot select database'); 	

	
	/* Set start values */
	
	$row = 1;
	
	$currentDatabaseId = 0;
	$currentTableId    = 0;		
	$currentColumnId   = 0;
	
	$database = NULL;
	$column   = NULL;
	$table    = NULL;
	
	/* If flat file could be read, do.. */
	if (($handle = fopen($filename, "r")) !== FALSE) {
	
		/* While there's more rows in the flatfile, do.. */
		while (($data = fgetcsv($handle, 0, $delimiter)) !== FALSE) {
		
			set_time_limit(180); 
			
			if ($data[0] == $database)
				$samedatabase = true; 	// same database as old iteration. do not perform existance check.
			else
			{
				 $database = $data[0];	// new database. perform existance check later.
				 $samedatabase = false;
				 $currentDatabaseId++;  // add to the total amount of databases.
			}
			if ($data[1] == $table)		// table is the same. do not check if it exists.
				$sametable = true;
			else
			{
				$table = $data[1]; 		// new database. perform existance check later.
				$sametable = false;
				$currentTableId++;		// add to the total amounts of tables.
			}
			$column = $data[2];			// new column.
			$currentColumnId++;			// add to the total amounts of columns.

			
			/* Insert data warehouse database, table, and column names into appropriate MySQL tables. */
			
			if (!$samedatabase) 
			{
				/* Creating the database name into a lookup table, as it was not added earlier. */
				$sql = "INSERT INTO database_lookup (database_name) values (\"$database\")"; 
				mysql_query($sql, $connection) or die("Could not insert database.");		
				
				/* Inserting table name into a lookup table, as it was not added earlier. */
				$sql = "INSERT INTO table_lookup (table_name) values (\"$table\")"; 
				mysql_query($sql, $connection) or die("Could not insert table.");		
											
			}
			
			if ($samedatabase && !$sametable)
			{
				/* Inserting table name into a lookup table, as it was not added earlier. */
				$sql = "INSERT INTO table_lookup (table_name) values (\"". $table . "\")"; 
				mysql_query($sql, $connection) or die("Could not insert table.");							
			}
			
			/* Inserting database id, table id, column id and column name into the fact table. */
			$sql = "INSERT INTO column_fact (database_id, table_id, column_id, column_name) values (\"$currentDatabaseId\",\"$currentTableId\",\"$currentColumnId\", \"$column\")";
			mysql_query($sql, $connection) or die("Could not insert into fact table.");
		}
		fclose($handle);
	}	
?>