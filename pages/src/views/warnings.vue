<template>
  <div class="warning-page">
    <div class="device-warning">
      <div class="device-name">{{ deviceName }}</div>
      <div class="warning-info" v-for="warning in warnings">
        <div class="warning-icon warning-type-{{warning.status}}"></div>
        <div class="warning-detail">
          <div class="warning-name">{{warningType[warning.status]}}</div>
          <time>{{warning.dt_alarm}}</time>
        </div>
      </div>
    </div >
  </div>
</template>
<script>
  export default {
    data() {
      return {
        deviceName: '--',
        warningType: ['', 'SOS报警', '出围栏报警', '出围栏报警SOS报警'],
        warnings: [
          //   '245': [{
          //       "BLat": 22.6289082,
          //       "BLng": 114.0457,
          //       "dealNote": "",
          //       "dealStatus": 0,
          //       "devId": 245,
          //       "dt_alarm": "2016-05-21 20:58:00",
          //       "dt_deal": "2000-01-01 00:00:00",
          //       "id": 94099,
          //       "lat": 22.6257629,
          //       "lng": 114.0341,
          //       "speed": 0,
          //       "status": 2,
          //       "userId": 0
          //   }, {
          //     "BLat": 22.6289082,
          //     "BLng": 114.0457,
          //     "dealNote": "",
          //     "dealStatus": 0,
          //     "devId": 245,
          //     "dt_alarm": "2016-05-21 20:58:00",
          //     "dt_deal": "2000-01-01 00:00:00",
          //     "id": 94099,
          //     "lat": 22.6257629,
          //     "lng": 114.0341,
          //     "speed": 0,
          //     "status": 2, //1:SOS报警, 2:出围栏报警，3：出围栏报警SOS报警
          //     "userId": 0
          // }, {
          //     "BLat": 22.6289082,
          //     "BLng": 114.0457,
          //     "dealNote": "",
          //     "dealStatus": 0,
          //     "devId": 245,
          //     "dt_alarm": "2016-05-21 20:58:00",
          //     "dt_deal": "2000-01-01 00:00:00",
          //     "id": 94099,
          //     "lat": 22.6257629,
          //     "lng": 114.0341,
          //     "speed": 0,
          //     "status": 3, //1:SOS报警, 2:出围栏报警，3：出围栏报警SOS报警
          //     "userId": 0
          // }],
          // '33': [{
          //     "BLat": 22.6289082,
          //     "BLng": 114.0457,
          //     "dealNote": "",
          //     "dealStatus": 0,
          //     "devId": 33,
          //     "dt_alarm": "2016-05-21 20:58:00",
          //     "dt_deal": "2000-01-01 00:00:00",
          //     "id": 94099,
          //     "lat": 22.6257629,
          //     "lng": 114.0341,
          //     "speed": 0,
          //     "status": 1, //1:SOS报警, 2:出围栏报警，3：出围栏报警SOS报警
          //     "userId": 0
          // }]
        ]
      }
    },
    route: {
      data(transition) {
        this.queryWarnings(this.$route.params.id);
        var devices = this.devices || this.$root.devices;
        if(!devices) {
          this.queryDevices(function(devices) {
            this.setDeviceName(devices);
          }.bind(this));
        } else {
          this.setDeviceName(devices);
        }
      }
    },
    methods: {
      queryWarnings(devId) {
        this.$http.get(this.$root.serverUrl + '/warnings/' + devId).then(function(res) {
            if(res.data.status === -1) {
                this.$router.go('/login');
                return;
            }
            this.group(res.data.entrySet, this.$route.params.id);
        }, this);
      },
      group(items, devId) {
        var devices = {};
        var warnings = [];
        items.forEach(function(w) {
          if(+w.devId === +devId) {
            warnings.push(w);
          }
        }, this);
        this.warnings = warnings;
      },
      setDeviceName(devices) {
        for(var i = 0; i < devices.length; i++) {
          if(devices[i].id === +this.$route.params.id) {
            this.deviceName = devices[i].name;
            break;
          }
        }
      },
      queryDevices(callback) {
        this.$http.get(this.$root.serverUrl + '/devices').then(function(res) {
            console.log(res);
            if(res.data.status === -1) {
                this.$router.go('/login');
                return;
            }
            var devices = [];
            res.data.entrySet.forEach(function(dev) {
                devices.push(dev);
                dev.gps = {};
                dev.location = '';
                dev.power = 0;
                dev.removing = false;
            });
            this.devices = devices;
            if(callback) {
              callback(devices);
            }
          }, this);
        },
    },
    ready() {
      
    }
  }
</script>
<style>
  .device-name {
    color: #999;
    height: 42px;
    line-height: 42px;
    font-weight: bold;
    padding-left: 10px;
  }
  .warning-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .warning-icon {
    height: 138px;
    width: 120px;
  }
  .warning-type-1 {
    background: url(/resources/images/warn_1.jpg) no-repeat center center / 100% auto;
  }
  .warning-type-2 {
    background: url(/resources/images/warn_2.jpg) no-repeat center center / 100% auto;
  }
  .warning-type-3 {
    background: url(/resources/images/warn_3.jpg) no-repeat center center / 100% auto;
  }
  .warning-detail {
    flex: 1;
    padding-left: 20px;
  }
  .warning-name {
    font-weight: bold;
    margin-bottom: 10px;
  }
  time {
    color: #999;
    font-size: 14px;
  }
</style>