module.exports = {
    OK: 200,
    FAIL: 500,
    // 数据库错误
    DB_ERROR: 501,
    // 钻石不足
    DIAMOND_NUM_NOT_ENOUGH: 502,
    CONNECTOR: {
        // MAC错误
        FA_MAC_ERROR: 1001,
        // 密码错误
        FA_PWD_ERROR: 1002,
        // 角色不存在
        FA_PLAYER_NOT_EXIST: 1003,
        // 角色已存在
        FA_PLAYER_IS_EXIST: 1004,
        // 未知平台
        PLATFORM_UNKNOWN: 1005,
        // 接口未启用
        PLATFORM_DISABLED: 1006,
        APP_ID_ERROR: 1007,
        TOKEN_ERROR: 1008,
        SIGNATURE_ERROR: 1009
    },
    GATE: {
        // 无可用服务器
        FA_NO_SERVER_AVAILABLE: 2001
    },
    AREA: {
        //已经在线
        AREADY_ONLINE : 3000,
    },
    HERO: {
        // 添加猎魔人失败
        ADD_HERO_FAILED: 4001,
        // 猎魔人不存在
        HERO_IS_NOT_EXIST: 4002,
        // 猎魔人背包已满
        HERO_BAG_FULL: 4003,
        //解锁猎魔人条件未达成
        HERO_OPEN_LUCK_NOT_CONDITION:4004,
        //猎魔人已经解锁
        HERO_OPEN_LUCK_OK:4005,
        //猎魔人未解锁
        HERO_NOT_OPEN_LUCK:4006,
        //出战英雄类型不比配
        HERO_TYPE_NOT_SAME:4007,
        //英雄已经出战
        HERO_FIGHTING:4008,
        //拆分对象不合法(未找到策划表数据)
        HERO_NOT_CAN_SPLITTINGUP:4009,
        //未找到拆分的英雄数据
        HERO_NOT_FOUND:4010,
        //聚合id不合法
        HERO_COMPOSE_ID_NOT_FOUND:4011,
        //英雄聚合数量不对
        HERO_COMPOSE_NUM_ERROR:4012,
        //英雄聚合品阶不合法
        HERO_COMPOSE_QUA_ERROR:4013,
        //英雄未配置可解锁和出售
        HERO_NOT_CONFIG_LOCK:4014,
        //为出战英雄
        HERO_IS_FIGHT:4015,
    },
    PET: {
        // 添加宠物失败
        ADD_PET_FAILED: 5001,
        // 宠物不存在
        PET_IS_NOT_EXIST: 5002,
        // 宠物背包已满
        PET_BAG_FULL: 5003
    },
    WORLD: {
        // 玩家已在线
        ALREADY_ONLINE: 6001,
        // 无此赛事
        NO_SUCH_OCCASION: 6002,
        // 已在待匹配队列中
        ALREADY_IN_MATCH_QUEUE: 6003,
        // 无尽匹配开始
        ENDLESS_MATCH_START: 6004,
        // 不在无尽战斗中
        NO_ENDLESS_FIGHTING: 6005,
        // 无尽单人模式开始
        ENDLESS_SINGLE_START:6006,
        // 无尽加载超时
        ENDLESS_LOAD_TIMEOUT:6007
    },
    MISSION:{
        //任务id不存在
        MISSION_ID_NOT_EXIST:7001,
        //未达成条件
        CONDITION_NOT_ENOUGH:7002,
        //已领取过
        HAD_AWARD:7003,
        //未达成进度
        PROGRESS_NO_ENOUGH:7004
    },
    PLAYER_NAME:{
        NAME_EXIST:7100,//名字已经设置过
    },
    /*随机boss*/
    RANDBOSS:{
        NOT_FOUND:7200,//boss不存在
        DISAPPEAR:7201,//boss已经消失
        COOLING:7202,   //boss冷却中
        HP_ILLEGAL:7203,//boss结算血量非法
        NOT_SEND_ATKBOSS:7204,//没有验证进入boss战
        HP_ERROR:7205//扣血数据非法
    },
    /**随机商店*/
    RANDOMSHOP : {
        NOT_FOUND_SHOP:7300,//没有发现随机商店
        DISAPPEAR:7301,      //随机商店已经消失
        NOT_GOODSID:7302//没有此随机商品
    },
    /*碎片合成*/
    FRAG_COMPOSE : {
        NUM_ERROR:7400,//数量不合法
    }
};