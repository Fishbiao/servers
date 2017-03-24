/**
 * Created by Administrator on 2015/4/21.
 */
var request = require('request');

var crypto = require('crypto');

var authConfig = require('../../../../config/auth.json')['4399'];

var exp = module.exports = {};

// 签名方法
function sign(key, secret, uid, state){
    var hash = crypto.createHash(authConfig.algorithm);
    hash.update(key);
    hash.update(uid);
    hash.update(state);
    hash.update(secret);
    return hash.digest('hex');
}

exp.authCheck = function(key, secret, uid, state, cb){
    var qs = {key: '', uid: uid, state: state, sign: sign('', '', uid, state)};
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
            cb(res.code === "100");
        }catch (ex){
            cb(false);
        }
    });
};

