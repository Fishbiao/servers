/**
 * Created by employee11 on 2015/12/15.
 */

var util = require('util');

var _ = require('underscore'),
    logger = require('pomelo-logger').getLogger(__filename);

var Entity = require('./entity'),
    consts = require('../../consts/consts')
    /*bag = require('./bag'),
    Hero = require('./hero'),
    Pet = require('./pet'),
    SimpleBag = require('./simpleBag'),
    PassedBarrierManager = require('./passedBarrierManager'),
    UnlockChapterManager = require('./unlockChapterManager'),
    dataApi = require('../../util/dataApi'),
    dataUtils = require('../../util/dataUtils'),
    utils = require('../../util/utils'),
    EVENTS = require('../event/events'),
    messageService = require('../messageService'),
    Equip = require('./equip'),
    ArmBag = require('./armEquipBag'),
    equipWash = require('./equipWash'),
    equipAchieved = require('./equipAchieved'),
    DailyResetManager = require('../../util/dailyResetManager'),
    buffManager = require('../battle/buffManager'),
    occasionManager = require('../battle/occasionManager'),
    missionManager = require('./mission'),
    dropUtils = require('../area/dropUtils'),
    DataStatisticManager = require('../dataStatistics/dataStatisticManager'),
    Code = require('../../../shared/code'),
    inviteManager = require('../../domain/area/inviteManager'),
    Consts = require('../../consts/consts')*/;

//推送玩家属性
function onUpdateProp(prop, value) {
    var player = this;
    if (_.indexOf(player.saveProperties, prop) !== -1) {
        player.save();
    }
    player.pushMsg('player.updateProp', {prop: prop, value: value});
}

/**
 * Initialize a new 'Player' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Player = function (opts) {
    opts = opts || {};
    opts.type = 1;
//  Character.call(this, opts);
    Entity.call(this, opts);
    this.saveProperties = [
        'diamondCnt','goldCnt'
    ];
    this.sessionId = opts.sessionId;
    this.frontendId = opts.frontendId;

    this.MAC = opts.MAC;
    this.playerName = opts.playerName;
    this.createTime = opts.createTime;
    this.diamondCnt = opts.diamondCnt;
    this.goldCnt = opts.goldCnt;


};

util.inherits(Player, Entity);

var pro = Player.prototype;

/*
 *   更新历史最高得分
 * */
pro.updateHighScore = function (score) {
    if (score > this.highScore) {
        this.set('highScore', score);
    }
    if (score > this.weekHighScore) {
        this.set('weekHighScore', score);
    }
    this.onEndlessSettlement( score );

    this.missionMgr.progressUpdate(Consts.MISSION_CONDITION_TYPE.ENDLESS_BAST_SCORE,Consts.MISSION_PROGRESS_VALUE_TYPE.MATH_MAX,score > this.highScore?score: this.highScore )
    if( score > 0 )
    {
        this.missionMgr.progressUpdate( Consts.MISSION_CONDITION_TYPE.ENDLESS_CNT );
    }
};

pro.refreshEndlessSingleOldWave = function (Wave) {
    if(Wave> this.endlessSingleOldWave){
        this.endlessSingleOldWave = Wave;
        this.set('endlessSingleOldWave', Wave);
    }
};

/*
* 重置周榜积分
* **/
pro.resetWeekScore=function(now)
{
    logger.debug('resetWeekScore now = %s', now);
    this.set('weekHighScore', 0);
};

pro.setTeamId = function (teamId) {
    this.teamId = teamId || 0;
};

pro.dispatchEnergy = function (cnt) {
    cnt = cnt || consts.DISPATCH_ENERGY_STEP;
    var dispatchCnt = Math.min(this.maxEnergy, this.energy + cnt);
    this.set('dispatchEnergyTime', Date.now());
    this.set('energy', dispatchCnt);
    logger.debug('dispatchEnergy player %s currentTime = %s', this.id, new Date().toTimeString());
};

pro.isEnergyFull = function () {
    return (this.energy >= this.maxEnergy);
};

pro.resetBuyEnergyCount = function (now) {
    logger.debug('resetBuyEnergyCount now = %s', now);
    this.set('buyEnergyCnt', 0);
    this.set('resetBuyEnergyCntTime', now);
};

/*
* 检查是heroPosList中是否存在出战英雄
* 返回 [] （表示没有包含出战英雄）、反之返回 出战英雄pos数组
* */
pro.checkIsHaveFightHero = function ( heroPosList ) {
    var tempHeroPos = [];
    if(!heroPosList)
    {
        return tempHeroPos;
    }

    var currHeroList = [];
    if( !!this.curHeroPos  ){
        currHeroList.push( this.curHeroPos );
    }

    var currBrotherHeroList = [];
    if( !!this.currBrotherHeroPoss ){
        _.each(this.currBrotherHeroPoss,function (_data) {
            currBrotherHeroList.push(_data.pos);
        });
    }
    tempHeroPos = _.intersection(heroPosList,_.union(currHeroList,currBrotherHeroList));
    return tempHeroPos;
};
/*
 *   计算猎魔人的总战力
 * */
