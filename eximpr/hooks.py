# -*- coding: utf-8 -*-
# Copyright (c) 2018, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "eximpr"
app_title = "Eximpr"
app_publisher = "Yefri Tavarez"
app_description = "Export & Import module"
app_icon = "octicon octicon-flame"
app_color = "#346"
app_email = "yefritavarez@gmail.com"
app_license = "General Public License, V3"

fixtures = ["Custom Field", "Property Setter"]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = "/assets/eximpr/css/eximpr.css"
app_include_js = [
	"/assets/eximpr/js/eximpr.js",
	"/assets/eximpr/js/task_multiselect.js",
]

# include js, css files in header of web template
# web_include_css = "/assets/eximpr/css/eximpr.css"
# web_include_js = "/assets/eximpr/js/eximpr.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
	"Project" : [
		"public/js/doctype/project.js",
		"public/js/project_template_prompt.js",
	],
	"Task" : [
		"public/js/doctype/task.js",
	],
	"Purchase Order" : [
		"public/js/doctype/purchase_order.js",
	],
	"Sales Order" : [
		"public/js/doctype/sales_order.js",
	],
}

doctype_list_js = {
	"Project" : "public/js/doctype/project_list.js",
	"Task" : "public/js/doctype/task_list.js",
}

# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "eximpr.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "eximpr.install.before_install"
# after_install = "eximpr.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "eximpr.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Project": {
		"autoname": "eximpr.handlers.project.autoname",
		"after_insert": "eximpr.handlers.project.after_insert",
		"validate": "eximpr.handlers.project.validate",
		"on_trash": "eximpr.handlers.project.on_trash",
	},
	"Task": {
		"validate": "eximpr.handlers.task.validate",
		"before_save": "eximpr.handlers.task.before_save",
	},
	"Project Type": {
		"after_rename": "eximpr.handlers.project_type.after_rename",
	},
	"Purchase Order": {
		"on_submit": "eximpr.handlers.purchase_order.on_submit",
	},
	"Contact": {
		"on_trash": "eximpr.handlers.contact.on_trash",
	}
}

# Scheduled Tasks
# ---------------

scheduler_events = {
	"daily": [
		"eximpr.scheduler.daily"
	],
}

# Testing
# -------

# before_tests = "eximpr.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "eximpr.event.get_events"
# }

boot_session = "eximpr.boot.add_info"
