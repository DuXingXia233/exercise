


// ------ Interface -----//
// 
var FormMoudel = new Interface("FormMoudel", ["addChild", "getValue", "validate"]);
var InputMoudel = new Interface("InputMoudel", ["getValue", "validate"]);


function Form(id, className, title) {
	this.id = id;
	this.formItems = {};

	this.element = createElement({
		tag: "form",
		id: id,
		className: className
	});
	this.button = createElement({
		tag: "button"
	});
	this.button.innerHTML = "提交";

	if (typeof title !== "undefined") {
		var header = createElement({
			tag: "h3"
		});
		header.innerHTML = title;
		this.element.appendChild(header);
	}
	this.element.appendChild(this.button);

	var that = this;

	addEvent(this.button, "click", function(e) {
		e = e|| window.event;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		if (that.validate()) {
			console.log(that.getValue());
			that.callback && that.callback(that.getValue());
		} 
	});
}

Form.prototype = {
	addChild: function(item) {
		ensureImplements(item, InputMoudel);
		var name = item.name;
		if (this.formItems[name]) {
			console.log(this.id+" 表单: \n组件名: "+item.name +" 已存在");
			this.formItems[name].validate();
			return;
		}
		item.parent = this;
		this.formItems[name] = item;
		this.element.insertBefore(item.getElement(), this.button);
	},
	getValue: function() {
		var items = this.formItems;
		var data = {};
		if (this.validate()) {
			for (var name in  items) {
				data[name] = items[name].getValue();
			}
			return data;
		}
		console.log(this.name+"验证失败！");
	},
	validate: function () {
		var items = this.formItems,
			result = true;
		for (var name in items) {

			if (items[name].validate()) continue;

			result = false;
			this.fail && this.fail();
			break;
		}
		result && this.success && this.success();
		return result;
	},
	setCallback: function(fn) {
		if (typeof fn === "function") {
			this.callback = fn;
		}
	},
	getElement: function() {
		return this.element;
	}
};

// normal input Class //
function InputField(conf) {

	this.name = conf.name;
	this.conf = conf;

	this.element = createElement({
		tag: "fieldset",
		className: conf.class.default
	});
	this.label = createElement({
		tag: "label",
		className: "form-item-title"
	});
	this.input = createElement({
		tag: "input",
		className: "form-item-input",
		type: conf.type
	});
	this.tip = createElement({
		tag: "span",
		className: "form-item-tip"
	});
	this.required = conf.required;
	this.diyValidate = conf.validate;
	this.label.innerHTML = conf.label;
	this.status= "default";

	this.input.placeholder = conf.placeholder;
	this.element.appendChild(this.label);
	this.element.appendChild(this.input);
	this.element.appendChild(this.tip);
	var that = this;
	addEvent(this.input, "focus", function() {
		that.reset();
	});
	addEvent(this.input, "blur", function() {
		that.validate();
	});

}
extend(InputField, Form);

InputField.prototype.getValue = function() {
	// if (this.conf.type === "number") {
	// 	return Number(this.input.value);
	// }
	return this.input.value;
};
InputField.prototype.validate = function() {
	var value = this.getValue();
	var result = true;

	if (value.length !== 0 || this.required) { // 值不为空 或者 要求必填
		result = this.diyValidate(this.getValue());
		result ? (this.status="passed") : (this.status = "error");
	} else {
		this.status = "";
	}
	this.setTip();
	return result;
};
InputField.prototype.reset = function() {
	var conf = this.conf;
	this.element.className = conf.class.default +" "+ conf.class.focus;
	this.tip.innerHTML = conf.mes.focus;
};
InputField.prototype.fail = function() {
	var conf = this.conf;
	this.element.className = conf.class.default +" "+conf.class.fail;
	this.tip.innerHTML = conf.mes.fail;
};
InputField.prototype.success = function() {
	var conf = this.conf;
	this.element.className = conf.class.default +" "+ conf.class.success;
	this.tip.innerHTML = conf.mes.success;
};
InputField.prototype.setTip = function() {
	var status = this.status;
	var conf = this.conf;
	var message;
	switch (status) {
		case "error": 
			this.element.className = conf.class.default +" "+conf.class.fail;
			message = conf.mes.fail;
			break;
		case "passed":
			this.element.className = conf.class.default +" "+conf.class.success;
			message = conf.mes.success;
			break;
		case "hidden":
			this.element.style.display = "none";
			break;
		default: 
		    this.element.className = conf.class.default;
		    break;
	}
	this.tip.innerHTML = message || "";
};

// textarea Class


