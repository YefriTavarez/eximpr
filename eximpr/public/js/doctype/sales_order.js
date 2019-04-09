// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sales Order", {
	project: frm => {
		let { doc } = frm;

		$.map(doc.items, childdoc => {
			const { doctype, name } = childdoc,
				{ model } = frappe;

			model.set_value(doctype, name,
				"project", doc.project);
		});
	}
});
