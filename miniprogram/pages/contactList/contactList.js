import { config } from '../../data/index'
import { getContactList, getDeviceVoIPList, getUser } from '../../api/index'
import {
  CameraStatus,
  AuthorizeStatus,
  CallPagePlugin,
  isWmpf,
} from '../../const.js'
import { AsyncValue } from '../../utils'

const wmpfVoip = requirePlugin('wmpf-voip').default
const envVersion = wx.getAccountInfoSync().miniProgram.envVersion

const apiTypes = ['校园模式', '硬件模式', '呼叫安卓', '校园+硬件模式']
const apiTypesWMPF = [1, 0, 3]
const apiTypesWechat = [2]

const getEnvVersionForVoip = (function () {
  const _map = {
    develop: 'developer',
    trial: 'trial',
    release: 'formal',
  }
  return () => {
    return _map[envVersion]
  }
})()

Page({
  data: {
    sn: config.sn,
    isShowPopUp: false,
    contactList: [],
    isWmpf,
    envVersion,
    apiTypesValid: (isWmpf ? apiTypesWMPF : apiTypesWechat).map((id) => apiTypes[id]),
    apiTypeIndex: 0
  },
  onLoad(options) {
    this._caller = new AsyncValue()
    console.info(`onLoad`, options)
    this.getSelf(options)
    this.getContactList()
  },
  async getSelf(options = {}) {
    if (!this._caller.isPending()) {
      return
    }
    if (isWmpf) {
      const { sn } = options
      if (sn) {
        config.sn = sn
        this.setData({sn})
      }
      this._caller.set({ id: config.sn, name: config.sn })
    } else {
      try {
        const resp = await getUser()
        console.log(`getUser`, resp)
        this._caller.set({ id: resp.openid, name: resp.name })
      } catch (error) {
        console.error(`getself error`, error)
      }
    }
  },
  async getContactList() {
    wx.showLoading()
    try {
      let contactList = []
      const raw_contactList = await getContactList({
        sn: isWmpf ? config.sn : null,
      })
      console.log(`raw_contactList`, raw_contactList)
      if (!isWmpf) {
        // 微信呼叫设备
        const { list } = await getDeviceVoIPList()
        contactList = raw_contactList.map(({ sn, pushToken }) => {
          let canCall = true
          if (typeof list === 'object') {
            const canCallList = list
              .filter((item) => item.status === AuthorizeStatus.ACCEPT)
              .map((item) => item.sn)
            canCall = canCallList.includes(sn)
          }
          return {
            id: sn,
            name: sn,
            canCall,
            ticket: pushToken,
          }
        })
      } else {
        // 设备呼叫微信
        const raw_contactList = await getContactList({ sn: config.sn })
        console.log(`raw_contactList: 业务方存储`, raw_contactList)
        if (raw_contactList.length > 0) {
          const canCallList = (
            await wmpfVoip.getIotBindContactList({
              sn: config.sn,
              model_id: config.modelId,
              openid_list: raw_contactList.map((item) => item.openid),
            })
          ).contact_list
            .filter((item) => item.status === AuthorizeStatus.ACCEPT)
            .map((item) => item.openid)
          console.log(`canCallList: 微信授权存储`, canCallList)
          contactList = raw_contactList.map((item) => {
            const canCall = canCallList.includes(item.openid)
            return { id: item.openid, name: item.name, canCall, ticket: '' }
          })
        }
      }
      console.log(`getContactList: `, contactList)
      this.setData({ contactList })
    } catch (error) {
      console.error(`getContactList error: `, error)
    }
    wx.hideLoading()
  },
  
  async call(e) {
    const { type: roomtype, idx } = e.currentTarget.dataset
    const target = this.data.contactList[idx]

    const apiTypeName = this.data.apiTypesValid[this.data.apiTypeIndex]
    const businessType = apiTypes.indexOf(apiTypeName)
    console.log('apiType:', apiTypeName)
    console.log('businessType:', businessType)

    try {
      if (!target.canCall) {
        wx.showToast({
          title: '用户未授权或设备不在线',
          icon: 'none',
        })
        throw Error('target can not call')
      }
      const _caller = await this._caller.get()
      console.log(`caller: `, _caller)
      console.log(`listener: `, target)
      const resp = await wmpfVoip.initByCaller({
        caller: {
          name: isWmpf ? '' : _caller.name,
          id: _caller.id,
          cameraStatus: CameraStatus.OPEN,
        },
        listener: {
          name: target.name,
          id: target.id,
          cameraStatus: CameraStatus.OPEN,
        },
        roomType: roomtype,
        voipToken: target.ticket,
        businessType,
        miniprogramState: getEnvVersionForVoip(),
      })
      if (resp.error) {
        console.error(`initByCaller`, resp)
        wx.showToast({ title: '拨打失败', icon: 'none' })
        return
      }
      wx.redirectTo({ url: CallPagePlugin })
    } catch (error) {
      console.error(`call error`, error)
    }
  },
  gotoAuth() {
    wx.navigateTo({
      url: '../index/index',
    })
  }
})
