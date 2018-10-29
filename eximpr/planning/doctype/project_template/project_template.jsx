// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on("Project Template", {
	refresh: frm => {
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
			"validate_dependent_tasks", 
		], frm.trigger.bind(frm));
	},
	add_custom_buttons: frm => {
		if (frm.is_new()) { return ; }
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
		if (!frm.is_new()) {
			frm.page.show_menu();
		}
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
				frappe.msgprint(
					__("Project couldn\'t be created!")
				);
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
		frm.set_query("project_manager", function() {
			return {
				query: "eximpr.queries.user_by_role_query",
				filters: {
					role: "Projects Manager",
				}
			};
		});
	},
	set_proyect_user_query: frm => {
		frm.set_query("user", "tasks", function() {
			return {
				query: "eximpr.queries.user_by_role_query",
				filters: {
					role: "Projects User",
				}
			};
		});
	},
	validate_dependent_tasks: frm => {
		if (
			frm.doc["tasks"] &&
			frm.doc["tasks"][0] &&
			frm.doc["tasks"][0]["dependent"]
		) {
			frappe.validated = false;

			frappe.msgprint({
				indicator: "red",
				title: "Dependency Error",
				message: __(
					"Task #1 cannot depend on any other!"
				),
			});
		}

		$.map(frm.doc.tasks, row => {
			if (row.dependent && !row.depends_on_tasks) {
				frappe.validated = false;

				frappe.msgprint({
					indicator: "red",
					title: "Dependency Error",
					message: __(
						"Task No. {0} marked as dependent, but"
							+ " not dependency was specified!",
						[row.idx]
					),
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
			field = row.get_field("depends_on_tasks"),
			wrapper = field.$wrapper,
			doc = frappe.get_doc(doctype, docname);

		wrapper.empty();

		if (!cint(doc.dependent)) { return ; }

		const control = 
			new TaskMultiSelect({
				tasks,
				fields_dict,
				grid,
				row,
				field,
				wrapper,
				doc,
			});

		control.make_control();
	},
	dependent: (frm, doctype, docname) => {
		frm.script_manager
			.trigger("form_render", doctype, docname);
	},
});
