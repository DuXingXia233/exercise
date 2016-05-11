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
		var element = document.createElement(conf.tag || "div");
		element.id = conf.id || "";
		element.className = conf.className || "";
		element.type = conf.type || "";
		return element;
	}


// ------ Interface -----//
var CompositeModule = new Interface("CompositeModule", ["addChild", "removeChild", "getElement", "destory"]);
// ------- abstract Class -------- //
function Composite(name) {
	this.components = {};
	this.num = 0;
	this.name = name;
	this.parent = null;
	this.element = null;
}
Composite.prototype = {
	addChild: function(component) {
		if (!this.components.hasOwnProperty(component.name)) { 
			ensureImplements(component, CompositeModule);

			this.num++;
			this.components[component.name] = component;
			component.parent = this;
			this.element.appendChild(component.getElement());
			return true;
		} else {
			console.log(component.name +" 已存在，别挤行吗？");
		}
	},
	removeChild: function(name) {
		var component = this.components[name];
		if (component) {
			component.getElement().parentNode.removeChild(component.getElement());
			delete component.parent;
			delete this.components[name];
			this.num--;
			return true;
		} else {
			console.log("name no exsite in "+ this.name);
		}
	},
	getChild: function(name) {
		var components = this.components;
		var result = null;
		for (var key in components) {
			if ( name === key) {
				result = components[key];
				break;
			}
		}
		return result;
	},
	getElement: function() {
		return this.element;
	},
	destory: function() {
		if (this.parent) {
			this.parent.removeChild(this.name);
		} else {
			this.element.parentNode.removeChild(this.element);
		}
	},
	setLogo: function(logoClassName) {
		if (this.logo) {
			this.logo.className = logoClassName;
		}
	}
};


// TopRoot Class //
function TopRoot(nodeConf, name) {
	TopRoot.superclass.constructor.call(this, name);
	this.element = createElement(nodeConf);
	this.timer = null;
	this.delay = 500;
	this.click.call(this);
	this.free = true;
}

extend(TopRoot, Composite);
TopRoot.prototype.deF = function(callback) {
	var that = this;

	(function recursion(component) {

		if(callback)  {
			callback.call(that, component);
		}
		var components = component.components;
		for (var name in components) {
			recursion(components[name]);
		}
	})(this);
};
TopRoot.prototype.clearSearchRsult = function() {
	var queue = this.queue, len, i;
	var el;
	if (queue && (len =queue.length)) {
		for (i=0; i<len; i++) {
			el = queue[i].component.getElement();
			removeClass(el, "found");
			removeClass(el, "open");
			removeClass(el, "active");
		}
	}
	
	this.queue = [];
};
TopRoot.prototype.cacheSearchRsult = function(info) {
	this.queue.push(info);
};
TopRoot.prototype.setDelayTime = function(time) {
	if (isNaN(time) || time<=12) {
		return;
	}
	this.delay = time;
};
TopRoot.prototype.animation = function() {
	var that = this;
	var queue = that.queue,
		len = queue.length,
		i = 1;
	var el;
	this.timer = setInterval(function() {
		var current;
		if (el) {
			removeClass(el, "processing");
		}
		if ((current = queue[i])) {
			 el = current.component.getElement();
			if (current.found) {
				addClass(el, "found");
			}
			addClass(el, "processing open");
		} else {
			clearInterval(that.timer);
			that.free = true;
			alert(" deF done");

		}
		i++;
	}, this.delay);
};
TopRoot.prototype.search = function(info) {
	
	if (!this.free) {
		alert("Busy !");
		return;
	} 
	if (!info.length || !(info =info.trim()).length) {
		alert("nothing will happen.");
	}
	this.free = false;
	this.clearSearchRsult();

	function callback(component) {
		var found = false;
		if (component.name.search(info)>-1) {
			found = true;
		}
		this.cacheSearchRsult({
			component: component,
			found: found
		});
	}

	this.deF(callback);
	this.animation();
};
TopRoot.prototype.click = (function() {
	function getSlibings(el) {
		var parent = el.parentNode;
		var slibings = [];
		for (var i=0, len = parent.childNodes.length; i<len; i++) {
			var child = parent.childNodes[i];
			if (child.nodeType === 1 && hasClass(child, "floder") && el !== child) {
				slibings.push(child);
			}
		}
		return slibings;
	}
	return function() {
		var that = this;

		// show and hiden
		addEvent(this.element, "click", function(e) {
			e = e || window.event;
			var target = e.target || e.srcElement;

			if (hasClass(target, "title")) {
				var parent = target.parentNode;
				var slibings = getSlibings(parent);
				for (var i=0, len=slibings.length; i<len; i++) {
					removeClass(slibings[i], "active");
					removeClass(slibings[i], "open");
				}
				if (hasClass(parent, "active")) {
					removeClass(parent, "active");
					removeClass(parent, "open");
				} else {
					addClass(parent, "active");
					addClass(parent, "open");

				}
			}
		});
	};
})();


