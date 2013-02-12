window.Player = window.Player || {};
window.Player.config = {};
//TODO: Move this to config file
window.Player.config["clientId"] = __env == "development" ? "cb7f39c56528c597d6b35815228fa5c9" : "543e5304664d4b777895970d23fac7e9";
window.Player.config["url"] = __env == "development" ? "http://192.168.1.100:8080/" : __url; 
window.Player.config["siourl"] = __env == "development" ? "http://192.168.1.100/" : __url
window.Player.config["redirectURI"] = __url + "auth.html";
window.Player.config["mainHolder"] = "mainHolder";
window.Player.config["playerHolder"] = "playerHolder";
window.Player.config["path"] = "/";
window.Player.config["expires"] = 90;
window.Player.config["remotecontrol"] = "remoteControl";
window.Player.config["demoplaylist"] = "https://soundcloud.com/oleksii-sribnyi/sets/player";
window.Player.config["demologin"] = "Stranger";
window.Player.config["googleapikey"] = "AIzaSyCysd95mg6dLF7_3MK2yzQ5vYvBqDS8GdY";
window.Player.config["isRemoteMode"] = __isRemoteMode;
window.Player.config["remoteModeClientId"] = __remoteClientId;

window.Player.Application = null; // Application class instance, current application scope. Either HQ or Remote
window.Player.ViewModels = {}; 

function getConfig(key) {
	return window.Player.config[key] || null;
};

function rand42() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

function demoToken() {
    return rand42() + rand42() + rand42(); // to make it longer
};

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

$(function () {
       if(getConfig("isRemoteMode")) {
               window.Player.App = new Player.Remote();
       } else {
               window.Player.App = new Player.HQ();
       }
});