(function() {
	const _ = $;

	// provide with namespace
	frappe.provide("cur_page.controls");
	frappe.provide("cur_page.vtimeline");

	frappe.pages['cash_flow'].on_page_load = function(wrapper) {
		var me = this;
		const page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Cash Flow',
			single_column: true
		}),
			main_section = $(wrapper)
				.find(".layout-main-section");

		// fix the top border
		main_section
			.css({
				"border": "1px solid #d1d8dd",
			});


	me.page = wrapper.page;
	// me.page.set_title(__("Activity"));

	// frappe.model.with_doctype("Communication", function() {
	// 	me.page.list = new frappe.ui.BaseList({
	// 		hide_refresh: true,
	// 		page: me.page,
	// 		method: 'frappe.desk.page.activity.activity.get_feed',
	// 		parent: $("<div></div>").appendTo(me.page.main),
	// 		render_view: function (values) {
	// 			var me = this;
	// 			wrapper = me.page.main.find(".result-list").get(0)
	// 			values.map(function (value) {
	// 				var row = $('<div class="list-row">')
	// 					.data("data", value)
	// 					.appendTo($(wrapper)).get(0);
	// 				new frappe.activity.Feed(row, value);
	// 			});
	// 		},
	// 		show_filters: true,
	// 		doctype: "Communication",
	// 		get_args: function() {
	// 			if (frappe.route_options && frappe.route_options.show_likes) {
	// 				delete frappe.route_options.show_likes;
	// 				return {
	// 					show_likes: true
	// 				}
	// 			} else {
	// 				return {}
	// 			}
	// 		}
	// 	});

	// 	me.page.list.run();

	// });
		me.page.set_primary_action(__("Print"), function() {
			window.print();
		}, "octicon octicon-sync");

		const element = _(main_section)
				.find("div.page-form.row"),
			parent = `
				<div
					style="margin: 0px 12px;"
				></div>
			`;

		element.removeClass("hide");

		let control = frappe.ui.form.make_control({
			df: {
				fieldtype: "Link",
				fieldname: "project",
				label: __("Project"),
				options: "Project",
				get_query: e => {
					return {
						filters: {
							percent_complete: ["<", "100"]
						}
					}
				}
			},
			parent: _(parent).appendTo(element),
			render_input: true,
		});

		control.df
			.onchange = event => {
				const { value } = control.input;

				fetch_data(
					wrapper,
					main_section,
					value
				);
			};

		cur_page.controls["project"] = control;
	};

	const fetch_data = function(wrapper, main_section, project) {
		const method =
			new Array(
				"eximpr",
				"planning",
				"page",
				"cash_flow",
				"cash_flow",
				"get_data",
			)
		.join("."),
		args = {
			filters: {
				project,
			}
		},
		callback = response => {
			let { message } = response;

			if (!message) {
				message = {};
			}

			const {
				title,
			} = message;

			if (!title) {
				message.title = __("No data");
				message.children = [];
			}

			_("div.container.mt-5.mb-5")
				.remove();

			const vtimeline =
				new VTimeline(wrapper, message);

			_(vtimeline.html)
				.insertAfter(
					_(main_section)
						.find(".page-form.row")
				);

			// allow to be accessed globally
			cur_page.vtimeline = vtimeline;
		};

		frappe.call({ method, args, callback });
	};


	class VTimeline {
		constructor(wrapper, data) {
			this.init(wrapper, data);
		}

		init(wrapper, data) {
			const { children } = data;

			this.template = this.get_template(data);
			this.html = _(this.template);

			this.children = children.map(dataset => {
				const component =
					new VTimelineComponent(this.html, dataset);
				return component;
			});

			this.html
				.appendTo(wrapper);

			this.html
				.click(
					this.handle_click
						.bind(this)
				);
		}

		handle_click(event) {
			// todo
		}

		get_template({ children, title }) {
			return (`
				<div class="container mt-5 mb-5">
					<div class="row">
						<div class="col-md-6 offset-md-3">
							<h4>${title}</h4>
							<ul class="timeline"></ul>
						</div>
					</div>
				</div>
			`);
		}
	}

	class VTimelineComponent {
		constructor(wrapper, opts) {
			this.init(wrapper, opts);
		}

		init(wrapper, opts) {
			this.template = this.get_template(opts);

			this.html = _(this.template);

			this.html
				.appendTo(wrapper.find(".timeline"));

			this.html
				.click(
					this.handle_click
						.bind(this)
				);
		}

		handle_click(event) {
			// todo
		}

		get_template({ headline, eventdate, description, indicator="blue" }) {
			return (`
				<li class="${indicator}">
					<strong target="_blank" href="#">${headline}</strong>
					<strong href="#" class="float-right">${eventdate}</strong>
					<p>${description}</p>
				</li>
			`);
		}
	}
})();
