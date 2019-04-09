# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import get_url_to_form
from frappe.utils import nowdate, cstr, cint, flt

def daily():

	content = """
	<h3>{0} <a href="{1}">{2}</a>:</h3>
	<li>{3}</li>
	<p><a href="{4}">{5}</a></p>
	"""

	due_tasks = frappe.get_list("Task", {
		"exp_start_date": ["<=", nowdate()],
		"status": ["not in", ["Closed"]],
	}, ["project", "name", "subject"])

	project_map = {}
	for task in due_tasks:
		doc_task = frappe.get_doc("Task",
			task.name)
		frappe.db.set(doc_task,
			"status","Overdue")

		if not (project_map and task.project in project_map):
			project_map[task.project] = []

		project_map[task.project] += [task.subject]

	for project in project_map.iterkeys():
		due_tasks = "</li><li>".join(project_map[project])

		doc = frappe.get_doc("Project", project)

		if doc.mute_notifications:
			continue

		messages = (
			_("You have Overdue Tasks for project"),
			get_url_to_form(doc.doctype, doc.name),
			doc.title,
			due_tasks,
			get_url_to_form(doc.doctype, doc.name),
			_("View your Task"),

		)

		frappe.sendmail(doc.project_manager,
			subject=_("Due Tasks Daily Report"),
			content=content.format(*messages))

		frappe.db.commit()
