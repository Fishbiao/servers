/**
 * Created by fisher on 2017/23/37.
 */

var pomelo = require('pomelo'),
    logger = require('pomelo-logger').getLogger(__filename),
    _ = require('underscore');

var //area = require('../../../domain/area/area'),
    Code = require('../../../../shared/code'),
    playerDao = require('../../../dao/playerDao'),
    dataApi = require('../../../util/dataApi'),
    dataUtils = require('../../../util/dataUtils'),
    //dropUtils = require('../../../domain/area/dropUtils'),
    consts = require('../../../consts/consts')
    /*guidePrizeManager = require('../../../domain/area/guidePrizeManager'),
    playerShop = require('../../../domain/entity/playerShop'),
    randomShop = require('../../../domain/entity/randomShop'),
    playerRecharge = require('../../../domain/entity/playerRecharge'),
    activityManager = require('../../../domain/activity/activityManager'),
    publisher = require('../../../domain/activity/publisher'),
    Utils =  require('../../../util/utils'),
    inviteManager = require('../../../domain/area/inviteManager'),
    randBossRecordDao = require('../../../dao/randBossRecordDao'),
    common = require('../../../util/common'),
    randBossDao = require('../../../dao/randBossDao')*/;

var Handler = function (app) {
    this.app = app;
};

module.exports = function (app) {
    return new Handler(app);
};

var pro = Handler.prototype;

/*
 *   结算离线应发放体力
 * */
function processOfflineEnergy(player) {
    var trigger = pomelo.app.get('cronManager').getTriggerById(consts.AREA_CRON.DISPATCH_ENERGY_CRON_ID),
        nextExecuteTime,
        now = Date.now(),
        resultEnergy, dispatchCnt = 0;
    if (!trigger) {
        return;
    }
    nextExecuteTime = trigger.nextExcuteTime(player.dispatchEnergyTime);
    logger.debug('processOfflineEnergy dispatchEnergyTime = %s', new Date(player.dispatchEnergyTime).toTimeString());
    while (nextExecuteTime < now) {
        ++dispatchCnt;
        if (player.isEnergyFull()) {
            logger.debug('processOfflineEnergy player %s energy full!', player.id);
            break;
        }
        // 发放一次
        resultEnergy = Math.min(player.maxEnergy, player.energy + dispatchCnt * dataUtils.getOptionValue('Sys_StrengthRenewNum', 1));
        if (resultEnergy >= player.maxEnergy) {
            break;
        }
        nextExecuteTime = trigger.nextExcuteTime(nextExecuteTime);
    }
    if (dispatchCnt > 0) {
        player.set('dispatchEnergyTime', now);
        if (!!resultEnergy) {
            player.dispatchEnergy(resultEnergy - player.energy);
            logger.debug('processOfflineEnergy energy %s', resultEnergy);
        }
    }
}

/*
 *   上线时检查是否需要重置购买体力次数
 * */
function processBuyEnergyCntReset(player) {
    var trigger = pomelo.app.get('cronManager').getTriggerById(consts.AREA_CRON.RESET_BUY_ENERGY_CNT_CRON_ID);
    if (!trigger) {
        return;
    }
    var now = Date.now(),
        lastResetTime = player.resetBuyEnergyCntTime || player.createTime,
        nextResetTime = trigger.nextExcuteTime(lastResetTime);
    if (now >= nextResetTime) {
        player.resetBuyEnergyCount(now);
    }
}


pro.enterScene = function (msg, session, next) {
    var playerId = session.get('playerId'), player,self = this;
    logger.debug('enterScene playerId = %s', playerId);
    if (!playerId) {
        console.log('enterScene request entry or create player first!');
        return next(null, {code: Code.FAIL});
    }
    return next(null, {code: Code.AREA.PLAYER_IN_BARRIER});
    this.app.rpc.world.playerRemote.add(session,
        {
        id: session.get('playerId'),
        areaName: this.app.getServerId(),
        frontendId: session.frontendId,
        sessionId: session.id,
        username: session.get('MAC')
        },
        //--------------------
        function (err, errCode) {
        if (err) {
            return next(null, {code: Code.FAIL});
        }
        if (errCode !== Code.OK) {
            logger.error('enterScene world.playerRemote.add errCode %s', errCode);
            return next(null, {code: Code.FAIL});
        }

        playerDao.onUserLogon(playerId, function (err, success) {
            playerDao.getPlayerAllInfo(playerId, function (err, allInfo) {
                if (!!err || !allInfo) {
                    console.log('get player info failed');
                    next(null, {code: Code.DB_ERROR});
                    return;
                }
                // 注意:检查是否已有实例，须放在异步读取数据库后，否则会拦不住
                // 如果已在线，也应该在当前这个area上，这里将进行替换
                if ((player = area.getPlayer(playerId)))
                {
                    logger.info('enterScene player already online!playerId = %s', playerId);
                    if (player.leaveTimer)
                    {
                        player.clearLeaveTimer();
                        player.sessionId = session.id;
                        player.setFrontendId(session.frontendId);
                        player.setSession(session);
                        next(null, {code: Code.OK, curPlayer: player.getClientInfo()});
                    }
                    //需要T人
                    else
                    {
                        var oldSessionId = player.sessionId;
                        // 替换前端信息
                        player.sessionId = session.id;
                        player.setFrontendId(session.frontendId);
                        next(null, {code: Code.OK, curPlayer: player.getClientInfo()});
                        // 踢掉旧连接
                        self.app.get('localSessionService').kickBySid(session.frontendId, oldSessionId);
                    }
                    return;
                }

                allInfo.language = language;
                createPlayer(session, allInfo, next);
            });

            if (!!err) {
                console.log('setOnline error!');
                return;
            }
            if (!success) {
                console.log('enterScene setOnline failed!');
            }
        });
    });
};

