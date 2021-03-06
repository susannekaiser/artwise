var yaml_config = require('node-yaml-config');
var ContextIO = require('contextio');
var _ = require('lodash');

var ctxioClient;

exports.init = function() {
	var config;

	try {
		config = yaml_config.load(__dirname + '/contextio.yml');
	} catch(err) {
		console.log('could not read yml, trying Heroku vars');
		config = {
		  contextIo: {
		    key: process.env.CONTEXT_KEY,
		    secret: process.env.CONTEXT_SECRET
		  }
		};
	}

	ctxioClient = new ContextIO.Client({
		key: config.contextIo.key,
		secret: config.contextIo.secret
	});	
}

exports.readEmail = function(callback, callbackParameter) {

	// TODO:  query with date_after = since last time I asked

	ctxioClient.accounts('539414518c157fa37d8aaf71').messages().get(
		{
			limit:15,
			include_flags: 1
			// flag_seen: 1
		}, function (err, response) {
	    if (err) throw err;
	    // console.log('response', response.body);
	    callback(response.body, callbackParameter);
	});

};

exports.getAccountInfo = function(callback, callbackParameter) {
	ctxioClient.accounts('539414518c157fa37d8aaf71').get(
		{ }, function (err, response) {
	    if (err) throw err;
	    // console.log('response', response.body);
	    callback(response.body, callbackParameter);
	});
};
