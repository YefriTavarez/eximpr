/*Copyright (c) 2018, Yefri Tavarez and contributors*/
/*For license information, please see license.txt*/

frappe.listview_settings["Project Status"] = {
	add_fields: ["status", "indicator"],
	get_indicator: doc => {
		const { status, indicator } = doc;
		return [__(status), indicator];
	},
};
