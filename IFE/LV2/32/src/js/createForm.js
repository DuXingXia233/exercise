// 初始数据处理
function createForm(id, className, parent, title, factory, items) {
	var form = new Form(id, className, title);
	var conf, newOne;
	if (items) {

		while ((conf=items.shift())) {
			
			newOne = factory.create(conf);

			form.addChild(newOne);
		}
	}
	parent.appendChild(form.getElement());
	return form;
}
