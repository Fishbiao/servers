/**
 * Created by kilua on 2016/5/24 0024.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.add = function (playerId, heroMaxLV, content, cb) {
    var sql = 'INSERT INTO Suggestion(playerId,heroMaxLV,tick,content) VALUES(?,?,?,?)',
        args = [playerId, heroMaxLV, Date.now(), content];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('add failed! ' + err.stack);
            utils.invokeCallback(cb, err.message);
        } else {
            utils.invokeCallback(cb, null, res && res.affectedRows > 0);
        }
    });
};