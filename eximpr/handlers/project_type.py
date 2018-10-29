import frappe

def after_rename(doc, old_name, new_name, merge=False, is_group=None):
	if frappe.flags and \
		frappe.flags.project_type_updated:
		frappe.flags.project_type_updated = False
		return

	frappe.rename_doc("Project Template", 
		old=old_name, 
		new=new_name,
		merge=merge,
		ignore_permissions=True,
		ignore_if_exists=True)
	
	if not frappe.flags:
		frappe.flags = {}

	frappe.flags.project_type_updated = True
