<?php

$connection = mysql_connect($hostname, $user, $password);
	if (!$connection) 
	{
		die('Could not connect: ' . mysql_error());
	}	

	// Select db.
	mysql_select_db($dbName) or die('Cannot select database'); 	

	$row = 1;
	$currentDatabaseId = 0;
	$currentTableId    = 0;		
	$currentColumnId   = 0;
	$database = NULL;
	$column = NULL;
	$table = NULL;
	if (($handle = fopen("..\data\columns.dat", "r")) !== FALSE) {
		while (($data = fgetcsv($handle, 0, "|")) !== FALSE) {
			set_time_limit(180); 
			if ($data[0] == $database)
				$samedatabase = true; // database is the same. do not check if it exists.
			else
			{
				 $database = $data[0];
				 $samedatabase = false;
				 $currentDatabaseId++;
			}
			if ($data[1] == $table)
				$sametable = true;
			else
			{
				$table = $data[1]; // table is the same. do not check if it exists.
				$sametable = false;
				$currentTableId++;
			}
			$column = $data[2];
			$currentColumnId++;

			// Insert database, table, and column into appropriate tables.
			if (!$samedatabase) // assuming that the tables and columns are not the same if the database is not the same.
			{
				$sql = "INSERT INTO database_lookup (database_name) values (\"$database\")"; 
				mysql_query($sql, $connection) or die("Could not insert database.");		
					
				$sql = "INSERT INTO table_lookup (table_name) values (\"$table\")"; 
				mysql_query($sql, $connection) or die("Could not insert table.");		
											
			}
			if ($samedatabase && !$sametable)
			{
				$sql = "INSERT INTO table_lookup (table_name) values (\"". $table . "\")"; 
				mysql_query($sql, $connection) or die("Could not insert table.");							
			}
									
			$sql = "INSERT INTO column_fact (database_id, table_id, column_id, column_name) values (\"$currentDatabaseId\",\"$currentTableId\",\"$currentColumnId\", \"$column\")";
			mysql_query($sql, $connection) or die("Could not insert into fact table.");
		}
		fclose($handle);
	}
	
	// Create indexes.
	
	$sql = "CREATE INDEX table_index ON table_lookup (table_name) USING BTREE";
	mysql_query($sql, $connection) or die("Could not create index.");
	
	$sql = "CREATE INDEX column_index ON column_fact (column_name) USING BTREE";
	mysql_query($sql, $connection) or die("Could not create index.");
	
	$sql = "CREATE INDEX database_index ON database_lookup (database_name) USING BTREE";
	mysql_query($sql, $connection) or die("Could not create index.");
	
	// Close the connection with the database.
	mysql_close($connection);
?>