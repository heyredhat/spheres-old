class View {
	constructor(uuid, options) {
		this.setup_div = this.setup_div.bind(this);
		this.refresh_from = this.refresh_from.bind(this);
		this.loop = this.loop.bind(this);
		this.destroy = this.destroy.bind(this);
		this.call = this.call.bind(this);

		/****************************************************/

		this.uuid = uuid;
		this.options = options != undefined ? options :
						{"suppress_default_view": false}
		this.data = undefined;
		this.visible = false;

		/****************************************************/

		if (!(this.options["suppress_default_view"])) {
			this.setup_div();
		}
	}

	setup_div() {
		this.div = document.createElement("div");
		this.div.id = this.uuid;
		this.div.className = "view ui-widget-content";
		document.body.appendChild(this.div);
		$("#"+this.uuid).draggable();
		this.visible = true;
	}

	refresh_from(data) {
		this.data = data;
		if (!this.options["suppress_default_view"]) {
			if (!this.visible) {
				document.body.appendChild(this.div);
				this.visible = true;
			}
			this.div.innerHTML = data;
		}
		return "refreshed!"
	}

	loop() {

	}

	destroy() {
		if (!this.options["suppress_default_view"]) {
			this.div.parentNode.removeChild(this.div);
		}
		this.visible = false;
		return "destroyed!";
	}

	call(func) {
		return function (args) {
			return new Promise( function (resolve, reject) {
				if (args == undefined) {
					args = [];
				} else if (!(args instanceof Array)) {
					args = [args];
				}
				workspace.sockets.emit(
				 	"call", 
					   {"uuid": this.uuid, 
					    "func": func, 
					    "args": args},
					   function (returned) {
					   		resolve(returned);
					   });
			}.bind(this));
		}.bind(this);
	}
}