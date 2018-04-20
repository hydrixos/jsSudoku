/*
 * jsSudoku
 *
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the GNU General Public License V2
 *
 * sudoku.js
 * Model of sudoku puzzles
 *
 */

/*
 * Sudoku(table)
 *
 * Constructor:
 *	Creates an object-oriented representation of a Sudoku based
 *	on a given table object. The table object must at least consist of a
 *	property "identifier", "size" and "table". The propery table contains a 
 *	string-representation of a sudoku puzzle.
 *
 * Properties:
 *	identifier		Name of the puzzle
 *	size			Size of the puzzle
 *	fullSize		Full Size of the puzzle (size²)
 *	sudokuString[]		String representation of the puzzle
 *
 *	cells[row][col]		Cell statistics:
 *					option[var]	Possible values per cell (boolean)
 *					optionCount	Count of options per cell
 *					fixedValue	Value is fixed (0 to size, -1 if not)
 *					isPredefined	Value is a predefined value
 *
 *	perRowOption[block][val]	Available options per row
 *	perColumnOptions[block][val]			      column
 *	perBlockOptions[block[val]			      block
 *
 * Methods:
 *	blockIterator
 *	this.getBlockId
 *
 *	recalculateOptions
 *	unsetFixedValue
 *	setFixedValue
 *
 *	
 *
 * Callbacks:
 *	cellChanged		Notifies, that a cell has been changed
 *
 */
