<?php

	/* Initializes the update process.
	 * This file is the only file that should be run to do an update. */
	
	/* The execution time of the update might take a long time - even hours. 
	 * Disabling the maximal execution time is a must, otherwise the 
     * script would time out. */
	ini_set('max_execution_time', 0);
		
	/* Authentication details.*/
	 require_once('auth_details.php');

	/* Read the flatfile and populate the database with its content. */
	require_once('flatfile_to_database.php');

	echo "Database populated successfully.";
?>