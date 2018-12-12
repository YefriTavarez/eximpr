# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.core.doctype.role import role
from frappe import _
from frappe import set_value, get_value
from frappe.utils import date_diff, nowdate, add_days
from frappe.utils import cint

def validate(doc, event):
	# fecth the value from the database
	doc.db_status = doc.get_db_value("status")

	doc.expected_time_in_days = date_diff(doc.exp_end_date,
		doc.exp_start_date)

	add_dependent_tasks_to_table(doc, event)
	track_times(doc, event)

def add_dependent_tasks_to_table(doc, event):
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

			if not doc.is_new():
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

def track_times(doc, event):

	if doc.is_new():
		return

	# let's compare the two values
	if doc.status != doc.db_status \
		and doc.db_status == "Open":

		doc.act_start_date = nowdate()

	if doc.status != doc.db_status \
		and doc.status == "Closed":

		doc.act_end_date = nowdate()

	if doc.status == "Closed":
		doc.actual_time_in_days = date_diff(doc.act_end_date,
			doc.act_start_date)

	# closing_date
	# review_date
	# act_start_date
	# act_end_date
	update_dependent_start_dates(doc)

def update_dependent_start_dates(doc):
	from frappe.utils import cstr

	if cstr(doc.exp_end_date) > nowdate():
		return

	_start_date = doc.act_end_date

	for taskname, in frappe.db.sql("""
		Select
			name
		From
			tabTask
		Where
			project = %s
		""", doc.project):

		task = frappe.get_doc("Task", taskname)
		if task.status == "Closed":
			continue

		task.exp_start_date = _start_date

		# now let's add the lead time in days
		_start_date = add_days(_start_date,
			cint(task.lead_time))

		# it should be the expected end date
		task.exp_end_date = _start_date

		task.db_update()

	frappe.db.set_value("Project", doc.project,
		"actual_end_date", _start_date)

def before_save(doc, event):
	"""Validate ownership of the task while updating"""

	if not doc.get("db_status"):
		doc.db_status = doc.get_db_value("status")

	current_user = frappe.session.user

	if not doc.get("subject"):
		doc.subject = doc.get("title")

	if doc.status == doc.db_status \
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

	users = frappe.db.sql("""
		Select
			`tabTask`.user,
			`tabTask`.name
		From
			`tabTask`
		Inner Join
			`tabTask Depends On`
			On `tabTask Depends On`.parent = `tabTask`.name
		Where
			`tabTask Depends On`.task = %s""",
	doc.name)

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
