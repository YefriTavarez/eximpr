// Copyright (c) 2018, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.provide("eximpr.ui.form");
class ProjectTemplateTaskDependsOn {
	constructor(frm, cdt, cdn, parent) {
		this.frm = frm;
		this.cdt = cdt;
		this.cdn = cdn;
		this.parent = parent;

		// default values
		this.vals = [];
		this.ui = {};
		this.get_rows_template();
		// this.rowcount = 0;
	}

	component(element, name, list = false) {
		const _ = $, 
			_element = _(element);

		if (list) {
			if (!this.ui[name]) {
				this.ui[name] = [];
			}
			return this.ui[name].concat([_element]);
		}
		return (this.ui[name] = _element);
	}

	get_add_new_row_btn() {
		const name = "add_row_btn";

		if (this.ui[name]) {
			return this.ui[name];
		}

		return this.component(
			`<button 
				class="btn btn-xs btn-default grid-add-row"
				type="reset">${__("Add Row")}
			</button>`,
			name)
		.click(this.handle_add_new_row.bind(this));
	}

	get_delete_row_btn() {
		const name = "delete_row_btn";

		if (this.ui[name]) {
			return this.ui[name];
		}

		return this.component(
			`<button
				class="btn btn-xs btn-danger grid-remove-rows"
				style="display: none;"
				type="reset">${__("Delete")}
			</button>`,
			name)
		.click(this.handle_delete_row.bind(this));
	}

	add_new_blank_row(parent) {
		this.add_new_row({ parent });
	}

	add_new_row(opts) {
		const { parent, title, idx } = opts;

		this.vals.push(opts);
		this.refresh();
	}

	get_blank_row_template(title, idx) {
		if (!cint(idx)) {
			idx = this.vals.length + 1;
		}

		if (!title) {
			title = "";
		}

		return this.component(
			`<div class="grid-row">
				<div class="data-row row">
					<div class="row-index sortable-handle col col-xs-1">
						<!-- checkbox -->
						<span data-index="${idx}">${idx}</span>
					</div>
					<div class="col grid-static-col col-xs-10  grid-overflow-no-ellipsis" data-fieldname="title">
						<div class="static-area ellipsis">${title}</div>
					</div>
				</div>
			</div>`, 
		"lastest_added_row")
		.click(this.handle_row_focus.bind(this));
	}

	get_checkbox_input(title, idx) {
		if (!title) { title = ""; }

		return this.component(
			`<input 
				type="checkbox"
				data-index="${idx}"
				class="grid-row-check pull-left"
				data-title="${title}">`,
			"checkboxs")
		.change(this.handle_checkbox_change.bind(this));
	}

	get_row_input(value) {
		return this.component(`
			<input 
				type="text" 
				class="input-with-feedback form-control bold input-sm"
				data-fieldtype="Link" 
				data-fieldname="title" 
				placeholder="Title" data-doctype="Project Template Task"
				autocomplete="off"
				value="${value}"
				aria-autocomplete="list"
				data-col-idx="0">`, 
			"inputs")
		.change(this.handle_row_input_change.bind(this));
	}

	get_inputs_wrappers(value) {
		return this.component(`
			<div class="field-area" style="display: block;">
				<div class="form-group frappe-control input-max-width" data-fieldtype="Link" data-fieldname="title" title="title">
					<div class="link-field ui-front" style="position: relative; line-height: 1;">			
					<div class="awesomplete">
						<ul style="display: none;"></ul>			
					</div>
					</div>
				</div>
			</div>`, "inputs_wrappers")
		.find(".awesomplete")
		.append(this.get_row_input(value))
		.append(this.get_tasks_list_component())
	}

	handle_row_input_change(event) {
		const { target } = event;

		// this.update_model(target.value);
		this.frm.script_manager
			.trigger("tasks_title", this.cdt, this.cdn);
	}

	get_tasks_list_component() {
		const tasks = this.get_task_titles();
		let tasksHTML = "";

		$.map(tasks, task => {
			const template = `
				<li>
					<a>
						<p>
							${task}
						</p>
					</a>
				<li>`;

			tasksHTML += template;
		});

		return this.component(tasksHTML, "tasks");
	}

	handle_row_focus(event) {
		const { target } = event,
			fieldarea = $(target)
				.closest("div[data-fieldname=title]"),
			value = fieldarea.closest("input").val();

		if (fieldarea.find("ul > li").length) {
			return ;
		}

		this.get_inputs_wrappers(value)
			.appendTo(fieldarea);

		/*frappe.ui.form.make_control({
			df: {
				fieldname: "title",
				fieldtype: "Link",
				options: "Task Title",
				label: __("Task Title"),
			},
			parent: fieldarea,
			render_input: true,
			frm: this.frm,
			get_query: this.get_task_title_query.bind(this),
		});*/
	}

