var request = require('request');
var fs = require("fs");

var api_creds = 'dudutsai:Nzv1IiBOD3VSUZl4RqHDGjs0JLTAcVfkFZ82iBzs';
var challongeUrl = '@api.challonge.com/v1/';

var data;
request({
	uri: 'https://' + api_creds + challongeUrl + 'tournaments.json',
	method: "GET"
}, function(error, response, body) {

  	data = JSON.parse(body);

  	for (var i = 0; i < data.length; i++) {  		
		var tournament_id = data[i]['tournament']['id'];
		console.log('Deleting tournament with id ' + tournament_id);
		var options = {
			uri: 'https://' + api_creds + challongeUrl + 'tournaments/' + tournament_id + '.json',
			method: 'DELETE'
		}
		request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
		    console.log('Tournament sucessfully deleted'); // Print the shortened url.
		}
		else {
			console.log('Error deleting tournament: ' + tournament_id)
		}
		});	
	}

});
