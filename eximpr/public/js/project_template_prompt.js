// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

class ProjectTemplatePrompt {
	constructor(opts) {
		this.init(opts);
	}

	init(opts) {
		$.each(opts, this.set.bind(this));
	}

	get_title() {
		return __("Project Template Picker");
	}

	get_primary_label() {
		return __("Continue");
	}

	start() {
		this.control = frappe
			.prompt(
				this.get_fields(),
				this.on_complete.bind(this),
				this.get_title(),
				this.get_primary_label()
			);
	}

	on_complete(data) {
		this.make_ajax_call(data);
	}

	build_args(args) {
		$.extend(args, {
			doc: this.frm.doc,
		});
		return args;
	}

	get_method(args) {
		return [
			"eximpr",
			"handlers",
			"project",
			"fetch_values_from_template",
		].join(".");
	}
	make_ajax_call(args) {
		frappe
			.call({
				method: this.get_method(),
				args: this.build_args(args),
				callback: this.callback.bind(this),
			});
	}

	callback(response) {
		const { message } = response;

		if (message) {
			frappe.run_serially([
				() => frappe.model.sync(message),
				() => this.frm.refresh(),
			]);
		}
	}

	get_fields() {
		return {
			label: __("Project Template"),
			fieldtype: "Link",
			fieldname: "project_template",
			options: "Project Template",
		};
	}

	set(key, value) {
		this[key] = value;
	}

	get(key) {
		return this[key];
	}
}
