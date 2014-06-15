(function ($) {
	var columns = 0,
	rows = 0,
	colWidth = 300,
	colMargin = 10,
	residualSpace = 0,
	windowWidth = 0,
	blockArrs = [],
	wrapperMinWidth = parseInt($('html').css('min-width'), 10),
	boxes = $(),
	wrapper = {},
	news_item_template = _.template('<div data-href="<%= link %>" class="smart_box" title="Click to read more..."> \
														<h2><%= title %></h2> \
														<img src="<%= image %>" alt="Image Illustration"> \
														<article> \
														<%= details %> \
														</article> \
													</div>');
	
	var getURLParameter = function(name) {
	    return decodeURI(
	        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	    );
	}

	var init = function () {
		wrapper = $('#wrapper');
		var URL = location.protocol + '//' + location.hostname + location.pathname;
		var keyword = decodeURI(getURLParameter('keyword'));
		if(keyword === 'null') {
			keyword = '世界杯';
		}
		var searchField = $('#search');
		var form = $('#searchbox');
		var placeholderText = keyword;
		
		document.title = keyword;
		searchField.attr("placeholder", placeholderText);
		searchField.attr('value',placeholderText).addClass('placeholder');
		searchField.focus(function() {				
			if( ($(this).val() == placeholderText) )
			{
				$(this).attr('value','');
				$(this).removeClass('placeholder');
			}
		}).blur(function() {				
			if ( ($(this).val() == placeholderText) || (($(this).val() == '')) )                      
			{	
				$(this).addClass('placeholder');					  
				$(this).attr('value',placeholderText);
			}
		});
		form.on('submit', function(e){
			var keyword = searchField.val();
			e.preventDefault();
			history.pushState({keyword: keyword}, "", "?keyword="+keyword);
			wrapper.empty().height(wrapperMinWidth-170);
			document.title = keyword;
			fetchData(keyword);
		});
		window.onpopstate = function(event) {
			if(!!event.state){
				window.location.href = URL + '?keyword=' + encodeURIComponent(event.state.keyword);				
			}
			else{
				window.location.href = URL + '?keyword=' + encodeURIComponent(keyword);
			}
		};
		fetchData(keyword);
	}
	
	var fetchData = function (keyword) {
		var box_html = [];
		wrapper.addClass('ajaxloader');
		// fetch news content
		url = 'http://localhost/cgi-bin/amazon.py?keyword=' + keyword;
		imagesXhr = $.getJSON(url,
			function (response) {
				for (var count = response[0].length - 1; count >= 0; count--) {
					box_html = news_item_template({
					link : response[1][count],
					title : response[0][count],
					image : response[3][count],
					details : '亚马逊： ' + response[2][count]
				});
				wrapper.append(box_html);
			};
		}).fail(function () {
			console.log("error fetching news illustration");
		}).done(function () {
			$.when.apply($, imagesXhr).then(function () {
				wrapper.removeClass('ajaxloader');
				boxes = $('.smart_box');
				boxes.each(function () {
					$(this).click(function (e) {
						window.location.href = $(this).data('href');
					});
				});
				boxes.css('visibility', 'visible');
				setup();
		    });
		});
		url = 'http://localhost/cgi-bin/taobao.py?keyword=' + keyword;
		imagesXhr = $.getJSON(url,
					function (response) {
						for (var count = response[0].length - 1; count >= 0; count--) {
							box_html = news_item_template({
							link : response[1][count],
							title : response[0][count],
							image : response[3][count],
							details : '淘宝： ' + response[2][count]
						});
						wrapper.append(box_html);
					};
				}).fail(function () {
					console.log("error fetching news illustration");
				}).done(function () {
					$.when.apply($, imagesXhr).then(function () {
						wrapper.removeClass('ajaxloader');
						boxes = $('.smart_box');
						boxes.each(function () {
							$(this).click(function (e) {
								window.location.href = $(this).data('href');
							});
						});
						boxes.css('visibility', 'visible');
						setup();
				    });
				});
	}

	var setup = function () {
		var windowWidth = $(window).width();
		windowWidth = (wrapperMinWidth > windowWidth) ? wrapperMinWidth : windowWidth;
		columns = Math.floor(windowWidth / (colWidth + colMargin * 2));
		rows = Math.ceil(boxes.length / columns);
		residualSpace = (windowWidth - ((colWidth * columns) + (colMargin * (columns - 1)))) / 2 - 10;
		blockArrs = []; // empty array
		for (var i = 0; i < columns; i++) {
			blockArrs.push(colMargin);
		}
		position();
	}

	var position = function () {
		wrapper.height(rows * boxes.outerHeight() + 40); // set the wrapper height according to the number of boxes
		boxes.each(function (i) {
			var min = Math.min.apply(Math, blockArrs); // get minimum value from the array
			var index = $.inArray(min, blockArrs);
			var leftPos = colMargin + (index * (colWidth + colMargin));
			this.style.left = (leftPos + residualSpace) + 'px';
			this.style.top = min + 'px';
			blockArrs[index] = min + $(this).outerHeight() + colMargin;
		});
	}

	//init on dom ready
	$(function () {
		init(); // fire on page load
		$(window).resize(setup); // fire on page resize
	});

}(jQuery));
