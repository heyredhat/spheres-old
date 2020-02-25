class Sphere extends View {
	constructor(uuid, options) {
		options = options != undefined ? options :
						{"suppress_default_view": true}
		super(uuid, options);
		this.redraw = this.redraw.bind(this);
		this.global_local = this.global_local.bind(this);
		this.local_global = this.local_global.bind(this);
		this.setup_drag_controls = this.setup_drag_controls.bind(this);

		/****************************************************/

		this.stars = [];
		this.phase = [1,0];
		this.vstars = [];

		this.options["radius"] = this.options["radius"] == undefined ? 1 : undefined;
		this.options["position"] = this.options["position"] == undefined ? new THREE.Vector3(0,0,0) : undefined;
		this.options["sphere_color"] = this.options["sphere_color"] == undefined ? new THREE.Color("rgb(0, 7, 209)") : undefined;
		this.options["star_color"] = this.options["star_color"] == undefined ? new THREE.Color("rgb(255, 31, 135)") : undefined;
		this.options["drag_rate"] = this.options["star_color"] == undefined ? new 1/8: undefined;

		/****************************************************/

		this.setup();
	}

	/****************************************************/

	setup() {
		super.setup();
		this.vsphere = new THREE.Mesh(
					   		new THREE.SphereGeometry(this.options["radius"], 64, 64), 
					  		new THREE.MeshToonMaterial({
							    bumpScale: 1,
							    color: this.options["sphere_color"],
							    reflectivity: 0.4,
							    shininess: 2,
								envMap: workspace.cube_camera.renderTarget.texture,
								transparent: true,
								opacity: 0.93}));
		workspace.outline_pass2.selectedObjects = 
				workspace.outline_pass2.selectedObjects.concat([this.vsphere]);
	 	this.vwire_sphere = new THREE.Mesh(
							 new THREE.SphereGeometry(this.options["radius"], 12, 12),
							 new THREE.MeshBasicMaterial({
							 		color: new THREE.Color("rgb(245, 233, 66)"), 
									wireframe: true}));
		this.vsphere.add(this.vwire_sphere);
		this.vsphere.position.setX(this.options["position"].x);
		this.vsphere.position.setY(this.options["position"].y);
		this.vsphere.position.setZ(this.options["position"].z);
		workspace.scene.add(this.vsphere);

		this.varrow = undefined;
		workspace.get_model("arrow", "scene.gltf").then(
			function (result) {
				this.varrow = result;
				workspace.scene.add(this.varrow);
				this.redraw();
		}.bind(this));

		workspace.dblclick[this.vsphere.uuid] = 
			function(event, intersects) {
				this.destroy();
		}.bind(this);

	}

	/****************************************************/

	refresh_from_server(data) {
		this.stars = data["stars"];
		this.phase = data["phase"];
		this.redraw();
		return "refreshed!";
	}

	redraw() { 
		if (this.visible == false) {
			this.setup();
		}
		if (this.stars.length == 0) {
			this.setup_drag_controls();
		}
		if (this.stars.length > this.vstars.length) {
			var needs = this.stars.length-this.vstars.length;
			for (var i = 0; i < needs; ++i) {
				var vstar = new THREE.Mesh(
					new THREE.SphereGeometry(0.15*this.options["radius"], 32, 16),
					new THREE.MeshToonMaterial({
					    bumpScale: 1,
					    color: this.options["star_color"],
					    specular: new THREE.Color("rgb(255, 92, 192)"),
					    reflectivity: 0.4,
					    shininess: 256,
						envMap: workspace.cube_camera.renderTarget.texture
					}));
				this.vstars.push(vstar);
				workspace.scene.add(vstar);
				workspace.outline_pass1.selectedObjects = 
					workspace.outline_pass1.selectedObjects.concat([vstar]);
			}
			this.setup_drag_controls();
		} else if (this.stars.length < this.vstars.length) {
			var doesnt_need = this.vstars.length-this.stars.length;
			for (var i = 0; i < doesnt_need; ++i) {
				this.vstars[i].visible = false;
				this.vstars.pop();
			}
		}
		var total_star = new THREE.Vector3();
		for (var i = 0; i < this.stars.length; ++i) {
			var xyz = new THREE.Vector3(...this.stars[i]);
			total_star = total_star.add(xyz);
			var xyz2 = this.local_global(xyz);
			this.vstars[i].position.setX(xyz2.x);
			this.vstars[i].position.setY(xyz2.y);
			this.vstars[i].position.setZ(xyz2.z);
		}

		if (this.varrow != undefined) {
			this.varrow.position.setX(this.vsphere.position.x);
			this.varrow.position.setY(this.vsphere.position.y);
			this.varrow.position.setZ(this.vsphere.position.z);

			if (this.stars.length == 0) {
				this.varrow.visible = false;
			} else {
				this.varrow.visible = true;
				var quaternion = new THREE.Quaternion();
				quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), total_star.clone().normalize());
				this.varrow.rotation.set(0, 0, 0);
				this.varrow.applyQuaternion(quaternion);
				this.varrow.scale.x = total_star.length()/100;
				this.varrow.scale.y = total_star.length()/100;
				this.varrow.scale.z = total_star.length()/100;
			}
		}
	}

	/****************************************************/

	loop() {
		super.loop();
	}

	destroy() {
		for(var i = 0; i < this.vstars.length; ++i) {
			//this.vstars[i].visible = false;
			workspace.scene.remove(this.vstars[i]);
		}
		this.vstars = [];
		this.drag_controls.deactivate();
		workspace.scene.remove(this.vsphere);
		workspace.scene.remove(this.vwire_frame);
		workspace.scene.remove(this.varrow);
		super.destroy();
	}

	/****************************************************/

	global_local(point) {
		return point.clone().sub(this.vsphere.position).normalize().multiplyScalar(this.options["radius"]);
	}

	local_global(point) {
		return point.clone().multiplyScalar(this.options["radius"]).add(this.vsphere.position.clone())
	}

	/****************************************************/

	setup_drag_controls() {
		if (this.drag_controls != undefined) {
			this.drag_controls.deactivate();
		}
		this.drag_controls = new THREE.DragControls(
									this.vstars.concat([this.vsphere]), 
									workspace.camera, 
									workspace.renderer.domElement);

		this.drag_controls.addEventListener("dragstart", function(event) {
			workspace.camera_controls.enabled = false; 
		}.bind(this));
		this.drag_controls.addEventListener("dragend", function (event) { 
			workspace.camera_controls.enabled = true; 
		}.bind(this));
		this.drag_controls.addEventListener("drag", function (event) {
			if (this.vstars.includes(event.object)) {
				var sphere_xyz = event.object.position.sub(this.vsphere.position).normalize()
				var i = this.vstars.indexOf(event.object);
				this.stars[i] = [sphere_xyz.x, sphere_xyz.y, sphere_xyz.z];
				var xyz = sphere_xyz.multiplyScalar(this.options["radius"]).add(this.vsphere.position);
				event.object.position.setX(xyz.x);
				event.object.position.setY(xyz.y);
				event.object.position.setZ(xyz.z);
				if (Math.random() < 1/4) {
					this.call("refresh_from_client")({"stars": this.stars});
				}
			} else if (event.object == this.vsphere) {

			}
			this.redraw();
		}.bind(this));
	}
}