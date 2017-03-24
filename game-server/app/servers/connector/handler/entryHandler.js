var logger = require('pomelo-logger').getLogger(__filename),
	async = require('async');

var playerDao = require('../../../dao/playerDao'),
    auth = require('../../../auth');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * 连接connector
 *
 */
Handler.prototype.entry = function(msg, session, next) {
	logger.debug("entryHandler entry :%j",msg);
    var MAC = msg.MAC, pwd = msg.password, app = this.app, platform = msg.platform || 'default',roleName = msg.roleName;

    session.on('closed',onUserLeave.bind(null,app));//????????????

    async.waterfall([
            function (cb) {
                // auth MAC
                auth.authCheck(platform, {uid: MAC, pwd: pwd, token: msg.token ,sdkLoginCbData:msg.sdkLoginCbData || {}}, cb);
            },
            function (res, cb) {
                if (!res.result) {
                    return cb(new Error('auth fail'), res.code);
                }
                session.set('MAC', res.uid);
                session.set('rawUid', MAC);
                session.pushAll();
                //playerDao.getPlayersByUid(res.uid, cb);//??????????
                cb({id:1000});
            },
            function (player, cb) {
                if (!player) {
                    // 抛出异常，以终止流水线，直接调用最终回调
                    return cb(new Error('player not exists'), Code.CONNECTOR.FA_PLAYER_NOT_EXIST);
                }
                //report.pushUserInfo(session.get('rawUid'));
                app.set('onlineCnt', app.get('onlineCnt') + 1);
                session.bind(player.id, function (err) {
                    cb(err, player);
                });
            },
            function (player, cb) {
                session.set('playerId', player.id);
                session.pushAll(cb);
            }
        ],
		function(err,code){
            if (err) {
                logger.info('entry err = %j', err);
                next(null, {code: code});
                if (code !== Code.CONNECTOR.FA_PLAYER_NOT_EXIST) {
                    // 无角色时，须等待客户端创角角色，不踢
                    app.get('sessionService').kickBySessionId(session.id, null);
                }
            } else {
                next(null, {code: Code.OK});
            }
		}
	);
};


var onUserLeave = function (app, session) {

}