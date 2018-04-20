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
  * CNFView
  *
  * Constructor:
  *	Creates a view for a CNF model into
  *	a container "cnfContainer" and a textbox
  *	for entering units into "unitContainer". 
  *
  * Callbacks
  *	propagateUnit	The user wants to propagate a unit
  *	propagateAll	The user wants to propagate all units
  *	revokeUnit	The user wants to revoke a unit
  *
  * Properties
  *	cnf		The CNF representation of the puzzle
  *	container	The container output of the puzzle
  *	-list		The list displaying the CNF
  *	-clauses	The clause elements of the CNF
  *	-literals	The list of lists of literal visuals
  *
  * Methods
  *	-initView	Initializes the view and draws it into the container
  *	-destructView	Removes the view from the container and frees all data structures
  *	-setupClause	Creates the visualization of a clause
  *	changeCNF	Changes the CNF
  *	-unitClicked	Reacts on a click to a unit
  *	-unitSubmitted	Reacts on a submit of the unit text field
  *
  *	updateClause	Updates the visualization of a clause
  *
  *	highlightLiteral	Highlights a literal
  *	unhighlightLiteral	Removes the highlighting of a literal
  *
  */
function CNFView(cnfContainer, unitContainer) {
	var self = this;
	
	// [properties]
		this.cnf = null;
		this.container = cnfContainer;
		this.unitContainer = unitContainer;
		this.unitTextBox = null;
		this.unitButton = null;
		this.allButton = null;
		this.revokeButton = null;
		this.separator = null;
		var list = null;
		var clauses = new Object();
		var literals = new Object();
		
	// [callbacks]
		this.propagateUnit = function(literal) {};
		this.revokeUnit = function(literal) {};		
		this.propagateAll = function() {};
		this.literalOver = function(literal) {};
		this.literalOut = function(literal) {};		
	
	// [methods]
	/*
	 * [private]
	 *
	 * unitClicked(event)
	 *
	 * Event handler for clicks on units
	 *
	 */
	var unitClicked = function(event) {
		self.unhighlightLiteral(event.target.literal);
	
		if (self.propagateUnit(event.target.literal) == -2)
			alert("Unit erzeugt Widerspruch!");
	}
	
	/*
	 * [private]
	 *
	 * unsatisfiedClicked(event)
	 *
	 * Event handler for clicking on unsatisfied units
	 *
	 */
	var unsatisfiedClicked = function(event) {
		self.revokeUnit(event.target.literal);
	}
	
	/*
	 * [private]
	 * internalLiteralOver(event)
	 *
	 * Event handler for mouse over literal
	 *
	 */
	var internalLiteralOver = function(event) {
		self.highlightLiteral(event.target.literal);
		
		self.literalOver(event.target.literal);
	}
	
	/*
	 * [private]
	 * internalLiteralOver(event)
	 *
	 * Event handler for mouse over literal
	 *
	 */
	var internalLiteralOut = function(event) {
		self.unhighlightLiteral(event.target.literal);
		
		self.literalOut(event.target.literal);
	}	
	
	/*
	 * [private]
	 * parseInput(text)
	 *
	 * Parses "text" to generate a literal.
	 *
	 */
	var parseInput = function(text) {
		var state = true;
		var row;
		var col;
		var val;
		
		text = text.replace(/(\s*)/g, "");
		
		if (text.search(/not/) == 0)
			state = false;
			
		var values = text.match(/\((\d+)\,(\d+)\)\=(\d+)/);
		
		if (values == null)
			return null;
		
		row = Number(values[1]) - 1;
		col = Number(values[2]) - 1;		
		val = Number(values[3]) - 1;
		
		if (    (row < 0) 
		     || (row > self.cnf.puzzle.fullSize)
		     || (col < 0) 
		     || (col > self.cnf.puzzle.fullSize)		     
		     || (val < 0) 
		     || (val > self.cnf.puzzle.fullSize)
		   )
			return null;
		
		return new Literal(row, col, val, state);
	}
	
	/*
	 * [private]
	 *
	 * unitSubmitted(event)
	 *
	 * Event handler for the unit button
	 *
	 */
	var unitSubmitted = function(event) {
		var input = unitTextBox.value;
		var literal = parseInput(input);
		
		if (literal == null) {
			alert("Eingabe nicht korrekt.");
			return;
		}
		
		unitTextBox.value = "";
		
		self.propagateUnit(literal);
	}	

	/*
	 * [private]
	 *
	 * unitKeyPressed(event)
	 *
	 * Event handler for the unit text field
	 *
	 */
	var unitKeyPressed = function(event) {
		var input = unitTextBox.value;

		if (event.which != 13)
			return;

		var literal = parseInput(input);
			
		if (literal == null) {
			alert("Eingabe nicht korrekt");
			return;
		}

		unitTextBox.value = "";

		self.propagateUnit(literal)
	}	

	/*
	 * [private]
	 *
	 * unitRevoked(event)
	 *
	 * Event handler for the unit button
	 *
	 */
	var unitRevoked = function(event) {
		var input = unitTextBox.value;
		var literal = parseInput(input);
		
		if (literal == null) {
			alert("Eingabe nicht korrekt");
			return;
		}
		
		unitTextBox.value = "";
		
		self.revokeUnit(literal);
	}	

	/*
	 * [private]
	 *
	 * allPropagated(event)
	 *
	 * Event handler for the unit button
	 *
	 */
	var allPropagated = function(event) {
		self.propagateAll();
	}	

	
	/*
	 * [private]
	 * setupSatisfiedClause(clauseContainer)
	 *
	 * Creates the visualization of a satisfied clause.
	 *
	 */
	var setupSatisfiedClause = function(clauseContainer) {
		clauseContainer.setAttribute("class", "clauseContainerSatisfied");
	}
	
	/*
	 * [private]
	 * setupUnsatisfiedClause(clauseContainer)
	 *
	 * Creates the visualization of a unsatisfied clause.
	 *
	 */
	var setupUnsatisfiedClause = function(clauseContainer) {
		clauseContainer.setAttribute("class", "clauseContainerUnsatisfied");

		clauseContainer.literals = new Array();
		
		for (var literalKey in clauseContainer.clause.literals) {
			var literal = clauseContainer.clause.literals[literalKey];
			var literalContainer = document.createElement("div");	
			
			literalContainer.setAttribute("class", "literalContainerUNSAT");
			literalContainer.addEventListener("click", unsatisfiedClicked, true);
							
			literalContainer.literal = literal;
			
			var literalText = document.createTextNode(literalContainer.literal.toString());
			
			literalContainer.appendChild(literalText);
			clauseContainer.appendChild(literalContainer);
			
			if (self.literals[literalContainer.literal.toHashID()] == null)
				self.literals[literalContainer.literal.toHashID()] = new Array;
				
			self.literals[literalContainer.literal.toHashID()].push(literalContainer);
			clauseContainer.literals.push(literalContainer);				
		}
	}	
	
	/*
	 * [private]
	 * setupUnassignedClause(clauseContainer)
	 *
	 * Creates the visualization of a not-completly assigned clause.
	 *
	 */
	var setupUnassignedClause = function(clauseContainer) {
		clauseContainer.setAttribute("class", "clauseContainerUnassigned");
		clauseContainer.literals = new Array();
		
		for (var literalKey in clauseContainer.clause.literals) {
			var literal = clauseContainer.clause.literals[literalKey];
			var literalContainer = document.createElement("div");
	
			/* Show only unassigned literals */		
			if (literal.getAssignment() == -1) {
			
				if (clauseContainer.clause.unit == literalKey) {
					literalContainer.setAttribute("class", "literalContainerUnit");
				}
				 else {
					literalContainer.setAttribute("class", "literalContainer");
				}

				literalContainer.addEventListener("click", unitClicked, false);
			}
			else 
				literalContainer.setAttribute("class", "literalContainerAssigned");
			
			literalContainer.oldStyle = literalContainer.getAttribute("class");
			literalContainer.addEventListener("mouseover", internalLiteralOver, true);
			literalContainer.addEventListener("mouseout", internalLiteralOut, true);
				
			literalContainer.literal = literal;
			
			var literalText = document.createTextNode(literalContainer.literal.toString());
			
			literalContainer.appendChild(literalText);
			clauseContainer.appendChild(literalContainer);
			
			if (self.literals[literalContainer.literal.toHashID()] == null)
				self.literals[literalContainer.literal.toHashID()] = new Array;
				
			self.literals[literalContainer.literal.toHashID()].push(literalContainer);
			clauseContainer.literals.push(literalContainer);
		}
	}		
	
	/*
	 * [private]
	 * removeLiteralLinks
	 *
	 * Removes the literal links of a clause visualization
	 *
	 */
	var removeLiteralLinks = function(clause) {
		var oldContainer = clauses[clause.toHashID()];
		
		for (var literalKey in oldContainer.literals) {
			var literalContainer = oldContainer.literals[literalKey];
			var literal = literalContainer.literal;
			
			for (var containerKey in literals[literal.toHashID()]) {
				if (literals[literal.toHashID()][containerKey] == literalContainer)
					delete self.literals[literal.toHashID()][literalKey];
			}
		}
	}
	
	/*
	 * [private]
	 * createClauseVisual
	 *
	 * Creates a clause visualization
	 *
	 */
	var createClauseVisual = function(clause) {
		var clauseContainer = document.createElement("div");
		
		clauseContainer.clause = clause;

		if (clause.satisfied > 0)
			setupSatisfiedClause(clauseContainer);
		else if (clause.undef == 0)
			setupUnsatisfiedClause(clauseContainer);
		else
			setupUnassignedClause(clauseContainer);
			
		return clauseContainer;
	}	
	
	/*
	 * [private]
	 * setupClause(clause)
	 *
	 * Creates a visualization of a clause
	 *
	 */
	var setupClause = function(clause) {
		var clauseContainer = createClauseVisual(clause);

		self.list.appendChild(clauseContainer);
		
		clauses[clauseContainer.clause.toHashID()] = clauseContainer;
	}
	
	/*
	 * [public]
	 * updateClause(clause)
	 *
	 * Updates the visualization of a clause
	 *
	 */
	this.updateClause = function(clause) {
		var clauseContainer = createClauseVisual(clause);

		removeLiteralLinks(clause);

		if (clause.unit != -1) {
			self.list.removeChild(clauses[clause.toHashID()]);
			self.list.appendChild(clauseContainer);
		}
		 else {
			self.list.replaceChild(clauseContainer, clauses[clause.toHashID()]);
		}

		/* Auto-scroll, if unsatisfied */
		if ((clause.undef == 0) && (clause.satisfied == 0)) {
			self.list.scrollTop = clauseContainer.offsetTop;
		}
		
		clauses[clause.toHashID()] = clauseContainer;
	}
	
	/*
	 * [private]
	 * initView
	 *
	 * Initializes the CNF View
	 *
	 */
	var initView = function() {
		self.list = document.createElement("div");
		self.list.id = "cnfList";
		
		self.clauses = new Object();
		self.literals = new Object();
		
		for (var clauseKey in self.cnf.clauses) {
			setupClause(self.cnf.clauses[clauseKey]);
		}
		
		self.container.appendChild(self.list);	

		unitTextBox.style["display"] = "";
		unitButton.style["display"] = "";		
		allButton.style["display"] = "";
		revokeButton.style["display"] = "";		
	}
	
	/*
	 * [private]
	 * destructView
	 *
	 * Destructs the CNF View
	 *
	 */
	var destructView = function() {
		if (self.list == null)
			return;
		
		for (var clauseKey in self.clauses) {
			self.list.removeChild(self.clauses[clauseKey]);
			delete self.clauses[clauseKey];
		}
		
		self.container.removeChild(self.list);
		delete self.list;
	}
	

	
	/*
	 * [private]
	 * setLiteralHighlight
	 *
	 * Sets the higlight of a given literal
	 *
	 */
	var setLiteralHighlight = function(literal, highlight) {
		var literalKey = literal.toHashID();

		/* Highlight unsatisfied */
		if (self.literals[literalKey] != null) {
			for (var literalVisKey in self.literals[literalKey]) {
				var element = self.literals[literalKey][literalVisKey];
			
				if (highlight != null) {			
					element.oldStyle = element.getAttribute("class");
					element.setAttribute("class", highlight);
				}
				 else {
				 	element.setAttribute("class", element.oldStyle);
				}
			}
		}	
	}
		
	/*
	 * [public]
	 * highlightLiteral
	 *
	 * Highlights a literal
	 *
	 */
	this.highlightLiteral = function(literal) {
		var otherLit = new Literal(literal.row, literal.col, literal.value, !literal.state);
		
		setLiteralHighlight(literal, "literalContainerSAT");
		setLiteralHighlight(otherLit, "literalContainerUNSAT");
	}
	
	/*
	 * [public]
	 * unhighlightLiteral
	 *
	 * Removes the highlighting of a literal
	 *
	 */
	this.unhighlightLiteral = function(literal) {
		var otherLit = new Literal(literal.row, literal.col, literal.value, !literal.state);
		
		setLiteralHighlight(literal, null);
		setLiteralHighlight(otherLit, null);
	}	
	
	/*
	 * [public]
	 * changeCNF
	 *
	 * Changes the shown CNF model.
	 *
	 */
	this.changeCNF = function(model) {
		this.cnf = model;
		
		destructView();
		initView();
	}

	// [constructor:post]
		unitTextBox = document.createElement("input");
		unitTextBox.id = "unitTextBox";
		unitTextBox.size = 60;
		
		unitButton = document.createElement("div");
		unitButton.id = "unitButton";
		unitButton.appendChild(document.createTextNode("Propagate"));

		seperator = document.createElement("div");
		seperator.setAttribute("class", "unitButtonSeperator");

		revokeButton = document.createElement("div");
		revokeButton.id = "revokeButton";
		revokeButton.appendChild(document.createTextNode("Revoke"));

		seperator = document.createElement("div");
		seperator.setAttribute("class", "buttonSeperator");

		allButton = document.createElement("div");
		allButton.id = "allButton";
		allButton.appendChild(document.createTextNode("Automatic"));


		/* Add views */		
		unitContainer.appendChild(unitTextBox);
		unitContainer.appendChild(unitButton);
		unitContainer.appendChild(revokeButton);		
		//unitContainer.appendChild(seperator);
		unitContainer.appendChild(allButton);				
		
		unitTextBox.style["display"] = "none";
		unitButton.style["display"] = "none";
		allButton.style["display"] = "none";
		revokeButton.style["display"] = "none";
		
		unitButton.addEventListener("click", unitSubmitted, false);
		unitTextBox.addEventListener("keypress", unitKeyPressed, false);		
		revokeButton.addEventListener("click", unitRevoked, false);
		allButton.addEventListener("click", allPropagated, false);
}

