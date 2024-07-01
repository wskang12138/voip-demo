import { isWmpf } from "../const"

const config = {
  sn: '',
  modelId: '',
}

if (isWmpf && !config.sn) {
  config.sn = wmpf.getDeviceSerialNumberSync().serialNumber
}

export default config
