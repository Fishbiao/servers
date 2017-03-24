/**
 * Created by kilua on 2016/5/20 0020.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.save = function (guideId, cb) {
    var sql = 'INSERT INTO GuideAchievement(guideId) VALUES(?) ON DUPLICATE KEY UPDATE total=total + 1;',
        args = [guideId];

    pomelo.app.get('statClient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('save failed! ' + err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, res && res.affectedRows > 0);
        }
    });
};