function createPlayer(session, allData, next) {
    var dbPlayer = allData.player,
        player;
    dbPlayer.frontendId = session.frontendId;
    dbPlayer.sessionId = session.id;
    player = area.addPlayer(dbPlayer);
    player.setLanguage( allData.language );
    player.setPassedBarriers(allData.passedBarrier);
    player.processBarrierAtkCntReset();
    player.loadBag(allData.bagData);
    player.loadFragBag(allData.fragBag);
    player.unlockChapterMgr.load(allData.unlockChapter);
    player.setHasBuyHeroIds(allData.hasBuyHeroIds);
    guidePrizeManager.get(player).load(allData.guideIds);
    player.loadClientSaveData(allData.clientSaveData);
    playerShop.get(player).load(allData.shopInfo);
    player.shop.processOfflineReset();
    randomShop.get(player).load(allData.randomShopInfo);
    playerRecharge.get(player).load(player);
    processOfflineEnergy(player);
    processBuyEnergyCntReset(player);
    var actManger = activityManager.get(player);
    actManger.load(allData.activityList,dbPlayer.dailyActivityEnergyReset || 0);
    actManger.processOfflineReset();
    // 触发一次检查并发布新活动
    player.activityMgr.publish(publisher.publish(pomelo.app.get('opFlags'), common.getServerDay()));
    //if (player.reviveCntMgr) {
    //    player.reviveCntMgr.processOfflineReset();
    //}
    if (allData.heroBag && allData.heroBag.length > 0) {
        player.loadHeroBag(allData.heroBag);
        player.initCurFightHero();
    }
    else {
        initHero(player);
    }
    player.initCurFightBrotherHeros();
    if (allData.petBag && allData.petBag.length > 0) {
        player.loadPetBag(allData.petBag);
        player.initCurFightPet();
    }
    else {
        initPet(player);
    }
    player.loadEquipBag(allData.equipBag, allData.equipConf);
    player.refineResetMgr.processOfflineReset();
    player.buffManager.load(allData.buffs);
    player.buffManager.processOfflineReset();
    player.occasionManager.load(allData.occasions);
    player.occasionManager.processOfflineReset();
    player.weekHighScoreMgr.processOfflineReset();
    player.loadWakeUpBag(allData.wakeUpBag);
    player.loadEquipWash(allData.washData);
    player.loadEquipAchieved(allData.equipAchievedList);
    player.loadOrderList(allData.orderList);
    player.missionMgr.load(allData.missionList,dbPlayer.dailyMissionReset || 0 );
    player.missionMgr.processOfflineReset();
    player.dataStatisticManager.load( allData.dataStatisticList );
    player.dailyEndlessBoxToHeroCntManager.processOfflineReset();
    player.setBarrierRandBoss(allData.barrierRandBoss,allData.randBossRecord);
    inviteManager.initInviteData( player );
    next(null, {code: Code.OK, curPlayer: player.getClientInfo()});
}

/**
 * 获取初始化英雄id列表
 * */
function getInitHeroList() {
    var roleIds = dataUtils.getOptionList(consts.CONFIG.INIT_HERO);
    return roleIds;
};
/*
 *   角色第一次登录时，初始化猎魔人
 * */
function initHero(player) {

    var roleIds = dataUtils.getOptionList(consts.CONFIG.INIT_HERO);
    var heroes = [];
    player.loadHeroBag(heroes);

    //不能添加重复的类型英雄
    var tempListType = [],haveErroHeroId = false;
    _.each(roleIds,function (id){
        var heroData = dataApi.HeroAttribute.findById(id);
        if(!!heroData){
            tempListType.push(heroData.roleType);
        }else{
            haveErroHeroId = true;
        }
    });

    //true表示roleType类型没有重复
    var isUniq = _.size( _.uniq( tempListType ) != _.size(roleIds )) ;
    if( haveErroHeroId || isUniq ){
        logger.error( 'CommonParameter.xlsx : init_Hero is error ' );
    }

    _.each(roleIds,function (id) {
        var heroData = dataApi.HeroAttribute.findById(id);

        if (!heroData) {
            return;
        }
        var index = player.addHero( heroData,1);
        if (!index) {
            return;
        }

        var roleType = heroData.roleType;
        if( consts.HERO_TYPE.HERO == roleType ){
            player.setCurFightHero(index);
        }
        else{
            player.setBrotherHeroPos( {type:roleType,pos:index} );
        }
    });

    // var roleIds = dataUtils.getOptionList(consts.CONFIG.INIT_HERO);
    // var roleId = getInitConfigId(roleIds);
    // var heroes = [];
    // player.loadHeroBag(heroes);
    //
    // if (!!roleId) {
    //     var heroData = dataApi.HeroAttribute.findById(roleId);
    //     if (!heroData) {
    //         return;
    //     }
    //     var index = player.addHero(heroData,1);
    //     if (!index) {
    //         return;
    //     }
    //     player.setCurFightHero(index);
    // }
}

/*
 *   初次登录时，初始化宠物
 * */
