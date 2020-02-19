from spheres import *
import uuid
import re
import sys

class FuncWrap:
    def __init__(self, func):
        self.func = func

    def __call__(self, *args):
        return self.func(*args)

class View(object):
    __slots__ = ["_obj", "__weakref__"]
    objects = {}

    def test(self, a=1):
        print(a)
        return a

    def u():
        print("workspace.objects['%s']" % self.uuid)

    def __init__(self, obj, *args, **kwargs):
        self.uuid = str(uuid.uuid4())
        View.objects[self.uuid] = self
        object.__setattr__(self, "_obj", obj)
        sockets.emit("create", {"class": "View",\
                            "uuid": self.uuid,\
                            "args": {}})  

    def __del__(self):
        sockets.emit("destroy", {"uuid": self.uuid})
        #super().__del__()
    
    def __getattr__(self, name):
        if hasattr(object, name):
            return getattr(object.__getattribute__(self, "_obj"), name)
        else:
            def __getattr_server__(*argz):
                finished = False
                data = []
                null = False
                def __callback__(*args):
                    nonlocal finished, data, null
                    args = list(args)
                    if len(args) == 1 and args[0] == None:
                        finished = True
                        null = True
                        raise NameError("name '%s' of %s is not defined" % (name, type(self).__name__))
                    else:
                        data = args
                        finished = True
                     
                sockets.emit("call", {"uuid": self.uuid,\
                                      "func": name,\
                                      "args": argz},\
                                      callback=__callback__)
                while not finished:
                    sockets.sleep(0.01)
                if not null:
                    return data[0] if len(data) == 1 else data
            return FuncWrap(__getattr_server__)

    def __delattr__(self, name):
        if hasattr(object, name):
            delattr(object.__getattribute__(self, "_obj"), name)
        else:
            super().__delattr__(name)

    def __setattr__(self, name, value):
        if hasattr(object, name):
            setattr(object.__getattribute__(self, "_obj"), name, value)
        else:
            super().__setattr__(name, value)
    
    def __nonzero__(self):
        return bool(object.__getattribute__(self, "_obj"))

    def __str__(self):
        return str(object.__getattribute__(self, "_obj"))

    def __repr__(self):
        return repr(object.__getattribute__(self, "_obj"))
    
    _special_names = [
        '__abs__', '__add__', '__and__', '__call__', '__cmp__', '__coerce__', 
        '__contains__', '__delitem__', '__delslice__', '__div__', '__divmod__', 
        '__eq__', '__float__', '__floordiv__', '__ge__', '__getitem__', 
        '__getslice__', '__gt__', '__hash__', '__hex__', '__iadd__', '__iand__',
        '__idiv__', '__idivmod__', '__ifloordiv__', '__ilshift__', '__imod__', 
        '__imul__', '__int__', '__invert__', '__ior__', '__ipow__', '__irshift__', 
        '__isub__', '__iter__', '__itruediv__', '__ixor__', '__le__', '__len__', 
        '__long__', '__lshift__', '__lt__', '__mod__', '__mul__', '__ne__', 
        '__neg__', '__oct__', '__or__', '__pos__', '__pow__', '__radd__', 
        '__rand__', '__rdiv__', '__rdivmod__', '__reduce__', '__reduce_ex__', 
        '__repr__', '__reversed__', '__rfloorfiv__', '__rlshift__', '__rmod__', 
        '__rmul__', '__ror__', '__rpow__', '__rrshift__', '__rshift__', '__rsub__', 
        '__rtruediv__', '__rxor__', '__setitem__', '__setslice__', '__sub__', 
        '__truediv__', '__xor__', 'next',
    ]
    
    @classmethod
    def _create_class_proxy(cls, theclass):        
        def make_method(name):
            def method(self, *args, **kw):
                return getattr(object.__getattribute__(self, "_obj"), name)(*args, **kw)
            return method
        namespace = {}
        for name in cls._special_names:
            if hasattr(theclass, name):
                namespace[name] = make_method(name)
        return type("%s(%s)" % (cls.__name__, theclass.__name__), (cls,), namespace)
    
    def __new__(cls, obj, *args, **kwargs):
        """
        creates an proxy instance referencing `obj`. 
        (obj, *args, **kwargs) are passed to this class' __init__, 
        so deriving classes can define an __init__ method of their own.
        note: _class_proxy_cache is unique per deriving class (each deriving
        class must hold its own cache)
        """
        try:
            cache = cls.__dict__["_class_proxy_cache"]
        except KeyError:
            cls._class_proxy_cache = cache = {}
        try:
            theclass = cache[obj.__class__]
        except KeyError:
            cache[obj.__class__] = theclass = cls._create_class_proxy(obj.__class__)
        ins = object.__new__(theclass)
        theclass.__init__(ins, obj, *args, **kwargs)
        return ins