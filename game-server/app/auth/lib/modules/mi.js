/**
 * Created by kilua on 2015-10-07.
 */

var crypto = require('crypto'),
    util = require('util');

var request = require('request');

var authConfig = require('../../../../config/auth.json')['mi'];

var exp = module.exports = {};

function getPlainText(appId, session, uid){
    //按字母顺序排序(不包含 signature),
    //排序后拼接成par1=val1&par2=val2&par3=val3
    //没有值的参数请不要参与签名
    var plainText = '';
    if(appId){
        plainText += util.format('appId=%s', appId);
    }
    if(session){
        plainText += util.format('&session=%s', session);
    }
    if(uid){
        plainText += util.format('&uid=%s', uid);
    }
    return plainText;
}

function sign(algorithm, encryptKey, plainText){
    var encoder = crypto.createHmac(algorithm, encryptKey);
    encoder.update(plainText);
    return encoder.digest('hex');
}

exp.authCheck = function(key, secret, uid, state, cb){
    uid = uid.replace('mi_', '');
    var qs = {appId: "2882303761517359048", session: state, uid: uid, signature: sign('sha1', authConfig.appSecret,
        getPlainText("2882303761517359048", state, uid))};
    console.log('authCheck url = %s, qs = %j', authConfig.url, qs);
    request({url: authConfig.url, qs: qs}, function(err, response, body){
        if(err){
            console.log(err);
            return cb(false);
        }
        console.log('get response: ' + response.statusCode);
        if(response.statusCode !== 200){
            return cb(false);
        }
        console.log(body);
        try {
            var res = JSON.parse(body);
            cb(res.errcode === 200, res.errcode);
        }catch (ex){
            cb(false);
        }
    });
};