pro.getHeroTotalPower = function (hero) {
    var totalPower = hero.getPower();
    //logger.debug('###getHeroTotalPower id = %s, totalPower = %s', this.id, totalPower);
    if (this.curHeroPos === hero.pos) {
        // 是当前出战猎魔人，要算上装备
        totalPower += this.armBag.getTotalPower();
        //logger.debug('###getHeroTotalPower id = %s, totalPower = %s', this.id, totalPower);
    }
    totalPower+=this.getBrotherHeroAllPower();
    return totalPower;
};

pro.getBrotherHeroAllPower=function () {
    if(!!this.curBrotherHeros)
    {
        var tempAllPower = 0;
        _.each(this.curBrotherHeros,function (hero) {
            var power = hero.getPower();
            tempAllPower+=power;
        })
        return tempAllPower;
    }
    return 0;
}
/*
 *   猎魔人战斗力更新
 * */
pro.onHeroUpdatePower = function (hero) {
    var newPower = Math.ceil(this.getHeroTotalPower(hero));
    if (newPower >= this.highPower) {
        // 更新历史最高战斗力
        this.set('highPower', newPower);
    }
};

/*
 *   当前出战的猎魔人和宠物的总战力
 * */
pro.getPower = function () {
    // TODO: 补充出战宠物的战力
    if (this.curHero) {
        return this.getHeroTotalPower(this.curHero);
    }
    return 0;
};

/*
 *   加载猎魔人
 * */
pro.loadHeroBag = function (heroBagData) {
    var _self = this;
    _self.heroBag = new SimpleBag({
        maxSlot: dataUtils.getOptionValue('Player_HeroBagNum', 60)+ Consts.BAG_RESERVE.HERO,
        BagData: heroBagData, createItem: function (dbHero) {
            var hero = new Hero(dbHero);
            hero.on('updatePower', _self.onHeroUpdatePower.bind(_self, hero));
            return hero;
        }
    });

    function onHeroBagUpdate(hero) {
        _self.pushMsg('heroBag.update', {bagData: hero.getClientInfo()});
        _self.emit('updateHero', hero.getData());
    }

    function onHeroBagRemove(hero) {
        console.info('##onHeroBagRemove %s', hero.pos);
        _self.pushMsg('heroBag.remove', {pos: hero.pos});
        var dbData = hero.getData();
        dbData.remove = true;
        _self.emit('updateHero', dbData);
    }

    _self.heroBag.on('update', onHeroBagUpdate);
    _self.heroBag.on('remove', onHeroBagRemove);
};

pro.loadEquipBag = function (dbEquipList, slotList) {
    var self = this, bagData = [];
    dbEquipList.forEach(function (dbEquip) {
        bagData.push({pos: dbEquip.pos, posInfo: dbEquip});
    });
    self.equipBag = new SimpleBag({
        maxSlot: dataUtils.getOptionValue('Player_EquipmentBagNum', 50) + consts.BAG_RESERVE.EQUIP + consts.ARM_POS.MAX,
        BagData: bagData,
        createItem: function (dbEquip) {
            var equip = new Equip(dbEquip);
            equip.on('save', function (equipData) {
                self.emit('equipBag.save', equipData);
            });
            return equip;
        }
    });
    function onEquipBagUpdate(equip) {
        self.pushMsg('equipBag.update', {bagData: equip.getClientInfo()});
        self.emit('equipBag.save', equip.getData());
    }

    function onEquipBagRemove(equip) {
        self.pushMsg('equipBag.remove', {pos: equip.pos});
        var dbData = equip.getData();
        dbData.remove = true;
        self.emit('equipBag.save', dbData);
    }

    self.equipBag.on('update', onEquipBagUpdate);
    self.equipBag.on('remove', onEquipBagRemove);

    self.armBag = new ArmBag(self.equipBag, slotList);
    self.armBag.on('save', function (slotData) {
        self.emit('armBag.save', slotData);
    });
    self.armBag.on('refresh', function (slotInfo) {
        self.pushMsg('armBag.refresh', slotInfo);
    });
    self.armBag.on('updatePower', function () {
        var curHero = self.heroBag.getItemByPos(self.curHeroPos);
        if (curHero) {
            curHero.emit('updatePower');
        }
    });
};

pro.getEquipBagInfo = function () {
    var self = this,
        equipList = self.equipBag.getClientInfo();
    // 过滤掉已装备的
    equipList.filter(function (equipInfo) {
        return !self.armBag.existByPos(equipInfo.pos);
    });
    equipList.sort(function (a, b) {
        return a.pos - b.pos;
    });
    return equipList;
};

pro.setCurFightHero = function (pos) {
    if (pos !== this.curHeroPos) {
        var newHero = this.heroBag.getItemByPos(pos);
        if (newHero) {
            this.curHero = newHero;
            this.set('curHeroPos', pos);
            return true;
        }
        return false;
    }
    return true;
};

pro.getBrotherHeroPos = function (type) {
    var temp = null;
    _.each(this.currBrotherHeroPoss,function (data) {
        if(data.type==type)
        {
            temp = data;
            return temp;
        }
    });
    return temp;
};

pro.setBrotherHeroPos =   function ( data ) {

    var newList = _.filter( this.currBrotherHeroPoss , function (tempData ) {
        return tempData.type != data.type;
    })

    newList.push( data );

    this.set('currBrotherHeroPoss',newList );
};

