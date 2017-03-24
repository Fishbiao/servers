/**
 * Created by employee11 on 2015/12/11.
 */
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

var passedBarrierSync = module.exports = {};

/*
 *   保存已通关关卡
 * */
passedBarrierSync.updatePassedInfo = function (client, barrierInfo, cb) {
    var sql = 'INSERT INTO passedBarrier(playerId,barrierId,type,star,dailyTimes,resetTimes,costTick,reviveCnt,power,' +
            'superSkillCnt,jumpCnt,jumpSkillCnt,loseCnt,losePower,promoteCnt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY ' +
            'UPDATE star = VALUES(star),dailyTimes = VALUES(dailyTimes), resetTimes = VALUES(resetTimes), ' +
            'costTick = VALUES(costTick), reviveCnt = VALUES(reviveCnt), power = VALUES(power), ' +
            'superSkillCnt = VALUES(superSkillCnt), jumpCnt = VALUES(jumpCnt), jumpSkillCnt = VALUES(jumpSkillCnt), ' +
            'loseCnt = VALUES(loseCnt), losePower = VALUES(losePower), promoteCnt = VALUES(promoteCnt)',
        args = [barrierInfo.playerId, barrierInfo.barrierId,barrierInfo.type, barrierInfo.star, barrierInfo.dailyTimes,
            barrierInfo.resetTimes, barrierInfo.costTick, barrierInfo.reviveCnt, barrierInfo.power,
            barrierInfo.superSkillCnt, barrierInfo.jumpCnt, barrierInfo.jumpSkillCnt, barrierInfo.loseCnt,
            barrierInfo.losePower, barrierInfo.promoteCnt];
    client.query(sql, args, function (err, res) {
        if (err) {
            logger.error('upSert err = %s, args = %j', err.stack, args);
            utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else {
                logger.debug('upSert failed!barrierInfo = %j', barrierInfo);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};