(function(Player){
	Player.ViewModels = Player.ViewModels || {}; 
	
	Player.ViewModels.General = function(app) {
		var url = "";
		
		this.isLoggedIn = ko.observable(false);
		this.loading = ko.observable(true); //if true, loading indicator is shown
		this.user = ko.observable({});

		this.shareUrl = ko.observable(null);
				
		this.login = function() {
			app.performLogin();
		};
		
		this.logout = function() {
			app.performLogout();
		};
		
		this.demoLogin = function() {
			app.performDemoLogin();
		};
	};
	
})(window.Player);