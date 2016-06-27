var constants = require('./constants');
var request = require('request');
var async = require('async');
var _ = require('lodash');

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
	console.log('getTournament() start!');

	request({
		uri: constants.url + '/' + id + '.json',
		method: "GET"
	}, 	function(error, response, body) {
		if (error) {
			console.error('Get tournament error! ' + error);
		}
		return callback(null, body);
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
