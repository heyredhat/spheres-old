class View {
	constructor(uuid, args) {
		this.loop = this.loop.bind(this);
		this.update = this.update.bind(this);
		this.destroy = this.destroy.bind(this);
		this.call = this.call.bind(this);
		this.vshow = this.vshow.bind(this);

		this.uuid = uuid;
		this.args = args;
		this.data = undefined;


		this.div = document.createElement("div");
		this.div.id = this.uuid
		this.div.style.position = "absolute";
		this.div.style.left = "100px";
		this.div.style.right = "100px";
		this.div.style.height = "50px";
		this.div.style.width = "100px";
		this.div.style.background = "white";
		this.div.class = "ui-widget-content";
		var stuff = document.getElementById("stuff");
		stuff.appendChild(this.div);
		this.live = true;
		//console.log("hi");
		$("#"+this.uuid).draggable();

	}

	vshow(ar) {
		return "whatthe"+ar;
	}

	loop() {

	}

	update(data) {
		//console.log(data);
		this.data = data;
		if (this.live == false) {
			var stuff = document.getElementById("stuff");
			stuff.appendChild(this.div);
			this.live = true;
		}
		this.div.innerHTML = data;
		return "updated!";
	}

	destroy() {
		this.div.parentNode.removeChild(this.div);
		this.live = false;
		return "destroyed!";
	}

	call(func) {
		return function (args) {
			return new Promise( function (resolve, reject) {
				if (args == undefined) {
					args = [];
				} else if (! (args instanceof Array)) {
					args = [args];
				}
				var data = undefined;
				workspace.sockets.emit("call", 
									   {"uuid": this.uuid, 
									    "func": func, 
									    "args": args},
									   function (data) {
									   		resolve(data);
									   });
			}.bind(this));
		}.bind(this);
	}
}