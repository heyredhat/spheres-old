class Workspace {
	constructor(div) {
		this.setup_sockets = this.setup_sockets.bind(this);
		this.setup_renderer = this.setup_renderer.bind(this);
		this.setup_scene = this.setup_scene.bind(this);
		this.setup_cameras = this.setup_cameras.bind(this);
		this.setup_postprocessing = this.setup_postprocessing.bind(this);
		this.loop = this.loop.bind(this);

		/****************************************************/

		this.div = document.getElementById(div);
		this.objects = {};

		/****************************************************/

		this.setup_sockets();
		this.setup_renderer();
		this.setup_scene();
		this.setup_cameras();
		this.setup_postprocessing();
		this.loop();
	}

	setup_sockets() {
		this.sockets = io.connect(null, {port: location.port, rememberTransport: false});
		this.sockets.on("create", function (data) {
			this.objects[data["uuid"]] = new (eval(data["class"]))(data["uuid"], data["args"]);
		}.bind(this));
		this.sockets.on("call", function (data, callback) {
			var found = false;
			for (var obj_id in this.objects) {
				if (obj_id == data["uuid"]) {
					found = true;
					if (data["func"] in this.objects[obj_id]) {
						callback(this.objects[obj_id][data["func"]](data["args"]));
					} else {
						callback(undefined);
					}
				}
			}
			if (!found) {
				callback(undefined, undefined);
			}
		}.bind(this));
		this.sockets.on("destroy", function (data) {
			if (data["uuid"] in this.objects) {
				this.objects[data["uuid"]].destroy();
				delete this.objects[data["uuid"]];
			}
		}.bind(this));
	}

	setup_renderer() {
		this.renderer = new THREE.WebGLRenderer({alpha: true});
		this.renderer.setSize(this.div.offsetWidth, this.div.offsetHeight);
		this.renderer.setClearColor(0xffffff);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.gammaOutput = true;
		this.div.appendChild(this.renderer.domElement);
	}

	setup_scene() {
		this.scene = new THREE.Scene();
		this.ambient_light = new THREE.AmbientLight(0xffffff);
		this.scene.add(this.ambient_light);
	}

	setup_cameras() {
		this.camera = new THREE.PerspectiveCamera(50,
						this.div.offsetWidth/this.div.offsetHeight, 
						0.1, 1000);
		this.camera.position.z = 3.5;

	 	this.cube_camera = new THREE.CubeCamera(0.1, 1, 512);
		this.cube_camera.renderTarget.texture.generateMipmaps = true;
		this.cube_camera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
		this.scene.background = this.cube_camera.renderTarget;

	 	this.camera_controls = new THREE.TrackballControls(this.camera, 
	 										this.renderer.domElement);
		this.camera_controls.dynamicDampingFactor = 0.3;
		this.camera_controls.panSpeed = 0.7;
		this.camera_controls.rotateSpeed = 2;
		this.camera_controls.zoomSpeed = 2;

		window.addEventListener('resize', function (event) {
				this.renderer.setSize(this.div.offsetWidth, this.div.offsetHeight);
				this.camera.aspect = this.div.offsetWidth/this.div.offsetHeight;
				this.camera.updateProjectionMatrix();
		}.bind(this));
	}

	setup_postprocessing() {
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
		
		this.outline_pass1 = new THREE.OutlinePass(new THREE.Vector2(this.div.offsetWidth, 
									this.div.offsetHeight), this.scene, this.camera, []);
		this.outline_pass1.visibleEdgeColor = new THREE.Color(1,1,1);
		this.outline_pass1.hiddenEdgeColor = new THREE.Color(1,1,1);
		this.outline_pass1.edgeThickness = 1.0;
		this.outline_pass1.edgeStrength = 20;
		this.outline_pass1.edgeGlow = 0.3;
		this.outline_pass1.pulsePeriod = 3;

		this.outline_pass2 = new THREE.OutlinePass(new THREE.Vector2(this.div.offsetWidth, 
									this.div.offsetHeight), this.scene, this.camera, []);
		this.outline_pass2.visibleEdgeColor = new THREE.Color(0,0,0);
		this.outline_pass2.hiddenEdgeColor = new THREE.Color(0,0,0);
		this.outline_pass2.edgeThickness = 1;
		this.outline_pass2.edgeStrength = 20;

		this.composer.addPass(this.outline_pass1);
		this.composer.addPass(this.outline_pass2);
		this.composer.addPass(new THREE.AfterimagePass(0.78));
	}

	loop() {
		requestAnimationFrame(this.loop);
		for (var obj_id in this.objects) {
			if (this.objects[obj_id] != undefined) {
				this.objects[obj_id].loop();
			}
		}
		this.camera_controls.update();
		this.composer.render();
	}
}