function initPet(player) {
    var peyIds = dataUtils.getOptionList(consts.CONFIG.INIT_PET);
    var petId = getInitConfigId(peyIds);
    var pets = [];
    player.loadPetBag(pets);

    if (!!petId) {
        var petData = dataApi.PetAttribute.findById(petId);
        if (!petData) {
            return;
        }
        var index = player.addPet(petData);
        if (!index) {
            return;
        }
        player.setCurFightPet(index);
    }
}

/*
 *   根据初始猎魔人或初始宠物配置，生成猎魔人或宠物id
 * */
function getInitConfigId(configIds) {
    var configId;

    if (!!configIds && configIds.length > 0) {
        if (configIds[0] === 0) {
            configId = configIds[1];
        }
        else {
            var random = Math.random() * (configIds.length - 1);
            var index = Math.ceil(random);
            configId = configIds[index];
        }
    }
    return configId;
}

/*
 *   重置关卡攻打次数
 * */
pro.resetBarrierAtkCnt = function (msg, session, next) {
    var player = area.getPlayer(session.get('playerId')),
        barrier = player.passedBarrierMgr.getPassedBarrier(msg.barrierId),
        barrierData = dataApi.Custom.findById(msg.barrierId);
    if (!barrierData) {
        return next(null, {code: Code.AREA.INVALID_BARRIER});
    }
    if (!barrier) {
        return next(null, {code: Code.AREA.BARRIER_NOT_PASSED});
    }
    if (barrierData.customType === consts.BARRIER_TYPE.BOSS) {
        if (barrier.resetTimes >= dataUtils.getOptionValue(consts.CONFIG.RESET_BARRIER_MAX, 0)) {
            return next(null, {code: Code.AREA.REACH_BARRIER_RESET_MAX});
        }
    }
    var cost = dataUtils.getOptionListValueByIndex(consts.CONFIG.RESET_BARRIER_PRICE, barrier.resetTimes);
    if (player.diamondCnt < cost) {
        return next(null, {code: Code.DIAMOND_NUM_NOT_ENOUGH});
    }

    player.setMoneyByType(consts.MONEY_TYPE.DIAMOND,player.diamondCnt - cost,consts.USE_DIAMOND_STTE.RESET_BARROER_CNT);
    //player.setDiamond(player.diamondCnt - cost);
    player.resetBarrier(msg.barrierId);
    next(null, {
        code: Code.OK, barrierId: msg.barrierId, dailyTimes: barrier.dailyTimes,
        resetTimes: barrier.resetTimes, cost: cost
    });
};

