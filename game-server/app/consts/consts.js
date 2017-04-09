module.exports = {
    ENTITY_TYPE:{
        PLAYER:1,//玩家
        ROOM:2,//房间，
        SEAT:3,//座位
    },
    SEAT_NUM:{
        FIRST:1,//一号位
        SECOND:2,//二号位
        THIRD:3,//三号位
        FORUTH:4//四号位
    },


    CONFIG: {
        INIT_DIAMOND: "init_Diamond",
        INIT_GOLD: "init_Gold"
    },

    //同花十三水（清龙）>十三水（一条龙）>十二皇族>三同花顺>三套炸弹>全大>全小>凑一色>四套冲三>五对冲三>六对半>三同花>三顺子
    SHISANSHUI_SPECIAL:{
        NULL:0,//不是特殊牌型
        SANTONGHUA:1,//三同花
        SANSHUNZI:2,//三顺子
        LIUDUIBAN:3,//六对半
        WUDUICHONGSAN:4,//五对冲三
        SITAOCHONGSAN:5,//四套冲三(四套三条)
        CHOUYISE:6,//凑一色
        QUANXIAO:7,//全小
        QUANDA:8,//全大
        SANTAOZADAN:9,//三套炸弹(三分天下)
        SANTONGHUASHUN:10,//三同花顺
        SHIERHUANGZU:11,//十二皇族
        SHISANSHUI:12,//十三水（一条龙）
        TONGHUASHISANSHUI:13,//同花十三水（清龙）
    },

    //普通牌类型
    SHISANSHUI_ORDINARY:{
        SANPAI:1,//散牌
        YIDUI:2,//一对
        LIANGDUI:3,//两对
        SANDUI:4,//三条
        SHUNZI:5,//顺子
        TONGHUA:6,//同花
        HULU:7,//葫芦
        TIEZHI:8,//铁支
        TONGHUASHUN:9//同花顺
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
};
