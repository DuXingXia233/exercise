formStore = new Store( new Validator());
formStore.modules = {
	"textarea": TextareField,
	"choose": ChooseField,
	"input": InputField,
	"select": SelectField
};

formStore.defaults =  {
		name: "",
		label: "",
		type: "",
		required: false,
		placeholder: "",
		validate: {
			max: -1,
			min: -1,
			number: false,
			email: false
		},
		class: {
			default: "form-items",
			fail: "fail",
			success: "success",
			focus: "focus"
		},
		mes: {
			focus: "",
			success: "验证通过",
			fail: "格式不符"
		},
		options: {}
};

var show = document.getElementById("show");
var form1 = createForm("form1", "form", show, "此表单生产新输入组件并加入新表单", formStore, [
	{
		name: "type",
		label: "类型:",
		type: "select",
		required: true,
		mes: {
			focus: "爷，选一个呗",
			fail: "必须选一个"
		},
		options: {
			"文本": "text",
			"邮箱": "email",
			"数字": "number",
			"文本框": "textarea",
			"单选框": "radio",
			"多选框":"checkbox",
			"下拉框": "select"
		}
	},{
		name: "label",
		label: "外部展示用标签名:",
		placeholder: "不给你自己看着办",
		validate: {
			max: 12,
			min: 3
		},
		mes: {
			focus: "给个3~12字节的名字呗",
			success: "验证通过",
			fail: "格式不符"
		}
	},{
		name: "name",
		label: "组件内部索引名:",
		type: "text",
		mes: {
			focus: "随意但不可重复(包括空字符)",
		}
	},{
		name: "focus",
		label: "focus提示:",
		type: "text",
		placeholder: "默认为空",
		required: false,
		validate: {
			max: 12,
			min: 1
		},
		mes: {
			focus: "随意",
		}
	},{
		name: "fail",
		label: "格式错误提示:",
		type: "text",
		placeholder: "格式不符",
		mes: {
			focus: "随意",
		}
	},{
		name: "success",
		label: "验证通过提示:",
		type: "text",
		placeholder: "验证通过",
		mes: {
			focus: "随意",
		}
	},{
		name: "required",
		label: "需求:",
		type: "radio",
		mes: {
			focus: "选一个呗"
		},
		options: {
			"非必需": false,
			"必需": true,
		}
	},{
		name: "max",
		label: "字数上限:",
		type: "number",
		required: true,
		validate: {
			number: true
		},mes: {
			focus: "你要是想666我也没办法,顺带一提负数表示不检查"
		},
	},{
		name: "min",
		label: "下限:",
		type: "number",
		required: true,
		validate: {
			number: true
		},
		mes: {
			focus: "同上"
		}
	},
	{
		name: "options",
		label: "选项:",
		type: "textarea",
		required: true,
		placeholder: '{'+'\n  '+'"label1": "value1",'+'\n  '+'"label2": "value2"'+'\n'+'}',
		validate: function(string) {
			try {
				JSON.parse(string);
				return true;
			}
			catch (e) {
				return false;
			}
		},
		class: {
			fail: "fail",
			success: "success",
			focus: "focus"
		},
		mes: {
			focus: "接受JSON格式,否则无效"
		}
	}

]);
var form2 = createForm("form2", "form", show, "新表单", formStore);

// 设置默认值
form1.formItems.options.input.defaultValue = '{'+'\n  '+'"选项1": "value1",'+'\n  '+'"选项2": "value2",'+'\n  '+'"选项3": "value3",'+'\n  '+'"选项4": "value4"'+'\n'+'}';
form1.formItems.label.input.defaultValue = "标签名";
form1.formItems.name.input.defaultValue = "name";
form1.formItems.max.input.defaultValue = -1;
form1.formItems.min.input.defaultValue = 1;
form1.formItems.success.input.defaultValue = "验证通过";
form1.formItems.fail.input.defaultValue = "格式错误";


//
form1.setCallback(function(json) {
	var newConf = {};
	for (var key in json) {
		newConf[key] = json[key];
	}

	newConf.validate = {};
	newConf.mes = {};

	switch (newConf.type) {
		case "email": 
			newConf.validate.email = true;
			break;
		case "number":
			newConf.validate.number = true;
			break;
	}
	newConf.options = JSON.parse(newConf.options);
	function collecte(obj, tokey, keys) {
		for (var i=0, len=keys.length; i<len; i++) {
			if (obj.hasOwnProperty(keys[i])) {
				obj[tokey][keys[i]] = obj[keys[i]];
				delete obj[keys[i]];
			}
		}
	}
	collecte(newConf, "validate", ["max", "min"]);
	collecte(newConf, "mes", ["focus", "success", "fail"]);
	if (newConf.required) {
		newConf.required = newConf.required === "true" ? true: false;
	}
	form2.addChild(formStore.create(newConf));
});

form2.setCallback(function(json) {
	json = JSON.stringify(json).split(",").join(",\n   ");
	confirm(json);
});