pro.createBarrier = function (msg, session, next) {

    var playerId = session.get('playerId');
    var barrierId = msg.barrierId;
    var player = area.getPlayer(playerId);
    var barrierData = dataApi.Custom.findById(barrierId);

    var newBarrierId = player.passedBarrierMgr.getNewBarrierId(consts.CHAPTER_TYPE.NORMAL);
    logger.debug('createBarrier playerId = %s, barrierId = %s', playerId, barrierId);
    if (!barrierData) {
        next(null, {code: Code.AREA.INVALID_BARRIER});
        return;
    }

    var chapterId = barrierData.chapterId;

    var isOpenChapter = player.unlockChapterMgr.isUnlocked(chapterId);
    // 章节未解锁
    if ( !isOpenChapter ) {
        return next(null, {code: Code.AREA.CHAPTER_UNLOCKED});
    }

    var passRec = player.passedBarrierMgr.getPassedBarrier(barrierId);
    if (passRec && passRec.dailyTimes >= barrierData.dailyTimes) {
        return next(null, {code: Code.AREA.REACH_ATK_MAX});
    }
    // 检查前置关卡是否通过
    var lastBarrierId = dataUtils.getPreBarrier(barrierId);
    if (lastBarrierId && !player.passedBarrierMgr.isPassed(lastBarrierId)) {
        logger.debug('LastBarrier is not passed = %s', lastBarrierId);
        next(null, {code: Code.AREA.LAST_BARRIER_NOT_PASSED});
        return;
    }
    // 检查体力是否足够
    if (barrierData.energy && player.energy < barrierData.energy) {
        next(null, {code: Code.AREA.LACK_ENERGY});
        return;
    }
    // 检查背包是否有足够空格
    if (!player.bag.isHasPosition()) {
        next(null, {code: Code.AREA.BAG_IS_FULL});
        return;
    }

    var barrierDropList = dropUtils.getDropItems(barrierData.drop);
    barrierDropList = dropUtils.getDropItems(barrierData.drop);
    barrierDropList.push(dropUtils.makeGoldDrop(barrierData.dropmoney));
    barrierDropList.push(dropUtils.makeMoneyDrop(consts.MONEY_TYPE.KEY, dataUtils.getOptionValue('Custom_DropKeyNum')));

    var dropDouble = player.activityMgr.getFightDropdDouble( consts.FIGHT_TYPE.BARRIER );
    logger.debug('createBarrier dropDouble = %s', dropDouble);
    var barrier = barrierManager.createBarrier(player, barrierId, barrierData,barrierDropList,dropDouble);
    if (barrier) {
        var chapterDiffType = dataUtils.getChapterDiffTypeByBarrierId( barrier.barrierId );
        player.dataStatisticManager.refreshNewBarrier(chapterDiffType,barrier.barrierId );
        next(null, {code: Code.OK, barrier: barrier.getInfo(), drops: barrierDropList ,activityDropDouble:dropDouble});
        return;
    } else {
        next(null, {code: Code.FAIL});
        return;
    }
};
//关卡结算
pro.exitBarrier = function (msg, session, next) {
    var playerId = session.get('playerId'),
        player = area.getPlayer(playerId),
        barrier = barrierManager.getBarrier(player.id);

    if (barrier) {
        barrierManager.destroyBarrier(player);
    }
    else {
        return  next(null, {code: Code.AREA.INVALID_BARRIER});
    }
    var oldBarrierId = player.passedBarrierMgr.getNewBarrierId(consts.CHAPTER_TYPE.NORMAL);
    var isPass = player.passedBarrierMgr.isPassed(barrier.barrierId);
    var barrierData = dataApi.Custom.findById(barrier.barrierId);
    var passRec = player.passedBarrierMgr.getPassedBarrier( barrier.barrierId);
    var chapterDiffType = dataUtils.getChapterDiffTypeByBarrierId( barrier.barrierId );
    var promoteCnt = passRec ? passRec.promoteCnt : 0;
    if ( msg.status === 1 ) {
        //关卡进度促销相关
        if(promoteCnt < 1){//这次只做1次
            if(barrierData.shopIndex != 0){
                var dropIds = [];
                var activitygoodDataList = dataApi.ActivityGoods.findByIndex({id: barrierData.shopIndex});
                if(activitygoodDataList.length > 0){
                    for(var key in activitygoodDataList){
                        var itemData = dataApi.Items.findById(activitygoodDataList[key].typeId);
                        if(itemData){
                            var tmpData = {};//[dropid, priceOld，price，priceType]
                            tmpData.dropId = itemData.value;
                            tmpData.priceOld = activitygoodDataList[key].priceOld;
                            tmpData.price = activitygoodDataList[key].price;
                            tmpData.priceType = activitygoodDataList[key].priceType;
                            dropIds.push(tmpData);
                        }
                    }
                }
                promoteCnt = promoteCnt + 1;
                player.set('barrierPromoteDropIds',dropIds);
                player.set('barrierPromoteEndTick',new Date().getTime()+dataUtils.getOptionValue("Custom_ShopLiveTime")*3600000);
            }
        }

        if (passRec && passRec.dailyTimes >= barrierData.dailyTimes) {
            return   next(null, {code: Code.AREA.REACH_ATK_MAX});
        }
        // 检查体力是否足够
        if (barrierData.energy && player.energy < barrierData.energy) {
            return  next(null, {code: Code.AREA.LACK_ENERGY});

        }
        if (barrierData) {
            player.set('energy', player.energy - barrierData.energy || 0);
            logger.debug('exitBarrier dropDouble = %s', barrier.dropDouble);
            barrier.barrierDropList = player.applyDrops(barrier.barrierDropList,barrier.dropDouble);
        }
        // 胜利，更新星级
        player.resetBarrierAfterExit(playerId, barrier.barrierId, msg.status > 0 ? msg.star : 0, barrier.costTick, barrier.reviveCnt,
            msg.power, msg.superSkillCnt, msg.jumpCnt, msg.jumpSkillCnt,promoteCnt);

        player.onBarrierSettlement( barrier.barrierId );

        if( chapterDiffType == consts.CHAPTER_TYPE.NORMAL )
        {
            player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.PASS_GENERAL_BARRIER_CNT,consts.MISSION_PROGRESS_VALUE_TYPE.MATH_MAX ,barrier.barrierId);
            player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.GENERAL_BARRIER_CNT );
        }
        else if( chapterDiffType == consts.CHAPTER_TYPE.DIFFL )
        {
            player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.PASS_ELTE_CNT,consts.MISSION_PROGRESS_VALUE_TYPE.MATH_MAX ,barrier.barrierId);
            player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.ELITE_BARRIER_CNT );
        }
        player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.BARRIER_START_CNT,consts.MISSION_PROGRESS_VALUE_TYPE.TOTAL_VALUE,player.passedBarrierMgr.getTotalStarCnt() );

        player.passedBarrierMgr.updateNewBarrierId(chapterDiffType,barrier.barrierId);

        inviteManager.OnPlayerCharge(player, barrier.barrierId,oldBarrierId, player.buyGetDiamond);

        if ( player.funcOpen(consts.FUNCTION.RAND_BOSS) ) {
            var chanceTrigger= barrierData.chanceTrigger;
            //首次触发百分百随机
            if( isPass == false   ){
                var funcData = dataApi.FunctionOpen.findById(consts.FUNCTION.RAND_BOSS);
                if(funcData.custom ==barrier.barrierId ){
                    chanceTrigger = 1;
                }
            }

            if( chanceTrigger>0 ){
                var oldRandBoss =  player.passedBarrierMgr.getRandBoss();
                if(!oldRandBoss.isHaveBoss()){
                    var tmpRandNum = Math.random();
                    if( tmpRandNum <= chanceTrigger ){
                        randBossRecordDao.getRecordByPlayerId(playerId,function(err,randBossRecord){//这里是异步回调，所以每个if后面要加上else来返回
                            var randBoss = player.passedBarrierMgr.newCreateRandBoss(barrierData);

                            var winCnt = 0;
                            for(var i = 0;i < randBossRecord.length ; i ++){
                                if( randBossRecord[i].randomBossId == randBoss.randomBossId){
                                    winCnt += 1;
                                }
                            }
                            randBoss.setWin(winCnt);

                            randBossDao.deleteRandBossByPlayerId(playerId,function(){});
                            player.emit('saveBarrierRandBoss', randBoss.getData());
                            return next(null, {code: Code.OK, drops: barrier.barrierDropList,activityDropDouble:barrier.dropDouble,barrierRandBoss:randBoss.getClientInfo() });
                        });
                    }
                    else{
                        next(null, {code: Code.OK, drops: barrier.barrierDropList,activityDropDouble:barrier.dropDouble });
                    }
                }
                else{
                    next(null, {code: Code.OK, drops: barrier.barrierDropList,activityDropDouble:barrier.dropDouble });
                }
            }
            else{
                next(null, {code: Code.OK, drops: barrier.barrierDropList,activityDropDouble:barrier.dropDouble });
            }
        }
        else{
            next(null, {code: Code.OK, drops: barrier.barrierDropList,activityDropDouble:barrier.dropDouble });
        }
    }
    else{
        next(null, {code: Code.OK, drops: barrier.barrierDropList,activityDropDouble:barrier.dropDouble });
    }

    //
    // if( chapterDiffType == consts.CHAPTER_TYPE.NORMAL )
    // {
    //     player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.GENERAL_BARRIER_CNT );
    // }
    // else if( chapterDiffType == consts.CHAPTER_TYPE.DIFFL )
    // {
    //     player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.ELITE_BARRIER_CNT );
    // }

};

