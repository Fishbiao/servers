/**
 * Created by kilua on 2015-06-26.
 */

var url = require('url'),
    util = require('util'),
    crypto = require('crypto');
var request = require('request'),
    _ = require('underscore');

var dbClient = require('../dao/mysql/mysql'),
    serverInfoDao = require('../dao/serverInfoDao'),
    config = require('../config/order.json'),
    SHARE = require('../share'),
    dataApi = require('../dataApi');

var exp = module.exports = {};

function invokeGameServerCb(platform, ip, port, msg, cb){
    var qs = {  platform: platform,
                orderId: msg.orderId,
                uid: msg.uid,
                productId: msg.productId,
                serverId: msg.serverId,
                time: msg.time,
                sign: msg.sign,
                channel: msg.channel,
                innerOrderId: msg.innerOrderId},
        url = util.format('http://%s:%s/order', ip, port);
    console.log('invokeGameServerCb url = %s, qs = %j', url, qs);
    request({url: url, qs: qs}, function(err, response, body){
        if(err){
            console.error('invokeGameServerCb err = %s, orderId = %s', err.stack, msg.orderId);
            return cb(SHARE.STATUS.EXCEPTION, SHARE.CODE.OTHER_ERROR);
        }
        if(response.statusCode !== 200){
            console.error('invokeGameServerCb http error,code = %s', response.statusCode);
            return cb(SHARE.STATUS.FAILURE, SHARE.CODE.OTHER_ERROR);
        }
        console.log('invokeGameServerCb body = %j', body);
        var res;
        try {
            res = JSON.parse(body);
        }catch (ex){
            console.error('invokeGameServerCb ex = %s, orderId = %s', ex.stack, msg.orderId);
            return cb(SHARE.STATUS.EXCEPTION, SHARE.CODE.OTHER_ERROR);
        }
        cb(res.status, res.code);
    });
}

function getServerUserName(ifName, uid){
    var platformConf = dataApi.PlatformConfig.findBy('platform', ifName);
    if(!!platformConf && platformConf.length === 1){
        platformConf = platformConf[0];
    }else{
        return uid;
    }
    return util.format('%s%s', platformConf.prefix, uid);
}

function test_order_ios(platform, serverId, port, uid, receipt, cb)
{
    var res = {
       "receipt": {
           "original_purchase_date_pst": "2016-01-26 22:55:17 America/Los_Angeles",
           "purchase_date_ms": "1453877717535",
           "unique_identifier": "a3884f56343aa36e0df5ff73a2e85f6062094a8b",
           "original_transaction_id": "1000000190925480",
           "bvrs": "1.0.0",
           "transaction_id": "1000000190925480",
           "quantity": "1",
           "unique_vendor_identifier": "8CC11AB7-2A55-4F64-A794-591051A88D44",
           "item_id": "1078514907",
           "product_id": "hlz_30diamondproduct",
           "purchase_date": "2016-01-27 06:55:17 Etc/GMT",
           "original_purchase_date": "2016-01-27 06:55:17 Etc/GMT",
           "purchase_date_pst": "2016-01-26 22:55:17 America/Los_Angeles",
           "bid": "com.t1gamer.tszn",
           "original_purchase_date_ms": "1453877717535"
       }, "status": 0
    };
    var ressult = res.receipt;
    var msg = {orderId: Date.now(), uid: uid, productId: ressult.product_id,
        serverId: serverId, time: Date.now(), channel: 'app store'};

    serverInfoDao.getServerInfoByID(dbClient, serverId || 0, function(err, server){
        if(server){
            invokeGameServerCb(platform, server.IP, port, msg, function(status, code){
                return cb(status);
            });
        }else{
            return cb(SHARE.STATUS.FAILURE);
        }
    });
};

