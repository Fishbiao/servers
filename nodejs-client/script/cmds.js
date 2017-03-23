/**
 * Created with JetBrains WebStorm.
 * User: kilua
 * Date: 13-10-14
 * Time: 下午5:50
 * To change this template use File | Settings | File Templates.
 */

var pomelo = require('./pomelo');

var cmds = module.exports = {};

/*
 *   连接服务器
 * */
cmds.connect = function (host, port, cb) {
    pomelo.init({host: host, port: port, log: true}, cb);
};
/*
 *   查询入口服务器
 *   @param {String} uid client user id.
 *   @param {Function} callback, signature: function callback(connectorServer, connectorServerPort){}
 * */
cmds.queryEntry = function (uid, callback) {
    pomelo.request('gate.gateHandler.queryEntry', {uid: uid}, function (data) {
        pomelo.disconnect();
        if (data.code !== 200) {
            console.error('queryEntry failed!');
            callback();
            return;
        }
        callback(data.host, data.port);
    });
};

/*
 *   从connector server登录
 *   @param {String} host connector server ip.
 *   @param {Number} port connector server port.
 *   @param {String} MAC client MAC.
 *   @param {Function} callback signature: function callback(data){}
 * */
cmds.entry = function (host, port, MAC, pwd, callback) {
    pomelo.request('connector.entryHandler.entry', {MAC: MAC, password: pwd,platform:"default"}, function (data) {
        callback(data);
    });
};

cmds.enterScene = function (cb) {
    console.info('enter scene...');
    pomelo.request("area.playerHandler.enterScene", {}, cb);
};

cmds.createPlayer = function (MAC, cb) {
    pomelo.request('connector.roleHandler.createPlayer', {MAC: MAC, name: MAC, pwd: MAC, picId: 1},
        function (res) {
            var success = (res.code === 200);
            cb(success);
        });
};

/*
 *   升级猎魔人技能
 * */
cmds.levelUpSkill = function (pos, skillType, addLV, cb) {
    pomelo.request('area.heroHandler.levelUpSkill', {pos: pos, skillType: skillType, addLV: addLV}, cb);
};

/*
 *   升级猎魔人
 * */
cmds.levelUpHero = function (pos, items, heroPosList, cb) {
    pomelo.request('area.heroHandler.levelUp', {pos: pos, items: items, heroPosList: heroPosList}, cb);
};

/*
 *   突破猎魔人
 * */
cmds.breakThroughHero = function (pos, items, heroPosList, cb) {
    pomelo.request('area.heroHandler.breakThrough', {pos: pos, items: items, heroPosList: heroPosList}, cb);
};


/*
 *   角色-拆分
 * */
cmds.splittingUp = function (pos, cb) {
    pomelo.request('area.heroHandler.splittingUp', {pos: pos}, cb);
};

/*
 *   角色--聚变
 * */
cmds.compose = function (id, pos,cb) {
    console.log('cmds.compose id = %s , pos = %s ',id , pos);
	var heroPosList = [];
	var i = pos;
    heroPosList.push(i);i++;
    heroPosList.push(i);i++;
    heroPosList.push(i);i++;
    heroPosList.push(i);i++;
    heroPosList.push(i);i++;
    pomelo.request('area.heroHandler.compose', {id: id,heroPosList:heroPosList}, cb);
};

/*
 *   解锁章节
 * */
cmds.unlockChapter = function (chapterId, cb) {
    pomelo.request('area.playerHandler.unlockChapter', {chapterId: chapterId}, cb);
};

/*
 *   扫荡
 * */
cmds.wipe = function (barrierId, cb) {
    pomelo.request('area.playerHandler.wipe', {barrierId: barrierId}, cb);
};

/*
 *   购买扫荡券
 * */
cmds.buyWipeTicket = function (cb) {
    pomelo.request('area.playerHandler.buyWipeTicket', {}, cb);
};

/*
 *   购买关卡次数
 * */
cmds.resetBarrierAtkCnt = function (barrierId, cb) {
    pomelo.request('area.playerHandler.resetBarrierAtkCnt', {barrierId: barrierId}, cb);
};

/*
 *   购买体力
 * */
cmds.buyEnergy = function (cb) {
    pomelo.request('area.playerHandler.buyEnergy', {}, cb);
};

/*
 *   领取章节星级宝箱
 * */
