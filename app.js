
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , users = {}
  , url = require('url')
  , routes = require('./routes')
  , http = require('http')
  , server = http.createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , templates = fs.readFileSync("views/templates.html", 'utf8'); //since express 3 js doesn't support old partials and underscore is used, just read file


app.use(function(req, res, next) {
  	res.locals.__isRemote = req.url.indexOf("/r/") != -1;
	res.locals.__templates = templates;
	res.locals.__url = "http://" + req.headers.host + "/";
	res.locals.__env = app.settings.env;
 	next();
});

app.configure(function(){
  app.engine('html', require('uinexpress').__express)
  app.set('view engine', 'html')
  app.set('port', process.env.PORT || 8080);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});



app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', routes.index);
app.get('/r/:clientId?', routes.remote);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {
 	socket.emit('handshake');

	socket.on('letsdohandshake', function (data) {
		var token = data.token;
		socket.emit('receivetoken', {token: token});
		if(!users[token])
			users[token] = [];
		users[token].push(socket.id);
		console.log(users);
	});
	
  	socket.on('command', function(data){
		console.log("recieved command", data);
		//Forward message to everyone except myself
		var c = function(sid){
			console.log(sid, socket.id);
			if(sid && sid != socket.id) {
				console.log("sending command ", data, "to", sid);
				io.sockets.socket(sid).emit('command', data);
			}
		};
		forEachUser(data.token, c);
	});
	
    socket.on('disconnect', function () {
		var keys = [];
		for (var k in users) keys.push(k); //as alternative to users.keys()
		
		//Go through all socket ids, found one that gets disconnected and replace with null
		for(var i = 0; i < keys.length; i++){
			var key = keys[i];
			var sids = users[key];
			
			for(var j = 0; j < sids.length; j++){
				var sid = sids[j];
				
				if(sid == socket.id) {
					sids[j] = null;
					break;
				}
			}
			
		}
    });
});


var forEachUser = function(token, callback){
	if(!(users[token] instanceof Array))
		return;
		
	var l = users[token].length;
	
	for(var i = 0; i < l; i++){
		var sid = users[token][i];
		callback(sid, i, users[token]);
	}
};