服务器部分代码 用python编写
用到了flask框架 其实 flask在这里用处不大，只是为了可以通过http获取到最后一次坐标。
如果没这个需求 就用简单的mqtt就好
注意看注释

```
#!/usr/bin/python
# -*-coding:utf-8 -*-

import hashlib
import json
import os
import time

import eventlet
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_cors import CORS
eventlet.monkey_patch()

os.environ["LANG"] = "en_US.UTF-8"
import requests
from flask import Flask, request

app = Flask(__name__)
app.config['MQTT_BROKER_URL'] = 'your mqtt url'
app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_KEEPALIVE'] = 60
app.config['MQTT_USERNAME'] = 'xxxx'
app.config['MQTT_PASSWORD'] = 'xxxx'
##跨域设置
CORS(app)
mqtt = Mqtt(app)
socketio = SocketIO(app)

thedata = {}

@socketio.on('publish')
def handle_publish(json_str):
    data = json.loads(json_str)


@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    mqtt.subscribe('/gps/P/#')

countSent = 0
type = 1
@mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    global thedata
    global countSent
    global type

    if message.payload.decode().find('rrpc') != -1:
        ##如果收到基站定位信息
        data = message.payload.decode().split(",")
        # print('message.payload.decode()', data)
        if len(data) == 4:
            # thedata = {'type': 1, 'lng': data[2], 'lat': data[3]}

            mqtt.publish('/gps/P/yourdeviceid', '%s;%s;0'%(data[2],data[3]))


    elif message.payload.decode()[:9] != "searching":
        ##如果gps信号正常
        try:
            data = message.payload.decode().split(";")

            if thedata.get("lng") == None:
                thedata = {'type': type, 'lng': data[0], 'lat': data[1]}
            else:
                # print('2',round(float(data[0])-float(thedata['lng']),6))
                if int(data[2]) == 0:
                    # 如果是用基站定位
                    type = 2
                    thedata = {'type': type, 'lng': data[0], 'lat': data[1]}
                else:
                    type = 1
                    thedata = {'type': type, 'lng': data[0], 'lat': data[1]}
        except Exception as e:
            print(e)
        # print(data[0],data[1])
    else:
        ##如果gps没有找到卫星 就让4G模块把基站定位发过来
        if countSent == 0:
            mqtt.publish('/gps/R/yourdeviceid', 'rrpc,getlocation')
        countSent += 1
        if countSent == 20:
            countSent = 0

@mqtt.on_log()
def handle_logging(client, userdata, level, buf):
    l = level ##没用的代码
@app.route('/', methods=['GET'])
def index():
    global thedata
    return json.dumps(thedata)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3456, use_reloader=True, debug=True)

```
