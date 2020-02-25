from spheres import *

a = Sphere(qt.rand_ket(4), name="a")
a.dims = [[2,2], [1,1]]

b, c = partials(a)
b.name = "b"
c.name = "c"

dt = 0.008
h = qt.rand_herm(2)
u = View((-1j*h*dt).expm(), name="u")
U = View(qt.tensor((-1j*dt*h/8).expm(), qt.identity(2)), name="U")

def A():
	a.loop_for(200, lambda v: U*a)

def B():
	b.loop_for(200, lambda v: u*v*u.dag())

p = View(qt.basis(2,0)*qt.basis(2,0).dag(), name="p")
P = View(qt.tensor(qt.basis(2,0)*qt.basis(2,0).dag(), qt.identity(2)), name="P")