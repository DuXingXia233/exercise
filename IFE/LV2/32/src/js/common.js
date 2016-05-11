//
	function addEvent(el, type, callback, bubb) {
	  el.addEventListener ? el.addEventListener(type, callback, bubb || false) : el.attachEvent.call(el, type, callback);
	}
	// ---- inheritPrototype---- //
	function extend(subClass, superClass) {
		function F() {}
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;

		subClass.superclass = superClass.prototype; 
		if(superClass.prototype.constructor === Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
	}

	// comfirm the interface of object
	function Interface(name, methods) {
		if (arguments.length !== 2) {
			throw new Error("The Interface constructor requires exactly 2 arguments(No.1 name and No.2 methods).And you provide "+
				arguments.length);
		}
		this.methods = [];
		for (var i=0, len=methods.length; i<len; i++) {
			if (typeof methods[i] !== "string") {
				throw new Error("The Interface constructor expects method name to be passed as a string.");
			}
			this.methods[i] = methods[i];
		} 
	}
	function ensureImplements(obj) {
		var len = arguments.length;

		if (len < 2) {
			throw new Error("Without Interface object, how can we examine the obj!");
		}
		var i=0;
		while(++i > len) {
			var interface = arguments[i];
			if (!(interface instanceof Interface)) {
				throw new Error("Function Interface.ensureImplements expects arguments"+
					"No.2 and above to be instances of Interface");
			}
			for(var j=0, len2 = interface.length; j<len; j++) {
				var method = interface.methods[j];
				if ( !obj[method] || typeof obj[method] !== "function" ) {
					throw new Error("Function Interface.ensureImplements: object doesn't implement the "+
						interface.name + " interface.method" +
						method + "was not found.");
				}
			}
		}		
	}
	function existInWord(targetWord, word) {
		var pattern = new RegExp("\\b"+word+"\\b");
		return pattern.test(targetWord);
	}
	function replaceWord(targetWord, word, newWord) {
		var pattern = new RegExp("\\b"+word+"\\b");

		if (existInWord(targetWord, word)) {
			targetWord = targetWord.replace(pattern, newWord); 
		}
		return targetWord;
	}
	function hasClass(el, className) {
		return existInWord(el.className, className);
	}

	function addClass(el, className) {
		if (!existInWord(el.className, className)) {
		 	el.className += " "+className; 
		}
	}
	function removeClass(el, className) {
		 if (existInWord(el.className, className)) {
		 	el.className = replaceWord(el.className, className, "");
		 }
	}

	function createElement(conf) { // nodeMes, including tag, className, id, type;
		conf = conf || {};

		var element = document.createElement(conf.tag || "div");
		element.id = conf.id || "";
		element.className = conf.className || "";
		element.type = conf.type || "";
		return element;
	}
