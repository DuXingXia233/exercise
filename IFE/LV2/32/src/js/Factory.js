function Store(validator) {
	// 
	this.validator = validator;
}

Store.prototype = {
	create: function(options) { 
		var customValidata;	// 保存自定义验证函数

		if (typeof options.validate === "function") {

		  customValidata = options.validate;
		}

		// 处理参数默认值
		options = this.modify(options);

		if (customValidata) { //自定义验证函数
			options.validate = customValidata;
		} else { // validator 提供的验证函数
			options.validate = this.validator.create(options.validate);
		}
		var type = options.type.toLowerCase();
		var module;
		switch(type) {
			case "textarea":
			case "select":
			  module = type;
			  break;
			case "radio":
			case "checkbox":
			  module = "choose";
			  break;
			default:
			 module = "input";

		}
		return  new this.modules[module](options);

	},
	modify: (function() {
		function clone(deep) {  // 靠后的参数对象属性具有更高优先级
			var len = arguments.length;
			if (len<2) {
				return false;
			} 
			var jsons = Array.prototype.slice.call(arguments, 1);
			var json = {};
			len = len-1;

			for (var i=0; i<len; i++) {
				for (var key in jsons[i]) {

					if (deep && typeof jsons[i][key] === "object") {

						if (typeof json[key] !== "object") {
							json[key] = {};
						} 

						json[key] = clone(true, json[key], jsons[i][key]);
					} else {
						// json 的 key 属性未定义 或者  为空 
						if (!json.hasOwnProperty(key) || json[key] === "") {
							json[key] = jsons[i][key];
						}
					}
				}
			}

			return json;
		}

		return function(options) {

			return clone(true, options, this.defaults);
		};
	})()
};