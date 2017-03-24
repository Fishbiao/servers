/**
 * Created by Administrator on 2015/12/8 0008.
 */

var util = require('util');

var request = require('request');

var authConfig = require('../../../../config/auth.json')['1sdk'],
    channelDict = require('../../../../config/1sdk_channel_dict.json');

var exp = module.exports = {};

exp.authCheck = function(key, secret, uid, sid, cb){
    var qs = {sdk: key, app: authConfig.app, uin: uid, sess: sid};
    request({method: "GET", encoding: "utf-8", url: authConfig.url, qs: qs}, function(err, response, body){
        if(err){
            console.log(err);
            return cb(false);
        }
        console.log('get response: ' + response.statusCode);
        if(response.statusCode !== 200){
            return cb(false);
        }
        console.log(body);

        if(body) {
            cb(body === '0', body, util.format('%s_%s', channelDict[key.toLowerCase().replace(/[{}-]/g, '')], uid));
        }else{
            cb(false);
        }
    });
};