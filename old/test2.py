
a = View(np.array([0,1j]))
b = View(1)
c = View("julian")

n = 8
s = Sphere(qt.rand_ket(n))
v = View("")
v.listen(s, lambda sph: str(sph))

u = (-1j*0.008*qt.rand_herm(n)).expm()
#s.loop_for(100, lambda sph: u*s)

old = copy.copy(b.test)
def new_test(self):
    global old
    old()
    print("not original")

b.test()

forbiddenfruit.curse(View, "test", new_test)
import sys


#curse()

def add_method(cls):
    def decorator(func):
        @wraps(func) 
        def wrapper(self, *args, **kwargs): 
            return func(*args, **kwargs)
        setattr(cls, func.__name__, wrapper)
        # Note we are not binding func, but wrapper which accepts self but does exactly the same as func
        return func # returning func means func can still be used normally
    return decorator


def curse():
    classes = [qt.Qobj, View]
    for i, c in enumerate(classes):
        for attr in dir(c):
            if attr not in ["views", "__class__", "__init__", "__new__", "__getattr__", "__getattribute__"]:
                func = getattr(c, attr)
                if callable(func):
                    cfunc = copy.copy(func)
                    def wrapped(self, *args, **kwargs):
                        nonlocal cfunc
                        print("!")
                        print(attr)
                        print(*args)
                        print(**kwargs)
                        return cfunc(*args, **kwargs)
                    print("8")
                    print(c)
                    print(attr)
                    print(wrapped)
                    setattr(c, attr, wrapped)
#
#curse()