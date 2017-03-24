/**
 * Created by kilua on 2016/5/17 0017.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, guideDrawRec, cb) {
    var sql = 'INSERT INTO GuidePrize(playerId, drawRecs) VALUES(?,?) ON DUPLICATE KEY UPDATE' +
            ' drawRecs = VALUES(drawRecs)',
        args = [guideDrawRec.playerId, JSON.stringify(guideDrawRec.guideIds)];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s, guideDrawRec = %j', err.stack, guideDrawRec);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, (!!res && res.affectedRows > 0));
        }
    });
};