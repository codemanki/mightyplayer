define(function(){
	var _config = {};
	
	_config["clientId"] = __env == "development" ? "cb7f39c56528c597d6b35815228fa5c9" : "543e5304664d4b777895970d23fac7e9";
	_config["url"] = __env == "development" ? "http://192.168.1.100:8080/" : __url; 
	_config["siourl"] = __env == "development" ? "http://192.168.1.100/" : __url
	_config["redirectURI"] = __url + "auth.html";
	_config["mainHolder"] = "mainHolder";
	_config["playerHolder"] = "playerHolder";
	_config["path"] = "/";
	_config["expires"] = 90;
	_config["remotecontrol"] = "remoteControl";
	_config["demoplaylist"] = "https://soundcloud.com/oleksii-sribnyi/sets/player";
	_config["demologin"] = "Stranger";
	_config["googleapikey"] = "AIzaSyCysd95mg6dLF7_3MK2yzQ5vYvBqDS8GdY";
	_config["isRemoteMode"] = __isRemoteMode;
	_config["remoteModeClientId"] = __remoteClientId;
	
	return {
		getConfig: function(key){
			return _config[key] || null
		}
	}
});
