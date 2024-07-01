const isWmpf = typeof wmpf !== 'undefined'

const CallPagePlugin =
  'plugin-private://wxf830863afde621eb/pages/call-page-plugin/call-page-plugin'

const CameraStatus = {
  OPEN: 0,
  CLOSE: 1,
}

const AuthorizeStatus = {
  REJECT: 0,
  ACCEPT: 1,
}

export { isWmpf, CallPagePlugin, CameraStatus, AuthorizeStatus }
