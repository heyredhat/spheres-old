from spheres import *
import uuid

class Sphere:
	def __init__(self, vec):
		self.uuid = str(uuid.uuid4())
		self.vec = vec
		sockets.emit("create", {"uuid": self.uuid,\
								"class": "Sphere",\
								"args": {}})

	def flush(self):
		self.remote_call("update", {})

	def remote_call(self, func, args):
		sockets.emit("call", {"uuid": self.uuid, 
							  "func": func, 
							  "args": args})


	def __len__(self):
		return len(self.vec)

	def __getitem__(self, key):
		pass

	def __setitem__(self, key):
		pass

	def __delitem__(self, key):
		pass

	def __iter__(self):
		pass



	def __repr__(self):
		return str(self.vec)