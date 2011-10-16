<?php

   /*
	* Used during creation process.
	*
	* Creates the database containing information
	* on the structure of the data warehouse. 
	*/
 
	$testing = true;

	// Connect to MySQL database
	$connection = mysql_connect($hostname, $user, $password);
	if (!$connection) 
	{
		die('Could not connect: ' . mysql_error());
	}

	// Drop database (testing mode)
	if ($testing) 
	{
		$sql = 'DROP DATABASE ' . $dbName; 
		mysql_query($sql, $connection);
	}

	// Create and select database
	$sql = 'CREATE DATABASE ' . $dbName;	
	mysql_query($sql, $connection) or die ('Could not create database.');
	mysql_select_db($dbName) or die('Cannot select database'); 	


	// Create lookup table for databases
	$sql = 
	"CREATE TABLE database_lookup
	(
		database_id INT AUTO_INCREMENT PRIMARY KEY,
		database_name varchar(50)
	)";
	mysql_query($sql, $connection) or die("Could not create table.");		


	// Create lookup table for tables
	$sql =
	"CREATE TABLE table_lookup
	(
		table_id INT AUTO_INCREMENT PRIMARY KEY,
		table_name varchar(50)
	)";
	mysql_query($sql, $connection) or die("Could not create table.");		


	// Create fact table
	$sql = 
	"CREATE TABLE column_fact
	(
		column_id INT PRIMARY KEY,
		table_id INT,
		database_id INT,
		column_name varchar(50),
		FOREIGN KEY (database_id) REFERENCES database_lookup (database_id) ON DELETE CASCADE,
		FOREIGN KEY (table_id) REFERENCES table_lookup (table_id) ON DELETE CASCADE
	)";
	mysql_query($sql, $connection) or die("Could not create table.");		


	// Close the database connection
	mysql_close($connection);

?>