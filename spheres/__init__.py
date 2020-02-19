import json
import flask
import logging
import threading
import socketio
import eventlet
import eventlet.wsgi
import asyncio 

########################################################################################

sockets = socketio.Server(async_mode='threading')
app = flask.Flask(__name__)
app.wsgi_app = socketio.Middleware(sockets, app.wsgi_app)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route("/")
def root():
    return flask.render_template("index.html")

@sockets.on('connect')
def connect(sid, data):
    print("> connected with sid %s" % sid)

@sockets.on('disconnect')
def disconnect(sid):
    print("> disconnected with sid %s" % sid)

########################################################################################

from spheres.view import *
from spheres.sphere import *
from spheres.magic import *

@sockets.on('call')
def call(sid, data):
    if data["uuid"] in View.objects:
    	obj = View.objects[data["uuid"]]
    	if hasattr(obj, data["func"]):
    		return getattr(obj, data["func"])(*data["args"])
    return None

def __init__(app, sockets):
	print("WELCOME TO SPHERES")
	app.run(threaded=True, port=8080)

thread = threading.Thread(target=__init__, args=(app, sockets))
thread.start()