/**
 * Created by employee11 on 2015/12/11.
 */

var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');

var exp = module.exports = {};

/*
 *   更新章节数据
 * */
exp.save = function(client, chapterInfo, cb){
    var sql = 'INSERT INTO UnlockChapter(playerId, chapterId, drawFlag) VALUES(?,?,?) ON DUPLICATE KEY UPDATE' +
            ' drawFlag = VALUES(drawFlag)',
        args = [chapterInfo.playerId, chapterInfo.chapterId, chapterInfo.drawFlag];
    client.query(sql, args, function(err, res){
        if(err){
            logger.error('save err = %s, chapterInfo = %j', err.stack, chapterInfo);
            utils.invokeCallback(cb, err.message, false);
        }else{
            if(!!res && res.affectedRows > 0)
                utils.invokeCallback(cb, null, true);
            else{
                logger.debug('save failed!chapterInfo = %j', chapterInfo);
                utils.invokeCallback(cb, null, false);
            }
        }
    });
};