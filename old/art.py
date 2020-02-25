from spheres.magic import *
from functools import *


class OperatorExpression:
	def __init__(self, ops):
		self.ops = ops

	def __mul__(self, other):
		if type(other) == OperatorExpression:
			return OperatorExpression(self.ops+other.ops)
		elif type(other) == qObj and other.type == "oper":
			return OperatorExpression(self.ops+[other])
		else:
			return self.reduced()*other

	def __rmul__(self, other):
		if type(other) == OperatorExpression:
			return OperatorExpression(other.ops+self.ops)
		elif type(other) == qObj and other.type == "oper":
			return OperatorExpression([other]+self.ops)
		else:
			return other*self.reduced()

	def reduced(self, qua=False):
		r = reduce(lambda x, y: x*y, [op.qua() for op in self.ops])
		return r if qua else qObj(r.full())

	def __repr__(self):
		return str(self.ops)

class qObj(qt.Qobj):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.name = ""

	def qua(self):
		return qt.Qobj(self.full())

	def __mul__(self, other):
		if self.type == "bra":
			if type(other) == OperatorExpression:
				return qObj(self.qua()*other.reduced(qua=True))
			elif type(other) == qObj and other.type == "oper":
				return qObj(self.qua()*other.qua())
			else:
				return qObj(super().__mul__(other).full())
		elif self.type == "oper":
			if type(other) == OperatorExpression:
				return OperatorExpression([self]+other.ops)
			elif type(other) == qObj and other.type == "oper":
				return OperatorExpression([self, other])
			else:
				return qObj(super().__mul__(other).full())
		else:
			raise Exception()

	def __rmul__(self, other):
		if self.type == "ket":
			if type(other) == OperatorExpression:
				return qObj(other.reduced(qua=True), self.qua())
			elif type(other) == qObj and other.type == "oper":
				return qObj(other.qua(), self.qua())
			else:
				return qObj(super().__rmul__(other).full())
		elif self.type == "oper":
			if type(other) == OperatorExpression:
				return OperatorExpression(other.ops+[self])
			elif type(other) == qObj and other.type == "oper":
				return OperatorExpression([other, self])
			else:
				return qObj(super().__rmul__(other).full())
		else:
			raise Exception()

	def dag(self):
		return qObj(super().dag().full())

	def __repr__(self):
		if self.name == "":
			return super().__repr__()
		return self.name

v = qObj(qt.rand_ket(2).full())
a, b, DM, c, d = [qObj(qt.rand_herm(2).full()) for i in range(5)]
v.name = "v"
a.name = "a"
b.name = "b"
c.name = "c"
d.name = "d"
DM.name = "DM"
v2 = v.qua()
a2, b2, DM2, c2, d2 = a.qua(), b.qua(), DM.qua(), c.qua(), d.qua() 
#DM << (a*b*DM*c*d)