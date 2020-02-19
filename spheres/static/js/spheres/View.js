class View {
	constructor(uuid, args) {
		this.loop = this.loop.bind(this);
		this.update = this.update.bind(this);
		this.vshow = this.vshow.bind(this);
		this.destroy = this.destroy.bind(this);

		this.uuid = uuid;
		this.args = args;
		this.temp = undefined;
	}

	vshow(ar) {
		console.log("wow");
		return "whatthe"+ar;
	}

	loop() {

	}

	update(data) {
		console.log(data);
		return "updated!";
	}

	destroy() {
		console.log("destroyed");
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