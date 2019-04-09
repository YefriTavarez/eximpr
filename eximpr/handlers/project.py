# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json

from eximpr.utils import get_doc_from_string
from eximpr.api import create_project_from_template
from frappe.model.naming import make_autoname
from frappe import _
from frappe.utils import cint
from eximpr.handlers.task import before_save as before_save_task

def autoname(doc, event):
	title = doc.sales_order \
		or doc.customer \
		or doc.project_type

	if doc.project_name \
		.startswith(doc.sales_order):
		doc.title = doc.project_name
	else:
		doc.title = "{title}: {project_name}".format(title=title,
			project_name=doc.project_name)

	naming_series = doc.get("naming_series") \
		or "PROJ-.#####"

	name = doc.get("sales_order")

	if not doc.get("name_by_sales_order") \
		or not name:
		name = make_autoname(naming_series,
			doc.doctype, doc.name)

	# finally let's set the name ID
	doc.name = name

def validate(doc, event):
	found_list = []
	for task in doc.tasks:
		_task = frappe.get_doc("Task", task.task_id)
		before_save_task(_task, event)

		if not task.title in found_list:
			found_list.append(task.title)
			continue

		msg = _("Task {0} appears multiple times in Rows {1}")

		idx = found_list.index(task.title) + 1
		frappe.throw(
			msg.format(frappe.bold(task.title),
				(idx, task.idx))
		)


def after_insert(doc, event):
	def sync_dependent_tasks_ids(project):
		frappe.db.sql("""UPDATE
				`tabProject` project
			INNER JOIN
				`tabTask` task
				ON project.name = task.project
			INNER JOIN
				`tabTask Depends On` depends_on
				ON task.name = depends_on.parent
			INNER JOIN
				`tabTask` dependent
				ON dependent.subject = depends_on.subject
				AND dependent.project = project.name
			SET
				depends_on.task = dependent.name
			WHERE
				project.name = %s""",
		project)

	sync_dependent_tasks_ids(doc.name)

def on_trash(doc, event):
	def delete_linked_tasks():
		for taskname, in frappe.get_all("Task", {
			"project": doc.name,
		}, as_list=True):
			frappe.delete_doc("Task",
				taskname, force=True)

	if doc.sales_order:
		frappe.db.set_value("Sales Order",
			doc.sales_order, "project", "")

	delete_linked_tasks()

@frappe.whitelist()
def fetch_values_from_template(doc, project_template):
	project = get_doc_from_string(doc)

	return create_project_from_template(project_template,
		project)
