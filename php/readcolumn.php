<?php

// Database information.
$user     = 'root';
$pass = 'mickemicke';

$search = $_POST['search'];

$result = array();
 
// Some simple validation
if (is_string($search) && strlen($search) > 2 && strlen($search) < 64)
{
	$dbh = new PDO('mysql:host=localhost;dbname=theEbayDb', $user, $pass);

	// Building the query
	$stmt = $dbh->prepare("SELECT column_name FROM column_lookup WHERE column_name LIKE ?");
 
	// The % as wildcard
	if ($stmt->execute(array($search . '%') ) )
	{
		// Filling the results with usernames
		while (($row = $stmt->fetch() ) )
		{
           $result[] = $row['column_name'];
		}
	}
}
 
// Finally the JSON, including the correct content-type
header('Content-type: application/json');
 
echo json_encode($result);
 		
?>