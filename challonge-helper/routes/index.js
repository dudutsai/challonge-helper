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
  console.log('tournament call');

  tools.getTournament(req.query.id, function(err, body) {
  	console.log('body = ' + JSON.parse(body));
    res.render('tournament', {
      title: JSON.parse(body).tournament.name,
      tournamentData: JSON.parse(body)
    });
  });
});

router.post('/submit', function(req, res, next) {
	console.log('req.body = ' + JSON.stringify(req.body));
	switch (req.body.action) {
		case 'createTournament':
			console.log('createTournament call');
			async.series([
				tools.createTournament,
			], function(err, result) {
				console.log('result = ' + result);
				res.redirect('/');
			});
			break;
		case 'deleteTournaments':
			console.log('deleteTournaments call');
			async.waterfall([
				tools.getTournaments,
				tools.deleteTournaments
			], function(err, result) {
				console.log('result = ' + result);
				res.redirect('/');
			});
			
			//tools.getTournaments(tools.deleteTournaments);
			break;
		default:
			break;

	}
	//res.redirect('/');
});


module.exports = router;
