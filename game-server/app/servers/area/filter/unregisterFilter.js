/**
 * Created by kilua on 2014-09-28.
 */

var logger = require('pomelo-logger').getLogger(__filename),
    _ = require('underscore');

var area = require('../../../domain/area/area');

var BEFORE_REGISTER_ROUTES = ['area.playerHandler.enterScene'];

var Filter = function () {

};

var pro = Filter.prototype;

pro.before = function (msg, session, next) {
    var player = area.getPlayer(session.get('playerId'));
    if (!player) {
        // 为登录
        if (_.indexOf(BEFORE_REGISTER_ROUTES, msg.__route__) === -1) {
            // 不是登录前的请求
            logger.warn('before player.id = %s not registered!', session.get('playerId'));
            next(new Error('player not exist!'));
            return;
        }
    }
    next();
};

module.exports = function () {
    return new Filter();
};