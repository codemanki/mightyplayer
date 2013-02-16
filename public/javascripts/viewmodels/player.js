define(['ko', 'playlistViewModel', 'customBindings'], function(ko, PlaylistViewModel) {
	/* Player contains playlists*/
	var playerViewModel = function() {
		var that = this;
	
		this.playlists = ko.observableArray([]); //all playlists
		this.currentPlaylist = ko.observable(null); //currently selected playlist
		this.currentTrack = ko.observable(null); //currently played song
		this.playerStatus = ko.observable(-1); //-1 stopped, 1 playing, 0 paused
		this.executeCommand = ko.observable({command: null, data: null}); //event for objects to subscribe for changes on ui
		this.trackPosition = ko.observable(0); //if player is playing, onplay event dumps current track duration here
		
		this.volume = ko.observable(3);
		
		//Return track position in readabale format e.g. 02:12
		this.trackPositionReadable = ko.computed(function() {
			return readableDuration(that.trackPosition());
		});
		
		//Returns track progress in percentage
		this.trackProgressReadable = ko.computed(function() { //return percents
			if(that.playerStatus() == -1 || !that.currentTrack())
				return;
				
			return ~~(that.trackPosition()*100/that.currentTrack().duration) + '%';
		});
		
		/*
			When progress bar is clicked, lets change coordinates to percentage
		*/
		this.progressBarClicked = function(position) {
			that.executeCommand({command: "changeTrackPosition", data: {position:position}});
		};
		
		//Just a wrapper
		this.currentTrackDurationReadable = function() {
			var duration = that.currentTrackDuration();
			if(duration)
				return readableDuration(that.currentTrackDuration());
		};
		
		this.currentTrackDuration = function() {
			if(that.currentTrack())
				return that.currentTrack().duration;
		};
		
		this.selectPlaylist = function(playlist) {
			that.currentPlaylist(playlist);
		};
		
		/*
			When user clicks on track in playlist, play it.
		*/
		this.selectTrack = function(track) {
			that.executeCommand({command: "playTrack", data: {trackId:track.trackId}});
		};
		
		this.triggerVolumeChange = function(){
			that.executeCommand({command: "setVolume", data: {volume: this.volume()}});
		};
		
		this.addPlaylist = function(rawPlaylist) {
			this.playlists.push(new PlaylistViewModel(rawPlaylist));
		};
		
		//Lazy initialization for player
		this.initPlayer = function() {
			this.currentPlaylist(this.playlists()[0]);
		};
		
		this.playerTitle = ko.computed(function() {
			if(that.currentTrack()) {
				return that.currentTrack().title;
			} else {
				return "Nothing is playing"
			}
		}, this);

		
		this.receiveCommand = function(command, options) {
			switch(command) {
				case "play":
					play.call(this, options.trackId);
				break;
				
				case "stop":
					stop.call(this);
				break;
				
				case "pause":
					pause.call(this);
				break;
				
				case "resume":
					resume.call(this);
				break;
				
				case "playing":
					playing.call(this, options);
				break;
			}
		};
		
		var play = function(trackId) {
			selectTrackById.call(this, trackId);
			this.playerStatus(1);
		};
		
		var stop = function(trackId) {
			this.currentTrack(null)
			this.playerStatus(-1);
			this.trackPosition(0);
		};
		
		var pause = function(trackId) {
			this.playerStatus(0);
		};
		
		var resume = function(trackId) {
			this.playerStatus(1);
		};
		
		var playing = function(options) {
			this.trackPosition(options.position);
			
			if(this.volume() != options.volume){
				this.volume(options.volume)
			}
		};	
		
		var selectTrackById = function(trackId) {
			if(!this.currentPlaylist())
				return

			this.currentTrack(this.currentPlaylist().getTrackById(trackId));
		};
		
		/* 
			Clears data in model, so it can be refreshed
		*/
		this.unload = function() {
			this.playlists([]);
			this.currentPlaylist(null);
			this.playerStatus(null);
			this.executeCommand({command: null, data: null});
			this.trackPosition(0);
			//this.volume(3); think about it
		};
	};
	return playerViewModel;
});