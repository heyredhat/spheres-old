class Sphere {
	constructor(uuid, args) {
		this.loop = this.loop.bind(this);
		this.update = this.update.bind(this);

		this.uuid = uuid;
		this.args = args;
		var vsphere = new THREE.Mesh(
					   		new THREE.SphereGeometry(1, 64, 64), 
					  		new THREE.MeshBasicMaterial({color: 0x666666}))
		workspace.scene.add(vsphere);
	}

	loop() {

	}

	update(data) {
		console.log(data);
	}
}