var express = require('express');
var router = express.Router();
var tools = require('./../tournamentUtils.js');
var async = require('async');

/* GET home page. */
router.get('/', function(req, res, next) {
	tournamentData = tools.getTournaments(function(err, body) {
		//TODO parse body for tournament names here
		res.render('index', { title: "Andrew's page", tournamentData: JSON.parse(body) });
	});
});

router.get('/tournament', function(req, res) {
	//console.log('tournament call');
  	//console.log('req.query.id = ' + req.query.id);
  	async.parallel([
  		function(callback) {
			tools.getOpenMatches(req.query.id, callback);
  		},
  		function(callback) {
  			tools.getTournament(req.query.id, callback);
  		},
  		function(callback) {
  			tools.getPlayerMapping(req.query.id, callback);
  		}
  	], function(err, result) {
  		//console.log('result = ' + result);
    	res.render('tournament', {
    		title: JSON.parse(result[1]).tournament.name,
    		matchData: result[0],
    		tournamentData: JSON.parse(result[1]),
    		playerMap: result[2],
    		activeSets: activeSets
    	});
  	});
});

router.get('/match', function(req, res) {
	console.log('match call');
//	console.log('req.query.matchId = ' + req.query.matchId);
//	console.log('req.query.tournamentId = ' + req.query.tournamentId);

	res.render('match', {
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
		case 'createTournament':
			//console.log('createTournament call');
			async.series([
				function(callback) {
					tools.createTournament(req.body.tournamentName, callback);
				}
			], function(err, result) {
				if (err) {
					console.log('Error: ' + err);
					res.send(err);

				}
				else {
					res.redirect('/');					
				}
			});

			break;
		case 'deleteTournaments':
			//console.log('deleteTournaments call');
			async.waterfall([
				tools.getTournaments,
				tools.deleteTournaments
			], function(err, result) {
				//console.log('result = ' + result);
				res.redirect('/');
			});
			break;
		case 'addParticipant':
			//console.log('addParticipant call');
			async.series([
				function(callback) {
					tools.addParticipant(req.body.tournamentName, req.body.participant, callback);
				}
			], function(err, result) {
				//console.log('result = ' + result);
				res.redirect('/tournament?id=' + req.body.tournamentName);
			});

			break;
		case 'startTournament':
			//console.log('startTournament call');
			async.series([
				function(callback) {
					tools.startTournament(req.body.tournamentName, callback);
				}
			], function(err, result) {
				console.log('result = ' + result);
				res.redirect('/tournament?id=' + req.body.tournamentName);
			});

			break;
		case 'startSet':
			console.log('startSet call');
			if (activeSets.indexOf(req.body.matchId) == -1) {
				activeSets.push(parseInt(req.body.matchId));
			}
			console.log('indexOf = ' + activeSets.indexOf(req.body.matchId));
			res.redirect('/tournament?id=' + req.body.tournamentId);

			break;

		case 'reportScore':
			//console.log('reportScore call');
			async.series([
				function(callback) {
					tools.reportScore(req.body.tournamentId, req.body.matchId, req.body.winnerId, req.body.scoresCsv, callback);			
				}
			], function(err, result) {
				if (!err) {
					//console.log('result = ' + result);
					var index = activeSets.indexOf(req.body.matchId);
					if (index > -1) {
						activeSets.splice(index, 1);
					}
					res.redirect('/tournament?id=' + req.body.tournamentId);					
				}
			});

			break;
		default:
			break;

	}
	//res.redirect('/');
});

module.exports = router;
