/**
 * Created by employee11 on 2016/3/3.
 */


var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var hasBuyPetDao = module.exports;

/**
 ��ȡ�ѹ�����ĳ�����Ϣ
 */
hasBuyPetDao.getHasBuyPet = function(playerId,configId, cb) {
    var sql = 'select * from hasBuyPet where playerId = ? and configId = ?';
    var args = [playerId,configId];

    pomelo.app.get('dbclient').query(sql, args, function(err, res) {
        if (err) {
            logger.error('get hasBuyPet by playerId and configId for hasBuyPetDao failed! ' + err.stack);
            utils.invokeCallback(cb, err, null);
        } else {
            if (res) {
                cb(null, res);
            } else {
                logger.error('hasBuyPet list is null');
                utils.invokeCallback(cb, null, null);
            }
        }
    });
};

/**
 ����ѹ������Id���б�
 */
hasBuyPetDao.addHasBuyPet = function (playerId,configId,cb){
    var sql = 'insert into hasBuyPet (playerId,configId) values(?,?)';
    var args = [playerId,configId];

    pomelo.app.get('dbclient').insert(sql, args, function(err,res) {
        if(err !== null){
            logger.error('add hasBuyPet failed! ' + err.message);
            logger.error(err);
            utils.invokeCallback(cb,err.message, false);
        } else {
            utils.invokeCallback(cb,null,true);
        }
    });
};