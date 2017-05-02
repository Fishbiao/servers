/**
 * Created by kilua on 2016/5/31 0031.
 */

var util = require('util');

var dataApi = require('./dataApi');

var exp = module.exports = {};

exp.getServerUserName = function (ifName, uid) {
    var platformConf = dataApi.PlatformConfig.findBy('platform', ifName);
    if (!!platformConf && platformConf.length === 1) {
        platformConf = platformConf[0];
    } else {
        return uid;
    }
    return util.format('%s%s', platformConf.prefix, uid);
};