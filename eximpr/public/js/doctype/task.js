// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on("Task", {
	refresh: frm => {
		$.map([
			"disable_fields",
			"toggle_enable_fields_based_on_new",
		], frm.trigger.bind(frm));
	},
	disable_fields: frm => {
		$.map([
			"is_group",
			"parent_task",
			"is_milestone",
		], fieldname => frm.toggle_enable(fieldname, false));
	},
	toggle_enable_fields_based_on_new: frm => {
		$.map([
			"subject",
			"project",
			"user",
			"priority",
			"exp_start_date",
			"expected_time",
			"task_weight",
			"exp_end_date",
			"progress",
			"description",
			"depends_on",
			"actual",
			"act_start_date",
			"actual_time",
			"act_end_date",
			"total_costing_amount",
			"total_expense_claim",
			"total_billing_amount",
			"review_date",
			"closing_date",
			"company",
		], fieldname => frm.toggle_enable(fieldname, frm.is_new()));
	},
});
