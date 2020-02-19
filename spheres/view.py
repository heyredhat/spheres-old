import uuid
from spheres import *

class View:
	def __init__(self, data):
		self.uuid = str(uuid.uuid4())
		self.data = data
		sockets.emit("create", {"uuid": self.uuid,\
								"class": self.__class__,\
								"args": {}})

	def __getattr__(self, name):
		return getattr(self.data, name)

	def flush(self):
		sockets.emit("call", {"uuid": self.uuid, 
							  "func": "update", 
							  "args": {}})