/*
* 设置出战兄弟
* type:角色表 类型
* pos : 格子号
* */
pro.setCurrFightBrotherHero =  function (type,pos,next) {
    var currChoiceBrotheHero = this.getBrotherHeroPos(type);
    if( currChoiceBrotheHero && currChoiceBrotheHero.pos == pos && currChoiceBrotheHero.type == type )
    {
        next(null, { code: Code.HERO.HERO_FIGHTING });
        return false;
    }
    var newHero = this.heroBag.getItemByPos(pos);
    if (newHero) {
        //类型不比配
        if(newHero.data.roleType != type )
        {
            logger.error(' newHero.data.roleType != type ');
            next(null, { code: Code.HERO.HERO_TYPE_NOT_SAME });
            return false;
        }
        this.curBrotherHeros[type] = newHero;
        this.setBrotherHeroPos({type:type,pos:pos});
        newHero.emit('updatePower');
        next(null, { code: Code.OK});
        return true;
    }
    next(null, { code: Code.AREA.HERO_NOT_EXIST });
    return false;
};

pro.getHeroClientInfoByType = function (type) {
    if( this.curBrotherHeros[type])
    {
        return this.curBrotherHeros[type].getClientInfo();
    }
    return {};
};

/*
 * 初始化出战兄弟对象
 * */
pro.initCurFightBrotherHeros = function () {
    if( !this.curBrotherHeros )
    {
        this.curBrotherHeros = {};
    }
    if( this.currBrotherHeroPoss ){
        var self = this;
        _.each(this.currBrotherHeroPoss,function (data,type) {
            var type = data.type;
            var pos = data.pos;
            self.curBrotherHeros[type] = self.heroBag.getItemByPos(pos);
        });
    }
};

/*
 * 通过类型获取出战兄弟id
 * */
pro.getFightHeroBrotherId = function (type) {
    var hero = this.curBrotherHeros[type];
    if(hero)
    {
        return hero.getHeroId();
    }
    return 0;
}

pro.initCurFightHero = function () {
    this.curHero = this.heroBag.getItemByPos(this.curHeroPos);
};

pro.getFightHeroId = function () {
    if (this.curHero) {
        return this.curHero.getHeroId();
    }
    return 0;
};

pro.getFightHeroLv = function () {
    if (this.curHero) {
        return this.curHero.getLV();
    }
    return 0;
};

//添加解锁英雄记录
pro.addLockHero = function (heroId) {
    if( !this.canBuyHeroList )
    {
        this.canBuyHeroList = [];
    }

    var temp = [];
    this.canBuyHeroList.forEach(function (tempId) {
        temp.push(tempId);
    })

    temp.push(heroId);
    this.set('canBuyHeroList',temp);
};

pro.isOpenLockHero = function (heroId) {
    var isOpenLock = false;
    if( !!this.canBuyHeroList )
    {
        this.canBuyHeroList.forEach(function (tempId) {
            if(heroId == tempId)
            {
                isOpenLock = true;
                return;
            }
        })
    }
    return isOpenLock;
};

/*
* isFrist：为1表示默认 初始化的英雄
* */
pro.addHero = function (heroData,isFrist,level) {
    level = level || 1;
    var hero = new Hero({
        playerId: this.id,
        roleId: heroData.heroId,
        curLevel: level,
        curExperience: 0,
        quality: heroData.quality
    });
    var b = this.heroBag.add(hero);
    if(isFrist!=1)
    {
        this.missionMgr.progressUpdateHero( hero );
    }
    else
    {
        hero.on('updatePower', this.onHeroUpdatePower.bind(this, hero));
    }
    return b;
};
/*
 *   加载宠物
 * */
pro.loadPetBag = function (petBagData) {
    var _self = this;
    _self.petBag = new SimpleBag({
        BagData: petBagData, createItem: function (dbPet) {
            return new Pet(dbPet);
        }
    });

    function onPetBagUpdate(pet) {
        _self.pushMsg('petBag.update', {bagData: pet.getClientInfo()});
        _self.emit('updatePet', pet.getData());
    }

    function onPetBagRemove(pet) {
        _self.pushMsg('petBag.remove', {pos: pet.pos});
        var dbData = pet.getData();
        dbData.remove = true;
        _self.emit('updatePet', dbData);
    }

    _self.petBag.on('update', onPetBagUpdate);
    _self.petBag.on('remove', onPetBagRemove);
};

pro.setCurFightPet = function (pos) {
    this.curPet = this.petBag.getItemByPos(pos);
    this.set('curPetPos', pos);
};

pro.initCurFightPet = function () {
    this.curPet = this.petBag.getItemByPos(this.curPetPos);
};

pro.getFightPetId = function () {
    if (this.curPet) {
        return this.curPet.getPetId();
    }
    return 0;
};
/*
 *   添加宠物
 * */
pro.addPet = function (petData) {
    var pet = new Pet({
        playerId: this.id,
        roleId: petData.roleId,
        lv: 1,
        exp: petData.basicExp,
        quality: petData.quality
    });
    return this.petBag.add(pet);
};

