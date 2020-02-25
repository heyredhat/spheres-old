from spheres import *

x = View(np.array([0,1j]))
y = View(1)
z = View("julian")

###

n = 8
s = Sphere(qt.rand_ket(n))
v = View("")
v.listen(s, lambda sph: str(sph))

###

dt = 0.008
h = qt.rand_herm(n)
u = (-1j*h*dt).expm()
s.loop_for(100, lambda sph: u*s)
