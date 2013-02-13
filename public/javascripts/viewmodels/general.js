define(['ko', 'customBindings'], function(ko) {
	var generalViewModel = function(app) {
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
	
	return generalViewModel;
});