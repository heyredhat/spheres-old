from spheres import *
import numpy as np
import qutip as qt

a = View(np.array([0,1j]))
b = View(1)
c = View("julian")

n = 8
s = View(qt.rand_ket(n),\
		 to_client=lambda view:\
		 	{"stars": [xyz.tolist()\
		 		for xyz in spin_XYZ(object.__getattribute__(view, "_obj"))],\
		 	 "phase": [1,0]},\
		 from_client=lambda data:\
		 	qt.Qobj(XYZ_spin(data["stars"])),\
		 js_class="Sphere")
v = View("")
v.listen(s, lambda sph: str(sph))

#input()
#u = (-1j*0.008*qt.rand_herm(n)).expm().full()
#s.loop_for(10000, lambda sph: np.dot(u, sph))

# make listeners bidirectional
# try subclassing
