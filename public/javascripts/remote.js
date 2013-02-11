(function(Player, $){
	/*
		Remote control main object. Loaded instead of HQ if user is in remote controll mode
	*/
	Player.Remote = function() {
		var that = this;
		//Create models
		this.remoteViewModel = new Player.ViewModels.Remote();
		this.clientId = __remoteClientId;
		this.sio = null;
		this.isValid = getConfig("remoteModeClientId") && getConfig("remoteModeClientId").length > 0;
		
		//Probably user loaded interface with broken id. Right now, he should receive nice error.
		// In future i will implement some kind of procedure, how to resolve broken id and turn it to normal.
		if(!(this.clientId && this.clientId.length > 0)){
			this.remoteViewModel.status(-2);
			this.remoteViewModel.substatus("Url looks incorrect. Please type it again!");
		} else {
			this.sio = new Player.SIO();
			this.sio.load({
							callback: receiveFromSIO.bind(this), 
							token:this.clientId, 
							callbackAfterHandshake: afterLoad.bind(this)})
		}	
		
		//Subscribe to events from sio.
		this.remoteViewModel.executeCommand.subscribe(function(options){
			sendToSIO.call(that, options);
		});
		
		//Apply model
		ko.applyBindings(this.remoteViewModel, $("#" + getConfig("mainHolder"))[0]);
	};
	
	var sendToSIO = function(options) {
		this.sio.executeCommand(options.command, options);
	};
	
	var receiveFromSIO = function(command, options) {
		//Just pass command to view model
		this.remoteViewModel.receiveCommand(command, options)
	};
	
	var afterLoad = function(){
		this.sio.executeCommand("dumpPlayerState", {});
	}
	
})(window.Player, jQuery);