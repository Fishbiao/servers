/**
 * Created by kilua on 2016/6/30 0030.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.load = function (cb) {
    var sql = 'SELECT * FROM ServerStatus ORDER BY id';

    pomelo.app.get('dbclient').query(sql, [], function (err, res) {
        if (err) {
            logger.error('load failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            if (!!res && !!res[0]) {
                try {
                    res[0].opFlags = JSON.parse(res[0].opFlags);
                } catch (ex) {
                    logger.warn('parse opFlags err = %s', ex.stack);
                    res[0].opFlags = [];
                }
            }
            utils.invokeCallback(cb, null, (res && res[0]) || {});
        }
    });
};

dao.initStartTime = function (cb) {
    var sql = 'INSERT INTO ServerStatus(startTime,opFlags) VALUES(?,?)',
        args = [Date.now(), '[]'];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('initStartTime err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
};

dao.saveOpFlags = function (opFlags, cb) {
    var sql = 'UPDATE ServerStatus SET opFlags = ?',
        args = [JSON.stringify(opFlags)];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('saveOpFlags err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, !!res && res.affectedRows > 0);
        }
    });
};