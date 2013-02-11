

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