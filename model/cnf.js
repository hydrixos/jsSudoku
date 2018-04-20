/*
 * jsSudoku
 *
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the GNU General Public License V2
 *
 * cnf.js
 * Model of the CNF representation
 *
 */

/*
 * Literal(row, col, value, state)
 *
 * Constructor:
 *	Creates a representation of a literal, which represents the fact
 *	that in "row", "col" a value "value" is set or not depending on a
 *	given state "state".
 *
 * Properties:
 *	row, col, value, state, assignment
 *
 * Methods
 *	toString	Converts a literal to a string
 *	toHashID	Converts a literal to a JSON hash identifier
 *
 *	isEqualAtom	Tests whether the absolute value of a literal is equal
 *	isEqual		Tests whether the literal is equal to another literal
 *
 *	setAssignment	Sets the assignment of the literal
 *	getAssignment	Return the assignment of the literal
 *
 */
function Literal(row, col, value, state)
{
	// [properties]
		this.row = row;
		this.col = col;
		this.value = value;
		this.state = state;
		this.assignment = -1;
		
	// [methods]
		this.toString = function() {
			var stateStr = "";
		
			if (this.state == true)
				stateStr = "";
			else
				stateStr = "not ";
		
			return stateStr+"("+(this.row+1)+","+(this.col+1)+") = "+(this.value+1);
		};
		
		this.toHashID = function() {
			var stateStr = "";
		
			if (this.state == true)
				stateStr = "t";
			else
				stateStr = "f";
		
			return stateStr+"R"+this.row+"C"+this.col+"V"+this.value;			
		};
		
		this.toAtomHashID = function() {
			var stateStr = "";
		
			return this.row << 16 | this.col << 8 | this.value;
		};		

		this.isEqualAtom = function(literal) {
			return     (this.row == literal.row) 
				&& (this.col == literal.col) 
				&& (this.value == literal.value)
				;
		};
		
		this.isEqual = function(literal) {
			return this.isEqualAtom(literal) && (this.state == literal.state);
		};
		
		/*
		 * [public]		
		 * setAssignment(assignment)
		 *
		 * Sets the assignment of a literal:
		 *
		 *	-1	UNDEF
		 *	0	UNSAT
		 *	1	SAT
		 *
		 */
		this.setAssignment = function(assignment) {
			this.assignment = assignment;
		};
		
		this.getAssignment = function() {
			return this.assignment;
		};
}
 
 
 
/*
 * Clause()
 *
 * Constructor:
 * 	Creates a representation of a clause
 *
 * Properties:
 *	literals	Set of literals
 *	undef		Count of undefined literals
 *	satisfied	Count of satisfied literals
 *	unit		ID of unit literal iff clause is unit
 *
 * Methods:
 *	contains	Tests whether a literal is inside the set or not
 *	containsAtom	Tests whether a atom is inside the set or not
 *
 *	add		Adds a literal (keeping set property, tests for contradiction)
 *
 *	propagate	Propagates a literal
 *	restore		Restores a literal to the undefined state
 *
 *	toString	Converts a clause to a string
 *	toHashID	Converts a clause to a JSON hash identifier
 *
 */
