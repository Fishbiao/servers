/**
 * Created by kilua on 2015-06-26.
 */
var crypto = require('crypto'),
    util = require('util');

var request = require('request'),
    _ = require('underscore');

var myUtils = require('../mylib/utils/lib/utils');

function order_default() {
    function sign(algorithm, msg, secret) {
        var hash = crypto.createHash(algorithm);
        hash.update(msg.orderId);
        hash.update(msg.uid);
        hash.update(util.format('%s', msg.money));
        hash.update(msg.productId);
        hash.update(util.format('%s', msg.gameMoney));
        hash.update(util.format('%s', msg.serverId));
        hash.update(secret);
        hash.update(util.format('%s', msg.time));
        hash.update(msg.channel);
        return hash.digest('hex');
    }

    var algorithm = 'md5',
        secret = '8dd015062bd98a66b9d66c4bafd44737',
        host = '192.168.0.163',
        port = 3000,
        url = util.format('http://%s:%s/order_default', host, port),
        qs = {
            serverId: 10000,
            uid: '123456',
            productId: 'hlz_1monthproduct',
            orderId: util.format('%s', Date.now()), money: 60, gameMoney: 10000, time: Date.now(), channel: 'app store'
        };

    qs.sign = sign(algorithm, qs, secret);

    console.log('url = %s', url);
    request({url: url, qs: qs}, function (err, response, body) {
        if (err) {
            console.error('err = %s', err.stack);
        }
        console.log('statusCode = %s', response.statusCode);
        console.log('body = %j', body);
    });
}

function order_1sdk(){
    var algorithm = 'md5',
        secret = '16VSI8EPUV89VBC3QOT3FA7APAUNU01B',
        host = '192.168.1.150',
        port = 3000,
        url = util.format('http://%s:%s/order_1sdk', host, port),
        qs = {
            app: 'flyHero',
            cbi: JSON.stringify({"serverId": 1, "productId": "hlz_1monthproduct", "gameMoney": 10000}),
            ct: Date.now(),
            pt: Date.now(),
            sdk: '{F52F35C5-A04A1876}',
            st: 1,
            tcd: util.format('tcd_%s', Date.now()),
            ver: '1.0.0',
            uid: '123494',
            ssid: util.format('o%s', Date.now()), fee: 1
        };
    /*
     *   拼接签名内容
     * */
    function getSignContent(data, apiKey){
        var keys = _.keys(data || {}) || [],
            content = '';
        // 按字段名升序排列
        keys.sort();
        // 按顺序将各个字段拼接
        keys.forEach(function(key, idx){
            // 拼接'&'
            if(idx !== 0){
                content += '&';
            }
            // 字段名和字段值用'='拼接
            content += util.format('%s=%s', key, data[key]);
        });
        return (content + apiKey);
    }
    // 签名方法
    function sign(signContent){
        var hash = crypto.createHash(algorithm);
        hash.update(signContent);
        return hash.digest('hex');
    }
    qs.sign = sign(getSignContent(_.omit(qs, 'sign') || {}, secret));
    request({url: url, qs: qs}, function (err, response, body) {
        if (err) {
            console.error('err = %s', err.stack);
        }
        console.log('statusCode = %s', response.statusCode);
        console.log('body = %j', body);
    });
}

function order_tp_android(){
    // 生成待签名字符串
    function getSignContent(msg, secretKey){
        // sign 参数不参与签名
        var signMsg = _.omit(msg, 'sign'),
            signKeys = _.keys(signMsg),
            toSign = '';
        // 按 ASCII 码的增序排列
        signKeys.sort();
        _.each(signKeys, function(key){
            toSign += myUtils.trim(util.format('%s', signMsg[key]));
        });
        toSign += util.format('%s', secretKey);
        return toSign;
    }
    // 用md5计算签名
    function sign(signContent, algorithm){
        var hash = crypto.createHash(algorithm);
        hash.update(signContent);
        return hash.digest('hex');
    }
    var body = {
        time: Math.floor(Date.now() / 1000),
        orderId: util.format('o%s', Date.now()),
        roleid: 1,
        amount: 2,
        gamecoin: 3,
        coOrderId: 4,
        success: 1,
        gameid: 5,
        paytype: 1,
        ctext: new Buffer(JSON.stringify({serverId: 10000, productId: 'hlz_1monthproduct', gameMoney: 5})).toString('base64'),
        serverid: 10000,
        sdkuid: 10000
    };
    body.sign = sign(getSignContent(body, '8e81076a0290c9d51f5ca5442cd14b0b'), 'md5');
    request({
            method: 'POST',
            json: true,
            uri: 'http://localhost:3000/order_tp_android',
            body: body
        },
        function(err, httpResponse, body){
            if(err) {
                console.log('err = %s', err.stack);
            }else{
                console.log('body = %j', body);
            }
        }
    );
}

