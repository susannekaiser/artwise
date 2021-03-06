var _ = require('lodash');
var moment = require('moment');
var http = require('http');
// emails with this label are displayed as a yellow rectangle
var label = 'mondrian;'

var emailReader = require('./fakeEmailReader.js');

emailReader.init();

var EMAIL_DOMAIN;
emailReader.getAccountInfo(function(accountInfo) {
	if (accountInfo !== undefined && accountInfo.email_addresses != undefined) {
		var email = accountInfo.email_addresses[0];
		EMAIL_DOMAIN = email.substring(email.indexOf('@') + 1);
	} else {
		console.log('could not read account info!');
		EMAIL_DOMAIN = 'gmail.com';
	}
});

exports.readEmail = function(callWhenDone) {
	emailReader.readEmail(mapEmailDataToRectangles, callWhenDone);	
};

var LAST_RECTANGLES = [];

function mapEmailDataToRectangles(messages, callback) {
	
	// get labeled mails: in folder 'label'

	var unreadMessages = _.filter(messages, function(message) {
		return ! _.contains(message.flags, '\\Seen');
	});
	console.log('Got UNREAD emails from', _.map(unreadMessages, function(message) {
		return message.addresses.from.email + ', ' + message.date;
	}));

	var messagesToday = _.filter(unreadMessages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') === 0;
	});
	var messagesYesterday = _.filter(unreadMessages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') === 1;
	});
	var messagesOld = _.filter(unreadMessages, function(message) {
		return moment().diff(moment(message.date, 'X'), 'days') > 1;
	});

	function isFromSameDomain(message) {
		return message.addresses.from.email.indexOf(EMAIL_DOMAIN) > -1;
	}

	var countInternalToday = _.countBy(messagesToday, isFromSameDomain);
	var countInternalYesterday = _.countBy(messagesYesterday, isFromSameDomain);
	var countInternalOld = _.countBy(messagesOld, isFromSameDomain);

	var colorInternal = "blue";
	var colorExternal = "red";

	var rectangles = _.compact([ 

		 createRectangle(countInternalToday.true || 0, colorInternal, 2, ' unread internal mails from today'), 
		 createRectangle(countInternalToday.false || 0, colorExternal, 2, ' unread external mails older than yesterday'),
		 createRectangle(countInternalYesterday.true || 0, colorInternal, 1, ' unread internal mails from yesterday'), 
		 createRectangle(countInternalYesterday.false || 0, colorExternal, 1, ' unread external mails from yesterday'),
		 createRectangle(countInternalOld.true || 0, colorInternal, 0, ' unread internal mails older than yesterday'), 
		 createRectangle(countInternalOld.false || 0, colorExternal, 0, ' unread external mails older than yesterday'),
		
		  // fake messages for presentation
		  createRectangle(12, "yellow", 2, ' labeled mails from today'),
		  createRectangle(3, "yellow", 1, ' labeled mails from yesterday'), 
		  createRectangle(10, "yellow", 0, ' labeled mails older than yesterday')  
		]);

	callback(rectangles, true);

};

function createRectangle(count, color, column, info) {
	// if (count === 0) {
	// 	return undefined;
	// }
	var rect = { 
		color: color, 
		column: column,
		info: count + info
	};

	if(count < 5) {
		rect.size = "small";
	} else if(count < 15) {
		rect.size = "medium";
	} else {
		rect.size = "large";
	}

	return rect;
}
