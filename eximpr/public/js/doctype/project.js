// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on("Project", {
	refresh: frm => {
		$.map([
			"set_reqd_fields",
			"add_custom_buttons",
		], frm.trigger.bind(frm));
	},
	onload: frm => {
		$.map([
			"add_fetches",
			"set_defaults",
		], frm.trigger.bind(frm));
	},
	onload_post_render: frm => {
		$.map([
			"set_queries",
		], frm.trigger.bind(frm));
	},
	set_reqd_fields: frm => {
		const { doc } = frm;

		if (
			frm.flags
				&& frm.flags.from_refresh
		) {
			frm.flags = {};
			return ;
		}

		if (!doc.project_type) { return ; }

		$.map([
			"customer",
			"sales_order",
		], fieldname => {
			frm.toggle_reqd(fieldname,
				cint(doc.sales_order_reqd));
		});

		if (!frm.flags) {
			frm.flags = {};
		}

		frm.flags.from_refresh = true;
		frm.refresh();
	},
	set_queries: frm => {
		$.map([
			"set_sales_order_query",
		], frm.trigger.bind(frm));
	},
	set_defaults: frm => {
		let { doc } = frm;

		if (!doc.status) {
			doc.status = "Open";
		}
	},
	add_fetches: frm => {
		$.map([
			"add_sales_order_fetch",
		], frm.trigger.bind(frm));
	},
	add_custom_buttons: frm => {
		$.map([
			"add_load_from_template_btn",
		], frm.trigger.bind(frm));
	},
	add_sales_order_fetch: frm => {
		$.each({
			loading_port: "loading_port",
			destination_port: "destination_port",
			total_net_weight: "total_net_weight",
			customer: "customer",
			base_rounded_total: "estimated_costing",
		}, (source_field, target_field) => {
			frm.add_fetch("sales_order",
				source_field, target_field);
		});
	},
	set_sales_order_query: frm => {
		frm.set_query("sales_order", event => {
			return {
				filters: {
					customer: frm.doc.customer,
					docstatus: 1,
				}
			};
		});
	},
	add_load_from_template_btn: frm => {
		if (!frm.is_new()) { return ; }

		const label = __("Load");

		frm.add_custom_button(__("From Template"),
			event => frm.trigger("load_from_template"),
			label);

		frm.page
			.set_inner_btn_group_as_primary(label);
	},
	load_from_template: frm => {
		const dialog =
			new ProjectTemplatePrompt({	frm });

		dialog.start();
	},
	update_dates: frm => {
		const method = "eximpr.api.update_dates_for_project",
			{ doc } = frm,
			args = { doc },
			callback = response => {
				if (!response) { return ; }

				const { message } = response;

				frappe.run_serially([
					() => frappe.model.sync(message),
					() => frappe.timeout(1),
					() => frm.refresh(),
				]);
			};
		frappe.call({ method, args, callback });
	},
	sales_order: frm => {
		const {
			doc,
		} = frm, {
			project_name,
			customer,
			project_type,
			sales_order,
		} = doc;

		if (sales_order && !project_name) {
			frm.set_value("project_name",
				`${sales_order}: ${customer}`);
		}
	},
	expected_start_date: frm => {
		frm.trigger("update_dates");
	},
});

frappe.ui.form.on("Project Task", {
	start_date: (frm, doctype, docname) => {
		const doc = frappe.get_doc(doctype, docname),
			{ add_days } = frappe.datetime;

		let { tasks } = frm.doc,
			_start_date = doc.start_date;

		$.grep(tasks, task => task.idx >= doc.idx)
			.map(task => {
				task.start_date = _start_date;
				_start_date = add_days(_start_date,
					cint(task.lead_time));

				// set the end date for the current task
				task.end_date = _start_date;
			});

		frm.refresh_fields();
		frm.set_value("expected_end_date",
			_start_date);
	},
	end_date: (frm, doctype, docname) => {
		const doc = frappe.get_doc(doctype, docname),
			{ add_days } = frappe.datetime;

		let { tasks } = frm.doc,
			_start_date = doc.end_date;

		$.grep(tasks, task => task.idx > doc.idx)
			.map(task => {
				task.start_date = _start_date;
				_start_date = add_days(_start_date,
					cint(task.lead_time));

				// set the end date for the current task
				task.end_date = _start_date;
			});

		frm.refresh_fields();
		frm.set_value("expected_end_date",
			_start_date);
	},
	status: (frm, doctype, docname) => {
		const { set_value } = frappe.model,
			row = frappe.get_doc(doctype, docname);

		if (row.status === "Closed") {
			// update the child
			set_value(doctype, docname,
				"prev_project_status", frm.doc.status);

			set_value(doctype, docname,
				"prev_indicator", frm.doc.indicator);

			// update the parent

			$.each({
				"status": "project_status",
				"indicator": "indicator",
			}, (fieldname, value) => {
				frm.set_value(fieldname, row[value]);
			});
		} else if (row.status === "Open") {
			// update the parent
			$.each({
				"status": "prev_project_status",
				"indicator": "prev_indicator",
			}, (fieldname, value) => {
				frm.set_value(fieldname, row[value]);
			});

			// update the child
			set_value(doctype, docname,
				"prev_project_status", undefined);

			set_value(doctype, docname,
				"prev_indicator", undefined);
		}
	},
});
