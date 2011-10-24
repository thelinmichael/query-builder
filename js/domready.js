/*
 * All classes belonging to the project are placed
 * in this file, below the immidiate window.addEvent('domready'
 * call.
 * 
 * All classes are using MooTools 1.3.1 javascript framework. 
 * Third party javascript is found in /js/thirdparty folder. 
 */

window.addEvent('domready', function() 
{  	
	var main = new Main();	
}); 

/*
 * Main class. 
 * Sets up the rest of the javascript functionality
 * and controls all parts of the application, such as 
 * the main window, the basket, et cetera. 
 * Parts wanting to access each other has to go through
 * the main class.
 */
var Main = new Class(
{
	initialize: function()
	{
		this.mainWindow  = new MainWindow(this);	// Window that presents the results
		this.dataHandler = new DataHandler(this);	// Handles the data 
		this.basket 	 = new Basket(this, 'basket-body'); // Basket saving the 'chosen' database objects
	
		this.setupInputs();		     // Input fields and buttons from the HTML.		
		this.setupEraseContent();	 // 'Erase content in main window'	
	},	
	
	setupInputs: function()
	{	
		/* Text input boxes */
		this.inputDatabase = new InputField(this, "databaseInput", { defaultText : "Search database(s)", dbInfo: { table : "database_lookup", column : "database_name" } }).attach();
		this.inputTable    = new InputField(this, "tableInput", { defaultText : "Search table(s)", dbInfo: { table : "table_lookup", column : "table_name" } }).attach();
		this.inputColumn   = new InputField(this, "columnInput", { defaultText : "Search column(s)", dbInfo: { table : "column_lookup", column : "column_name" } }).attach();	
		
		/* Autocompleters for the input boxes */
		new Autocompleter.Request.JSON(this, 'columnInput', 'php/ui_readdata.php', { 'postVar': 'search', 'type' : 'column'});
		new Autocompleter.Request.JSON(this, 'tableInput', 'php/ui_readdata.php', { 'postVar': 'search', 'type' : 'table'	});
		new Autocompleter.Request.JSON(this, 'databaseInput', 'php/ui_readdata.php', { 'postVar': 'search', 'type' : 'database' });
				
		/* Text links below the input boxes */		
		this.databaseBrowse = new BrowseButton(this, 'database', 'first').attach();
		this.tableBrowse = new BrowseButton(this, 'table', 'second').attach();	
		this.columnBrowse = new BrowseButton(this, 'column', 'third').attach();
		
		/* Container showing the chosen database objects (left of the input boxes) */
		this.databaseCollection = new DatabaseElementContainer(this, 'databaseCollection', 'collectionFooterDatabase', this.tableBrowse);
		this.tableCollection    = new DatabaseElementContainer(this, 'tableCollection', 'collectionFooterTable', this.columnBrowse);
		this.columnCollection   = new DatabaseElementContainer(this, 'columnCollection', 'collectionFooterColumn', null);
				
		/* Button for adding the database object in the input box to the container  */		
		this.databaseAdd = new CollectionAdd(this, this.databaseCollection, this.inputDatabase, 'databaseAdd').attach();
		this.tableAdd    = new CollectionAdd(this, this.tableCollection, this.inputTable, 'tableAdd').attach();
		this.columnAdd   = new CollectionAdd(this, this.columnCollection, this.inputColumn, 'columnAdd').attach();
		
		/* Button for submitting the chosen database objects in the container and showing them in the main window */
		this.submitDatabase = new Submit(this, this.databaseCollection, 'database', 'databaseSubmit').attach();
		this.submitTable = new Submit(this, this.tableCollection, 'table', 'tableSubmit').attach();
		this.submitColumn = new Submit(this, this.columnCollection, 'column', 'columnSubmit').attach();
		
		/* Element which states the number of search hits. */
		this.numHits = $('numHits');
	},
	
	/* Get values in the input boxes */
	getDatabaseValue: function() { return this.inputDatabase.getValue(); },
	getTableValue: function()    { return this.inputTable.getValue(); },
	getColumnValue: function()   { return this.inputColumn.getValue(); },
	
	/* 
	 * Get all chosen databases 
     * @return Array<String>	 
	 */ 
	getDatabaseValues: function() 
	{
		var returnArray = new Array();
		Array.each(this.databaseCollection.getValues(), function(value)
		{
			returnArray.push(value.getName());
		});
		return returnArray;
	},
	
	/* 
	 * Get all chosen tables 
     * @return Array<String>	 
	 */ 
	getTableValues: function() 
	{ 
		var returnArray = new Array();
		Array.each(this.tableCollection.getValues(), function(value)
		{
			returnArray.push(value.getName());
		});
		return returnArray;
	},
	
	/* 
	 * Get all chosen columns 
     * @return Array<String>	 
	 */ 
	getColumnValues: function() 
	{ 
		var returnArray = new Array();
		Array.each(this.columnCollection.getValues(), function(value)
		{
			returnArray.push(value.getName());
		});
		return returnArray;
	},
	
	/* 
	 * Search the database for objects matching the user inputs
	 * @param String type The type of the data to be read; database, table or column.
	 * @param notContainer boolean If the input comes from the submit button, true.
     *                             From the browse button, false.   
	 */
	readData: function(type, notContainer)
	{
		try 
		{
			data = { "type" : type, "database" : this.getDatabaseValues(), "table" : this.getTableValues(), "column" : this.getColumnValues()};
			if (notContainer)
				data.notcontainer = 1;
			else 
				data.notcontainer = 0;
				
			this.mainWindow.setType(type);										 // Let the main window know which type.
			this.dataHandler.readData(data, this.setQueryResult.bind(this));     // Send data and set the call back function 
		}
		catch(e) { throw new Error("Could not fetch data: " + e.message); }
	},
	
	/*
	 * Show database objects in the main window, show number of objects.
	 * @param DatabaseElementContainer collection A collection of database objects
	 * @param String type The type of database object (database, table, column)
	 */
	showData: function(collection, type)
	{	
		var showArray = new Array();
		this.mainWindow.setType(type);
		
		Array.each(collection.getValues(), function(collectionElement)
		{	
			if (type == "database")
			{
				data = collectionElement.name;
			}
			else if (type == "table")
			{
				splitString = collectionElement.title.split(' ');
				data = splitString[1] + '.' + collectionElement.name;
			}
			else if (type == "column")
			{
				splitString = collectionElement.title.split(' ');
				data = splitString[1] + '.' + splitString[3] + '.' + collectionElement.name;
			}
			showArray.push(data);
		});
		this.numHits.set("text", showArray.length + " hit(s).");
		this.mainWindow.massageData(showArray);
	},
	
	/* 
	 * Callback function when results have been received from the MySQL database 
	 * Send data to main window for display. Display number of database objects.
	 * @param String result JSON encoded result
	 */
	setQueryResult: function(result)
	{
		result = JSON.decode(result);	
		this.numHits.set("text", result.length + " hit(s).");
		this.mainWindow.massageData(result);
	},	
	
	/* Erase contents in the main window */		
	setupEraseContent: function() 
	{
		this.eraseContents = $('eraseContents');
		$(this.eraseContents).addEvents(
		{
			"mouseenter" : function() { $('eraseContentsText').setStyle("text-decoration", "underline"); $(this.eraseContents).setStyle("cursor", "pointer"); }.bind(this),
			"mouseleave" : function() { $('eraseContentsText').setStyle("text-decoration", "none"); $(this.eraseContents).setStyle("cursor", "default"); }.bind(this),
			"click" : function() { 
				this.numHits.set("text", ""); 
				this.mainWindow.clean(); 
				this.mainWindow.resetFilterInfo(); 
				this.mainWindow.selectBox.reset();					
			}.bind(this)
		});
	},
});