cmds.drawChapterStarAwards = function (chapterId, starCondId, cb) {
    pomelo.request('area.playerHandler.drawChapterStarAwards', {chapterId: chapterId, starCondId: starCondId}, cb);
};

/*
 *   复活
 * */
cmds.revive = function (pos, cb) {
    pomelo.request('area.heroHandler.revive', {pos: pos}, cb);
};

/*
 *   购买战斗时间
 * */
cmds.buyTime = function (cb) {
    pomelo.request('area.playerHandler.buyTime', {}, cb);
};

/*
 *   创建关卡
 *   @param {Number} barrierId 关卡id
 * */
cmds.createBarrier = function (barrierId, cb) {
    pomelo.request('area.playerHandler.createBarrier', {barrierId: barrierId}, cb);
};

cmds.exitBarrier = function (status, star, power, superSkillCnt, jumpCnt, jumpSkillCnt, cb) {
    pomelo.request('area.playerHandler.exitBarrier', {
        status: status, star: star, power: power,
        superSkillCnt: superSkillCnt, jumpCnt: jumpCnt, jumpSkillCnt: jumpSkillCnt
    }, cb);
};

/*
 *   设出战英雄
 * */
cmds.setCurFightHeroBrother = function (type,pos, cb) {
    pomelo.request('area.playerHandler.setCurFightHeroBrother', {type: type,pos:pos}, cb);
};


/*
 *   解锁购买猎魔人
 * */
cmds.openHeroLock = function (id, cb) {
    pomelo.request('area.heroHandler.openHeroLock', {id: id}, cb);
};
/*
 *   购买猎魔人
 * */
cmds.buyHero = function (heroId, cb) {
    pomelo.request('area.heroHandler.buyHero', {heroId: heroId}, cb);
};

/*
 *   添加物品，GM命令
 * */
cmds.addItem = function (itemId, cnt, cb) {
    pomelo.request('area.gmHandler.addItem', {itemId: itemId, count: cnt}, cb);
};

/*
 *   添加物品，GM命令
 * */
cmds.addFragItem = function (itemId, cnt, cb) {
    pomelo.request('area.gmHandler.addFragItem', {itemId: itemId, count: cnt}, cb);
};

/*
 *   添加猎魔人，GM命令
 * */
cmds.addHero = function (heroId, cb) {
    pomelo.request('area.gmHandler.addHero', {heroId: heroId}, cb);
};

/*
 *   设置猎魔人等级，GM命令
 * */
cmds.setHeroLV = function (pos, level, cb) {
    pomelo.request('area.gmHandler.setHeroLV', {pos: pos, level: level}, cb);
};

/*
 *   添加宠物，GM命令
 * */
cmds.addPet = function (petId, cb) {
    pomelo.request('area.gmHandler.addPet', {petId: petId}, cb);
};

/*
 *   设置宠物等级，GM命令
 * */
cmds.setPetLV = function (pos, level, cb) {
    pomelo.request('area.gmHandler.setPetLV', {pos: pos, level: level}, cb);
};

/*
 *   设置钻石，GM命令
 * */
cmds.setDiamond = function (diamond, cb) {
    pomelo.request('area.gmHandler.setDiamond', {diamond: diamond}, cb);
};

/*
 *   设置金币，GM命令
 * */
cmds.setGold = function (gold, cb) {
    pomelo.request('area.gmHandler.setGold', {gold: gold}, cb);
};

/*
 *   设置体力，GM命令
 * */
cmds.setSpirit = function (spirit, cb) {
    pomelo.request('area.gmHandler.setSpirit', {spirit: spirit}, cb);
};

/*
 *   清空背包，GM命令
 * */
cmds.cleanItemBag = function (cb) {
    pomelo.request('area.gmHandler.cleanItemBag', {}, cb);
};

/*
 *   清空猎魔人背包，GM命令
 * */
cmds.cleanHeroBag = function (cb) {
    pomelo.request('area.gmHandler.cleanHeroBag', {}, cb);
};

/*
 *   清空宠物背包，GM命令
 * */
cmds.cleanPetBag = function (cb) {
    pomelo.request('area.gmHandler.cleanPetBag', {}, cb);
};

/*
 *   设置第几章第几关之前的所有关卡都通关，GM命令
 * */
cmds.clearCustom = function (barrierId, cb) {
    pomelo.request('area.gmHandler.clearCustom', {barrierId: barrierId}, cb);
};

/*
 *   设置当前用户可以打的那个关卡几星通关，GM命令
 * */
