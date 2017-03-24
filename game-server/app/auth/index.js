/**
 * Created by Administrator on 2015/4/21.
 */

var _ = require('underscore');

var authConfig = require('../../config/auth.json'),
    Code = require('../../shared/code');

var exp = module.exports = {};

// load all third-party auth modules
var fs = require('fs'),
    path = require('path');

exp.modules = {};
exp.enabled = {};

var files = fs.readdirSync(__dirname + '/lib/modules').filter(function (file) {
    return (path.extname(file) === '.js' || path.extname(file) === '.jse');
});

var includeModules = files.map(function (fname) {
    return path.basename(fname, path.extname(fname));
});

for (var i = 0, l = includeModules.length; i < l; i++) {
    var name = includeModules[i];

    Object.defineProperty(exp, name, {
        get: (function (name) {
            return function () {
                var mod = this.modules[name] || (this.modules[name] = require('./lib/modules/' + name));
                this.enabled[name] = mod;
                return mod;
            }
        })(name)
    });
}

exp.authCheck = function (thirdPartyName, key, secret, uid, state, cb) {
    if (_.indexOf(includeModules, thirdPartyName) === -1) {
        console.log('authCheck module %s not found!', thirdPartyName);
        return cb(false, Code.CONNECTOR.INVALID_AUTH_TYPE);
    }
    // 检查是否开启
    var config = authConfig[thirdPartyName];
    if (!config || !config.enable) {
        console.log('authCheck module %s disabled', thirdPartyName);
        return cb(false, Code.CONNECTOR.AUTH_TYPE_DISABLED);
    }
    exp[thirdPartyName].authCheck(key, secret, uid, state, cb);
};