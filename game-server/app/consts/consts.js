module.exports = {
    AREA_CRON: {
        BARRIER_ATK_CNT_CRON_ID: 1,
        DISPATCH_ENERGY_CRON_ID: 2,
        RESET_BUY_ENERGY_CNT_CRON_ID: 3,
        RESET_REVIVE_CNT: 4,
        RESET_REFINE: 6,
        RESET_ENDLESS: 7,
        RESET_WEEK_HIGH_SCORE: 8,
        RESET_ENDLESSBOX_HERO: 9
    },
    WEEK_TYPE: {
        SMALL: 1,//小周
        BIG: 2//大周
    },
    ITEM: {
        ITEM_NOT_EXIST: 0,
        ITEM_IS_FULL: 0,
        BAG_SPACE_NOT_ENOUGH: 0
    },
    INIT_PLAYER_PROPERTIES: {
        ENERGY: 200
    },
    HERO: {
        HERO_NOT_EXIST: 0
    },
    PET: {
        PET_NOT_EXIST: 0
    },
    BAG_MAX_SLOT: 60,
    DISPATCH_ENERGY_STEP: 1,
    MAX_ENERGY: 9999,
    /**
     * Team
     */
    TEAM: {
        TEAM_ID_NONE: 0, // player without team(not in any team)
        PLAYER_ID_NONE: 0, // none player id in a team(placeholder)
        AREA_ID_NONE: 0, // none area id (placeholder)
        USER_ID_NONE: 0, // none user id (placeholder)
        SERVER_ID_NONE: 0, // none server id (placeholder)
        PLAYER_INFO_NONE: '', // none player info	(placeholder)
        JOIN_TEAM_RET_CODE: {
            OK: 1,	// join ok
            NO_POSITION: -1,	// there is no position
            ALREADY_IN_TEAM: -2,	// already in the team
            IN_OTHER_TEAM: -3,	// already in other team
            SYS_ERROR: -4	// system error
        }
    },
    DROP_TYPE: {
        HERO: 1,
        PET: 2,
        EQUIP: 3,
        MONEY: 4,
        MATERIAL: 5,
        EndlessBuff: 6//无尽bug
    },
    MONEY_TYPE: {
        //1 钻石
        DIAMOND: 1,
        //2 金钱
        GOLD: 2,
        //3 全局经验
        EXP: 3,
        //4 体力
        ENERGY: 4,
        //5 战斗勋章
        KEY: 5,
        //6 熔炼值
        MELT_POINT: 6,
        //7 竞技点
        COM_POINT: 7,
        //8 洗练石
        WASH_STONE: 8,
        //9 扫荡券
        WIPE_TICKET:9,
        //10 青铜币
        BRONZE_COIN:10,
        //11 白银币
        SILVER_COIN:11,
        //12 黄金币
        GOLD_COIN:12,
        //13 随机商品刷新券
        RAND_REFRESH_COIN:13,
        // 14
        CHALLENGE_TICKET:14
    },
    HERO_SKILL_TYPES: {
        SUPER: 1,
        JUMP: 2,
        PASSIVE1: 3,
        PASSIVE2: 4,
        PASSIVE3: 5
    },
    HERO_SKILL_UNLOCK_QUALITY: [2, 4, 7, 11, 12],
    HERO_SKILL_LV_LIMIT_QUALITY: [1, 3, 6, 10, 11],
    ITEM_TYPE: {
        HERO_UPGRADE_ITEM1: 1,
        HERO_UPGRADE_ITEM2: 2,
        HERO_UPGRADE_ITEM3: 3,
        PET_UPGRADE_ITEM1: 4,
        PET_UPGRADE_ITEM2: 5,
        PET_UPGRADE_ITEM3: 6,
        HERO_EXP_ITEM: 7,
        PET_EXP_ITEM: 8,
        KEY: 9,
        WAKE_UP_ITEM: 10,
        BOX: 11,
        FRAG_ITME:12
    },
    CONFIG: {
        INIT_DIAMOND: "init_Diamond",
        INIT_GOLD: "init_Gold",
    },
    //战斗模式
    FIGHT_TYPE: {
        //关卡
        BARRIER: 1,
        //无尽
        ENDLESS: 2
    },
    //章节类型
    CHAPTER_TYPE: {
        NORMAL: 1,//普通
        DIFFL: 2//精英
    },
    BARRIER_TYPE: {
        NORMAL: 1,
        BOSS: 2
    },
    // 获得开启时间类型
    ACTIVITY_OPEN_TYPE: {
        // 每周指定时间
        PERIOD_DAY: 1,
        // 每月指定时间
        PERIOD_DATE: 2,
        // 开服指定时间
        SERVER_DAY: 3,
        // 指定日期
        DATE: 4,
        // 单周
        SMALL_WEEK: 5,
        // 双周
        BIG_WEEK: 6,
        //永久
        PERMANENT: 7

    },
    // 活动类型
    ACTIVITY_TYPE: {
        // 优惠商店
        DISCOUNT_SHOP: 1,
        // 条件奖励
        CONDITION_AWARD: 2,
        // 公告
        NOTICE: 3,
        //领取体力(吃鸡)
        GET_ENERGY: 4,
        // 礼包兑换
        ACTIVATION_CODE_EXCHANGE: 5,
        //邀请码
        PLZ_CODE:6,
        // 体力打折
        ENERGY_DISCOUNT: 7,
        //关卡掉落翻倍 (1为普通和精英关卡翻倍，2为无尽掉落翻倍)
        BARRIER_DROP_DOUBLE: 8,
        //关卡掉落翻倍 (1为普通和精英关卡翻倍，2为无尽掉落翻倍)
        ENDLESS_DROP_DOUBLE: 9,
        //首次
        FRIST_RECHARGE:10,
        //联盟特权
        UNION_PRIVILEGE:11

    },
    // 商品类型
    GOODS_TYPE: {
        // 猎魔人
        HERO: 1,
        // 宠物
        PET: 2,
        // 装备
        EQUIP: 3,
        // 货币
        MONEY: 4,
        // 物品
        ITEM: 5
    },
    // 条件活动类型
    ACTIVITY_CONDITION_TYPE: {
        // 活动时间内，单笔充值
        SINGLE_CHARGE: 1,
        // 活动时间内，累积充值
        TOTAL_CHARGE: 2,
        // 活动时间内，累积消费
        TOTAL_CONSUME: 3,
        // 历史最高战力
        HIGH_POWER: 4,
        //值为5，累计普通关卡次数统计
        TOTAL_ORDINARY_BARRIER_CNT: 5,
        //值为6，累计精英关卡次数统计
        TOTAL_DIFF_BARRIER_CNT: 6,
        //值为7，累计无尽模式的分数统计
        TOTAL_ENDLESS_SCORE: 7,
        //累计登录天数达到要求
        TOTAL_LOGIN: 8
    },
    // 条件奖励活动关闭类型
    CONDITION_AWARD_CLOSE_TYPE: {
        // 仅根据时间及运营标志关闭
        NO_AUTO_CLOSE: 0,
        // 领取完所有奖励时，自动关闭
        AUTO_CLOSE: 1
    },
    // 玩家行为类型
    PLAYER_ACTION_LOG_TYPE: {
        //运营活动领奖
        DRAW_ACTIVITY_AWARDS: 1,
        //运营活动购买
        DISCOUNT_SHOP_PURCHASE: 2
    },
    // 装备部位
    ARM_POS: {
        //0武器、1副武器、2饰品1 、3饰品2、4头盔、5护甲、6护腿、7鞋子
        WEAPON: 0,
        SEC_WEAPON: 1,
        ACCESSORY1: 2,
        ACCESSORY2: 3,
        HELMET: 4,
        ARMOR: 5,
        LEGGING: 6,
        SHOES: 7,
        MAX: 8
    },
    BAG_RESERVE: {
        EQUIP: 50,// 预留装备背包格子
        HERO: 5,// 预留猎魔人背包格子
        ITEM: 50,// 预留物品背包格子
        EQUIP_AWAKE_MATERIAL: 50//预留装备觉醒材料背包格子
    },
    //1为宠物 2为装备 3为装备精炼 4为装备洗练 5为装备觉醒 6为装备熔炼 7无尽模式 8随机boss 9抽奖十连抽
    FUNCTION: {
        PET: 1,
        EQUIP: 2,
        EQUIP_REFINE: 3,
        EQUIP_REFRESH: 4,
        EQUIP_AWAKEN: 5,
        EQUIP_MELTING: 6,
        ENDLESS_MODE: 7,
        RAND_BOSS:8,
        SNATCH_TREASURES:9
    },
    // 排行榜类型，1周榜，2总榜
    RANKING_TYPE: {
        WEEK: 1,
        TOTAL: 2
    },
    // 无尽模式
    ENDLESS_MODE: {
        SINGLE: 1,
        PAIR: 2
    },
    // 无尽加成效果类型
    ENDLESS_BUFF_EFFECT_TYPE: {
        // 加战斗属性
        BATTLE_PROP: 1,
        // 加战力
        POWER: 2,
        // 得分加成
        SCORE: 3,
        // 得分宝箱奖励加倍
        AWARD: 4
    },
    //装备成就类型
    EQUIP_ACHIEVED_TYPE: {
        //开启洗练总数量
        OPEN_WASH_CNT: 1,
        //开启洗练属性总数量
        OPEN_WASH_PROP_CNT: 2
    },
    // 技能效果类型
    SKILL_EFFECT: {
        // 得分加成
        SCORE_ADD: 10
    },
    //任务成就进度值类型
    MISSION_PROGRESS_VALUE_TYPE: {
        //累加值
        ADD_VALUE: 1,
        //总值
        TOTAL_VALUE: 2,
        //取较大值
        MATH_MAX: 3,
        //取较小值
        MATH_MIX: 4,
        //消耗id
        USE_ID: 5
    },
    //任务或成就
    MISSION_TYPE: {
        //1 为任务
        TASK: 1,
        //2 为成就
        ACHIEVE: 2,
        //3 为角色解锁条件
        OPEN_HERO: 3
    },
    //成就任务条件类型
    MISSION_CONDITION_TYPE: {
        //1 猎魔人升级次数
        HERO_UP_CNT: 1,
        //2 猎魔人升级技能次数
        HERO_UP_SKILL_CNT: 2,
        //3 无尽次数
        ENDLESS_CNT: 3,
        //4 普通关卡次数
        GENERAL_BARRIER_CNT: 4,
        //5 精英关卡次数
        ELITE_BARRIER_CNT: 5,
        //6 熔炼装备次数
        MELTING_EQUIP_CNT: 6,
        //7 精炼装备次数,
        REFINE_EQUIP_CNT: 7,
        //8 洗练次数
        WASH_EQUIP_CNT: 8,
        // 9 PK次数
        PK_CNT: 9,
        // 10 关卡星数
        BARRIER_START_CNT: 10,
        // 11 通关普通关卡
        PASS_GENERAL_BARRIER_CNT: 11,
        // 12 角色最高等级大于等于
        HERO_MAX_LV: 12,
        // 13 达到某品质的角色有若干个
        TO_XX_QUA_HERO_XX_CNT: 13,
        // 14 无尽最高分数
        ENDLESS_BAST_SCORE: 14,
        //15 所有装备精炼等级大于等于
        ALL_EQUIP_REFINE_XX_LV: 15,
        //16 全身所有装备等级大于等于
        OUT_ALL_EQUIP_TO_XX_LV: 16,
        //17 所有装备的觉醒星级大于等于
        OUT_ALL_EQUIP_AWAKE_START_TO_XX_LV: 17,
        //18 通关精英关卡
        PASS_ELTE_CNT: 18,
        //19 获得若干个不同角色
        GET_XX_DIFF_HERO: 19,
        // 20 任意X个数量达到X级（解锁角色用）
        ANY_XX_HERO_TO_XX_LV: 20,
        // 21 消耗X个道具（解锁角色用，当是这个条件时，解锁需要消耗约定道具，在解锁时扣除）
        USE_XX_PROP: 21,
        // 22 抽奖获得（解锁角色用）
        AWAKE_HERO: 22,
        //23 完成值达到一定值
        FINISH_VALUE: 23,
        //24 购买一定次数的体力
        BUY_XX_ENERGY:24,
        //30 拥有若干个“护甲”等级达到或超过多少级。
        HAVE_XX_ARMOR_TO_XX_LV:30,
        //31 拥有若干个“副武器”等级达到或超过多少级。
        HAVE_XX_ARMS_TO_XX_LV:31,
        //32 拥有若干个“飞行器”等级达到或超过多少级。
        HAVE_XX_AEROCRAFT_TO_XX_LV:32,
        //35 拥有若干个“护甲”品质达到一定品质。
        HAVE_XX_ARMOR_TO_XX_QUA:35,
        //36 拥有若干个“副武器”品质达到一定品质。
        HAVE_XX_ARMS_TO_XX_QUA:36,
        //37 拥有若干个“飞行器”品质达到一定品质。
        HAVE_XX_AEROCRAFT_TO_XX_QUA:37,
        //40 拥有若干个不同类型的“护甲”。
        HAVE_XX_DIFF_ARMOR:40,
        //41 拥有若干个不同类型的“副武器”。
        HAVE_XX_DIFF_ARMS:41,
        //42 拥有若干个不同类型的“飞行器”。
        HAVE_XX_DIFF_AEROCRAFT:42,
    },

    //采集数据类型
    STATISTICS: {
        //每日
        DAILY: 1,
        //永久
        PERMANENT: 2
    },

    //每日采集的数据类型
    DAILY_STATISTICE: {
        //装备采集
        EQUIP: 1,
        //无尽次数
        ENDLESS: 2,
        //使用钻石
        USE_DIAMOND: 3,
        //其他杂项
        OTHER:4
    },

    //永久采集的数据类型
    PERMANENT_STATISTICE:{
        //装备穿满所有格子时的时间
        ARM_EQUIP_FULL_TIME:1,
        //最新通过关卡
        NEW_BARRIER:2,
        //玩家操作
        PLAYER_BEHAVIOR:3
    },

    //======================================
    //装备采集
    EQUIP_STTE: {
        //每日装备等级
        DAILY_EQUIP_LV: 1,
        //每日觉醒等级
        DAILY_AWAKE_LV: 2,
        //每日精炼次数
        DAILY_REFINE_CNT: 3,
    },

    //无尽采集
    ENDLESS_STTE: {
        // 1：单人模式
        SINGLE: 1,
        // 2：金币赛场
        GOLD: 2,
        // 3：高级金币赛场
        SENIOR_GOLD: 3,
        // 4：钻石赛场
        DAIMOND: 4,
        // 5：高级钻石赛场
        SENIOR_DIAMOND: 5
    },
    //钻石消耗统计
    USE_DIAMOND_STTE:
    {
        // 1：买角色
        HERO_BUY:1,
        // 2：重置关卡可挑战次数
        RESET_BARROER_CNT:2,
        // 3：战斗复活
        FIGHT_RESURRECTION:3,
        // 4：战斗买时间
        FIGHT_BUY_TIME:4,
        // 5：在商店买什么东西
        SHOP_BUY:5,
        // 6：买体力
        ENERGY_BUY:6,
        // 7：活动买东西
        ACITIVTY_BUY:7,
        // 8：购买装备精炼次数
        REFINE_CNT_BUY:8,
        //刷新商店
        REFRESH_RAND_SHOP:9,
        //购买关卡商店
        BARRIERPROMOTE_BUY:10
    },
    //其他杂项
    OTHER_STTE:{
        //日常任务活跃值
        TASK_ACTIVE_VALUE:1,
        //每日获得竞技点
        GET_COMPOINT:2,
        //每日消耗竞技点
        USE_COMPOINT:3
    },
    //======================================

    //记录值的类型
    RECORD_TYPE:
    {
        //累加
        ADD:1,
    },

    //角色类型
    HERO_TYPE:{
        //1、表示猎魔人
        HERO:1,
        //2、表示护甲
        ARMOR:2,
        //13、表示副武器
        ARMS:3,
        //4、表示飞行器
        AEROCRAFT:4
    },
    //角色属性变化类型
    HERO_MISS:{
        //角色最高等级大于等于
        MAX_LEVEL:1,
        //达到某品质的角色有若干个
        QUA:2,
        //获得若干个不同角色
        DIFF_NUM:3,
        //任意X个数量达到X级（解锁角色用）
        TO_X_LEVL:4,
    },
    PLAYER_NAME_LEN_RANGE:{
        MIN:4,
        MAX:14
    },
    //邀请码条件类型
    INVIT_COND_TYPE:{
        INVIT:0,              //接受他人邀请
        BARRIER:2,           //邀请好友通关战役
        CHARGE_DIAMOND:3    //邀请好友各充值
    },
    //邀请码奖励类型
    INVIT_REWARD_TYPE:{
        GET_AWARD:1,//接受邀请奖励
        INVIT_AWARD:2,//邀请奖励
        BIT_AWARD:3//大奖
    },
    // 邮件定义
    MAIL_STATUS: {
        NEW: 0,             // 新邮件
        NORMAL: 1,          // 已读
        READED: 2           // 已领取
    },
    SHOP_TYPE:{
        GENERAL:1,//普通商店
        RAND:2      //随机商店
    },
    //1为月卡 2为永久卡 3为周卡
    ORDER_PRODUCT_TYPE:{
        DIAMOND:0,
        MONTH_CARD:1,
        FOREVER_CARD:2,
        WEEK_CARD:3
    }
};
