

-- ----------------------------
-- Table structure for `player`
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `MAC` char(100) NOT NULL,
  `playerName` char(100) NOT NULL,
  `createTime` bigint(20) DEFAULT NULL,
  `diamondCnt` int(10) unsigned DEFAULT '0',
  `goldCnt` int(10) unsigned DEFAULT '0',
  `logonTime` bigint(20) DEFAULT NULL,
  `dailyLogonCount` int(10) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_PLAYER_USER_ID` (`MAC`),
  UNIQUE KEY `INDEX_PLAYER_PLAYERNAME` (`playerName`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `room`
-- ----------------------------
DROP TABLE IF EXISTS `room`;
CREATE TABLE `room` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '房间自增id',
  `createPlayerId` bigint(20) NOT NULL COMMENT '创建房间的玩家id',
  `createTime` bigint(20) NOT NULL COMMENT '创建时间',
  `currOutCardPlayerId` bigint(20) DEFAULT '0' COMMENT '当前出牌玩家id',
  `finshGameCnt` bigint(20) DEFAULT '0' COMMENT '已完成游戏局数',
  `seatDataList` varchar(512) NOT NULL DEFAULT '[]' COMMENT '作为列表',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;





-- ----------------------------
-- Procedure structure for `onUserLogon`
-- ----------------------------
DROP PROCEDURE IF EXISTS `onUserLogon`;
DELIMITER ;;
CREATE PROCEDURE `onUserLogon`(IN playerId BIGINT, IN now BIGINT)
BEGIN
    DECLARE lastLogonTime, curDate BIGINT;
    DECLARE curDailyLogonCount INT(10);
    SET curDate = UNIX_TIMESTAMP(CURDATE()) * 1000;
    SELECT logonTime, dailyLogonCount INTO lastLogonTime, curDailyLogonCount FROM player WHERE id = playerId;
    IF lastLogonTime IS NOT NULL THEN
        IF lastLogonTime < curDate THEN
            SET curDailyLogonCount = 0;
        END IF;
    END IF;
	UPDATE player SET logonTime = now, dailyLogonCount = curDailyLogonCount + 1 WHERE id = playerId;
END
;;
DELIMITER ;