pro.setCurFightHero = function (msg, session, next) {
    var playerId = session.get('playerId');
    var player = area.getPlayer(playerId);

    var type = msg.type;
    if( consts.HERO_TYPE.HERO== type )
    {
        if (player.setCurFightHero(msg.pos)) {
            next(null, {code: Code.OK, curHero: player.curHero.getClientInfo()});
        } else {
            next(null, {code: Code.AREA.HERO_NOT_EXIST});
        }
    }
    else{
        logger.debug('setCurFightHero playerId = %s, type = %s, pos = %s', playerId, msg.type, msg.pos );

        if( msg.type == null || msg.pos ==null )
        {
            return  next(null, { code: Code.AREA.HERO_NOT_EXIST });
        }
        var player = area.getPlayer(playerId);
        player.setCurrFightBrotherHero( msg.type,msg.pos,next );
    }
};
//
//
// //设置出战英雄的兄弟
// pro.setCurFightHeroBrother = function (msg , session ,next ) {
//     var playerId = session.get('playerId');
//
//     logger.debug('setCurFightHeroBrother playerId = %s, type = %s, pos = %s', playerId, msg.type, msg.pos );
//
//     if( msg.type == null || msg.pos ==null )
//     {
//         return  next(null, { code: Code.AREA.HERO_NOT_EXIST });
//     }
//     var player = area.getPlayer(playerId);
//     player.setCurrFightBrotherHero( msg.type,msg.pos,next );
// };

pro.buyEnergy = function (msg, session, next) {
    var playerId = session.get('playerId');
    var player = area.getPlayer(playerId);
    if (player.buyEnergyCnt >= dataUtils.getOptionValue(consts.CONFIG.BUY_ENERGY_MAX, 0)) {
        return next(null, {code: Code.AREA.REACH_BUY_ENERGY_MAX});
    }
    var cost = dataUtils.getOptionListValueByIndex(consts.CONFIG.ENERGY_PRICE, player.buyEnergyCnt);
    //原价
    var originalPrice = cost;
    var energyDiscount = player.activityMgr.energyDiscount();

    cost = cost * energyDiscount;
    if (player.diamondCnt < cost) {
        return next(null, {code: Code.DIAMOND_NUM_NOT_ENOUGH});
    }
    if (player.energy >= consts.MAX_ENERGY) {
        next(null, {code: Code.AREA.REACH_MAX_ENERGY});
        return;
    }
    //player.setDiamond(player.diamondCnt - cost);
    player.setMoneyByType(consts.MONEY_TYPE.DIAMOND,player.diamondCnt - cost,consts.USE_DIAMOND_STTE.ENERGY_BUY);

    player.set('buyEnergyCnt', player.buyEnergyCnt + 1);
    player.set('energy', Math.min(consts.MAX_ENERGY, player.energy + dataUtils.getOptionValue(consts.CONFIG.ENERGY_BUY_UNIT, 0) ));

    logger.debug('buyEnergy playerId = %s, originalPrice = %s, energyDiscount = %s', playerId,originalPrice,energyDiscount);

    player.missionMgr.progressUpdate(consts.MISSION_CONDITION_TYPE.BUY_XX_ENERGY,consts.MISSION_PROGRESS_VALUE_TYPE.ADD_VALUE);
    next(null, {code: Code.OK, cost: originalPrice ,discount : energyDiscount });
};

/*
 *   解锁章节
 * */
pro.unlockChapter = function (msg, session, next) {
    logger.debug('unlockChapter playerId = %s, chapterId = %s', session.get('playerId'), msg.chapterId);
    var player = area.getPlayer(session.get('playerId')),
        chapterData = dataApi.Chapter.findById(msg.chapterId);
    if (!chapterData) {
        logger.debug('unlockChapter chapter data not found!');
        return next(null, {code: Code.FAIL});
    }
    // 是否已解锁
    if (player.unlockChapterMgr.isUnlocked(msg.chapterId)) {
        return next(null, {code: Code.AREA.CHAPTER_UNLOCKED});
    }
    // 是否可以解锁
    if (!player.passedBarrierMgr.canUnlockChapter(msg.chapterId)) {
        return next(null, {code: Code.AREA.PRE_CHAPTER_NOT_PASSED});
    }
    if (player.keyCount < chapterData.unlockKeyCount) {
        return next(null, {code: Code.AREA.LACK_KEY});
    }
    player.set('keyCount', player.keyCount - chapterData.unlockKeyCount);
    player.unlockChapterMgr.unlock(msg.chapterId);
    next(null, {code: Code.OK, cost: chapterData.unlockKeyCount});
};

