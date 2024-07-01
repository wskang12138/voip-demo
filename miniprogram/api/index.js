import { promisify } from '../utils'

const invokeCloudApi = (reqData, { showErrMsgToast = true } = {}) => {
  console.log(`invokeCloudApi: `, reqData)
  return new Promise((reslove, reject) => {
    wx.cloud.callFunction({
      name: 'authorize',
      data: reqData,
      success(resp) {
        if (resp.result.errCode && showErrMsgToast) {
          wx.showToast({
            title: resp.result.errMsg,
          })
        }
        reslove(resp.result)
      },
      fail(err) {
        console.log(err)
        reject(err)
      },
    })
  })
}

const ERRCODE = {
  ALREADY_AUTHORIZE: 1,
  NO_SUPPORT: 2,
}

const [getSnTicket, authorize, getContactList, updatePushToken, getUser] = [
  'getSnTicket',
  'authorize',
  'getContactList',
  'updatePushToken',
  'getUser',
].map((apiName) => {
  return (data) => {
    return invokeCloudApi({
      apiName,
      data,
    })
  }
})

/** 获取当前微信用户设备授权信息列表
 * 存在基础库版本要求，建议做兜底
 */
const getDeviceVoIPList = () => {
  if (typeof wx.getDeviceVoIPList !== 'function') {
    return { errCode: ERRCODE.NO_SUPPORT }
  } else {
    return promisify(wx.getDeviceVoIPList, {})
  }
}

export {
  getSnTicket,
  authorize,
  getContactList,
  updatePushToken,
  getDeviceVoIPList,
  getUser,
  ERRCODE,
}
