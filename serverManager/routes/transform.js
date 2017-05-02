/**
 * Created by kilua on 2016/5/31 0031.
 */

var url = require('url');

var dbClient = require('../dao/mysql/mysql'),
    transformDetailDao = require('../dao/transformDetailDao'),
    utils = require('../utils');

exports.selectServer = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        MAC = msg.MAC,
        platform = msg.platform;
    transformDetailDao.incSelectServer(dbClient, utils.getServerUserName(platform, MAC), function (err, success) {
        if (err) {
            res.send({code: 501});
        } else {
            res.send({code: success ? 200 : 500});
        }
    });
};

exports.loadSuccess = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        MAC = msg.MAC,
        platform = msg.platform;
    transformDetailDao.incLoadSuccess(dbClient, utils.getServerUserName(platform, MAC), function (err, success) {
        if (err) {
            res.send({code: 501});
        } else {
            res.send({code: success ? 200 : 500});
        }
    });
};

exports.logonSuccess = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        MAC = msg.MAC,
        platform = msg.platform;
    transformDetailDao.incLogonSuccess(dbClient, utils.getServerUserName(platform, MAC), function (err, success) {
        if (err) {
            res.send({code: 501});
        } else {
            res.send({code: success ? 200 : 500});
        }
    });
};