pro.loadBag = function (itemData) {
    var _self = this;
    var bagInfo = {maxSlot: dataUtils.getOptionValue('Player_ItemBagNum', 100)};
    bagInfo.itemData = itemData;
    _self.bag = new bag(bagInfo,Consts.BAG_RESERVE.ITEM);

    function onItemBagUpdate(bagItem) {
        _self.pushMsg('itemBag.update', bagItem.getClientInfo());
        _self.emit('saveItemBag', bagItem.getData());
    }

    _self.bag.on('save', onItemBagUpdate);
};

pro.loadFragBag = function (itemData) {
    var _self = this;
    var bagInfo = {maxSlot: dataUtils.getOptionValue('Player_HeroPieceBagNum01', 100)};
    bagInfo.itemData = itemData;
    _self.fragBag = new bag(bagInfo, dataUtils.getOptionValue('Player_HeroPieceBagNum02', 100));

    function onItemBagUpdate(bagItem) {
        _self.pushMsg('fragItemBag.update', bagItem.getClientInfo());
        _self.emit('saveFragItemBag', bagItem.getData());
    }
    _self.fragBag.on('save', onItemBagUpdate);
};

//觉醒材料背包
pro.loadWakeUpBag = function (itemData) {
    var self = this,
        bagInfo = {maxSlot: dataUtils.getOptionValue('Player_EquipmentWakeBagNum', 999), itemData: itemData};
    self.wakeUpBag = new bag(bagInfo,Consts.BAG_RESERVE.EQUIP_AWAKE_MATERIAL);
    self.wakeUpBag.on('save', function (bagItem) {
        self.pushMsg('wakeUpBag.update', bagItem.getClientInfo());
        self.emit('saveWakeUpBag', bagItem.getData());
    });
};

pro.loadOrderList = function( orderList ){
    this.rechargeFlags = dataUtils.getOptionList("recharge_operationFlag");
    this.orderList = {};
    if(orderList)
    {
        var self = this;
        if(!_.isArray(orderList))
        {
            orderList = [orderList];
        }
        _.each(orderList,function (order) {
            self.addOrder(order);
        });
    }
};

/*
* 产品productId获取购买次数
* */
pro.getBuyCntByProductId =function(productId){
    var self = this;
    var cnt = 0;
    if( self.orderList[productId] )
    {
        cnt = _.size(self.orderList[productId]);
    }
    return cnt;
};

pro.isOpenOrderFlag = function(operationFlag)
{
    if (!_.contains(this.rechargeFlags,operationFlag)) {
        return false;
    }
    else
    {
        return true;
    }
};

pro.addOrder=function( order )
{
    var self = this;
    var productId = order.productId;
    if( !self.orderList[productId] )
    {
        self.orderList[productId] = [];
    }
    self.orderList[productId].push(order);
};

pro.loadEquipWash = function (washList) {
    this.equipWashAll = new equipWash.EquipWashAll(washList, this);
    var self = this;
    washList.forEach(function (wash) {
        self.equipWashAll.add(wash);
    });
};

pro.loadEquipAchieved = function (dbList) {
    this.equipAchievedList = new equipAchieved.EquipAchievedMG(dbList, this);
};

pro.setPassedBarriers = function (passedBarriers) {
    this.passedBarrierMgr.load(passedBarriers);
};

pro.setBarrierRandBoss = function (randBoss,randBossRecord) {
    this.passedBarrierMgr.loadRandBoss(randBoss,randBossRecord);
};

/*
 *   设置大招状态
 * */
pro.setSkillStates = function (states) {
    this.skillStates = states;
};

pro.resetBarrier = function (barrierId) {
    this.passedBarrierMgr.resetBarrier(barrierId);
};

/*
 *   退出关卡处理
 * */
pro.resetBarrierAfterExit = function (playerId, barrierId, newStar, costTick, reviveCnt, power, superSkillCnt, jumpCnt, jumpSkillCnt,promoteCnt) {
    this.passedBarrierMgr.resetBarrierAfterExit(barrierId, newStar, costTick, reviveCnt, power, superSkillCnt, jumpCnt, jumpSkillCnt,promoteCnt);
    //this.energy = this.energy - 10;
};

/*
 *   下线清理
 * */
pro.onLogoff = function () {
    this.clearLeaveTime();

};

pro.clearLeaveTime = function () {
    clearTimeout(this.leaveTime);
    this.leaveTime = 0;
};

pro.resetBarriers = function () {
    this.passedBarrierMgr.resetBarriers();
};

pro.pushMsg = function (route, msg) {
    messageService.pushMessageToPlayer({uid: this.id, sid: this.frontendId}, route, msg);
};

pro.processBarrierAtkCntReset = function () {
    this.passedBarrierMgr.processBarrierAtkCntReset();
};

pro.getData = function () {
    var self = this;
    var data = {};
    var parentData = Entity.prototype.getData.call(this);

    _.each(self.saveProperties, function (prop) {
        data[prop] = self[prop];
    });

    for (var prop in parentData) {
        if (parentData.hasOwnProperty(prop)) {
            data[prop] = parentData[prop];
        }
    }
    return data;
};
pro.clearLeaveTimer = function () {
    clearTimeout(this.leaveTimer);
    this.leaveTimer = 0;
};
pro.setFrontendId = function (frontendId) {
    this.frontendId = frontendId;
};

