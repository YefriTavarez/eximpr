import frappe

def user_by_role_query(doctype, txt, searchfield, start, page_len, filters):
	_txt = "%{txt}%".format(txt=txt) \
		if txt else "%"

	role = ""
	if filters.get("role"):
		role = filters.get("role")

	return frappe.db.sql("""SELECT DISTINCT
			`tabUser`.name,
			`tabUser`.full_name
		FROM
			`tabHas Role`
		INNER JOIN
			`tabUser`
			ON `tabHas Role`.parent = `tabUser`.name
		WHERE
			`tabHas Role`.parenttype = "User"
			AND `tabHas Role`.role = %s
			AND `tabHas Role`.parent != "Administrator"
			AND `tabHas Role`.parent LIKE %s
		""", (role, _txt),
	debug=False)
