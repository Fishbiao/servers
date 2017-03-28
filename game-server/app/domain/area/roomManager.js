/**
 * Created by fisher on 2017/03/28.
 */

var _ = require('underscore');

var RoomData = require('../entity/RoomData');
var eventManager = require('../event/eventManager');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../util/dataApi'),
    consts = require('../../consts/consts');


var exp = module.exports;

var id,
    rooms,// //可以通过roomId查找entityId
    roomEntities;// [entityId] = roomData

exp.init = function (opts) {
    id = opts.id;
    rooms = {};
    roomEntities = {};

};

exp.clear = function () {
    rooms = {};
    roomEntities = {};
};

/*获取玩家信息*/
exp.getRoom = function (roomId) {
    var entityId = rooms[roomId];
    if (!!entityId) {
        return roomEntities[entityId];
    }
    return null;
};

exp.addEntity = function (roomData) {
    var entityId = roomData.entityId;
    if (!roomData || !entityId) {
        logger.error('addRoom roomData = %j, entityId = %s', roomData, entityId);
        return false;
    }
    if (roomEntities[entityId]) {
        logger.error('addRoom entityId %s duplicated!', entityId);
        return false;
    }
    eventManager.addEvent(roomData);
    roomEntities[entityId] = roomData;
    if (roomData.type === consts.ENTITY_TYPE.ROOM) {
        rooms[roomData.id] = entityId;
    }
    return true;
};

/*从房间列表中移除房间*/
exp.removeRoom = function (entityId) {
    var entity = roomEntities[entityId];
    if (!entity) {
        return true;
    }
    eventManager.clearEvent(entity);
    if (entity.type === consts.ENTITY_TYPE.ROOM) {
        delete rooms[entity.id];
    }
    delete roomEntities[entityId];
    return true;
};

/*添加房间到房间列表中*/
exp.addRoom = function (dbRoom) {
    var room = new RoomData(dbRoom);
    if (!exp.addEntity(room)) {
        return null;
    }
    return room;
};

exp.getPlayerIds = function () {
    return Object.keys(rooms);
};