pro.setSession = function (newSession) {
    this.session = newSession;
  // pomelo.app.rpc.world.playerRemote.syncPlayerProp(this.session, this.id, 'name', this.name, null);
};

pro.getClientInfo = function () {
    var info = {};
    info.MAC = this.MAC;
    info.playerName = this.playerName;
    info.playerId = this.id;
    info.diamondCnt = this.diamondCnt;
    info.goldCnt = this.goldCnt;
    info.createTime = this.createTime;

    return info;
};

function addHeroes(player, heroId, cnt,level  ) {
    var i, heroData = dataApi.HeroAttribute.findById(heroId);
    if (!heroData) {
        logger.error('addHeroes hero not found!Id = %s', heroId);
        return;
    }
    for (i = 0; i < cnt; ++i) {
        player.addHero(heroData,null,level);
    }
}

function addPets(player, petId, cnt) {
    var i, petData = dataApi.PetAttribute.findById(petId);
    if (!petData) {
        logger.error('addPets pet not found!Id = %s', petId);
        return;
    }
    for (i = 0; i < cnt; ++i) {
        player.addPet(petData);
    }
}

function addEquips(player, itemId, cnt,double) {
    var i;
    var listEquip = [];
    for (i = 0; i < cnt; ++i) {
        var newEquip = new Equip({playerId: player.id, equipId: itemId});
        var  j;
        for(j = 0;j < double;++j )
        {
            player.equipBag.add(newEquip);
            listEquip.push({dropType:Consts.DROP_TYPE.EQUIP,itemId:itemId,count:1,level: newEquip.getLevel(),quality:newEquip.getQuality()});
        }
    }
    return listEquip;
}

/*
 *   改变钻石数量的接口，监控消费事件
 * */
pro.setDiamond = function (newDiamond) {
    var orgDiamond = this.diamondCnt;
    if (newDiamond < orgDiamond) {
        // 消费
        this.emit('onConsume', orgDiamond - newDiamond);
    }
    this.set('diamondCnt', newDiamond);
};
//// ��������
//MONEY_TYPE: {
//  GOLD: 1,
//      DIAMOND: 2,
//      EXP: 3,
//      ENERGY: 4
//},
pro.setMoneyByType = function ( moneyType, cnt , useWay ) {
    switch (moneyType) {
        case consts.MONEY_TYPE.GOLD:
            this.set('goldCnt', cnt);
            break;
        case consts.MONEY_TYPE.BRONZE_COIN:
            this.set('bronzeCoin', cnt);
            break;
        case consts.MONEY_TYPE.SILVER_COIN:
            this.set('silverCoin', cnt);
            break;
        case consts.MONEY_TYPE.GOLD_COIN:
            this.set('goldCoin', cnt);
            break;
        case consts.MONEY_TYPE.DIAMOND:
            if(!_.isNull(useWay) && !_.isUndefined(useWay) )
            {
                this.dataStatisticManager.refreshDailyUseDiamond(useWay,this.diamondCnt-cnt ,cnt );
            }
            this.setDiamond(cnt);
            break;
        case consts.MONEY_TYPE.EXP:
            this.set('exp', cnt);
            break;
        case consts.MONEY_TYPE.ENERGY:
            this.set('energy', cnt);
            break;
        case consts.MONEY_TYPE.KEY:
            this.set('keyCount', cnt);
            break;
        case consts.MONEY_TYPE.MELT_POINT:
            this.set('meltPoint', cnt);
            break;
        case consts.MONEY_TYPE.WASH_STONE:
            this.set('washPoint', cnt);
            break;
        case consts.MONEY_TYPE.COM_POINT:
            var temp = this.comPoint - cnt;
            //消耗
            if(  temp > 0 )
            {
                this.dataStatisticManager.refreshDailyOthers(Consts.OTHER_STTE.USE_COMPOINT,temp);
            }
            //获得
            else
            {
                this.dataStatisticManager.refreshDailyOthers(Consts.OTHER_STTE.GET_COMPOINT,-temp);
            }
            this.set('comPoint', cnt);
            break;
        case consts.MONEY_TYPE.WIPE_TICKET:
            this.set('wipeTicket', cnt);
            break;
        case consts.MONEY_TYPE.RAND_REFRESH_COIN:
            this.set('randRefreshCoin', cnt);
            break;
        case consts.MONEY_TYPE.CHALLENGE_TICKET:
            this.set('challengeTicket', cnt);
            break;
        default :
            logger.error('setMoneyByType unknown money type = %s', moneyType);
    }
};

