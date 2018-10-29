# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json

def get_doc_from_string(docstring):
	"""Returns a Frappe document from a JSON string
	usually these come from the ajax UI requests.
	:param docstring: The document represents a JSON string
	"""

	if isinstance(docstring, basestring):
		docstring = json.loads(docstring)

	return frappe.get_doc(docstring)

def validate_email(email):
	"""This is an easier to remember alias of the 
	`validate_email_add` function in `frappe.utils`
	"""
	from frappe.utils import validate_email_add
	return validate_email_add(email.strip(), True)

