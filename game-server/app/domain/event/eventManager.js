/**
 * Created by lishaoshen on 2015/11/3.
 */
var pomelo = require('pomelo');

var exp = module.exports;

var consts = require('../../consts/consts');

/**
 * Listen event for entity
 */
exp.addEvent = function (entity) {
    switch (entity.type) {
        case consts.ENTITY_TYPE.PLAYER:
            addSaveEvent(entity);
            break;
        case consts.ENTITY_TYPE.ROOM:
            addSaveRoomEvent(entity);
            break;

        default :
    }
};

/**
 * Add save event for room
 * @param {Object} room The roomData to add save event for.
 */
function addSaveRoomEvent(room) {

}

/**
 * Add save event for player
 * @param {Object} player The player to add save event for.
 */
function addSaveEvent(player) {
    var app = pomelo.app;
    player.on('updatePassedBarrier', function (newRec) {
        app.get('sync').exec('passedBarrierSync.updatePassedInfo', [player.id, newRec.barrierId].join('_'), newRec, player.id);
    });
    player.on('save', function () {
        app.get('sync').exec('playerSync.updatePlayer', player.id, player.getData(), player.id);
    });
    player.on('saveItemBag', function (newRec) {
        app.get('sync').exec('bagSync.save', [player.id, newRec.pos].join('_'), newRec, player.id);
    });

    player.on('saveFragItemBag', function (newRec) {
        app.get('sync').exec('bagSync.saveFragItem', [player.id, newRec.pos].join('_'), newRec, player.id);
    });

    player.on('updateHero', function (newRec) {
        app.get('sync').exec('heroBagSync.save', [player.id, newRec.pos].join('_'), newRec, player.id);
    });
    // 注意：这里 updateHero 和 removeHero 事件必须合并，因为缓存队列没有顺序的。原则是同一个表的数据库操作只能有一个
    //exec（ function ,key, rec, playerId）
    //player.on('removeHero', function (newRec) {
    //    app.get('sync').exec('heroBagSync.remove', [player.id, newRec.pos].join('_'), newRec, player.id);
    //});
    player.on('updatePet', function (newRec) {
        app.get('sync').exec('petBagSync.save', [player.id, newRec.pos].join('_'), newRec, player.id);
    });
    //player.on('removePet', function (newRec) {
    //    app.get('sync').exec('petBagSync.remove', [player.id, newRec.pos].join('_'), newRec, player.id);
    //});
    player.on('unlockChapter.save', function (newRec) {
        app.get('sync').exec('unlockChapterSync.save', [player.id, newRec.chapterId].join('_'), newRec, player.id);
    });
    player.on('flush', function (cb) {
        pomelo.app.get('sync').flush('playerSync.logoff', player.id, {id: player.id}, player.id, cb);
    });
    player.on('player.addHasBuyHero', function (newRec) {
        pomelo.app.get('sync').exec('hasBuyHeroSync.add', [player.id, newRec.configId].join('_'), newRec, player.id);
    });
    player.on('saveGuidePrize', function (newRec) {
        pomelo.app.get('sync').exec('guidePrizeSync.save', player.id, newRec, player.id);
    });
    player.on('saveClientSaveData', function (newData) {
        pomelo.app.get('sync').exec('clientSaveDataSync.save', player.id, newData, player.id);
    });
    player.on('playerShop.save', function (shopData) {
        pomelo.app.get('sync').exec('playerShopSync.save', player.id, shopData, player.id);
    });
    player.on('activity.save', function (actData) {
        pomelo.app.get('sync').exec('playerActivitySync.save', actData.id, actData, player.id);
    });
    player.on('equipBag.save', function (equipData) {
        pomelo.app.get('sync').exec('equipBagSync.save', [equipData.playerId, equipData.pos].join('_'), equipData, player.id);
    });
    player.on('armBag.save', function (slotData) {
        pomelo.app.get('sync').exec('armBagSync.save', [slotData.playerId, slotData.part].join('_'), slotData, player.id);
    });
    //洗练
    player.on('equipWash.save', function (equipWash) {
        pomelo.app.get('sync').exec('equipWashSync.save', [equipWash.playerId, equipWash.part,equipWash.pos].join('_'), equipWash, player.id);
    });
    //洗练成就
    player.on('equipAchieved.save', function (equipAchieved) {
        pomelo.app.get('sync').exec('equipAchievedSync.save', [equipAchieved.playerId, equipAchieved.type,equipAchieved.value].join('_'), equipAchieved, player.id);
    });
    player.on('endlessBuff.save', function (buffData) {
        pomelo.app.get('sync').exec('endlessBuffSync.save', [buffData.dataId, buffData.playerId].join('_'), buffData, player.id);
    });
    player.on('endlessOccasion.save', function (occasionData) {
        pomelo.app.get('sync').exec('endlessOccasionSync.save', [occasionData.occasionId, occasionData.playerId].join('_'), occasionData, player.id);
    });
    player.on('saveWakeUpBag', function (itemData) {
        app.get('sync').exec('wakeUpBagSync.save', [player.id, itemData.pos].join('_'), itemData, player.id);
    });
    player.on('saveMission', function (missionData) {
        app.get('sync').exec('missionSync.save', [player.id, missionData.conditionType,missionData.missionType,missionData.groupType].join('_'), missionData, player.id);
    });
    player.on('saveDataStatistics', function (vData) {
        app.get('sync').exec('dataStatisticsSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveStteEquip', function (vData) {
        app.get('sync').exec('statisticEquipSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveStteEndless', function (vData) {
        app.get('sync').exec('statisticEndlessSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveStteUseDiamond', function (vData) {
        app.get('sync').exec('statisticUseDiamondSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveStteArmEquipFull', function (vData) {
        app.get('sync').exec('statisticArmEquipFullSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveStteDailyOthers', function (vData) {
        app.get('sync').exec('statisticDailyOthersSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveStteNewBarrier', function (vData) {
        app.get('sync').exec('statisticNewBarrierSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveSttePlayerBehavior', function (vData) {
        app.get('sync').exec('statisticPlayerBehaivorSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveBarrierRandBoss', function (vData) {
        app.get('sync').exec('randBossSync.save', [player.id].join('_'), vData, player.id);
    });
    player.on('saveRandomShop', function (vData) {
        app.get('sync').exec('randomShopSync.save', [player.id].join('_'), vData, player.id);
    });
}

exp.clearEvent = function (entity) {
    switch (entity.type) {
        case consts.ENTITY_TYPE.PLAYER:
            entity.removeAllListeners();
            break;
        case consts.ENTITY_TYPE.ROOM:
            entity.removeAllListeners();
            break;
        default :
    }
};