pro.getMoneyByType = function (moneyType) {
    switch (moneyType) {
        case consts.MONEY_TYPE.GOLD:
            return this.goldCnt;
        case consts.MONEY_TYPE.DIAMOND:
            return this.diamondCnt;
        case consts.MONEY_TYPE.EXP:
            return this.exp;
        case consts.MONEY_TYPE.ENERGY:
            return this.energy;
        case consts.MONEY_TYPE.KEY:
            return this.keyCount;
        case consts.MONEY_TYPE.MELT_POINT:
            return this.meltPoint;
        case consts.MONEY_TYPE.COM_POINT:
            return this.comPoint;
        case consts.MONEY_TYPE.WASH_STONE:
            return this.washPoint;
        case consts.MONEY_TYPE.WIPE_TICKET:
            return this.wipeTicket;
        case consts.MONEY_TYPE.BRONZE_COIN:
            return this.bronzeCoin;
        case consts.MONEY_TYPE.SILVER_COIN:
            return this.silverCoin;
        case consts.MONEY_TYPE.GOLD_COIN:
            return this.goldCoin;
        case consts.MONEY_TYPE.RAND_REFRESH_COIN:
            return this.randRefreshCoin;
        case consts.MONEY_TYPE.CHALLENGE_TICKET:
            return this.challengeTicket;
        default :
            logger.error('getMoneyByType unknown money type = %s', moneyType);
    }
};
var addMaterial = function (player, itemId, cnt) {
    var itemData = dataApi.Items.findById(itemId);
    if (!itemData) {
        return false;
    }
    if (itemData.type === consts.ITEM_TYPE.WAKE_UP_ITEM) {
        player.wakeUpBag.addItem({playerId: player.id, itemId: itemId, count: cnt});
    } else {
        player.bag.addItem({playerId: player.id, itemId: itemId, count: cnt});
    }
    return true;
};

pro.applyDrops = function (drops,double) {
    var self = this;
    double = double || 1;
    drops = drops || [];
    //下发给客户端的数据
    var dropsTemp = [];
    drops.forEach(function (drop) {
        var  itemParameter = dataApi.DropItemParameter.getAttributes( drop );
        switch (drop.dropType) {
            case consts.DROP_TYPE.HERO:
                var heroLevel = null;
                if(!!itemParameter && itemParameter!={}){
                    heroLevel = itemParameter.heroLevel
                    drop.level;
                }
                addHeroes(self, drop.itemId, drop.count*double,heroLevel);
                dropsTemp.push(drop);
                break;
            case consts.DROP_TYPE.PET:
                addPets(self, drop.itemId, drop.count*double);
                dropsTemp.push(drop);
                break;
            case consts.DROP_TYPE.EQUIP:
                var equipList =  addEquips(self, drop.itemId, drop.count,double);
                equipList.forEach(function (equipItem)
                {
                    dropsTemp.push(equipItem);
                });
                break;
            case consts.DROP_TYPE.MONEY:
                dropsTemp.push(drop);
                self.setMoneyByType(drop.itemId, self.getMoneyByType(drop.itemId) + drop.count*double);
                break;
            case consts.DROP_TYPE.MATERIAL:
                dropsTemp.push(drop);
                var itemData = dataApi.Items.findById(drop.itemId);
                if(itemData.type == consts.ITEM_TYPE.FRAG_ITME){//如果是碎片  ---[138873]BUG:活动商店里面，配置了卖碎片，，玩家买了以后，身上却没有（通过GM添加是可以添加到身上的）
                    self.fragBag.addItem({playerId: self.id, itemId: drop.itemId, count: drop.count*double});
                }
                else{
                    addMaterial(self, drop.itemId, drop.count*double);
                }
                break;
            //无尽buff
            case consts.DROP_TYPE.EndlessBuff:
                dropsTemp.push(drop);
                self.buffManager.addAward(drop.itemId,drop.count*double);
                break;
            default :
                logger.error('applyDrops unknown dropType = %s', drop.dropType);
        }
    });

    return dropsTemp;
};

pro.setHasBuyHeroIds = function (hasBuyHeroIds) {
    this.hasBuyHeroIds = hasBuyHeroIds || [];
};

pro.hasBuyHeroById = function (id) {
    return (_.indexOf(this.hasBuyHeroIds, id) !== -1);
};

pro.addHasBuyHero = function (id) {
    if (!this.hasBuyHeroById(id)) {
        this.hasBuyHeroIds.push(id);
        this.emit('player.addHasBuyHero', {playerId: this.id, configId: id});
    }
};

pro.loadClientSaveData = function (clientSaveData) {
    this.clientSaveData = clientSaveData || '';
};

pro.setClientSaveData = function (newData) {
    this.clientSaveData = newData;
    this.emit('saveClientSaveData', {playerId: this.id, saveData: this.clientSaveData});
};

pro.getHeroMaxLV = function () {
    var maxLVHero = _.max(this.heroBag.getItemList(), function (hero) {
        return hero.curLevel;
    });
    if (!_.isEmpty(maxLVHero)) {
        return maxLVHero.curLevel;
    }
    return 0;
};

pro.isFindHeroData = function (needCnt , needLv ) {
    var currCnt = 0 ;
    var tempList = this.heroBag.getItemList();
    _.map(tempList,function(hero){
        if(hero.curLevel>=needLv)
        {
            currCnt+=1;
            if(currCnt >= needCnt)
            {
                //条件已经满足不在往下计算
                return;
            }
        }
    });
    return currCnt >= needCnt;
};
/*
* 任意needCnt个角色达到needLv级
* */
pro.findHeroCntData = function (needCnt , needLv ) {
    var tempLv = -1;
    var currCnt = 0;
    var tempList = this.heroBag.getItemList();
    _.map(tempList,function(hero){
        if(hero.curLevel>=needLv)
        {
            currCnt+=1;
            if(currCnt >= needCnt)
            {
                //条件已经满足不在往下计算
                tempLv = needLv;
                return;
            }
        }
    });
    return tempLv;
};


