var express = require('express');
var router = express.Router();
var request = require('request-json');
var path = require('path');
var passport = require('passport');
var config = require('../config.js');
var moment = require('moment');

//国测局坐标(火星坐标,比如高德地图在用),百度坐标,wgs84坐标(谷歌国外以及绝大部分国外在线地图使用的坐标)
var coordtransform = require('coordtransform');
//百度经纬度坐标转国测局坐标
var bd09togcj02 = coordtransform.bd09togcj02(116.404, 39.915);
//国测局坐标转百度经纬度坐标
var gcj02tobd09 = coordtransform.gcj02tobd09(116.404, 39.915);
//wgs84转国测局坐标
var wgs84togcj02 = coordtransform.wgs84togcj02(116.404, 39.915);
//国测局坐标转wgs84坐标
var gcj02towgs84 = coordtransform.gcj02towgs84(116.404, 39.915);
console.log(bd09togcj02);
console.log(gcj02tobd09);
console.log(wgs84togcj02);
console.log(gcj02towgs84);

var serverUrl = config.serverUrl;
var appId = config.appId;
var appSecret = config.appSecret;
var SESSION_EXPIRED = -1;
var ERROR = -2;

function getUser(username, callback) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryUser",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            name: 'name',
            value: username
        }, {
            name: 'page',
            value: 0
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            if (error) {
                callback(null);
            } else {
                callback(body.entrySet ? body.entrySet[0] : null);
            }
        }
    );
}

router.get('/checkuser/:name', function(req, res, next) {
    getUser(req.params.name, function(user) {
        res.send(!!user);
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/login', passport.authenticate('local'), function(req, res, next) {
    res.send({
        status: 0
    });
});

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.send({
            status: SESSION_EXPIRED,
            message: '用户未登录'
        });
    }
};

router.get('/devices', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryDev",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{ "name": "userId", "value": req.user.id },
            { "name": "page", "value": "0" },
            { "name": "id", "value": "0" }
        ],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.post('/devices', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var name = req.body.name;
    var sim = req.body.sim;
    var imei = req.body.imei;
    var data = {
        "actionName": "ModifyDev",
        "appId": appId,
        "appSecret": appSecret,
        "entrySet": [{
            "name": name,
            "isDefault": 1,
            "note": '',
            "sim": sim,
            "sign": imei,
            "userId": req.user.id
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.delete('/devices/:id', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var devId = req.params.id;
    var data = {
        "actionName": "DeleteDev",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": 'id',
            "value": devId
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/additionals/:id', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryDevAdditionInfo",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": req.params.id
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/gps', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var paramsSet = [];
    if (req.query.devIds) {
        req.query.devIds.forEach(function(id) {
            paramsSet.push({
                name: 'devId',
                value: id
            });
        });
    }
    var data = {
        "actionName": "GPS",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": paramsSet,
        "status": 0,
        "timeStamp": 183727132
    }
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/warnings/:id', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryHistoryAlarm",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
                "name": "userId",
                "value": req.user.id
            },
            /*{
                       "name": "devId",
                       "value": req.params.id
                   }, */
            {
                "compare": "%3E%3D",
                "name": "dt_alarm",
                "value": moment().add(-7, 'days').format('YYYY-MM-DD 00:00:00')
            }
        ],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/tracks/:id', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "HistoryGPS",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": req.params.id
        }, {
            "name": "dt_start",
            "value": req.query.start
        }, {
            "name": "dt_end",
            "value": req.query.end
        }, {
            "name": "type",
            "value": "1"
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

function deviceSetting(cmd, devId, devPwd, params, res) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "DevCMD",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": devId
        }, {
            "name": "cmd",
            "value": cmd
        }, {
            "name": "param",
            "value": params + ',' + devPwd //value=2000,W,114.030324,22.628117,G,114.035407,22.625361,0000
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            queryCmdResult(body.paramsSet[0].value, function(result) {
                res.send(result);
            });
        }
    );
}

function queryCmdResult(index, callback) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryCmdResult",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "index",
            "value": index
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            callback(body);
        }
    );
}

function convertCoordinate(points) {
    var wgs84 = 'W,';
    var gcj02 = 'G,';
    for (var i = 0; i < points.length; i++) {
        var x = points[i][0],
            y = points[i][1];
        gcj02 += x + ',' + y + ','
        var p = coordtransform.gcj02towgs84(x, y);
        wgs84 += p[0] + ',' + p[1] + ','
    }
    gcj02 = gcj02.slice(0, gcj02.length - 1);
    return wgs84 + gcj02;
}