/*
 *   扫荡
 * */
pro.wipe = function (msg, session, next) {
    logger.debug('wipe playerId = %s, barrierId = %s', session.get('playerId'), msg.barrierId);
    var playerId = session.get('playerId');
    var player = area.getPlayer(playerId);
    if (!player.passedBarrierMgr.isPassed(dataUtils.getOptionValue(consts.CONFIG.WIPE_OPEN_BARRIER, 1))) {
        return next(null, {code: Code.AREA.FUNC_DISABLED});
    }
    // 检查背包是否有足够空格
    if (!player.bag.isHasPosition()) {
        return next(null, {code: Code.AREA.BAG_IS_FULL});
    }
    var barrierData = dataApi.Custom.findById(msg.barrierId);
    if (!barrierData) {
        return next(null, {code: Code.AREA.INVALID_BARRIER});
    }
    var passRec = player.passedBarrierMgr.getPassedBarrier(msg.barrierId);
    if (passRec && passRec.dailyTimes >= barrierData.dailyTimes) {
        return next(null, {code: Code.AREA.REACH_ATK_MAX});
    }
    // 检查体力是否足够
    if (barrierData.energy && player.energy < barrierData.energy) {
        return next(null, {code: Code.AREA.LACK_ENERGY});
    }
    if (player.wipeTicket < 1) {
        return next(null, {code: Code.AREA.LACK_WIPE_TICKET});
    }

    var dropDouble = player.activityMgr.getFightDropdDouble( consts.FIGHT_TYPE.BARRIER );
    player.set('energy', player.energy - barrierData.energy);
    player.set('wipeTicket', player.wipeTicket - 1);
    player.resetBarrierAfterExit(player.id, msg.barrierId, 1);
    var dropItems = dropUtils.getDropItems(barrierData.drop);
    dropItems.push(dropUtils.makeGoldDrop(barrierData.dropmoney));
    dropItems.push(dropUtils.makeMoneyDrop(consts.MONEY_TYPE.KEY, dataUtils.getOptionValue('Custom_DropKeyNum')));
    dropItems=  player.applyDrops(dropItems,dropDouble);

    player.onBarrierSettlement(msg.barrierId);
    //doBarrierSettlement

    var chapterDiffType = dataUtils.getChapterDiffTypeByBarrierId( msg.barrierId );
    if( chapterDiffType == consts.CHAPTER_TYPE.NORMAL )
    {
        player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.GENERAL_BARRIER_CNT );
    }
    else if( chapterDiffType == consts.CHAPTER_TYPE.DIFFL )
    {
        player.missionMgr.progressUpdate( consts.MISSION_CONDITION_TYPE.ELITE_BARRIER_CNT );
    }
    player.passedBarrierMgr.updateNewBarrierId(chapterDiffType,msg.barrierId);

    // [138853]【服务端】扫荡增加可触发随机BOSS
    if ( player.funcOpen(consts.FUNCTION.RAND_BOSS) ) {
        var chanceTrigger= barrierData.chanceTrigger;

        if( chanceTrigger>0 ){
            var oldRandBoss =  player.passedBarrierMgr.getRandBoss();
            if(!oldRandBoss.isHaveBoss()){
                var tmpRandNum = Math.random();
                if( tmpRandNum <= chanceTrigger ){
                    randBossRecordDao.getRecordByPlayerId(playerId,function(err,randBossRecord){//这里是异步回调，所以每个if后面要加上else来返回
                        var randBoss = player.passedBarrierMgr.newCreateRandBoss(barrierData);

                        var winCnt = 0;
                        for(var i = 0;i < randBossRecord.length ; i ++){
                            if( randBossRecord[i].randomBossId == randBoss.randomBossId){
                                winCnt += 1;
                            }
                        }
                        randBoss.setWin(winCnt);

                        randBossDao.deleteRandBossByPlayerId(player.playerId,function(){});
                        player.emit('saveBarrierRandBoss', randBoss.getData());
                        return next(null, {code: Code.OK, drops: dropItems,activityDropDouble:dropDouble,barrierRandBoss:randBoss.getClientInfo() });
                    });
                }
                else{
                    return next(null, {code: Code.OK, drops: dropItems,activityDropDouble:dropDouble});
                }
            }
            else{
                return next(null, {code: Code.OK, drops: dropItems,activityDropDouble:dropDouble});
            }
        }
        else{
            return next(null, {code: Code.OK, drops: dropItems,activityDropDouble:dropDouble});
        }
    }
    else{
        return next(null, {code: Code.OK, drops: dropItems,activityDropDouble:dropDouble});
    }

};

/*
 *   购买扫荡券
 * */
pro.buyWipeTicket = function (msg, session, next) {
    logger.debug('buyWipeTicket playerId = %s', session.get('playerId'));
    var player = area.getPlayer(session.get('playerId')),
        price = dataUtils.getOptionValue(consts.CONFIG.WIPE_TICKET_PRICE, Number.POSITIVE_INFINITY);
    if (player.diamondCnt < price) {
        return next(null, {code: Code.DIAMOND_NUM_NOT_ENOUGH});
    }
    player.setDiamond(player.diamondCnt - price);
    player.set('wipeTicket', player.wipeTicket + 1);
    next(null, {code: Code.OK, cost: price});
};