/* The main window where database objects are presented. */
var MainWindow = new Class(
{
	Implements: Options,
	options: 
	{ 
		"maxHits" : 100000, 
		"type"    : null,
	},
	/* 
	 * @param Main main The main object 
	 * @param Options options The object options
	 */
	initialize: function(main, options)
	{
		this.setOptions(options);
		this.main = main;

		this.rows = new Array();						
		this.setupDomElements();
		this.attach();
	},	
	
	setupDomElements: function() 
	{	
		this.element     = $('main');
		this.selectAll   = $('select');
		this.unselectAll = $('unselect');				
		this.filter      = new Filter('filter', this);
		this.filterInfo  = $('filterInfo');
		this.spinner     = new Spinner($(this), { message: "Fetching results from database...", class : "spinner" } );
		this.selectBox   = new SelectAction(this, 'selectaction');	
	},
	
	/* Change the HTML of this DOM element */
	setHtml: function(html) { $(this).set("html", html); },
	
	/* Uncheck the checked database objects in the main window */
	resetChecked: function()
	{
		Array.each(this.rows, function(row)
		{
			if (row.isChecked())
				row.check(false);
		}.bind(this));	
	},
	
	/*
	 * Select or deselect the checked database objects.
     * @param boolean doSelect Select all checked database objects which are checked if true. 
	 *                         Deselect all checked database objects false if false.
	 */
	selectChecked: function(doSelect)
	{
		var collection;
		
		/* Check type of objects in the main window and set which type of collection is getting (de)seleted */
		if (this.getType() == "database") 
			collection = this.main.databaseCollection;	
		else if (this.getType() == "table")
			collection = this.main.tableCollection;
		else if (this.getType() == "column")
			collection = this.main.columnCollection;
		else
			throw new Error("Could not identify type.");
		
		/* Add checked database objects to the collection of selected objects */
		if (doSelect)
		{
			Array.each(this.rows, function(row)
			{
				if (row.isChecked())
					collection.add(new DatabaseElement(collection, row.data));
			}.bind(this));			
		}
		/* Deselect checked database objects from the collection of selected objects */
		else
		{
			Array.each(this.rows, function(row)
			{
				if (row.isChecked())	 
					collection.removeJustText(row.data);
			}.bind(this));			
		}
	},
	
	/* Start and stop the spinner, shown when loading content */ 
	startSpinner: function() { this.spinner.show(); },	
	stopSpinner:  function() { this.spinner.hide(); },
	
	/* 
	 * Handle data received by the main window.
	 * Put the data into the rows of the main window.
	 * @param Array<>
	 */
	massageData: function(dataArray)
	{	
		if (typeOf(dataArray) == "null") throw Error("dataArray not set -- No input to main window.");
		if (typeOf(this.getType()) == "null") throw Error("Type not set when massaging data."); 
					
		this.rows.empty();		
		this.clean();
		this.resetFilterInfo();
		this.filter.reset();
		
		this.selectBox.setOptionType(this.getType());
		
		if (dataArray.length > this.options.maxHits) 
		{
			throw new Error("Too many hits.");
		}
		Array.each(dataArray, function(data) 
		{
			if (this.getType() == "database") 
				this.rows.push(new DatabaseRow(this, data, this.main.databaseCollection));	
			else if (this.getType() == "table")
				this.rows.push(new TableRow(this, data, this.main.tableCollection));
			else if (this.getType() == "column")
				this.rows.push(new ColumnRow(this, data, this.main.columnCollection));
		}.bind(this));
		Array.each(this.rows, function(row)
		{	
			$(row).inject($(this));
		}.bind(this));
	},
	
	clean: function() { $(this).getChildren().destroy(); },
	
	attach: function()
	{
		$(this.selectAll).addEvents(
		{
			'mouseenter' : function() { $(this.selectAll).setStyles({ cursor : "pointer", "text-decoration" : "underline" }); }.bind(this),
			'mouseleave' : function() { $(this.selectAll).setStyles({ cursor : "default", "text-decoration" : "none" } ); }.bind(this),
			'click' : function() {
				Array.each(this.rows, function(row)
				{
					if ($(row).getStyle("display") != "none")
						row.check(true);
				}.bind(this));
			}.bind(this)
		});
		
		$(this.unselectAll).addEvents(
		{
			'mouseenter' : function() { $(this.unselectAll).setStyles({ cursor : "pointer", "text-decoration" : "underline" }); }.bind(this),
			'mouseleave' : function() { $(this.unselectAll).setStyles({ cursor : "default", "text-decoration" : "none" } ); }.bind(this),
			'click' : function() {
				Array.each(this.rows, function(row)
				{
					if ($(row).getStyle("display") != "none")
						row.check(false);
				}.bind(this));
			}.bind(this)
		});
		
	},
	
	detach: function() {},
	
	/* Reset the filter text to an empty string */
	resetFilterInfo: function() { this.filterInfo.set("text", ""); },
		
	/* 
	 * Set the number of objects after filtering database object names
     * @param int num The number of objects after filtering	 
	 */
	updateFilterInfo: function(num) { this.filterInfo.set("text", "(" + num + " after filtering)"); },
	
	toElement: function() { return this.element; },
	
	/* Get and set methods */
	setType: function(type) { this.setOptions({ "type" : type }); },
	getType: function()     { return this.options.type; }
});

/* Controlling which options are available to do with checked row objects */
var SelectAction = new Class(
{
	/*
	 * @param MainWindow mainWindow The main window
	 * @param String elementId the DOM elementId 
	 */
	initialize: function(mainWindow, elementId)
	{
		this.element = $(elementId);
		this.mainWindow = mainWindow;
		this.performOptions = new Array();
		this.performAction = $('performSelectAction');
		this.setOptionType("none");		
		this.attach();
	},
	
	attach: function() 
	{
		$(this.performAction).addEvents(
		{
			'mouseenter' : function() { $(this.performAction).setStyles({ 'background-color' : '#666', 'cursor': 'pointer' }); }.bind(this),
			'mouseleave' : function() { $(this.performAction).setStyles({ 'background-color' : '#888', 'cursor': 'default' }); }.bind(this),
			'click' : function() { this.perform(); }.bind(this)
		});
	},
	detach: function() {},
	
	/* Reset the type of the drop down menu. */
	reset: function() { this.setOptionType("none"); },
	
	addPerformOption: function(option)
	{
		$(option).inject($(this));
		this.performOptions.push(option);
	},
	
	/* Remove an option from the drop down menu. 
	 * @param ActionOption option An option in the drop down menu. */
	removePerformOption: function(option)
	{
		this.performOptions.erase(option);
		$(option).destroy();
	},
	
	/* Remove all the options in the drop down menu. */
	removeAllPerformOptions: function()
	{
		var i;
		for (i = 0; i < this.performOptions.length; i++)
		{	
			this.removePerformOption(this.performOptions[i]);
			i--;
		}	
	},
	
	/* 
	 * Set the options in the drop down menu above the main window,
	 * which determines what to do with checked objects.
	 * @param String type The type of the database object
	 */
	setOptionType: function(type)
	{
		
		/* No type is given, happens at start. Removing all options. */
		this.removeAllPerformOptions();  
		
		if (type == "none") { }
		
		else if (type == "database")
		{
			this.addPerformOption(new AddToSelected(this));
			this.addPerformOption(new RemoveFromSelected(this));
		}
		else if (type == "table")
		{
			this.addPerformOption(new AddToSelected(this));
			this.addPerformOption(new RemoveFromSelected(this));			
		}
		else if (type == "column")
		{
			this.addPerformOption(new AddToSelected(this));
			this.addPerformOption(new RemoveFromSelected(this));
			this.addPerformOption(new AddToBasket(this));
			this.addPerformOption(new RemoveFromBasket(this));
		}
		else
			throw new Error("Could not perform action. Could not identify type.");
	},
	
	/* Get the value of the drop down menu which is selected.
	 * @return String The value in the drop down menu which is selected.
	 */
	getSelected: function()
	{
		var selectedValue = null;
		Array.each(this.performOptions, function(performOption)
		{
			if ($(this).get("value") == $(performOption).get("value"))
			{
				selectedValue = performOption;
				return;
			}
		}.bind(this));
		if (!selectedValue)
			throw new Error("No value was selected.");
		return selectedValue;
	},
	
	/* Perform action to database objects in the main window.
	   Action is chosen in the drop down select menu. 
	   Also set the checked boxes to unchecked. */
	perform: function()
	{
		this.getSelected().doAction();
		this.mainWindow.resetChecked();
	},
	
	toElement: function() { return this.element; },
});

/*
 * TODO -- Parent class
 */
var ActionOption = new Class(
{
	initialize: function(selectParent)
	{
		this.selectParent = selectParent;
		this.element = new Element('option');
		this.setupDomElements();
	},
	
	toElement: function() { return this.element; },

});

/* Action to do with checked rows -- adds all checked row objects to the collection of selected objects */
var AddToSelected = new Class(
{
	Extends: ActionOption,
	initialize: function(selectParent)
	{
		this.parent(selectParent);
	},
	
	setupDomElements: function()
	{
		$(this).set("value", "AddToSelected");
		$(this).set("text", "Add to selected");
	},	
	
	doAction: function()
	{
		this.selectParent.mainWindow.selectChecked(true);
	},
});

/* Action to do with checked rows -- removes all checked row objects from the collection of selected objects */
var RemoveFromSelected = new Class(
{
	Extends: ActionOption,
	initialize: function(selectParent)
	{
		this.parent(selectParent);
	},
	
	setupDomElements: function()
	{
		$(this).set("value", "RemoveFromSelected");
		$(this).set("text", "Remove from selected");
	},	 
	
	doAction: function()
	{
		this.selectParent.mainWindow.selectChecked(false);
	},
});

/* Adds all checked objects to the basket */
var AddToBasket = new Class(
{
	Extends: ActionOption,
	initialize: function(selectParent)
	{
		this.parent(selectParent);
	},
	
	setupDomElements: function()
	{
		$(this).set("value", "AddToBasket");
		$(this).set("text", "Add to basket");
	},	
	
	doAction: function()
	{
		this.selectParent.mainWindow.toBasketChecked(true);
	},
});

/* Removes all checked objects from the basket. */
var RemoveFromBasket = new Class(
{
	Extends: ActionOption,
	initialize: function(selectParent)
	{
		this.parent(selectParent);
	},
	
	setupDomElements: function()
	{
		$(this).set("value", "RemoveFromBasket");
		$(this).set("text", "Remove from basket");
	},	
	
	doAction: function()
	{
		this.selectParent.mainWindow.toBasketChecked(false);
	},
});

/*
 * Filtering the objects in the main window
 * TODO. Set CSS classes instead of display options here.
 */
var Filter = new Class(
{
	Implements: Options,
	options:
	{
		defaultText  : 'Filter hit(s)',
		colour       : '#bbb',
	},
	/*
	 * @param String elementId The DOM element id 
	 * @param MainWindow mainWindow The main window
	 * @param Options options The object options
	 */
	initialize: function(elementId, mainWindow, options)
	{
		this.setOptions(options);
		this.mainWindow = mainWindow;
		this.elementId  = elementId;
		
		this.setupDomElements(); 
		this.attach();
	},
	
	setupDomElements: function() 
	{	
		this.element = $(this.elementId);
		$(this).setStyle("color", this.options.colour);
		$(this).set("value", this.options.defaultText);
	},
		
	attach: function()
	{
		$(this).addEvents(
		{
			blur: function()
			{	
				$(this).setStyle("color", "#bbb");
				$(this).setStyles({
					"border-color" : "#DDD",
					"border-width" : "2px",
					"border-style" : "solid"
				});
				if ($(this).get("value") == "")
					$(this).set("value", this.options.defaultText);
			}.bind(this),
			focus: function()
			{
				$(this).setStyle("color", "#000");
				$(this).setStyles({
					"border-color" : "73A6FF",
					"border-width" : "2px",
					"border-style" : "solid"
				});
				if ($(this).get("value") == this.options.defaultText)
					$(this).set("value", "");
			}.bind(this),
			keyup: function()
			{
				if ($(this).get("value").length >= 1)
				{
					this.filter();
				}
				else if ($(this).get("value").length == 0)
				{
					Array.each(this.mainWindow.rows, function(row)
					{
						row.show();
					}.bind(this));
					this.mainWindow.resetFilterInfo();
				}
				
			}.bind(this),
		});
	},	

	/* Reset the text in the filter */
	reset: function() { $(this).set("value", this.options.defaultText); },

	/* Execute filtering among the rows in the main window */
	filter: function()
	{
		input = $(this).get("value").toLowerCase();
		var afterFilter = 0;
		Array.each(this.mainWindow.rows, function(row)
		{
			if (!row.data.toLowerCase().contains(input))
				row.hide(); 
			else
			{
				row.show();
				afterFilter++;
			}			
		}.bind(this));
		this.mainWindow.updateFilterInfo(afterFilter);
	},
	
	toElement: function() { return this.element; },
});

