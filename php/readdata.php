<?php

// Database information.
$user = 'root';
$pass = 'mickemicke';

if (isset($_POST['search'])) { $search = $_POST['search']; }
if (isset($_POST['database'])) { $database = $_POST['database']; }
if (isset($_POST['table'])) { $table = $_POST['table']; }
if (isset($_POST['column'])) { $column = $_POST['column']; }
if (isset($_POST['type'])) { $type = $_POST['type']; }
if (isset($_POST['browse'])) { $browse = $_POST['browse']; }

if ($browse)
{
	$search = "%";
	if (isset($database)) { $database = explode(",", $database); }
	if (isset($table)) { $table = explode(",", $table); }
	if (isset($column)) { $column = explode(",", $column); }
}

$result = array();

// Some simple validation
if ($browse || is_string($search) && strlen($search) > 2 && strlen($search) < 64)
{
	$dbh = new PDO('mysql:host=localhost;dbname=theEbayDb', $user, $pass);
	
	// DATABASE
	if ($type == "database")
	{		
		$queryString = "SELECT database_name FROM database_lookup WHERE database_name LIKE ?";
		$rowname = "database_name";
	}
	// TABLE
	else if ($type == "table") 
	{
		$rowname = "table_name";
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
		
		else
			$queryString = "SELECT distinct d.database_name, t.table_name FROM table_lookup AS t, database_lookup AS d, column_fact AS f
						    WHERE t.table_id = f.table_id AND f.database_id = d.database_id AND t.table_name LIKE ?";
	}
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
		//die($queryString);
	}
	else
		die("Could not read type.");
	$stmt = $dbh->prepare($queryString);
	// The % as wildcard
	if ($stmt->execute(array($search . '%') ) )
	{
		//echo $queryString;
		// Filling the results
		while (($row = $stmt->fetch()))
		{
			// if ($browse)
			// {
				if ($type == "database")
					$result[] = $row['database_name'];
				else if ($type == "table")
					$result[] = $row['database_name'] . "." . $row['table_name'];
				else if ($type == "column")
					$result[] = $row['database_name'] . "." . $row['table_name'] . "." . $row['column_name'];
			// }
			// else	
				// $result[] = $row[$rowname];
		}
	}
}
 
// return.
header('Content-type: application/json');
echo json_encode($result);
 		
?>