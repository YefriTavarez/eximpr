/*Copyright (c) 2018, Yefri Tavarez and contributors*/
/*For license information, please see license.txt*/

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
			"set_missing_project_status",
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
	set_missing_project_status: frm => {
		const { boot } = frappe,
			{ sysdefaults } = boot;

		let { tasks } = frm.doc,
			{ def_project_status } = sysdefaults;

		tasks.map(task => {
			const {
				status_changer,
				project_status,
				indicator,
			} = task;

			if (
				!project_status
					&& !status_changer
			) {
				$.extend(task,
					def_project_status);

				return /* empty */;
			}

			// use the last one
			def_project_status = {
				indicator,
				project_status,
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
		/*empty*/
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
		const doc = frappe.get_doc(doctype, docname);

		if (doc.idx === 1) {
			const message = __(
				"Task in row #1 cannot depend on any other task!"
			);

			if (doc.dependent) {
				frappe.msgprint(message);
				frappe.model
					.set_value(doctype, docname, "dependent", false);
			}

			return /* empty */;
		}

		frm.script_manager
			.trigger("form_render", doctype, docname);
	},
	status_changer: (frm, doctype, docname) => {
		/*const doc = frappe.get_doc(doctype, docname);*/
		$.map([
			"indicator",
			"project_status",
		], fieldname => {
			frappe.model
				.set_value(doctype, docname, fieldname, undefined);
		});
	},
});
