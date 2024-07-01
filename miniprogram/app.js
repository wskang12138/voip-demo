// app.js
import { isWmpf } from './const'
import { updatePushToken } from './api/index'
import { config } from './data/index'
const wmpfVoip = requirePlugin('wmpf-voip').default

wmpfVoip.onVoipEvent((event) => {
  console.log(`onVoipEvent`, event)
})

wmpfVoip.setVoipEndPagePath({
  url: '/pages/contactList/contactList',
  key: 'Call',
})

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init()
      wmpfVoip.setCustomBtnText('')
      if (isWmpf) {
        setTimeout(() => {
          wmpf.getWmpfPushToken({
            success: (resp) => {
              console.log(`getWmpfPushToken`, resp)
              updatePushToken({ sn: config.sn, pushToken: resp.token })
            },
            fail: (err) => {
              console.error(`getWmpfPushToken`, err)
            },
          })
        }, 1000)
      }
    }
  },
})