// Floder Class //
function Floder(name) {
	Floder.superclass.constructor.call(this, name);
	this.element = createElement({
		className: "floder"
	});
	this.delBtn = createElement({
		tag: "span",
		className: "title-btn del icon-trash"
	});
	this.addBtn = createElement({
		tag: "span",
		className: "title-btn add icon-plus"
	});
	this.logo = createElement({
		tag: "i"
	});
	this.label = createElement({
		tag: "span",
		className: "floder-tit"
	});
	this.header = createElement({
		"tag": "dl",
		className: "title"
	});
	this.header.appendChild(this.logo);
	this.header.appendChild(this.label);
	this.header.appendChild(this.addBtn);
	this.header.appendChild(this.delBtn);
	this.element.appendChild(this.header);
	this.updataLabel();
	var that = this;
	addEvent(this.delBtn, "click", function(e) {
		if (confirm("真要删除？")) {
			e=e || window.event;
			e.stopProgation ? e.stopProgation() : e.cancelBubble = true;
			that.destory();
		}
	});
	addEvent(this.addBtn, "click", function(e) {
		e=e || window.event;
		e.stopProgation ? e.stopProgation() : e.cancelBubble = true;
		var name = prompt();
		if (name && (name = name.trim())) {
			that.create(name);
		} else {
			alert("nothing will happen.");
		}

	});
}

extend(Floder, Composite);
Floder.prototype.addChild = function(component) {
	if (Floder.superclass.addChild.call(this, component)) {
		this.updataLabel();
	} else {
		console.log(component.name +" 已存在，别挤行吗？");
	}
};
Floder.prototype.removeChild = function(name) {
	if (Floder.superclass.removeChild.call(this, name)) {
		this.updataLabel();
	}
};
Floder.prototype.updataLabel = function() {
	var label = this.label;
	label.innerHTML = this.name +"("+this.num+")";
};
Floder.prototype.create = function(name) {
	var type = name.split(".")[1] || "floder";
	var newOne = myStore.create(name, type);
	this.addChild(newOne);
};

// File Class //
function File(name) {
	File.superclass.constructor.call(this, name);
	this.element = createElement({
		tag: "dd",
		className: "file"
	});
	this.header = createElement({
		tag: "div",
		className: "title"
	});
	this.logo = createElement({
		tag: "i"
	});
	this.label = createElement({
		tag: "span",
		className: "file-tit"
	});
	this.label.innerHTML = name;
	this.delBtn = createElement({
		tag: "span",
		className: "title-btn del icon icon-trash"
	});
	this.header.appendChild(this.logo);
	this.header.appendChild(this.label);
	this.header.appendChild(this.delBtn);
	this.element.appendChild(this.header);
	var that = this;
	addEvent(this.delBtn, "click", function(e) {
		if (confirm("真要删除？")) {
			e=e || window.event;
			e.stopProgation ? e.stopProgation() : e.cancelBubble = true;
			that.destory();
		}
	});

}
extend(File, Composite);
File.prototype.addChild = function() {};
File.prototype.removeChild = function() {};
File.prototype.getChild = function() {};

// 
// 
// factory
function Store() {
}
Store.prototype = {
	create: function(name, type) {
		var newOne;
		var logo = type;
		type = this.checkType(type);
		
		newOne = new this.models[type](name);

		ensureImplements(newOne, CompositeModule);
		this.setLogo(newOne, logo);
		return newOne;
	},
	checkType: function(type) {
		var result = "unknownFile";

		type = type.toLowerCase();
		for (var key in this.models) {
			if (type === key) {
				result = key;
				break;
			}
		}

		return result;
	},
	setLogo: function(component, type) {
		var logo;
		if (component.hasOwnProperty("logo")) {

			switch (type.toLowerCase()) {
				case "floder":
				  logo =this.logo[type];
				  break;
				case "jpg":
				case "png":
				case "jepg":
				  logo = this.logo.img;
				  break;
				default:
				  logo = this.logo.unknownFile;
			}
			component.setLogo(logo);
		}
	}
};

var myStore = new Store();
myStore.models = {
	"floder": Floder,
	"unknownFile": File
};
myStore.logo = {
	"floder": "icon icon-folder-1",
	"img": "icon icon-file-image",
	"unknownFile": "icon icon-doc"
};
function createComposite(JSON, parent) {

	var root = new TopRoot({
		id: "root",
		tag: "div",
		className: "root"
	}, "nothing");
	(function recursion(JSON, component) {
		var key, name, type, newOne;
		for ( key in JSON) {
			name = key;
			type = name.split(".")[1] || "floder";

			newOne = myStore.create(name, type);

			if (type === "floder") {
				recursion(JSON[key], newOne);
			}
			component.addChild(newOne);
		}
	})(JSON, root);

	parent.appendChild(root.getElement());

	return root;
}