cmds.clearCustomNow = function (barrierId, star, cb) {
    pomelo.request('area.gmHandler.clearCustomNow', {barrierId: barrierId, star: star}, cb);
};

/*
 *   GM模拟充值
 * */
cmds.charge = function (money, diamond, present, cb) {
    pomelo.request('area.gmHandler.charge', {money: money, diamond: diamond, present: present}, cb);
};

/*
 *   GM手动保存总榜
 * */
cmds.saveScoreRankingList = function (cb) {
    pomelo.request('world.gmHandler.saveScoreRankingList', {}, cb);
};

/*
 *   GM手动保存周榜
 * */
cmds.saveWeekScoreRankingList = function (cb) {
    pomelo.request('world.gmHandler.saveWeekScoreRankingList', {}, cb);
};

/*
 *   宠物突破
 * */
cmds.petBreakthrough = function (pos, cb) {
    pomelo.request('area.petHandler.petBreakthrough', {pos: pos}, cb);
};

/*
 *   宠物升级
 * */
cmds.petUpgrade = function (pos, items, pets, cb) {
    pomelo.request('area.petHandler.petUpgrade', {pos: pos, items: items, pets: pets}, cb);
};

/*
 *   出售物品
 * */
cmds.sellItem = function (slot, cb) {
    pomelo.request('area.itemHandler.sell', {slot: slot}, cb);
};

/*
 *   保存客户端数据
 * */
cmds.saveData = function (saveData, cb) {
    pomelo.request('area.clientSaveHandler.save', {saveData: saveData}, cb);
};

/*
 *   读取客户端保存数据
 * */
cmds.loadData = function (cb) {
    pomelo.request('area.clientSaveHandler.load', {}, cb);
};

/*
 *   报告引导完成，领取奖励
 * */
cmds.guideFinish = function (guideId, cb) {
    pomelo.request('area.guideHandler.finish', {guideId: guideId}, cb);
};

/*
 *   提交建议
 * */
cmds.commitSuggestion = function (content, cb) {
    pomelo.request('area.suggestionHandler.commit', {content: content}, cb);
};

/*
 *   获取商店页面列表
 * */
cmds.getShopPageList = function (cb) {
    pomelo.request('area.shopHandler.getPageList', {}, cb);
};

/*
 *   购买商品
 * */
cmds.buyGoods = function (goodsId, type, typeId, unit, priceType, price, cb) {
    pomelo.request('area.shopHandler.buy', {
        goodsId: goodsId, type: type, typeId: typeId, unit: unit,
        priceType: priceType, price: price
    }, cb);
};

/*
 *   获取活动列表
 * */
cmds.getActivities = function (cb) {
    pomelo.request('area.activityHandler.list', {}, cb);
};

/*
 *   查看活动详情
 * */
cmds.viewActivity = function (actId, cb) {
    pomelo.request('area.activityHandler.viewDetail', {actId: actId}, cb);
};

/*
 *   购买优惠商店商品
 * */
cmds.buyDiscountShopGoods = function (actId, goodsId, cb) {
    pomelo.request('area.activityHandler.buyGoods', {actId: actId, goodsId: goodsId}, cb);
};

/*
 *   领取活动奖励
 * */
cmds.drawActivityAwards = function (actId, condId, cb) {
    pomelo.request('area.activityHandler.drawAwards', {actId: actId, condId: condId}, cb);
};

/*
 *   领取邀请码奖励
 * */
cmds.drawActivityInvitAwards = function (id, condParam,inviteCode, cb) {
    pomelo.request('area.activityHandler.drawInvitAwards', { id : id, condParam : condParam , inviteCode : inviteCode }, cb);
};


/*
 *   活动吃鸡获得体力
 * */
cmds.drawActivityGetEnergy = function (actId,id, cb) {
    console.log(' drawActivityGetEnergy');
	pomelo.request('area.activityHandler.getEnergy', {actId: actId,id: id}, cb);
};

/*
 *   兑换码
 * */
cmds.snExchange = function (interface,sn, cb) {
    console.log(' snExchange');
	pomelo.request('area.activityHandler.snExchange', {interface: interface,sn: sn}, cb);
};


/*
 *   读取运营标志
 * */
cmds.getOpFlags = function (cb) {
    pomelo.request('world.gmHandler.getOpFlags', {}, cb);
};

/*
 *   修改运营标志
 * */
