from spheres import *
import numpy as np
import qutip as qt

a = View(np.array([0,1j]))
b = View(1)
c = View(["julian"])

s = View(np.array([1,1]),\
		 to_client=lambda view:\
		 	{"stars": [xyz.tolist()\
		 		for xyz in spin_XYZ(object.__getattribute__(view, "_obj"))],\
		 	 "phase": [1,0]},\
		 from_client=lambda data:\
		 	XYZ_spin(data["stars"]),\
		 js_class="Sphere")

u = (-1j*0.01*qt.rand_herm(2)).expm().full()
q = qt.rand_ket(2).full().T[0]
input()
s.set(q)
a.set(q)
for i in range(1000):
	q = np.dot(u, q)
	s.set(q)
	a.set(q)
	# gotta cut down on flushes and wait too
	sockets.sleep(0.01)
	# should be able to add random listeners
	# on updates...