function getTotalStarsByChapterId(player, chapterId) {
    var chapterData = dataApi.Chapter.findById(chapterId);
    if (!chapterData) {
        return 0;
    }
    return _.reduce(chapterData.barriers, function (memo, barrierId) {
        var rec = player.passedBarrierMgr.getPassedBarrier(barrierId);
        if (rec) {
            return memo + rec.star;
        }
        return memo;
    }, 0);
}

/*
 *   领取章节星级宝箱
 * */
pro.drawChapterStarAwards = function (msg, session, next) {
    logger.debug('drawChapterStarAwards playerId = %s, chapterId = %s, starCondId = %s', session.get('playerId'),
        msg.chapterId, msg.starCondId);
    var player = area.getPlayer(session.get('playerId')),
        totalStars = getTotalStarsByChapterId(player, msg.chapterId),
        reqStars = dataApi.Chapter.getReqStarsByChapterIdAndCondId(msg.chapterId, msg.starCondId);
    if (totalStars < reqStars) {
        logger.debug('drawChapterStarAwards totalStars(%s) < reqStars(%s)', totalStars, reqStars);
        return next(null, {code: Code.AREA.LACK_CHAPTER_STARS});
    }
    if (player.unlockChapterMgr.isDrew(msg.chapterId, msg.starCondId)) {
        return next(null, {code: Code.AREA.CHAPTER_STAR_AWARD_DREW});
    }
    var dropIdx = dataApi.Chapter.getStarDropByChapterIdAndCondId(msg.chapterId, msg.starCondId),
        drops = dropUtils.getDropItems(dropIdx);
    player.unlockChapterMgr.setDrew(msg.chapterId, msg.starCondId);
    drops = player.applyDrops(drops);
    next(null, {code: Code.OK, drops: drops});
};

pro.buyTime = function (msg, session, next) {
    logger.debug('buyTime playerId = %s', session.get('playerId'));
    var player = area.getPlayer(session.get('playerId')),
        curBarrier = barrierManager.getBarrier(session.get('playerId'));
    if (!curBarrier) {
        logger.debug('buyTime not in barrier!');
        return next(null, {code: Code.FAIL});
    }
    if (curBarrier.buyTimeCount >= dataUtils.getOptionValue(consts.CONFIG.BUY_TIME_MAX, 0)) {
        return next(null, {code: Code.AREA.REACH_BUY_TIME_MAX});
    }
    var cost = dataUtils.getOptionListValueByIndex(consts.CONFIG.BUY_TIME_COST, curBarrier.buyTimeCount);
    if (player.diamondCnt < cost) {
        return next(null, {code: Code.DIAMOND_NUM_NOT_ENOUGH});
    }
   // player.setDiamond(player.diamondCnt - cost);
    player.setMoneyByType(consts.MONEY_TYPE.DIAMOND,player.diamondCnt - cost,consts.USE_DIAMOND_STTE.FIGHT_BUY_TIME);
    curBarrier.doBuyTime();
    next(null, {code: Code.OK, cost: cost, buyTimeCount: curBarrier.buyTimeCount});
};

//=================================================取名字===============================================================
/*
 *   检查名字长度
 * */
function playerNameLenValid(name) {
    var nameLen = Utils.getLengthInBytes(name);
    return ( nameLen >= consts.PLAYER_NAME_LEN_RANGE.MIN && nameLen <= consts.PLAYER_NAME_LEN_RANGE.MAX);
}

function containsDirtyWord(name) {
    var dirtyWords = dataApi.DirtyWords.all(),
        dirtyWord;
    var len  =_.size(dirtyWords);

    var findValue= _.find( dirtyWords , function (rec) {
        dirtyWord = rec.dirtyWord;
        if (name.indexOf(dirtyWord) >= 0) {
            logger.debug('containsDirtyWord %s', dirtyWord);
            return true;
        }
    });
    return !_.isUndefined( findValue );
}
/*
 *   创建名字
 * */
pro.createPlayerName = function (msg, session, next) {
    logger.debug('createPlayerName playerId = %s, name = %s', session.get('playerId'), msg.name);
    var player = area.getPlayer(session.get('playerId'));
    // if ( player.nameCreated ) {
    //     logger.debug('createPlayerName created before!');
    //     next(null, {code: Code.FAIL});
    //     return;
    // }
    if ( !msg.name ) {
        logger.debug('createPlayerName empty name not allowed!');
        next(null, {code: Code.FAIL});
        return;
    }
    if( player.setNameCnt != 0 ){
        next(null, {code: Code.PLAYER_NAME.NAME_EXIST});
        return;
    }
    if (!playerNameLenValid(msg.name)) {
        next(null, {code: Code.AREA.NAME_LENGTH_OUT_OF_RANGE});
        return;
    }
    if (containsDirtyWord(msg.name)) {
        next(null, {code: Code.AREA.DIRTY_NAME});
        return;
    }


    playerDao.playerExistByName( msg.name, function (err, exist) {
        if (err) {
            next(null, {code: Code.DB_ERROR});
        } else {
            if (exist) {
                next(null, {code: Code.AREA.NAME_CONFLICT});
            } else {
                // 立即保存，仍然有可能重复
                playerDao.createPlayerName( player.id, msg.name, function (err, success) {
                    if (err) {
                        return next(null, {code: Code.DB_ERROR});
                    }
                    if (success) {
                        //player.playername = msg.name;//set('name', msg.name);
                        //player.nameCreated = 1;
                        var cnt = player.setNameCnt+1;
                        player.set('setNameCnt',cnt);
                        player.set('playername',msg.name);
                        next(null, {code: Code.OK});
                    } else {
                        logger.debug('createPlayerName failed!');
                        return next(null, {code: Code.FAIL});
                    }
                });
            }
        }
    });
};

