define(['ko', 'jqrcode'], function(ko){
	ko.bindingHandlers.stripyClass = {
	    init: function(element, valueAccessor) {
			var options = valueAccessor();
			$(element).addClass(options.isEven ? options.evenClass : options.oddClass)
	    }
	};

	ko.bindingHandlers.progressBarClick = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
			var callback  = valueAccessor();
		
			$(element).on("click", function(event){
				var parentOffset = $(this).offset(),
			   		elX = event.pageX - parentOffset.left,
					width = $(this).width(),
					position = ~~((elX*100)/width);
				
				callback.call(viewModel, position);
			});
		}/*,
		update: function()*/
	};

	ko.bindingHandlers.progressBarHover = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
			var duration  = valueAccessor(),
				tip = $(".customTip");
			
			$(element).on("mousemove", function(event){
				/* bad copypasting! */
				var parentOffset = $(this).offset(),
			   		elX = event.pageX - parentOffset.left,
					width = $(this).width(),
					position = ~~((elX*100)/width);
				
				var top = $(element).offset().top - 30,
					left = event.pageX - ~~tip.width(),
					_position = ~~((position * duration())/100)
				
				tip.text(readableDuration(_position));
				tip.css({left: left, top: top});
				tip.show();
			}).on("mouseout", function(){
				tip.hide();
			});
		},
	}
	ko.bindingHandlers.qrCode = {
	    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
	    },
	    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
	        var options = valueAccessor();
	        if (options.text){
	            $(element).empty().qrcode(options);
	        }
	    }
	};
	
	var setVolume = function(btns, volumetoSet){
		btns.removeClass("btn-primary");
		
		$.each(btns, function(){
			var volume = $(this).data("set");
			
			if(volume != "up" && volume != "down")
			{
				if(volume <= volumetoSet) {
					$(this).addClass("btn-primary");
				}
			}
		});
	};
	
	ko.bindingHandlers.volumeControl = {
		init: function(element, valueAccessor, _, viewModel){
			var options = valueAccessor();
			var btns = $(element).find(".btn");
						//{volume: currentVolumeLevel(), decrease: volumeDown, increase: volumeUp}
			btns.on("click", function(){
				var toSet = $(this).data("set");
				var currentVolume = options.volume;
				var _v = parseInt(toSet);
				
				if(toSet == "up" || toSet == "down") {
					_v = options.volume();
					
					if(toSet == "up"){
						_v = (_v + 1 > 5 ? 5 : _v + 1 );
					}
					if(toSet == "down"){
						_v = (_v - 1 < 0 ? 0 : _v -  1 );
					}
				}
				
				options.volume(_v);
			});
		
			//and set volume from view model
			setVolume(btns, options.volume());
		},
		update: function(element, valueAccessor, _, viewModel){
			var options = valueAccessor();
			var btns = $(element).find(".btn");
			setVolume(btns, options.volume());
		}
	}
});