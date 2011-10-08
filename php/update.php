<?php
ini_set('max_execution_time', 0);
// Database information.
$hostname = 'localhost';
$user     = 'root';
$password = 'mickemicke';
$dbName   = 'theEbayDb';

// Create a empty, local database.
require_once('create_db.php');

// Read the flatfile. 
$flatfile = array(); // Array of files.
//require_once('split_flatfile.php');

require_once('read_flatfile.php');

// Remove the smaller flat file parts.

// Populate the local database with the flatfile information.
//require_once('populate_database.php');

?>