
function Carousel(DOM, options) {
	this.target = DOM;

	this.init(options);

}

Carousel.prototype = {
	// default options
	default: {
		radiusX: 230, 	// Horizontal radius 水平角度
		radiusY: 80, 	// Vertical radius 纵向角度
		width: 512,		// Width of warpping element 容器宽度
		height: 300,	// Height of warpping element 容器宽度
		containerTag: 'div', // 临时赋予图片的容器的标签
		frameRate: 30,	// Frame rate in milliseconds 帧率（以毫秒为单位）
		cycle: 5000,	// Time it takes for carousel  to make one complete rotrate 旋转木马旋转一周所花时间
		minScale: 0.60	// This is the smallest scale applied to the farthest item 应用到旋转木马最远元素的最小变化比例
	},
	// modify options
	init: function(options) {
		var Default = this.default,
			key;

		options = typeof options === 'object' ? options : {};

		for ( key in Default) {
			options[key] = options[key] || Default[key];
		}

		this.target.style.position = 'relative';
		this.target.style.width = options.width + 'px';
		this.target.style.height = options.height + 'px';

		this.setCarousel(options);

	},

	loadImage: function(img, src, callback) {
		function complete() {
			removeEvent(img, 'load', complete);
			callback(img);
		}
		addEvent(img, 'load', complete);

		if(img.complete) {
			var event =  document.createEvent("HTMLEvents");
			event.initEvent("load", true, false);
			img.dispatchEvent(event);
		}
		img.setAttribute('src', '');
		img.setAttribute('src', src);
	},

	setImg:function(img, angle, options) {
		var load = false,	// Flag to indicate image has been loaded
			orgWidth,		// Orginal, unscaled width of image
			orgHeight,		// same as the former but for height
			orginTag,		// a new tag image is attached to
			sizeRange = (1 - options.minScale) * 0.5,
			parent = img.parentNode,
			that;

		img.style.opacity= 0;
		img.style.filter = "alpha(opacity=0)";
		img.style.position = 'absolute';

		orginTag = document.createElement(options.containerTag);
		orginTag.style.position = 'absolute';
		orginTag.style.display = 'block';
		parent.appendChild(orginTag);
		orginTag.appendChild(img);

		that = {
			update: function(ang) {
				var sinVal, scale, x, y;

				ang += angle;

				sinVal = Math.sin(ang);
				scale = ((sinVal + 1) * sizeRange) + options.minScale;

				x = ((Math.cos(ang) * options.radiusX) * scale) + options.width / 2;
				y = ((Math.sin(ang) * options.radiusY) * scale) + options.height / 2;

				orginTag.style.left = (x >> 0) + 'px';
				orginTag.style.top = (y >> 0) + 'px';
				orginTag.style.zIndex = scale * 100 >> 0;

				if(loaded) {
					img.style.width = (orgWidth * scale) + 'px';
					img.style.height = (orgHeight * scale) + 'px';
					img.style.top = (-orgHeight * scale) / 2 + 'px';
					img.style.left = (-orgWidth * scale) / 2 + 'px';
				}
			}
		};


		this.loadImage(img, img.getAttribute('src'), function(image) {

			loaded = true;
			orgWidth = image.offsetWidth;
			orgHeight = img.offsetHeight;

			img.style.opacity = 1;
		});

		return that;

	},


	setCarousel: function(options) {
		var items = [],
			item,
			image,
			rot = 0,
			pause = false,
			unpauseTimeout = null,
			// Now calculate the amount to rotate per frameRate tick
			rotAmout = 2 * (Math.PI) * (options.frameRate / options.cycle), 
			imgs = this.target.querySelectorAll("img"),
			len = imgs.length,
			// Calculate the angular spacing between items
			spacing = 2 * Math.PI / len,
			// This is the angle of the first item at the front of the carousel
			angle = Math.PI / 2,
			i;

		function trigger(event) {
			event = event || window.event;
			// var traget = event.target || event.srcElement;
			// if (target.nodeName.tolowerCase() != options.orginTag) {
			// 	return false;
			// }

			if( event.type === 'mouseover') {
				clearTimeout(unpauseTimeout);

				pause = true;
			} else {
				unpauseTimeout = setTimeout(function() {
					pause = false;
				}, 200);
			}


		}
		addEvent(this.target, "mouseover", trigger);
		addEvent(this.target, "mouseout", trigger);

		for(i=0; i < len; i++) {
			image = imgs[i];
			item = this.setImg(image, angle, options);
			items.push(item);
			angle += spacing;
		}

		setInterval(function(){
			if(!pause) {
				rot += rotAmout;
			}
			for( i=0; i<len; i++) {
				items[i].update(rot);
			}
		}, options.frameRate);

	}
};