/* 
 * Parent class for all database objects in the main window rows 
 */ 
var Row = new Class(
{
	/* 
	 * @param MainWindow parentMainWindow The main window containing the row
	 * @param Object data TODO
	 * @param TODO
	 */
	initialize: function(parentMainWindow, data, collection)
	{
		this.parentMainWindow = parentMainWindow;
		this.data = data;
		this.collection = collection;
	},
	
	detach: function() { $(this).removeEvents(); },
	
	/* TODO */
	isInFilter: function()
	{
		if (this.collection.getValues().contains(this.data))
			return true;
		else
			return false;
	},
	
	/* Show or hide the row */
	show: function() { $(this).setStyle("display", "block"); },
	hide: function() { $(this).setStyle("display", "none"); },
	
	/* Check or uncheck the checkbox on the row 
	 * @param boolean Checkthis True if row will be checked, false if row will be unchecked
	 */
	check: function(checkThis) { $(this.checkbox).set("checked", checkThis); },
	
	/* @return boolean True if the row checkbox is checked, false if not. */
	isChecked: function() { return ($(this.checkbox).get("checked")); },
	
	toElement: function() { return this.element; },
});

/* A row in the main window, representing a database. */
var DatabaseRow = new Class(
{
	Extends: Row,
	/*
	 * @param MainWindow parentMainWindow The main window containing the row 
	 * TODO...
	 */
	initialize: function(parentMainWindow, data, collection)
	{
		this.parent(parentMainWindow, data, collection);
		this.setupDomElements();
		this.attach();
		this.loaded = false;
	},
	
	setupDomElements: function()
	{
		this.element   = new Element('div', { 'class' : 'Row' });		
		this.headerDiv = new Element('div');
		this.checkbox  = new Element('input', { 'type' : 'checkbox' });
		this.name      = new Element('span', { 'class' : 'RowDatabase', 'text' : this.data });
	
		$(this.headerDiv).inject($(this));	
		$(this.checkbox).inject($(this.headerDiv));
		$(this.name).inject($(this.headerDiv));
	},
	
	attach: function() { },
	detach: function() { },	
});

/* A row in the main window, representing a table. */
var TableRow = new Class(
{
	Extends: Row,
	initialize: function(parentMainWindow, data, collection)
	{	
		this.parent(parentMainWindow, data, collection);
		
		var dataBreakdown = this.data.split('.');
		this.database = dataBreakdown[0];
		this.table = dataBreakdown[1];	
		this.loaded = false;		
		this.setupDomElements();
		this.spinner = new Spinner($(this.basketDiv), { message: "Fetching tables from database...", class : "spinner" } );
		this.attach();		
	},
	
	setupDomElements: function()
	{
		this.element = new Element('div', { 'class' : 'Row' });		
		
		this.headerDiv = new Element('div');
		this.basketDiv = new Element('div', { 'class' : 'BasketDiv' } );
		
		this.checkbox = new Element('input', { 'type' : 'checkbox' });
		this.databaseColumn = new Element('span', { 'class' : 'RowDatabase', 'text' : this.database } );
		this.name = new Element('span', { 'class' : 'RowTable', 'text' : this.table });	

		$(this.headerDiv).inject($(this));
		$(this.basketDiv).inject($(this));
		
		$(this.checkbox).inject($(this.headerDiv));
		$(this.databaseColumn).inject($(this.headerDiv));
		$(this.name).inject($(this.headerDiv));
		$(this.basketDiv).setStyle("display", "none");
	},
	
	attach: function() {},
	detach: function() {},
	
	showBasket: function()
	{
		if ($(this.basketDiv).getStyle("display") == "none")
		{
			$(this.basketDiv).setStyle("display", "block");
			if (!this.loaded)
			{
				var data = 
				{
					"database" : this.data,
					"type" : "column",
					"notcontainer" : 1
				};			
				this.spinner.show();
				this.parentMainWindow.main.dataHandler.readData(data, this.handleResults.bind(this));		
			}
			this.loaded = true;
			
		}
		else
		{
			$(this.basketDiv).setStyle("display", "none");
		}
	},
	
	/*
	 * @param TODO
	 */
	handleResults: function(result)
	{
		this.spinner.hide();	
	}	
});

/** 
 * A column row in the main window
 */
var ColumnRow = new Class(
{
	Extends: Row,
	/* @param MainWindow parentMainWindow  
	 * @param TODO data 
	 * @param TODO collection
	 */
	initialize: function(parentMainWindow, data, collection)
	{
		this.parent(parentMainWindow, data, collection);
		
		var dataBreakdown = this.data.split('.');
		this.database = dataBreakdown[0];
		this.table = dataBreakdown[1];
		this.column = dataBreakdown[2];
		
		this.setupDomElements();
		this.attach();
		this.updateAddRemove();
	},

	setupDomElements: function()
	{
		this.element = new Element('div', { 'class' : 'Row' });		
		
		this.headerDiv = new Element('div');
		this.checkbox = new Element('input', { 'type' : 'checkbox' });
		this.databaseColumn = new Element('span', { 'class' : 'RowDatabase', 'text' : this.database });
		this.tableColumn = new Element('span', { 'class' : 'RowDatabase', 'text' : this.table });
		this.name = new Element('span', { 'class' : 'RowColumn', 'text' : this.column });
		
		this.basketDiv = new Element('div', { 'class' : 'BasketDiv' } );
		
		$(this.headerDiv).inject($(this));
		$(this.basketDiv).inject($(this));
		
		$(this.checkbox).inject($(this.headerDiv));
		$(this.databaseColumn).inject($(this.headerDiv));
		$(this.tableColumn).inject($(this.headerDiv));
		$(this.name).inject($(this.headerDiv));
		
		$(this.basketDiv).setStyle("display" , "none");		
		
		this.conditionsDiv = new Condition(this);
		this.addDiv = new Element('div', { 'class' : 'ColumnAdd'  });
		
		$(this.conditionsDiv).inject($(this.basketDiv));
		$(this.addDiv).inject($(this.basketDiv));
		
		this.addButton = new Element('span', { 'class' : 'ColumnRowButton', 'text' : 'Add to basket' });
		this.removeButton = new Element('span', { 'class' : 'ColumnRowButton', 'text' : 'Remove from basket' });
		$(this.addButton).inject($(this.addDiv));
		$(this.removeButton).inject($(this.addDiv));
		
		this.updateAddRemove();
	},

	attach: function()
	{	
		$(this.name).addEvents(
		{
			'mouseenter': function()
			{
				$(this.name).setStyle("cursor" ,  "pointer" );
			}.bind(this),
			'mouseleave': function()
			{
				$(this.name).setStyle("cursor" , "default");
			}.bind(this),
			'click': function()
			{	
				this.toggleBasket();
			}.bind(this)
		});
		$(this.addButton).addEvents(
		{
			'mouseenter': function()
			{
				$(this.addButton).setStyle("cursor" ,  "pointer" );
				$(this.addButton).setStyle("text-decoration" ,  "underline" );
			}.bind(this),
			'mouseleave': function()
			{
				$(this.addButton).setStyle("cursor" , "default");
				$(this.addButton).setStyle("text-decoration" ,  "none" );
			}.bind(this),
			'click': function()
			{	
				this.parentMainWindow.main.basket.addItem(this.data);
				this.updateAddRemove();
			}.bind(this)
		});
		$(this.removeButton).addEvents(
		{
			'mouseenter': function()
			{
				$(this.removeButton).setStyle("cursor" ,  "pointer" );
				$(this.removeButton).setStyle("text-decoration" ,  "underline" );
			}.bind(this),
			'mouseleave': function()
			{
				$(this.removeButton).setStyle("cursor" , "default");
				$(this.removeButton).setStyle("text-decoration" ,  "none" );
			}.bind(this),
			'click': function()
			{	
				this.parentMainWindow.main.basket.removeItem(this.data);
				this.updateAddRemove();
			}.bind(this)
		});
	},
	
	updateAddRemove: function()
	{
		/* Check if this part is already in the basket. */
		this.isInBasket = this.parentMainWindow.main.basket.isInBasket(this.data);
		
		/* Put remove-button if already in the basket */
		if (this.isInBasket)
		{
			$(this.addButton).setStyle("display", "none");
			$(this.removeButton).setStyle("display", "inline");
		}
		/* Put add-button if not in the basket */
		else
		{
			$(this.removeButton).setStyle("display", "none");
			$(this.addButton).setStyle("display", "inline");
		}
	},
	
	toggleBasket: function()
	{	if ($(this.basketDiv).getStyle("display") == "none")
			$(this.basketDiv).setStyle("display" ,"block");
		else
			$(this.basketDiv).setStyle("display" ,"none");
	},
});

