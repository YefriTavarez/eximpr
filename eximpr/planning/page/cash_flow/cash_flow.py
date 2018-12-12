# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json

from frappe.utils import flt, cstr

def get_payment_pay_schedule(project):
	return frappe.db.sql("""
		(
			Select
				Coalesce(
					`tabPayment Schedule`.`due_date`,
					`tabPurchase Order`.`transaction_date`
				) eventdate,
				"Payment to Supplier" headline,
				Concat_Ws(" ",
					Concat(
						Round(
							`tabPayment Schedule`.`invoice_portion`,
							0),
						"%"),
					"of the total amount of $",
					Format(
						`tabPayment Schedule`.`payment_amount`,
						2),
					"has to be paid to the supplier:",
					Concat(
						`tabPurchase Order`.`supplier_name`,
						".")
				) description,
				"red" indicator
			From
				`tabPayment Schedule`
			Inner Join
				`tabPurchase Order`
				On
					`tabPurchase Order`.`name` = `tabPayment Schedule`.`parent`
			Inner Join
				`tabPurchase Order Item`
				On
					`tabPurchase Order`.`name` = `tabPurchase Order Item`.`parent`
			Where
				`tabPurchase Order Item`.`project` = "{0}"
				And `tabPurchase Order`.`docstatus` = 1
			Group By
				`tabPurchase Order`.`name`,
				eventdate
		) Union (
			Select
				Coalesce(
					`tabPayment Schedule`.`due_date`,
					`tabSales Order`.`transaction_date`
				) eventdate,
				"Payment from Customer" headline,
				Concat_Ws(" ",
					Concat(
						Round(
							`tabPayment Schedule`.`invoice_portion`,
							0),
						"%"),
					"of the total amount of $",
					Format(
						`tabPayment Schedule`.`payment_amount`,
						2),
					"has to be received from the customer:",
					Concat(
						`tabSales Order`.`customer_name`,
						".")
				) description,
				"blue" indicator
			From
				`tabPayment Schedule`
			Inner Join
				`tabSales Order`
				On
					`tabSales Order`.`name` = `tabPayment Schedule`.`parent`
			Inner Join
				`tabSales Order Item`
				On
					`tabSales Order`.`name` = `tabSales Order Item`.`parent`
			Where
				`tabSales Order`.`project` = "{0}"
				And `tabSales Order`.`docstatus` = 1
			Group By
				`tabSales Order`.`name`,
				eventdate
		) Order By eventdate Asc
		""".format(project), as_dict=True)

def get_payment_receive_schedule(project):
	return frappe.db.sql("""
		Select
			Coalesce(
				`tabPayment Schedule`.`due_date`,
				`tabSales Order`.`transaction_date`
			) eventdate,
			"Payment from Customer" headline,
			Concat_Ws(" ",
				Concat(
					Round(
						`tabPayment Schedule`.`invoice_portion`,
						0),
					"%"),
				"of the total amount of $",
				Format(
					`tabPayment Schedule`.`payment_amount`,
					2),
				"has to be received from the customer:",
				Concat(
					`tabSales Order`.`customer_name`,
					".")
			) description,
			"blue" indicator
		From
			`tabPayment Schedule`
		Inner Join
			`tabSales Order`
			On
				`tabSales Order`.`name` = `tabPayment Schedule`.`parent`
		Inner Join
			`tabSales Order Item`
			On
				`tabSales Order`.`name` = `tabSales Order Item`.`parent`
		Where
			`tabSales Order`.`project` = "{0}"
			And `tabSales Order`.`docstatus` = 1
		Group By
			`tabSales Order`.`name`,
			eventdate
		""".format(project), as_dict=True)

def get_payment_scheduled_by_tasks(project):
	return frappe.db.sql("""
		Select
			If(
				`tabTask`.payment_type!="Pay",
				"blue",
				"red"
			) indicator,
			Coalesce(
				`tabTask`.act_start_date,
				`tabTask`.exp_start_date
			) eventdate,
			Concat_Ws(" ",
				"Task ID:",
				`tabTask`.name
			) headline,
			`tabTask`.subject description
		From
			`tabTask`
		Where
			`tabTask`.is_payment_trigger = 1
			And `tabTask`.project = "{0}"
	""".format(project), as_dict=True)

@frappe.whitelist()
def get_data(filters=None):
	filters = load_as_json(filters)

	data = {}

	if not filters.get("project"):
		return data

	project = filters.get("project")

	data.update({
		"title": project,
		"children": [],
	})

	for d in get_payment_pay_schedule(project):
		data.get("children") \
			.append(d)

	# for d in get_payment_receive_schedule(project):
	# 	data.get("children") \
	# 		.append(d)

	# for d in get_payment_scheduled_by_tasks(project):
	# 	data.get("children") \
	# 		.append(d)

	# children = sorted(data.get("children"),
	# 	key=lambda d: d.eventdate, reverse=True)

	# data.update({
	# 	"children": children,
	# })

	return data
	return {
		"title": "PROY-00001",
		"children": [
			{
				"headline": "First Payment",
				"eventdate": "2018-05-15",
				"indicator": "red",
				"description": "First Payment to the Supplier",
			},
			{
				"headline": "Second Payment",
				"indicator": "blue",
				"eventdate": "2018-06-15",
				"description": "Second Payment to the Supplier",
			},
			{
				"headline": "Second Payment",
				"indicator": "blue",
				"eventdate": "2018-06-15",
				"description": "Second Payment to the Supplier",
			},
		]
	}


# data set must return in this format
# {
# 	title: "PROY-00001",
# 	children: [
# 		{
# 			headline: "First Payment",
# 			eventdate: "2018-05-15",
# 			description: "First Payment to the Supplier",
# 		},
# 		{
# 			headline: "Second Payment",
# 			eventdate: "2018-06-15",
# 			description: "Second Payment to the Supplier",
# 		},
# 	]
# }

def load_as_json(args):
	if isinstance(args, basestring):
		args = json.loads(args)

	return frappe._dict(args)
