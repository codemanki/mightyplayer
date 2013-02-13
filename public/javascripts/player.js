define(["jquery", "ko", "config", "playerViewModel", "sio", "soundkommander", "app"], 
function($, ko, config, PlayerViewModel, SIO, SK, app){
	
	/* View model items*/
	var player = function () {
		var that = this;
		this.playerDiv = $();
		this.playlists = [];
		
		this.playerViewModel = new PlayerViewModel();
		this.sio = new SIO();

		// Load sound commander and pass callbacks. This should be refactored.
		this.sk = new SK({
			onPlay: function (trackId) { 
											console.log("Event from SK - onplay"); 
											sendToSIO.call(that, "play", {trackId: trackId}); 
											that.playerViewModel.receiveCommand("play", {trackId: trackId}); 
										},
			onPause: function (trackId) { 
											console.log("Event from SK - onPause"); 
											sendToSIO.call(that, "pause");  
											that.playerViewModel.receiveCommand("pause"); 
									 	},
			onResume: function (trackId) { 
											console.log("Event from SK - onResume"); 
											sendToSIO.call(that, "resume");  
											that.playerViewModel.receiveCommand("resume"); 
										},
			onStop: function (trackId) { 
											console.log("Event from SK - onStop"); 
											sendToSIO.call(that, "stop"); 
											that.playerViewModel.receiveCommand("stop"); 
										},
			onPlaying: function (trackId, options) {  
											that.playerViewModel.receiveCommand("playing", options);
											}
		});
		
		//Connect backend with front end
		this.playerViewModel.executeCommand.subscribe(function (options) {
			that.sk.executeCommand(options.command, options.data);
		});
		
		//And subscribe for playlist change
		this.playerViewModel.currentPlaylist.subscribe(function (newPlaylist) {
			//if null playlist is assigned, sk shouldn't know about it. 
			if(newPlaylist)
				that.sk.initPlayList(findPlayListById.call(that, newPlaylist.playlistId));
		});
	};
	
	var sendToSIO = function (command, options) {
		options = options || {};
		
		if(command != "playing")
			options.dump = dumpPlayerState.call(this);
			
		this.sio.executeCommand(command, options)
	};
	
	var receiveFromSIO = function (command, options) {
		//in future this should move to sk, but now it will stay here :)
		if(command == "dumpPlayerState") {
			var dump = dumpPlayerState.call(this);
			this.sio.executeCommand("playerStateDumped", {dump:dump});
		} else {
			this.sk.executeCommand(command, options);
		}
	};
	
	/* 
		Loads player. Right now only sio.
	*/
	player.prototype.load = function () {
		this.sio.load({callback: receiveFromSIO.bind(this), token: app.getApp().clientId});
	};
	
	/* 
		Unloads player, but doesn't detroy anything
	*/
	player.prototype.unload = function () {
		this.sio.unload();
		this.sk.unload();
		this.playlists = [];
		this.playerViewModel.unload();
	};
	
	/* 
		This method is used for lazy player loading. 
		Since ko parses all templates as soon as it loads them player should be initialized only after user login.
	*/
	player.prototype.initPlayer = function () {
		//lazy template binding
		this.playerDiv =  $("#" + config.getConfig("playerHolder"));
		ko.applyBindingsToNode(this.playerDiv[0], { template: { name: 'player.general'} }, this.playerViewModel);
	};
	
	/* 
		Metod gets playlists from SC and passes them to viewmodel and draws player ui.
	*/
	player.prototype.loadPlaylists = function (playlists) {
		var that = this;
		that.playlists = playlists;
		
		$.each(playlists, function (_, rawPlaylist) {
			that.playerViewModel.addPlaylist(rawPlaylist);
		});
		
		//Load player after playlists are loaded, since everything is ready
		that.playerViewModel.initPlayer();
	};	
	/* private methods */
	
	
	function findPlayListById(playListId) {
		var playlist = null;
		$.each(this.playlists, function (_, _playlist) {
			if(_playlist.id == playListId) {
				playlist = _playlist;
				return true;
			}
		});
		return playlist;
	};
	/* 
		Method is used to dump current player state with playlists, tracks, current playlist, current song and status
	*/
	function dumpPlayerState() {
		var toDump = {
			playlists: [], 
			state: this.sk.dumpState()
		};
		
		//Dump all playlists 
		$.each(this.playlists, function (_, _playlist) {
			var playlist = {
				id: _playlist.id,
				title: _playlist.title,
				tracks: []
			};
			//And all tracks
			$.each(_playlist.tracks, function (_, _track) {
				var track = {
					id: _track.id,
					title: _track.title,
					duration: _track.duration,
					enabled: _track.streamable
				}
				playlist.tracks.push(track);
			});
			
			toDump.playlists.push(playlist);
		});
		
		//We are playing something right now, so get trackInfo
		if(toDump.state.status != -1 && toDump.state.playlistId && toDump.state.trackId)	{
			var playlist = findPlayListById.call(this, toDump.state.playlistId);
			
			if(playlist) {
				$.each(playlist.tracks, function (_, track) {
					if(track.id == toDump.state.trackId) {
						toDump.state.trackTitle = track.title;
						return true;
					}
				});
			}
			
		}
		
		return toDump;
	};
	
	return player;
});