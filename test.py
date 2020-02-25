from spheres import *
import numpy as np
import qutip as qt
import copy
from functools import wraps

_a = qt.rand_ket(4)
_a.dims = [[2,2], [1,1]]
_b, _c = _a.ptrace(0), _a.ptrace(1)

dt = 0.008
_h = qt.rand_herm(2)
_u = (-1j*dt*_h).expm()
_U = qt.tensor((-1j*dt*_h/8).expm(), qt.identity(2))

a = Sphere(_a, name="a")
b, c = partials(a)
b.name = "b"
c.name = "c"

o = View(qt.basis(2,0)*qt.basis(2,0).dag(), name="o")
u = View(_u, name="u")
U = View(_U, name="U")

def B():
	b.loop_for(200, lambda v: u*v*u.dag())

def A():
	a.loop_for(200, lambda v: U*a)