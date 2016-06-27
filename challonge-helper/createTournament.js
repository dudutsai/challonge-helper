var request = require('request');
var fs = require("fs");

var username = 'dudutsai';
var api_key = 'Nzv1IiBOD3VSUZl4RqHDGjs0JLTAcVfkFZ82iBzs';
var challongeUrl = 'api.challonge.com/v1/';

/*
request
  	.get('https://' + username + ':' + api_key + '@' + challongeUrl + 'tournaments.json')
  	.on('error', function(err) {
    	console.log(err)
	})
	.pipe(fs.createWriteStream('stuff.txt'));
*/

var date = new Date();
var tournament_name = 'TestTourney' + (date.getMonth()+1) + date.getDate() + date.getMinutes() + date.getSeconds();

var options = {
	uri: 'https://' + username + ':' + api_key + '@' + challongeUrl + 'tournaments.json',
	method: 'POST',
	json: {
		'name':tournament_name,
		'tournament_type':'double elimination',
		'url':tournament_name,
		'description':'test description',
		'open_signup':'false',
	}
};
request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log('Tournament sucessfully created'); // Print the shortened url.
  }
});