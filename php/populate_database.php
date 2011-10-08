<?php
	
		
	$connection = mysql_connect($hostname, $user, $password);
	if (!$connection) 
	{
		die('Could not connect: ' . mysql_error());
	}	

	// Select db.
	mysql_select_db($dbName) or die('Cannot select database'); 	

	if (count($flatfile) == 0) die("No data in the flatfile.");
	
	// First line.
	$database = $flatfile[0][0];
	$table    = $flatfile[0][1];
	$column   = $flatfile[0][2];
	$currentDatabaseId = 1;
	$currentTableId    = 1;		
	$currentColumnId   = 1;
		
	// Insert database, table, and column into appropriate tables.
	$sql = "INSERT INTO database_lookup (database_name) values (\"". $database . "\")"; 
	mysql_query($sql, $connection) or die("Could not insert database.");		
		
	$sql = "INSERT INTO table_lookup (table_name) values (\"". $table . "\")"; 
	mysql_query($sql, $connection) or die("Could not insert table.");		
		
	$sql = "INSERT INTO column_lookup (column_name) values (\"". $column . "\")"; 
	mysql_query($sql, $connection) or die("Could not insert column.");		
		
	$sql = "INSERT INTO column_fact (column_id, table_id, database_id) values (\"$currentDatabaseId\",\"$currentTableId\",\"$currentColumnId\")";
	mysql_query($sql, $connection) or die("Could not insert into fact table.");
	
	// Rest of the lines.
	// Check if the last element in the flatfile array had the same database name or same table name as the current one.
	// If so, do not add a duplicate. If not, add a new entry into the database tables. Columns are always added, and the fact table is always updated.
	
	for ($i = 1; $i < count($flatfile)-1; $i++)
	{
		$database = $flatfile[$i][0];
		$table    = $flatfile[$i][1];
		$column   = $flatfile[$i][2];
		
		$currentColumnId++;
		
		// Insert data.
		if ($database != $flatfile[$i-1][0])	
		{
			$sql = "INSERT INTO database_lookup (database_name) values (\"". $database . "\")"; 
			mysql_query($sql, $connection) or die("Could not insert database.");	
			$currentDatabaseId++;
		}			
		
		if ($table != $flatfile[$i-1][1])	
		{
			$sql = "INSERT INTO table_lookup (table_name) values (\"". $table . "\")"; 
			mysql_query($sql, $connection) or die("Could not insert table.");	
			$currentTableId++;
		}
		
		$sql = "INSERT INTO column_lookup (column_name) values (\"". $column . "\")"; 
		mysql_query($sql, $connection) or die("Could not insert column.");		
		
		$sql = "INSERT INTO column_fact (column_id, table_id, database_id) values (\"$currentColumnId\",\"$currentTableId\",\"$currentDatabaseId\")";
		mysql_query($sql, $connection) or die("Could not insert into fact table.");
	}
?>