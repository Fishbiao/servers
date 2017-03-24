/**
 * Created by Administrator on 2015/12/10 0010.
 */

var querystring = require('querystring');

var request = require('request');

var authConfig = require('../../../../config/auth.json')['huawei'];

var exp = module.exports = {};

exp.authCheck = function(key, secret, uid, sid, cb){
    request({
        method: 'GET',
        url: authConfig.url,
        qs: {
            nsp_svc: 'OpenUP.User.getInfo',
            nsp_ts: Math.floor(Date.now() / 1000),
            // java.net.URLEncoder.encode(access_token, 'utf-8').replace('+', '%2B');
            //access_token: querystring.escape(sid).replace('+', '%2B')
            access_token: sid
        }
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
            if(body && body.userID) {
                cb(true, 0, body.userID);
            }else{
                cb(false);
            }
        }catch(ex){
            return cb(false);
        }
    });
};