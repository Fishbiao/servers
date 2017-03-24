/**
 * Created by Administrator on 2015/12/10 0010.
 */

var request = require('request');

var authConfig = require('../../../../config/auth.json')['m360'];

var exp = module.exports = {};

exp.authCheck = function(key, secret, uid, sid, cb){
    request({
        method: 'GET',
        url: authConfig.url,
        qs: {access_token: sid}
    }, function(err, response, body){
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
            if(body && body.name) {
                cb(true, 0, body.id);
            }else{
                cb(false);
            }
        }catch(ex){
            return cb(false);
        }
    });
};