/* Condition in the Main window, column view */
var Condition = new Class(
{
	initialize: function()
	{
		this.element = new Element('div', { 'class' : 'Conditions' });
		this.setupDomElements();
		this.attach();
	},
	
	setupDomElements: function()
	{
		this.conditionHeaderDiv = new Element('div', { 'class' : 'conditionHeaderDiv' });
		this.conditionHeader = new Element('span', { 'id' : 'ConditionHeader', 'text' : 'Conditions' });
		//this.conditionHeaderHelp = new Element('span', { 'id' : 'ConditionHeaderHelp' ,'text' :  'Conditions for wanted value. (WHERE or HAVING)' });
		
		this.selection = new Selection(this);
		
		this.anotherBox = new Element('div', { 'class' : 'AnotherBox' });
		this.addOrAnotherBox = new Element('span', { 'class' : 'AndOr', 'text' : 'Or' });
		this.addAndAnotherBox = new Element('span', { 'class' : 'AndOr', 'text' : 'And' });
		
		$(this.conditionHeaderDiv).inject($(this));
		$(this.conditionHeader).inject($(this.conditionHeaderDiv));
		//$(this.conditionHeaderHelp).inject($(this.conditionHeaderDiv));
		
		$(this.selection).inject($(this));		

		$(this.anotherBox).inject($(this));
		$(this.addOrAnotherBox).inject($(this.anotherBox));
		$(this.addAndAnotherBox).inject($(this.anotherBox));		
	},
	
	attach: function()
	{
		$(this.addOrAnotherBox).addEvents(
		{
			"mouseenter" : function()
			{
				$(this.addOrAnotherBox).setStyles(
				{
					"cursor" : "pointer",
					"text-decoration" : "underline"
				});
			}.bind(this),
			"mouseleave" : function()
			{
				$(this.addOrAnotherBox).setStyles(
				{
					"cursor" : "default",
					"text-decoration" : "none"
				});
			}.bind(this),
			"click" : function()
			{
				console.log("Add or.");
			}
		});
		$(this.addAndAnotherBox).addEvents(
		{
			"mouseenter" : function()
			{
				$(this.addAndAnotherBox).setStyles(
				{
					"cursor" : "pointer",
					"text-decoration" : "underline"
				});
			}.bind(this),
			"mouseleave" : function()
			{
				$(this.addAndAnotherBox).setStyles(
				{
					"cursor" : "default",
					"text-decoration" : "none"
				});
			}.bind(this),
			"click" : function()
			{
				console.log("Add And.");
			}
		});
	},
	
	toElement: function() { return this.element; },
});

var Selection = new Class(
{
	initialize: function(parentCondition)
	{
		this.parentCondition = parentCondition;
		this.setupDomElements();
		this.attach();
	},
	
	setupDomElements: function()
	{
		this.element = new Element('div', { 'class' : 'SelectDiv' });	
		this.select = new Element('select', { 'class' : 'conditionSelect' });
		this.optionsArray = new Array();
		
		this.optionsArray.push(new Element('option', { 'value' : 'No condition (choose all)', 'text' : 'No condition (choose all)' }));
		this.optionsArray.push(new Element('option', { 'value' : 'Begins with text', 'text' : 'Begins with text' }));
		this.optionsArray.push(new Element('option', { 'value' : 'Ends with text', 'text' : 'Ends with text' }));
		this.optionsArray.push(new Element('option', { 'value' : 'Contains text', 'text' : 'Contains text' }));
		this.optionsArray.push(new Element('option', { 'value' : '> (more than)', 'text' : '> (more than)' }));
		this.optionsArray.push(new Element('option', { 'value' : '< (less than)', 'text' : '< (less than)' }));
		this.optionsArray.push(new Element('option', { 'value' : '>= (more or equal to)', 'text' : '>= (more or equal to)' }));
		this.optionsArray.push(new Element('option', { 'value' : '<= (less or equal to)', 'text' : '<= (less or equal to)' }));
		this.optionsArray.push(new Element('option', { 'value' : '== (equal to)', 'text' : '== (equal to)' }));
		this.optionsArray.push(new Element('option', { 'value' : '!= (not equal to)', 'text' : '!= (not equal to)' }));
		
		Array.each(this.optionsArray, function(option)
		{
			$(option).inject($(this.select));
		}.bind(this));
		
		this.conditionInputBox = new Element('input', { 'class' : 'ConditionInput', 'type' : 'input', 'name' : 'ConditionInput' });
		this.addOr = new Element('span', { 'class' : 'AndOr', 'text' : 'Or' });
		this.addAnd = new Element('span', { 'class' : 'AndOr', 'text' : 'And' });
		
		$(this.select).inject($(this));
		$(this.conditionInputBox).inject($(this));
		$(this.addOr).inject($(this));
		$(this.addAnd).inject($(this));				
	},
	
	attach: function() 
	{ 
		$(this.addOr).addEvents(
		{
			"mouseenter" : function()
			{
				$(this.addOr).setStyles(
				{
					"cursor" : "pointer",
					"text-decoration" : "underline"
				});
			}.bind(this),
			"mouseleave" : function()
			{
				$(this.addOr).setStyles(
				{
					"cursor" : "default",
					"text-decoration" : "none"
				});
			}.bind(this),
			"click" : function()
			{
				console.log("Add or.");
			}
		});
		$(this.addAnd).addEvents(
		{
			"mouseenter" : function()
			{
				$(this.addAnd).setStyles(
				{
					"cursor" : "pointer",
					"text-decoration" : "underline"
				});
			}.bind(this),
			"mouseleave" : function()
			{
				$(this.addAnd).setStyles(
				{
					"cursor" : "default",
					"text-decoration" : "none"
				});
			}.bind(this),
			"click" : function()
			{
				console.log("Add And.");
			}
		});
	},
	
	toElement: function() { return this.element; },
});
	
/* Reads data from the MySQL server, and posts changes to the rest of the application */ 
var DataHandler = new Class(
{
	initialize: function(main)
	{	
		this.main = main;
	},
	
	/*
  	 * Read data from the MySQL server and to send it on.
	 * @param TODO data
	 * @param function returnFunction The function to run after receiving a response from the MySQL server 
	 */
	readData: function(data, returnFunction) 
	{
		var postVariable = "notcontainer=" + data.notcontainer + "&search=" + data.search + "&type=" + data.type + "&database=" + data.database + "&table=" + data.table + "&column=" + data.column + "&browse=1";
		
		var that = this;
		var readRequest = new Request(
		{
			
			url: "php/ui_readdata.php", 
			method: 'post',
			onRequest: function() 
			{
				that.main.mainWindow.startSpinner();
				//console.log("System: Reading data from file..");
			},
			onComplete: function(result) 
			{
				that.main.mainWindow.stopSpinner();
				//console.log("System: Reading complete. Managing results..");		
				//this.sendResultsToMain(result);
				returnFunction(result);
			}.bind(this),
			onSuccess: function() 
			{
				//console.log("Success!");
			},
			onError: function() 
			{ 
				throw Error("Error during read request in domready.js.");
			}
		});
		readRequest.send(postVariable);
	},
	
	/* Set the query result
	 * @param String result  */
	sendResultsToMain: function(result) { this.main.setQueryResult(result); },	
});

/* Inputfield */	
var InputField = new Class(
{
	Implements: Options,
	options: 
	{
		idle    : 'idleField',
		focus   : 'focusField',
		dbInfo  : null,
		defaultText : ''
	},
	
	/* @param Main The main object of this program
	 * @param String elementId TODO
	 * @param Options options TODO
	 */
	initialize: function(main, elementId, options)
	{
		this.setOptions(options);
		this.main = main;
		this.element = $(elementId);
		$(this).addClass(this.options.idle);
		$(this).set("value", this.options.defaultText);
		
		return this;
	},
	
	attach: function()
	{
		$(this).addEvents(
		{
			focus: function()
			{
				$(this).removeClass(this.options.idle);
				$(this).addClass(this.options.focus);
				if ($(this).get("value") == this.options.defaultText)
				{
					$(this).set("value", '');
				}
				else
				{
					$(this).select();
				}
			}.bind(this),
			blur: function()
			{
				$(this).removeClass(this.options.focus);
				$(this).addClass(this.options.idle);
				
				if ($(this).get("value").trim() == "")
					$(this).set("value", this.options.defaultText);
			}.bind(this),
		});
		return this;
	},
	
	getValue: function()
	{
		if ($(this).get("value") == this.options.defaultText)
			return "";
		else
			return $(this).get("value");
	},
	
	fetchResults: function()
	{
		if (!this.options.dbInfo)
			throw new Error("Cannot try to fetch data. No table or column has been set.");
		this.main.getData(this.options.dbInfo.table, this.options.dbInfo.column, $(this).get("value"));		
	},
	
	toElement: function() { return this.element; },	
});

/* Display database objects in the main window, matching whatever is selected 
 * in the database structure one step up. For example, displays all columns for
 * two specific, selected tables. For databases, all of them are shown in the 
 * main window.
 */
var BrowseButton = new Class(
{
	/*
	 * @param Main main The main class
	 * @param String type The type of the database object (database, table, column, none).
	 * @param String elementId The DOM element id for this element
	 */
	initialize: function(main, type, elementId)
	{
		this.element = $(elementId);
		this.main = main;
		this.type = type;
		return this;
	},
	
	attach: function()
	{
		$(this).addEvents(
		{
			'mouseenter': function()
			{
				$(this).setStyle("cursor", "pointer");
				$(this).setStyle("text-decoration", "underline");
				
			}.bind(this),
			'mouseleave': function()
			{
				$(this).setStyle("cursor", "default");
				$(this).setStyle("text-decoration", "none");
			}.bind(this),
			'click' : function(e)
			{	
				e.stop();
				this.main.readData(this.type, true);				
			}.bind(this),
		});
		return this;
	},
	
	/* Set the value of the text node in this DOM element */
	setText: function(text) { $(this).set("text", text); },
	getType: function() { return this.type; },	
	toElement: function() { return this.element; },
});

