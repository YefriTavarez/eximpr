# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.utils import flt, cstr, cint
from frappe import _

def execute(filters):
	return (
		get_columns(filters),
		get_data(filters)
	)

def get_data(filters):
	return frappe.db.sql("""
		Select
			`tabProject`.name,
			`tabProject`.cubic_meters,
			`tabProject`.status,
			(Select
				Group_Concat(
					Distinct
						`tabPurchase Order Item`.parent
					Order By
						`tabPurchase Order Item`.parent
				)
				From
					`tabPurchase Order Item`
				Where
					`tabPurchase Order Item`.docstatus = 1
					And `tabPurchase Order Item`.project = `tabProject`.name
			) As purchase_orders,
			`tabProject`.loading_port,
			`tabProject`.destination_port,
			`tabProject`.expected_start_date,
			`tabProject`.expected_end_date,
			Coalesce(`tabProject`.actual_end_date,
				`tabProject`.expected_end_date)
		From
			tabProject
		Where
			{conditions}
		""".format(conditions=get_conditions(filters)),
	filters, as_list=True)

def get_columns(filters):
	columns = []

	columns += [{
		"fieldname": "project",
		"fieldtype": "Link",
		"width": 120,
		"label": "Project",
		"options": "Project",
	}]

	columns += [{
		"fieldname": "project_cbm",
		"fieldtype": "Data",
		"width": 120,
		"label": "Project CBM",
	}]

	columns += [{
		"fieldname": "status",
		"fieldtype": "Data",
		"width": 120,
		"label": "Status",
	}]

	columns += [{
		"fieldname": "purchase_orders",
		"fieldtype": "MultiSelect",
		"width": 200,
		"label": "Purchase Orders",
	}]

	columns += [{
		"fieldname": "departure_port",
		"fieldtype": "Data",
		"width": 120,
		"label": "Departure Port",
	}]

	columns += [{
		"fieldname": "landing_port",
		"fieldtype": "Data",
		"width": 120,
		"label": "Landing Port",
	}]

	columns += [{
		"fieldname": "start_date",
		"fieldtype": "Date",
		"width": 120,
		"label": "Start Date",
	}]

	columns += [{
		"fieldname": "expected_end_date",
		"fieldtype": "Date",
		"width": 120,
		"label": "Expected End Date",
	}]

	columns += [{
		"fieldname": "actual_end_date",
		"fieldtype": "Date",
		"width": 120,
		"label": "Actual End Date",
	}]

	return columns

def get_conditions(filters):
	conditions = []

	for field in (
		"company",
		"name",
		"status",
	):
		if filters.get(field):
			conditions += ["`tabProject`.`{0}` = %({0})s".format(field,
				filters.get(field))]

	if filters.get("start_date"):
		conditions += ["`tabProject`.expected_start_date >= %(start_date)s"]

	if filters.get("end_date"):
		conditions += ["`tabProject`.expected_start_date <= %(end_date)s"]

	return " And ".join(conditions)