/**
 * 攻打随机boss
 * */
pro.atkRandBoss = function ( msg, session, next ) {
    var player = area.getPlayer(session.get('playerId'));
    var randomBossId = msg.randomBossId;

    var randBoss = player.passedBarrierMgr.randBoss;
    //boss不存在
    if(!randBoss){
        return next(null, {code: Code.RANDBOSS.NOT_FOUND});
    }
    if(!randBoss.isHaveBoss()){
        return next(null, {code: Code.RANDBOSS.NOT_FOUND});
    }
    if(randBoss.isCooling()){
        return next(null, {code: Code.RANDBOSS.COOLING});
    }
    if(randBoss.isDisappear()){
        return next(null, {code: Code.RANDBOSS.DISAPPEAR});
    }
    if(!randBoss.isChallengeTicketEnough()){
        return next(null, {code: Code.AREA.LACK_ENERGY});
    }
    randBoss.enterAtkRandBossTime = Date.now();

    randBossRecordDao.getWinCntByWeek(player.id,randomBossId,function (err,cnt) {
        randBoss.setWin(cnt);
        return next(null, {code: Code.OK,barrierRandBoss:randBoss.getClientInfo()});
    });

};

/**
 * 退出随机boss
 * */
pro.exitRandBoss = function (msg, session, next) {
    var player       =  area.getPlayer(session.get('playerId'));
    //当前打掉的血
    var currHp       =  msg.currHp;
    var randomBossId =  msg.randomBossId;
    var randBoss = player.passedBarrierMgr.randBoss;
    if(!randBoss.isChallengeTicketEnough()){
        return next(null, {code: Code.AREA.LACK_ChallengeTicket});
    }
    if(!randBoss.enterAtkRandBossTime){
        return next(null,{code: Code.RANDBOSS.NOT_SEND_ATKBOSS});
    }
    if(randomBossId!=randBoss.randomBossId){
        return next(null,{code: Code.RANDBOSS.NOT_FOUND});
    }
    if(null==currHp || (currHp!=null && currHp>100000)){
        return next(null,{code: Code.RANDBOSS.HP_ERROR});
    }

    //boss还剩的血
    var oldHp   =  randBoss.getHp();

    //剩下的血
    var tmpHp = oldHp - currHp;
    if(tmpHp<0){
        return next(null,{code: Code.RANDBOSS.HP_ILLEGAL});
    }
    randBoss.refresh(tmpHp,randBoss.getAtk()+1);
    randBoss.enterAtkRandBossTime = null;

    if( tmpHp <= 0){
        randBossRecordDao.insert(randBoss.getData(),function (err,res) {
            if(err){
                return next( null , {code:Code.FAIL});
            }else{
                var dieAward = randBoss.sendDieAward(player);
                var awards = randBoss.sendAward(player,currHp/100000);

                player.set('challengeTicket',  player.getMoneyByType(consts.MONEY_TYPE.CHALLENGE_TICKET) - randBoss.getNeedChallengeTicket() || 0);
                return next( null, {
                    code: Code.OK,
                    barrierRandBoss:randBoss.getClientInfo(),
                    dieDrops:dieAward,
                    drops:awards.drops,
                    dropsCnt:awards.dropsCnt
                });
            }
        })
    }else{
        var awards = randBoss.sendAward(player,currHp/100000);
        player.set('challengeTicket', player.getMoneyByType(consts.MONEY_TYPE.CHALLENGE_TICKET) - randBoss.getNeedChallengeTicket() || 0);
        return next( null, {
            code: Code.OK,
            barrierRandBoss:randBoss.getClientInfo(),
            drops:awards.drops,
            dropsCnt:awards.dropsCnt
        });
    }
};

//购买关卡商店物品
pro.buyBarrierPromote = function(msg, session, next){
    var player =  area.getPlayer(session.get('playerId'));
    var dropId = msg.dropId;

    var now =new Date();
    if(now.getTime() > player.barrierPromoteEndTick){//已经过时了
        return next(null, {code: Code.AREA.BARRIERPROMOTE_TIMEOUT});
    }

    var barrierPromoteDropId = null;//[dropid, priceOld，price，priceType]
    for(var key in player.barrierPromoteDropIds){
        if(dropId == player.barrierPromoteDropIds[key][0]){
            barrierPromoteDropId = player.barrierPromoteDropIds[key];
            break;
        }
    }

    if(barrierPromoteDropId == null){
        return next(null, {code: Code.AREA.BARRIERPROMOTE_WITHOUT});
    }

    //判断货币是否足够
    if(!player.isEnoughSomeTypeMoney(barrierPromoteDropId[3],barrierPromoteDropId[2])){
        return next(null, {code: Code.AREA.LACK_MONEY});
    }

    player.set('barrierPromoteEndTick',0);
    var currDiamond = player.getMoneyByType( barrierPromoteDropId[3]);
    player.setMoneyByType(barrierPromoteDropId[3],currDiamond - barrierPromoteDropId[2],consts.USE_DIAMOND_STTE.BARRIERPROMOTE_BUY);
    var drops = dropUtils.getDropItems(barrierPromoteDropId[0]);
    return next(null, {code: Code.OK, drops:player.applyDrops(drops)});
}