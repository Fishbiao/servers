/**
 * Created by Administrator on 2015/12/21 0021.
 */

var util = require('util');

var request = require('request'),
    _ = require('underscore'),
    utility = require('./helper/utility');

var authConfig = require('../../../../config/auth.json')['baidu'];

var exp = module.exports = {};

exp.authCheck = function(key, secret, uid, sid, cb){
    var accessToken = sid,
        appID = authConfig.appid,
        sign = utility.md5(appID + accessToken + authConfig.appsecret),
        data = {
        AppID: appID,
        AccessToken: accessToken,
        Sign: sign
    };
    data = require('querystring').stringify(data);
    var options={
        url: authConfig.url,
        method: 'POST',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": data.length
        },
        body: data
    };
    request(options, function(err, response, body){
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
            // 这里appID是数值，须转字符串再连接ResultCode，否则签名会不正确
            // 1 + 1 + '' 和 '1' + 1 + ''结果显然是不同的
            if(body && body.ResultCode === 1 && body.Sign === utility.md5(appID + '' + body.ResultCode + utility.UrlDecode(body.Content) + authConfig.appsecret)) {
                var base64Item = utility.base64ToString(utility.UrlDecode(body.Content));
                console.log(base64Item);
                var item =JSON.parse(base64Item);
                console.log(item.UID);
                cb(true, 0, item.UID);
            }else{
                cb(false);
            }
        }catch(ex){
            return cb(false);
        }
    });
};