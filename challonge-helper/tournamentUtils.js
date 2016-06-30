var constants = require('./constants');
var request = require('request');
var async = require('async');
var _ = require('lodash');
var hashmap = require('hashmap');

exports.getTournaments = function(callback) {
	console.log('getTournaments() start!');

	request({
		uri: constants.url + '.json',
		method: "GET"
	}, 	function(error, response, body) {
		if (error) {
			console.error('Get tournament error! ' + error);
		}
		callback(null, body);
	});
};

exports.getTournament = function(id, callback) {
	//console.log('getTournament() start! | id = ' + id + ' | callback = ' + callback);

	request({
		uri: constants.url + '/' + id + '.json',
		method: "GET"
	}, 	function(error, response, body) {
		if (error) {
			console.error('Get tournament error! ' + error);
		}
		//console.log('getTournament body = ' + body);
		console.log('getTournament() done!');
		callback(null, body);
	});
};

exports.getMatches = function(id, callback) {
	//console.log('getMatches() start! | id = ' + id + ' | callback = ' + callback);

	request({
		uri: constants.url + '/' + id + '/matches.json',
		method: "GET"
	}, function(error, response, body) {
		if (error) {
			console.error('Get matches error!' + error);
		}
		//console.log('getMatches body = ' + body);
		console.log('getMatches() done!');
		callback(null, body);
		
	});
};

exports.getPlayerMapping = function(id, callback) {
	//console.log('uri = ' + constants.url + '/' + id + '/participants.json');
	request({
		uri: constants.url + '/' + id + '/participants.json',
		method: "GET"
	}, function(error, response, body) {
		if (error) {
			console.error('Get participants error!' + error);
		}
		mapping = [];
		playerData = JSON.parse(body);

		for (player in playerData) {
			console.log('player = ' + player);
			console.log('playerData = ' + playerData);
			console.log('playerData[player].participant.id = ' + playerData[player].participant.id);
			console.log('playerData[player].participant.name = ' + playerData[player].participant.display_name);
			mapping[playerData[player].participant.id.toString()] = playerData[player].participant.display_name;
		}
		//console.log('mapping = ' + mapping);
		callback(null, mapping);		
	});
};

exports.deleteTournaments = function(tournamentData, callback) {
	console.log('deleteTournaments() start!');

  	data = JSON.parse(tournamentData);

  	async.forEachOf(_.values(data), function(item, key, callback) {
  		tournament_id = item['tournament']['id'];
		var options = {
			uri: constants.url + '/' + tournament_id + '.json',
			method: 'DELETE'
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			    console.log('Tournament sucessfully deleted'); // Print the shortened url.
			    callback();
			}
			else {
				console.log('Error deleting tournament: ' + tournament_id);
				callback();
			}
		});
  	}, function(err) {
  		if (err) {
  			console.log('Error = ' + err);
  		}
  		callback(null, 'deleteTournaments done');
	});

};

exports.createTournament = function(callback) {
	console.log('createTournament() start!');

	var date = new Date();
	var tournament_name = 'TestTourney' + (date.getMonth()+1) + date.getDate() + date.getMinutes() + date.getSeconds();

	var options = {
		uri: constants.url + '.json',
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
	    callback(null, 'createTournament done');
	  }
	  else {
	  	callback(error);
	  }
	});
};
