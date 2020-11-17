小程序 js代码
```
const app = getApp()
import {
  $wuxNotification
} from '../../miniprogram_npm/wux-weapp/index'
var util = require('../../utils/WSCoordinate.js')
var request = require('../../utils/http.js')
var mqtt = require('../../utils/mqtt.min.js') //根据自己存放的路径修改
var client = null;
var points = []
Page({
  data: {
    latitude: 0,
    longitude: 0,
    minscale: 10,
    markers: [{
      id: 0,
      latitude: 0,
      longitude: 0,
    }],
    polyline: [{
      points: [],
      color: "#ff6600",
      width: 2,
      dottedLine: false,
      arrowLine: true,
      borderColor: "#000",
      borderWidth: 5
    }]
  },
  onLoad: function (options) {
    this.connectMqtt()
  },
  connectMqtt: function () {
    const options = {
      connectTimeout: 4000, // 超时时间
      clientId: '123212',
      port: 8083, //重点注意这个,坑了我很久
      username: 'xxxxx',
      password: 'xxxxx',
    }

    client = mqtt.connect('wx://yoururl/mqtt', options)
    client.on('reconnect', (error) => {
      console.log('正在重连:', error)
    })

    client.on('error', (error) => {
      console.log('连接失败:', error)
    })

    let that = this;
    client.on('connect', (e) => {
      console.log('成功连接服务器')
      //订阅一个主题
      client.subscribe('/gps/P/#', {
        qos: 0
      }, function (err) {
        if (!err) {
          // client.publish('message.queue', 'Hello MQTT')
          console.log("订阅成功")
        }
      })
    })
    client.on('message', function (topic, message) {
      // console.log('received msg:' + message.toString());
      var datas = message.toString().split(';')
      if (datas.length == 3) {
        console.log('datas:' + datas[0], datas[1], points.length);
        var result = util.transformFromWGSToGCJ(parseFloat(datas[0]), parseFloat(datas[1]));
        if (points.length > 1000) {
          points.shift()
        }
        points.push({
          latitude: result['latitude'],
          longitude: result['longitude']
        })
        console.log('points', points)
        this.setData({
          latitude: result['latitude'],
          longitude: result['longitude'],
          markers: [{
            id: 0,
            latitude: result['latitude'],
            longitude: result['longitude'],
          }],
          polyline: [{
            points: points,
            color: "#ff6600",
            width: 2,
            dottedLine: false,
            arrowLine: true,
            borderColor: "#000",
            borderWidth: 5
          }]
        })

      }
    }.bind(this))

  },
})
```

wxml 部分代码

```
<wux-notification id="wux-notification" />
<view class="page">
  <view class="page__bd">
    <map id="map" markers="{{markers}}" latitude="{{latitude}}" longitude="{{longitude}}" style="width:100%;height:100vh;" min-scale="{{minscale}}" polyline="{{polyline}}" ></map>
  </view>
</view>
```

