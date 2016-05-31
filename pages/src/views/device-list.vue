<template>
    <div class="device-list" v-el:container>
        <confirm title="提示" message="确定删除设备吗？" v-ref:confirm>
        </confirm>
        <div class="button" v-touch:tap="addDevice">新建宠觅</div>
        <div class="item-list">
            <div class="item" v-for="dev in devices" 
                v-bind:class="{'removing': dev.removing}"
                v-touch:tap="viewDeviceInfo(dev, $event)" 
                v-touch-options:swipe="{ direction: 'horizontal', threshold: 5}"
                v-touch:swipe.stop="onSwipe(dev, $event)">
                <div class="map" id="map-{{dev.id}}"></div>
                <div class="item-info">
                    <header>
                        <div class="name">{{dev.name}}</div>
                        <div class="warnings" v-show="dev.warnings.length > 0"></div>
                        <div class="battery"><i class="fa fa-battery-{{dev.power | battery}}"></i></div>
                    </header>
                    <div class="status">
                        <div v-if="dev.status==='off'" class="off">
                            <i class="fa fa-minus-circle"></i><span>离线</span>
                        </div>
                        <div v-if="dev.status==='on'" class="on">
                            <i class="fa fa-check-circle"></i>
                            <span>在线</span>
                        </div>
                    </div>
                    <div class="location flex-box">
                        <i class="fa fa-map-marker"></i>
                        <span>{{dev.location}}</span>
                    </div>
                    <div class="time">
                        <i class="fa fa-clock-o"></i>
                        <span>上次上线：</span>
                        <time>{{dev.gps.dt_gps}}</time>
                    </div>
                </div>
                <div class="btn-remove" v-touch:tap.stop="removeDevice(dev, $index, $event)">
                    <span>删除设备</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {deleteDevice, updateActiveDevice} from '../vuex/actions'
import confirm from '../components/Confirm.vue';
export default {
    components: {
        confirm
    },
    vuex: {
        getters: {
            devices: state => state.devices,
            gpsInfo: state => state.gpsInfo,
            logined: state => state.logined
        },
        actions: {
            deleteDevice,
            updateActiveDevice
        }
    },
    data() {
        return {
            showModal: true,
            maps: {}
        }
    },
    watch: {
        'gpsInfo': function(val) {
            if(val) {
                this.initMaps();
            }
        },
        'logined': function(val) {
            if(val) {
                this.initMaps();
            }
        }
    },
    route: {
        data(transition) {
            if(this.gpsInfo.length > 0) {
                setTimeout(function() {
                    this.initMaps();
                }.bind(this), 0);
            }
            transition.next();
        }
    },
    events: {
        
    },
    methods: {
        addDevice() {
            this.$router.go('/add');
        },
        search() {

        },
        goHome() {
            this.$router.go('/home');
        },
        onSwipe(dev, evt) {
            dev.removing = evt.direction === 2;
        },
        viewDeviceInfo(dev, evt) {
            this.updateActiveDevice(dev);
            // this.$root.currentDevice = dev;
            this.$router.go({
                name: 'device-info',
                params: {
                    id: dev.id,
                    device: dev
                }
            });
        },
        removeDevice(dev, index, evt) {
            evt.srcEvent.stopPropagation();
            var me = this;
            setTimeout(function() {
                this.$refs.confirm.show(function(yes) {
                    if(yes) {
                        me.$http.delete(me.$root.serverUrl + '/devices/' + dev.id, {

                        }).then(function(res) {
                            me.deleteDevice(dev);
                        }, me);
                    }
                });
            }.bind(this), 50);
        },
        initMaps() {
            this.devices.forEach(function(dev) {
                 var content = document.createElement('div');
                content.innerHTML = '';
                content.className = 'map-marker';
                var id = 'map-' + dev.id;
                var el = document.getElementById(id);
                if(!this.maps[id]) {
                    this.maps[id] = new AMap.Map(el, {
                        zoom: 12,
                        center: [dev.gps.lng, dev.gps.lat]
                    });
                    var marker = new AMap.Marker({
                        position: [dev.gps.lng, dev.gps.lat],
                        color: 'red',
                        // content: content,
                        map: this.maps[id]
                    });
                }
                this.maps[id].setCenter([dev.gps.lng, dev.gps.lat]);
            }, this);
        }
    },
    ready() {
        document.title = '我的宠觅';
    }
}
</script>
<style scoped>
    .item-list {
        background: #ececec;
    }

    .item {
        margin-bottom: 10px;
        background: #fff;
        display: flex;
        padding: 10px;
        height: 150px;
        transition: left 0.2s;
        position: relative;
        left: 0;
        overflow: hidden;
    }

    .item .map {
        width: 100px;
        margin-right: 10px;
    }

    .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }

    .item-info header {
        display: flex;
    }

    .name {
        flex: 1;
        font-weight: bold;
        font-size: 20px;
    }

    .battery {
        width: 40px;
    }

    .fa {
        margin-right: 5px;
    }

    .on .fa {
        color: green;
    }
    .off .fa,
    .location .fa,
    .time {
        color: gray;
    }

    .fa-battery-0 {
        color: red;
    }

    .fa-battery-1 {
        color: brown;
    }

    .fa-battery-2 {
        color: orange;
    }

    .fa-battery-3,
    .fa-battery-4 {
        color: green;
    }
    
    .item.removing {
        left: -120px;
        overflow: visible;
    }
    .btn-remove {
        position: absolute;
        width: 120px;
        right: -240px;
        top: 0;
        height: 100%;
        background: #FEDA00;
        font-size: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: right 0.2s;
    }
    .removing .btn-remove {
        right: -120px;
    }
    .warnings {
        height: 25px;
        width: 25px;
        background: url(/resources/images/warning_ico.jpg) no-repeat center;
        margin-right: 10px;
    }

    .modal-footer {
        text-align: center;
    }
</style>