	get_task_title_query(event) {
		const { tasks } = this.frm.doc,
			whitelist = [];

		$.map(tasks, whitelist.push.bind(whitelist));

		return {
			filters: {
				name: ["in", whitelist.join(",")]
			}
		}
	}

	get_task_titles() {
		return this.frm.doc.tasks
			.map(task => task.title);
	}

	handle_checkbox_change(event) {
		const { target } = event,
			all_checked = this.get_all_checked(),
			index = $(target).attr("data-index");

		this.vals[cint(index) -1].to_delete = 
			!!target.checked;

		if (all_checked && all_checked.length) {
			this.ui.delete_row_btn
				.toggle(true);
		} else {
			this.ui.delete_row_btn
				.toggle(false);
		}
	}

	remove_from_values(index) {
		const idx = this.vals
			.map(row => row.idx)
			.indexOf(index);

		this.vals.splice(cint(index) - 1, 1);
		this.refresh();
	}

	empty_rows() {
		if (this.ui.rows) {
			this.ui.rows.empty();
		}
	}

	refresh() {
		this.empty_rows();
		this.rowcount = 1;
		this.vals
			.map((opts, idx) => {
				if (!opts) { return ; }

				const { title } = opts;

				this.vals[idx].idx = this.rowcount ++;

				let row = this.get_blank_row_template(title, this.vals[idx].idx)
					.appendTo(this.ui.rows);

				row.find(".row-index.sortable-handle.col.col-xs-1")
					.prepend(this.get_checkbox_input(title, this.vals[idx].idx));
			});
		this.ui.delete_row_btn.toggle(false);
	}

	handle_add_new_row(event) {
		this.add_new_blank_row(this.ui.rows);

		// trigger standard events
		this.frm.script_manager
			.trigger("on_add_new_row", this.cdt, this.cdn);
	}

	handle_delete_row(event) {
		$.map(
			this.get_all_checked(), 
			this.remove_from_values.bind(this)
		);

		// trigger standard events
		this.frm.script_manager
			.trigger("on_delete_row", this.cdt, this.cdn);
	}

	get_all_checked() {
		let indexes = [];
		this.ui.rows.find("input[type=checkbox]")
			.filter((idx, row) => {
				const d = $(row),
					checked = d.prop("checked");
				return checked;
			})
			.map((idx, row) => {
				const d = $(row),
					index = d.attr("data-index");

				indexes.push(index);
			});
		return indexes;
	}

	render(opts) {
		// a list of tasks
		if (!this.ui.wrapper) {
			this.make_wrapper();
		}

		this.ui.wrapper.find(".grid-body")
			.prepend(this.get_rows_template())
			.prepend(this.get_not_data_template());

		this.ui.wrapper.find(".col-sm-6.grid-buttons")
			.append(this.get_delete_row_btn())
			.append(this.get_add_new_row_btn());
		
		this.empty_vals();
		this.set_vals(opts);

		this.refresh();
	}

	empty_vals() {
		if (this.vals) {
			this.vals.length = 0;
		}
	}
		
	set_vals(opts) {
		const { vals } = opts;

		$.map(vals, opts => {
			if ($.isPlainObject(opts)) {
				this.vals.push(opts);
			}
		});
		this.refresh_rows_toggle();
	}

	get_not_data_template() {
		const name = "nodata";

		if (this.ui[name]) {
			return this.ui[name];
		}

		return this.component(
			`<div class="grid-empty text-center">
				${__("No Data")}
			</div>`,
		name);
	}

	refresh_rows_toggle() {
		const { vals } = this;

		this.ui.rows.toggle(!!vals.length);
		this.ui.nodata.toggle(!!!vals.length);
	}

	make_wrapper() {
		const name = "wrapper";

		if (this.ui[name]) {
			return this.ui[name];
		}

		return this.component(
			`<div style="display: flex;" class="section-body">
				<div class="form-column col-sm-12">
					<div class="frappe-control" data-fieldname="dependency_table">
						<div class="form-grid">
							<div class="grid-heading-row">
								<div class="grid-row">
									<div class="data-row row">
										<div class="row-index sortable-handle col col-xs-1">
											<!-- <input type="checkbox" style="visibility: hidden;" class="grid-row-check pull-left"> -->
											<span>&nbsp;</span>
										</div>
										<div class="col grid-static-col col-xs-10  grid-overflow-no-ellipsis" data-fieldname="title">
											<div class="static-area ellipsis">${__("Title")}</div>
										</div>
									</div>
								</div>
							</div>
							<div class="grid-body">
								<!-- data -->
								<div class="small form-clickable-section grid-footer">
									<div class="row">
										<div class="col-sm-6 grid-buttons">
											<!-- buttons -->
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`,
			name)
		.appendTo(this.parent);
	}

	get_rows_template() {
		if (this.ui.rows) {
			return this.ui.rows;
		}

		return this.component(
			`<div class="rows"></div>`,
		"rows");
	}
};

eximpr.ui.form.ProjectTemplateTaskDependsOn = ProjectTemplateTaskDependsOn;
