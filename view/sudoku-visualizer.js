/*
 * jsSudoku
 *
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the GNU General Public License V2
 *
 * sudoku.js
 * View of sudoku puzzles
 *
 */
 
 /*
  * SudokuView
  *
  * Constructor:
  *	Creates a view for a sudoku model into
  *	a container "container". 
  *
  * Properties
  *	puzzle		The model representation of the puzzle
  *	container	The container output of the puzzle
  *	-table		The table displaying the sudoku
  *	-rows		The row elements of the sudoku display
  *	-cols		The column elements of the sudoku display
  *
  * Methods
  *	-initView	Initializes the view and draws it into the container
  *	-destructView	Removes the view from the container and frees all data structures
  *	-setupCell	Sets the value of a cell
  *	changePuzzle	Changes the sudoku puzzle
  *
  *	updateCell	Updates the content of a cell according to changes in the puzzle
  *	-onClick	Reacts, if the user clicks into a field
  *
  *	hideOption	Hides the option of a cell
  *	unhideOption	Revokes a hide of a option
  *	lockCell	Locks a cell
  *
  * Callbacks
  *	fixOption	An option was fixed by the user
  *	deleteFixed	A fixed value was unset by the user
  *	optionHovered	An option was hovered by the mouse
  *	optionleft	The mouse left an option field
  *
  */
