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
	tournamentData = tools.getTournaments(credentials[req.query.usr], req.query.org, function(err, body, api_key) {
		//TODO parse body for tournament names here
		res.render('index', { 
			title: "Tournament Index",
			tournamentData: JSON.parse(body),
			usr: req.query.usr,
			credentials: credentials,
			org: req.query.org
		});
	});
});

router.get('/tournament', function(req, res) {
	//console.log('tournament call');
  	//console.log('req.body = ' + JSON.stringify(req.body));
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
    		org: req.query.org,
    		credentials: credentials,
    		activeSets: activeSets
    	});
  	});
});

router.get('/match', function(req, res) {
	//console.log('match call');
	//console.log('req.query = ' + JSON.stringify(req.query));

	res.render('match', {
		usr: req.query.usr,
		org: req.query.org,
		tournamentId: req.query.tournamentId,
		p1: req.query.p1,
		p1Id: req.query.p1Id,
		p2: req.query.p2,
		p2Id: req.query.p2Id,
		matchId: req.query.matchId,
		isBo5: req.query.isBo5
	});
});

router.post('/testCredentials', function(req, res, next) {
	//see if credentials exist
	var api_key = req.body.api_key;
	//console.log('api key = ' + api_key);
	//console.log('credentials = ' + JSON.stringify(credentials));
	if (credentials.indexOf(api_key) == -1) {
		async.series([
			function(callback) {
				tools.getTournaments(api_key, req.body.org, callback);
			}
		], function(err, result) {
			//console.log('result = ' + result);
			if (err) {
				//console.log('error = ' + err);
				res.send('Check your API key and try again');
			}
			else {
				credentials[req.body.usr] = api_key;
				res.redirect('/index?usr=' + req.body.usr + '&org=' + req.body.org);
			}
		});
	}
});

router.post('/createTournament', function(req, res, next) {
	//console.log('createTournament call');
	async.series([
		function(callback) {
			tools.createTournament(req.body.tournamentName, credentials[req.body.usr], req.body.org, callback);
		}
	], function(err, result) {
		if (err) {
			//console.log('Error: ' + err);
			res.send(err);

		}
		else {
			res.redirect('/index?usr=' + req.body.usr + '&org=' + req.body.org);					
		}
	});
});

router.post('/deleteTournaments', function(req, res, next) {
	//console.log('deleteTournaments call');
	//console.log('apikey= ' + credentials[req.body.usr]);
	async.waterfall([
		function(callback) {
			tools.getTournaments(credentials[req.body.usr], req.body.org, callback);
		},
		tools.deleteTournaments
	], function(err, result) {
		//console.log('result = ' + result);
		res.redirect('/index?usr=' + req.body.usr + '&org=' + req.body.org);
	});
});

router.post('/addParticipant', function(req, res, next) {
	//console.log('addParticipant call');
	//console.log('tourneyname = ' + req.body.tournamentName + ' participant = ' + req.body.participant);
	async.series([
		function(callback) {
			tools.addParticipant(req.body.tournamentId, req.body.participant, credentials[req.body.usr], callback);
		}
	], function(err, result) {
		//console.log('result = ' + result);
		res.redirect('/tournament?usr=' + req.body.usr+ '&org=' + req.body.org + '&id=' + req.body.tournamentId);
	});
});

router.post('/startTournament', function(req, res, next) {
	//console.log('startTournament call');
	async.series([
		function(callback) {
			tools.startTournament(req.body.tournamentId, credentials[req.body.usr], callback);
		}
	], function(err, result) {
		//console.log('result = ' + result);
		res.redirect('/tournament?usr=' + req.body.usr+ '&org=' + req.body.org + '&id=' + req.body.tournamentId);
	});
});

router.post('/startSet', function(req, res, next) {
	//console.log('startSet call');
	if (activeSets.indexOf(req.body.matchId) == -1) {
		activeSets.push(parseInt(req.body.matchId));
	}
	res.redirect('/tournament?usr=' + req.body.usr+ '&org=' + req.body.org + '&id=' + req.body.tournamentId);
});

router.post('/reportScore', function(req, res, next) {
	//console.log('reportScore call');
	//console.log('body = ' + JSON.stringify(req.body));
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
			res.redirect('/tournament?usr=' + req.body.usr+ '&org=' + req.body.org + '&id=' + req.body.tournamentId);
		}
	});
});

module.exports = router;