/*
* platform:  平台标识
* serverId:  游戏服务器id
* port:      充值端口
* uid:       唯一id （可以理解为玩家账号唯一标识）
* money:     充值金额(可以通过productid获得)
* receipt:   支付收据
* cb:        回调
* */
function order_ios(platform, serverId, port, uid, receipt, cb){
    request({
            method: 'POST',
            uri: 'https://sandbox.itunes.apple.com/verifyReceipt',
            body: JSON.stringify({
                'receipt-data': receipt
            })
        },
        function(err, response, body){
            console.log(' https://sandbox.itunes.apple.com/verifyReceipt  --appStror callBack data-- err : %s ,response : %j, body : %j ', err,response,body);
            if(err){
                console.error('order_ios err = %s, receipt = %s', err.stack, receipt);
                return cb(SHARE.STATUS.EXCEPTION);
            }
            if(response.statusCode !== 200){
                console.error('order_ios http error,code = %s', response.statusCode);
                return cb(SHARE.STATUS.FAILURE);
            }
            console.log('order_ios body = %s', body);
            var res, ressult;
            try {
                res = JSON.parse(body);
            }catch (ex){
                console.error('order_ios ex = %s, orderId = %s', ex.stack, msg.orderId);
                return cb(SHARE.STATUS.EXCEPTION);
            }
            ressult = res.receipt;
            if(res.status !== 0 || !ressult){
                console.error('res.status !== 0 || !ressult');
                return cb(SHARE.STATUS.FAILURE);
            }

            var msg = {    orderId: ressult.transaction_id,
                            uid: uid,
                            productId: ressult.product_id,
                            serverId: serverId,
                            time: Date.now(),
                            channel: 'app store'
                        };
            // 调用回调
            serverInfoDao.getServerInfoByID(dbClient, serverId || 0, function(err, server){
                if(server){
                    invokeGameServerCb(platform, server.IP, port, msg, function(status, code){
                        return cb(status);
                    });
                }else{
                    return cb(SHARE.STATUS.FAILURE);
                }
            });
        }
    );
}

exp.order_default = function(req, res){
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query;

    //检查是否有服务器存在
    serverInfoDao.getServerInfoByID(dbClient, msg.serverId || 0, function(err, server){
        console.log("server=%j",server);
        if( server ){
            var msgs = {
                orderId: msg.orderId,
                uid:"default_"+msg.uid,
                productId: msg.productId,
                serverId: msg.serverId,
                time: Date.now(),
                channel: msg.channel
            };
            invokeGameServerCb("default", server.IP, 3801, msgs, function(status, code){
                if( SHARE.STATUS.SUCCESS ==status ){
                    console.log('recharge success !!!');
                    return  res.send( 'success');
                }else{
                    console.log('recharge failure !!!');
                    return  res.send({result: 'failure'});
                }
            });
        }else{
            console.log('not found serverId = %s recharge failure !!!',markMsg.serverId );
            return res.send({result: 'failure'});
        }
    });
}

/*
* 国内ios
* */
exp.order_guonei_ios = function(req, res){
    var msg = req.body,
        ifConfig = config['guonei_ios'];
    console.log('order_guonei_ios msg = %j', msg);
    if (!ifConfig || !ifConfig.port) {
        console.error('order_guonei_ios port not configured');
        return res.send({result: 'failure'});
    }
    if (!ifConfig.enable) {
        console.info('order_guonei_ios disabled!');
        return res.send({result: 'failure'});
    }

    msg.uid = getServerUserName('guonei_ios', msg.uid);

    order_ios('guonei_ios', msg.serverId, ifConfig.port, msg.uid, msg.receipt, function(result){
        if(result === SHARE.STATUS.SUCCESS){
            res.send({result: 'success'});
        }else{
            res.send({result: 'failure'});
        }
    });
};

