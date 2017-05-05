/**
 * Created by fisher on 2017/3/20.服务端之间数据传输。
 optional:表示是一个可选字段，可选对于发送方，在发送消息时，可以有选择性的设置或者不设置该字段的值。对于接收方，如果能够识别可选字段就进行相应的处理，如果无法识别，则忽略该字段，消息中的其它字段正常处理。
 
 repeated:表示该字段可以包含0~N个元素。其特性和optional一样，但是每一次可以包含多个值。可以看作是在传递一个数组的值。
 */

module.exports = {
    //"message Hero": {
    //    // 位置
    //    "optional uInt32 pos": 1,
    //    // 猎魔人id，策划表heroId
    //    "optional uInt32 heroId": 2,
    //    // 等级
    //    "optional byte curLevel": 3,
    //    // 经验
    //    "optional uInt32 curExperience": 4,
    //    // 品质
    //    "optional byte quality": 5,
    //    // 技能列表
    //    "repeated Skill skills": 6
    //},
	
    // 更新角色属性
    "player.updateProp": {
        // 属性名
        "optional string prop": 1,
        // 属性值
        "optional uInt32 value": 2
    },
	
    // 更新房间属性
    "room.updateProp": {
        // 属性名
        "optional string prop": 1,
        // 属性值
        "optional uInt32 value": 2
    },
	
    // 更新座位属性
    "seat.updateProp": {
        // 属性名
        "optional string prop": 1,
        // 属性值
        "optional uInt32 value": 2
    },
	

    "message PublicSeatData": {
        // 座位编号
        "optional uInt32 id": 1,
        // 座位上的玩家id
        "optional uInt32 playerId": 2,
        // 墙牌牌数量
        "optional uInt32 WallCardCnt": 3,
        // 吃牌数据
        "repeated uInt32 eatData": 4,
        // 碰牌数据
        "repeated uInt32 pengData": 5,
        // 杠牌数据
        "repeated uInt32 gangData": 6,
        // playerName
        "repeated string playerName": 7,
        // gold
        "repeated string goldCnt": 8,
    },
    // 座位的公开信息
    "seatData.push": {
        "repeated PublicSeatData seats": 1
    },
	
	//座位准备的通知
	"seat.ready":{
		//准备好了的座位
        "optional uInt32 seatId": 1,
	},
	//获得手牌
	"seat.getHandCards":{
        "repeated uInt32 cards": 1,
	},

    //出牌数据
    "showCardData":{
        "optional uInt32 seatIndex": 1,//出牌的座位号
        "optional uInt32 ordinaryType": 2,//牌型
        "repeated uInt32 cards": 3//打出的牌编号
    },
    //打枪数据
    "shotData":{
        "optional uInt32 fire": 1,//打枪者
        "optional uInt32 beShot": 2,//中枪者
        "optional uInt32 score": 3,//中枪者减分，打枪者得分
    },
    //十三水结果
    "thirtyCards.result":{
        "repeated showCardData firstCycle":1,//第一轮出牌数据
        "repeated showCardData secondCycle":2,//第二轮出牌数据
        "repeated showCardData thirdCycle":3,//第三轮出牌数据
        "repeated showCardData specialCycle":4,//特殊牌出牌数据
        "repeated uInt32 firstScore":5,//第一轮得分，按座位号顺
        "repeated uInt32 secondScore":6,//第二轮得分，按座位号顺
        "repeated uInt32 thirdScore":7,//第三轮得分，按座位号顺
        "repeated uInt32 specialScore":8,//特殊牌出牌得分，按座位号顺
        "repeated shotData daqiangData":9,//打枪数据
        "repeated uInt32 daqiangScore":10,//打枪结果每个座位应该加减的分数
        "optional uInt32 quanleidaIndex":11,//全垒打的座位号 -1=没有全垒打
        "repeated uInt32 quanleidaScore":12,//全垒打结果每个座位应该加减的分数
    },
    //下线通知
    "seat.offline":{
        "optional uInt32 seatIndex": 1,//离线的座位号
    },
};
