const wmpfVoip = requirePlugin('wmpf-voip').default
import {
  CallPagePlugin,
  CameraStatus
} from '../../const.js'
Page({
  data: {
    caller: {
      nickname: '',
      openid: ''
    },
    listener: {
      nickname: '',
      openid: ''
    }
  },
  onLoad(options) {
     this.login()
     this.authVoipList()
  },
  async login(){
    wx.login({
      success: res => {
          if (res.code) {
             console.log(res.code,333)
          }  
  } })
  },
  async authVoipList(){

    wx.getDeviceVoIPList({
      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log(res)
      }
    })
    await wmpfVoip.getIotBindContactList({
      sn: '',
      model_id: '',
      openid_list: [''], // 传入需要验证的openid列表
    })
    .then(res => {
      console.log(`[getIotBindContactList]:`, res.contact_list)
      // [{sn: 'xxx', model_id: 'xxx', status: 0}]
      // status: 0/未授权；1/已授权
      wx.showToast({
        title: '授权成功',
        icon: 'success'
      })
    })
  },
  async startCommunication() {
    const that = this

    try {
      // 2.4.0 以下版本 roomId 为 groupId
      const { roomId, isSuccess } = await wmpfVoip.initByCaller({
        caller: {
          id: '', // 设备 SN
          // 不支持传 name，显示的是授权时「deviceName」+「modelId 对应设备型号」
          cameraStatus: CameraStatus.OPEN,
        },
        listener: {
          // 参见 https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html 获取
          id: '',// 接听方 用户 openId
          name: '', // 接听方名字，仅显示用
          cameraStatus: CameraStatus.OPEN,
        },
        roomType: 'video', // 房间类型。voice: 音频房间；video: 视频房间
        businessType: 1, // 1 为设备呼叫手机微信
        // voipToken: 'xxxxxxxxxx', // 使用设备认证 SDK 注册的设备传入 deviceToken，使用 WMPF RegisterMiniProgramDevice 接口注册的设备无需传入（插件 2.3.0 支持）
        miniprogramState: 'developer' // 指定接听方使用的小程序版本
      })

      if (isSuccess) {
        // 如果小程序启动直接进入插件页面，则不要调用 wx.redirectTo
        wx.redirectTo({ url: CallPagePlugin })
        console.warn('呼叫成功')
      } else {
        wx.showToast({
          title: '呼叫失败',
          icon: 'error'
        })
      }
    } catch (e) {
      // 参数错误的情况会通过异常抛出
      console.log(e)
      wx.showToast({
        title: '呼叫失败',
        icon: 'error'
      })
    }
  },

  authVoIP() {
    wx.requestDeviceVoIP({
      sn: '', // Todo 向用户发起通话的设备 sn（需要与设备注册时一致），需要提前准备
      snTicket: '', // 获取的 snTicket
      modelId: '', // 「设备接入」从微信公众平台获取的 model_id
      deviceName: '', // 设备名称，用于授权时显示给用户
      success(res) {
        console.log(`requestDeviceVoIP success:`, res)
      },
      fail(err) {
        console.error(`requestDeviceVoIP fail:`, err)
      }
    })
  }
})