/*
* 泰奇- 国内- ios
* 合作商 - 区域 - 渠道
* */
exp.order_taiqi_guonei_ios = function (req,res) {
    var platformName = 'taiqi_guonei_ios';
    var funName = 'order_taiqi_guonei_ios';

    var msg = req.body,
        ifConfig = config[platformName];
    console.log('%s msg = %j',funName, msg);
    if (!ifConfig || !ifConfig.port) {
        console.error('%s port not configured',funName);
        return res.send({result: 'failure'});
    }
    if (!ifConfig.enable) {
        console.info('%s disabled!',funName);
        return res.send({result: 'failure'});
    }

    msg.uid = getServerUserName( platformName, msg.userId);

    //cp自己的信息
    var markMsg = JSON.parse(msg.markMsg);

    if(  200 != msg.respCode  ){
        console.info('taiqi respCode = %s  is error ',msg.respCode);
        return res.send({result: 'failure'});
    }
    //==================================================================================================================
    // 检查签名
    function sign(algorithm, msg, secret){
        var hash = crypto.createHash(algorithm);
        hash.update(util.format('%s', msg.transId));
        hash.update(util.format('%s', msg.markMsg));
        hash.update(util.format('%s', msg.respCode));
        hash.update(util.format('%s', msg.amount));
        hash.update(util.format('%s', msg.channelId));
        hash.update(util.format('%s', msg.userId));
        hash.update(util.format('%s', secret));
        return hash.digest('hex');
    }
    var signature = sign(ifConfig.algorithm, msg, ifConfig.secret);
    if( signature != msg.signature ){
        console.log( 'signature Failure taiqiSignature = %s , myselfSignature = %s ',msg.signature,signature);
        return res.send({result: 'signatureFailure'});
    }
    //==================================================================================================================

    //检查是否有服务器存在
    serverInfoDao.getServerInfoByID(dbClient, markMsg.serverId || 0, function(err, server){
        if( server ){
            var msgs = {
                    orderId: msg.transId,              //平台的订单号
                    uid: msg.uid,                      //平台账号uid
                    productId: markMsg.productId,    //cp数据
                    serverId: markMsg.serverId,      //cp数据
                    time: Date.now(),                  //cp数据
                    channel: platformName              //cp数据
            };
            invokeGameServerCb(platformName, server.IP, ifConfig.port, msgs, function(status, code){
                if( SHARE.STATUS.SUCCESS ==status ){
                    console.log('recharge success !!!');
                    return  res.send( 'success');
                }else{
                    console.log('recharge failure !!!');
                    return  res.send({result: 'failure'});
                }
            });
        }else{
            console.log('not found serverId = %s recharge failure !!!',markMsg.serverId );
            return res.send({result: 'failure'});
        }
    });

}

//泰奇  互动游戏
exp.order_taiqi_hudong_android = function(req,res){
    var platformName = 'taiqi_hudong_android';
    var funName = 'order_taiqi_hudong_android';

    var msg = req.body,
        ifConfig = config[platformName];
    console.log('%s msg = %j',funName, msg);
    if (!ifConfig || !ifConfig.port) {
        console.error('%s port not configured',funName);
        return res.send({result: 'failure'});
    }
    if (!ifConfig.enable) {
        console.info('%s disabled!',funName);
        return res.send({result: 'failure'});
    }

    msg.uid = getServerUserName( platformName, msg.userId);

    //cp自己的信息
    var markMsg = JSON.parse(msg.markMsg);

    if(  200 != msg.respCode  ){
        console.info('taiqi respCode = %s  is error ',msg.respCode);
        return res.send({result: 'failure'});
    }
    //==================================================================================================================
    // 检查签名 Md5(transId + markMsg + respCode + amount + channelId + userId + key)
    function sign(algorithm, msg, secret){
        var hash = crypto.createHash(algorithm);
        hash.update(util.format('%s', msg.transId));
        hash.update(util.format('%s', msg.markMsg));
        hash.update(util.format('%s', msg.respCode));
        hash.update(util.format('%s', msg.amount));
        hash.update(util.format('%s', msg.channelId));
        hash.update(util.format('%s', msg.userId));
        hash.update(util.format('%s', secret));
        return hash.digest('hex');
    }
    var signature = sign(ifConfig.algorithm, msg, ifConfig.key);
    if( signature != msg.signature ){
        console.log( 'signature Failure taiqiSignature = %s , myselfSignature = %s ',msg.signature,signature);
        return res.send({result: 'signatureFailure'});
    }
    //==================================================================================================================

    //检查是否有服务器存在
    serverInfoDao.getServerInfoByID(dbClient, markMsg.serverId || 0, function(err, server){
        if( server ){
            var msgs = {
                orderId: msg.transId,              //平台的订单号
                uid: msg.uid,                      //平台账号uid
                productId: markMsg.productId,    //cp数据
                serverId: markMsg.serverId,      //cp数据
                time: Date.now(),                  //cp数据
                channel: platformName              //cp数据
            };
            invokeGameServerCb(platformName, server.IP, ifConfig.port, msgs, function(status, code){
                if( SHARE.STATUS.SUCCESS ==status ){
                    console.log('recharge success !!!');
                    return  res.send( 'success');
                }else{
                    console.log('recharge failure !!!');
                    return  res.send({result: 'failure'});
                }
            });
        }else{
            console.log('not found serverId = %s recharge failure !!!',markMsg.serverId );
            return res.send({result: 'failure'});
        }
    });
}