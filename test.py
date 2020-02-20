from spheres import *
import numpy as np

a = View(np.array([0,1j]))
b = View(1)
c = View(["julian"])

s = View(np.array([1,0]),
		 for_refresh=lambda view: 
		 	{"stars": [xyz.tolist()\
		 		for xyz in spin_XYZ(object.__getattribute__(view, "_obj"))],\
		 	 "phase": [1,0]},\
		 js_class="Sphere")