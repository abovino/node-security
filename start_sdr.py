import sys
from subprocess import PIPE, Popen, STDOUT
from threading import Thread
import json
import requests

try:
    from Queue import Queue, Empty
except ImportError:
    from queue import Queue, Empty
ON_POSIX = 'posix' in sys.builtin_module_names

def enqueue_output(src, out, queue):
    for line in iter(out.readline, b''):
        queue.put((src, line))
    out.close()

cmd = ['/usr/local/bin/rtl_433', '-f', '319500000', '-R', '100', '-F', 'json']
p = Popen(cmd, stdout=PIPE, stderr=STDOUT, bufsize=1, close_fds=ON_POSIX)
q = Queue()

t = Thread(target=enqueue_output, args=('stdout', p.stdout, q))

t.daemon = True
t.start()

headers = {'Content-Type': 'application/json'}

pulse = 0
rawMessage = ''
while True:
    try:
        src, line = q.get(timeout = 1)
    except Empty:
        pulse += 1
    else: #got line
        decodedString = line.decode('utf-8')
        
        if ( decodedString.startswith('{') ):
            decodedJSON = json.loads(decodedString)
            
            if (decodedJSON["raw_message"] != rawMessage):
                rawMessage = decodedJSON["raw_message"]
                print(decodedString)
                print(rawMessage)
                requests.post('http://192.168.1.8:3000/emit', decodedString, headers=headers)
    
    sys.stdout.flush()