function Sudoku(input)
{
	var self = this;

	// [callbacks]
		this.cellChanged = function(row, col, wasFixed) { alert("Options changed: "+ row+", "+col+" wasFixed: "+wasFixed); }		

	// [properties]
		this.identifier = input.identifier;
		this.size = Number(input.size);
		this.fullSize = this.size * this.size;
		this.sudokuString = input.table;

		this.cells = new Array(this.fullSize);
		
		this.perRowOptions = new Array(this.fullSize);
		this.perColumnOptions = new Array(this.fullSize);
		this.perBlockOptions = new Array(this.fullSize);
		
	// [constructor::pre]
		
	// [methods]

	/*
	 * [public]
	 * blockIterator(blockNum, start, function(row, col, cellid))
	 *
	 * Iterates a given block of the sudoku by calling "function" for
	 * each row and column of this block. The iteration starts from the
	 * "start"th cell inside the block.
	 *
	 */
	this.blockIterator = function(blockNum, start, func) {
		var vRowOffset = blockNum - (blockNum % this.size);
		var vColOffset = (blockNum % self.size) * this.size;
		
		var vRowStart = vRowOffset + Math.floor(start / this.size);
		var vColStart = vColOffset + (start % this.size);
		
		var cellId = 0;
		
		for (var row = vRowStart; row < vRowOffset + this.size; row ++) {
			for (var col = vColStart; col < vColOffset + this.size; col ++) {
				func(row, col, cellId);
				cellId ++;				
			}
			
			vColStart = vColOffset;
		}
	};
	
	/*
	 * [private]
	 * this.getBlockId(row, col)
	 *
	 * Returns the block number which belongs to a cell in "row", "col".
	 *
	 */
	this.getBlockId = function(row, col) {
		return (Math.floor(row / self.size) * self.size) + Math.floor(col / self.size);
	};
	
	/*
	 * [public]	
	 * recalulateOptions
	 *
	 * Recalculates all available options inside a sudoku
	 *
	 */
	var recalculateOptions = function() {
	
		// Initialize data structure
		for (var id = 0; id < self.fullSize; id ++) {
			self.perRowOptions[id][val] = new Array(self.fullSize);
			self.perColumnOptions[id][val] = new Array(self.fullSize);
			self.perBlockOptions[id][val] = new Array(self.fullSize);				
		
			for (var val = 0; val < self.fullSize; val ++) {
				self.perRowOptions[id][val] = true;
				self.perColumnOptions[id][val] = true;
				self.perBlockOptions[id][val] = true;				
			}
		}
	
		// Detect options in rows, columns, blocks
		for (var row = 0; row < self.fullSize; row ++) {
			for (var col = 0; col < self.fullSize; col ++) {
				var fixedValue = self.cells[row][col].fixedValue;
			
				if (fixedValue != -1) {
					// Assert: Value might not be fixed twice in a row, block or column
					if (self.perRowOptions[row][val] == false)
						throw "Value "+val+" already set in row "+row;
					if (self.perColumnOptions[col][val] == false)
						throw "Value "+val+" already set in col "+col;
					if (self.perBlockOptions[self.getBlockId(row,col)][val] == false)
						throw "Value "+val+" already set in block "+self.getBlockId(row,col);
						
					// Disable option 	
					self.perRowOptions[row][fixedValue] = false;
					self.perColumnOptions[col][fixedValue] = false;
					self.perBlockOptions[self.getBlockId(row, col)][fixedValue] = false;					
				}
			}
		}
		
		// Set options per cell
		for (var row = 0; row < self.fullSize; row ++) {
			for (var col = 0; col < self.fullSize; col ++) {
				self.cells[row][col].optionCount[val] = 0;

				for (var val = 0; val < self.fullSize; val ++) {
					if (   self.perRowOptions[row][val]
					    && self.perColumnOptions[col][val]
					    && self.perBlockOptions[self.getBlockId(row,col)][val]
					   ) 
					{
						self.cells[row][col].option[val] = true;
						self.cells[row][col].optionCount[val] ++;
					}
				}
			
			}
		}
	};

	/*
	 * [private]
	 * optionAvailable(row, col, val)
	 *
	 */
	var optionAvailable = function(row, col, val) {
		return    self.perRowOptions[row][val]
		       && self.perColumnOptions[col][val]
		       && self.perBlockOptions[self.getBlockId(row, col)][val];
	}
	
	/*
	 * [private]
	 * updateCellOptions(row, col, val, state)
	 *
	 */
	var updateCellOptions = function(row, col, val, state) {
		var increment;
		
		if (state)
			increment = 1;
		else
			increment = -1;
	
		for (var id = 0; id < self.fullSize; id ++) {
			if (self.cells[row][id].option[val] != state) {
				if ((state && optionAvailable(row, id, val)) || (!state)) {
					self.cells[row][id].option[val] = state;					
					self.cells[row][id].optionCount += increment;
					self.cellChanged(row, id, false);
				}
			}
			
			if (self.cells[id][col].option[val] != state) {
				if ((state && optionAvailable(id, col, val)) || (!state)) {
					self.cells[id][col].option[val] = state;					
					self.cells[id][col].optionCount += increment;
					self.cellChanged(id, col, false);
				}
			}
		}
		
		self.blockIterator(self.getBlockId(row, col), 0,
			function(row, col, cellId) {
				if ((state && optionAvailable(row, col, val)) || (!state)) {
					self.cells[row][col].option[val] = state;					
					self.cells[row][col].optionCount += increment;
					self.cellChanged(row, col, false);
				}
			}
		);
	};	
	
	
	/*
	 * [public]
	 * setFixedValue(row, col, val)
	 *
	 * Sets a value in to a given cell and removes all options in the
	 * same row, column and block according to that value. If "val" is
	 * "nil" or "-1" the function "unsetFixedValue" will be called
	 *
	 */
	this.setFixedValue = function(row, col, val) {
		if ((val == null) || (val == -1))
			this.unsetFixedValue(row, col);
		
		// Assert: The value might not be set already
		if (this.perRowOptions[row][val] == false)
			throw "Value "+val+" already set in row "+row;
		if (this.perColumnOptions[col][val] == false)
			throw "Value "+val+" already set in col "+col;
		if (this.perBlockOptions[this.getBlockId(row,col)][val] == false)
			throw "Value "+val+" already set in block "+this.getBlockId(row,col);

		// Assert: Don't set fixed fields
		if (this.cells[row][col].fixedValue != -1)
			throw "Field "+row+"/"+col+" already assigned.";
		
		// Set field as fixed
		this.cells[row][col].fixedValue = val;
			
		// Deactivate value in the row, column, block table
		this.perRowOptions[row][val] = false;
		this.perColumnOptions[col][val] = false;		
		this.perBlockOptions[this.getBlockId(row, col)][val] = false;
		
		// Deactivate value in the cells of the according rows, columns and blocks
		updateCellOptions(row, col, val, false);

		self.cellChanged(row, col, false);
	};
	
	/*
	 * [public]
	 * unsetFixedValue(row, col)
	 *
	 * Removes a fixed value from a given cell and sets it (if possible)
	 * as an option to other cells
	 *
	 */
	this.unsetFixedValue = function(row, col) {
		var fixedValue;
	
		fixedValue = this.cells[row][col].fixedValue;
		
		// Assert: Field not assigned to a value
		if (fixedValue == -1)
			throw "Field not assigned to a value.";
	
		// Assert: Don't unset a predefined field
		if (this.cells[row][col].isPredefined)
			throw "Field is predefined.";
	
		// Assert: The value have to be set allreaddy
		if (this.perRowOptions[row][fixedValue] == true)
			throw "Value "+fixedValue+" not set in row "+row;
		if (this.perColumnOptions[col][fixedValue] == true)
			throw "Value "+fixedValue+" not set in col "+col;
		if (this.perBlockOptions[this.getBlockId(row,col)][fixedValue] == true)
			throw "Value "+fixedValue+" not set in block "+this.getBlockId(row,col);
			
		// Reactivate field
		this.cells[row][col].fixedValue = -1;
		this.cells[row][col].option[fixedValue] = true;
		this.cells[row][col].optionCount[fixedValue] += 1;

		// Regenerate tables
		this.perRowOptions[row][fixedValue] = true;
		this.perColumnOptions[col][fixedValue] = true;		
		this.perBlockOptions[this.getBlockId(row, col)][fixedValue] = true;		
			
		// Reactivate value in the cells of the according rows, columns, blocks
		updateCellOptions(row, col, fixedValue, true);	
		
		this.cellChanged(row, col, true);
	};
	
	// [constructor::post]

		// Initializing data structures
		for (var row = 0; row < this.fullSize; row ++) {
			this.cells[row] = new Array(this.fullSize);
			
			for (var col = 0; col < this.fullSize; col ++) {
				this.cells[row][col] = {"option": new Array(this.fullSize), 
							"optionCount": 0, 
							"fixedValue": -1,
							"isPredefined": false
						       };
			}
		}

		for (var i = 0; i < this.fullSize; i ++) {
			this.perRowOptions[i] = new Array(this.fullSize);
			this.perColumnOptions[i] = new Array(this.fullSize);
			this.perBlockOptions[i] = new Array(this.fullSize);						
		}

		var row = 0;

		// Parsing the puzzle
		for (var lineKey in input.table) {
			var line = input.table[lineKey];
						
			if (line.substr(0,1) == "+") 
				continue;
			
			var fields = line.split(" ");

			var col = 0;
			
			for (var fieldKey in fields) {
				var field = fields[fieldKey];
				
				if (field.charAt(0) == "_") {
					col ++;
					continue;
				}
				
				
				if (field == "|")
					continue;
					
				this.cells[row][col].option[Number(field) - 1] = true;
				this.cells[row][col].optionCount = 0;
				this.cells[row][col].fixedValue = Number(field) - 1;
				this.cells[row][col].isPredefined = true;
				
				col ++;
			}
			
			row ++;
		}
		
		// Set options array
		recalculateOptions();	
}

