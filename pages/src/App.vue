<template>
  <div>
    <router-view></router-view>
    <div class="loading-mask" v-show="loading"></div>
  </div>
</template>

<script>
import Hello from './components/Hello.vue'
import Group from 'vux/components/group'
import Cell from 'vux/components/cell'
import DateTime from 'vux/components/datetime'
import global from './global'
import store from './vuex/store'
import { loadDevices, updateGPS, outdateGPS } from './vuex/actions'
export default {
  components: {
    Hello, Group, Cell, DateTime
  },
  store: store,
  data() {
    return {
      serverUrl: ''
    }
  },
  vuex: {
    getters: {
      logined: state => state.logined,
      loading: state => state.loading,
      devices: state => state.devices
    },
    actions: {
      loadDevices,
      updateGPS,
      outdateGPS
    }
  },
  watch: {
    'logined': function(val) {
      if(val) {
        this.loadData();
      }
    }
  },
  methods: {
    loadData() {
      this.$http.get(this.$root.serverUrl + '/devices').then(function(res) {
          console.log(res);
          var devices = [];
          if(res.data.entrySet) {
              res.data.entrySet.forEach(function(dev) {
                  devices.push(dev);
                  dev.gps = {};
                  dev.settings = {};
                  dev.location = '';
                  dev.power = 0;
                  dev.warnings = [];
                  dev.removing = false;
              });
          }
          this.outdateGPS();
          this.loadDevices(devices);
          this.queryGPS();
          this.querySettings();
          this.queryWarnings();
      }, this);
    },
    queryGPS() {
        var devIds = [];
        this.devices.forEach(function(dev) {
            devIds.push(dev.id);
        });
        this.$http.get(this.$root.serverUrl + '/gps', {
            devIds: devIds
        }).then(function(res) {
          if(res.data.status === 0) {
            this.updateGPS(res.data.entrySet);
            this.queryLocation();
          }
        }, this);
    },
    querySettings() {
      this.devices.forEach(function(dev) {
        this.$http.get(this.$root.serverUrl + '/additionals/' + dev.id, {

        }).then(function(res) {
          var ds099Params = res.data.entrySet[0].ds099Params.split(',');
          var ds099Admin = res.data.entrySet[0].ds099Admin.split(',');
          // this.parseSettings(ds099Params)
          dev.power = ds099Params[17];
          dev.settings = this.parseSettings(ds099Params);
          dev.settings.imei = dev.sign;
          dev.settings.sim = dev.sim;
          dev.settings.admin = ds099Admin[1];
        }, this);
      }, this);
    },
    queryWarnings() {
      this.devices.forEach(function(dev) {
        this.$http.get(this.$root.serverUrl + '/warnings/' + dev.id).then(function(res) {
            dev.warnings = res.data.entrySet.filter(function(w) {
              return w.devId === dev.id
            });
        }, this);
      }, this);
    },
    parseSettings(ds099Params) {
        // var ds099Params = settings.ds099Params.split(',');// "0000,A,,,,120.25.76.30,6050,E0800,0,0,60,1,0,5,0,0,22,98,0002,1,200,22.657952,114.043100,160523,173815,DS_008_P320_V20_008_20160518&"
        //["0000", "V", "", "", "", "120.25.76.30", "6050", "E0800", "0", "0", "20", "1", "0", "5", "0", "0", "16", "87", "0002", "3", "5", "0.000000", "0.000000", "0.000000", "0.000000", "0.000000", "0.000000", "0.000000", "0.000000", "0.000000", "0.000000", "160521", "213347", "DS_008_P320_V20_008_20160518&"]
        var gps = ds099Params[1]; //A: GPS, V: LBS,
        var timeZone = ds099Params[7];
        var LBS = ds099Params[8];
        var heartbeat = ds099Params[10]
        var waken = ds099Params[13];
        var power = ds099Params[17];
        var fenceType = +ds099Params[19];
        var count = (+ds099Params[20]) * 2;
        var points = fenceType === 3 ? ds099Params.slice(21, 21 + count) : [];
        var center = fenceType === 1 ? ds099Params.slice(21, 23) : [];
        if(+center[0] < +center[1]) {
          center.reverse();
        }
        var radius = fenceType === 1 ? ds099Params[20]: 0;
        var version = ds099Params[ds099Params.length - 1].replace('&', '');
        var bits = parseInt(ds099Params[18], 16).toString(2);
        var LED = bits[bits.length - 2] == "1";
        return {
          gps: gps,
          timeZone: timeZone,
          LBS: LBS,
          LED: LED,
          fence: {
            type: fenceType,
            points: points,
            center: center,
            radius: radius
          },
          heartbeat: heartbeat,
          waken: waken,
          power: power,
          version: version,
          password: ds099Params[0]
        };
        //状态标志:
        /*2字节16进制字符（0-9，A-F）
        第一字节：
        Bit7：备用
        Bit6：备用
        Bit5：=1 表示开启APP报警
        Bit4：=1 表示开启电话报警
        Bit3：=1表示开启短信报警
        Bit2：=1表示开启低电量报警
        Bit1：=1表示打开 LED
        Bit0：=1表示开启监听
        第二字节：备用*/
        var statusByte = ds099Params[18];
        
    },
    queryLocation() {
      this.devices.forEach(function(dev) {
        AMap.service('AMap.Geocoder', function() {//回调函数
            //实例化Geocoder
            var geocoder = new AMap.Geocoder();
            //TODO: 使用geocoder 对象完成相关功能
            var lnglatXY = [dev.gps.lng, dev.gps.lat];//地图上所标点的坐标
            geocoder.getAddress(lnglatXY, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    var address = result.regeocode.addressComponent;
                    var full = address.province + address.district + address.township + address.street + address.streetNumber;
                    dev.location = full;
                } else {
                   //获取地址失败
                }
            }); 
        });
      }, this)
    }
  },
  ready() {
    this.loadData();
    console.log('App ready');
      /*
       * 注意：
       * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
       * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
       * 3. 常见问题及完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
       *
       * 开发中遇到问题详见文档“附录5-常见错误及解决办法”解决，如仍未能解决可通过以下渠道反馈：
       * 邮箱地址：weixin-open@qq.com
       * 邮件主题：【微信JS-SDK反馈】具体问题
       * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
       */
      wx.config({
          debug: false,
          appId: 'wxf8b4f85f3a794e77',
          timestamp: 1464053651,
          nonceStr: 'Uan7eEuN6d06bdDf',
          signature: '5b74bb8affb108e5039df60d122357d4cf8a2841',
          jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'translateVoice',
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'playVoice',
            'onVoicePlayEnd',
            'pauseVoice',
            'stopVoice',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard'
          ]
      });
  }
}
</script>

