var express = require('express');
var router = express.Router();
var jsSHA = require('jssha');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var token = "weixin";
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var echostr = req.query.echostr;
    var nonce = req.query.nonce;
    var arr = [nonce, timestamp, token];
    arr.sort();

    var original = arr.join('');
    var shaObj = new jsSHA(original, 'TEXT');
    var scyptoString = shaObj.getHash('SHA-1', 'HEX');
    if (scyptoString === signature) {
        res.send(echostr);
    } else {
        res.send('');
    }
});

module.exports = router;
