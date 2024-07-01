# 小程序代码示例
  本项目是 [小程序硬件框架VoIP插件](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wxf830863afde621eb&token=290024359&lang=zh_CN#wmpf-voip-) 的示例代码。

# 快速开始
## 1. 安装
命令行输入：
```
npm install

```

## 3. 修改配置文件
1. 进入项目，打开文件 ```project.config.json```，修改 ```appid```。
2. 进入项目，打开文件 ```miniprogram/data/config.js```，修改 ```config``` ：
- sn: 真实的设备sn
- modelId: 真实的modelId

config 会在用户进行授权、拨打VoIP时传入。仅作为参考，开发者需要根据真实场景修改实现。

## 4. 体验
1. 用户微信打开小程序进入授权页面，在授权栏输入授权人昵称，点击授权。
2. 设备上安装WMPF，并打开小程序的通话页面即可拨打VoIP。

# 模块介绍

