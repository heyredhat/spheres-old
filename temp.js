class Sphere extends View {
	constructor(uuid, options) {
		this.options = options != undefined ? options :
						{"suppress_default_view": true}
		super(uuid, options);

		/****************************************************/

		this.setup_drag_controls = this.setup_drag_controls.bind(this);
		this.set_phase = this.set_phase.bind(this);
		this.set_stars = this.set_stars.bind(this);
		this.create_stars = this.create_stars.bind(this);
		this.refresh_stars = this.refresh_stars.bind(this);
		this.destroy_stars = this.destroy_stars.bind(this);
		this.create_star = this.create_star.bind(this);
		this.destroy_star = this.destroy_star.bind(this);

		/****************************************************/

		this.options["radius"] = this.options["radius"] == undefined ? 1 : undefined;
		this.options["position"] = this.options["position"] == undefined ? new THREE.Vector3(0,0,0) : undefined;
		this.options["sphere_color"] = this.options["sphere_color"] == undefined ? new THREE.Color("rgb(0, 7, 209)") : undefined;
		this.options["star_color"] = this.options["star_color"] == undefined ? new THREE.Color("rgb(255, 31, 135)") : undefined;

		/*if (this.options["stars"] == undefined) {
			this.options["stars"] = [];
		}
		if (this.options["phase"] == undefined) {
			this.options["phase"] = [1,0];
		}

		if (this.options["dragstart_listeners"] == undefined) {
			this.options["dragstart_listeners"] = {};
		}
		if (this.options["dragend_listeners"] == undefined) {
			this.options["dragend_listeners"] = {};
		}
		if (this.options["drag_listeners"] == undefined) {
			this.options["drag_listeners"] = {};
		}*/

		/****************************************************/

		this.setup();
	}

	/***************************************************************************/

	setup() {
		super.setup();
		this.vsphere = new THREE.Mesh(
					   		new THREE.SphereGeometry(this.options["radius"], 64, 64), 
					  		new THREE.MeshToonMaterial({
							    bumpScale: 1,
							    color: this.options["sphere_color"],
							    reflectivity: 0.5,
							    shininess: 2,
								envMap: this.workspace.cube_camera.renderTarget.texture,
								transparent: true,
								opacity: 0.9}));
		this.workspace.outline_pass2.selectedObjects = 
				this.workspace.outline_pass2.selectedObjects.concat([this.vsphere]);
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

		this.set_stars(this.options["stars"])
		this.set_phase(this.options["phase"])

		/****************************************************/

		this.varrow = undefined;
		this.workspace.load_model("arrow", 'scene.gltf').then(
			function (result) {
				this.varrow = result;
				this.workspace.scene.add(this.varrow);
				this.refresh();
			}.bind(this));
	}

	setup_drag_controls() {
		if (this.drag_controls != undefined) {
			this.drag_controls.deactivate();
		}
		this.drag_controls = new THREE.DragControls(
									this.vstars.concat([this.vsphere]), 
									this.workspace.camera, 
									this.workspace.renderer.domElement);
		this.drag_controls.addEventListener('dragstart', function(event) {
			this.workspace.orbit_controls.enabled = false; 
			if (this.options["dragstart_listeners"] != undefined) {
				for (var listener in this.options["dragstart_listeners"]) {
					if (this.options["dragstart_listeners"][listener] != undefined) {
						this.options["dragstart_listeners"][listener](event);
					}
				}
			}
		}.bind(this));
		this.drag_controls.addEventListener('dragend', function (event) { 
			this.workspace.orbit_controls.enabled = true; 
			if (this.options["dragend_listeners"] != undefined) {
				for (var listener in this.options["dragend_listeners"]) {
					if (this.options["dragend_listeners"][listener] != undefined) {
						this.options["dragend_listeners"][listener](event);
					}
				}
			}
		}.bind(this));
		this.drag_controls.addEventListener('drag', function (event) {
			if (this.vstars.includes(event.object)) {
				var sphere_xyz = event.object.position.sub(this.vsphere.position).normalize()
				var i = this.vstars.indexOf(event.object);
				this.options["stars"][i] = [sphere_xyz.x, sphere_xyz.y, sphere_xyz.z];
				var xyz = sphere_xyz.multiplyScalar(this.options["radius"]).add(this.vsphere.position);
				event.object.position.setX(xyz.x);
				event.object.position.setY(xyz.y);
				event.object.position.setZ(xyz.z);
			} else if (event.object == this.vsphere) {
				this.refresh_stars(this.options["stars"]);
				for (var child in this.options["children"]) {
					if (this.options["children"][child] != undefined) {
						this.options["children"][child].refresh();
					}
				}
			}
			if (this.options["drag_listeners"] != undefined) {
				for (var listener in this.options["drag_listeners"]) {
					if (this.options["drag_listeners"][listener] != undefined) {
						this.options["drag_listeners"][listener](event);
					}
				}
			}
			this.refresh();
		}.bind(this));
	}

	/***************************************************************************/

	set_phase(new_phase) {
		this.options["phase"] = new_phase;
	}

	/***************************************************************************/

	set_stars(new_stars, data) {
		if (this.vstars == undefined) {
			this.vstars = [];
		}
		this.options["stars"] = [];
		for (var i = 0; i < new_stars.length; ++i) {
			var xyz = new THREE.Vector3(new_stars[i][0], new_stars[i][1], new_stars[i][2]);
			var xyz2 = this.global_local(xyz.clone());
			this.options["stars"].push([xyz2.x, xyz2.y, xyz2.z]);
		}

		if (new_stars.length == 0) {
			this.setup_drag_controls();
		}
		if (new_stars.length > this.vstars.length) {
			this.create_stars(new_stars.length-this.vstars.length);
		} else if (new_stars.length < this.vstars.length) {
			for (var i = this.vstars.length-new_stars.length; i > 0; --i) {
				this.vstars[i].visible = false;
				this.vstars.pop();
			}
		}
		//this.refresh_stars(new_stars);
		this.refresh(data);
	}

	create_stars(n_stars) {
		for(var i = 0; i < n_stars; ++i) {
			var vstar = new THREE.Mesh(
				new THREE.SphereGeometry(0.15*this.options["radius"], 32, 16),
				new THREE.MeshToonMaterial({
				    bumpScale: 1,
				    color: this.options["star_color"],
				    specular: new THREE.Color("rgb(255, 92, 192)"),
				    reflectivity: 0.4,
				    shininess: 256,
					envMap: this.workspace.cube_camera.renderTarget.texture
					}));
			this.vstars.push(vstar);
			this.workspace.scene.add(vstar);
			this.workspace.outline_pass1.selectedObjects = 
				this.workspace.outline_pass1.selectedObjects.concat([vstar]);
		}
		this.setup_drag_controls();
	}

	refresh_stars(new_stars) {
		if (new_stars.length == this.vstars.length) {
			for(var i = 0; i < new_stars.length; ++i) {
				var xyz = new THREE.Vector3(new_stars[i][0], new_stars[i][1], new_stars[i][2]);
				xyz = xyz.multiplyScalar(this.options["radius"]).add(this.vsphere.position);
				this.vstars[i].position.setX(xyz.x);
				this.vstars[i].position.setY(xyz.y);
				this.vstars[i].position.setZ(xyz.z);
			}
		}
	}

	destroy_stars() {
		for(var i = 0; i < this.vstars.length; ++i) {
			this.vstars[i].visible = false;
			this.vsphere.remove(this.vstars[i]);
		}
		this.vstars = [];
	}

	/****************************************************/

	create_star(star) {
		var temp = [];
		for (var i = 0; i < this.options["stars"].length; ++i) {
			var xyz = new THREE.Vector3(this.options["stars"][i][0], this.options["stars"][i][1], this.options["stars"][i][2]);
			var temp2 = this.local_global(xyz);
			temp.push([temp2.x, temp2.y, temp2.z]);
		}
		temp.push(star);
		this.set_stars(temp);
		//this.refresh();

		if(this.options["dims"] != undefined) {
			this.options["dims"] = [[this.options["stars"].length+1],[1]];
			this.options["ptrace_index"] = 0;
		}
		var dims = this.has_child_class(Dims);
		if(dims != undefined) {
			dims.refresh();
		}
	}

	destroy_star(i) {
		this.options["stars"].splice(i, 1);
		this.vstars[i].visible = false;
		this.vstars.splice(i, 1);

		if(this.options["dims"] != undefined) {
			this.options["dims"] = [[this.options["stars"].length+1],[1]];
			this.options["ptrace_index"] = 0;
		}
		this.refresh();

		var dims = this.has_child_class(Dims);
		if(dims != undefined) {
			dims.refresh();
		}
	}

	/****************************************************/

	refresh(data) {
		super.refresh();
		var total_star = new THREE.Vector3();
		for (var i = 0; i < this.options["stars"].length; ++i) {
			var xyz = new THREE.Vector3(this.options["stars"][i][0], 
										this.options["stars"][i][1],
										this.options["stars"][i][2]);
			total_star = total_star.add(xyz.clone());
			var xyz2 = this.local_global(xyz.clone());
			this.vstars[i].position.setX(xyz2.x);
			this.vstars[i].position.setY(xyz2.y);
			this.vstars[i].position.setZ(xyz2.z);
		}
		if (this.varrow != undefined) {
			this.varrow.position.setX(this.vsphere.position.x);
			this.varrow.position.setY(this.vsphere.position.y);
			this.varrow.position.setZ(this.vsphere.position.z);
			if (this.options["stars"].length > 0) {
				var quaternion = new THREE.Quaternion();
				quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), total_star.clone().normalize());
				this.varrow.rotation.set( 0, 0, 0 );
				this.varrow.applyQuaternion(quaternion);
				this.varrow.scale.x = total_star.length()/50;
				this.varrow.scale.y = total_star.length()/50;
				this.varrow.scale.z = total_star.length()/50;
				this.varrow.visible = true;
			} else {
				this.varrow.visible = false;
			}

		}

		if (this.options["children"] != undefined) {
			for (var child in this.options["children"]) {
				if (this.options["children"][child] != undefined) {
					this.options["children"][child].refresh();
				}
			}
		}

		var spp = this.has_child_class(SpherePlaneProjection);
		if (spp != undefined) {
			if (data != undefined && data["silent"] == true) {

			} else {
				spp.refresh({"from": "sphere"});
			}
		}
	}

	/****************************************************/

	global_local(point) {
		return point.clone().sub(this.vsphere.position).normalize().multiplyScalar(this.options["radius"]);
	}

	local_global(point) {
		return point.clone().multiplyScalar(this.options["radius"]).add(this.vsphere.position.clone())
	}

	/****************************************************/

	destroy() {
		this.workspace.scene.remove(this.vsphere);
		this.workspace.scene.remove(this.vwire_frame);
		this.workspace.scene.remove(this.varrow);
		this.destroy_stars();
		this.workspace.dblclick_listeners[this.vsphere.uuid] = undefined;
		if (this.drag_controls != undefined) {
			this.drag_controls.deactivate();
		}
		this.workspace.sockets.removeListener("sphere_update", this.refresh);
		this.workspace.sockets.removeListener("eval_poly", this.refresh_poly);
		if (this.poly != undefined) {
			this.workspace.scene.remove(this.poly);
		}
		super.destroy();
	}

}