router.post('/settings/region', isAuthenticated, function(req, res, next) {
    var devId = req.body.devId;
    var devPwd = req.body.devPwd;
    var points = req.body.points;
    var params = points.length + ',' + convertCoordinate(points);
    var cmd = '311';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings/circle', isAuthenticated, function(req, res, next) {
    var devId = req.body.devId;
    var devPwd = req.body.devPwd;
    var center = req.body.center;
    var radius = req.body.radius;
    var params = radius + ',' + convertCoordinate([center]);
    var cmd = '750';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings/admin', function(req, res, next) {
    var devId = req.body.devId;
    var devPwd = req.body.devPwd;
    var params = req.body.params;
    var cmd = '710';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings/heartbeat', function(req, res, next) {
    var devId = req.body.devId;
    var params = req.body.params;
    var devPwd = req.body.devPwd;
    var cmd = '309';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings/changepwd', function(req, res, next) {
    var devId = req.body.devId;
    var params = req.body.params;
    var devPwd = req.body.devPwd;
    var cmd = '770';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings/timezone', function(req, res, next) {
    var devId = req.body.devId;
    var devPwd = req.body.devPwd;
    var params = req.body.params;
    var cmd = '313';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings/led', function(req, res, next) {
    var devId = req.body.devId;
    var devPwd = req.body.devPwd;
    var params = req.body.params;
    var cmd = '303';
    deviceSetting(cmd, devId, devPwd, params, res);
});

router.post('/settings', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var devId = req.params.devId;
    var option = req.params.option;
    var cmd = {
        uploadFreq: '309', //60s
        geoMode: '310', //0:GPS, 1: station,2:GPS+station
        timeZone: '313', //timezone, (direction:0=east|1=west, hour, minute)
        led: '303', //0=off, 1=on
        alarm: '307', //value=10000010,0000;value=11000010,0000;value=11000010,0000;value=11000000,0000
        waken: '620', //0,value,0000,
        region: '311' //设置不规则围栏范围，value=4,W,114.032061,22.632336,114.034529,22.627815,114.031213,22.622872,114.027641,22.625621,G,114.037148,22.629585,114.03962,22.625069,114.036298,22.620117,114.032719,22.622858,0000
    }
    var data = {
        "actionName": "DevCMD",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": devId
        }, {
            "name": "cmd",
            "value": "309"
        }, {
            "name": "param",
            "value": "90,0000"
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.post('/sms', function(req, res, next) {
    var client = request.createClient(serverUrl);
    var mobile = req.body.mobile;
    var data = {
        "actionName": "SMS",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "mobile",
            "value": mobile
        }, {
            "name": "type",
            "value": 0
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

//注册新用户
router.post('/users', function(req, res, next) {
    var client = request.createClient(serverUrl);
    var name = req.body.username;
    var password = req.body.password;
    var data = {
        "actionName": "AddUserEx",
        "appId": appId,
        "appSecret": appSecret,
        "entrySet": [{
            "addr": "",
            "devId": "",
            "mail": "",
            "mobilePhone": "",
            "name": name,
            "note": "",
            "phone": "",
            "pwd": password,
            "id": 0,
            "parentId": 0,
            "sex": 0,
            "userTypeId": 2
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.post('/users/resetpwd', function(req, res, next) {
    var username = req.body.mobile;
    var password = req.body.password;
    getUser(username, function(user) {
        if (user) {
            var client = request.createClient(serverUrl);
            var name = req.body.username;
            var password = req.body.password;
            var data = {
                "actionName": "ModifyUser",
                "appId": appId,
                "appSecret": appSecret,
                "entrySet": [{
                    "addr": "",
                    "devId": "",
                    "mail": "",
                    "mobilePhone": "",
                    "name": username,
                    "note": "",
                    "phone": username,
                    "pwd": password,
                    "id": user.id,
                    "parentId": 0,
                    "sex": 0,
                    "userTypeId": 2
                }],
                "status": 0,
                "timeStamp": 183727132
            };
            client.post('WebAPI.ashx/?=', data,
                function(error, response, body) {
                    console.log(error);
                    res.send({
                        status: error ? ERROR : 0,
                        user: body.entrySet
                    });
                }
            );
        } else {
            res.send({
                status: ERROR
            });
        }
    });
});



module.exports = router;