/* Container for the database objects that are chosen by the AddCollection button. */
var DatabaseElementContainer = new Class(
{
	/*
	 * @param Main parentMain The main class of this program
	 * @param String elementId The element id of this DOM element
	 * @param String collectionFooterId The element id of the footer DOM element
	 * @param BrowseButton browseButton The browse button/link belonging to this collection
	 */
	initialize: function(parentMain, elementId, collectionFooterId, browseButton)
	{
		this.parentMain = parentMain;
		this.element = $(elementId);
		this.databaseElements = new Array();
		this.collectionFooter = $(collectionFooterId);
		this.browseButton = browseButton;
		this.expanded = false;
		
		this.setupDomElements();
		this.attach();
		
		return this;
	},
	
	setupDomElements: function()
	{
		this.rowsDiv = new Element('div', { 'class' : 'collectionRows' });
		this.buttonsDiv = new Element('div', { 'class' : 'collectionButtons' });
		this.removeAll = new Element('span', { 'id' : 'collectionFooterRemove', 'class' : 'CollectionFooterButton', 'text' : '' });
		this.showHideAll = new Element('span', { 'id' : 'collectionFooterShowHide', 'class' : 'CollectionFooterButton', 'text' : '' });
		
		$(this.removeAll).inject($(this.buttonsDiv));
		$(this.showHideAll).inject($(this.buttonsDiv));
		
		$(this.rowsDiv).inject($(this));
		$(this.buttonsDiv).inject($(this));
	},
	
	attach: function()
	{
		$(this.removeAll).addEvents({ 'mouseenter' : function() { $(this.removeAll).setStyle("cursor", "pointer"); $(this.removeAll).setStyle("text-decoration", "underline"); }.bind(this), 
									  'mouseleave' : function() { $(this.removeAll).setStyle("cursor", "default"); $(this.removeAll).setStyle("text-decoration", "none"); }.bind(this),
									  'click' : function() { this.removeAllRows(); }.bind(this)
									});
		
		$(this.showHideAll).addEvents({ 'mouseenter' : function() { $(this.showHideAll).setStyle("cursor", "pointer"); $(this.showHideAll).setStyle("text-decoration", "underline"); }.bind(this),
									    'mouseleave' : function() { $(this.showHideAll).setStyle("cursor", "default"); $(this.showHideAll).setStyle("text-decoration", "none"); }.bind(this),
									    'click' : function() { this.toggleShowCollection(); }.bind(this)
									});
	},
	
	/* Adds a database object to the collecetion 
	 * @param DatabaseElement databaseElement The databaseelement that is added to the collection  */
	add: function(databaseElement)		
	{
		var alreadyExists = Array.some(this.databaseElements, function(existingElement)
		{	
			return (databaseElement.name == existingElement.name)
		});
		if (alreadyExists)
			return false;
		databaseElement.attach();
		this.databaseElements.push(databaseElement);
		$(databaseElement).inject($(this.rowsDiv));
		this.updateBrowseButton();
		this.updateFooter();
	},
	
	/* Removes a database object from the collection
	 * @param DatabaseElement databaseElement The databaseelement from the collection */
	remove: function(databaseElement)
	{
		this.databaseElements.erase(databaseElement);
		$(databaseElement).destroy();
		this.updateBrowseButton();
		this.updateFooter();
	},
	
	/* Remove all database objects from the collection */
	removeAllRows: function()
	{	
		if (this.expanded)
			this.toggleShowCollection();
			
		Array.each(this.databaseElements, function(databaseElement)
		{
			$(databaseElement).destroy();
		});
		this.databaseElements.empty();
		this.updateBrowseButton();
		this.updateFooter();		
	},
	
	/* Expands and contracts the collection */
	toggleShowCollection: function()
	{	
		if (this.expanded)
		{
			// Get the cartesian position of this element.
			var position = $(this).getPosition();
			var size = $(this).getSize();
					
			this.expanded = false;

			var rowSize = $(this.rowsDiv).getSize();
			$(this.rowsDiv).setStyle("max-height",  "47px");
					
			$(this).addClass("collection");			
			$(this.showHideAll).set("text", "Expand");
			
			(function(){ 
				$(this).setStyles({
					"position" : "relative",
					"top" : "7px",
					"left" : "0px",
					"width" : "135px",		
					"z-index" : 1,
					"border-radius" : 0,
					"max-height" : "68px",
					"padding-bottom" : "0px"
				});
				$(this.newCollection).destroy();
			}.bind(this)).delay(200);
		}
		else
		{
			this.expanded = true;
			// Change text
			this.newCollection = $(this).clone();
			$(this.newCollection).inject($(this), 'after');
			$(this.newCollection).setStyle("visibility", "hidden");
			
			// Get the cartesian position of this element.
			var position = $(this).getPosition();
			var size = $(this).getSize();
			
			var rowSize = $(this.rowsDiv).getSize();
			$(this.rowsDiv).setStyle("max-height", rowSize.y + 195);
			// Set style-position to absolute. Set position to the same as found above.
			$(this).setStyles({
				"position" : "absolute",
				"z-index"  : "40",
				"top"      : position.y,
				"left"     : position.x,		
				"border-radius" : "0em 0em 1em 1em",
				//"max-height" : size.y + 200,
				"padding-bottom" : "3px"
			});
			//$(this).setStyle("max-height", size.y + 200);
			var extractCollectionFx = new Fx.Tween($(this), {
				duration: 200,
				transition: 'bounce',
				property: 'max-height'
			}).start(size.y, size.y + 200);

			$(this.showHideAll).set("text", "Contract");
		}		
	},
	
	/* TODO 
	 * @param String text Name of the database object to be removed */
	removeJustText: function(text)
	{
		Array.each(this.databaseElements, function(databaseElement)
		{
			if (databaseElement.name == text)
			{
				this.remove(databaseElement);
				return;
			}
		}.bind(this));
	},
	
	/* Update the footer containing text about contracting and expanding the collection */
	updateFooter: function()
	{
		if (this.databaseElements.length > 2)
		{
			this.removeAll.set("text", "Remove all"); 
			this.showHideAll.set("text", "Expand");
		}
		else if (this.databaseElements.length >= 0 && this.databaseElements.length <= 2)
		{
			if (this.showHideAll.get("text").length > 0)
				this.showHideAll.set("text", "");
			
			if (this.removeAll.get("text").length > 0)
				this.removeAll.set("text", "");	
		}	
	},
	
	/* Update the browse button/link text below the input field */
	updateBrowseButton: function()
	{
		if (this.browseButton == null)
			return false;
		else if (this.browseButton.getType() == "table") 
		{
			if (this.databaseElements.length == 0)
				this.browseButton.setText("");
			if (this.databaseElements.length == 1)
				this.browseButton.setText("show tables in the chosen database.");
			else if (this.databaseElements.length > 1)
				this.browseButton.setText("show tables in the chosen " + this.databaseElements.length + " databases");
		}
		else if (this.browseButton.getType() == "column")
		{
			if (this.databaseElements.length == 0)
				this.browseButton.setText("");
			if (this.databaseElements.length == 1)
				this.browseButton.setText("show columns in the chosen table.");
			else if (this.databaseElements.length > 1)
				this.browseButton.setText("show columns in the chosen " + this.databaseElements.length + " tables");
		}
	},
	
	getValues: function() { return this.databaseElements; },	
	toElement: function() { return this.element; },
});	

/* The database object in the collection belonging to an input field. */ 
var DatabaseElement = new Class(
{	
	Implements: Options,
	options: 
	{
		"maxNameLength" : 11 // must be above 2.
	},
	
	/*
	 * @param DatabaseElementContainer DatabaseElementContainer The collection which holds this element
	 * @param String name The name shown on the element 
	 * @param Options options The options belonging to this object
	 */
	initialize: function(parentDatabaseElementContainer, name, options)
	{
		this.setOptions(options);
		this.parentDatabaseElementContainer = parentDatabaseElementContainer;
		this.name = name;
		
		var dataBreakdown = this.name.split('.');
		if (dataBreakdown.length == 1)
		{
			this.type  = "database";
			this.name  = dataBreakdown[0];
			this.title = "Database: " + dataBreakdown[0];
		}
		else if (dataBreakdown.length == 2)
		{
			this.type  = "table";
			this.name  = dataBreakdown[1];
			this.title = "Database: " + dataBreakdown[0] + " Table: " + dataBreakdown[1];
		}
		else if (dataBreakdown.length == 3)
		{
			this.type  = "column";
			this.name  = dataBreakdown[2];
			this.title = "Database: " + dataBreakdown[0] + " Table: " + dataBreakdown[1] + " Column: " + dataBreakdown[2];
		}
		else
			throw new Error("Could not identify type of database element.");
		this.setupDomElements();
		
		return this;
	},
	
	setupDomElements: function()
	{		
		this.setElement(new Element('span', { 'class' : 'DatabaseElement', 'title' : this.title } ));
		
		if (this.name.length > this.options.maxNameLength) 
			this.showedName = this.name.substring(0, this.options.maxNameLength - 3) + "...";
		else
			this.showedName = this.name;
		this.text = new Element('span', { 'class' : 'DataBaseElementText', 'text' : this.showedName });
		this.remove = new Element('span', { 'class' : 'DatabaseElementRemove', 'text' : 'x' });
		
		$(this.remove).inject($(this));
		$(this.text).inject($(this));		
	},
	
	attach: function()
	{
		$(this.remove).addEvents(
		{
			"mouseenter" : function()
			{
				$(this.remove).setStyle("cursor", "pointer");
				$(this.remove).setStyle("background-color", "#666");
			}.bind(this),
			"mouseleave" : function()
			{
				$(this.remove).setStyle("cursor", "default");
				$(this.remove).setStyle("background-color", "");
			}.bind(this),
			"click" : function()
			{
				this.parentDatabaseElementContainer.remove(this);
			}.bind(this)
		});
		
		$(this).addEvents(
		{
			"mouseenter" : function() { $(this).highlight("#5184CC"); }.bind(this),
		});
		return this;
	},
		
	toElement: function() { return this.element },
	setElement: function(element) { this.element = element; },
	getName: function() { return this.name; },
});

