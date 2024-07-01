const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const authorizeDB = db.collection('authorize')
const userDB = db.collection('user')
const command = db.command

const ERRCODE = {
  ALREADY_AUTHORIZE: 1,
}

const ERRMSG = {
  [ERRCODE.ALREADY_AUTHORIZE]: '无需重复授权',
}

const updateUser = async ({ openid, name }) => {
  const resp = await userDB.where({ openid }).get()
  const user = resp.data[0]
  if (!user) {
    await userDB.add({ data: { openid, name } })
  }
  return
}

const authorize = async ({ sn, openid, name }) => {
  console.log(`sn: ${sn}, openid: ${openid} name: ${name}`)
  const contact = { openid, name }
  await updateUser({ openid, name })
  const resp = await authorizeDB.where({ sn }).get()
  const info = resp.data[0]
  if (!info) {
    await authorizeDB.add({
      data: { sn, contactList: [contact], pushToken: '' },
    })
  } else {
    const existItem = info.contactList.find((item) => item.openid === openid)
    if (existItem) {
      return {
        errCode: ERRCODE.ALREADY_AUTHORIZE,
        errMsg: ERRMSG[ERRCODE.ALREADY_AUTHORIZE],
      }
    }
    await authorizeDB.where({ sn }).update({
      data: { contactList: command.addToSet(contact) },
    })
  }
  return {}
}

const getContactList = async ({ sn, openid }) => {
  console.log(`sn`, sn)
  if (!sn) {
    const { data } = await authorizeDB
      .where({
        contactList: command.elemMatch({ openid }),
      })
      .get()
    console.log(data)
    return data
  } else {
    const { data } = await authorizeDB.where({ sn }).get()
    if (data[0]) {
      return data[0].contactList
    } else {
      return []
    }
  }
}

const updatePushToken = async ({ sn, pushToken }) => {
  console.log(`sn ${sn}, pushToken: ${pushToken}`)
  const resp = await authorizeDB.where({ sn }).get()
  const info = resp.data[0]
  if (!info) {
    await authorizeDB.add({
      data: { sn, contactList: [], pushToken },
    })
  } else {
    await authorizeDB.where({ sn }).update({
      data: { pushToken },
    })
  }
  return {}
}

const getUser = async ({ openid }) => {
  const resp = await userDB.where({ openid }).get()
  const user = resp.data[0]
  if (user) return { name: user.name, openid: user.openid }
  return {
    openid,
    name: 'default',
  }
}

const getSnTicket = async ({ sn, modelId }) => {
  const snResp = await cloud.openapi.device.getSnTicket({
    sn,
    model_id: modelId,
  })
  return { snTicket: snResp.snTicket }
}

module.exports.main = (reqData) => {
  const data = reqData.data || {}
  const { OPENID } = cloud.getWXContext()
  switch (reqData.apiName) {
    case 'getSnTicket':
      return getSnTicket(data)
    case 'authorize':
      return authorize({ sn: data.sn, openid: OPENID, name: data.name })
    case 'getContactList':
      return getContactList({ sn: data.sn, openid: OPENID })
    case 'updatePushToken':
      return updatePushToken({ sn: data.sn, pushToken: data.pushToken })
    case 'getUser':
      return getUser({ openid: OPENID })
    default:
      return {}
  }
}
