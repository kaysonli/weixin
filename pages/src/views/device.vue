<template>
    <div class="full-page">
        <header class="toolbar flex-box">
            <div class="tool" v-touch:tap="setRegion">
                <div class="fa fa-map-signs"></div>
                <div class="tool-text">围栏</div>
            </div>
            <div class="tool" :class="{active: tab === 'track'}" v-touch:tap="viewPath">
                <div class="fa fa-paw"></div>
                <div class="tool-text">轨迹</div>
            </div>
            <div class="tool" v-touch:tap="viewAlarms">
                <div class="fa fa-warning"></div>
                <div class="tool-text">报警</div>
            </div>
            <div class="tool" :class="{active: tab === 'gps'}" v-touch:tap="realtimeGPS">
                <div class="fa fa-map-marker"></div>
                <div class="tool-text">实时定位</div>
            </div>
            <div class="tool" v-touch:tap="configure">
                <div class="fa fa-gear"></div>
                <div class="tool-text">设置</div>
            </div>
        </header>
        <router-view></router-view>
        <main>
            <div class="map" v-el:map></div>
            <div class="locate" v-touch:tap="setCenter">
            </div>
        </main>
        <footer class="map-views flex-box">
            <div v-for="item in mapViews" class="map-view" 
            @click="setView($index)"
            v-bind:class="{'active': ($index === active)}">{{item}}</div>
        </footer>
    </div>
</template>

