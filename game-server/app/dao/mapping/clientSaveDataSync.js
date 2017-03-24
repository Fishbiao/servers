/**
 * Created by kilua on 2016/5/19 0019.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

exp.save = function (client, saveData, cb) {
    var sql = 'INSERT INTO ClientSave(playerId, saveData) VALUES(?,?) ON DUPLICATE KEY UPDATE saveData=VALUES(saveData)',
        args = [saveData.playerId, saveData.saveData || ''];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('save err = %s', err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            utils.invokeCallback(cb, null, (!!res && res.affectedRows > 0));
        }
    });
};