function TextareField(conf) {
	this.name = conf.name;
	this.conf = conf;

	this.element = createElement({
		tag: "fieldset",
		className: conf.class.default
	});
	this.label = createElement({
		tag: "label",
		className: "form-item-title"
	});
	this.input = createElement({
		tag: "textarea",
		className: "form-item-input",
	});
	this.tip = createElement({
		tag: "span",
		className: "form-item-tip"
	});

	this.required = conf.required;
	this.diyValidate = conf.validate;
	this.label.innerHTML = conf.label;
	this.input.placeholder = conf.placeholder;
	
	this.element.appendChild(this.label);
	this.element.appendChild(this.input);
	this.element.appendChild(this.tip);
	var that = this;
	addEvent(this.input, "focus", function() {
		that.reset();
	});
	addEvent(this.input, "blur", function() {
		that.validate();
	});
}
extend(TextareField, InputField);



// Select Class
function SelectField(conf) {
	var options = conf.options,
		option;
	var optionsExsit = false;

	if (typeof options === "undefined") {
		console.log("组件识别名: "+conf.name +"未配置选项");
		return;
	}
	this.input = createElement({
		tag: "select",
		className: "form-item-input"
	});
	for (var key in options) {
		optionsExsit = true;
		option = createElement({
			tag: "option"
		});
		option.value = options[key];
		option.innerHTML = key;

		this.input.appendChild(option);
	}

	if (!optionsExsit) {
		console.log("组件识别名: "+conf.name +"选项为空");
		return;
	}

	this.conf = conf;
	this.name = conf.name;
	this.required = conf.required;

	this.element = createElement({
		tag: "fieldset",
		"className": conf.class.default
	});
	this.label = createElement({
		tag: "label",
		className: "form-item-title"
	});
	this.tip = createElement({
		tag: "span",
		className: "form-item-tip"
	});
	this.label.innerHTML = conf.label;

	this.element.appendChild(this.label);
	this.element.appendChild(this.input);
	this.element.appendChild(this.tip);

	var that = this;
	addEvent(this.input, "focus", function() {
		that.reset();
	});
	addEvent(this.input, "blur", function() {
		that.validate();
	});
}

extend(SelectField, InputField);
SelectField.prototype.getValue = function() {
	var data = [];
	var options = this.input.options;
	for (var i=0, len=options.length; i<len; i++) {
		if (options[i].selected) {
			data.push(options[i].value);
		}
	}
	return data.join(",");
};
SelectField.prototype.validate = function() {
	var value = this.getValue();
	var result = true;

	if (value.length !== 0 || this.required) {
		result = !!value.length;
		result ? this.status = "passed" : this.status = "error";
	} else {
		this.status = "";
	}
	this.setTip();

	return result;
};


// Input Choose Class //
function ChooseField(conf) {
	var options = conf.options,
		option, label;
	if (typeof options === "undefined") {
		console.log("组件识别名: "+conf.name +"没有配置选项");
		return;
	}
	var optionsExsit = false; // 防止options 为 空对象{}

	this.input = createElement({
		tag: "div",
		className: "form-item-input"
	});

	var countId =0; // label 与 input 匹配 id
	for (var key in options) {
		optionsExsit = true;
		option = createElement({
			id : conf.name+countId,
			tag: "input",
			type: conf.type,
		});
		label = createElement({
			tag: "label",
		});
		label.setAttribute("for", conf.name+countId);
		option.setAttribute("name", conf.name);
		label.innerHTML = key;
		option.innerHTML = key;
		option.value = options[key];

		this.input.appendChild(label);
		this.input.appendChild(option);

		countId++;
	}
	
	if (!optionsExsit) {
		console.log("组件识别名: "+conf.name +"选项为空");
		return;
	}
	this.conf = conf;
	this.name = conf.name;
	this.required = conf.required;

	this.element = createElement({
		tag: "fieldset",
		"className": conf.class.default
	});
	this.label = createElement({
		tag: "label",
		className: "form-item-title"
	});
	this.tip = createElement({
		tag: "span",
		className: "form-item-tip"
	});

	this.label.innerHTML = conf.label;

	this.element.appendChild(this.label);
	this.element.appendChild(this.input);
	this.element.appendChild(this.tip);

	this.reset();
	var that = this;

	addEvent(this.input, "click", function(e) {
		e = e|| window.event;
		var target = e.target || e.srcElement;
		if (target.tagName.toLowerCase() === "input" || 
			target.tagName.toLowerCase() === "label") {
			that.validate();
		}
	});

	// if (conf.type === "radio") {
	// 	this.element.elements[0].checked = true;
	// }
}

extend(ChooseField, SelectField);
ChooseField.prototype.getValue = function() {
	var elements = this.element.elements,
		len = elements.length;
	this.getValue = function() {
		var data = [];

		for (var i=0; i<len; i++) {
			if (elements[i].checked) {
				data.push(elements[i].value);
			}
		}
		return data.join(",");
	};

	return this.getValue();
};