pro.checkUpdateLV = function (newLV) {
    newLV = Math.max(newLV, this.roleLevel);
    this.set('roleLevel', newLV);
};

/*
 *   商品对应背包是否已满
 *   @type {Number} 商品类型
 *   @itemId {Number} 商品类型参数
 *   @count {Number} 商品数量
 * */
pro.isBagFull = function (type, itemId, count) {
    switch (type) {
        case consts.GOODS_TYPE.HERO:
            return this.heroBag.isFull();
        case consts.GOODS_TYPE.PET:
            return this.petBag.isFull();
        case consts.GOODS_TYPE.EQUIP:
            return true;
        case consts.GOODS_TYPE.MONEY:
            return false;
        case consts.GOODS_TYPE.ITEM:
            return !this.bag.canAdd({
                playerId: this.id,
                itemId: itemId,
                count: count
            });
    }
};

/*
 *   是否有背包已满（模糊查询，不用确定某种物品）
 *   @type {Number} 商品类型
 *   @itemId {Number} 商品类型参数
 *   @count {Number} 商品数量
 * */
pro.isBagFullVague = function(){
    return this.heroBag.isFull() || this.equipBag.isFull() || !this.bag.isHasPosition();
}

/*
 *   充值处理
 *   @param {Number} money  充值金额
 *   @param {Number} diamond 获得钻石，不包括赠送的部分
 *   @param {Number} present 赠送的钻石
 * */
pro.onCharge = function (money, diamond, present) {
    // 充值处理
    this.setDiamond(this.diamondCnt + diamond + present);
    // 活动等接口可以监听此事件
    this.emit('onCharge', {money: money, diamond: diamond, present: present});

    var tmp = this.rechargeTotal+money;

    this.set('rechargeTotal',tmp);
  //  var newBarrierId = this.passedBarrierMgr.getNewBarrierId(consts.CHAPTER_TYPE.NORMAL);
    var oldBuyGetDiamond = this.buyGetDiamond;
    this.set('buyGetDiamond',this.buyGetDiamond+diamond, present);
    inviteManager.OnPlayerCharge(this,0,0,oldBuyGetDiamond);
};
/*
* 关卡结算
* */
pro.onBarrierSettlement= function(barrierId )
{
    this.emit('doBarrierSettlement',barrierId );
};

/*
 * 无尽积分结算
 * */
pro.onEndlessSettlement = function( score )
{
    this.emit('doEndlessSettlement',score );
};

/*
 *   功能是否开放
 * */
pro.funcOpen = function (funcId) {
    var funcData = dataApi.FunctionOpen.findById(funcId);
    if (funcData) {
        if (funcData.custom) {
            // 须通关指定关卡
            if (!this.passedBarrierMgr.isPassed(funcData.custom)) {
                return false;
            }
        }
        if (funcData.condition && !this.armBag.isArmAll()) {
            // 须穿戴所有装备
            return false;
        }
    }
    return true;
};

/*
 *   领取无尽赛果
 * */
pro.applyEndlessReport = function (report) {
    var awards = {};
    //// 累计连胜、连败
    //this.occasionManager.statResult(report.occasionId, report.result);
    // 领取奖励
    var occasionData = dataApi.EndlessType.findById(report.occasionId);
    if (occasionData) {
        awards.presentAwards = dropUtils.getDropItems(occasionData.giveDropId);
        this.applyDrops(awards.presentAwards);
        // 额外要显示对方奖励内容
        awards.otherPresentAwards = dropUtils.getDropItems(occasionData.giveDropId);
        if (report.result) {
            awards.winAwards = dropUtils.getDropItems(occasionData.winDropId);
            this.applyDrops(awards.winAwards);
        } else {
            awards.otherWinAwards = dropUtils.getDropItems(occasionData.winDropId);
        }
    }
    return awards;
};

pro.startEndlessPVPMatch = function (occasionId, effectBuffIds) {
    this.endlessPVPEffectBuffIds = effectBuffIds;
};

pro.startSingleEndlessFight = function (occasionId, effectBuffIds) {
    this.singleEndlessOccasionId = occasionId;
    this.effectBuffIds = effectBuffIds;
    this.singleEndlessFighting = true;
    this.singleEndlessReviveCnt = 0;
    this.singleEndlessCommitted = false;
    this.singleReopenBoxCnt = 0;
};

pro.stopSingleEndlessFight = function () {
    this.singleEndlessOccasionId = 0;
    this.singleEndlessFighting = false;
    this.singleEndlessReviveCnt = 0;
    this.effectBuffIds = [];
    this.singleEndlessCommitted = true;
    this.singleReopenBoxCnt = 0;
};

pro.increaseReopenBoxCnt = function () {
    this.set('singleReopenBoxCnt', this.singleReopenBoxCnt + 1);
};

pro.setSingleEndlessCommitted = function (singleEndlessCommitted, score) {
    this.singleEndlessCommitted = singleEndlessCommitted;
    this.singleEndlessScore = score;
};

