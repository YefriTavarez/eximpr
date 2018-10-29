# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.core.doctype.role import role
from frappe import _

def validate(doc, event):
	"""Add the dependent task list to the table"""
	if not doc.is_new():
		return
	
	if not doc.depends_on_tasks:
		return

	depend_list = doc.depends_on_tasks\
		.split(",")

	doc.depends_on = []
	for depend in depend_list:
		doc.append("depends_on", {
			"subject": depend.strip(),
		})

def before_save(doc, event):
	"""Validate ownership of the task while updating"""

	current_user = frappe.session.user

	if not doc.get("subject"):
		doc.subject = doc.get("title")

	if doc.status == doc.get_db_value("status") \
		or doc.status != "Closed": return

	if current_user == doc.user:
		return

	project_managers = \
		role.get_emails_from_role("Projects Manager")

	if current_user in project_managers:
		return

	msg = _("User cannot update status of task {0}. "
		"Only user {1} can close it.")

	frappe.throw(msg.format(doc.subject, doc.user))