cmds.setOpFlags = function (opFlags, cb) {
    pomelo.request('world.gmHandler.setOpFlags', {opFlags: opFlags}, cb);
};

/*
 *   装备
 * */
cmds.arm = function (pos, cb) {
    pomelo.request('area.equipHandler.arm', {pos: pos}, cb);
};

/*
 *   精炼
 * */
cmds.refine = function (pos, cb) {
    pomelo.request('area.equipHandler.refine', {pos: pos}, cb);
};

/*
 *   获取总榜
 * */
cmds.getScoreList = function (cb) {
    pomelo.request('world.rankingListHandler.getScoreList', {}, cb);
};

/*
 *   获取周榜
 * */
cmds.getWeekScoreList = function (cb) {
    pomelo.request('world.rankingListHandler.getWeekScoreList', {}, cb);
};

/*
 *   预览奖励
 * */
cmds.previewAwards = function (type, cb) {
    pomelo.request('world.rankingListHandler.previewAwards', {type: type}, cb);
};

/*
 *   领取排行榜奖励
 * */
cmds.drawRankingAwards = function (type, cb) {
    pomelo.request('area.rankingListHandler.drawAwards', {type: type}, cb);
};

/*
 *   预览自己的排行榜奖励
 * */
cmds.previewMyRankingAwards = function (type, cb) {
    pomelo.request('area.rankingListHandler.previewMyAwards', {type: type}, cb);
};

/*
 *   装备觉醒
 * */
cmds.wakeUp = function (part, cb) {
    pomelo.request('area.equipHandler.wakeUp', {part: part}, cb);
};

/*
 *   熔炼
 * */
cmds.melt = function (posList, cb) {
    pomelo.request('area.equipHandler.melt', {posList: posList}, cb);
};

/*
 *   激活洗练
 * */
cmds.openWash = function (pos, cb) {
    pomelo.request('area.equipHandler.openWash', {pos: pos}, cb);
};

/*
 *   获取加成商店商品列表
 * */
cmds.getBuffShopItems = function (cb) {
    pomelo.request('area.endlessBuffHandler.getShopItems', {}, cb);
};

/*
 *   购买加成项目
 * */
cmds.buyBuffItem = function (dataId, cb) {
    pomelo.request('area.endlessBuffHandler.buy', {dataId: dataId}, cb);
};

/*
 *   进入无尽模式战斗
 * */
cmds.endlessFight = function (occasionId, cb) {
    pomelo.request('area.endlessHandler.fight', {occasionId: occasionId}, cb);
};

/*
 *   查看无尽赛事
 * */
cmds.viewEndlessOccasion = function (mode, cb) {
    pomelo.request('area.endlessHandler.viewOccasion', {mode: mode}, cb);
};

/*
 *   添加装备
 * */
cmds.addEquip = function (equipId, cnt, cb) {
    pomelo.request('area.gmHandler.addEquip', {equipId: equipId, cnt: cnt}, cb);
};

/*
 *   添加战斗勋章
 * */
cmds.addChapterKey = function (cnt, cb) {
    pomelo.request('area.gmHandler.addChapterKey', {cnt: cnt}, cb);
};

/*
 *   添加竞技点
 * */
cmds.addEndlessPkPoint = function (cnt, cb) {
    pomelo.request('area.gmHandler.addEndlessPkPoint', {cnt: cnt}, cb);
};

/*
 *   添加熔炼值
 * */
cmds.addEquipMeltPoint = function (cnt, cb) {
    pomelo.request('area.gmHandler.addEquipMeltPoint', {cnt: cnt}, cb);
};

/*
 *   添加觉醒材料
 * */
cmds.addWakeUpItem = function (itemId, cnt, cb) {
    pomelo.request('area.gmHandler.addWakeUpItem', {itemId: itemId, count: cnt}, cb);
};

/*
 *   无尽PVP匹配
 * */
cmds.endlessMatch = function (occasionId, cb) {
    pomelo.request('area.endlessHandler.match', {occasionId: occasionId}, cb);
};

cmds.loadingPercent = function (percent) {
    pomelo.notify('world.endlessHandler.loadingPercent', {percent: percent});
};

/*
 *   定时反馈得分
 * */
cmds.reportScore = function (score, end, curBattleId, cb) {
    pomelo.request('world.endlessHandler.reportScore', {score: score, end: end ? 1 : 0, curBattleId: curBattleId}, cb);
};

