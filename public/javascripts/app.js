var deps = ["config"];
if(__isRemoteMode) //get rid of this hack
{
	deps.push("remote");
}
else
{
	deps.push("hq");
}
define(deps, function (config, HEART) {
    var app;

    return {
		init: function() {
			app = new HEART(); //Either remote or path
		},
        getApp: function () { return app; }
    };
});