function SudokuView(container) {
	var self = this;

	// [properties]
		this.puzzle = null;
		this.container = container;

		var table = null;
		var table_container = null;

	// [callbacks]
		this.fixOption = function(row, col, val) { alert("Selected fixOption: "+row+","+col+","+val); };
		this.deleteFixed = function(row, col) { alert("Selected deleteFixed: "+row+","+col); };
		this.revertNegatedOption = function(row, col, val) { alert("Negated option reverted: "+row+","+col+","+val); }
		this.optionHovered = function(row, col, val) { alert("Option hovered: "+row+","+col); };		
		this.optionLeft = function(row, col, val) { alert("Option left: "+row+","+col); };				

	// [constructor]
	
	// [methods]
	/*
	 * [private]
	 * handleFixOption(event)
	 *
	 */
	var handleFixOption = function(event) {
		self.fixOption(event.target.row, event.target.column, event.target.val);
	}

	/*
	 * [private]
	 * handleDeleteFixed(event)
	 *
	 */
	var handleDeleteFixed = function(event) {
		self.deleteFixed(event.target.row, event.target.column);
	}
	
	/*
	 * [private]
	 * handleOptionHovered(event)
	 *
	 */
	var handleOptionHovered = function(event) {
		self.optionHovered(event.target.row, event.target.column, event.target.val);
	}

	/*
	 * [private]
	 * handleOptionLeft(event)
	 *
	 */
	var handleOptionLeft = function(event) {
		self.optionLeft(event.target.row, event.target.column, event.target.val);
	}

	/*
	 * [private]
	 * handleRevertNegatedOption(event)
	 *
	 */
	var handleRevertNegatedOption = function(event) {
		self.revertNegatedOption(event.target.row, event.target.column, event.target.val);
	}
	
	/*
	 * [private]
	 * setCellContainer(row, col)
	 *
	 * Places a cell container into cell [row, col].
	 *
	 */
	var setCellContainer = function(row, col) {
		var container = document.createElement("div");
		self.table.rowElements[row].colElements[col].container = container;
		self.table.rowElements[row].colElements[col].appendChild(container);
		
		container.setAttribute("class", "sudokuCellContainer");
		container.row = row;		
		container.column = col;
		
		return container;
	}
	
	/*
	 * [private]
	 * setCellContainer(row, col)
	 *
	 * Removes the cell container of a cell
	 *
	 */
	var deleteCellContainer = function(row, col) {
		var container = self.table.rowElements[row].colElements[col].container;
		
		if (container == null)
			return;
		
		self.table.rowElements[row].colElements[col].removeChild(container);
		
		delete container;
	}	

	/*
	 * [private]
	 * setupPredefinedValue(row, col)
	 *
	 * Shows the predefined value of a cell [row, col] to a container.
	 *
	 */
	var setupPredefinedValue = function(row, col, container) {
		var value = self.puzzle.cells[row][col].fixedValue;
		var textNode = document.createTextNode(self.puzzle.cells[row][col].fixedValue + 1);

		container.setAttribute("class", "sudokuPredefinedCellContainer");

		/* FIXME */
		var div = document.createElement("div");
		div.style["height"] = "100%";
		div.style["display"] = "table-cell";
		div.style["verticalAlign"] = "middle";	
		div.appendChild(textNode);	
		
		div.row = container.row;		
		div.column = container.column;				
		/*********/

		container.appendChild(div);
	}

	
	/*
	 * [private]
	 * setupFixedValue(row, col)
	 *
	 * Shows the fixed value of a cell [row, col] to a container.
	 *
	 */
	var setupFixedValue = function(row, col, container) {
		var value = self.puzzle.cells[row][col].fixedValue;
		var textNode = document.createTextNode(self.puzzle.cells[row][col].fixedValue + 1);
		
		container.setAttribute("class", "sudokuFixedCellContainer");
		container.addEventListener("click", handleDeleteFixed, false);

		/* FIXME */
		var div = document.createElement("div");
		div.style["height"] = "100%";
		div.style["display"] = "table-cell";
		div.style["verticalAlign"] = "middle";		
		div.appendChild(textNode);	

		div.row = container.row;		
		div.column = container.column;	
		/*********/

		container.appendChild(div);
	}
	
	/*
	 * [private]
	 * setupOptions(row, col)
	 *
	 * Shows the options of a cell [row, col] to a container.
	 *
	 */
	var setupOptions = function(row, col, container) {
		var table = document.createElement("table");
		table.rowElements = new Array();
		
		container.setAttribute("class", "sudokuOptionCellContainer");
		container.appendChild(table);
				
		for (var lRow = 0; lRow < self.puzzle.size; lRow ++) {
			table.rowElements[lRow] = document.createElement("tr");
			table.appendChild(table.rowElements[lRow]);
			table.setAttribute("class", "sudokuOptionTable");
		
			
			table.rowElements[lRow].colElements = new Array();
				
			for (var lCol = 0; lCol < self.puzzle.size; lCol ++) {
				var lVal = (lRow * self.puzzle.size) + lCol;
				var lRef = null;
			
				table.rowElements[lRow].colElements[lCol] = document.createElement("td");
				table.rowElements[lRow].appendChild(table.rowElements[lRow].colElements[lCol]);
				
				if (self.puzzle.cells[row][col].option[lVal]) {
					lRef = document.createElement("div");
					lRef.appendChild(document.createTextNode(lVal + 1));
					lRef.setAttribute("class", "sudokuOptionElement");
					
					lRef.row = row;
					lRef.column = col;
					lRef.val = lVal;
					
					lRef.addEventListener("click", handleFixOption, false);
					lRef.addEventListener("mouseover", handleOptionHovered, false);				
					lRef.addEventListener("mouseout", handleOptionLeft, false);					
				}
				 else
				{
					lRef = document.createElement("div");
					lRef.setAttribute("class", "sudokuEmptyOptionElement");
				}

				table.rowElements[lRow].colElements[lCol].ref = lRef;
				table.rowElements[lRow].colElements[lCol].appendChild(lRef);
			}
		}
		
		container.table = table;
	}	
	
	/*
	 * [private]
	 * setupCell(row, col)
	 *
	 * Sets the value of a cell [row, col]. If the cell contains
	 * a fixed value, only the value will be shown. If the cell
	 * has different options, a small table with all options
	 * will be displayed instead.
	 *
	 */
	var setupCell = function(row, col) {
	
		// Prepare cell
		deleteCellContainer(row, col);
		var container = setCellContainer(row, col);
			
		// Print content
		if (self.puzzle.cells[row][col].isPredefined) {
			setupPredefinedValue(row, col, container);
		}
		 else if (self.puzzle.cells[row][col].fixedValue != -1) {
			setupFixedValue(row, col, container);
		}
		 else {
			setupOptions(row, col, container);		
		}
	}

	/*
	 * [private]
	 * setOptionStyle(row, col, val)
	 *
	 * Returnsthe option visual to the given coordinates.
	 *
	 */
	var getOptionElement = function(row, col, val, style) {
		var valRow = Math.floor(val / self.puzzle.size);
		var valCol = val % self.puzzle.size;

		if ((self.puzzle.cells[row][col].fixedValue != -1) || (self.puzzle.cells[row][col].isPredefined == true))
			return null;

		return self.table.rowElements[row].colElements[col].container.table.rowElements[valRow].colElements[valCol].ref;
	}

	/*
	 * [public]
	 * hideOption(row, col, val)
	 *
	 * Hides an option shown in a given cell.
	 *
	 */
	this.hideOption = function(row, col, val) {
		var element = getOptionElement(row, col, val);
		
		if (element == null)
			return;
			
		/* Never highlight negated top-level options */
		if (element.getAttribute("class") == "sudokuEmptyOptionElement")
			return;
		
		element.setAttribute("class", "sudokuOptionElementHidden");
		
		element.removeEventListener("mouseover", handleOptionHovered, false);				
		element.removeEventListener("mouseout", handleOptionLeft, false);
		element.removeEventListener("click", handleFixOption, false);		
		element.addEventListener("click", handleRevertNegatedOption, false);
	}
	
	/*
	 * [public]
	 * hideOption(row, col, val)
	 *
	 * Hides an option shown in a given cell.
	 *
	 */
	this.unhideOption = function(row, col, val) {
		var element = getOptionElement(row, col, val);
		
		if (element == null)
			return;

		/* Never highlight negated top-level options */
		if (element.getAttribute("class") == "sudokuEmptyOptionElement")
			return;

		
		element.setAttribute("class", "sudokuOptionElement");
		element.removeEventListener("click", handleRevertNegatedOption, false);
		element.addEventListener("mouseover", handleOptionHovered, false);				
		element.addEventListener("mouseout", handleOptionLeft, false);
		element.addEventListener("click", handleFixOption, false);		
		
	}
	
	/*
	 * [public]
	 * highlightCell(row, col, val, state)
	 *
	 * Sets an highlight to a given cell.
	 *
	 */
	this.highlightCell = function(row, col, val, state) {
		var element = getOptionElement(row, col, val);
		
		if (element == null)
			return;
	
		/* Never highlight negated options, which are already ppropagates */
		if (element.getAttribute("class") == "sudokuEmptyOptionElement")
			return;	
		
		element.oldStyle = element.getAttribute("class");
		
		if (state == true)
			element.setAttribute("class", "sudokuOptionHighlightedSet");
		else
			element.setAttribute("class", "sudokuOptionHighlightedDel");
	}	
	
	/*
	 * [public]
	 * unhighlightCell(row, col, val, state)
	 *
	 * Removes an highlight to a given cell and restores it's old style.
	 *
	 */
	this.unhighlightCell = function(row, col, val) {
		var element = getOptionElement(row, col, val);

		if (element == null)
			return;

		/* Never highlight negated options, which are already ppropagates */
		if (element.getAttribute("class") == "sudokuEmptyOptionElement")
			return;
		
		element.setAttribute("class", element.oldStyle);
	}	
		
	
	/*
	 * [public]
	 * lockCell(row, col)
	 *
	 * Locks a cell, so it would look like a predefined cell
	 *
	 */
	this.lockCell = function(row, col) {
		self.table.rowElements[row].colElements[col].container.setAttribute("class", "sudokuPredefinedCellContainer");
		self.table.rowElements[row].colElements[col].container.removeEventListener("click", handleDeleteFixed, false);		
	}
	
	/*
	 * [private]
	 * initView()
	 *
	 * Initializes the view by filling the given container with
	 * a table of the size puzzle.size².
	 *
	 */
	var initView = function() {
		self.table_container = document.createElement("div");
	
		self.table = document.createElement("table");
		self.table.rowElements = new Array();

		for (var row = 0; row < self.puzzle.fullSize; row ++) {
			self.table.rowElements[row] = document.createElement("tr");
			self.table.appendChild(self.table.rowElements[row]);

			self.table.rowElements[row].colElements = new Array();
			self.table.rowElements[row].style["verticalAlign"] = "center";	

			for (var col = 0; col < self.puzzle.fullSize; col ++) {
				self.table.rowElements[row].colElements[col] = document.createElement("td");
				self.table.rowElements[row].appendChild(self.table.rowElements[row].colElements[col]);
				
				
				// Draw block backgrounds
				if ((self.puzzle.fullSize % 2) != 0) {
					if ((self.puzzle.getBlockId(row, col) % 2) == 0)
						self.table.rowElements[row].colElements[col].setAttribute("class", "sudokuPairBlock");
					else
						self.table.rowElements[row].colElements[col].setAttribute("class", "sudokuImpairBlock");
				}
				 else
				{
					if ((self.puzzle.getBlockId(row, col) % 3) == 0)
						self.table.rowElements[row].colElements[col].setAttribute("class", "sudokuPairBlock");
					else
						self.table.rowElements[row].colElements[col].setAttribute("class", "sudokuImpairBlock");
				}
				
				// Setup block row borders
				if (   (((row + 1) % self.puzzle.size) == 0) 
				    && (row != 0) && ((row+1) < self.puzzle.fullSize)
				   ) 
				{
					self.table.rowElements[row].colElements[col].style["borderBottom"] = "";
				}
				
				// Setup block col borders
				if (   (((col + 1) % self.puzzle.size) == 0) 
				    && (col != 0) && ((col+1) < self.puzzle.fullSize)
				   ) 
				{
					self.table.rowElements[row].colElements[col].style["borderRight"] = "";
				}
				
				setCellContainer(row, col);
				
				setupCell(row, col);
			}
		}

		self.table_container.id = "tableContainer";
		self.table.id = "sudokuTable";
		
		self.table_container.appendChild(self.table);
		self.container.appendChild(self.table_container);
	}

	/*
	 * [public]
	 * updateCell
	 *
	 * Updates the content of a cell according to the current model
	 *
	 */
	this.updateCell = function(row, col) {
		setupCell(row, col);
	}

	/*
	 * [private]
	 * destructView
	 *
	 * Removes the view from the container and frees all data structures
	 *
	 */
	var destructView = function() {
		container.removeChild(self.table_container);
		self.table_container.removeChild(self.table);
		
		for (var row = 0; row < self.puzzle.size; row ++) {
			for (var col = 0; col < self.puzzle.size; col++) {
				self.table.rowElements[row].removeChild(self.table.rowElements[row].colElements[col]);
				
				delete self.table.rowElements[row].colElements[col];
			}
			
			self.table.removeChild(self.table.rowElements[row]);
			delete self.table.rowElements[row];
		}
	
		delete self.table;	
		delete self.table_container;
	}
	
	/*
	 * [public]
	 * changePuzzle(puzzleModel)
	 *
	 * Changes the current sudoku to another puzzle model
	 *
	 */
	this.changePuzzle = function(puzzleModel) {
		if (this.puzzle != null)
			destructView();
			
		this.puzzle = puzzleModel;
		
		initView();
	}
}

