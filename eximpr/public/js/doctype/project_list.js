frappe.listview_settings['Project'] = {
	add_fields: [
		"status",
		"priority",
		"is_active",
		"percent_complete",
		"expected_end_date",
		"project_name",
		"indicator"
	],
	filters:[["status","=", "Open"]],
	get_indicator: function(doc) {
		return [
			`${doc.status} ${cint(doc.percent_complete)}%`,
			doc.indicator,
			`status,=,${doc.status}`
		];
		// return [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
	}
};
