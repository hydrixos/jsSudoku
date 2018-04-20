/*
 * jsSudoku
 *
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the GNU General Public License V2
 *
 * controller.js
 * Controller of the user interface
 *
 */
 /*
  * MainController
  *
  * Constructor:
  *	Creates a controller object, which initializes all views and the model.
  *	The controller expects the HTML document to contain the following elements:
  *
  *		- sudokuSelectionPanel
  *		- puzzlePanel
  *		- clausePanel
  *		- unitPanel
  *
  * Properties
  *		- basicPuzzles		Predefined puzzles available to the user
  *		- sudokuSelectionPanel
  *		- puzzlePanel
  *		- clausePanel
  *		- unitPanel
  *		- sudokuSelector	The selection menu for sudokus
  *		- sudokuView
  *		- sudokuModel
  *		- cnfModel
  *		- cnfView
  *
  * Methods
  *		- initPuzzleSelection	Initializes the puzzle selection
  *		- updatePuzzleSelection	Updates the puzzle selection
  *
  *		- initView		Initializes the views
  *		- changeModel		Sets a new model
  *
  *		- fixOption		Fixes an option (callback for sudoku-view)
  *		- deleteFixed		Deltes an fixed value (callback for sudoku-view)
  *		- cellChanged		Processes a change of a cell (callback for sudoku-model)
  *		- hoverOption		Mouse hovers an option
  *		- leftOption		Mouse left an option
  *		- propagated		Processes a propagation of a unit (callback for cnf-model)
  *		- clauseChanged		Processes a change of a clause (callback for cnf-model)
  *		- userPropagation	Process a propagation request from the user (callback for cnf-view)
  *
  */
