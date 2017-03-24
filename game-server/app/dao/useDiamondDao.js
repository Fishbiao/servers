/**
 * Created by tony on 2016/10/14.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    pomelo = require('pomelo'),
    _ = require('underscore'),
    async = require('async');

var utils = require('../util/utils');

var dao = module.exports = {};

dao.saveDailyUseDiamond = function(saveData,cb)
{
    var sql = 'INSERT INTO STTEDailyUseDiamond(playerId,date,time,useWay,useDiamond,surplusDiamond) VALUES(?,?,?,?,?,?)',

        args = [saveData.playerId,saveData.date,saveData.time,saveData.useWay,saveData.useDiamond,saveData.surplusDiamond];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            logger.error('db save err = %s, STTEDailyUseDiamond = %j', err.stack, saveData);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res )
            {
                utils.invokeCallback(cb, null, true);
            }
            else {
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};