import frappe

def on_trash(doc, method):
	doctype = "Customer"

	for d in frappe.get_list(doctype, {
		"customer_primary_contact": doc.name,
		}, ["name"]):
		doc = frappe.get_doc(doctype, d.get("name"))
		doc.customer_primary_contact = None
		doc.db_update()

