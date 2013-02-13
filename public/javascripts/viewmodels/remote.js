define(['ko'], function(ko) {
	
	var remoteViewModel = function() {
		this.status = ko.observable(-1); // -3 loading -2 error, -1 stopped, 1 playing, 0 paused ; -1 - loading, -2 error, 1 playing, 2 paused, 3 stopped
		this.playerTrack = ko.observable(null);
		this.substatus = ko.observable("");
		this.isLoggedIn = ko.observable(false); //to support general layout
		this.executeCommand = ko.observable({command: null, data: null});
		
		this.statusReadable = ko.computed(function() {
			var status = "Status: [";
			if(this.playerTrack())
				status = this.playerTrack()+" [";
				
			switch(this.status()) {
				case -3:
					status+="Loading...";
				break;
				
				case -2:
					status+= "Some error occured. Here is description: " + this.substatus();
				break;
				
				case 1:
					status+= "Playing..."
				break;
				
				case 0:
					status+= "Paused"
				break;
				
				case -1:
					status+= "Nothing is playing"
				break;
			}
			
			status += "]";
			return status;
		}, this);
		
		
		this.receiveCommand = function(command, options) {
			switch(command) {
				case "play":
					this.status(1);
				break;
				
				case "stop":
					this.status(-1);
				break;
				
				case "pause":
					this.status(0);
				break;
				
				case "resume":
					this.status(1);
				break;
				
				case "playerStateDumped":
					this.status(options.dump.state.status);
				break;
			}
			console.log(options);
			
			if(options && options.dump) {
				this.playerTrack(options.dump.state.trackTitle);
			}
		};
	};
	
	return remoteViewModel;
});