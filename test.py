from spheres import *
import numpy as np
import qutip as qt

a = View(np.array([0,1j]))
b = View(1)
c = View("julian")

n = 8
s = View(np.array([1]*n),\
		 to_client=lambda view:\
		 	{"stars": [xyz.tolist()\
		 		for xyz in spin_XYZ(object.__getattribute__(view, "_obj"))],\
		 	 "phase": [1,0]},\
		 from_client=lambda data:\
		 	XYZ_spin(data["stars"]),\
		 js_class="Sphere")
v = View("")
v.listen(s, lambda sph: str(sph))

input()
u = (-1j*0.008*qt.rand_herm(n)).expm().full()
s.loop_for(10000, lambda sph: np.dot(u, sph))

#for i in range(1000):
#	s << np.dot(u, s)
#	sockets.sleep(0.01) # can't send em too quickly

# have to cut down on flushes
# need a list: funcs who need flushes
# and add x[0] = 2 to it automatically?