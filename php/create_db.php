<?php

$connection = mysql_connect($hostname, $user, $password);
if (!$connection) 
{
    die('Could not connect: ' . mysql_error());
}

// Drop db.
$sql = 'DROP DATABASE ' . $dbName; 
mysql_query($sql, $connection);

// Create db.
$sql = 'CREATE DATABASE ' . $dbName;	
mysql_query($sql, $connection) or die ('Could not create database.');

// Select db.
mysql_select_db($dbName) or die('Cannot select database'); 	

// Create lookup tables.
$sql = "CREATE TABLE table_lookup
(
table_id INT AUTO_INCREMENT PRIMARY KEY,
table_name varchar(50)
)";
mysql_query($sql, $connection) or die("Could not create table.");		

$sql = "CREATE TABLE database_lookup
(
database_id INT AUTO_INCREMENT PRIMARY KEY,
database_name varchar(50)
)";
mysql_query($sql, $connection) or die("Could not create table.");		

// Create fact table.
$sql = "CREATE TABLE column_fact
(
column_id INT PRIMARY KEY,
table_id INT,
database_id INT,
column_name varchar(50),
FOREIGN KEY (database_id) REFERENCES database_lookup (database_id) ON DELETE CASCADE,
FOREIGN KEY (table_id) REFERENCES table_lookup (table_id) ON DELETE CASCADE
)";
mysql_query($sql, $connection) or die("Could not create table.");		

// Close the connection with the database.
mysql_close($connection);
?>