/*
 *   查看赛果
 * */
cmds.viewEndlessReports = function (cb) {
    pomelo.request('area.endlessHandler.viewReports', {}, cb);
};

/*
 *   领取赛果奖励
 * */
cmds.drawEndlessAwards = function (endlessId, cb) {
    pomelo.request('area.endlessHandler.drawAwards', {endlessId: endlessId}, cb);
};

/*
 *   无尽复活
 * */
cmds.endlessRevive = function (occasionId, cb) {
    pomelo.request('area.endlessHandler.revive', {occasionId: occasionId}, cb);
};

/*
 *   提交无尽单人模式结算
 * */
cmds.commitSingleEndless = function (score, cb) {
    pomelo.request('area.endlessHandler.commit', {score: score}, cb);
};

/*
 *   再开宝箱
 * */
cmds.reopenBox = function (occasionId, cb) {
    pomelo.request('area.endlessHandler.reopenBox', {occasionId: occasionId}, cb);
};

/*
 *   离线再上时，检查下是否有宝箱没开
 * */
cmds.openBox = function (cb) {
    pomelo.request('area.endlessHandler.openBox', {}, cb);
};

/*
 *   获取充值列表
 * */
 cmds.getRechargeList = function (cb) {
    pomelo.request('area.rechargeHandler.list', {}, cb);
};

/*
 *   充值购买
 * */
 cmds.rechargeBuy = function (id,cb) {
    pomelo.request('area.rechargeHandler.buy', {id:id}, cb);
};

/*
 *   领取任务成就奖励
 * */
 cmds.missionAward = function (missionId,cb) {
    pomelo.request('area.missionHandler.drawAwards', {missionId:missionId}, cb);
};

/*
 *   玩家行为
 * */
 cmds.playerBehavior = function (id,parameter1,cb) {
    pomelo.request('area.statisticHandler.playerBehavior', {id:id,parameter1:parameter1}, cb);
};

/*
 *   生成id
 * */
 cmds.makeOrderId = function (productId,cb) {
    pomelo.request('area.shopHandler.makeOrderId', {productId:productId}, cb);
};

/*
 *   创建名字
 * */
 cmds.createPlayerName = function (name,cb) {
    pomelo.request('area.playerHandler.createPlayerName', {name:name}, cb);
};

/*
 *   获得邮件列表
 * */
 cmds.getMailTitle = function (cb) {
    pomelo.request('area.mailHandler.getMailTitle', {}, cb);
};


/*
 *   攻打随机boss
 * */
 cmds.atkRandBoss = function (randomBossId,cb) {
    pomelo.request('area.playerHandler.atkRandBoss', {randomBossId:randomBossId}, cb);
};

/*
 *   atkRandBoss
 * */
 cmds.exitRandBoss = function (currHp,randomBossId,cb) {
    pomelo.request('area.playerHandler.exitRandBoss', {currHp:currHp,randomBossId:randomBossId}, cb);
};

/*
 *   获取随机商店信息
 * */
 cmds.getRandomShopInfo = function (cb) {
    pomelo.request('area.randomShopHandler.getRandomShopInfo', {}, cb);
};

/*
 *   购买随机商品
 * */
 cmds.buyRandGoods = function (goodsId , cb) {
    pomelo.request('area.randomShopHandler.buy', {goodsId:goodsId}, cb);
};

/*
 *   刷新随机商品
 * */
 cmds.refreshRandGoods = function ( cb) {
    pomelo.request('area.randomShopHandler.refresh', {}, cb);
};

/*
 *   碎片合成
 * */
 cmds.fragItemComose = function ( itemId, cb) {
    pomelo.request('area.fragItemHandler.compose', {itemId:itemId}, cb);
};

/*
 *   夺宝
 * */
cmds.snatchTreasures = function ( single, cb) {
    pomelo.request('area.snatchTreasuresHandler.snatch', {isSingle:single}, cb);
};

/*
 *   领取联盟奖励
 * */
cmds.drawUnion = function (_actId, _cardType, cb) {// 1为月卡 2为永久卡 3为周卡
    pomelo.request('area.activityHandler.drawUnion', {actId:_actId,cardType:_cardType}, cb);
};

/*
 *   购买关卡商店
 * */
cmds.buyBarrierPromote = function ( _dropId, cb) {
    pomelo.request('area.playerHandler.buyBarrierPromote', {dropId:_dropId}, cb);
};