// Importing the installed packages
var express = require('express');
var body_parser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

// Importing the config.js file
var config = require('./config'); // can also be config.js

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect(config.database,function(err){
    if(err){
        console.log(err);
    } else {
        console.log('Database Connected!!!');
    }
});

// Add different capabilities to the app
app.use(body_parser.urlencoded({ extended : true }));
app.use(body_parser.json());
app.use(morgan('dev'));

// This renders all the css/js files in the public folder
app.use(express.static(__dirname + '/public'));

var api = require('./app/routes/api')(app, express, io);
app.use('/api', api);

// Call index.html file
app.get("*",function(req,res){
	res.sendFile(__dirname + '/public/app/views/index.html');
});

http.listen(config.port,function(err){
	if(err){
		console.log(err);
	} else {
		console.log('Listening on port 3000');
	}
});