function MainController() {
		var self = this;

	// [properties]
		var basicPuzzles = new Array();
		var sudokuSelectionPanel;
		var puzzlePanel;
		var clausePanel;
		var unitPanel;
		var messagePanel;
		var messageBox;
		var messageText;
		
		var sudokuSelector;
		
		var sudokuView;
		var sudokuModel;
		var cnfModel;
		var cnfView;
		
		
	// [constructor::pre]
		basicPuzzles[0] = table_2_1;
		basicPuzzles[1] = table_3_1;
		basicPuzzles[2] = table_2_2;
		basicPuzzles[3] = table_3_2;

		sudokuSelectionPanel = document.getElementById("sudokuSelectionPanel");
		puzzlePanel = document.getElementById("puzzlePanel");		
		clausePanel = document.getElementById("clausePanel");				
		unitPanel = document.getElementById("unitPanel");
		messagePanel = document.getElementById("messagePanel");
		
		messageBox = document.createElement("div");
		messageBox.setAttribute("class", "messageEmpty");
		messageText = document.createTextNode("");
		messageBox.appendChild(messageText);
		messagePanel.appendChild(messageBox);
		
	// [methods]
		this.writeMessage = function(text) {
			messageBox.firstChild.nodeValue = text;
			messageBox.setAttribute("class", "messageAlert");
		}

		this.writeNotification = function(text) {
			messageBox.firstChild.nodeValue = text;
			messageBox.setAttribute("class", "messageNotification");
		}
	
		this.hideMessage = function() {
			messageText = "";
			messageBox.setAttribute("class", "messageEmpty");
		}
	
		var unsatError = function() {
			self.writeMessage("At least one clause is not satisfiable!");
		}
	
		var isUnsatState = function() {
			return (cnfModel.unsatCount > 0);
		}
	
		var updatePuzzleSelection = function() {
			var selection;
			var puzzle;
			var model;
		
			self.hideMessage();
		
			selection = sudokuSelector.options[sudokuSelector.selectedIndex].value;
			
			if (selection == -1) 
				return;
			
			puzzle = basicPuzzles[selection];
			model = new Sudoku(puzzle);
			
			changeModel(model);
		};

		var optionHovered = function(row, col, val) {
			cnfView.highlightLiteral(new Literal(row, col, val, true));
		}

		var optionLeft = function(row, col, val) {
			cnfView.unhighlightLiteral(new Literal(row, col, val, true));
		}
		
		var initialPropagatedUnit = function(row, col, val, state) {
			if (state == true) {
				if (sudokuModel.cells[row][col].fixedValue != val) {
					/* Make top level units to predefined values in the sudoku representation */
					sudokuModel.setFixedValue(row, col, val);
					sudokuModel.cells[row][col].isPredefined = true;
					sudokuView.lockCell(row, col);
				}
			}
			 else if (sudokuModel.cells[row][col].fixedValue == -1) {
			 	sudokuView.hideOption(row, col, val);
			 }
		}		
		
		var propagatedUnit = function(row, col, val, state) {
			self.hideMessage();
		
			if (isUnsatState()) {
				unsatError();
				return true;
			}		
		
			if (state == true) {
				if (sudokuModel.cells[row][col].fixedValue != val)
					sudokuModel.setFixedValue(row, col, val);
			}
			 else if (sudokuModel.cells[row][col].fixedValue == -1) {
			 	sudokuView.hideOption(row, col, val);
			 }
		}

		var userPropagation = function(literal) {
			var propState;
		
			if (isUnsatState()) {
				unsatError();
				return true;
			}
		
			self.hideMessage();
		
			sudokuView.unhighlightCell(literal.row, literal.col, literal.value, literal.state);
			propState = cnfModel.propagateUnit(literal);
		
			if (propState == -2) {
				self.writeMessage("Unit already set");
				return;
			}
			 else if (propState == -3) {
			 	self.writeMessage("Unit generates contradiction to the current state!");
			 	return;
			 }
			
			propagatedUnit(literal.row, literal.col, literal.value, literal.state);
			
			return true;
		}
		
		var propagateAll = function() {
			if (isUnsatState()) {
				unsatError();
				return false;
			}

			self.hideMessage();
		
			cnfModel.propagateAll();
			
			return true;
		}

		var revokeUnit = function(literal) {
			if (sudokuModel.cells[literal.row][literal.col].isPredefined) {
				self.writeMessage("Field is predefined and cannot be changed.");
				return;
			}

			self.hideMessage();

			if (!cnfModel.revokeUnit(literal))
				return;
			
			if (literal.state == true) {
			
				/* Only reset, if it was a non-conflicting unit */
				if (sudokuModel.cells[literal.row][literal.col].fixedValue != -1)			
					sudokuModel.unsetFixedValue(literal.row, literal.col, literal.value);
			}
			else
				sudokuView.unhideOption(literal.row, literal.col, literal.value);
		}

		var fixOption = function(row, col, val) {
			if (isUnsatState()) {
				unsatError();
				return;
			}
			
			self.hideMessage();
		
			cnfView.unhighlightLiteral(new Literal(row, col, val, true));
			if (cnfModel.propagateUnit(new Literal(row, col, val, true)) == -3) {
				self.writeMessage ("Selection contradicts assumptions.");
				return;
			}
			
			//cnfModel.propagateAll();
								
			sudokuModel.setFixedValue(row, col, val);
		}

		var deleteFixed = function(row, col) {
			revokeUnit(new Literal(row, col, sudokuModel.cells[row][col].fixedValue, true));
		}


		var cellChanged = function(row, col, wasFixed) {
			sudokuView.updateCell(row, col);
			
			if ((sudokuModel.cells[row][col].fixedValue == -1) && (cnfModel != null)) {
			
				/* Find out, which options to "hide" */
				for (var optionVal in sudokuModel.cells[row][col].option) {
					var literal = new Literal(row, col, optionVal, false);

					if (cnfModel.assignment[literal.toAtomHashID()] == false)
						sudokuView.hideOption(row, col, optionVal);
				}
			}
			
		}
		
		var revertNegatedOption = function(row, col, val) {
			revokeUnit(new Literal(row, col, val, false));
		}

		var clauseChanged = function(clause) {
			cnfView.updateClause(clause);
		}

		var literalOver = function(literal) {
			sudokuView.highlightCell(literal.row, literal.col, literal.value, literal.state);
		}
		
		var literalOut = function(literal) {
			sudokuView.unhighlightCell(literal.row, literal.col, literal.value, literal.state);
		}

		var changeModel = function(model) {
			self.hideMessage();		
		
			sudokuView.changePuzzle(model);
			model.cellChanged = cellChanged;
			sudokuModel = model;

			cnfModel = null;
			cnfModel = new SudokuCNF(model, initialPropagatedUnit);
			cnfView.changeCNF(cnfModel);
			cnfModel.clauseChanged = clauseChanged;
			cnfModel.propagated = propagatedUnit;
		};
	
		var initPuzzleSelection = function() {
			sudokuSelector = document.createElement("select");
		
			for (var puzzleKey in basicPuzzles) {
				var option = document.createElement("option");
				
				option.text = basicPuzzles[puzzleKey].identifier;
				option.value = puzzleKey;
			
				sudokuSelector.appendChild(option);
			}
		
			/* FIXME */
			var emptyOption = document.createElement("option");
			emptyOption.text = "";
			emptyOption.value = -1;
			emptyOption.setAttribute("selected", "selected");
			sudokuSelector.appendChild(emptyOption);
				
			sudokuSelectionPanel.appendChild(sudokuSelector);

			sudokuSelector.setAttribute("size", "1");
			sudokuSelector.id = "sudokuSelector";			
			sudokuSelector.addEventListener("change", updatePuzzleSelection, true);

		};

		var initViews = function() {
			sudokuView = new SudokuView(puzzlePanel);

			sudokuView.fixOption = fixOption;
			sudokuView.deleteFixed = deleteFixed;
			sudokuView.optionHovered = optionHovered;
			sudokuView.optionLeft = optionLeft;
			sudokuView.revertNegatedOption = revertNegatedOption;

			cnfView = new CNFView(clausePanel, unitPanel);

			cnfView.revokeUnit = revokeUnit;
			cnfView.propagateAll = propagateAll;
			cnfView.propagateUnit = userPropagation;
			cnfView.literalOver = literalOver;
			cnfView.literalOut = literalOut;			
		};

	// [constructor::post]
		initPuzzleSelection();
		initViews();

}

