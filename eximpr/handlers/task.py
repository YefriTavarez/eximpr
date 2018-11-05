# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.core.doctype.role import role
from frappe import _
from frappe import set_value, get_value

def validate(doc, event):
	"""Add the dependent task list to the table"""

	doctype = doc.meta.get_field("project") \
		.options

	if doc.status != doc.get_db_value("status") \
		and doc.status == "Closed":

		for key, value, prev in (
			("status", "project_status", "prev_project_status"),
			("indicator", "indicator", "prev_indicator"),
		):
			value_in_project = get_value(doctype,
				doc.project, key)

			doc.set(prev, value_in_project)
			doc.db_update()

			if doc.get(value):
				set_value(doctype, doc.project,
					key, doc.get(value))

			# inform next users
			send_email_notification(doc)

	elif doc.status != doc.get_db_value("status") \
		and not doc.status == "Closed":

		for key, value in (
			("status", "prev_project_status"),
			("indicator", "prev_indicator")
		):
			if doc.get(value):
				set_value(doctype, doc.project,
					key, doc.get(value))

			doc.set(value, None)
			doc.db_update()

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

def send_email_notification(doc):
	from frappe.utils import get_url_to_form

	content = """
	<p>{0}.</p>
	<p><a href="{1}">{2}</a></p>
	<p><a href="{3}">{4}</a></p>
	"""

	users = frappe.db.sql("""Select
		`tabTask`.user,
		`tabTask`.name
		From `tabTask`
		Inner Join `tabTask Depends On`
		On `tabTask Depends On`.parent = `tabTask`.name
		Where `tabTask Depends On`.task = %s""", doc.name)
	for user, task in users:
		messages = (
			_("The task: {0} that you depended on has been closed" \
				.format(doc.get("subject") or doc.get("title"))),
			get_url_to_form(doc.doctype, doc.name),
			doc.name,
			get_url_to_form(doc.doctype, task),
			_("View your Task")
		)

		frappe.sendmail(user,
			subject=_("Dependent Project Task has been closed"),
			content=content.format(*messages))
