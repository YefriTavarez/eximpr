// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on("Project Template", {
	refresh: frm => {
		if (frm.is_new()) { return ; }
		$.map([
			"show_menu", 
			"add_custom_buttons", 
		], frm.trigger.bind(frm));
	},
	onload_post_render: frm => {
		$.map([
			"set_queries", 
		], frm.trigger.bind(frm));
	},
	validate: frm => {
		$.map([
			"validate_dependant_tasks", 
		], frm.trigger.bind(frm));
	},
	add_custom_buttons: frm => {
		$.map([
			"add_create_project_button", 
		], frm.trigger.bind(frm));
	},
	add_create_project_button: frm => {
		frm.add_custom_button(__("Create Project"), () => {
			frm.trigger("create_project");
		});
	},
	show_menu: frm => {
		frm.page.show_menu();
	},
	create_project: frm => {
		if (frm.is_new()) { return ; }

		const callback = response => {
			const { message } = response;

			if (message) {
				frappe.run_serially([
					() => frappe.model.sync(message),
					() => frappe.timeout(1.5),
					() => frappe.view_doc(message),
				]);
			} else {
				frappe.msgprint(__("Project couldn\'t be\
					created!"));
			}
		};

		frm.call("create_project")
			.then(callback);
	},
	set_queries: frm => {
		$.map([
			"set_proyect_manager_query", 
			"set_proyect_user_query",
		], frm.trigger.bind(frm));
	},
	set_proyect_manager_query: frm => {
		frm.set_query("project_manager", {
			query: "eximpr.queries.project_manager_query"
		});
	},
	set_proyect_user_query: frm => {
		frm.set_query("user", "tasks", {
			query: "eximpr.queries.project_user_query"
		});
	},
	validate_dependant_tasks: frm => {
		if (
			frm.doc["tasks"] &&
			frm.doc["tasks"][0] &&
			frm.doc["tasks"][0]["dependant"]
		) {
			frappe.validated = false;

			frappe.msgprint({
				indicator: "red",
				title: "Dependency Error",
				message: __(`Task #1 cannot depend on\
					any other task!`),
			});
		}

		$.map(frm.doc.tasks, row => {
			if (row.dependant && !row.depends_on) {
				frappe.validated = false;

				frappe.msgprint({
					indicator: "red",
					title: "Dependency Error",
					message: __(`Task No. {0} marked as
						dependant, but not dependency was
						specified!`, [row.idx]),
				});
			}
		});
	},
	tasks_on_form_rendered: frm => {
		// empty
	},
});

frappe.ui.form.on("Project Template Task", {
	form_render: (frm, doctype, docname) => {
		const { tasks } = frm.doc;

		let fields_dict = frm.fields_dict,
			tablefield = fields_dict.tasks,
			grid = tablefield.grid,
			row = grid.grid_rows_by_docname[docname],
			field = row.get_field("depends_on"),
			wrapper = field.$wrapper,
			doc = frappe.get_doc(doctype, docname);

		wrapper.empty();

		if (!cint(doc.dependant)) { return ; }

		new TaskMultiSelect({
			tasks,
			fields_dict,
			grid,
			row,
			field,
			wrapper,
			doc,
		});
	},
	dependant: (frm, doctype, docname) => {
		frm.script_manager
			.trigger("form_render", doctype, docname);
	},
});
