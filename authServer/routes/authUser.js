/**
 * Created by kilua on 2015-03-18.
 */
var crypto = require('crypto'),
    url = require('url');

var globalUserDao = require('../dao/globalUserDao'),
    dbClient = require('../dao/mysql/mysql'),
    Code = require('../shared/code'),
    token = require('../shared/token'),
    config = require('../config/config');


var exp = module.exports = {};
exp.auth = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        name = msg.name || '', pwd = msg.pwd || '';
    console.log('auth user = %s, pwd = %s', name, pwd);
    if (!name || !pwd) {
        return res.send({code: 500});
    }
    globalUserDao.getUserByName(dbClient, name, function (err, userInfo) {
        console.log('err; %s,userInfo: %s', err, userInfo);
        if (err) {
            return res.send({code: 501});
        }
        var md5Encoder = crypto.createHash('md5');
        md5Encoder.update(pwd);
        pwd = md5Encoder.digest('hex');
        if (userInfo) {
            // 验证密码
            if (userInfo.pwd !== pwd) {
                return res.send({code: 502});
            } else {
                return res.send({code: 200});
            }
        } else {
            // 注册
            globalUserDao.createUser(dbClient, name, pwd, function (err, success) {
                if (err) {
                    return res.send({code: 501});
                }
                if (!!success) {
                    return res.send({code: 200});
                } else {
                    return res.send({code: 503});
                }
            });
        }
    });
};

exp.authCheck = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        tokenStr = msg.token,
        timeout = 30 * 60 * 1000;
    console.log('authCheck token = %s', tokenStr);
    var result = token.parse(tokenStr, config.secret);
    if (result) {
        globalUserDao.getUserByName(dbClient, result.uid, function (err, userInfo) {
            if (err) {
                return res.send({code: Code.DB_ERR});
            }
            if (userInfo) {
                if (Date.now() - result.timestamp > timeout) {
                    return res.send({code: Code.TIME_OUT});
                }
                return res.send({code: Code.OK});
            } else {
                return res.send({code: Code.USER_NOT_EXIST});
            }
        });
    } else {
        return res.send({code: Code.TOKEN_ERROR});
    }
};


exp.register = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        name = msg.name || '', pwd = msg.pwd || '';
    console.log('register name = %s, pwd = %s', name, pwd);

    function containsInvalidChar(str) {
        return /[^0-9a-zA-Z@\.]/g.test(str);
    }

    if (containsInvalidChar(name)) {
        console.log('register invalid character found in name!');
        return res.send({code: Code.ERR});
    }
    //if(containsInvalidChar(pwd)){
    //    console.log('register invalid character found in pwd!');
    //    return res.send({code: 500});
    //}

    if (!(name.length >= 6 && name.length <= 18)) {
        console.log('register invalid name length %s!', name.length);
        return res.send({code: Code.ERR});
    }
    //if(!(pwd.length >= 6 && pwd.length <= 18)){
    //    console.log('register invalid pwd length %s!', pwd.length);
    //    return res.send({code: 500});
    //}

    globalUserDao.getUserByName(dbClient, name, function (err, userInfo) {
        if (err) {
            return res.send({code: Code.DB_ERR});
        }
        if (userInfo) {
            // 账号已被注册
            return res.send({code: Code.ALREADY_REGISTERED});
        }
        var md5Encoder = crypto.createHash('md5');
        md5Encoder.update(pwd);
        pwd = md5Encoder.digest('hex');
        // 注册
        globalUserDao.createUser(dbClient, name, pwd, function (err, success) {
            if (err) {
                return res.send({code: Code.DB_ERR});
            }
            return res.send({code: Code.OK});
        });
    });
};

exp.login = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        name = msg.name || '', pwd = msg.pwd || '';
    console.log('login name = %s, pwd = %s', name, pwd);
    globalUserDao.getUserByName(dbClient, name, function (err, userInfo) {
        if (err) {
            return res.send({code: Code.DB_ERR});
        }
        if (userInfo) {
            var md5Encoder = crypto.createHash('md5');
            md5Encoder.update(pwd);
            pwd = md5Encoder.digest('hex');
            if (userInfo.pwd !== pwd) {
                return res.send({code: Code.PASSWORD_ERROR});
            } else {
                return res.send({code: Code.OK, token: token.create(name, Date.now(), config.secret)});
            }
        } else {
            return res.send({code: Code.USER_NOT_EXIST});
        }
    });
};