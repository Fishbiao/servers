/**
 * Created by Administrator on 2015/12/9 0009.
 */

var util = require('util'),
    crypto = require('crypto');

var request = require('request'),
    _ = require('underscore');

var authConfig = require('../../../../config/auth.json')['oppo'];

var exp = module.exports = {};

//exp.authCheck = function(key, secret, uid, sid, cb){
//    var header = 'OAuth ',
//        fields = {
//            'oauth_consumer_key': authConfig['appkey'],
//            'oauth_nonce': _.random(0, Number.MAX_VALUE),
//            'oauth_signature_method': 'HMAC-SHA1',
//            'oauth_token': sid,
//            'oauth_timestamp': Math.floor(Date.now()),
//            'oauth_version': '1.0'
//        },
//        keys = _.keys(fields).sort(),
//        args = [],
//        headerArgs = [],
//        toSign,
//        signKey = [authConfig['appsecret'], key].join('&'),
//        sig;
//    keys.forEach(function(key){
//        args.push(util.format('%s%%3D%s', key, fields[key]));
//    });
//    toSign = ['POST', authConfig['url'], args.join('%26')].join('&');
//    sig = crypto.createHmac(authConfig['algorithm'], signKey).update(toSign).digest().toString('base64');
//
//    keys.forEach(function(key){
//        headerArgs.push(util.format('%s=\"%s\"', key, fields[key]));
//    });
//    header += headerArgs.join(',') + util.format(',oauth_signature=\"%s\"', sig);
//
//    request({method: "POST", url: authConfig.url, headers: {'Authorization': header}}, function(err, response, body){
//        if(err){
//            console.log(err);
//            return cb(false);
//        }
//        console.log('get response: ' + response.statusCode);
//        if(response.statusCode !== 200){
//            return cb(false);
//        }
//        console.log(body);
//        // 解析 body
//        try{
//            body = JSON.parse(body);
//            if(body && body.BriefUser) {
//                cb(true, 0, body.BriefUser.id);
//            }else{
//                cb(false);
//            }
//        }catch(ex){
//            return cb(false);
//        }
//    });
//};

/*
*   userData, '', MAC, state
* */
exp.authCheck = function(key, secret, uid, sid, cb){
    var params = {
        oauthConsumerKey: authConfig['appkey'],
        oauthToken: sid,
        oauthSignatureMethod: 'HMAC-SHA1',
        oauthTimestamp: Math.floor(Date.now() / 1000),
        oauthNonce: _.random(0, Number.MAX_VALUE),
        oauthVersion: '1.0'
    };

    function makeBaseStr(params){
        var orderedKeys = ['oauthConsumerKey', 'oauthToken', 'oauthSignatureMethod', 'oauthTimestamp', 'oauthNonce', 'oauthVersion'],
            args = [];
        orderedKeys.forEach(function(key){
            args.push(util.format('%s=%s', key, encodeURI(params[key])));
        });
        return args.join('&') + '&';
    }

    var ssoid = key,
        token = sid,
        signKey = authConfig['appsecret']+ '&',
        sig = crypto.createHmac(authConfig['algorithm'], signKey).update(makeBaseStr(params)).digest().toString('base64');
    request({method: "GET", url: util.format(authConfig.url, encodeURI(ssoid), encodeURI(token)),
        headers: {param: makeBaseStr(params), oauthSignature: encodeURI(sig)}}, function(err, response, body){
        if(err){
            console.log(err);
            return cb(false);
        }
        console.log('get response: ' + response.statusCode);
        if(response.statusCode !== 200){
            return cb(false);
        }
        console.log(body);
        // 解析 body
        try{
            body = JSON.parse(body);
            if(body && body.resultCode === '200' && body.ssoid === ssoid) {
                cb(true, 0, body.userName);
            }else{
                cb(false);
            }
        }catch(ex){
            return cb(false);
        }
    });
};