/*
 * Button that adds the element in the input box to the collection of 
 * selected elements.
 */
var CollectionAdd = new Class(
{
	/* 
	 * @param Main parentMain The main class of this program
	 * @param DatabaseElementContainer collection The collection of element
	 * @param String elementId The id of the DOM element representing this element
	 */
	initialize: function(parentMain, collection, inputField, elementId)
	{
		this.parentMain = parentMain;
		this.collection = collection;
		this.inputField = inputField;
		this.element    = $(elementId);
		
		this.setupDomElements();
		
		return this;
	},
	
	setupDomElements: function()
	{
		/* SVG string representing a + sign. */
		plusSVG = "M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z";
		
		this.raphaelHolder = new Element('span', { 'class' : 'RaphaelHolder' });
		$(this.raphaelHolder).inject($(this));
		
		var paper = Raphael($(this.raphaelHolder), 15, 23);	
		this.path = paper.path(plusSVG).attr({fill: "#666", stroke: "none"}).scale(0.7).translate(-8, 0);	
	},
	
	attach: function() 
	{
		$(this).addEvents(
		{
			'mouseenter' : function()
			{	
				$(this).setStyle("cursor", "pointer");
				this.path.animate({ fill: "#000" }, 300);
			}.bind(this),
			'mouseleave' : function()
			{
				$(this).setStyle("cursor", "default");
				$(this).setStyle("box-shadow", "1px 1px 3px #333");		
				this.path.animate({ fill: "#666" }, 300);				
			}.bind(this),
			"mousedown": function()
			{
				$(this).setStyle("box-shadow", "0px 0px 0px #333");
				this.add();
			}.bind(this),
			"mouseup" : function()
			{
				$(this).setStyle("box-shadow", "1px 1px 3px #333");			
			}.bind(this)
		});
		return this;
	},
	
	/* When the button is pressed, the value in the inputfield is added to the collection */
	add: function()
	{
		if ($(this.inputField).get("value") != this.inputField.options.defaultText)
		{	
			this.collection.add(new DatabaseElement(this.collection, $(this.inputField).get("value")));
			$(this.inputField).set("value", this.inputField.options.defaultText);
		}	
	},
	
	toElement: function() { return this.element; },	
});	

/* Submit button, tells the main window to show the database objects in the collection. */ 
var Submit = new Class(
{
	initialize: function(main, collection, type, elementId)
	{
		this.main = main;
		this.collection = collection;
		this.type = type;
		this.element = $(elementId);
		this.setupDomElements();
		
		return this;
	},
	
	setupDomElements: function()
	{
		/* SVG string for a -> button */
		rightSVG = "M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z";
		
		this.raphaelHolder = new Element('span', { 'class' : 'RaphaelHolder' });
		$(this.raphaelHolder).inject($(this));
		
		paper = Raphael($(this.raphaelHolder), 15, 23);	
		this.path = paper.path(rightSVG).attr({fill: "#666", stroke: "none"}).scale(0.7).translate(-8, 0);
	},
	
	attach: function()
	{
		$(this).addEvents(
		{
			'mouseenter' : function()
			{
				$(this).setStyle("cursor", "pointer");
				this.path.animate({ fill: "#000" }, 300);
			}.bind(this),
			'mouseleave' : function()
			{
				$(this).setStyle("cursor", "default");
				$(this).setStyle("box-shadow", "1px 1px 3px #333");		
				this.path.animate({ fill: "#666" }, 300);
			}.bind(this),
			"mousedown": function()
			{
				$(this).setStyle("box-shadow", "0px 0px 0px #333");
				this.main.showData(this.collection, this.type);
			}.bind(this),
			"mouseup" : function()
			{
				$(this).setStyle("box-shadow", "1px 1px 3px #333");			
			}.bind(this)
		});
		return this;
	},
	
	toElement: function() { return this.element; },
});

/* This is a DOM element! The basket part of the application. */
var Basket = new Class(
{
	initialize: function(main, elementId)
	{
		this.element = $(elementId);	
		this.main = main;
		this.currentView = null;
		this.shownViews = new Array();
		this.currentBasket = new BasketStructure();
		this.setupDomElements();
	},
	
	/* Set up the DOM elements */
	setupDomElements: function()
	{	
		this.basketBody = $('basket-body');
		
		basketHeader = new BasketHeader('basket-header', this);
		
		basketHeader.addBasketPart('views');
		basketHeader.addBasketPart('custom');  
		basketHeader.addBasketPart('submit');
		
		basketHeader.addBasketView(new BasketTreeView(basketHeader, "M6.812,17.202l7.396-3.665v-2.164h-0.834c-0.414,0-0.808-0.084-1.167-0.237v1.159l-7.396,3.667v2.912h2V17.202zM26.561,18.875v-2.913l-7.396-3.666v-1.158c-0.358,0.152-0.753,0.236-1.166,0.236h-0.832l-0.001,2.164l7.396,3.666v1.672H26.561zM16.688,18.875v-7.501h-2v7.501H16.688zM27.875,19.875H23.25c-1.104,0-2,0.896-2,2V26.5c0,1.104,0.896,2,2,2h4.625c1.104,0,2-0.896,2-2v-4.625C29.875,20.771,28.979,19.875,27.875,19.875zM8.125,19.875H3.5c-1.104,0-2,0.896-2,2V26.5c0,1.104,0.896,2,2,2h4.625c1.104,0,2-0.896,2-2v-4.625C10.125,20.771,9.229,19.875,8.125,19.875zM13.375,10.375H18c1.104,0,2-0.896,2-2V3.75c0-1.104-0.896-2-2-2h-4.625c-1.104,0-2,0.896-2,2v4.625C11.375,9.479,12.271,10.375,13.375,10.375zM18,19.875h-4.625c-1.104,0-2,0.896-2,2V26.5c0,1.104,0.896,2,2,2H18c1.104,0,2-0.896,2-2v-4.625C20,20.771,19.104,19.875,18,19.875z", "Tree view"), 'views');
		basketHeader.addBasketView(new BasketConnectionView(basketHeader, "M18.386,16.009l0.009-0.006l-0.58-0.912c1.654-2.226,1.876-5.319,0.3-7.8c-2.043-3.213-6.303-4.161-9.516-2.118c-3.212,2.042-4.163,6.302-2.12,9.517c1.528,2.402,4.3,3.537,6.944,3.102l0.424,0.669l0.206,0.045l0.779-0.447l-0.305,1.377l2.483,0.552l-0.296,1.325l1.903,0.424l-0.68,3.06l1.406,0.313l-0.424,1.906l4.135,0.918l0.758-3.392L18.386,16.009z M10.996,8.944c-0.685,0.436-1.593,0.233-2.029-0.452C8.532,7.807,8.733,6.898,9.418,6.463s1.594-0.233,2.028,0.452C11.883,7.6,11.68,8.509,10.996,8.944z", "Connection view"), 'views');
		basketHeader.addBasketView(new BasketPseudoView(basketHeader, "M23.024,5.673c-1.744-1.694-3.625-3.051-5.168-3.236c-0.084-0.012-0.171-0.019-0.263-0.021H7.438c-0.162,0-0.322,0.063-0.436,0.18C6.889,2.71,6.822,2.87,6.822,3.033v25.75c0,0.162,0.063,0.317,0.18,0.435c0.117,0.116,0.271,0.179,0.436,0.179h18.364c0.162,0,0.317-0.062,0.434-0.179c0.117-0.117,0.182-0.272,0.182-0.435V11.648C26.382,9.659,24.824,7.49,23.024,5.673zM25.184,28.164H8.052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z", "PseudoSQL view"), 'views');
		basketHeader.addBasketView(new BasketSqlView(basketHeader, "M2.021,9.748L2.021,9.748V9.746V9.748zM2.022,9.746l5.771,5.773l-5.772,5.771l2.122,2.123l7.894-7.895L4.143,7.623L2.022,9.746zM12.248,23.269h14.419V20.27H12.248V23.269zM16.583,17.019h10.084V14.02H16.583V17.019zM12.248,7.769v3.001h14.419V7.769H12.248z", 'Customization view'), 'custom');
		basketHeader.addBasketView(new BasketSubmitView(basketHeader, "M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z", 'Configure and submit'), 'submit');
		
		basketHeader.attach();
		basketHeader.selectView(basketHeader.views[0]);
	},
	
	setView: function(view)
	{
		if (this.currentView != null) {
			this.currentView.hideView(); // turning off the current view.
		}
		if (this.shownViews.contains(view))
		{
			view.showView(); // making the view visible.
		}
		else
		{
			$(view.getBasketBodyType()).inject($(this.basketBody)); // creating the view.
			this.shownViews.push(view);
		}
		this.currentView = view; // setting the new view as current view
	},
	
	// Ineffeciency is high.
	updateView: function()
	{
		this.basketBody.getChildren().destroy(); // clearing
		$(this.currentView.getBasketBodyType()).inject($(this.basketBody)); // setting the new view.
	},
	
	/* Man in the middle functions */
	isInBasket: function(item) { return this.currentBasket.isInBasket(item); },
	addItem: function(item) { return this.currentBasket.addItem(item); },
	removeItem: function(item) { return this.currentBasket.removeItem(item); },
	
	toElement: function() { return this.element; },
});