function Clause() 
{
	// [properties]
		this.literals = new Array();
		this.satisfied = 0;
		this.undef = 0;
		this.unit = null;
		
	// [methods]
	
		/*
		 * [public]		
		 * containsAtom(literal)
		 *
		 * Tests whether the atom of a literal is inside the clause or not.
		 *
		 * Return:
		 *	-1	If not
		 *	>-1	Index of the first occurence of the atom
		 *
		 */
		this.containsAtom = function(literal) {
			for (var literalKey in this.literals) {
				if (this.literals[literalKey].isEqualAtom(literal))
					return literalKey;
			}
			
			return -1;
		};

		/*
		 * [public]		
		 * contains(literal)
		 *
		 * Tests whether a literal is inside the clause or not.
		 *
		 * Return:
		 *	-1	If not
		 *	>-1	Index of the first occurence of the literal
		 *
		 */

		this.contains = function(literal) {
			for (var literalKey in this.literals) {
				if (literals[literalKey].isEqual(literal))
					return literalKey;
			}
			
			return -1;
		};
	
	
		/*
		 * [public]		
		 * add(literal)
		 *
		 * Adds the given literal object to the set of literals
		 * by keeping the set property. Also this functions tests
		 * if adding this literal would lead to a contradiction.
		 *
		 * Return:
		 *	false	Adding this literal would lead to a contradiction
		 *	true	Literal was added (or was already inside)
		 *
		 */
		this.add = function(literal) {
			var atomKey = this.containsAtom(literal);
		
			if (atomKey != -1) {
				if (this.literals[atomKey].state != literal.state)
					return false;
				else
					return true;
			}
						
			this.literals.push(literal);
			this.undef ++;

			if (this.undef == 1)
				this.unit = (this.literals.length - 1);
			else
				this.unit = -1;
				
			return true;
		};

		/*
		 * [public]		
		 * propagate(literal)
		 *
		 * Propagates a given literal inside the clause. If
		 * propagation leads to an empty clause, the clause will
		 * be marked as empty. If the propagation leads to a satisfied clause,
		 * the clause will be marked as satisfied.
		 *
		 * Return value:
		 *	-2	No literal was propagated
		 *	-1	State of clause remains unchanged
		 *	0	Clause is now UNSAT
		 *	1	Clause is satisfied
		 *
		 */
		this.propagate = function(literal) {
			var atomKey = this.containsAtom(literal);

			if (atomKey == -1)
				return -2;

			/* Assertion: literal should not be assigned already */
			if (this.literals[atomKey].getAssignment() != -1)
				throw "Literal "+this.literals[atomKey].toString+" is already assigned to "+this.literals[atomKey].getAssignment();

			if (this.literals[atomKey].state != literal.state) {
				/* Remove literal */
				this.literals[atomKey].setAssignment(0);
				this.undef --;
				
				if (this.undef == 1) {
					/* Search unit */
					
					for (var unitKey in this.literals) {
						if (this.literals[unitKey].getAssignment() == -1) {
							this.unit = unitKey;
							break;
						}
					}
				}
				
				if ((this.undef == 0) && (this.satisfied == 0)) {
					return 0;
				} else
					return -1;
			}
			 else
			{
				/* Set clause as satisfied */
				this.literals[atomKey].setAssignment(1);
				this.satisfied ++;
				this.undef --;
				this.unit = -1;
				
				return 1;
			}
		};
		
		/*
		 * [public]		
		 * restore(literal)
		 *
		 * Resets the state of a given atom of a literal "literal" to
		 * UNDEF. The clause will be marked non-empty or non-satisfied if needed.
		 *
		 * Return value:
		 *	true	Clause is reactivated
		 *	false	Clause remains in its old state
		 *	
		 */
		this.restore = function(literal) {
			atomKey = this.containsAtom(literal);

			if (atomKey == -1)
				return false;

			/* Assertion: literal should be assigned already */
			if (this.literals[atomKey].getAssignment() == -1)
				throw "Literal "+this.literals[atomKey].toString+" is not assigned!";

			if (this.literals[atomKey].getAssignment() == 0) {
				/* Literal was false under the assignment */
				this.literals[atomKey].setAssignment(-1);
			}
			 else
			{
				/* Set clause as not satisfied */
				this.literals[atomKey].setAssignment(-1);
				this.satisfied --;
			}

			this.undef ++;

			if (this.undef == 1)
				this.unit = atomKey;
			else
				this.unit = -1;			

			return true;
		};
		 
		/*
		 * [public]		
		 * toString()
		 *
		 * Creates a string representation of the clause.
		 *
		 */
		this.toString = function() {
			if (this.satisfied > 0)
				return "true";

			var retval = "[";
			
			for (var literalKey in this.literals) {
				if (this.literals[literalKey].getAssignment() == -1)
					retval += this.literals[literalKey].toString() +",";
			}
			
			if (retval.length > 1)
				retval = retval.substr(0, retval.length - 1);
			
			retval += "]";
			
			return retval;
		};

		/*
		 * [public]		
		 * toString()
		 *
		 * Creates a string representation of the clause.
		 *
		 */		
		this.toStringNoAssignment = function() {
			var retval = "[";
			
			for (var literalKey in this.literals) {
				retval += this.literals[literalKey].toString() +",";
			}
			
			if (retval.length > 1)
				retval = retval.substr(0, retval.length - 1);
			
			retval += "]";
			
			return retval;
		};		
		 
		/*
		 * [public]
		 * toHashID()
		 *
		 * Creates a string representation of the clause which can be used as
		 * hash identifier.
		 *
		 */
		this.toHashID = function() {
			var retval = "_";
			
			for (var literalKey in this.literals) {
				retval += this.literals[literalKey].toHashID() +"_";
			}
			
			retval += "_";
			
			return retval;
		};
}
 
