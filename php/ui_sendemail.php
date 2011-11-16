<?php

	require_once('configuration.php');
	
	$to = $admin_email;
	$subject = "Datawarehouse Request from " . $_POST['emailaddress'];
	$body = $_POST['emailaddress'] . "requesting " . $_POST['pseudoText'] . " with delivery type " . $_POST['deliverytype'] . " (" . $_POST['deliveryoption'] . ")";
	
	if (mail($to, $subject, $body)) {
		echo("Message successfully sent!");
	} else {
		echo("Message delivery failed.");
	}
?>