<script>
import utils from './../utils.js';
export default {
    props: {
        devId: {
            type: Number
        },
        location: {
            type: Array
        }
    },
    vuex: {
        getters: {
            devices: state => state.devices,
            gpsInfo: state => state.gpsInfo,
            activeDevice: state => state.activeDevice
        }
    },
    route: {
        data(transition) {
            if(this.gpsInfo.length > 0) {
                this.initMap(this.activeDevice)
            }
            if(transition.from.path && transition.from.path.indexOf('range') > -1) {
                this.clearLayers();
            }
            transition.next();
        }
    },
    data() {
        return {
            tab: '',
            active: 1,
            rangeTab: 0,
            editing: false,
            mapViews: ['卫星图', '2D平面图', '3D俯视图'],
            map: null,
            mouseTool: null,
            satelliteLayer: null
        }
    },
    events: {
        'draw-start': function() {
            this.startDrawPolygon();
        },
        'draw-complete': function() {
            if(!this.mouseTool) {
                return;
            }
            var polygon = this.map.getAllOverlays('polygon')[0];
            var polyline = this.map.getAllOverlays('polyline')[0];
            var points = [];
            if(polygon) {
                var path = polygon.getPath();
                path.forEach(function(node) {
                    points.push([node.getLng(), node.getLat()]);
                });
            }
            console.log(points);
            this.mouseTool.close(false);
            if(this.circle) {
                this.circle.setMap(null);
            }
            if(polyline) {
                polyline.setMap(null);
            }
            this.postPolygonSettings(points.slice(0, points.length - 1));
        },
        'draw-cancel': function() {
            if(this.mouseTool) {
                this.mouseTool.close(true);
            }
        },
        'set-radius': function(radius) {
            var polyline = this.map.getAllOverlays('polyline')[0];
            var polygon = this.map.getAllOverlays('polygon')[0];
            if(polyline) {
                polyline.setMap(null);
            }
            if(polygon) {
                polygon.setMap(null);
            }
            this.drawCircle(radius);
            var mapCenter = this.map.getCenter();
            this.postCircleSettings([mapCenter.lng, mapCenter.lat], radius);
        },
        'timerange': function(range) {
            history.go(-1);
            var format = 'Y-m-d H:i:s';
            var start = utils.dateFormat(new Date(range.from), format);
            var end = utils.dateFormat(new Date(range.to), format);
            this.getHistoryGPS(this.$route.params.id, start, end);
            var lineArr = [ [ 114.050751, 22.666425 ], [ 114.066887, 22.645197 ], [ 114.05899, 22.611923 ], [ 114.024315, 22.588151 ], [ 113.992729, 22.599879 ], [ 113.992729, 22.633156 ], [ 114.050751, 22.666425 ] ];
            // this.drawPath(lineArr);
        }
    },
    watch: {
        'tab': function(val, oldVal) {
            if(!val) {
                clearInterval(this.gpsTimer);
            }
        },
        'gpsInfo': function(val) {
            if(val.length > 0) {
                this.initMap(this.activeDevice);
            }
        }
    },
    methods: {
        setCenter() {
            var dev = this.activeDevice;
            this.map.setCenter([dev.gps.lng, dev.gps.lat]);
        },
        setRegion() {
            this.tab = '';
            if(this.trackLine) {
                this.trackLine.setMap(null);
            }
            this.loadFencePath(this.activeDevice);
            this.$router.go(this.$route.path + '/range');
        },
        viewPath() {
            this.tab = 'track';
            this.$router.go(this.$route.path + '/track');
        },
        viewAlarms() {
            this.tab = '';
            this.$router.go('/warnings/' + this.$route.params.id);
        },
        realtimeGPS() {
            this.tab = 'gps';
            this.gpsTimer = setInterval(function() {
                this.$root.queryGPS();
            }.bind(this), 3000);
        },
        configure() {
            this.tab = '';
            this.$router.go('/settings');
        },
        setView(index) {
            this.active = index;
            if(index === 0) {
                this.satelliteLayer.show();
            } else {
                this.satelliteLayer.hide();
            }
        },
        goBack() {
            this.$router.go('/add');
        },
        drawCircle(radius, center) {
            if(!this.circle) {
                this.circle = new AMap.Circle({
                    center: center || this.map.getCenter(),
                    radius: radius, //半径
                    strokeColor: "#ececec", //线颜色
                    strokeOpacity: 1, //线透明度
                    strokeWeight: 0, //线粗细度
                    fillColor: "#333", //填充颜色
                    fillOpacity: 0.45//填充透明度
                });
                this.circle.setMap(this.map);
            } else {
                this.circle.setRadius(radius);
            }
        },
        startDrawPolygon() {
            var map = this.map;
            map.plugin(["AMap.MouseTool"], function() {
                var mouseTool = this.mouseTool = new AMap.MouseTool(map);
                mouseTool.polygon({
                    fillOpacity: 0,
                    strokeColor: '#f00',
                    fillColor: '#fff'
                });
            }.bind(this));
            AMap.event.addListener(map, 'draw', function(data) {
                console.log(data);
            }, this);
        },
        drawPolygon(points) {
            if(!this.polygon) {
                this.polygon = new AMap.Polygon({
                    path: points,          //设置线覆盖物路径
                    strokeColor: "#f00", //线颜色#FEDA00
                    strokeOpacity: 1,       //线透明度
                    strokeWeight: 2,        //线宽
                    fillOpacity: 0,
                    strokeStyle: "solid",   //线样式
                    strokeDasharray: [10, 5] //补充线样式
                })
            }
            this.polygon.setMap(this.map);
            this.polygon.setPath(points);
        },
        drawPath(lineArr) {
            if(!this.trackLine) {
                this.trackLine = new AMap.Polyline({
                    path: lineArr,          //设置线覆盖物路径
                    strokeColor: "yellow", //线颜色#FEDA00
                    strokeOpacity: 1,       //线透明度
                    strokeWeight: 5,        //线宽
                    strokeStyle: "solid",   //线样式
                    strokeDasharray: [10, 5] //补充线样式
                });
            }
            this.trackLine.setMap(this.map);
            this.trackLine.setPath(lineArr);
        },
        initMap(dev) {
            var center = [dev.gps.lng, dev.gps.lat];
            if(this.map) {
                this.map.setCenter(center);
                return;
            }
            var map = this.map = new AMap.Map(this.$els.map, {
                zoom: 14,
                center: center
            });
            var marker = new AMap.Marker({
                position: center,
                icon: '/resources/images/map_fanwei.png'
            });
            marker.setMap(map);
            var satellite = this.satelliteLayer = new AMap.TileLayer.Satellite();
            satellite.setMap(this.map);
            satellite.hide();
            map.plugin(["AMap.ToolBar"],function(){
                //加载工具条
                var tool = new AMap.ToolBar({
                    // offset: new AMap.Pixel(100,100)
                });
                map.addControl(tool);   
            });
        },
        loadFencePath(dev) {
            var fence = dev.settings.fence;
            var type = fence.type;
            if(type === 1) {
                this.drawCircle(fence.radius, fence.center);
            } else if(type === 3) {
                var points = [];
                for(var i = 0; i < fence.points.length; i+=2) {
                    points.push([fence.points[i], fence.points[i + 1]]);
                }
                points.push([fence.points[0], fence.points[1]]);
                this.drawPolygon(points);
            }
        },
        clearLayers() {
            if(this.trackLine) {
                this.trackLine.setMap(null);
            }
            if(this.circle) {
                this.circle.setMap(null);
            }
            if(this.polygon) {
                this.polygon.setMap(null);
            }
        },
        postPolygonSettings(points) {
            this.$http.post(this.$root.serverUrl + '/settings/region', {
                devId: this.activeDevice.id,
                devPwd: this.activeDevice.settings.password,
                points: points
            }).then(function(res) {

            }, this);
        },
        postCircleSettings(center, radius) {
            this.$http.post(this.$root.serverUrl + '/settings/circle', {
                devId: this.activeDevice.id,
                devPwd: this.activeDevice.settings.password,
                center: center,
                radius: radius
            }).then(function(res) {

            }, this);
        },
        getHistoryGPS(devId, start, end) {
            this.$http.get(this.$root.serverUrl + '/tracks/' + devId, {
                start: start, 
                end: end
            }).then(function(res) {
                if(res.data.status === -1) {
                    this.$router.go('/login');
                    return;
                }
                var path = [];
                if(res.data.entrySet) {
                    res.data.entrySet.forEach(function(point) {
                        path.push([point.lng, point.lat]);
                    });
                }
                this.drawPath(path);
            }, this);
        }
    },
    ready() {
        console.log('device ready');
    }
}
</script>
<style scoped>
    .toolbar,
    .map-views {
        background: #fff;
        opacity: 0.9;
        position: fixed;
        width: 100%;
    }
    .toolbar {
        height: 50px;
        align-items: center;
        justify-content: space-around;
        z-index: 1;
    }
    .tool {
        flex: 1;
        text-align: center;
        height: 100%;
        padding-top: 5px;
    }
    .tool .fa {
        color: #FEDA00;
        font-size: 18px;
    }
    .tool.active .fa {
        color: #fff;
    }
    .tool-text {
        font-size: 14px;
    }
    .map-views {
        height: 45px;
        bottom: 0;
        align-items: center;
        justify-content: space-around;
        z-index: 1000;
    }
    .map-view {
        height: 100%;
        line-height: 45px;
        flex: 1;
        text-align: center;
    }
    .active {
        background: #FEDA00;
    }
    main,
    .map {
        height: 100%;
    }
    main {
        position: relative;
    }
    .locate {
        position: absolute;
        left: 20px;
        bottom: 70px;
        height: 18px;
        width: 18px;
        background: url(/resources/images/map_dingwei.png) no-repeat;
        background-size: contain;
    }
</style>