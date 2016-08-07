var express = require('express');
var router = express.Router();
var tools = require('./../tournamentUtils.js');
var async = require('async');

/* GET home page. */
router.get('/', function(req,res, next) {
	res.render('login', {
		title: "Login"
	});
});

router.get('/index', function(req, res, next) {
	tournamentData = tools.getTournaments(credentials[req.query.usr], function(err, body, api_key) {
		//TODO parse body for tournament names here
		res.render('index', { 
			title: "Tournament Index",
			tournamentData: JSON.parse(body),
			usr: req.query.usr,
			credentials: credentials
		});
	});
});

router.get('/tournament', function(req, res) {
	//console.log('tournament call');
  	//console.log('req.query.id = ' + req.query.id);
  	var api_key = credentials[req.query.usr];
  	async.parallel([
  		function(callback) {
			tools.getOpenMatches(req.query.id, api_key, callback);
  		},
  		function(callback) {
  			tools.getTournament(req.query.id, api_key, callback);
  		},
  		function(callback) {
  			tools.getPlayerMapping(req.query.id, api_key, callback);
  		}
  	], function(err, result) {
  		//console.log('result = ' + result);
    	res.render('tournament', {
    		title: JSON.parse(result[1]).tournament.name,
    		matchData: result[0],
    		tournamentData: JSON.parse(result[1]),
    		playerMap: result[2],
    		usr: req.query.usr,
    		credentials: credentials,
    		activeSets: activeSets
    	});
  	});
});

router.get('/match', function(req, res) {
	console.log('match call');
//	console.log('req.query.matchId = ' + req.query.matchId);
//	console.log('req.query.tournamentId = ' + req.query.tournamentId);

	res.render('match', {
		usr: req.query.usr,
		p1: req.query.p1,
		p1Id: req.query.p1Id,
		p2: req.query.p2,
		p2Id: req.query.p2Id,
		tournamentId: req.query.tournamentId,
		matchId: req.query.matchId
	});
});

router.post('/:action', function(req, res, next) {
	console.log('action = ' + JSON.stringify(req.params.action));
	switch (req.params.action) {
		case 'testCredentials':
			//see if credentials exist
			var api_key = req.body.api_key;
			console.log('api key = ' + api_key);
			console.log('credentials = ' + JSON.stringify(credentials));
			if (credentials.indexOf(api_key) == -1) {
				async.series([
					function(callback) {
						tools.getTournaments(api_key, callback);
					}
				], function(err, result) {
					//console.log('result = ' + result);
					if (err) {
						//console.log('error = ' + err);
						res.send('Check your API key and try again');
					}
					else {
						credentials[req.body.usr] = api_key;
						res.redirect('/index?usr=' + req.body.usr);
					}
				});
			}

			break;
		case 'createTournament':
			//console.log('createTournament call');
			async.series([
				function(callback) {
					tools.createTournament(req.body.tournamentName, credentials[req.body.usr], callback);
				}
			], function(err, result) {
				if (err) {
					console.log('Error: ' + err);
					res.send(err);

				}
				else {
					res.redirect('/index?usr=' + req.body.usr);					
				}
			});

			break;
		case 'deleteTournaments':
			//console.log('deleteTournaments call');
			console.log('apikey= ' + credentials[req.body.usr]);
			async.waterfall([
				function(callback) {
					tools.getTournaments(credentials[req.body.usr], callback);
				},
				tools.deleteTournaments
			], function(err, result) {
				console.log('result = ' + result);
				res.redirect('/index?usr=' + req.body.usr);					
			});
			break;
		case 'addParticipant':
			//console.log('addParticipant call');
			async.series([
				function(callback) {
					tools.addParticipant(req.body.tournamentName, req.body.participant, credentials[req.body.usr], callback);
				}
			], function(err, result) {
				//console.log('result = ' + result);
				res.redirect('/tournament?usr=' + req.body.usr+ '&id=' + req.body.tournamentName);
			});

			break;
		case 'startTournament':
			//console.log('startTournament call');
			async.series([
				function(callback) {
					tools.startTournament(req.body.tournamentName, credentials[req.body.usr], callback);
				}
			], function(err, result) {
				console.log('result = ' + result);
				res.redirect('/tournament?usr=' + req.body.usr+ '&id=' + req.body.tournamentName);
			});

			break;
		case 'startSet':
			//console.log('startSet call');
			if (activeSets.indexOf(req.body.matchId) == -1) {
				activeSets.push(parseInt(req.body.matchId));
			}
			res.redirect('/tournament?usr=' + req.body.usr+ '&id=' + req.body.tournamentName);

			break;

		case 'reportScore':
			//console.log('reportScore call');
			async.series([
				function(callback) {
					tools.reportScore(req.body.tournamentId, req.body.matchId, req.body.winnerId, req.body.scoresCsv, credentials[req.body.usr], callback);			
				}
			], function(err, result) {
				if (!err) {
					//console.log('result = ' + result);
					var index = activeSets.indexOf(req.body.matchId);
					if (index > -1) {
						activeSets.splice(index, 1);
					}
					res.redirect('/tournament?usr=' + req.body.usr+ '&id=' + req.body.tournamentId);
				}
			});

			break;
		default:
			break;

	}
	//res.redirect('/');
});

module.exports = router;
