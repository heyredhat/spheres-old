from spheres import *
from functools import *
import copy

class OperatorExpression:
	def __init__(self, ops):
		self.ops = ops

	def __mul__(self, other):
		if type(other) == OperatorExpression:
			return OperatorExpression(self.ops+other.ops)
		elif type(other) == qt.Qobj and other.type == "oper":
			return OperatorExpression(self.ops+[other])
		else:
			return self.reduced()*other

	def __rmul__(self, other):
		if type(other) == OperatorExpression:
			return OperatorExpression(other.ops+self.ops)
		elif type(other) == qt.Qobj and other.type == "oper":
			return OperatorExpression([other]+self.ops)
		else:
			return other*self.reduced()

	def __getattr__(self, name):
		return getattr(self.reduced(), name)

	def reduced(self):
		return reduce(lambda x, y: x.__old_mul__(y), self.ops)

	def __repr__(self):
		return str(self.ops)

def curse():
	setattr(qt.Qobj, "__old_mul__", copy.copy(qt.Qobj.__mul__))
	setattr(qt.Qobj, "__old_rmul__", copy.copy(qt.Qobj.__rmul__))
	def __new_mul__(self, other):
		if self.type == "bra":
			if type(other) == OperatorExpression:
				return self.__old_mul__(other.reduced())
		elif self.type == "oper":
			if type(other) == OperatorExpression:
				return OperatorExpression([self]+other.ops)
			elif type(other) == qt.Qobj and other.type == "oper":
				return OperatorExpression([self, other])
		return self.__old_mul__(other)
	setattr(qt.Qobj, "__mul__", __new_mul__)
	def __new_rmul__(self, other):
		if self.type == "ket":
			if type(other) == OperatorExpression:
				return other.reduced().__old_mul__(self)
		elif self.type == "oper":
			if type(other) == OperatorExpression:
				return OperatorExpression(other.ops+[self])
			elif type(other) == qt.Qobj and other.type == "oper":
				return OperatorExpression([other, self])
		return other.__old_mul__(self)
	setattr(qt.Qobj, "__rmul__", __new_rmul__)
	setattr(qt.Qobj, "__old_repr__", copy.copy(qt.Qobj.__repr__))
	def __new_repr__(self):
		if self.name == "":
			return self.__old_repr__()
		return self.name
	setattr(qt.Qobj, "__repr__", __new_repr__)
	setattr(qt.Qobj, "name", "")

	_special_names = [
	    '__abs__', '__add__', '__and__', '__call__', '__cmp__', '__coerce__', 
	    '__contains__', '__delitem__', '__delslice__', '__div__', '__divmod__', 
	    '__eq__', '__float__', '__floordiv__', '__ge__', '__getitem__', 
	    '__getslice__', '__gt__', '__hash__', '__hex__', '__iadd__', '__iand__',
	    '__idiv__', '__idivmod__', '__ifloordiv__', '__ilshift__', '__imod__', 
	    '__imul__', '__int__', '__invert__', '__ior__', '__ipow__', '__irshift__', 
	    '__isub__', '__iter__', '__itruediv__', '__ixor__', '__le__', '__len__', 
	    '__long__', '__lshift__', '__lt__', '__mod__',  '__ne__', #'__mul__',
	    '__neg__', '__oct__', '__or__', '__pos__', '__pow__', '__radd__', 
	    '__rand__', '__rdiv__', '__rdivmod__', '__reduce__', '__reduce_ex__', #'__repr__', 
	    '__reversed__', '__rfloorfiv__', '__rlshift__', '__rmod__',
	    '__ror__', '__rpow__', '__rrshift__', '__rshift__', '__rsub__', #'__rmul__',
	    '__rtruediv__', '__rxor__', '__setitem__', '__setslice__', '__sub__', 
	    '__truediv__', '__xor__', 'next',
	]

	for name in _special_names:
		if name in dir(qt.Qobj):
			def wrap(name):
				def __wrapper__(self, *args, **kwargs):
					args = [arg.reduced() if type(arg) == OperatorExpression else arg for arg in args]
					kwargs = dict([(k, v.reduced() if type(v) == OperatorExpression else v) for k, v in kwargs.items()])
					return getattr(self.reduced(), name)(*args, **kwargs)
				return __wrapper__
			setattr(OperatorExpression, name, wrap(name))
curse()

v = qt.rand_ket(2)
a, b, DM, c, d = [qt.rand_herm(2) for i in range(5)]
v.name = "v"
a.name = "a"
b.name = "b"
c.name = "c"
d.name = "d"
DM.name = "DM"
