/**
 * Created by fisher on 2017/03/20.
 */
/*
* 这其实是一个playerManager
* */

var _ = require('underscore');

var Player = require('../entity/player');
var eventManager = require('../event/eventManager');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../util/dataApi'),
    consts = require('../../consts/consts');


var exp = module.exports;

var id, players, entities;

function onShopChange() {
    _.each(exp.getPlayerIds(), function (playerId) {
        var player = exp.getPlayer(playerId);
        if (player) {
            setTimeout(function () {
                player.pushMsg('playerShop.refresh', {});
            }, _.random(1, 3 * 60 * 1000));
        }
    });
}

//充值表发生了变化
function onRechargeChange() {
    _.each(exp.getPlayerIds(), function (playerId) {
        var player = exp.getPlayer(playerId);
        if (player) {
            setTimeout(function () {
                player.pushMsg('playerReacharge.refresh', {});
            }, _.random(1, 3 * 60 * 1000));
        }
    });
}

exp.init = function (opts) {
    id = opts.id;
    players = {};
    entities = {};

};

exp.clear = function () {
    players = {};
    entities = {};
};

/*获取玩家信息*/
exp.getPlayer = function (playerId) {
    var entityId = players[playerId];
    if (!!entityId) {
        return entities[entityId];
    }
    return null;
};

exp.addEntity = function (entity) {
    var entityId = entity.entityId;
    if (!entity || !entityId) {
        logger.error('addEntity entity = %j, entityId = %s', entity, entityId);
        return false;
    }
    if (entities[entityId]) {
        logger.error('addEntity entityId %s duplicated!', entityId);
        return false;
    }
    eventManager.addEvent(entity);
    entities[entityId] = entity;
    if (entity.type === consts.ENTITY_TYPE.PLAYER) {
        players[entity.id] = entityId;//可以通过playerId查找entityId
    }
    return true;
};

/*从玩家列表中移除玩家*/
exp.removeEntity = function (entityId) {
    var entity = entities[entityId];
    if (!entity) {
        return true;
    }
    eventManager.clearEvent(entity);
    if (entity.type === consts.ENTITY_TYPE.PLAYER) {
        delete players[entity.id];
    }
    delete entities[entityId];
    return true;
};

/*添加玩家到玩家列表中*/
exp.addPlayer = function (dbPlayer) {
    var player = new Player(dbPlayer);
    if (!exp.addEntity(player)) {
        return null;
    }
    return player;
};

exp.getPlayerIds = function () {
    return Object.keys(players);
};

/*程序退出踢玩家下线*/
exp.removePlayer = function (playerId) {
    var entityId = players[playerId],
        player;
    if (!!entityId) {
        player = entities[entityId];
    }
    var oldSessionId = player.sessionId, oldFrontId = player.frontendId;
    if (player) {
        player.leaveTime = setTimeout(function () {
            player.onLogoff();
            player.flush(function () {
                if (oldSessionId === player.sessionId && oldFrontId === player.frontendId) {
                    console.log('removePlayer erase player %s.', player.id);
                    return exp.removeEntity(entityId);
                }
            });
        }, 2000);
    }
};

