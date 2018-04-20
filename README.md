
# Visualizing a SAT Solver solving Sudokus
This repository contains a little demo I’ve written as a side project at university in 2008. It visualizes interactively how a very simple [SAT solver][1] is solving a Sudoku puzzle using [unit propagation][2]. 

**You can play it right [here][3].**

(Unfortunately, it written it around 2008 where mobile websites were still not the default…)

![][image-1]

On the left side, you are seeing the Sudoku puzzle. If a field shows a large number, the field is filled with this number. Multiple small numbers are visualizing the options you have in a field that is not filled yet. On the right side, you are seeing the Sudoku encoded as a SAT problem in [CNF encoding][4], whereas the encoding shows you only unsatisfied clauses.

The demo lets you interactively solve the puzzle. It visualizes how decisions of the SAT solver inside the CNF formula would affect the puzzle and vice versa.

If you hover an open number in the puzzle, you will see how clauses would be affected if this number would be set. If a literal inside a clause is marked as green, the clause will be satisfied by the literal and therefore will be vanished. If a literal inside a clause is marked as red, the literal will be set to *false* and therefore removed from the clause.

If you hover a literal in the formula, you will see how the puzzle would be affected if a literal becomes true. A red highlight means that the value will no longer be an option - a green highlight means that the field will be filled with the given number. Literals which are in orange are so-called unit-clauses. These clauses must be satisfied in order to make the formula become satisfied.

Finally, you can watch the SAT solving algorithm by hitting the *Automatic* button. This will perform the next deterministic SAT solving step. It will not work if a non-deterministic decision is required. To solve it manually, just click either on a literal or a sudoku number. If you generate a contradictory state of the puzzle or the formula, the solver will notify you.

**Have fun!**

[1]:	https://en.wikipedia.org/wiki/Boolean_satisfiability_problem
[2]:	https://en.wikipedia.org/wiki/Unit_propagation
[3]:	https://cdn.rawgit.com/hydrixos/jsSudoku/master/index.html
[4]:	https://en.wikipedia.org/wiki/Conjunctive_normal_form

[image-1]:	res/Readme.png