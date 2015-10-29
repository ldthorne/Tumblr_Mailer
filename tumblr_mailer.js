var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');

var mandrill_client = new mandrill.Mandrill('sZOZ_KZWBPbZ4lh-DnUQ2w');

var client = tumblr.createClient({
  consumer_key: 'mHhMDeGbWHr95qWeD3PTg8Gpgkmpmttl9wrAbME7uen1NE4q2E',
  consumer_secret: 'zWj97duJPOGIDVBiReyjHu1yDcYsuqqNcU8MltjIWQot2ucsaD'
});

var csvFile = fs.readFileSync("friend_list.csv","utf8"); //get the contact list in csv format
var htmlFile = fs.readFileSync("email_template.html","utf8"); //get the email that we're going to send
var contacts = csvParse(csvFile);//convert the csv-format contact list to an array of contact objects

client.posts('ldthorne.tumblr.com', function(err, blog){
  	var latestPosts=[];
  	blog.posts.forEach(function(post){
	  	var currentDate = new Date(); //date right now
	  	var postDate = new Date(post["date"]); //date of post
			if(((currentDate-postDate)/(1000*60*60*24))<=7 && post["title"]!== undefined){ //got "undefined" back because image posts don't have a title but they're considered posts
				var postInfo = { //create postInfo object with a title and link property
					title: post["title"],
					link: post["post_url"]

				};
				latestPosts.push(postInfo); //push the postInfo object to the array of objects
			}
		});
		forEachContact(latestPosts);//pass through the latestPosts array of object to the forEachContactFunction
});

function forEachContact(latestPosts){ //function to send an email to every contact
	contacts.forEach(function(contact){ //forEach contact in the array of contacts
		firstName = contact["firstName"]; //get first name
		numMonths = contact["numMonthsSinceContact"]; //get num months since contact
		var newTemplate = ejs.render(htmlFile, //create a new template, passing through their name, num months since contact, and the latestPosts array of objects
			{
				firstName:firstName,
				numMonthsSinceContact: numMonths,
				latestPosts: latestPosts
			});
		sendEmail(firstName, contact["emailAddress"], "Leon Thorne", "ldthorne@brandeis.edu", "Test. Please ignore!", newTemplate); //send email function			
	});
}

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

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){ //send email function. Taken from Scott's example file
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Daniel's Tumblr Emails"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    	      
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}