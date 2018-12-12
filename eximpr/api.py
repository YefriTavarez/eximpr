# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json

from frappe.model.mapper import get_mapped_doc
from frappe.utils import add_days, nowdate, cint

def create_project_from_template(template_name, project=None):
	"""Create a new project or update an existing one from
	a project template.
	:param template_name: Template to be used for the creation
	:param project: (Optional) The project that is being
	updated. If not project is passed then it will return
	a new project created by `frappe.new_doc`
	"""

	if not project:
		project = frappe.new_doc("Project")

	# clear tables so that new tasks and users
	# are not appended, but overriden instead
	for tablename in ("tasks", "users"):
		project.set(tablename, list())

	def post_process(source, target):
		if not target.get("status"):
			target.status = "Open"

		target.indicator = "red"

		for task in source.tasks:
			users_added = [d.user for d in target.users]

			if task.user in users_added:
				continue

			target.append("users", {
				"user": task.user
			})

		return update_dates_for_project(target)


	template_doctype = "Project Template"

	return get_mapped_doc(template_doctype, template_name, {
		template_doctype: {
			"doctype": "Project",
			"field_map": {}
		},
		"Project Template Task": {
			"doctype": "Project Task",
		},
	}, project, post_process)

@frappe.whitelist()
def update_dates_for_project(doc, start_date=None):
	if isinstance(doc, basestring):
		doc = json.loads(doc)

	doc = frappe.get_doc(doc)

	if start_date:
		doc.expected_start_date = start_date

	if not doc.expected_start_date:
		doc.expected_start_date	= nowdate()

	_start_date = doc.expected_start_date

	for task in doc.get("tasks"):
		task.start_date = _start_date

		# now let's add the lead time in days
		_start_date = add_days(_start_date,
			cint(task.lead_time))

		# it should be the expected end date
		task.end_date = _start_date

	doc.expected_end_date = _start_date

	return doc
