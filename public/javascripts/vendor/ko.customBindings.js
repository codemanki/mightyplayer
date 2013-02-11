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
/*
ko.bindingHandlers.showTip = {
    init: function(element, valueAccessor) {
		var tip = $("<div/>").addClass("customTip").html("test");
		
		var options = valueAccessor();
		$(element).addClass(options.isEven ? options.evenClass : options.oddClass)
		$("body").append(tip);
    },
	update: function(){
		
	}
};*/