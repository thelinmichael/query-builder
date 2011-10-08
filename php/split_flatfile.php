<?
$row = 1;
$flatfile = array();
if (($handle = fopen("..\data\columns.dat", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 0, "|")) !== FALSE) {
		$newdata = array($data[0], $data[1], $data[2]); // 0, 1, 2 should have database, table, and column data.
		array_push($flatfile, $newdata);		
    }
    fclose($handle);
}
?>
