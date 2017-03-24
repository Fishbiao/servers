/**
 * Created by kilua on 2015-10-05.
 */

var request = require('request');

var authConfig = require('../../../../config/auth.json')['i4'];

var exp = module.exports = {};

exp.authCheck = function(key, secret, uid, state, cb){
    var qs = {token: state};
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
            cb(res.status === 0, res.status, res.username);
        }catch (ex){
            cb(false);
        }
    });
};