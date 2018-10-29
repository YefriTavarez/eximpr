// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

class TaskMultiSelect {
	constructor(opts) {
		this.init(opts);
	}

	init(opts) {
		$.each(opts, this.set.bind(this));
	}

	set(key, value) {
		this[key] = value;
	}

	get_docfield() {
		return {
			label: __("Depends On"),
			fieldname: "depends_on_tasks",
			fieldtype: "MultiSelect",
		};
	}

	make_control() {
		this.control = frappe.ui.form
			.make_control({
				df: this.get_docfield(),
				parent: this.wrapper,
				render_input: true,
				get_data: this.get_data.bind(this),
			});

		this.control.$input
			.on("change", 
				this.handle_control_change
					.bind(this));
		
		this.set_value();
		this.refresh();
	}

	get_data() {
		const value = this.get_value(),
			values = value.split(',')
				.filter(d => d.trim()),
			data = this.tasks.map(d => d.title);
		
		const index = data.indexOf(this.doc.title);
		if (index !== -1) {
			data.splice(index, 1);
		}

		return data
			.filter(d => !values.includes(d));
	}

	get_value() {
		return this.doc
			.depends_on_tasks || '';
	}

	sanitize(value) {
		return cstr(value)
			.split(",")
			.map(d => d.trim())
			.uniqBy(d => d)
			.filter(d => d)
			.join(", ");
	}

	set_value() {
		const sanitized = this
			.sanitize(this.doc.depends_on_tasks);

		this.control
			.set_value(sanitized);
	}

	handle_control_change(event) {
		const { target } = event,
			sanitized = this
				.sanitize(target.value);

		frappe.model
			.set_value(
				this.doc.doctype, 
				this.doc.name,
				"depends_on_tasks",
				sanitized
			);
	}

	refresh() {
		this.grid
			.refresh();
	}
}
