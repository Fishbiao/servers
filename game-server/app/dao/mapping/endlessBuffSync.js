/**
 * Created by kilua on 2016/7/18 0018.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, buffData, cb) {
    var sql = 'INSERT INTO EndlessBuff(playerId, dataId, cnt, buyCnt) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE' +
            ' cnt = VALUES(cnt), buyCnt = VALUES(buyCnt)',
        args = [buffData.playerId, buffData.dataId, buffData.cnt, buffData.buyCnt];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s, buffData = %j', err.stack, buffData);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else {
                logger.debug('save failed!buffData = %j', buffData);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};