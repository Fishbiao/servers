/**
 * Created by kilua on 2015-06-16.
 */

var crypto = require('crypto');

var authConfig = require('../../../../config/auth.json')['gameBoss'];

var exp = module.exports = {};

// 签名方法
function sign(user_id, android_id, secret, algorithm){
    var hash = crypto.createHash(algorithm);
    hash.update(user_id);
    hash.update(android_id);
    hash.update(secret);
    return hash.digest('hex');
}

exp.authCheck = function(android_id, secret, uid, session, cb){
    //var result = sign(uid, android_id, authConfig.secret, authConfig.algorithm);
    //cb((result === session));
    // 暂时不验证
    cb(true);
};