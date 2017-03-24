/**
 * Created by lishaoshen on 2015/11/1.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var bagDao = module.exports;

/**
 获取玩家物品背包信息
 */
bagDao.getItemByPlayerId = function(playerId, cb) {
	var sql = 'select * from bag where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('get bag by playerId for bagDao failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (res) {
				var bagData = res;
				cb(null, bagData);
			} else {
				logger.error('bag not exist');
				utils.invokeCallback(cb, new Error(' bag not exist '), null);
			}
		}
	});
};


/**
 获取玩家物品背包信息
 */
bagDao.getFragItemByPlayerId = function(playerId, cb) {
	var sql = 'select * from fragBag where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('get fragBag by playerId for bagDao failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (res) {
				var bagData = res;
				cb(null, bagData);
			} else {
				logger.error('bag not exist');
				utils.invokeCallback(cb, new Error(' bag not exist '), null);
			}
		}
	});
};



