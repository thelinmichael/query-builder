<html>
	<head>
		<title>
			Self Service Database Webapplication
		</title>
		<script type="text/javascript" src="js/thirdparty/mootools-core-1.3.1-full-compat.js"></script>
		<script type="text/javascript" src="js/thirdparty/mootools-more-1.3.1.1.js"></script>
		<script type="text/javascript" src="js/thirdparty/raphaeljs.js"></script>
		<script type="text/javascript" src="js/thirdparty/Autocompleter.js"></script>
		<script type="text/javascript" src="js/thirdparty/Autocompleter.Local.js"></script>
		<script type="text/javascript" src="js/thirdparty/Autocompleter.Request.js"></script>
		<script type="text/javascript" src="js/thirdparty/Observer.js"></script>		
		<script type="text/javascript" src="js/thirdparty/flex-uncompressed.js"></script>		
		<script type="text/javascript" src="js/thirdparty/raphaeljs.js"></script>			
		<script type="text/javascript" src="js/domready.js"></script> 
		<link rel=stylesheet href="css/thirdparty/spinner.css">
		<link rel=stylesheet href="css/stylesheet.css">
		<link rel=stylesheet href="css/thirdparty/Autocompleter.css">
	</head>

	<body>
		
		<div id="right-sidebar">
		
			<div id="basket-header">
			</div>
		
			<div id="basket-body">
				
			</div>
			
			
		</div>
		
		<div id="content">
		
			<div id="header">

				<table id="inputContainer">
					<tr> 
							<td><div class="collection" id="databaseCollection"> </div></td>							
							<td><input id="databaseInput" type="input" name="database" title="Write the name of the database you want to use"/></td>
							<td><span class="addSelect" id="databaseAdd" name="addDatabase" title="Add this database to the databases you want to use"></span></td>						
							<td><span class="submit" id="databaseSubmit" name="submitDatabase" title="Show selected databases in the viewing window" ></span></td>
							
							<td><div class="collection" id="tableCollection"> </div></td>
							<td><input id="tableInput" type="input" name="table" title="Write the name of the table you want to use" /></td>
							<td><span class="addSelect" id="tableAdd" name="tableDatabase" title="Add this table to the tables you want to use" ></span></td>							
							<td><span class="submit" id="tableSubmit" name="submitTable" title="Show selected tables in the viewing window"></span></td>
							
							<td><div class="collection" id="columnCollection"> </div></td>
							<td><input id="columnInput" type="input" name="column" title="Write the name of the column you want to use" /></td>
										
							<td><span class="addSelect" id="columnAdd" name="addColumn" title="Add this column to the columns you want to use"></span></td>
							<td><span class="submit" id="columnSubmit" name="submitColumn" title="Show selected columns in the viewing window"></span></td>
					</tr>
					<tr>
						<td></td>
						<td class="subtitleTd"><span class="subtitle" id="first">show <span id="numChosenDatabases">all</span> databases</span></td>					
						<td></td>
						<td></td>
						
						<td></td>
						<td class="subtitleTd"><span class="subtitle" id="second"></span></td>
						
						<td></td>
						<td></td>
						<td></td>
						<td class="subtitleTd"><span class="subtitle" id="third"></span></td>
						<td></td>	
						<td></td>	
							
					</tr>
				</table>
				
			</div>
			<div id="window">
				<div id="aboveMain">
					<span id="select">check all</span> <span id="unselect">uncheck all</span> 
					<span id="withselected">with checked: </span>
					<select id="selectaction"> </select>
					<span id="performSelectAction" title="Apply changes">Apply</span>
				</div>
				
				<div id="main">
				
				</div>
				<span id="footer">
					<span id="eraseContents"> <img src="images/clear.png" /> <span id="eraseContentsText" title="Clear the window">erase contents</span> </span>
					<span id="numHits"> </span> <span id="filterInfo"> </span>
					<input type="input" value="" id="filter" name="inputFilter" />
				</span>
			</div>
		</div>
	</body>
</html>
