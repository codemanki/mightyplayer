(function(Player, $){
	Player.SIO = function(){};
	/*
		Loads socket.io and callbacks. 
		params:
			-Callback is method, which will be fired, when sio receives command from socket.io
			-Token is a clientId.
			-callbackAfterHandshake will be called when sio received token
	*/
	Player.SIO.prototype.load = function(params){ //optionscallback, token, isPlayer /*Dummy param*/
		var that = this;
		
		this.socket = io.connect(getConfig("siourl"));
		this.socketToken = params.token;
		this.params = params;
		
	  	this.socket.on('handshake', function () {
	    	this.emit('letsdohandshake', { token: params.token, isPlayer: params.isPlayer});
	  	});
	
		//This will be used for 2 steps auth later
	  	this.socket.on('receivetoken', function (options) {
			console.log("PLAYER IO [receivetoken]", arguments);
			that.socketToken = options.token;
			
			if(params.callbackAfterHandshake)
				params.callbackAfterHandshake();
	  	});	
	
		this.socket.on('command', function(options) {
			if(options.token != that.socketToken)
				return;
				
			if(params.callback)	
				params.callback(options.command, options);
		});
	};
	/* 
		To properly disconnect.
	*/
	Player.SIO.prototype.unload = function() {
		this.socket.disconnect();
	};
	
	/* 
		Send command to other devices.
		Command is a string.
		Data - hash.
	*/
	Player.SIO.prototype.executeCommand = function(command, data) {
		//merge
		data["command"] = command;
		data["token"] = this.socketToken;
		
		this.socket.emit("command", data);
		console.log("emmiting", data, this.socket);
	};
	
})(window.Player, jQuery);