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
	$current_db_id 	   = 0;
	$current_table_id  = 0;		
	$current_column_id = 0;
	
	$old_db_id     = 0;
	$old_table_id  = 0;
	$old_column_id = 0;
	
	$current_database = "";
	$current_table    = "";
	$current_column   = "";	
	
	$new_db     = true;
	$new_table  = true;
	$new_column = true;
	
	/* Highest lexical values are set so that the script knows
	 * when it needs to double check that a value has already 
	 * been set in the database and should not be added again.
	 * This way, a flat file which is not in alphabetical order
	 * can still be run, but it will take much longer time to add.
	 */
	$db_highest_lexical_val     = "";
	
	/* If flat file could be read, do.. */
	if (($handle = fopen($filename, "r")) !== FALSE) {
	
		/* While there's more rows in the flatfile, do.. */
		while (($data = fgetcsv($handle, 0, $delimiter)) !== FALSE) {
		
			set_time_limit(180); 
			
			/* Check if database_name is a higher lexical value than the last highest lexical value */
			if ($data[0] > $db_highest_lexical_val) {
				$db_highest_lexical_val = $data[0]; // update the highest lexical value.				
				$current_database_id++;				// increase the number of databases by 1.
				$new_db = true;
			}
			/* Check if database_name is lower than the currently highest lexical value */
			else if ($data[0] < $db_highest_lexical_val) { 
				/* Perform check on RDMS if this database exists or not. 
				 * If it does't, set that this is a new database and increase the number if ids. 
				 * If it does, set that this is an old db so that it is not be added again.
				 * Do not change the highest lexical val in any of the cases. 
				 */
				$query_string = "SELECT * from database_lookup where database_name = \"$data[0]\"";				
				$sql_resource  = mysql_query($query_string);
					
				/* Iterate through the resulting rows. */
				$i = 0;
				while ($row = mysql_fetch_assoc($sql_resource))
					i++;
					$old_db_id = $row['database_id'];
				}
				if (i > 1)
					die("Found more than one database with the same name as this one. Databases should be unique. Aborting.");
				/* No databases with the same name were found -- this database is unique */
				else if (i == 0) {
					$current_database_id++;
					$new_db = true;
				}
				/* One database with the same name was found. This database already exists. */
				else if (i == 1) {
					$new_db = false;
				}					
			}
			/* Already added. Not new db, no new id. Do not change the id number. */
			else if ($data[0] == $db_highest_lexical_val {
				$new_db = false;				
			}			
			$current_database = $data[0];		
						
			/* Table part. 
             * Check if table name exists in the table lookup table.
             * If it does NOT, simply insert it, increase the table id and set the table as new.
             * If it does, set it as old table.			
			*/
			$query_string = "SELECT f.table_id from column_fact as f, table_lookup as t, database_lookup as d 
							 WHERE t.table_name = \"$data[1]\" AND t.table_id = f.table_id AND f.database_id = d.database_id AND d.database_name = \"$current_database\"";							 
			$sql_resource  = mysql_query($query_string);				
			
			i = 0;
			while ($row = mysql_fetch_assoc($sql_resource)) {
				$result[i++][0] = $row['table_id'];
			}			
			/* No table duplicates found. */
			if (sizeof($result) == 0) {
				$new_table = true;
				$current_table_id++;
			}
			/* Database.Table already exists. */
			else {
				$new_table = false;
				$old_table_id = $result[0][0];
			}					
			$current_table = $data[1];
				
			/* Insert data warehouse database, table, and column names into appropriate MySQL tables. */
			
			if ($new_db) 
			{
				/* Creating the database name into a lookup table, as it was not added earlier. */
				$sql = "INSERT INTO database_lookup (database_name) values (\"$database\")"; 
				mysql_query($sql, $connection) or die("Could not insert database.");		
				
				/* Inserting table name into a lookup table, as it was not added earlier. */
				$sql = "INSERT INTO table_lookup (table_name) values (\"$table\")"; 
				mysql_query($sql, $connection) or die("Could not insert table.");		
											
			}
			
			if (!$new_db && $new_table)
			{
				/* Inserting table name into a lookup table, as it was not added earlier. */
				$sql = "INSERT INTO table_lookup (table_name) values (\"". $table . "\")"; 
				mysql_query($sql, $connection) or die("Could not insert table.");							
			}
			
			/* Neither db or table were new. Must check if column is already existing inside the fact table. */
			if (!$new_db && !new_table) {
				/* Check if we are on lexical maximum. If so, just check with the current id for database and table. 
				 * Otherwise, use the old id. */
				$queryString = "SELECT column_name from column_fact where database_id = \"$old_db_id\" and table_id = \"$old_table_id\"";
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
			
			/* Inserting database id, table id, column id and column name into the fact table. */
			$sql = "INSERT INTO column_fact (database_id, table_id, column_id, column_name) values (\"$currentDatabaseId\",\"$currentTableId\",\"$currentColumnId\", \"$column\")";
			mysql_query($sql, $connection) or die("Could not insert into fact table.");
		}
		fclose($handle);
	}	
?>