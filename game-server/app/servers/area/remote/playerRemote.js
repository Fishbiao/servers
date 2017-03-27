/**
 * Created by employee11 on 2015/12/24.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var area = require('../../../domain/area/area');
var utils = require('../../../util/utils');

var Handler = function(app){
    this.app = app;
};

module.exports = function(app){
    return new Handler(app);
};

var pro = Handler.prototype;

pro.playerLeave = function(args,cb){
    var player = area.getPlayer(args.playerId);

    if(player && player.frontendId === args.frontendId && player.sessionId === args.sessionId){
        area.removePlayer(args.playerId);
        logger.debug('playerLeave ok!playerId = %s', args.playerId);
    }
    utils.invokeCallback(cb);
};