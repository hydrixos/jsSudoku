/*
 * jsSudoku
 *
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the GNU General Public License V2
 *
 * debug.js
 * Helper functions for debugging
 *
 */

/*
 * var_dump(object, output, depth)
 *
 * Dumps an object "object" to a container "output".
 * If the object contains nested structures, the dump function
 * will dump them up to level "depth".
 *
 */
function var_dump(object, output, depth)
{
	var container = document.createElement("div");
	var color = 100 + depth;	
	container.setAttribute("style", "border: 1px solid; background-color:rgb(160, 0, "+(color)+")");

	output.appendChild(container);	

	var content;
	var info;

	for (var member in object)
	{
		content = document.createElement("div");

		switch(typeof(object[member]))
		{
			case "boolean" 	: 
			case "string"	:
			case "number"	: 
			{
				info = document.createTextNode(member+": "+object[member]);
				content.appendChild(info);				

				break;
			}
			case "function" : 
			{
				info = document.createTextNode(member+"()");
				content.appendChild(info);
				
				break;
			}
			case "object"	: 
			{	
				info = document.createTextNode(member+":");
				content.appendChild(info);

				var_dump(object[member], content, depth + 30);
				content.setAttribute("style", "margin-left: 8px");
				
				break;
			}
			default		: 
			{
				info = document.createTextNode(member+": UNKNOWN_TYPE ("+typeof(object[member])+")");
				content.appendChild(info);
			
				break;
			}
		}
		
		container.appendChild(content);
	}
}
