(function(Player) {
	Player.ViewModels = Player.ViewModels || {}; 
	
	Player.ViewModels.Track = function(rawTrack) {
		this.enabled = rawTrack.streamable;
		this.title = rawTrack.title;
		this.permalink_url = rawTrack.permalink_url;
		this.uri = rawTrack.uri;
		this.duration = rawTrack.duration;
		this.trackId = rawTrack.id;
		
		this.readableDuration = function() {
			return readableDuration(this.duration);
		};
	};
	
})(window.Player);