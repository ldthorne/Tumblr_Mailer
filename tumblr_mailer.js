var fs = require('fs');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
console.log(csvParse(csvFile));

function csvParse(csvFile){
	var lines = csvFile.split("\n"); //split into first array every time there's a line break
	var splitLines=[];
	for(var i=0; i<lines.length; i++){ //loop through the first array
		splitLines.push(lines[i].split(",")); //every time there's a ",", split into another array
	}

	var peopleObjects = [];
	for(var i=1; i<splitLines.length-1; i++){ //loop through every element of the outside array (the rows); skip the first line because it's just the description
		var person={};
		var shouldEqual = 0;
		for(var j=0; j<splitLines[i].length; j++){ //loop through every element of the interior array
			var key = splitLines[0][j] //the key should be the j-th element of interior array inside of the first element the outside array 
			if(j%splitLines[0].length === shouldEqual){ //find the remainder when you divide the number of which row you're in by the num of columns
				person[key]=splitLines[i][j]; //set the key to that value
			}
			shouldEqual++; //increment should equal after each iteration
		}
		peopleObjects.push(person); //push up the object

	}
	return peopleObjects;//return the array containing all the people objects
}