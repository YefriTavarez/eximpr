// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

$.extend(frappe, {
	view_doc: function(opts) {
		const { 
			doctype, 
			docname, 
			name 
		} = opts,
		view_type = "Form";

		frappe.set_route(view_type, doctype, docname || name);
	},
});