pro.increaseSingleEndlessReviveCnt = function () {
    this.set('singleEndlessReviveCnt', this.singleEndlessReviveCnt + 1);
};

/*
 *   获取宝箱增加的倍数
 * */
pro.getEndlessBoxAddDouble = function (effectBuffIds) {
    var effectType = consts.ENDLESS_BUFF_EFFECT_TYPE.AWARD,
        totalDouble = 0;
    effectBuffIds = effectBuffIds || this.buffManager.getEffectBuffIds();
    effectBuffIds.forEach(function (buffId) {
        var buffData = dataApi.EndlessBuff.findById(buffId);
        if (buffData && buffData.effectType === effectType) {
            totalDouble += buffData.effectNum;
        }
    });
    return totalDouble;
};

pro.getScoreAdd = function () {
    var total = 0;
    if (this.curHero) {
        total += this.curHero.getScoreAdd();
    }
    total += this.buffManager.getEffectTotalByEffectType(Consts.ENDLESS_BUFF_EFFECT_TYPE.SCORE);
    return total;
};

/*
* 重置每日任务时间
* */
pro.resetDailyMissionTik = function () {
    var now = Date.now();
    logger.debug('resetDailyMissionTik now = %s', now);
    this.set('dailyMissionReset', now);
};

/*
 * 每日活动体力重置
 * */
pro.resetDailyActivityEnergyTik = function () {
    var now = Date.now();
    logger.debug('dailyActivityEnergyReset now = %s', now);
    this.set('dailyActivityEnergyReset', now);
};

/*
*  重置每日无尽产出英雄数量
* */
pro.resetEndlessBoxToHeroCnt = function (now) {
    this.set('dailyEndlessBoxToHeroCnt',0);
    this.set('dailyEndlessBoxToHeroCntRstTick',now.getTime());
};

pro.setFristRechargeAwardTime = function ( time ) {
    this.set('fristRechargeAwardTime',time);
}

/*
*  无尽每日获取英雄数量累计
*  返回false表示不能累计，反之可以累计
* */
pro.isCanAddDailyEndlessHero = function () {
    var Endless_GetRoleNumLimit = dataApi.CommonParameter.getOptionValue('Endless_GetRoleNumLimit',20);
    if(this.dailyEndlessBoxToHeroCnt < Endless_GetRoleNumLimit){
        return true;
    }else {
        return false;
    }
};

/*
* 累加每日无尽获得的英雄数量
* */
pro.addDailyEndlessHeroCnt = function (addNum) {
    if(!!addNum && addNum > 0) {
        this.set('dailyEndlessBoxToHeroCnt',( this.dailyEndlessBoxToHeroCnt +  addNum ) );
    }
};

pro.getMailInfo = function () {
    return this.mailInfo;
};

pro.setMailInfo = function (mails) {
    this.mailInfo = mails;
};

/*
* 多个货币是否足够
* priceType：货币类型组  '10#11#12'
* price    ：货币价格组  '10#11#12'
* 必须一一对应
 * */
pro.isEnoughSomeTypeMoney = function ( priceType,price ) {
    if(priceType==0 && price == 0 ){
        return true;
    }
    var priceTypeList = utils.parseParams(priceType,'#') ;
    var priceList = utils.parseParams(price,'#');
    if( priceTypeList.length != priceList.length ){
        logger.error("isEnoughSomeTypeMoney priceType length != price length");
        return false;
    }
    var i = 0; l = priceTypeList.length;
    for(i = 0 ; i < l ; ++i ){
        var myMoney = this.getMoneyByType(priceTypeList[i]);
        if( myMoney < priceList[i] ){
            return false;
        }
    }
    return true;
};

pro.setMoneyGroup = function ( priceType,price ,useWay) {
    var priceTypeList = utils.parseParams(priceType,'#') ;
    var priceList = utils.parseParams(price,'#');
    if( priceTypeList.length != priceList.length ){
        logger.error("isEnoughSomeTypeMoney priceType length != price length");
        return false;
    }
    var i = 0; l = priceTypeList.length;
    for(i = 0 ; i < l ; ++i ){
        var myMoney = this.getMoneyByType(priceTypeList[i]);
        this.setMoneyByType(priceTypeList[i], myMoney -  priceList[i],useWay);
    }
};

/*
* 随机无尽加成效果且保存
* */
pro.randEndlessAddEffect = function () {
    var tmpNum = 1000;
    var EndlessBonusMin = dataApi.CommonParameter.getOptionValue('EndlessBonusMin',0.1) * tmpNum;
    var EndlessBonusMax = dataApi.CommonParameter.getOptionValue('EndlessBonusMax',0.9) * tmpNum;
    var randnum = _.random(EndlessBonusMin,EndlessBonusMax)*0.001;
    var MinCanJumpNum   = dataApi.CommonParameter.getOptionValue('MinCanJumpNum',1);
    var tmpCnt =  this.endlessSingleOldWave > 0 ? this.endlessSingleOldWave : MinCanJumpNum;
    //策划要求向上取整
    var addEffect = randnum * tmpCnt;
    addEffect = Math.ceil(addEffect);
    this.set('endlessAddEffect',addEffect);
    return addEffect;
};
module.exports = Player;

