const app = getApp()
import { $wuxNotification } from '../miniprogram_npm/wux-weapp/index'
var request = function(data, callback){
  wx.request({
    url: app.globalData.URL, //仅为示例，并非真实的接口地址
    method: 'post',
    data: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      't': app.globalData.t
    },
    success(res) {
      console.log(res.data.error)
      if (res.data.error == 0) {
        const hide = $wuxNotification().show({
          title: '提示',
          text: '操作成功',
          data: {
            message: ''
          },
          duration: 4000,
        })
        hide.then(() => console.log('success'))
        callback(res.data)
      }

    }
  })
}

module.exports = request