<style>
html, body {
  height: 100%;
}
#app {
  height: 100%;
}
body {
  font-family: 微软雅黑, Helvetica, sans-serif;
  margin: 0;
  padding: 0;
}
.button {
  height: 47px;
  line-height: 47px;
  width: 80%;
  border-radius: 20px;
  text-align: center;
  background: #FEDA00;
  margin: 20px auto;
  font-weight: bold;
  font-size: 14px;
}
.button-revert {
  background: #fff;
  border: 1px solid #ececec;
}
.nav-bar {
  height: 45px;
  line-height: 45px;
}
.flex-box {
  display: flex;
}
.flex-item-fill {
  flex: 1;
}
.nav-bar .title {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}
.nav-bar{
  padding: 0 10px;
}
.nav-bar .fa {
  
}
.center {
  text-align: center;
}

.text-field {
    margin-bottom: 0;
    border-bottom: 1px solid #ececec;
    background: #fff;
    align-items: center;
}
.text-field input {
    display: block;
    width: 90%;
    padding-left: 0;
    padding-right: 0;
    border: none;
    outline: 0;
    padding: 26px 16px;
    font-size: 16px;
}
.text-field input:focus {
    border: none;
    -webkit-appearance: none;
}
.text-field input.icon {
    padding-left: 30px;
    margin-left: 12px;
}
.icon-mobile {
    background: url(/resources/images/phone_ico.jpg) no-repeat 0;
}
.icon-code {
    background: url(/resources/images/duanxin_ico.jpg) no-repeat 0;
}

.page-bottom {
  flex: 1;
  background: #FEDA00;
}
.page-bottom .button {
    margin-top: 30px;
}

.full-page {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
  .amap-touch-toolbar .amap-zoomcontrol {
      bottom: 140px;
  }
  .loading-mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10000;
    opacity: 0.4;
    background: #ececec url(/resources/images/loading.gif) no-repeat center;
  }
</style>
