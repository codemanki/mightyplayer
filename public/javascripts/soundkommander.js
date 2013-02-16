define(["jquery", "config", "soundmanager2"], function($, config, soundManager){
	
	var events = {
		onPlay: function(track){ },
		onPause: function(track){ },
		onResume: function(track){ },
		onStop: function(track){ },
		onPlaying: function(track){ }
	};
	
	var sk = function(eventsCallbacks) {
		this.playlist = null;
		this.state = {status:"stopped", currentSong: null};
		this.currentTrackInfo = {id: null, time: null};
		this.tracks = [];
		this.events = $.extend({}, events);
		$.extend(this.events, eventsCallbacks);
		
	};
	

	/* 
		Method receives playlist and onready callback. Inits playlist's songs to soundmanager and fires onReady callback
	*/
	sk.prototype.initPlayList = function(playList, onReady) {
		var that = this;
		clearAll.call(this);
		this.playlist = playList;
		this.status = -1; // -1 stopped, 0: paused, 1: playing
		this.currentTrack = 0;
		this.volume = 60; // level 3 * 20
		
		//TODO: This dependency should be moved somewhere
		var getStreamUrl = function(track){
			return track.stream_url + "?client_id=" + config.getConfig("clientId");
		};
		
		soundManager.onready(function() {
			$.each(that.playlist.tracks, function(_, track) {
				if(!track.streamable)
					return;
					
				var trackObj = soundManager.createSound({
					id: track.id.toString(), //bad
				   	autoPlay: false,
				   	autoLoad: true,
					stream: true,
					volume: volume.call(that),
					url: getStreamUrl(track),
					onplay: function(){
						that.events.onPlay(this.id);
					},
					onpause: function(){
						that.events.onPause(this.id);
					},
					onresume: function(){
						that.events.onResume(this.id);
					},
					onstop: function(){
						that.events.onStop(this.id);
					},
					whileplaying: function(){
						that.events.onPlaying(this.id, {position: this.position, duration: track.__duration, volume: volumeToLevel(this.volume)});
					},
					onfinish: function(){
						if(that.currentTrack == that.tracks.length - 1){
							that.events.onStop();
						} else {
							switchTrack.call(that, "next");
						}
						
					}
				});
				//Soundmanager cannot resolve duration before it loads whole mp3 file. So, use duration from soundcloud data
				trackObj.__duration = track.duration;
				
				that.tracks.push(trackObj);	
			});
			
			if(onReady)
				onReady();
		});
		
	};
	
	/* 
		Unloads tracks and destroys soundmanager
	*/
	sk.prototype.unload = function() {
		clearAll.call(this);
		soundManager.reboot();
	};
	/* 
		Return current SK state.
		Dumps this info:
		- Current status
		- Current trackId
		- Current track position
		- Current track duration
		- Current playlist info
	*/
	sk.prototype.dumpState = function() {
		var toDump = {
			status: this.status,
			trackId: null,
			trackPosition: 0,
			trackDuration: 0,
			playlistId: (this.playlist ? this.playlist.id : null)
		};
		
		if(this.status != -1 && this.tracks[this.currentTrack]) {
			var track = this.tracks[this.currentTrack];
			toDump.trackId = track.id;
			toDump.duration = track.__duration;
			toDump.position = track.position
		}
		
		return toDump;
	}
	
	sk.prototype.executeCommand = function(command, options) {
		//We cannot perform anything, if there are no tracks
		if(this.tracks.length == 0)
			return;
			
		switch (command) {
			case "play":
				play.call(this);
			break;
			
			case "pause":
				pause.call(this);
			break;
			
			case "playTrack":
				playTrackById.call(this, options.trackId);
			break;
			
			case "prev":
				switchTrack.call(this, "prev");
			break;
			
			case "next":
				switchTrack.call(this, "next");
			break;
			
			case "stop":
				stop.call(this);
			break;
			
			case "changeTrackPosition":
				setPosition.call(this, options.position);
			break;
			
			case "setVolume":
				volume.call(this, options.volume)
			break
		}
	};
	
	/* private methods */
	function volumeToLevel(value){
		return ~~(value/20)
	};
	function volume(newValue){
		if(newValue === undefined)
			return volumeToLevel(this.volume);
		
		if(newValue >= 0 && newValue <= 5){
			this.volume = newValue * 20;
			
			if(this.status != -1){
				this.tracks[this.currentTrack].setVolume(this.volume);
			}
		}
	}
	
	/* 
		Stops playing, unloads tracks
	*/
	function clearAll() {
		var that = this;
		//First, stop everything
		stop.call(this);
		//and unload all tracks
		$.each(this.tracks, function(_, track){
			track.destruct();
		});
		this.tracks = [];
	};
	
	/* 
		If track is playing, position can be passed and track will be rewinded to it.
		position is int from 0 to 100
	*/
	function setPosition(position) {
		if(this.status != 1)
			return;
			
		var track = this.tracks[this.currentTrack],
			duration = track.__duration, //since duration is dynamic property, use estimated
			toSet = ~~((position * duration)/100);
			
		track.setPosition(toSet);
	}
	/* 
		Receives track id and starts playing it.
	*/
	function playTrackById(trackId) {
		var index = findTrackIndexInPlayList.call(this, trackId);
		playTrackByIndex.call(this, index);
	};
	
	/* 
		Gets track index in array and starts playing.
	*/
	function playTrackByIndex(index) {
		if(index === null || index === undefined)
			return;
		
		//If we are playing the same song as it wants to play, then probably user is pressing prev/next like mad
		if(this.status == 1 && index == this.currentTrack)	
			return;
			
		stop.call(this);
		
		this.currentTrack = index;
		this.status = 1;
		this.tracks[index].setVolume(this.volume);
		this.tracks[index].start();
	}
	
	function stop() {
		if(!(this.currentTrack >= 0) || !this.tracks[this.currentTrack])
			return;
		
		
		//This is done to properly handle events, as they are being	thrown at the moment, when stop is called. 
		//So we should update status and call stop only after it 
		var track = this.currentTrack;
		
		this.currentTrack = 0;
		this.status = -1;	
		this.tracks[track].stop();
	};
	
	function pause() {
		if(!(this.currentTrack >= 0)  || !this.tracks[this.currentTrack])
			return;
			
		this.status = 0;
		this.tracks[this.currentTrack].pause();
	};
	
	function resume() {
		if(!(this.currentTrack >= 0)  || !this.tracks[this.currentTrack])
			return;
			
		this.status = 1;
		this.tracks[this.currentTrack].resume();
	};
	/*
		Starts the play mechanism. See method's comments
	*/
	function play() {
		
		var tracksLength = this.tracks.length;
			
		//just to be sure, that play cannot be pressed while playing
		if(this.status == 1)
			return;
		
		//Play can have two separate behavious. 
		//First, if no song is playing, start from first one
		if(this.status == -1) {
			playTrackById.call(this, this.tracks[0].id);
			return;
		}

		//Second, if player is on pause, just resume it
		if(this.status == 0){
			resume.call(this);
			return;
		}
			
	};
	/*
		Switches track to next or to prev in play list
		Direction can be "prev" or "next"
	*/
	function switchTrack(direction) {
		var trackIndexToPlay = null;
		
		if(direction == "prev"){
			if(this.currentTrack - 1 < 0)
				trackIndexToPlay = 0
			else
				trackIndexToPlay = this.currentTrack - 1
		}
		
		if(direction == "next"){
			//Special case, when user just loaded player and presses next
			if(this.currentTrack == 0 && this.status == -1)
				trackIndexToPlay = 0;	
			else if(this.currentTrack + 1 >= this.tracks.length)
				trackIndexToPlay = this.tracks.length - 1 ;
			else
				trackIndexToPlay = this.currentTrack + 1
		}
		
		playTrackByIndex.call(this, trackIndexToPlay);
	}
	
	/* 
		Method gets trackid and goes through all tracks to determine track's index in array.
	*/
	function findTrackIndexInPlayList(trackId) {
		var result = null
		
		$.each(this.tracks, function(index, track){
			if(track.id == trackId.toString()){
				result = index;
				return true;
			}
		});
		
		return result;
	}
	
	return sk;
});