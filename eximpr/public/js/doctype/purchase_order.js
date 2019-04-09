// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on("Purchase Order", {
	refresh: frm => {
		$.map([
			"set_queries",
		], frm.trigger.bind(frm));
	},
	validate: frm => {
		const msg = "Project is mandatory if Sales Order is set. Row {0}";
		$.map(frm.doc.items, d => {
			if (d.sales_order && !d.project) {
				frappe.msgprint({
					"message": __(msg, [d.idx]),
					"indicator": "red",
				});

				frappe.validated = false;
			}
		});
	},
	set_queries: frm => {
		frm.set_query("project", "items", function(frm, cdt, cdn) {
			const doc = frappe.get_doc(cdt, cdn);
			return {
				"filters": {
					"sales_order": doc.sales_order,
				}
			};
		})
	},
	project: frm => {
		let { doc } = frm;

		$.map(doc.items, childdoc => {
			const { doctype, name } = childdoc,
				{ model } = frappe;

			model.set_value(doctype, name,
				"project", doc.project);
		});
	},
});
