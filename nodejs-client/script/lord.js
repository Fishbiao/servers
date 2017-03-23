var crypto = require('crypto');

var log4js = require('log4js'),
    logger = log4js.getLogger(__filename),
    _ = require('underscore');

var envConfig = require('../config/env.json'),
    config = require('../config/' + envConfig.env + '/config'),
    pomelo = require('./pomelo'),
    cmds = require('./cmds');

var MAX_FPS = 60;
var testPos = -1;
var fristPos = 0;
function testCopmose(pos){	 
	++testPos; 
	if(0 == testPos){
		fristPos = pos;
	}else if(testPos==4){
	  cmds.compose(1,fristPos,function(data){
			  logger.info('compose data = %j', data);
		  })
	} 	
}

function enterSceneRes(data) {
//    monitor(END,'enterScene',2);
    logger.info(' enterSceneRes curPlayer = %j \n\n', data.curPlayer);

    //cmds.buyBarrierPromote(10010, function (data) {
    //    logger.info('buyBarrierPromote code = %s, drops = %j', data.code, data.drops);
    //})


}

function afterLogin(data, MAC) {
    logger.info('after login begin enter scene...%s',MAC);
    pomelo.player = null;
//    pomelo.isDead = false;

    /**
     * 处理登录请求
     */
    function login(data) {
        if (data.code === 1003) {
            //need create player.
            cmds.createPlayer(MAC, function (success) {
                if (!success) {
                    logger.info('createPlayer create failed!');
                    return;
                }
                cmds.enterScene(enterSceneRes);
//                setTimeout(cmds.enterScene, 1000, enterSceneRes);
            });
            return;
        }
        logger.info('entry ok!already has player.try enter scene...');
        // pass arguments to the callback function of 'setTimeout'.
//        setTimeout(cmds.enterScene, 1000, enterSceneRes);
        cmds.enterScene(enterSceneRes);
    }

    login(data);

}
/*
pomelo.on('onKick', function () {
    logger.info('You have been kicked offline for the same account logined in other place.');
});

pomelo.on('disconnect', function (reason) {
    logger.info('disconnect invoke!' + reason);
});

pomelo.on('heroBag.update', function (data) {
   // logger.info('heroBag.update bagData = %j', data.bagData);
});

pomelo.on('heroBag.remove', function (data) {
  //  logger.info('heroBag.remove pos = %s', data.pos);
});

pomelo.on('player.updateProp', function (data) {
   logger.info('player.updateProp prop = %s, value = %j', data.prop, data.value);
});

pomelo.on('itemBag.update', function (data) {
   // logger.info('itemBag.update itemId = %s, pos = %s, itemCount = %s', data.itemId, data.pos, data.itemCount);
});

pomelo.on('chapter.unlock', function (data) {
   // logger.info('chapter.unlock chapterId = %s, drawFlag = %s', data.chapterId, data.drawFlag);
});

pomelo.on('petBag.update', function (data) {
   // logger.info('petBag.update bagData = %j', data.bagData);
});

pomelo.on('petBag.remove', function (data) {
   // logger.info('petBag.remove pos = %s', data.pos);
});

pomelo.on('passedBarrier.update', function (data) {
  //  logger.info('passedBarrier.update barrierId = %s, star = %s, dailyTimes = %s, resetTimes = %s', data.barrierId,
   //     data.star, data.dailyTimes, data.resetTimes);
});

pomelo.on('playerShop.refreshBuyCount', function (data) {
    //logger.info('playerShop.refreshBuyCount records = %j', data.records);
});

pomelo.on('playerShop.refresh', function (data) {
   // logger.info('playerShop.refresh');
});

pomelo.on('activity.new', function (data) {
   
   //logger.info('activity.new id = %s, name = %s, showRedSpot = %s, type = %s, leftTime = %s, desc = %s, detail = %j',
  //      data.id, data.name, data.showRedSpot, data.type, data.leftTime, data.desc, data.detail);
});

pomelo.on('activity.remove', function (data) {
    //logger.info('activity.remove id = %s', data.id);
});

pomelo.on('activity.refreshRedSpot', function (data) {
    //logger.info('activity.refreshRedSpot id = %s, showRedSpot = %s', data.id, data.showRedSpot);
});

pomelo.on('armBag.refresh', function (data) {
    //logger.info('armBag.refresh part = %s, refineLV = %s, refineExp = %s, equip = %j', data.part, data.refineLV,
    //    data.refineExp, data.equip);
});

pomelo.on('equipBag.update', function (data) {
  //   logger.info('equipBag.update bagData = %j', data.bagData);
});

pomelo.on('equipBag.remove', function (data) {
    // logger.info('equipBag.remove pos = %s', data.pos)
});

pomelo.on('scoreRankingList.award', function (data) {
    // logger.info('scoreRankingList.award rank = %s, drew = %s', data.rank, data.drew);
});

pomelo.on('weekScoreRankingList.award', function (data) {
    // logger.info('weekScoreRankingList.award rank = %s, drew = %s', data.rank, data.drew);
});

pomelo.on('scoreRankingList.update', function (data) {
   //  logger.info('scoreRankingList.update playerId = %s, rank = %s, score = %s',
   //      data.playerId, data.rank, data.score);
});

pomelo.on('weekScoreRankingList.update', function (data) {
   //  logger.info('weekScoreRankingList.update playerId = %s, rank = %s, score = %s, name = %s, headPicId = %s, heroId = %s',
   //      data.playerId, data.rank, data.score, data.name, data.headPicId, data.heroId);
});

pomelo.on('endlessBuff.refresh', function (data) {
    // logger.info('endlessBuff.refresh dataId = %s, cnt = %s, buyCnt = %s', data.dataId, data.cnt, data.buyCnt);
});

pomelo.on('endlessOccasion.refresh', function (data) {
  //   logger.info('endlessOccasion.refresh occasionId = %s, dailyCnt = %s, maxWin = %s, maxLose = %s', data.occasionId,
  //       data.dailyCnt, data.maxWin, data.maxLose);
});

pomelo.on('wakeUpBag.update', function (data) {
  //   logger.info('wakeUpBag.update pos = %s, itemId = %s, itemCount = %s', data.pos, data.itemId, data.itemCount);
});

pomelo.on('endless.matchSuccess', function (data) {
    // logger.info('endless.matchSuccess target = %j', data.target);

    // var percent = 0;
    // var timer = setInterval(function () {
    //     percent += 10;
    //     cmds.loadingPercent(percent);
    //     if (percent >= 100) {
    //         clearInterval(timer);
    //     }
    // }, 1000);
});

pomelo.on('endless.onLoading', function (data) {
   //  logger.info('endless.onLoading playerId = %s, percent = %s, tick = %s', data.playerId, data.percent, data.tick);
});

pomelo.on('endless.startBattle', function (data) {
  //   logger.info('endless.startBattle endlessId = %s', data.endlessId);
    //cmds.endlessRevive(2, function (data) {
    //    logger.info('#1 endlessRevive  code = %s, reviveCnt = %s', data.code, data.reviveCnt);
    //    cmds.endlessRevive(2, function (data) {
    //        logger.info('#2 endlessRevive  code = %s, reviveCnt = %s', data.code, data.reviveCnt);
    //        cmds.endlessRevive(2, function (data) {
    //            logger.info('#3 endlessRevive  code = %s, reviveCnt = %s', data.code, data.reviveCnt);
    //        });
    //    });
    //});

    var score = 0, finishPro = 0.05;
    var curBattleId = 10000;
    var timer = setInterval(function () {
        score += _.random(1, 5000);
        var end = Math.random() < finishPro;//curBattleId >= 10016;
        cmds.reportScore(score, end, curBattleId++, function (data) {
            logger.info('reportScore code = %s, score = %s, otherScore = %s, curBattleId = %s, end = %s, otherEnd = %s',
                data.code, score, data.otherScore, curBattleId, end, data.otherEnd);
            if (end) {
                logger.info('reportScore highScore = %s, curWeekRank = %s, awards = %j', data.highScore, data.curWeekRank, data.awards);

                cmds.reopenBox(2, function (data) {
                    logger.info('reopenBox code = %s, awards = %j', data.code, data.awards);
                });
            }
        });
        if (end) {
            clearInterval(timer);
        }
    }, 3000);
});

pomelo.on('endless.evaluate', function (data) {
    // logger.info('endless.evaluate endlessId = %s, result = %s, otherScore = %s, presentAwards = %j, winAwards = %j',
    //     data.endlessId, data.result, data.otherScore, data.presentAwards, data.winAwards);
});


pomelo.on('Mission.refresh', function (data) {
    // logger.info('Mission.refresh %j',data);
});

pomelo.on('Mission.reset', function (data) {
   //  logger.info('\n\n\n\n\n\nMission.reset %j',data);
});
 
pomelo.on('fragItemBag.update', function (data) {
      logger.info('ragItemBag.update %j',JSON.stringify(data));
});*/

function tick() {
}

try {
    var _MAC ='fisher';// Math.random(1000000,9999999),
        pwd = '123456';

    log4js.configure('./config/log4js.json');

    setInterval(tick, 1000 / MAX_FPS);

    console.log('connecting gate %s:%s', config.apps.host, config.apps.port);
    cmds.connect(config.apps.host, config.apps.port, function () {
        console.log('connect gate success %s:%s ok!', config.apps.host, config.apps.port);

        cmds.queryEntry(_MAC, function (host, port) {
            logger.info('connector %s:%s', host, port);

            cmds.connect(host, port, function () {
                logger.info('connect connector %s:%s ok!', host, port);
                //var md5Encoder = crypto.createHash('md5');
                //md5Encoder.update(pwd);
                //pwd = md5Encoder.digest('hex');
                cmds.entry(host, port, _MAC, pwd, function (data) {
                    if (data.code !== 200 && data.code !== 1003) {
                        logger.info('Login failed! data : %s',data.code);
                        return;
                    }
                    logger.info('Login ok!');
                    afterLogin(data, _MAC);
                });
            });
        });
    });
} catch (ex) {
    logger.error('err: ' + ex.stack);
}