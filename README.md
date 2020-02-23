# spheres

## Installation

First, make sure numpy, scipy, and cython are installed.

```
pip install numpy
pip install scipy
pip install cython
```

Then:

`pip install spheres`

## Usage

spheres provides a seamless mechanism for real-time visualization of python data in the browser, with an emphasis on the numerical data required for simulations of quantum mechanics.

`a = View(1)`

The basic pattern is to wrap a View around any python object. The result is that, for example:

`type(a)` => `<class 'spheres.view.View(int)>`, but
`a.__class__` => `<class 'int'>`.

The View object completely emulates its "inner class" and can be used more or less interchangeably.

`a + 1` => `2`

To assign an "inner value" to a View use:

`a << (a + 1)`

Make sure to include the parentheses because otherwise python will interpret this as `(a << a) + 1`. You can retrieve the underlying object of a View with `a.get()`.

Meanwhile, however, when you `import spheres` a webserver built on flask and socketio starts in a background thread, which provides 3D visualizations of certain datatypes using three.js in the browser. Note that the `import` won't complete until the server has accepted a connection via the browser. You can specify the port using a commandline argument:

`python test.py -p 8080` or `python test.py --port 8080`.

Then the page will be available at `localhost:8080`.

The idea is that each View object python-side is linked to a corresponding View object on the javascript side. Every time the python View is changed, the javascript View reflects the change. Note that javascript Views are created on the first "flush," but that `repr(view)` has been overloaded to flush.

```
a = View(1)
a
```

The value of `a` should print to the console, while a pane displaying that same value should appear in the browser. This pane can be dragged around, resized, and double clicking it will make it dissapear.

You can even access javascript methods in python. The idea is that when you try to call a method of python View `a`, first the object checks its own namespace, then it checks the namespace of its "inner class," but then it checks the namespace of the corresponding javascript class in the browser. For example, the javascript View has a `destroy` method, which kills the visualization (although it will return upon another flush). It can be easily called via python as if it were a python method: `a.destroy()`.

Symmetrically, we can call python methods from javascript. To see this, first we note that `a.js()` will return a useful string of the form,

`workspace.views['b5e9f8c4-c43e-41df-9c64-fd195f1da7b2']`.

 from which it becomes clear that each python/js View is assigned a unique id. In the javascript console, we can then use:

`await workspace.views['b5e9f8c4-c43e-41df-9c64-fd195f1da7b2'].call('js')()`

In the python console, this prints the same value as before. The results of the method (nothing in this case) are returned as a javascript Promise. We also observe that while python Views are managed by the View class itself, the javascript Views are managed by a "Workspace," available globally as `workspace`.) 

A view can be defined in the following way (in python):

```
View(obj,\
		to_client=lambda view: <view to viz_data>,\
		from_client=lambda viz_data: <viz_data to inner obj>,\
		js_class="<javascript class name>",\
		requires_flush=["these", "methods", "will", "trigger", "an", "update"])
```

The default View has a simple `to_client` function: `lambda view: str(view)` and its `from_client` function does nothing. Its `js_class` is "View," and nothing special requires flushing.

Currently, the only other View which has been implemented is Sphere. It's defined in the following way.

```
def Sphere(obj):
	return View(obj,\
		 		to_client=lambda view:\
				 	{"stars": [xyz.tolist() for xyz in spin_XYZ(view.get())],\
				 	 "phase": [1,0]},\
		 		from_client=lambda data: qt.Qobj(XYZ_spin(data["stars"])),\
		 		js_class="Sphere")
```

A Sphere represents the state of a "quantum spin" as a constellation of points on a 2-sphere via an insight often attributed to Ettore Majorana. Note that we use the automatically included `qutip` library, available as `qt`, for our quantum calculations, and we assume knowledge of its use. 

A quantum spin can be represented as finite dimensional complex vector. Eliding many details, if the components of a spin state in the |j, m> representation are interpreted as the coefficients of a polynomial, then the roots of that polynomial when stereographically projected from the complex plane to the 2-sphere along the axis of quantization correspond to a constellation of points. Each point or "star" contributes an angular momentum of 1/2 in its direction so that the total angular momentum axis is just the sum of the stars.

The provided method `spin_XYZ` takes a `qt.Qobj` (or an `np.array`) representing a spin state and returns a list of the xyz coordinates of its stars. Conversely, the method `XYZ_spin` takes a list of xyz coordinates and returns its corresponding complex vector (as an `np.array`). We leave aside for now the "phase," which, to put it briefly, has to do with the fact that the roots of polynomials are only defined up to multiplcation by a complex scalar.

To create a Sphere for a random spin state, we can use: 
```
a = Sphere(qt.rand_ket(3))
a
```

Updating `a` in python, of course, updates the constellation. But because the relationship is bidirectional, if we drag the stars around in the visual representation, `a` automatically reflects the change in python.

We can easily see this by using one View to "listen" to another View.

```
a = Sphere(qt.rand_ket(3))
b = View("")
b.listen(a, lambda o: str(o))
```
Here, `View("")` is, of course, a wrapper around a string object. The effect is that every time `a` changes, `b` reflects the change: specifically, the inner object of `b` is set to the return value of the provided lambda to which `a` is passed as `o`.

In the browser, there should appear a sphere for `a` and a pane for `b`. It's clear that dragging the stars around the sphere updates the complex vector in real time, which is reflected in `b`. (If you're done listening, use `b.unlisten(a)`.)

Finally, consider:
```
dt = 0.008
u = (-1j*dt*qt.rand_herm(3)).expm()
a.loop_for(5000, lambda o: u*o)
```

The first line generates a random unitary matrix representing quantum time evolution over a short interval dt. We can apply this unitary to our quantum state with `u*a`. It often happens we want to do this over and over again, animating the constellation. But for efficiency, we don't really want to update the visualization after *every* iteration, and in fact, doing so often overloads the browser. So we have `loop_for`. It takes optional parameters `rate` and `sleep`: a rate of 1/2 flushes updates to the browser after every other iteration; a rate of 1/3 flushes updates every three iterations, etc; and we can also sleep for a certain amount of time after each iteration. Generally, the default values are fine.

And that's all for now. 