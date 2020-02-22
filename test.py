from spheres import *
import numpy as np
import qutip as qt

a = View(np.array([0,1j]))
b = View(1)
c = View("julian")

n = 8
s = Sphere(qt.rand_ket(n))
v = View("")
v.listen(s, lambda sph: str(sph))

u = (-1j*0.008*qt.rand_herm(n)).expm()
s.loop_for(100, lambda sph: u*s)

# make listeners bidirectional
# try subclassing
