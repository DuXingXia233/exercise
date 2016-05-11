// Validator Class
function Validator(){
	
}
Validator.prototype = {
	defaults: {
		max: -1,
		min: -1,
		email: false,
		number: false
	},
	create: function(options) {
		var defaults = this.defaults;
		var testPatterns = [];
		for (var key in defaults) {
			options[key] = options[key] || defaults[key];
		}
		
		// 修复 上下限都大于0 且大小颠倒 
		if (options.max >0 && options.min >0 && options.max < options.min) {
			options.max = options.max - options.min;
			options.min = options.max + options.min;
			options.max = options.min - options.max;
		}
		if (options.min > 0) {
			testPatterns.push(this.minTest(options.min));
		}
		if (options.max > 0)
		{
			testPatterns.push(this.maxTest(options.max));
		}
		options.email && testPatterns.push(this.emailTest);
		options.number && testPatterns.push(this.numberTest);

		return function(value) {
			var i = testPatterns.length;
			while(i-- >0) {
				if (testPatterns[i](value)) continue;
				return false;
				
			}
			return true;
		};
	},
	maxTest: (function() {
		var pattern = /[\u0000-\u00ff]/; // 单字节字符
		return function(max) {
			return function(string) {
				var count = 0;
				for (var i=0, len=string.length; i<len; i++) {
					pattern.test(string.charAt(i)) ? count++: count += 2;
					if (count > max) {
						return false;
					}
				}
				return true;
			};
		};
	})(),
	minTest: (function() {
		//
		var pattern = /[\u0000-\u00ff]/; // 单字节字符
		return function(min) {
			return function(string) {
				var count = 0;
				for (var i=0, len=string.length; i<len; i++) {
					pattern.test(string.charAt(i)) ? count++: count += 2;
					if (count >= min) {
						return true;
					}
				}
				return false;
			};
		};
	})(),
	numberTest: (function() {
		var pattern = /^-?\d+$/;

		return function(value) {
			return pattern.test(value);
		};
	})(),
	emailTest: (function() {
		var pattern = /^[a-zA-z\d]([\.\_\-]*[a-zA-z\d]+)*\@[a-zA-z\d]+(\.[a-zA-Z]{2,5})+$/;
		return function(value) {
			return pattern.test(value);
		};
	})()

};