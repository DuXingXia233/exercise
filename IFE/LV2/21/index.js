// ----- common.js ----- //
function addEvent(el, type, callback, bubb) {
  el.addEventListener ? el.addEventListener(type, callback, bubb || false) : el.attachEvent.call(el, type, callback);
}

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// ---- Tag ----- //
function Tag(config) {

	this.init(config);
}


Tag.prototype = {
	defaults: {
		el: null,
		target: null,
		content: null,
		tagClass: "",
		tagActiveClass: "",
		datas: [],
		keyCodes: [13],
		splitPattern: /\s|,|，/,
		maxLimted: 10,
		Repeatable: false
	},

	init: function(config) {
		var defaults = this.defaults;

		var key;
		for (key in defaults) {
			this[key] = config[key] || defaults[key];
			if (config[key] === null) {
				console.log(this.config);
				console.log(key + "is not legal !");
				return ;
			}
		}
		this.el = document.querySelector(this.el);
		this.target = this.el.querySelector(this.target);
		this.content = this.el.querySelector(this.content);

		this.initStacks();
		this.initInput();
		this.initContent();
		this.render();
	},

	initStacks: function() {

		var that = this,
			datas = that.datas,
			Repeatable = that.Repeatable,
			MAX = that.maxLimted+1,
			queue = [];


		function FreshData(data) {
			 return queue.indexOf(data) === -1;
		}
		
		queue.enqueue = function(item) {
			if (Repeatable || FreshData(item)) {

				queue.push(item);
				if(queue.length > MAX) {
					queue.dequeue();
				}
			}
		};
		queue.dequeue = function() {
			return queue.shift();
		};

		datas.forEach(function(item) {
			queue.enqueue(item);
		});

		that.datas = queue;


	},

	initInput: function() {
		var that = this,
			target = that.target,
			splitPattern = that.splitPattern;
			
		function checkKeyCode(code) {
			return codes.some(function(item) {
				return code === item;
			});
		}

		if (target.nodeName.toUpperCase() === "INPUT") {
			var codes = that.keyCodes;

			addEvent(target, "keydown", function(event) {
				event = event || window.event;
				keyCode = event.keyCode ||event.which;
				if (checkKeyCode(keyCode)) {
					var value = target.value.trim();
					target.value = '';

					that.add(value);
					that.render();
					event.preventDefault();
					event.retrunValue = false;
				}
			});
		} else {
			var button = that.el.querySelectorAll("button");

			button = button[button.length-1];

			addEvent(button, "click", function() {
				that.getTextAreaInput();
				that.render();
			});
		}

	},
	initContent: function() {
		var that = this,
			orginalClass = that.tagClass,
			activeClass = that.tagActiveClass,
			container = that.content;

		function del(event) {
			var target, index;

			event = event || window.event;
			target = event.target || event.srcElement;

			if (target.hasOwnProperty("index")) {
				index = target.index;
				that.datas.splice(index, 1);
				that.render();
			}
		}
		function hover(event) {
			var target;
			event = event || window.event;
			target = event.target || event.srcElement;


			if (target.hasOwnProperty("index")) {
				target.className = orginalClass +" "+ activeClass;
			}
		}

		function out(event) {
			var target;

			event = event || window.event;
			target = event.target || event.srcElement;

			if (target.hasOwnProperty("index")) {
				target.className = orginalClass;
			}
		}

		addEvent(container, "click", del);
		addEvent(container, "mouseover", hover);
		addEvent(container, "mouseout", out);
	},
	getTextAreaInput: function() {
		var that = this,
			datas = that.datas,
			target = that.target,
			splitPattern = that.splitPattern;

		var values = target.value.split(splitPattern);
		target.value = '';

		function addItem(item) {
			item = item.trim();
			if (item !== '') {
				that.add(item);
			}
			
		}

		values.forEach(addItem);

	},
	add: function(item) {
		this.datas.enqueue(item);
	},
	del: function(index) {
		this.datas.splice(index, 1);
	},
	render: function() {
		var content = this.content,
			data = this.datas,
			tagClass = this.tagClass,
			index = 0;

		var fragment = document.createDocumentFragment();
		function setContent(DOM, item) {
			DOM.className = tagClass;
			DOM.textContent = item;
			
		}
		content.innerHTML = '';

		data.forEach(function(item) {
			var div = document.createElement("div");

			div.index = index;

			setContent(div, item);

			index++;

			fragment.appendChild(div);
		});
		content.appendChild(fragment);
	}
};

