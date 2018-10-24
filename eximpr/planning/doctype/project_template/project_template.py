# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, cstr, cint
from frappe import _

class ProjectTemplate(Document):
	def validate(self):
		self.create_project_type_if_not_exists()
		self.validate_tasks()

	def create_project(self):
		return get_mapped_doc(self.doctype, self.name, {
			self.doctype: {
				"doctype": "Project",
				"field_map": {
					# to do
				}
			},
			"Project Template Task": {
				"doctype": "Project Task",
				"field_map": {
					# to do
				}
			}
		}, frappe.new_doc("Project"))

	def validate_tasks(self):
		for d in self.tasks:
			depends_on = cstr(d.depends_on)
			depends_on_list = [e.strip() for e in depends_on.split(",")]

			if not d.title in depends_on_list\
				or not cint(d.dependant):
				continue
			
			frappe.throw(_("Task cannot depend on itself!"))

	def create_project_type_if_not_exists(self):
		doc = frappe.new_doc("Project Type")

		project_type = frappe.get_value("Project Type", {
			"project_type": self.name
		}, ["name"])

		if project_type:
			doc = frappe.get_doc("Project Type", project_type)

		doc.update({
			"project_type" : self.name,
		})

		doc.save()

		# update this object too
		self.project_type = doc.project_type

	def on_trash(self):
		frappe.delete_doc_if_exists("Project Type", self.project_type)

