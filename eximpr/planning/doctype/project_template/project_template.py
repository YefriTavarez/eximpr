# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, cstr, cint
from frappe import _

from eximpr.api import create_project_from_template

class ProjectTemplate(Document):
	def after_rename(self, old_name, new_name, merge=False, group_fname=None):
		if frappe.flags and \
			frappe.flags.template_updated:
			frappe.flags.template_updated = False
			return

		frappe.rename_doc("Project Type",
			old=old_name,
			new=new_name,
			merge=merge,
			ignore_permissions=True,
			ignore_if_exists=True)

		if not frappe.flags:
			frappe.flags = {}

		frappe.flags.template_updated = True

	def validate(self):
		self.validate_tasks()
		self.validate_dependent_tasks()
		self.create_project_type_if_not_exists()

	def create_project(self):
		return create_project_from_template(
			self.name
		)

	def validate_tasks(self):
		for d in self.tasks:
			depends_on_string = cstr(d.depends_on_tasks)
			depends_on_list = depends_on_string.split(",")

			depends_on_list_stripped = [e.strip()
				for e in depends_on_list]

			if not d.title in depends_on_list_stripped\
				or not cint(d.dependent):
				continue

			frappe.throw(_("Task cannot depend on itself!"))

	def validate_dependent_tasks(self):
		available_task_titles = [d.title
			for d in self.tasks]

		for d in self.tasks:
			depends_on_string = cstr(d.depends_on_tasks)
			depends_on_list = depends_on_string.split(",")

			depends_on_list_stripped = [e.strip()
				for e in depends_on_list]

			msg = _("Not found dependent Task: {0} in row {1}")
			for dependent in depends_on_list_stripped:
				if not dependent in available_task_titles\
					and dependent:
					frappe.throw(
						msg.format(frappe.bold(dependent),
							d.idx)
					)

	def create_project_type_if_not_exists(self):
		doc = frappe.new_doc("Project Type")

		if frappe.db.exists("Project Type", self.name):
			doc = frappe.get_doc("Project Type",
				self.project_type)

		doc.update({
			"project_type" : self.name,
		})

		doc.save(ignore_permissions=True)

		# update this object too
		self.project_type = doc.project_type

	def on_trash(self):
		frappe.delete_doc_if_exists("Project Type",
			self.project_type, force=True)

