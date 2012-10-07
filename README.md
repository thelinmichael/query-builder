## Setup process ##

1. Setup or get access to a MySQL database, and configure it according to the setup in /php/auth_details.php. 

2. Replace the mock flat file in /data/columns.dat with a flat file with database meta information. The format of the flat file should be "database name|table name|column name". For example:

garden|tree|apple
garden|tree|pear
garden|tree|orange
garden|fountain|waterlevel
house|owner|first_name
house|owner|last_name
house|owner|address

If the name of your data file is different from columns.dat, go to /php/update_read_flatfile.php and change the $filename variable value to the name of the file.

Also, if the flat file delimiter is something other than "|", change this by modifying the value of $delimiter in /php/update_read_flatfile.php.
	
3. Run /php/creation_create_db.php to create the necessary tables in the database. 

4. Run /php/populate_database.php to populate the database.
	
Done!