var constants = require('./constants');
var request = require('request');
var async = require('async');
var _ = require('lodash');

exports.getTournaments = function(api_key, callback) {
	// console.log('getTournaments() start!');
	// console.log('api_key = ' + api_key);
	// console.log('callback = ' + callback);
	request({
		uri: constants.url + '.json?api_key=' + api_key,
		method: "GET"

	}, 	function(error, response, body) {
		//console.log('response = ' + JSON.stringify(response));
		if (response.statusCode == 401) {
			//console.error('Invalid API key');
			callback(401, null);
		}
		else {
			//console.log('body = ' + body);
			callback(null, body, api_key);
		}
	});
};

exports.getTournament = function(id, api_key, callback) {
	//console.log('getTournament() start! | id = ' + id + ' | callback = ' + callback);

	request({
		uri: constants.url + '/' + id + '.json?api_key=' + api_key,
		method: "GET"
	}, 	function(error, response, body) {
		if (error) {
			console.error('Get tournament error! ' + error);
		}
		//console.log('getTournament body = ' + body);
		//console.log('getTournament() done!');
		callback(null, body);
	});
};

exports.getOpenMatches = function(id, api_key, callback) {
	//console.log('getMatches() start! | id = ' + id + ' | callback = ' + callback);
	//console.log(constants.url + '/' + id + '/matches.json');
	request({
		uri: constants.url + '/' + id + '/matches.json?api_key=' + api_key,
		method: "GET"
	}, function(error, response, body) {
		if (error) {
			console.error('Get matches error!' + error);
		}
		//console.log('getMatches body = ' + body);
		body = JSON.parse(body);
		matches = [];
		for (i in body) {
			//console.log('match id = ' + body[i].match.id);
			if (body[i].match.state == 'open') {
				matches.push(body[i].match);
			}
		}
		//console.log('matches = ' + matches);
		matches.sort(function(a, b) {
			if (a.round < 0 && b.round < 0) {
				return b.round - a.round;
			}
			return a.round - b.round;
		});
		//console.log('matches = ' + JSON.stringify(matches));
		//console.log('getOpenMatches() done!');
		callback(null, matches);
		
	});
};

exports.getPlayerMapping = function(id, api_key, callback) {
	//console.log('uri = ' + constants.url + '/' + id + '/participants.json');
	request({
		uri: constants.url + '/' + id + '/participants.json?api_key=' + api_key,
		method: "GET"
	}, function(error, response, body) {
		if (error) {
			console.error('Get participants error!' + error);
		}
		mapping = {};
		// console.log('body = ' + JSON.stringify(body));
		playerData = JSON.parse(body);

		for (player in playerData) {
			mapping[playerData[player].participant.id] = playerData[player].participant.display_name;

			//console.log('mapping[' + playerData[player].participant.id + '] = ' + mapping[playerData[player].participant.id]);
		}
		//console.log('getPlayerMapping() done!');
		if (JSON.stringify(mapping) == '{}') {
			mapping = null;
		}
		callback(null, mapping);
	});
};

exports.deleteTournaments = function(tournamentData, api_key, callback) {
	//console.log('deleteTournaments() start!');
	// console.log('tournamentData = ' + tournamentData);
	// console.log('api_key = ' + api_key);
	// console.log('callback = ' + callback);
  	data = JSON.parse(tournamentData);

  	async.forEachOf(_.values(data), function(item, key, callback) {
  		tournament_id = item['tournament']['id'];
		var options = {
			uri: constants.url + '/' + tournament_id + '.json?api_key=' + api_key,
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

exports.createTournament = function(tournamentName, api_key, callback) {
	//console.log('createTournament() start!');
	if (tournamentName == '') {
		var date = new Date();
		var tournamentName = 'TestTourney' + (date.getMonth()+1) + date.getDate() + date.getMinutes() + date.getSeconds();		
	}

	var tournamentUrl = tournamentName.replace(' ', '_');

	console.log('tournamentUrl = ' + tournamentUrl);
	var options = {
		uri: constants.url + '.json',
		method: 'POST',
		json: {
			'name':tournamentName,
			'tournament_type':'double elimination',
			'url':tournamentUrl,
			'description':'test description',
			'open_signup':'false',
			'api_key':api_key
		}
	};
	request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //console.log('Tournament sucessfully created'); // Print the shortened url.
	    callback(null, 'createTournament done');
	  }
	  else {
	  	console.error('error = ' + response.body.errors[0]);
	  	callback(response.body.errors[0]);
	  }
	});
};

exports.addParticipant = function(tournamentName, participant, api_key, callback) {
	//console.log('addParticipants() start!');

	var options = {
		uri: constants.url + '/' + tournamentName + '/participants.json',
		method: 'POST',
		json: {
			'name': participant,
			'api_key':api_key
		}
	};
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
	    	//console.log('Participant "' + participant + '" successfully added'); // Print the shortened url.
	    	callback(null, 'addParticipant done');
	  	}
	  	else {
	  		//console.log('error = ' + JSON.stringify(response.body.errors));
	  		callback();
	  	}
	});
//	callback(null, 'addParticipants done');


};

exports.startTournament = function(tournamentName, api_key, callback) {
	//console.log('startTournament start');

	var options = {
		uri: constants.url + '/' + tournamentName + '/start.json?api_key=' + api_key,
		method: 'POST',
	};
	request(options, function (error, response, body) {
	  	if (!error && response.statusCode == 200) {
	    	//console.log('Tournament sucessfully started'); // Print the shortened url.
	    	callback(null, 'startTournament done');
	  	}
	  	else {
	  		callback(error);
	  	}
	});
};

exports.reportScore = function(tournamentId, matchId, winnerId, scoresCsv, api_key, callback) {
	//console.log('reportScores start');

	// console.log('tournamentId = ' + tournamentId);
	// console.log('matchId = ' + matchId);
	// console.log('winnerId = ' + winnerId);
	// console.log('p1v = ' + p1votes);
	// console.log('p2v = ' + p2votes);

	var url = constants.url + "/" + tournamentId + "/matches/" + matchId 
		+ ".json?api_key=" + api_key
		+ "&match[winner_id]=" + winnerId 
		+ "&match[scores_csv]=" + scoresCsv;

	//console.log('url = ' + url);

	var options = {
		uri: url,
		method: 'PUT',
		json: true
	};
	request(options, function (error, response, body) {
	  	if (!error && response.statusCode == 200) {
	    	//console.log('Match sucessfully reported'); // Print the shortened url.
	    	callback(null, 'response = ' + JSON.stringify(response) + '  body = ' + JSON.stringify(body));
	  	}
	  	else {
	  		callback(error);
	  	}
	});
};