/* DOM element. Header of the basket, contains icons. */
var BasketHeader = new Class(
{
	initialize: function(elementId, parentBasket)
	{
		this.element = $(elementId);
		this.parentBasket = parentBasket;
		this.views = new Array();
		this.parts = new Array();
	},
	
	attach: function() 
	{
		Array.each(this.views, function(view)
		{
			view.attach();
		});
	},
	
	detach: function()
	{
		Array.each(this.views, function(view)
		{
			view.detach();
		});
	},
	
	addBasketPart: function(partname)
	{
		newPart = new Element('span', { 'class' : 'basketviewspan', 'name' : partname } );
		this.parts.push(newPart);
		$(newPart).inject($(this));		
	},
	
	addBasketView: function(view, partString)
	{
		this.views.include(view);
		var includeToPart = null;
		Array.each(this.parts, function(existingPart)
		{
			if (existingPart.get("name") == partString)
			{
				includeToPart = existingPart;
				return;
			}
		});
		if (!includeToPart)
			throw new Error("Did not find part.");
		$(view).inject($(includeToPart));
	},
	
	removeBasketView: function(view)
	{
		this.views.erase(view);
	},
	
	selectView: function(view)
	{
		this.deselectAllViews();
		view.select();
		this.parentBasket.setView(view);
	},
	
	deselectAllViews: function()
	{
		Array.each(this.views, function(view)
		{
			this.deselectView(view);
		}.bind(this));
	},
	
	deselectView: function(view)
	{
		view.deselect();
	},
	
	toElement: function() { return this.element; }
});

/* DOM. This view is the parent view class. */
var BasketView = new Class(
{
	initialize: function(parentBasketHeader, icon, title)
	{
		this.parentBasketHeader = parentBasketHeader;
		this.icon = icon;
		this.title = title;
		this.setupDomElements();
	},
	
	setupDomElements: function()
	{	
		this.element = new Element('span', { 'class' : 'basketChangeView', 'title' : this.title });
		paper = Raphael($(this), 30, 30);	
		this.path = paper.path(this.icon).attr({fill: "#666", stroke: "none", "stroke-width" : 0.5 }).scale(0.7).translate(0, 0);
	},
	
	attach: function()
	{		
		$(this).addEvents(
		{ 
			"mouseenter" : function() { 
				$(this).setStyle("cursor", "pointer"); 
				this.path.animate({ fill: "#111" }, 200); 
			}.bind(this), 
			"mouseleave" : function() { 
				$(this).setStyle("cursor", "default"); 
				this.path.animate({ fill: "#666" }, 200); 
			}.bind(this),
			"click" : function()
			{
				this.parentBasketHeader.selectView(this);
			}.bind(this),
		});
	},
	
	detach: function()
	{
		$(this).removeEvents();
	},	
	
	select: function()
	{
		this.path.animate({ "stroke": "#66F" }, 200);
	},
	
	deselect: function()
	{	
		this.path.animate({ "stroke" : "none", "fill": "#666" }, 0);
	},
	
	showView: function()
	{
		$(this.basketBodyType).setStyle("display", "block");
	},
	
	hideView: function()
	{
		$(this.basketBodyType).setStyle("display", "none");
	},
	
	toElement: function() { return this.element; },
});

/* DOM Basket view */
var BasketTreeView = new Class(
{
	Extends: BasketView,
	initialize: function(parentBasketHeader, icon, title)
	{
		this.parent(parentBasketHeader, icon, title);
	},
	
	getBasketBodyType: function() { return this.setupBasketBodyType(); },
	
	setupBasketBodyType: function()
	{
		this.basketBodyType = new Element('div', { 'class' : 'BasketBodyType' });
		Array.each(this.parentBasketHeader.parentBasket.itemArray, function(item)
		{
			$(item).inject($(this.basketBodyType));
		}.bind(this));
		
		return this.basketBodyType;
	},
});

/* Shows what connections (i.e. foreign key relationships) are in the basket 
 * NOT SUPPORTED. */
var BasketConnectionView = new Class(
{
	Extends: BasketView,
	initialize: function(parentBasketHeader, icon, title)
	{
		this.parent(parentBasketHeader, icon, title);
	},
	
	getBasketBodyType: function() { return this.setupBasketBodyType(); },
	
	setupBasketBodyType: function()
	{
		this.basketBodyType = new Element('div', { 'class' : 'BasketBodyType' });
		this.notSupportedDiv = new Element('div', { 'class' : 'ViewNotSupported' , 'text' : 'This view is meant to show the chosen database objects in terms of connections, i.e. which columns are dependent on each other by foreign keys, so that joins are visible. Not supported in this version.' });
		
		$(this.notSupportedDiv).inject($(this.basketBodyType));
		
		return this.basketBodyType;
	},
});

/* DOM Basket Pseudo View */
var BasketPseudoView = new Class(
{
	Extends: BasketView,
	initialize: function(parentBasketHeader, icon, title)
	{
		this.parent(parentBasketHeader, icon, title);
	},
	
	getBasketBodyType: function() { return this.setupBasketBodyType(); },
	
	setupBasketBodyType: function()
	{
		this.basketBodyType = new Element('div', { 'class' : 'BasketBodyType' });
		this.notSupportedDiv = new Element('div', { 'class' : 'ViewNotSupported' , 'text' : 'This view is meant to show the chosen database objects listed in pseudo SQL. Not supported in this version.' });
		
		$(this.notSupportedDiv).inject($(this.basketBodyType));
		
		return this.basketBodyType;
	},
});

/* DOM Basket SQL View */
var BasketSqlView = new Class(
{
	Extends: BasketView,
	initialize: function(parentBasketHeader, icon, title)
	{
		this.parent(parentBasketHeader, icon, title);
	},
	
	getBasketBodyType: function() { return this.setupBasketBodyType(); },
	
	setupBasketBodyType: function()
	{
		this.basketBodyType = new Element('div', { 'class' : 'BasketBodyType' } );

		var viewHeader = new Element('div', { 'class' : 'BasketBodyHeader notice', 'text' : 'Add comments, your own SQL, or any other type of message in the box(es) below.'} );
		//$(viewHeader).inject($(this.basketBodyType));
		
		var textAreaHolder = new Element('div');
		$(textAreaHolder).inject($(this.basketBodyType));
		
		var flexArea = new Flext(new Element('textarea', { 'class' : 'flext growme growparents customarea', 'height' : 300, 'margin-top':30, 'padding' : 30, 'id' : 'customTextArea' })); 
		$(flexArea).inject($(textAreaHolder));
		
		var addAnother = new Element('div', { 'class' : 'CustomAddAnother', 'text' : '+ Add another comment' });
		$(addAnother).inject($(this.basketBodyType));
		$(addAnother).addEvents(
		{
			"mouseenter" : function() { $(addAnother).setStyles({ "cursor" : "pointer", "text-decoration" : "underline" }); },
			"mouseleave" : function() { $(addAnother).setStyles({ "cursor" : "default", "text-decoration" : "none" }); },
			"click" : function() { 
				var removal = new Element('span', { 'text' : 'X', "class" : "removeAnother" });	
				$(removal).inject($(textAreaHolder));
				var flexArea = new Flext(new Element('textarea', { 'class' : 'flext growme growparents customarea', 'height' : 300, 'margin-top':30, 'padding' : 30, 'id' : 'customTextArea' })); 
				$(flexArea).inject($(textAreaHolder));		

				$(removal).addEvents({
					"mouseenter": function() { $(removal).setStyles({"cursor": "pointer", "color" : "#000" }); },
					"mouseleave": function() { $(removal).setStyles({ "cursor" : "default", "color" : "#999" } ); },
					"click": function() { $(flexArea).destroy(); $(removal).destroy(); }
				});
			}.bind(this),
		});
		
		return this.basketBodyType;
	},
});

/* DOM Basket Submit View */
var BasketSubmitView = new Class(
{
	Extends: BasketView,
	initialize: function(parentBasketHeader, icon, title)
	{
		this.parent(parentBasketHeader, icon, title);
	},
	
	getBasketBodyType: function() { return this.setupBasketBodyType(); },
	
	setupBasketBodyType: function()
	{
		this.basketBodyType = new Element('div', { 'class' : 'BasketBodyType' });
		
		var submitInput = new SendButton(this);
		
		// Contact Information
		inputHolder = new Element('div', { 'class' : 'inputHolder' });
		$(inputHolder).inject($(this.basketBodyType));		
		var inputLabel = new Element('div', { 'class' : 'inputLabel', 'text' : '1. Contact information' });
		$(inputLabel).inject($(inputHolder));
		this.emailInput = new SpecialInput({ "defaultText" : "Your email-address" });
		$(this.emailInput).set("id", "email");		
		$(this.emailInput).inject($(inputHolder));	
		this.submitButton.addRequirement(this.emailInput);
		$(this.emailInput).addEvents({
			"keyup" : function() { 		
				if ($(this.emailInput).get("value") == this.emailInput.options.defaultText || $(this.emailInput).get("value") == "")
				{
					$(this.emailInput).setStyle("background-color", "white");	
					this.emailInput.setValid(false);
				}
				else if ((($(this.emailInput).get("value").split('@').length) != 2) || (($(this.emailInput).get("value").split('@')[1].split(".").length) != 2)) 
				{
					$(this.emailInput).setStyle("background-color", "#DDAAAA"); 
					this.emailInput.setValid(false);
				}				
				else 
				{
					$(this.emailInput).setStyle("background-color", "#AADDAA");
					this.emailInput.setValid(true);				
				}
				// Tell submit button about email's validity.
				this.submitButton.update();
			}.bind(this)			
		});
		
		// Format
		inputHolder = new Element('div', { 'class' : 'inputHolder' });
		$(inputHolder).inject($(this.basketBodyType));		
		var inputLabel = new Element('div', { 'class' : 'inputLabel', 'text' : '2. Delivery type' });
		$(inputLabel).inject($(inputHolder));
		var deliveryInput = new SpecialSelect(this);		
		var flatfileOption0 = new Element('option', { "value" : "", "text" : "<Choose type>" });
		var flatfileOption1 = new Element('option', { "value" : "Flat file", "text" : "Flat file" });
		var flatfileOption2 = new Element('option', { "value" : "Database", "text" : "Database" });
		$(flatfileOption0).inject($(deliveryInput));		
		$(flatfileOption1).inject($(deliveryInput));
		$(flatfileOption2).inject($(deliveryInput));
		$(deliveryInput).inject($(inputHolder));	
				
		delimiterOption = new SpecialInput({ 	
												"defaultText" : "Delimiter (, - | .)",  
												"width" : 110,	
												"fontsize" : "0.9em"																						
											});
		
		$(delimiterOption).setStyle("margin-left", "10px");
		$(delimiterOption).inject($(inputHolder));
		$(delimiterOption).setStyle("display", "none");
		
		databaseOption = new SpecialInput({ "defaultText" : "Name of database",
											"width" : 130,	
										    "fontsize" : "0.9em"
										  });
		$(databaseOption).setStyle("margin-left", "10px");
		$(databaseOption).inject($(inputHolder));
		$(databaseOption).setStyle("display", "none");
				
		$(deliveryInput).addEvents({
			"change" : function() {
				var text = $(deliveryInput).get("value");
				if (text == "Flat file")
				{
					$(delimiterOption).setStyle("display", "inline");
					$(databaseOption).setStyle("display", "none");
				}
				else if (text == "Database")
				{
					$(delimiterOption).setStyle("display", "none");
					$(databaseOption).setStyle("display", "inline");
				}
				else
				{
					$(delimiterOption).setStyle("display", "none");
					$(databaseOption).setStyle("display", "none");	
				}
			}.bind(this)
		});
		
		// Send type
		inputHolder = new Element('div', { 'class' : 'inputHolder' });
		$(inputHolder).inject($(this.basketBodyType));		
		var inputLabel = new Element('div', { 'class' : 'inputLabel', 'text' : '3. Send request' });
		$(inputLabel).inject($(inputHolder));
		
		$(submitInput).inject($(inputHolder));	
		$(submitInput).attach();
	
		return this.basketBodyType;
	},
	
	submit: function()
	{
		if (this.emailInput.isValid())
		{
			console.log("Submitting.");
		}
		else
		{
			console.log("Something is wrong.");
		}
	},
});