function order_tp_web(){
    // 生成待签名字符串
    function getSignContent(msg, secretKey){
        // sign 参数不参与签名
        var signMsg = _.omit(msg, 'sign'),
            signKeys = _.keys(signMsg),
            toSign = '';
        // 按 ASCII 码的增序排列
        signKeys.sort();
        _.each(signKeys, function(key){
            toSign += myUtils.trim(util.format('%s', signMsg[key]));
        });
        toSign += util.format('%s', secretKey);
        return toSign;
    }
    // 用md5计算签名
    function sign(signContent, algorithm){
        var hash = crypto.createHash(algorithm);
        hash.update(signContent);
        return hash.digest('hex');
    }
    var body = {
        user_id: 10000,
        game_id: 1,
        game_server_id: 10000,
        game_role_id: 2,
        order_id: util.format('o%s', Date.now()),
        game_coin: 3,
        pay_time: Math.floor(Date.now() / 1000),
        pay_result: 1,
        total_fee: 4
    };
    body.sign = sign(getSignContent(body, '8e81076a0290c9d51f5ca5442cd14b0b'), 'md5');
    request({
            method: 'POST',
            json: true,
            uri: 'http://localhost:3000/order_tp_web',
            body: body
        },
        function(err, httpResponse, body){
            if(err) {
                console.log('err = %s', err.stack);
            }else{
                console.log('body = %j', body);
            }
        }
    );
}

function gift_tp(){
    var ifConfig = {secretKey: '8e81076a0290c9d51f5ca5442cd14b0b', algorithm: 'md5', presentId: '1', presentKey: '2'};
    function calcSign(msg){
        // 生成待签名字符串
        function getSignContent(msg, secretKey){
            // sign 参数不参与签名
            var signMsg = _.omit(msg, 'sign'),
                signKeys = _.keys(signMsg),
                toSign = '';
            // 按 ASCII 码的增序排列
            signKeys.sort();
            _.each(signKeys, function(key){
                toSign += myUtils.trim(util.format('%s', signMsg[key]));
            });
            toSign += util.format('%s', secretKey);
            return toSign;
        }
        function getSignContentByPresentIdAndKey(msg, presentId, presentKey){
            var toSign = [presentId, util.format('%s', msg.s_id), util.format('%s', msg.is_all), util.format('%s', msg.uid),
                util.format('%s', msg.role_id), msg.pid, util.format('%s', msg.time), presentKey];
            return toSign.join('');
        }
        // 用md5计算签名
        function sign(signContent, algorithm){
            var hash = crypto.createHash(algorithm);
            hash.update(signContent);
            return hash.digest('hex');
        }
        if(msg.mode === 1){
            return sign(getSignContent(msg, ifConfig.secretKey), ifConfig.algorithm);
        }
        return sign(getSignContentByPresentIdAndKey(msg, ifConfig.presentId, ifConfig.presentKey), ifConfig.algorithm);
    }
    var msg = {uid: 10000, s_id: 10000, is_all: 1, pid: 1, title: '测试', content: '测试内容', mode: 2, role_id: 10000,
        singleno: Date.now(), time: Date.now()};
    msg.sign = calcSign(msg);
    request({
            method: 'POST',
            json: true,
            uri: 'http://localhost:3000/gift_tp',
            body: msg
        },
        function(err, httpResponse, body){
            if(err) {
                console.log('err = %s', err.stack);
            }else{
                console.log('body = %j', body);
            }
        }
    );
}

function gift_query_tp(){
    var msg = {singleno: 1454167880529, checktime: Date.now()};
    request({
            method: 'POST',
            json: true,
            uri: 'http://localhost:3000/gift_query_tp',
            body: msg
        },
        function(err, httpResponse, body){
            if(err) {
                console.log('err = %s', err.stack);
            }else{
                console.log('body = %j', body);
            }
        }
    );
}

function getPlayerInfo_tp(){
    // 生成待签名字符串
    function getSignContent(msg, secretKey){
        // sign 参数不参与签名
        var signMsg = _.omit(msg, 'sign'),
            signKeys = _.keys(signMsg),
            toSign = '';
        // 按 ASCII 码的增序排列
        signKeys.sort();
        _.each(signKeys, function(key){
            toSign += myUtils.trim(util.format('%s', signMsg[key]));
        });
        toSign += util.format('%s', secretKey);
        return toSign;
    }
    // 用md5计算签名
    function sign(signContent, algorithm){
        var hash = crypto.createHash(algorithm);
        hash.update(signContent);
        return hash.digest('hex');
    }
    var ifConfig = {secretKey: '8e81076a0290c9d51f5ca5442cd14b0b', algorithm: 'md5', presentId: '1', presentKey: '2'};
    var msg = {s_id: 10000, uid: 123494, time: Date.now()};
    msg.sign = sign(getSignContent(msg, ifConfig.secretKey), ifConfig.algorithm);
    request({
            method: 'POST',
            json: true,
            uri: 'http://localhost:3000/getPlayerInfo_tp',
            body: msg
        },
        function(err, httpResponse, body){
            if(err) {
                console.log('err = %s', err.stack);
            }else{
                console.log('body = %j', body);
            }
        }
    );
};

function order_guonei_ios (){
    var msg = {"userid":"510475",
        "platform_code":"guonei_ios",
        "serverId":10000,
        "receipt":"yuafdyuafdyaufdyqtwfeeyqef67gerf72rvgfyrvgh34frtyfru36r3r783f76rv3yrtf376rf346r7t36rtgf736rt376rt3rbvggvhgjszygfuuykr",
        "payment_time":"1474182767",
        "uid":"123456",
        "money":100,
        "orgUid":"ghafsfssyghah"
    };
    request({
            method: 'POST',
            json: true,
            uri: 'http://localhost:3000/order_guonei_ios',
            body: msg
        },
        function(err, httpResponse, body){
            if(err) {
                console.log('err = %s', err.stack);
            }else{
                console.log('body = %j', body);
            }
        }
    );
};

order_default();
//order_1sdk();
//order_tp_android();
//order_tp_web();
//gift_tp();
//gift_query_tp();
//getPlayerInfo_tp();
//order_guonei_ios();