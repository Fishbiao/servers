/**
 * Created by tony on 2016/11/4.
 */
var logger = require('pomelo-logger').getLogger(__filename),
    uuid = require('node-uuid'),
    pomelo = require('pomelo');

var utils = require('../../mylib/utils/lib/utils');

var dao = module.exports = {};

dao.insertRechargePlayerInfo = function ( opt, cb)
{
    var sql = 'INSERT INTO logRechargePlayerInfo (playerId,playerName,productId,fightValue,normalLastBarrierId,gameMoney,rechargeTime) VALUES (?,?,?,?,?,?,?)';
    var args = [opt.playerId,opt.playerName,opt.productId,opt.fightValue,opt.normalLastBarrierId,opt.gameMoney,opt.rechargeTime];
    pomelo.app.get('logclient').query(sql,args, function (err, res) {
        if (err) {
            utils.invokeCallback(cb,false);
        } else {
            utils.invokeCallback( cb , true );
        }
    });
};