/* DOM Select element with special features */
var SpecialSelect = new Class(
{
	Implements: Options,
	options:
	{
		"defaultValid" : null 
	},
	initialize: function(parentView) 
	{
		this.setOptions(options);
		this.parentView = parentView;
		this.element = new Element('select');
		this.specialOptions = new Array();
		this.setupDomElements();
	},
	
	setupDomElements: function() 
	{
		
	},
	
	isValid: function() 
	{
		return bool;
	},
	
	setValid: function(bool)
	{
		this.valid = bool;
	},
	
	addSpecialOption: function(option) 
	{
		this.specialOptions.push(option);
	},
	
	removeSpecialOption: function(option)
	{
		this.specialOptions.erase(option);
	},	
	
	attach: function()
	{
		// Vid förändring, ändra vilken som är "aktiv." Vid förändring av den som är aktiv, så ska det också ändra SpecialInputs validity. Det ska mao finnas
		// en länk mellan Option och parent.
	},
	
	detach: function() 
	{
		this.removeEvents();
	},
});

/* Select button with special features */
var SendButton = new Class(
{
	initialize: function(parentView) 
	{
		this.parentView = parentView;
		this.requirements = new Array();
		this.element = new Element('span', { 'class' : 'button', 'text' : 'send' });
		this.setupDomElements();
	},
	
	setupDomElements: function() {
			
	},
	
	addRequirement: function(requirement)
	{
		this.requirements.push(requirement);
	},
	
	passesRequirements: function()
	{
		var isValid = Array.some(this.requirements, function(req)
		{
			return !req.isValid();
		});
	},
	
	attach: function() {
		$(this).addEvents({
			"mouseenter" : function() 
			{ 
				$(this).setStyles({ "background-color": "#666", "cursor" : "pointer" });
			},
			"mouseleave" : function()
			{
				$(this).setStyles({ "background-color": "#888", "cursor" : "default" });
			},
			"click" : function()
			{
				this.submit();
			}.bind(this),
		});	
	},
	
	detach: function() {
		$(this).removeEvents();
	},
	
	toElement: function()
	{
		return this.element;
	},
	
	submit: function() 
	{
		this.parentView.submit();
	},
	
	update: function()
	{
		if (this.passesRequirements()) 
			this.detach();
		else
			this.attach();
	},		
});

/* SpecialInput -- Represents a HTML DOM Element Input but has special behaviour. */
var SpecialInput = new Class(
{	
	Implements: Options,
	options: 
	{
		"valid" : null,
		"defaultText" : "",
		"width" : 250,	
		"fontsize" : "1em"
	},
	initialize: function(options)
	{
		this.setOptions(options);
		this.element = new Element("input", { "class" : "specialInput", "value" : this.options.defaultText });
		$(this).setStyles({
			"color" : "#BBB",
			"width" : this.options.width,
			"font-size" : this.options.fontsize
			/* "border-color" : "#DDD",
			"border-width" : "2px",
			"border-style" : "solid",
			"box-shadow"   : "1px 1px 4px #777", */
		});	
		this.attach();
	},
	
	toElement: function() { return this.element; },
	
	isValid: function() 
	{
		return this.options.valid;
	},
	
	setValid: function(bool) 
	{
		this.setOptions({"valid" : bool});
	},
	
	attach: function()
	{
		$(this).addEvents(
		{
			blur: function()
			{	
				if ($(this).get("value") == this.options.defaultText || $(this).get("value") == "")
					$(this).setStyle("color", "#bbb");
				// $(this).setStyles({
					// "border-color" : "#DDD",
					// "border-width" : "2px",
					// "border-style" : "solid"
				// });
				if ($(this).get("value") == "")
					$(this).set("value", this.options.defaultText);
			}.bind(this),
			focus: function()
			{
				$(this).setStyle("color", "#000");
				// $(this).setStyles({
					// "border-color" : "73A6FF",
					// "border-width" : "2px",
					// "border-style" : "solid"
				// });
				if ($(this).get("value") == this.options.defaultText)
					$(this).set("value", "");
			}.bind(this),
			keyup: function()
			{				
			}.bind(this),
		});
	},	
});

/* -------------------------------  BASKET BEGINS -----------------  */

/* BasketItem -- Superclass for all basket items. */
var BasketItem = new Class(
{
	initialize: function(basketParent)
	{
		this.basketParent = basketParent; 
	},
	
	start: function()
	{
		this.setupDomElements();  // Run by subclass.
		this.attach();			  // Run by subclass.
	},
	
	setData: function(data) { this.data = data; },	
	getData: function() { return this.data; },
	
	toElement: function() { return this.element; },
});

/* DatabaseBasketItem -- Child to BasketItem. Represents a database in the basket. NOT SUPPORTED. */
var DatabaseBasketItem = new Class(
{ /* ... */ });

/* TableBasketItem -- Child to BasketItem. Represents a database in the basket. NOT SUPPORTED. */
var TableBasketItem = new Class(
{ /* ... */ });

/* ColumnBasketItem -- Child to BasketItem. Represents a database in the basket. */
var ColumnBasketItem = new Class(
{
	Extends: BasketItem,
	initialize: function(basketParent)
	{
		this.parent(basketParent);
	},
	
	setupDomElements: function()	
	{
		this.element = new Element('div', { 'class' : 'BasketItem' });
		this.name = new Element('span', { 'class' : 'BasketName', 'text' : this.data.column });
		
		$(this.name).inject($(this));
	},
	
	attach: function() { },
});

/* 
 * BasketStructure 
 */
var BasketStructure = new Class(
{
	initialize: function() 
	{
		this.chosenColumns = new Array();
	},	

	/* Check if item exists in structure already and has the correct format. If not, add it. */
	addItem: function(data) 
	{
		var dataBreakdown = data.split('.');
		if (dataBreakdown.length == 1)
			var newItem = DatabaseBasketItem({ "database" : dataBreakdown[0] }); // Database adding is not supported in this version. 
		else if (dataBreakdown.length == 2)
			var newItem = TableBasketItem({ "database" : dataBreakdown[0], "table" : dataBreakdown[1] }); // Table adding is not supported in this version.
		else if (dataBreakdown.length == 3) {
			var newItem = ColumnBasketItem({ "database" : dataBreakdown[0], "table" : dataBreakdown[1], "column" : dataBreakdown[2] });
		}
		else
			throw new Error("Could not identify type when adding a basketitem.");
			
		this.chosenItems.addItem(newItem);		
		this.updateView();
	},
	
	removeItem: function(item)
	{
	
	},
	
	removeItems: function()
	{
	
	},
	
	containsItem: function(item)
	{
	
	},
	
	getItems: function() 
	{
	
	},
	
	/* 
	 * Check if two database objects are in fact the same
	 * by matching names of database, table and column.
	 * Only supports comparisons between two columns.
	 * Return true if items are the same
	 *        false if items are not the same
	 */
	compare: function(item1, item2) 
	{
		console.log(item1);
		console.log(item2);
		return false;
	},
	
	/* 
	 * Checks if Column is already in basket.
	 * Return true if so, return false if not.
	 */
	isInBasket: function(data)
	{
		var dataBreakdown =  data.split('.'); // Split the data into database, table, column.
		
		if (dataBreakdown.length == 1)        // Must be a database. 
		{
			var type = "database";
			newItem = { "database" : dataBreakdown[0] };
		}
		else if (dataBreakdown.length == 2)	  // Must be a table.
		{
			var type = "table";
			newItem = { "database" : dataBreakdown[0], "table" : dataBreakdown[1] };
		}
		else if (dataBreakdown.length == 3)	  // Must be a column.
		{
			var type = "column";
			newItem = { "database" : dataBreakdown[0], "table" : dataBreakdown[1], "column" : dataBreakdown[2] };
		}
		
		/* Compare columns */
		if (type == "column")
		{			
			var foundItem = Array.some(this.chosenColumns, function(columnInBasket)
			{
				return this.compare(columnInBasket, newItem);		
			}.bind(this));
		}
		
		// Only columns are currently supported.
		else
		{
			throw new Error("Not column.");
		}
		return foundItem;
	},
});