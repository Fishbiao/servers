module.exports = {
	OK : 200,	//成功;
	FAIL : 500,	//未知错误;
	DB_ERROR : 501,	//数据库错误;
	DIAMOND_NUM_NOT_ENOUGH : 503,	//钻石不足;

	CONNECTOR:{
		FA_MAC_ERROR : 1001,	//MAC错误;
		FA_PWD_ERROR : 1002,	//密码错误;
		FA_PLAYER_NOT_EXIST : 1003,	//角色不存在;
		FA_PLAYER_IS_EXIST : 1004,	//角色已存在;
		PLATFORM_UNKNOWN : 1005,	//未知平台;
		PLATFORM_DISABLED : 1006,	//接口未启用;
		APP_ID_ERROR : 1007,	//id错误;
		TOKEN_ERROR : 1008,	//token对不上;
		SIGNATURE_ERROR : 1009,	//验证未通过;
	},

	GATE:{
		FA_NO_SERVER_AVAILABLE : 2001,	//无可用服务器;
	},

	AREA:{
		AREADY_ONLINE : 3000,	//已经在线;
		ROOM_NOT_FOUND : 3001,	//没有这个房间;
		ROOM_MEMBER_FULL : 3002,	//房间满员;
		NOT_MEMBER_ROOM : 3003,	//玩家不在本房间;
		NOT_FIGER_SPECIALTYPE : 3004,	//不是指定的特殊牌;
        ORDINARY_TYPE_ERROR:3005,	//普通牌型错误
        HAVE_PLAYERED:3006,	//已经出过牌了
        TYPE_SORT_ERROR:3007,		//倒水了
	}
};

