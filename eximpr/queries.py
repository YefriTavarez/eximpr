import frappe

def project_manager_query(doctype, txt, searchfield, start, page_len, filters):
	txt = "%".join(txt.split())

	result = frappe.db.sql("""SELECT DISTINCT
			parent
		FROM
			`tabHas Role` 
		WHERE
			parenttype = "User" 
			AND role = "Project Manager" 
			AND parent != "Administrator"
			AND parent LIKE %s 
		""", "%{}%".format(txt) if txt else "%", 
	as_dict=True)

	return [frappe.get_value("User", user.parent, ["name", "full_name"]) for user in result]

def project_user_query(doctype, txt, searchfield, start, page_len, filters):
	txt = "%".join(txt.split())

	result = frappe.db.sql("""SELECT DISTINCT
			parent
		FROM
			`tabHas Role` 
		WHERE
			parenttype = "User" 
			AND role = "Project User" 
			AND parent != "Administrator"
			AND parent LIKE %s 
		""", "%{}%".format(txt) if txt else "%", 
	as_dict=True)

	return [frappe.get_value("User", user.parent, ["name", "full_name"]) for user in result]
