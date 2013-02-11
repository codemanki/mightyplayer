(function (Player, $) {
	/* 
		Application constructor
	*/
	Player.HQ = function () {
		var that = this;
		this.generalViewModel = new Player.ViewModels.General(this);
		this.player = null;
		
		load.call(this);
		
		initializeDependendencies.call(this, function () {
			ko.applyBindings(that.generalViewModel, $("#" + getConfig("mainHolder"))[0]);
			that.generalViewModel.loading(false);
			that.resolveUserStatus();
		});
		
		
	};
	/* 
		Try to get demo data from cookies. 
		If user was logged in as demo user and then reopened browser, do not make him to press Demo button again :)
	*/
	Player.HQ.prototype.checkForDemoMode = function () {
		return $.cookie('is_demo') == "true" && $.cookie('access_token').length > 0;
	};
	
	function load() {
		this.playlists = [];
		
		this.isDemoMode = false;
		this.clientId =  null;
		this.shareUrl = null;
		this.generalViewModel.user({});
		this.generalViewModel.isLoggedIn(false);
	};
	/*
		Try to retrieve user data.
	*/
	Player.HQ.prototype.resolveUserStatus = function () {
		var that = this;
		//Login and resolve user
		SC.get('/me', function (user, error) { 
			if(error) {
				//Check if user was previously in demo mode
				if(that.checkForDemoMode()) {
					//Login him with demo token
					that.performDemoLogin($.cookie('access_token'));
				} else {
					//If he is not logged in and not in demo, show auth page
					that.generalViewModel.isLoggedIn(false);
				}
			} else {
				userLoggedIn.call(that, {user: user, token:SC.accessToken()});
			}
		});
	};
	
	/* Logs in user and inits interface changes */
	Player.HQ.prototype.performLogin = function () {
		var that = this;
	    SC.connect(function () {
	      SC.get("/me", function (user, error) {
			if(!error) {
				userLoggedIn.call(that, {user: user, token:SC.accessToken()});
			}
	      });
	    });
	};
	/* Logout user */
	Player.HQ.prototype.performLogout = function () {
		//Rethink this method
		$.removeCookie('access_token', { path: getConfig("path") });
		$.removeCookie('is_demo', { path: getConfig("path") });
		
		this.player.unload();
		load.call(this);
		
		//TEMPORARY HACK!
		location.reload(true);
	};
	
	Player.HQ.prototype.performDemoLogin = function (token) {
		this.isDemoMode = true;
		userLoggedIn.call(this, {user: {username:getConfig("demologin")}, token: token || demoToken()});
	};
	
	/* Loads user playlists from SC*/
	Player.HQ.prototype.loadPlaylists = function (callback) {
		var that = this;
		if(this.isDemoMode) {
			SC.get("/resolve", {url:getConfig("demoplaylist")}, function (playlist) {
				that.playlists = [playlist];
				callback.call(that, that.playlists);
			});
		} else {
			SC.get('/me/playlists', function (playlists, error) {
				if(!error) {
					that.playlists = playlists; //just cache it
					callback.call(that, that.playlists);
				}
			});
		}
	};
	
	Player.HQ.prototype.getShareUrl = function () {
		//Because of awful google js api library, this hack with interval is introduced
		var that = this;
		
		var interval = setInterval(function () {
			if(gapi && gapi.client && gapi.client.urlshortener) {
				getUrl();
				window.clearInterval(interval);
			}
		}, 100);
		
		var getUrl = function () {
	        var request = gapi.client.urlshortener.url.insert({
			      'resource': {
			          'longUrl': getConfig("url") + "r/" + that.clientId
			      }
			  });

	        request.execute(function (response) {
	          	that.generalViewModel.shareUrl(response.id);
	        });
		}
	};
	
	
	
	Player.HQ.prototype.afterHandShake = function () {
		this.getShareUrl();
	};
	/* Private methods */
	
	/*
		Inits interface changes, so user gets logged in. Also stores token, so user don't have to log again
	*/
	function userLoggedIn(options) {
		this.generalViewModel.user(options.user);
		this.generalViewModel.isLoggedIn(true);
		
		$.cookie('access_token', options.token, { expires: getConfig("expires"), path: getConfig("path") });
		$.cookie('is_demo', this.isDemoMode, { expires: getConfig("expires"), path: getConfig("path") });
		
		this.clientId = converTokenToCode(options.token);
		afterUserLogin.call(this);
		this.afterHandShake();
	};
	

	/* 
		Method is called after user successfully logged in.
		It tries to get playlists from SC and init player with them.
	*/
	function afterUserLogin() {
		var that = this;
		
		var initPlayer = function (playlists) {
			
			if(!that.player)
				that.player = new Player.Player(this.isDemoMode);
				
			that.player.load();
			that.player.initPlayer();
			that.player.loadPlaylists(playlists);
		};
		
		//Get playlists from SC and after that pass them to player
		this.loadPlaylists(initPlayer);
	};
	
	function initializeDependendencies(callback) {
		/* Very simple loading of resources. 
			toLoad indicates how many resources need to be loaded and totalLoaded gets incremented each time something is loaded
		*/
		
		var toLoad = 1;
		var totalLoaded = 0;
	
		var onLoadCallback = function () {
			if(++totalLoaded >= toLoad) {
				if(callback)
					callback();
				callback = null; //Everything should be loaded only once.
			}
				
		};
		
		// Load SC object. If in demo mode, then do not pass any token. Default playlist will be loaded 
	  	SC.initialize({
			access_token: this.checkForDemoMode() ? "" : $.cookie('access_token'),
	    	client_id: getConfig("clientId"),
	    	redirect_uri: getConfig("redirectURI")
	  	});
	
		soundManager.setup({
			url: '/swf/',
			flashVersion: 9, // optional: shiny features (default = 8)
			useFlashBlock: false, // optionally, enable when you're ready to dive in
		 	onready: function () {
				onLoadCallback(); 
			}
		});
	};
	
	/*
		Converts token to 7 chars code. Code is used in url to identify player and remote.
	*/
	
	function converTokenToCode(token) {
		token = token.replace(/\W/g, '');
		return token.slice(0,4) + token.slice(-3); // take token and get first 4 chars and last 3
	};
	
})(window.Player, jQuery);