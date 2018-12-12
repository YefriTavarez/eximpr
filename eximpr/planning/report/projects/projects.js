// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

(function() {

	const { get_default } = frappe.defaults;

	frappe.query_reports["Projects"] = {
		"filters": [
			{
				"fieldtype": "Link",
				"fieldname": "company",
				"label": "Company",
				"options": "Company",
				"reqd": 1,
				"default": get_default("company")
			},
			{
				"fieldtype": "Date",
				"fieldname": "start_date",
				"label": "From Date",
				"reqd": 0,
			},
			{
				"fieldtype": "Date",
				"fieldname": "end_date",
				"label": "To Date",
				"reqd": 0,
			},
			{
				"fieldtype": "Link",
				"fieldname": "name",
				"label": "Project",
				"options": "Project",
				"reqd": 0,
			},
			{
				"fieldtype": "Link",
				"fieldname": "status",
				"label": "Project Status",
				"options": "Project Status",
				"reqd": 0,
			},
		]
	}
})();