/*
 * SudokuCNF(puzzle, listener)
 *
 * Constructor:
 *	Creates a CNF representation based on a given puzzle. If a unit
 *	can be propagated, the according field of the puzzle will be set.
 *	All propagations will be notified through the given listener.
 *
 * Callbacks:
 *	clauseChanged	Notifies that the content of a clause has been changed
 *
 * Properties:
 *	puzzle		Associated puzzle
 *	clauses		List of clauses
 *	satCount	Count of satisfied clauses
 *	units		Propagation queue
 *	watches		Watcher lists (per literal)
 *	
 * Methods:
 *	-registerClause		Registers a clause to the watcher lists
 *	-addDualClause		Adds a dual clause
 *	-buildFromPuzzle	Create CNF based on the given puzzle
 *
 *	propagateUnit		Propagates a unit
 *	revokeUnit		Revokes a unit
 *
 *	propagateAll		Propagates all units
 *
 */
function SudokuCNF(puzzle, listener) 
{
	var self = this;
	
	// [properties]
		this.puzzle = puzzle;
		this.clauses = new Object();
		this.satCount = 0;
		this.unsatCount = 0;		
		this.clauseCount = 0;
		this.units = new Array();
		this.assignment = new Object();
		this.watches = new Object();

	// [callbacks]
		this.propagated = listener;
		this.clauseChanged = function(clause) {};

	// [methods]
	/*
	 * [private]
	 * registerClause(clause)
	 *
	 * Adds a clause to the watcher lists. If a unit clause
	 * was added, the clause will not added to the watcher
	 * lists but to the propagation queue.
	 *
	 */
	var registerClause = function(clause) {
		/* Never add top-level units */
		if (clause.unit != -1) {
			self.units.push(clause.literals[0]);
			return;
		}

		/* Add to global clause list */
		if (self.clauses[clause.toHashID()] == null)
			self.clauses[clause.toHashID()] = clause;
		else
			return;
			
		self.clauseCount ++;
		
		/* Add to watcher lists */
		for (var literalKey in clause.literals) {
			var literal = clause.literals[literalKey];
		
			if (self.watches[literal.toAtomHashID()] == null)
				self.watches[literal.toAtomHashID()] = new Array();
			
			self.watches[literal.toAtomHashID()].push(clause);
		}
	} 
	
	/*
	 * [private]
	 * addDualClause(row1, col1, value1, row2, col2, value2)
	 *
	 * Adds a dual clause describing that "(row1, col1) = value1 |====> not(row2, col2) = value2"
	 */
	var addDualClause = function(row1, col1, value1, row2, col2, value2) {
		var clause = new Clause();
		var literal1 = new Literal(row1, col1, value1, false);
		var literal2 = new Literal(row2, col2, value2, false);

		clause.add(literal1);
		clause.add(literal2);
		
		registerClause(clause);
	};
	/*
	 * [public]
	 * propagateUnit(unit)
	 *
	 * Propagates the given unit.
	 *
	 * Return values:
	 *	-3	Contradictory to current assignment
	 *	-2	Already assigned
	 *	-1	No changes
	 *	0	UNSAT
	 *	1	SAT
	 */
	this.propagateUnit = function(unit) {
		/* Test assignment */
		if (this.assignment[unit.toAtomHashID()] != null) {
			if (this.assignment[unit.toAtomHashID()] != unit.state)
				return -3;
			else
				return -2;
		}

		/* Update clauses */
		for (var clauseKey in this.watches[unit.toAtomHashID()]) {
			var clause = this.watches[unit.toAtomHashID()][clauseKey];
			var state = clause.propagate(unit);

			if (state == 0)
				this.unsatCount ++;
			else if (state == 1)
				this.satCount ++;
			else if (state == -1) {
			
				/* Found unit */
				if (clause.undef == 1) {
					this.units.push(clause.literals[clause.unit]);
				}
			}
			
			/* Notify every clause that have been changed */
			if (state != -2) {
				this.clauseChanged(clause);					
			}
				
		}
		
		/* Set Assignment */
		this.assignment[unit.toAtomHashID()] = unit.state;
				
		/* Update state */
		if (this.unsatCount > 0)
			return 0;
		
		if (this.satCount == this.clauseCount)
			return 1;
			
		return -1;
	};
	
	/*
	 * [public]
	 * revokeUnit(unit)
	 *
	 * Revokes the given unit.
	 *
	 * Return values:
	 *	-1	No changes
	 *	0	State now undefined again
	 */
	this.revokeUnit = function(unit) {
		var isUnsat = false;
	
		if (this.assignment[unit.toAtomHashID()] == null)
			return false;
	
		/* Update clauses */
		for (var clauseKey in this.clauses) {
			var state = 0;
			var oldState = -1;
			var clause = this.clauses[clauseKey];
			var oldUnit = clause.literals[clause.unit];

			/* Save UNSAT */
			if ((clause.undef == 0) && (clause.satisfied == 0)) {
				oldState = 0;
			}

			/* Save SAT */
			if (clause.satisfied > 0) {
				oldState = 1;
			}

			state = this.clauses[clauseKey].restore(unit);
			
			if ((state == true) && (oldState == 0))
				this.unsatCount --;
			else if ((state == true) && (oldState == 1))
				this.satCount --;
			
			/* Notify all changes */
			if (state == true) {
			
				this.clauseChanged(clause);
			}
			
			/* Revoke units from unit stack */	
			if ((oldState == -1) && (clause.undef == 2) && (oldUnit != null)) {
				for (var literal in this.units) {
					if (this.units[literal].isEqual(oldUnit)) {
						this.units.splice(literal, 1);
						continue;
					}
				}
			}
		}
			
		/* Set Assignment */
		this.assignment[unit.toAtomHashID()] = null;			
			
		return true;
	};
	
	/*
	 * [public]
	 * propagateAll()
	 *
	 * Propagates all units. If a unit was propagated, the propagation
	 * notifier will be called.
	 *
	 */
	this.propagateAll = function(notifier) {
		while(this.units.length > 0) {
			var unit = this.units.pop();
			
			if (this.assignment[unit.toAtomHashID()] == unit.state)
				continue;
			else if (this.assignment[unit.toAtomHashID()] != null)
				throw "UNSAT: error in assignment "+unit+ " - "+this.assignment[unit.toAtomHashID()];
			
			if ((this.propagateUnit(unit) < -1) || (this.unsatCount > 0))
				return false;
			
			this.propagated(unit.row, unit.col, unit.value, unit.state);
		}
		
		return true;
	};
		
	/*
	 * [private]
	 * buildFromPuzzle
	 *
	 * Builds a CNF from the given puzzle
	 *
	 */
	var buildFromPuzzle = function() {
		/* Build rules for each cell */	
		for (var row = 0; row < self.puzzle.fullSize; row ++) {
			for (var col = 0; col < self.puzzle.fullSize; col ++) {
				/* Detected predefined clause ==> top level unit */
				if (self.puzzle.cells[row][col].fixedValue != -1) {
					var value = self.puzzle.cells[row][col].fixedValue;
					self.units.push(new Literal(row, col, value, true));
				}
				 else
				{
					var clause = new Clause();

					/* Detected options, build "at least one" clause */
					for (var value = 0; value < puzzle.fullSize; value ++) {
						if (self.puzzle.cells[row][col].option[value]) {
							clause.add(new Literal(row, col, value, true));
						}
					}
					
					registerClause(clause);
				}
			}
		}
		
		/* At most once in each row */
		for (var row = 0; row < self.puzzle.fullSize; row ++) {
			for (var val = 0; val < self.puzzle.fullSize; val ++) {
				for (var col = 0; col < self.puzzle.fullSize; col ++) {
					for (var other_col = col + 1; other_col < self.puzzle.fullSize; other_col ++) {
						addDualClause(row, col, val, row, other_col, val);
					}
				}	
			}
		}

		/* At most once in each column */
		for (var col = 0; col < self.puzzle.fullSize; col ++) {
			for (var val = 0; val < self.puzzle.fullSize; val ++) {
				for (var row = 0; row < self.puzzle.fullSize; row ++) {
					for (var other_row = row + 1; other_row < self.puzzle.fullSize; other_row ++) {
						addDualClause(row, col, val, other_row, col, val);
					}
				}	
			}
		}

		/* At most once in each block */
		for (var block = 0; block < self.puzzle.fullSize; block ++) {
			for (var val = 0; val < self.puzzle.fullSize; val ++) {
				self.puzzle.blockIterator(block, 0, 
					function(row, col, cellId) {
						self.puzzle.blockIterator(block, cellId + 1, 
							function(otherRow, otherCol, otherCellId) {
								addDualClause(row, col, val, otherRow, otherCol, val);		
							}
						);
					}
				);
			}
		}

		/* Propagate all units */
		self.propagateAll();
	};

	this.toString = function() {
		var out = "";
	
		for (var clauseKey in this.clauses) {
			out += this.clauses[clauseKey]+",";
		}		
		
		return out;
	}

	// [constructor::post]
	buildFromPuzzle();
}

 
