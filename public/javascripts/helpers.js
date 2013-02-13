

// For console.log safeness
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});

//
/* 
	Converts milliseconds to mm:ss
*/
var readableDuration = function (duration) {
	var secs = (duration/1000),
	 	minutes = ~~(secs/60),
	 	seconds = ~~(secs - minutes * 60),
		readable = function(t){
			return (t < 10 ? "0" + t : t)
		};
	
	return readable(minutes) + ":" + readable(seconds);
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