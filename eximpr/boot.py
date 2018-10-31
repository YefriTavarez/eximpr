# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

def add_info(boot):
	set_default_project_status(boot)

def set_default_project_status(boot):

	default = _get({
		"default": "1",
		"enabled": "1",
	})

	enabled = _get({
		"enabled": "1",
	})

	last_doc = _get()

	defvals = boot["sysdefaults"]

	if not defvals:
		defvals = {}

	defvals["def_project_status"] = default or enabled or last_doc

def _get(filters={}, fields=["name project_status", "indicator"],
	doctype="Project Status", order_by="creation desc",
	limit_page_length=1):

	result = frappe.get_all(
		doctype=doctype,
		filters=filters,
		fields=fields,
		order_by=order_by,
		limit_page_length=limit_page_length
	)

	return result and result[0] or {}
