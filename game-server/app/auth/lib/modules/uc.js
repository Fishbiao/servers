/**
 * Created by Administrator on 2015/10/26 0026.
 */

var request = require('request');

var crypto = require('crypto'),
    _ = require('underscore');

var util = require('util');

var authConfig = require('../../../../config/auth.json')['uc'];

var exp = module.exports = {};

// ǩ������
function sign(signContent){
    var hash = crypto.createHash(authConfig.algorithm);
    hash.update(signContent);
    return hash.digest('hex');
}

function getSignContent(data, apiKey){
    var keys = _.keys(data || {}) || [],
        content = '';
    // ���ֶ�����������
    keys.sort();
    // ��˳�򽫸����ֶ�ƴ��
    keys.forEach(function(key){
        // �ֶ������ֶ�ֵ��'='ƴ��
        content += util.format('%s=%s', key, data[key]);
    });
    // ƴ�� apiKey ���޳�'&'
    return (content + apiKey).replace('&', '');
}

function getUnixTimeStamp(curTick){
    return Math.round(curTick / 1000);
}

exp.authCheck = function(key, secret, uid, sid, cb){
    var data = {sid: sid},
        body = {
            id: getUnixTimeStamp(Date.now()),
            data: data,
            game: {gameId: authConfig.gameId},
            sign: sign(getSignContent(data, authConfig.apiKey))
        };
    console.log('authCheck url = %s, body = %j', authConfig.url, body);
    request({method: "POST", encoding: "utf-8", json: true, body: body, url: authConfig.url}, function(err, response, body){
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
            if(body && body.state) {
                cb(body.state.code === 1, body.state.code, body.data.accountId);
            }else{
                cb(false);
            }
        }catch (ex){
            cb(false);
        }
    });
};

