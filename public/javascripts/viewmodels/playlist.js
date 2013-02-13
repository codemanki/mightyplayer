define(['ko'], function(ko) {
	var playlistViewModel = function(rawPlaylist) {
		var that = this;
		this.playlistId = rawPlaylist.id;
		this.tracks = ko.observableArray([]);
		this.title = rawPlaylist.title;
		this.uri = rawPlaylist.uri;	

		this.addTrack = function(rawTrack) {
			this.tracks.push(new Player.ViewModels.Track(rawTrack));
		};

		//TODO: When playlist edit option will be available, make this computable
		this.numberOfTracks = function() {
			return this.tracks().length;
		};

		//TODO: When playlist edit option will be available, make this computable
		this.readableTitle = function() {
			return that.title + " tracks [total:" + that.numberOfTracks() + "]";
		};

		this.getTrackById = function(trackId) {
			var track;

			$.each(this.tracks(), function(_, element) {
				if(element.trackId == trackId) {
					track = element;
					return;
				}
			});

			return track;
		}

		/* Initialization */
		$.each(rawPlaylist.tracks, function(_, element) {
			that.addTrack(element);
		});
	};
	
	return playlistViewModel;
});