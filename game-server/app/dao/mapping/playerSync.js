/**
 * Created by employee11 on 2015/12/17.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../util/utils');

var playerSync = module.exports = {};
//'bronzeCoin','silverCoin','goldCoin'
playerSync.updatePlayer = function (client, player, cb) {
    var sql = 'UPDATE player SET roleLevel =?,exp=?,VIPLevel=?,diamondCnt=?,goldCnt=?,totalRechargeNum=?,' +
            'dispatchEnergyTime = ?, energy=?, buyEnergyCnt = ?,resetBuyEnergyCntTime = ?,curHeroPos = ?,currBrotherHeroPoss = ?,curPetPos = ?,' +
            'keyCount = ?, wipeTicket = ?,reviveCnt = ?,reviveCntResetTick = ?, highPower = ?, dailyFreeRefine = ?, ' +
            'dailyRefineResetTick = ?, dailyDiamondRefine = ?, comPoint=?, meltPoint = ?, washPoint = ?, endlessBuffBuyCntResetTick = ?,' +
            'endlessOccasionCntResetTick = ?,highScore = ?,weekHighScore = ?,weekHighScoreResetTick = ? ,canBuyHeroList = ?,dailyMissionReset = ?  , '+
            'dailyActivityEnergyReset = ? , dailyEndlessBoxToHeroCnt = ?,rechargeTotal = ? ,fristRechargeAwardTime = ? ,setNameCnt = ? ,'+
            'inviteId = ?,inviteCode = ?,inviteCount = ?,buyGetDiamond = ?,endlessSingleOldWave = ?,endlessAddEffect = ? ,bronzeCoin = ?, silverCoin = ? , goldCoin = ? , randRefreshCoin = ? ,challengeTicket = ? , '+
            'dailyEndlessBoxToHeroCntRstTick = ?,snatchSingleCnt = ?,weekCardEndTick = ?,monthCardEndTick = ?,foreverCardEndTick = ?,weekCardWelfareTick = ?,monthCardWelfareTick = ?,foreverCardWelfareTick = ?,  '+
            'barrierPromoteDropIds = ?, barrierPromoteEndTick = ?  '+
            'where id=?',
        args = [
            player.roleLevel, player.exp, player.VIPLevel, player.diamondCnt, player.goldCnt, player.totalRechargeNum,
            player.dispatchEnergyTime, player.energy, player.buyEnergyCnt, player.resetBuyEnergyCntTime,
            player.curHeroPos,JSON.stringify(player.currBrotherHeroPoss), player.curPetPos, player.keyCount, player.wipeTicket, player.reviveCnt,
            player.reviveCntResetTick, player.highPower, player.dailyFreeRefine, player.dailyRefineResetTick,
            player.dailyDiamondRefine, player.comPoint, player.meltPoint, player.washPoint, player.endlessBuffBuyCntResetTick,
            player.endlessOccasionCntResetTick, player.highScore, player.weekHighScore, player.weekHighScoreResetTick,JSON.stringify(player.canBuyHeroList),
            player.dailyMissionReset,player.dailyActivityEnergyReset, player.dailyEndlessBoxToHeroCnt, player.rechargeTotal, player.fristRechargeAwardTime, player.setNameCnt,
            player.inviteId, player.inviteCode, player.inviteCount,player.buyGetDiamond,player.endlessSingleOldWave,player.endlessAddEffect,player.bronzeCoin,player.silverCoin,player.goldCoin,player.randRefreshCoin,player.challengeTicket,
            player.dailyEndlessBoxToHeroCntRstTick, player.snatchSingleCnt, player.weekCardEndTick, player.monthCardEndTick, player.foreverCardEndTick, player.weekCardWelfareTick, player.monthCardWelfareTick, player.foreverCardWelfareTick,
            JSON.stringify(player.barrierPromoteDropIds), player.barrierPromoteEndTick,
            player.id
        ];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('updatePlayer failed!err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!res || res.affectedRows === 0) {
                logger.error('updatePlayer no player found!args = %j', args);
                utils.invokeCallback(cb, null, false);
            } else {
                utils.invokeCallback(cb, null, true);
            }
        }
    });
};

playerSync.logoff = function (client, rec, cb) {
    var sql = 'CALL onUserLogoff(?)',
        args = [rec.id];
    client.query(sql, args, function (err) {
        if (!!err) {
            logger.error('logoff err = %s', err.stack);
            utils.invokeCallback(cb, err.message, false);
        } else {
            utils.invokeCallback(cb, null, true);
        }
    });
};